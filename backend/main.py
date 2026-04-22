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

# configure the Google generative client
genai.configure(api_key=GEMINI_API_KEY)

# uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------------------------------------
# 3. ENGINEERING MATH ENGINE (WITH TERMINAL PRINTS)
# ---------------------------------------------------------
def terminal_solar_math(units, appliances):
    """Performs engineering math and prints formulas to the terminal."""
    print("\n" + "═"*60)
    print(" ☀️  SKYELECTRIC ENGINEERING CALCULATION ENGINE")
    print("═"*60)
    
    # 1. Base Load Calculation
    # Standardizing on 5.0 Peak Sun Hours for Pakistan
    PEAK_SUN_HOURS = 5.0
    EFFICIENCY_FACTOR = 0.78 # Accounting for dust, heat, wiring losses
    
    avg_monthly = float(units) if units > 0 else 0
    daily_avg_kwh = avg_monthly / 30
    
    # Base load kW needed to generate daily_avg_kwh
    base_load_kw = daily_avg_kwh / (PEAK_SUN_HOURS * EFFICIENCY_FACTOR) if avg_monthly > 0 else 0
    
    print(f"[STEP 1] Avg Monthly Units: {avg_monthly}")
    print(f"[STEP 1] Formula: ({avg_monthly} / 30) / ({PEAK_SUN_HOURS} * {EFFICIENCY_FACTOR}) = {base_load_kw:.2f} kW Base Load")

    # 2. Appliance Load
    # Sum of (wattage * quantity) / 1000
    app_load_kw = sum([(a.wattage * a.quantity) / 1000 for a in appliances])
    print(f"[STEP 2] Appliance Load: {app_load_kw:.2f} kW (Total active appliances)")

    # 3. Hardware Sizing
    # Total Load = Base load from bill + full appliance load
    total_load_kw = base_load_kw + app_load_kw
    
    # Solar capacity with 1.2x safety margin for system losses
    solar_kw = total_load_kw * 1.2
    # Round up to nearest 0.5 kW (panel increments)
    solar_kw = math.ceil(solar_kw * 2) / 2
    
    # Package Determination (SkyElectric Grid Independence Package)
    package_id = "Smart Lite"
    if solar_kw >= 50: package_id = "Estate Max"
    elif solar_kw >= 15: package_id = "Smart Plus"
    else: package_id = "Smart Lite"
    
    # Battery Sizing per Tier
    backup_hours = 4
    if package_id == "Smart Lite":
        storage_kwh = 10.0  # Fixed 10 kWh Smart Battery as per spec
    elif package_id == "Smart Plus":
        # Scale 20–40 kWh based on load, min 20kWh
        calculated_storage = (total_load_kw * backup_hours) / 0.8
        storage_kwh = max(20.0, min(40.0, math.ceil(calculated_storage / 2.5) * 2.5))
    else:  # Estate Max
        calculated_storage = (total_load_kw * backup_hours) / 0.8
        storage_kwh = math.ceil(calculated_storage / 5.0) * 5.0 # Round to 5kWh blocks for Max

    # Inverter Sizing
    # Must handle solar or peak load + 25% surge margin
    inverter_kw = max(solar_kw, total_load_kw) * 1.25
    # Snap to standard inverter sizes
    STANDARD_SIZES = [3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100]
    inverter_kw = next((s for s in STANDARD_SIZES if s >= inverter_kw), inverter_kw)

    print(f"[STEP 3] Computed Solar: {solar_kw:.2f} kW")
    print(f"[STEP 3] Computed Battery: {storage_kwh:.2f} kWh")
    print(f"[STEP 3] Computed Inverter: {inverter_kw:.2f} kW")

    # 4. Impact Metrics
    # Solar production in units/month
    solar_units_month = solar_kw * PEAK_SUN_HOURS * 30
    # Net savings: Proportional to units offset
    units_offset = min(solar_units_month, avg_monthly)
    monthly_save = units_offset * 55 # Rs. 55/unit tariff
    
    # Grid Impact: Percentage reduction
    grid_impact = min(100, (solar_units_month / max(avg_monthly, 1)) * 100)
    
    # Carbon Offset: 1.4 tons/kW/year
    carbon_offset = solar_kw * 1.4

    print(f"[STEP 4] Grid Impact: -{grid_impact:.0f}%")
    print(f"[STEP 4] Monthly Savings: Rs. {monthly_save:,.0f}")
    print(f"[STEP 4] Carbon Offset: {carbon_offset:.1f} Tons/Year")
    print(f"[STEP 5] Final Tier Assigned: {package_id.upper()}")
    print("═"*60 + "\n")

    return {
        "solarKw": solar_kw,
        "storageKwh": storage_kwh,
        "inverterKw": inverter_kw,
        "packageId": package_id,
        "gridImpact": grid_impact,
        "carbonOffset": carbon_offset,
        "monthlySavings": monthly_save
    }

# ---------------------------------------------------------
# 4. SCRAPER LOGIC
# ---------------------------------------------------------
async def extract_text(file_path):
    parser = LlamaParse(api_key=LLAMA_PARSER_API_KEY, result_type="text", language="en")
    docs = await parser.aload_data(file_path)
    return "\n".join([doc.text for doc in docs])

async def extract_bill_data(text):
    # Use gemini-2.5-flash model
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
      "off_peak_units": number
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

# ---------------------------------------------------------
# 5. API ROUTES
# ---------------------------------------------------------

@app.post("/calculate")
async def calculate_endpoint(payload: CalcRequest):
    """Called every time an appliance is toggled or bill changes."""
    results = terminal_solar_math(payload.units, payload.appliances)
    return results

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
        
        if not details:
            return {"success": False, "error": "Could not parse bill"}

        # Print initial terminal math for the 0-appliance state
        terminal_solar_math(details.get('units_consumed', 0), [])

        return {"success": True, "data": details}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"success": False, "error": str(e)}

class AIRequest(BaseModel):
    bill: dict | None = None
    specs: dict | None = None
    user: dict | None = None
    units: int | None = 0
    selectedAppliances: list | None = []

@app.post("/ai-insights")
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