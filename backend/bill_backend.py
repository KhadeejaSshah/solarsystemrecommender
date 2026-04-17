import os
import logging
import shutil

import yaml
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# edit and use config file:

from dotenv import load_dotenv
import google.generativeai as genai
from llama_parse import LlamaParse

# -------------------------
# Setup
# -------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# use conf.yaml instead
load_dotenv()
# path of conf.yaml is: /home/khadeeja/Desktop/solarsystemrecommender/conf.yaml

with open("conf.yaml", "r") as f:
    config = yaml.safe_load(f)

GEMINI_API_KEY = config["secrets"]["GEMINI_API_KEY"]
LLAMA_PARSER_API_KEY = config["secrets"]["LLAMA_PARSER_API_KEY"]

genai.configure(api_key=GEMINI_API_KEY)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

# Allow React connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Extract Text
# -------------------------
async def extract_text(file_path):

    parser = LlamaParse(
        api_key=LLAMA_PARSER_API_KEY,
        result_type="text",
        language="en"
    )

    docs = await parser.aload_data(file_path)

    return "\n".join([doc.text for doc in docs])


# -------------------------
# Extract Bill Data
# -------------------------
# async def extract_bill_data(text):

#     model = genai.GenerativeModel("gemini-2.5-flash")

#     prompt = f"""

# Extract Pakistani electricity bill details.

# Return JSON only:

# {{
# consumer_name:
# address:
# reference_number:
# billing_month:
# units_consumed:
# amount_within_due:
# amount_after_due:
# due_date:
# }}

# Bill:
# {text}

# """

async def extract_bill_data(text):

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""

You are an expert in Pakistani electricity bills.

Extract ALL structured data from this bill.

Return ONLY valid JSON.

IMPORTANT:
- If table exists (MONTH / UNITS / BILL / PAYMENT), extract ALL rows
- If tariff / bill calculation exists, extract it too
- Do not summarize, extract raw structured data

Return format:

{{
"consumer_details": {{
    "name": "",
    "address": "",
    "reference_number": "",
    "meter_number": ""
}},

"billing": {{
    "billing_month": "",
    "due_date": "",
    "units_consumed": "",
    "amount_within_due": "",
    "amount_after_due": ""
}},

"tariff_info": {{
    "tariff_name": "",
    "connection_type": "",
    "peak_units": "",
    "off_peak_units": ""
}},

"monthly_history": [
    {{
        "month": "",
        "units": "",
        "bill": "",
        "payment": ""
    }}
],

"bill_calculation": {{
    "energy_charges": "",
    "taxes": "",
    "fuel_adjustment": "",
    "total": ""
}}

}}

BILL TEXT:
{text}

"""

    response = model.generate_content(prompt)

    return response.text

import json
import re

def safe_parse(json_text):
    try:
        cleaned = re.sub(r"```json|```", "", json_text).strip()
        return json.loads(cleaned)
    except:
        return {"raw": json_text}


# -------------------------
# Upload API
# -------------------------
@app.post("/upload-bill")
async def upload_bill(file: UploadFile = File(...)):

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    logger.info("File uploaded")

    text = await extract_text(file_path)
    details_raw = await extract_bill_data(text)
    details = safe_parse(details_raw)

    result= {
        "success": True,
        "data": details
    }

    print("\n========= BILL DETAILS =========")
    print(result)

    return result