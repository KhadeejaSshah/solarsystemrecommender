import os
import logging
import shutil
import yaml
import json
import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
from llama_parse import LlamaParse

# Setup
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

# Allow React connection (Make sure your React runs on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def extract_text(file_path):
    parser = LlamaParse(api_key=LLAMA_PARSER_API_KEY, result_type="text", language="en")
    docs = await parser.aload_data(file_path)
    print("Extracted text:", "\n".join([doc.text for doc in docs]))  # Debugging
    return "\n".join([doc.text for doc in docs])

async def extract_bill_data(text):
    model = genai.GenerativeModel("gemini-2.5-flash") # Use 1.5 Flash for speed/cost
    prompt = f"""
    You are an expert in Pakistani electricity bills (KE, WAPDA, IESCO, etc).
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
    print("Raw response:", response.text)  # Debugging
    return response.text

def safe_parse(json_text):
    try:
        cleaned = re.sub(r"```json|```", "", json_text).strip()
        return json.loads(cleaned)
    except:
        return None

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
        print("Parsed details:", details)  # Debugging
        
        if not details:
            return {"success": False, "error": "Could not parse bill"}

        return {"success": True, "data": details}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"success": False, "error": str(e)}