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
    appliances: List[ApplianceItem]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Replace previous CONF_PATH loading with explicit conf.yaml usage ---
with open("conf.yaml", "r") as f:
    config = yaml.safe_load(f)

GEMINI_API_KEY = config["secrets"]["GEMINI_API_KEY"]
LLAMA_PARSER_API_KEY = config["secrets"]["LLAMA_PARSER_API_KEY"]

# expose engineering and appliance defaults for use in calculations
ENGINEERING = config.get("engineering", {})
APPLIANCE_DEFAULTS = {k.lower(): v for k, v in config.get("appliance_defaults", {}).items()}

# configure the Google generative client
genai.configure(api_key=GEMINI_API_KEY)

# uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def apply_appliance_defaults(appliances):
    """Fill missing or zero wattage values from config defaults (match by name)."""
    for a in appliances:
        try:
            name_key = (a.name or "").strip().lower()
            if (not getattr(a, "wattage", None)) and name_key in APPLIANCE_DEFAULTS:
                a.wattage = APPLIANCE_DEFAULTS[name_key]
        except Exception:
            continue

# ---------------------------------------------------------
# 3. ENGINEERING MATH ENGINE (WITH TERMINAL PRINTS)
# ---------------------------------------------------------
def terminal_solar_math(units, appliances, tariff_override: Optional[float] = None):
    """Performs engineering math and prints formulas to the terminal.

    If tariff_override is provided, it will be used instead of the config value.
    """
    # load tuned parameters from config (with sensible fallbacks)
    PEAK_SUN_HOURS = ENGINEERING.get("peak_sun_hours", 5.0)
    EFFICIENCY_FACTOR = ENGINEERING.get("efficiency_factor", 0.78)
    BACKUP_HOURS = ENGINEERING.get("backup_hours", 4)
    PACKAGE_THRESHOLDS = ENGINEERING.get("package_thresholds", {})
    SMART_LITE_STORAGE = ENGINEERING.get("smart_lite_storage_kwh", 10.0)
    SMART_PLUS_CFG = ENGINEERING.get("smart_plus", {})
    ESTATE_CFG = ENGINEERING.get("estate", {})
    STANDARD_SIZES = ENGINEERING.get("inverter_sizes", [3,5,6,8,10,12,15,20,25,30,40,50,60,80,100])

    # decide tariff source
    if isinstance(tariff_override, (int, float)):
        TARIFF_PER_UNIT = float(tariff_override)
        tariff_source = "bill"
    else:
        TARIFF_PER_UNIT = ENGINEERING.get("tariff_per_unit", 55)
        tariff_source = "config"

    print("\n" + "═"*60)
    print(" ☀️  SKYELECTRIC ENGINEERING CALCULATION ENGINE")
    print("═"*60)

    # 1. Base Load Calculation
    avg_monthly = float(units) if units > 0 else 0
    daily_avg_kwh = avg_monthly / 30

    base_load_kw = daily_avg_kwh / (PEAK_SUN_HOURS * EFFICIENCY_FACTOR) if avg_monthly > 0 else 0

    print(f"[STEP 1] Avg Monthly Units: {avg_monthly}")
    print(f"[STEP 1] Formula: ({avg_monthly} / 30) / ({PEAK_SUN_HOURS} * {EFFICIENCY_FACTOR}) = {base_load_kw:.2f} kW Base Load")

    # 2. Appliance Load
    # ensure defaults applied if caller sent incomplete appliance items
    apply_appliance_defaults(appliances)
    app_load_kw = sum([(a.wattage * a.quantity) / 1000 for a in appliances])
    print(f"[STEP 2] Appliance Load: {app_load_kw:.2f} kW (Total active appliances)")

    # 3. Hardware Sizing
    total_load_kw = base_load_kw + app_load_kw
    solar_kw = total_load_kw * 1.2
    solar_kw = math.ceil(solar_kw * 2) / 2

    # Package Determination (config-driven thresholds)
    package_id = "Smart Lite"
    if solar_kw >= PACKAGE_THRESHOLDS.get("estate_max_kw", 50):
        package_id = "Estate Max"
    elif solar_kw >= PACKAGE_THRESHOLDS.get("smart_plus_kw", 15):
        package_id = "Smart Plus"
    else:
        package_id = "Smart Lite"

    # Battery Sizing per Tier (config-driven)
    if package_id == "Smart Lite":
        storage_kwh = SMART_LITE_STORAGE
    elif package_id == "Smart Plus":
        calculated_storage = (total_load_kw * BACKUP_HOURS) / 0.8
        min_k = SMART_PLUS_CFG.get("min_kwh", 20.0)
        max_k = SMART_PLUS_CFG.get("max_kwh", 40.0)
        incr = SMART_PLUS_CFG.get("round_increment", 2.5)
        storage_kwh = max(min_k, min(max_k, math.ceil(calculated_storage / incr) * incr))
    else:  # Estate Max
        calculated_storage = (total_load_kw * BACKUP_HOURS) / 0.8
        incr = ESTATE_CFG.get("round_increment", 5.0)
        storage_kwh = math.ceil(calculated_storage / incr) * incr

    # Inverter Sizing
    inverter_kw = max(solar_kw, total_load_kw) * 1.25
    inverter_kw = next((s for s in STANDARD_SIZES if s >= inverter_kw), inverter_kw)

    print(f"[STEP 3] Computed Solar: {solar_kw:.2f} kW")
    print(f"[STEP 3] Computed Battery: {storage_kwh:.2f} kWh")
    print(f"[STEP 3] Computed Inverter: {inverter_kw:.2f} kW")

    # 4. Impact Metrics
    solar_units_month = solar_kw * PEAK_SUN_HOURS * 30
    units_offset = min(solar_units_month, avg_monthly)
    monthly_save = units_offset * TARIFF_PER_UNIT

    grid_impact = min(100, (solar_units_month / max(avg_monthly, 1)) * 100)
    carbon_offset = solar_kw * 1.4

    print(f"[STEP 4] Grid Impact: -{grid_impact:.0f}%")
    print(f"[STEP 4] Monthly Savings: Rs. {monthly_save:,.0f}")
    print(f"[STEP 4] Carbon Offset: {carbon_offset:.1f} Tons/Year")
    # clearly indicate which tariff was used
    print(f"[STEP 4] Tariff used: Rs. {TARIFF_PER_UNIT} per unit (from {tariff_source})")
    print(f"[STEP 5] Final Tier Assigned: {package_id.upper()}")
    print("═"*60 + "\n")

    return {
        "solarKw": solar_kw,
        "storageKwh": storage_kwh,
        "inverterKw": inverter_kw,
        "packageId": package_id,
        "gridImpact": grid_impact,
        "carbonOffset": carbon_offset,
        "monthlySavings": monthly_save,
        "tariffPerUnit": TARIFF_PER_UNIT,
        "tariffSource": tariff_source
    }

