import os
import logging
import shutil
import yaml
import json
import re
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from llama_parse import LlamaParse

# ---------------------------------------------------------
# 1. SETUP & CONFIG
# ---------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

with open("conf.yaml", "r") as f:
    config = yaml.safe_load(f)

GEMINI_API_KEY = config["secrets"]["GEMINI_API_KEY"]
LLAMA_PARSER_API_KEY = config["secrets"]["LLAMA_PARSER_API_KEY"]

genai.configure(api_key=GEMINI_API_KEY)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# ---------------------------------------------------------
# 3. ENGINEERING MATH ENGINE (WITH TERMINAL PRINTS)
# ---------------------------------------------------------
def terminal_solar_math(units, appliances):
    """Performs engineering math and prints formulas to the terminal."""
    print("\n" + "═"*60)
    print(" ☀️  SKYELECTRIC ENGINEERING CALCULATION ENGINE")
    print("═"*60)
    
    # 1. Base Load Calculation
    # Formula: (Avg Monthly Units / 30 Days) / 5.5 Peak Sun Hours
    avg_monthly = float(units) if units > 0 else 0
    daily_avg = avg_monthly / 30
    base_load_kw = daily_avg / 5.5
    print(f"[STEP 1] Avg Monthly Units: {avg_monthly}")
    print(f"[STEP 1] Formula: ({avg_monthly} / 30) / 5.5 = {base_load_kw:.2f} kW Base Load")

    # 2. Appliance Load
    # Sum of (wattage * quantity) / 1000
    app_load_kw = sum([(a.wattage * a.quantity) / 1000 for a in appliances])
    print(f"[STEP 2] Appliance Load: {app_load_kw:.2f} kW (Total active appliances)")

    # 3. Hardware Sizing
    # Solar must cover base load + 45% of appliance peak for stability
    solar_kw = base_load_kw + (app_load_kw * 0.45)
    # Storage is 2.1x Solar capacity for hybrid/off-grid stability
    storage_kwh = solar_kw * 2.1
    # Inverter must handle the peak of either solar production or appliance load
    inverter_kw = max(solar_kw, app_load_kw)

    print(f"[STEP 3] Computed Solar: {solar_kw:.2f} kW")
    print(f"[STEP 3] Computed Battery: {storage_kwh:.2f} kWh")
    print(f"[STEP 3] Computed Inverter: {inverter_kw:.2f} kW")

    # 4. Impact Metrics
    # Savings based on avg Pakistan Tariff of Rs. 55/unit
    monthly_save = avg_monthly * 55 
    # Grid Impact: Percentage reduction
    grid_impact = min(98, ((solar_kw * 5.5 * 30) / (avg_monthly if avg_monthly > 0 else 1)) * 100)
    # Carbon: 1kW solar saves roughly 1.4 tons of CO2 per year
    carbon_offset = solar_kw * 1.4

    print(f"[STEP 4] Grid Impact: -{grid_impact:.0f}%")
    print(f"[STEP 4] Monthly Savings: Rs. {monthly_save:,.0f}")
    print(f"[STEP 4] Carbon Offset: {carbon_offset:.1f} Tons/Year")
    
    # 5. Package Determination
    package_id = "lite"
    if inverter_kw >= 60: package_id = "max"
    elif inverter_kw >= 30: package_id = "plus"
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
    # Note: Ensure you have access to gemini-2.0-flash or 1.5-flash
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)