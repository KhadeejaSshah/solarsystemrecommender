# SkyElectric — Solar System Designer
### Powered by AI (Gemini 2.0 Flash) · Pakistan Solar Sizing Tool

---

## Project Structure

```
skyelectric/
├── backend/
│   ├── .env                        ← API keys go here
│   ├── server.js                   ← Express server (serves frontend + API)
│   ├── package.json
│   ├── routes/
│   │   ├── solar.js                ← Calculation endpoints
│   │   └── leads.js                ← Lead capture endpoints
│   ├── services/
│   │   ├── solarCalculator.js      ← All sizing math (Pakistan defaults)
│   │   ├── geminiService.js        ← Gemini 2.0 Flash AI insights
│   │   └── leadsService.js         ← CSV lead storage
│   └── data/
│       └── leads.csv               ← Auto-created on first lead submission
└── frontend/
    └── public/
        ├── index.html              ← Main UI
        ├── style.css               ← All styles (yellow/blue brand)
        ├── app.js                  ← Frontend logic
        └── assets/
            └── logo.png            ← SkyElectric logo
```

---

## Quick Start

### 1. Add your API Key

Edit `backend/.env`:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```

Get your Gemini API key at: https://aistudio.google.com/app/apikey

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Run the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. Open the App

Visit: **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/solar/calculate/units` | Calculate from monthly kWh |
| POST | `/api/solar/calculate/amount` | Calculate from PKR bill amount |
| POST | `/api/solar/calculate/bill` | Upload bill (stub — add your scraper) |
| POST | `/api/leads/save` | Save a lead to CSV |
| GET | `/api/leads` | List all leads (basic admin) |
| GET | `/api/health` | Health check |

### Example: Calculate from units
```bash
curl -X POST http://localhost:3000/api/solar/calculate/units \
  -H "Content-Type: application/json" \
  -d '{"monthlyKwh": 450, "roofSqft": 800}'
```

---

## Adding Bill Extraction (TODO)

Open `backend/routes/solar.js` and find the `POST /calculate/bill` handler.
Replace the TODO comment with your OCR/scraper logic:

```javascript
// Your implementation here:
const monthlyKwh = await yourBillScraper(req.file.buffer, req.file.mimetype);
const roofSqft = req.body.roofSqft ? Number(req.body.roofSqft) : null;
const result = calculateSolarSystem(monthlyKwh, roofSqft);
const aiData = await generateAIInsight(result, 'Bill upload');
result.ai = aiData;
return res.json({ success: true, inputMethod: 'bill', result });
```

---

## Pakistan Defaults Used

| Parameter | Value |
|-----------|-------|
| Peak sun hours/day | 5 hours |
| System loss | 20% |
| Battery usable depth (DoD) | 80% |
| Night usage fraction | 60% |
| Tariff rate | PKR 55/unit |
| Roof per kW | 80 sq ft |

## Rounding Rules
- PV: nearest 0.5 kW
- Battery: nearest 5 kWh
- Inverter: standard sizes (5, 8, 10, 12, 15, 20 kW)

---

## Leads CSV

Leads are saved to `backend/data/leads.csv` automatically.
Columns include: Name, Email, Phone, Address, City, Can Contact, Terms Accepted, Input Method, Consumption, Recommendation, AI Used, etc.

---

## Tech Stack

- **Backend**: Node.js + Express
- **AI**: Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Frontend**: Vanilla HTML/CSS/JS (no framework needed)
- **Fonts**: Plus Jakarta Sans + Space Grotesk
- **Storage**: CSV (local file — swap for database in production)