import os
import logging
import shutil
import yaml
import json
import re
import math
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from llama_parse import LlamaParse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# ---------------------------------------------------------
# 2. SCHEMAS FOR CALCULATION
# ---------------------------------------------------------
class ApplianceItem(BaseModel):
    id: str
    name: str
    wattage: float
    quantity: int

class CalcRequest(BaseModel):
    units: float
    appliances: List[ApplianceItem] # Note: This is not used in the new logic but kept for API compatibility
    tariff: Optional[float] = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("conf.yaml", "r") as f:
    config = yaml.safe_load(f)

GEMINI_API_KEY = config["secrets"]["GEMINI_API_KEY"]
LLAMA_PARSER_API_KEY = config["secrets"]["LLAMA_PARSER_API_KEY"]

ENGINEERING = config.get("engineering", {})
APPLIANCE_DEFAULTS = {k.lower(): v for k, v in config.get("appliance_defaults", {}).items()}

genai.configure(api_key=GEMINI_API_KEY)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------
# 3. NEW ENGINEERING MATH ENGINE (AS PER YOUR SPEC)
# ---------------------------------------------------------
def terminal_solar_math_new(units, tariff_override=None, peak_tariff=None, off_peak_tariff=None, peak_units=None, off_peak_units=None):
    """
    Performs engineering math based on the new 5-step logic.
    """
    # --- Constants from Config ---
    YIELD = ENGINEERING.get("peak_sun_hours", 5.0)  # Y (kWh/kW/day)
    EFFICIENCY = ENGINEERING.get("efficiency_factor", 0.8) # η
    DOD = ENGINEERING.get("battery_dod", 0.8) # Depth of Discharge
    STANDARD_INVERTER_SIZES = ENGINEERING.get("inverter_sizes", [3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100])

    # --- Tariff Logic / Effective Tariff Calculation ---
    # priority: bill-extracted peak+off tariffs (if BOTH present) > explicit tariff_override > single tariff from bill > config
    tariff_source = "config"
    config_tariff = ENGINEERING.get("tariff_per_unit", 55)
    print("peak units:", peak_units, "off-peak units:", off_peak_units)
    # If BOTH peak and off-peak tariffs are present in the bill, use them first
    if peak_tariff is not None and off_peak_tariff is not None:
        print("Both peak and off-peak tariffs found on bill. Computing effective tariff...")
        print(f"Peak Tariff: {peak_tariff}, Off-Peak Tariff: {off_peak_tariff}, Peak Units: {peak_units}, Off-Peak Units: {off_peak_units}")
        # If usage split is available, compute weighted effective tariff using the split
        if (isinstance(peak_units, (int, float)) and peak_units > 0) or (isinstance(off_peak_units, (int, float)) and off_peak_units > 0):
            print("Usage split found. Calculating weighted effective tariff based on usage proportions.")
            p_units = float(peak_units or 0)
            o_units = float(off_peak_units or 0)
            total_units_split = p_units + o_units
            if total_units_split > 0:
                proportion_peak = p_units / total_units_split
            else:
                proportion_peak = 0.0
            effective_tariff = proportion_peak * float(peak_tariff) + (1 - proportion_peak) * float(off_peak_tariff)
            tariff_source = "bill (weighted by usage)"
        else:
            print("Both tariffs found but no valid usage split. Using simple average of the two tariffs.")
            # No usage split: use average of the two tariffs
            effective_tariff = (float(peak_tariff) + float(off_peak_tariff)) / 2.0
            tariff_source = "bill (average)"
    # If both tariffs not present, then use explicit override if provided
    elif isinstance(tariff_override, (int, float)) and tariff_override > 0:
        print("Using explicit tariff override provided in the request.")
        effective_tariff = float(tariff_override)
        tariff_source = "override"
    # If only one tariff present on the bill, use that tariff for all units
    elif peak_tariff is not None:
        print("Only peak tariff found on bill. Using it as the effective tariff for all units.")
        effective_tariff = float(peak_tariff)
        tariff_source = "bill (on-peak only)"
    elif off_peak_tariff is not None:
        print("Only off-peak tariff found on bill. Using it as the effective tariff for all units.")
        effective_tariff = float(off_peak_tariff)
        tariff_source = "bill (off-peak only)"
    else:
        print("No tariff information found on bill. Fallback to config tariff.")
        # Fallback to config
        effective_tariff = float(config_tariff)
        tariff_source = "config"

    print("Tariff determination:", {"effective_tariff": effective_tariff, "source": tariff_source, "peak_tariff": peak_tariff, "off_peak_tariff": off_peak_tariff, "peak_units": peak_units, "off_peak_units": off_peak_units})

    print("\n" + "═"*60)
    print(" ☀️  SKYELECTRIC NEW ENGINEERING CALCULATION ENGINE")
    print("═"*60)

    avg_monthly_units = float(units) if units > 0 else 0
    print(f"Input Monthly Units: {avg_monthly_units:.2f} kWh")

    # 🔢 STEP 1: Daily Energy (Edaily)
    daily_energy_kwh = avg_monthly_units / 30
    print(f"[STEP 1] Daily Energy (Edaily): {avg_monthly_units:.2f} / 30 = {daily_energy_kwh:.2f} kWh")

    # ☀️ STEP 2: PV Size (PVkW)
    pv_size_kw = daily_energy_kwh / (YIELD * EFFICIENCY)
    print(f"[STEP 2] PV Size (PVkW): {daily_energy_kwh:.2f} / ({YIELD} * {EFFICIENCY}) = {pv_size_kw:.2f} kW")

    # 🔋 STEP 3: Battery Sizing (BatterykWh)
    energy_to_store = 0.6 * daily_energy_kwh
    battery_size_kwh = energy_to_store / DOD
    print(f"[STEP 3] Battery Size (BatterykWh): (0.6 * {daily_energy_kwh:.2f}) / {DOD} = {battery_size_kwh:.2f} kWh")

    # ⚡ STEP 4: Peak Load Approximation (Ppeak)
    peak_load_kw = battery_size_kwh / 2
    print(f"[STEP 4] Peak Load Approx. (Ppeak): {battery_size_kwh:.2f} / 2 = {peak_load_kw:.2f} kW")

    # 🔌 STEP 5: Inverter Sizing (InverterkW)
    raw_inverter_size = 1.25 * max(pv_size_kw, peak_load_kw)
    inverter_size_kw = next((s for s in STANDARD_INVERTER_SIZES if s >= raw_inverter_size), max(STANDARD_INVERTER_SIZES))
    print(f"[STEP 5] Inverter Size (InverterkW): 1.25 * max({pv_size_kw:.2f}, {peak_load_kw:.2f}) = {raw_inverter_size:.2f} kW -> Rounded up to {inverter_size_kw} kW")

    # --- Financial & Environmental Calculations (Using new values) ---
    # --- Financial & Environmental Calculations (FIXED TO TOU MODEL) ---

    solar_units_month = pv_size_kw * YIELD * 30

    total_units = max(avg_monthly_units, 1)

    # default split from bill
    if peak_units is not None and off_peak_units is not None:
        print("Using peak/off-peak usage split from bill for savings calculation.")
        print(f"Peak Units: {peak_units}, Off-Peak Units: {off_peak_units}, Total Units: {total_units}")
        peak_ratio = peak_units / total_units
        offpeak_ratio = off_peak_units / total_units
        print(f"Calculated usage ratios - Peak: {peak_ratio:.2f}, Off-Peak: {offpeak_ratio:.2f}")
    else:
        print("No valid usage split found on bill. Using default 60% peak / 40% off-peak split for savings calculation.")
        # fallback split
        peak_ratio = 0.6
        offpeak_ratio = 0.4

    solar_peak = solar_units_month * peak_ratio
    solar_offpeak = solar_units_month * offpeak_ratio

    # savings split correctly
    monthly_save = (
        solar_peak * float(peak_tariff if peak_tariff else effective_tariff) +
        solar_offpeak * float(off_peak_tariff if off_peak_tariff else effective_tariff)
    )

    grid_impact = min(100, (solar_units_month / total_units) * 100)
    carbon_offset = pv_size_kw * 1.4

    print("\n" + "--- FINAL RESULTS ---")
    print(f"Grid Impact: -{grid_impact:.0f}%")
    print(f"Monthly Savings: Rs. {monthly_save:,.0f}")
    print(f"Carbon Offset: {carbon_offset:.1f} Tons/Year")
    print(f"Tariff used: Rs. {effective_tariff:.2f} per unit (from {tariff_source})")
    print("═"*60 + "\n")

    return {
        "solarKw": round(pv_size_kw, 2),
        "storageKwh": round(battery_size_kwh, 2),
        "inverterKw": inverter_size_kw,
        "gridImpact": grid_impact,
        "carbonOffset": carbon_offset,
        "monthlySavings": monthly_save,
        "tariffPerUnit": effective_tariff,
        "tariffSource": tariff_source
    }