# ---------------------------------------------------------
# 4. SCRAPER LOGIC
# ---------------------------------------------------------
async def extract_text(file_path):
    parser = LlamaParse(api_key=LLAMA_PARSER_API_KEY, result_type="text", language="en")
    docs = await parser.aload_data(file_path)
    return "\n".join([doc.text for doc in docs])

async def extract_bill_data(text):
    # Use gemini-1.5-flash model
    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt = f"""
    You are an expert in Pakistani electricity bills (IESCO, K-Electric, etc).
    Extract structured data. Return ONLY valid JSON.
    Format:
    {{
      "consumer_name": "string",
      "location": "string",
      "units_consumed": number,
      "billing_month": "string",
      "is_peak_available": boolean,
      "peak_units": number,
      "off_peak_units": number,
      "tariff": number
    }}
    BILL TEXT:
    {text}
    """
    response = model.generate_content(prompt)
    return response.text

def safe_parse(json_text):
    try:
        cleaned = re.sub(r"```json|```", "", json_text).strip()
        return json.loads(cleaned)
    except:
        return None

# helper to robustly parse numeric tariff values from strings or numbers
def parse_numeric(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        # find first numeric token (allows "Rs. 55", "55.0", "1,234.50")
        m = re.search(r"(\d+(?:[.,]\d+)?)", value)
        if m:
            num = m.group(1).replace(",", "")
            try:
                return float(num)
            except:
                return None
    return None

# ---------------------------------------------------------
# 5. API ROUTES
# ---------------------------------------------------------


# ---------------------------------------------------------
# 5. API ROUTES
# ---------------------------------------------------------

@app.post("/calculate")
async def calculate_endpoint(payload: CalcRequest):
    """Called every time an appliance is toggled or bill changes."""
    results = terminal_solar_math(payload.units, payload.appliances)
    return results

# --- MODIFIED ENDPOINT ---
@app.post("/upload-bill")
async def upload_bill(file: UploadFile = File(...)):
    if not (file.filename.endswith('.pdf') or file.filename.endswith('.png')):
        raise HTTPException(status_code=400, detail="Only .pdf and .png allowed")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        text = await extract_text(file_path)
        details_raw = await extract_bill_data(text)
        details = safe_parse(details_raw)

        # --- START: MODIFIED VALIDATION LOGIC ---
        units_consumed = details.get("units_consumed") if isinstance(details, dict) else None

        # Step 1: Check for a truly invalid or unreadable bill first.
        if not isinstance(units_consumed, (int, float)):
            error_message = "Invalid Bill: We could not read the consumption data. Please upload a clear, valid bill."
            logger.warning(f"Bill validation failed (unreadable units). Extracted: {details}")
            return {"success": False, "error": error_message}

        # Step 2: Handle the specific case where the user already has net metering.
        if units_consumed <= 0:
            # This is not an error, but a specific business case.
            info_message = "Your bill shows zero or negative consumption. This often means you already have a solar system. Our tool is designed for new installations, so we cannot proceed."
            logger.info(f"User with potential existing solar detected. Units: {units_consumed}")
            return {"success": False, "error": info_message}
        # --- END: MODIFIED VALIDATION LOGIC ---

        # If validation passes, proceed with the calculation.
        logger.info(f"Bill validated successfully. Units: {units_consumed}")
        terminal_solar_math(units_consumed, [])

        return {"success": True, "data": details}

    except Exception as e:
        logger.error(f"An unexpected error occurred during bill processing: {e}")
        return {"success": False, "error": "An internal error occurred. Please try again."}




# @app.post("/calculate")
# async def calculate_endpoint(payload: CalcRequest):
#     """Called every time an appliance is toggled or bill changes."""
#     results = terminal_solar_math(payload.units, payload.appliances)
#     return results

# # --- MODIFIED ENDPOINT ---
# @app.post("/upload-bill")
# async def upload_bill(file: UploadFile = File(...)):
#     if not (file.filename.endswith('.pdf') or file.filename.endswith('.png')):
#         raise HTTPException(status_code=400, detail="Only .pdf and .png allowed")

#     file_path = os.path.join(UPLOAD_DIR, file.filename)
#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     try:
#         text = await extract_text(file_path)
#         details_raw = await extract_bill_data(text)
#         details = safe_parse(details_raw)
#         print(f"Extracted Bill Details: {details}")

#         # --- START: ADDED VALIDATION BLOCK ---
#         # Check if parsing was successful and if essential data exists and is valid.
#         units_consumed = details.get("units_consumed") if isinstance(details, dict) else None

#         if not isinstance(units_consumed, (int, float)) or units_consumed <= 0:
#             error_message = "Invalid Bill: Key consumption data could not be extracted. Please upload a clear, valid bill."
#             logger.warning(f"Bill validation failed. Extracted details: {details}")
#             # Return a failure response that the frontend can handle
#             return {"success": False, "error": error_message}
#         # --- END: ADDED VALIDATION BLOCK ---

#         # Determine tariff: prefer bill, fallback to config
#         tariff_value = None
#         tariff_source = "config"
#         if isinstance(details, dict):
#             for key in ["tariff", "tariff_per_unit", "per_unit", "rate", "tariff_rate", "unit_rate", "unit_price"]:
#                 if key in details:
#                     parsed = parse_numeric(details[key])
#                     if parsed and parsed > 0:
#                         tariff_value = parsed
#                         tariff_source = "bill"
#                         break

#         if tariff_value is None:
#             tariff_value = ENGINEERING.get("tariff_per_unit", 55)
#             tariff_source = "config"

#         logger.info(f"Bill validated successfully. Units: {units_consumed}; Using tariff Rs. {tariff_value} (from {tariff_source})")
#         # pass tariff_override so terminal prints the correct source as well
#         terminal_solar_math(units_consumed, [], tariff_override=tariff_value)

#         return {"success": True, "data": details, "tariffPerUnit": tariff_value, "tariffSource": tariff_source}

#     except Exception as e:
#         logger.error(f"An unexpected error occurred during bill processing: {e}")
#         return {"success": False, "error": "An internal error occurred. Please try again."}


class AIRequest(BaseModel):
    bill: dict | None = None
    specs: dict | None = None
    user: dict | None = None
    units: int | None = 0
    selectedAppliances: list | None = []

@app.post("/ai-insights")
async def ai_insights(payload: AIRequest):
    """
    Generate structured AI insights for frontend display
    """
    logger.info("Received /ai-insights request")

    city = payload.user.get("city") if payload.user else "your area"
    units = payload.units or 0
    solar_kw = payload.specs.get("solarKw") if payload.specs else None
    savings = payload.specs.get("monthlySavings") if payload.specs else None

    prompt = f"""
You are an expert solar energy consultant in Pakistan.

Generate AI insights for a homeowner in {city}.

User Details:
- City: {city}
- Monthly Units: {units}
- Recommended Solar Size: {solar_kw} kW
- Estimated Savings: {savings} PKR

Return ONLY a JSON array of 6 short bullet points.

Tone:
- Professional
- Data-driven
- Helpful
- Not salesy

Example Style:
- Electricity prices in Islamabad have steadily increased over the past year
- Future tariffs are expected to rise 20–30% over the next few years
- Your annual electricity expenses may increase significantly without solar
- Solar helps lock in long-term energy costs
- Installing solar now protects against future tariff hikes
- Solar can increase property value and energy independence

Return format:
[
 "bullet 1",
 "bullet 2",
 "bullet 3",
 "bullet 4",
 "bullet 5",
 "bullet 6"
]
"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        cleaned = re.sub(r"```json|```", "", response.text).strip()
        insights = json.loads(cleaned)

    except Exception as e:
        logger.exception("Gemini failed — fallback insights")

        insights = [
            f"Electricity prices in {city} have steadily increased over the past year",
            "Future tariffs are expected to rise 20–30% over the next few years",
            "Your annual electricity expenses may increase significantly without solar",
            "Solar helps lock in long-term energy costs",
            "Installing solar now protects against future tariff hikes",
            "Solar can increase property value and energy independence"
        ]

    # Terminal Output
    print("\n" + "="*60)
    print("🧠 AI INSIGHTS")
    for i in insights:
        print(f"• {i}")
    print("="*60 + "\n")

    return {
        "success": True,
        "insights": insights
    }

# --- New: expose config to frontend ---
@app.get("/config")
async def config_endpoint():
    """
    Returns engineering parameters and appliance defaults so frontends
    can use a single source-of-truth instead of hardcoded values.
    """
    try:
        return {
            "success": True,
            "engineering": ENGINEERING,
            "appliance_defaults": APPLIANCE_DEFAULTS
        }
    except Exception as e:
        logger.exception("Failed to return config")
        return {"success": False, "error": str(e)}