# ---------------------------------------------------------
# 4. SCRAPER LOGIC (Unchanged)
# ---------------------------------------------------------
async def extract_text(file_path):
    parser = LlamaParse(api_key=LLAMA_PARSER_API_KEY, result_type="text", language="en")
    docs = await parser.aload_data(file_path)
    return "\n".join([doc.text for doc in docs])

async def extract_bill_data(text):
    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt = f"""
    You are an expert in Pakistani electricity bills. Extract structured data. Return ONLY valid JSON.
    - Find 'units_consumed'.
    - Find all tariff rates. If you find two distinct rates, assign the HIGHER value to 'on_peak_tariff' and the LOWER value to 'off_peak_tariff'.
    - Find all tariff units . If you find two distinct units values, assign the HIGHER value to 'on_peak_units' and the LOWER value to 'off_peak_units'.

    - CRITICAL RULE: If you find only a single tariff rate (e.g., "Tariff 44.060 X Units"), you MUST populate BOTH 'on_peak_tariff' AND 'off_peak_tariff' with that same value (e.g., 44.06).
    - CRITICAL RULE: If you find only a single tariff unit (e.g., "Tariff 44.060 X 100 Units"), you MUST populate BOTH 'on_peak_units' AND 'off_peak_units' with that same value (e.g., 100).

    - If you cannot find any tariff information, all tariff fields should be null.
    Format:
    {{
      "consumer_name": "string", "location": "string", "units_consumed": number,
      "billing_month": "string", "on_peak_tariff": number | null, "off_peak_tariff": number | null, "on_peak_units": number | null, "off_peak_units": number | null
    }}
    BILL TEXT:
    {text}
    """
    response = model.generate_content(prompt)
    return response.text

def safe_parse(json_text):
    try:
        return json.loads(re.sub(r"```json|```", "", json_text).strip())
    except:
        return None

def parse_numeric(value):
    if isinstance(value, (int, float)): return float(value)
    if isinstance(value, str):
        m = re.search(r"(\d+(?:[.,]\d+)?)", value)
        if m:
            try: return float(m.group(1).replace(",", ""))
            except: return None
    return None

# ---------------------------------------------------------
# 5. API ROUTES
# ---------------------------------------------------------
tariff_value = None  # Global variable to hold the tariff value extracted from the bill
peak_tariff = None
off_peak_tariff = None
peak_units = None
off_peak_units = None

@app.post("/calculate")
async def calculate_endpoint(payload: CalcRequest):
    """
    This is the ONLY endpoint that performs calculations.
    It uses the new 5-step engineering logic.
    """
    results = terminal_solar_math_new(
        payload.units,
        tariff_override=tariff_value,
        peak_tariff=peak_tariff,
        off_peak_tariff=off_peak_tariff,
        peak_units=peak_units,
        off_peak_units=off_peak_units
    )
    return results

@app.post("/upload-bill")
async def upload_bill(file: UploadFile = File(...)):
    """
    This endpoint's ONLY job is to parse the bill and return the data.
    IT DOES NOT PERFORM A CALCULATION.
    """
    if not any(file.filename.lower().endswith(ext) for ext in ['.pdf', '.png', '.jpg', '.jpeg']):
        raise HTTPException(status_code=400, detail="Only .pdf, .png, and .jpg files are allowed")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        text = await extract_text(file_path)
        details_raw = await extract_bill_data(text)
        details = safe_parse(details_raw)
        logger.info(f"Extracted Bill Details: {details}")

        units_consumed = details.get("units_consumed") if isinstance(details, dict) else None
        if not isinstance(units_consumed, (int, float)) or units_consumed <= 0:
            raise HTTPException(status_code=400, detail="Could not read valid consumption data from the bill.")

        # --- Tariff Logic to find the correct single tariff value ---
        # store extracted tariffs and optional usage splits into globals so /calculate can use them
        global tariff_value, peak_tariff, off_peak_tariff, peak_units, off_peak_units
        tariff_value = None
        tariff_source = "config"
        peak_tariff = None
        off_peak_tariff = None
        peak_units = None
        off_peak_units = None

        if isinstance(details, dict):
            peak_tariff = parse_numeric(details.get("on_peak_tariff"))
            off_peak_tariff = parse_numeric(details.get("off_peak_tariff"))
            # Try several possible keys for peak/off usage counts that some parsers might return
            peak_units = parse_numeric(details.get("units_peak") or details.get("on_peak_units") or details.get("peak_usage") or details.get("peak"))
            off_peak_units = parse_numeric(details.get("units_offpeak") or details.get("offpeak_units") or details.get("off_peak_units") or details.get("offpeak_usage") or details.get("offpeak"))

            print(f"Parsed Tariffs - On-Peak: {peak_tariff}, Off-Peak: {off_peak_tariff}, Peak Units: {peak_units}, Off-Peak Units: {off_peak_units}")

            # Determine a fallback numeric tariff_value consistent with prior behaviour:
            if peak_tariff is not None and off_peak_tariff is not None:
                tariff_value = (peak_tariff + off_peak_tariff) / 2.0
                tariff_source = "bill (average)"
            elif peak_tariff is not None:
                tariff_value = peak_tariff
                tariff_source = "bill (on-peak)"
            elif off_peak_tariff is not None:
                tariff_value = off_peak_tariff
                tariff_source = "bill (off-peak)"

        print(f"Determined Tariff Value (fallback for legacy callers): {tariff_value} (Source: {tariff_source})")
        # Fallback if no tariff was found in the bill
        if tariff_value is None:
            tariff_value = ENGINEERING.get("tariff_per_unit", 55)

        logger.info(f"Bill validated. Units: {units_consumed}; Effective tariff Rs. {tariff_value:.2f} (from {tariff_source})")

        # IMPORTANT: Return the data so the frontend can immediately call /calculate
        return {
            "success": True,
            "data": details,
            "tariffPerUnit": tariff_value,
            "tariffSource": tariff_source
        }

    except Exception as e:
        logger.error(f"An unexpected error occurred during bill processing: {e}", exc_info=True)
        return {"success": False, "error": "An internal error occurred. Please try again."}


class AIRequest(BaseModel):
    bill: dict | None = None
    specs: dict | None = None
    user: dict | None = None
    units: int | None = 0
    selectedAppliances: list | None = []

@app.post("/ai-insights")
async def ai_insights(payload: AIRequest):
    logger.info("Received /ai-insights request")
    city = payload.user.get("city") if payload.user else "your area"
    units = payload.units or 0
    solar_kw = payload.specs.get("solarKw") if payload.specs else None
    savings = payload.specs.get("monthlySavings") if payload.specs else None

    prompt = f"""
You are an expert solar energy consultant in Pakistan. Generate 6 short, data-driven, helpful bullet points for a homeowner in {city} based on these details:
- Monthly Units: {units}
- Recommended Solar Size: {solar_kw} kW
- Estimated Savings: {savings} PKR
Return ONLY a valid JSON array of strings. Do not be salesy.
Example: ["Electricity prices in {city} have steadily increased.", "Future tariffs are expected to rise.", ...]
"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        insights = json.loads(re.sub(r"```json|```", "", response.text).strip())
    except Exception as e:
        logger.exception("Gemini failed — fallback insights")
        insights = [
            f"Electricity prices in {city} have steadily increased over the past year.",
            "Future tariffs are expected to rise 20–30% over the next few years.",
            "Your annual electricity expenses may increase significantly without solar.",
            "Solar helps lock in long-term energy costs.",
            "Installing solar now protects against future tariff hikes.",
            "Solar can increase property value and energy independence."
        ]

    print("\n" + "="*60)
    print("🧠 AI INSIGHTS")
    for i in insights: print(f"• {i}")
    print("="*60 + "\n")

    return {"success": True, "insights": insights}


@app.get("/config")
async def config_endpoint():
    try:
        return {"success": True, "engineering": ENGINEERING, "appliance_defaults": APPLIANCE_DEFAULTS}
    except Exception as e:
        logger.exception("Failed to return config")
        return {"success": False, "error": str(e)}