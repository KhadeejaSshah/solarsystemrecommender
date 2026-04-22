# System Logic — Inputs, Outputs, Formulas, and AI sources

This document summarizes the end-to-end logic: which inputs feed which calculations, the formulas used, where results come from, and which pieces are produced by AI. Each referenced symbol and file is linked to the workspace.

---

## Key files & symbols (quick links)
- Frontend app: [`App`](src/App.tsx) ([src/App.tsx](src/App.tsx)) — see functions: [`App.handleFileUpload`](src/App.tsx) (upload flow), [`App.fetchSystemSpecs`](src/App.tsx) (call /calculate), [`App.requestAIInsights`](src/App.tsx) (call /ai-insights), [`App.toggleAppliance`](src/App.tsx) (appliance selection), state: `specs`, `selectedAppliances`, `loadCurveData`.
- Backend calculation and AI: [`main.terminal_solar_math`](backend/main.py) (engineering formulas) and endpoints in [backend/main.py](backend/main.py) — see `/calculate`, `/upload-bill`, `/ai-insights`.
- Bill extraction: [`main.extract_text`](backend/main.py) and [`main.extract_bill_data`](backend/main.py) — (uses LlamaParse + Gemini).
- Types: [`types.Appliance`](src/types.ts) and [`types.EVInfo`](src/types.ts) ([src/types.ts](src/types.ts)).
- Appliance mapping / slots: [`applianceConfigs.UI_NAME_TO_ID`](src/config/applianceConfigs.ts) and [`applianceConfigs.SLOT_MAP` / `FALLBACK_SLOTS`](src/config/applianceConfigs.ts) ([src/config/applianceConfigs.ts](src/config/applianceConfigs.ts)).
- Energy flow UI: [`EnergyFlow`](src/components/SolarHouse/EnergyFlow.tsx) ([src/components/SolarHouse/EnergyFlow.tsx](src/components/SolarHouse/EnergyFlow.tsx)).
- Planning UI (upload & appliance selection): [`PlanningPanel`](src/components/PlanningPanel.tsx) ([src/components/PlanningPanel.tsx](src/components/PlanningPanel.tsx)).
- AI visual flow component: [`AIAnalyzer`](src/components/AIAnalyzer.tsx) ([src/components/AIAnalyzer.tsx](src/components/AIAnalyzer.tsx)).
- Energy Hub UI (shows specs): [`EnergyHub`](src/components/EnergyHub.tsx) ([src/components/EnergyHub.tsx](src/components/EnergyHub.tsx)).

---

## Inputs (where they come from)
1. User bill file (PDF / PNG)
   - UI upload handler: [`App.handleFileUpload`](src/App.tsx) — triggers POST `/upload-bill`. (see App.tsx; upload flow around the file upload handler and call to `/upload-bill`).
   - Backend parsing: [`main.extract_text`](backend/main.py) & [`main.extract_bill_data`](backend/main.py) parse the bill to produce structured fields. ([backend/main.py](backend/main.py), ≈ lines 154–198)

2. Appliance selections (optional)
   - UI toggle: [`App.toggleAppliance`](src/App.tsx) and UI list in [`PlanningPanel`](src/components/PlanningPanel.tsx).
   - Appliance metadata: [`types.Appliance`](src/types.ts) and `WATTAGE_MAP` in [`App`](src/App.tsx) used to set wattage/quantity.

3. Manual / derived states
   - `selectedAppliances` array in [`App`](src/App.tsx).
   - `billUnits` state in [`App`](src/App.tsx) (set from parsed bill: `units_consumed`).

---

## Backend outputs (returned to frontend)
The backend calculate route returns a JSON object produced by [`main.terminal_solar_math`](backend/main.py). Returned keys:
- solarKw — recommended PV capacity (kW)
- storageKwh — battery storage (kWh)
- inverterKw — inverter sizing (kW)
- packageId — string tier (e.g., "Smart Lite", "Smart Plus", "Estate Max")
- gridImpact — percent reduction estimate
- carbonOffset — tons/year (or KG depending on display)
- monthlySavings — currency (PKR) estimate

(See return in [backend/main.py](backend/main.py) — return block near lines ~136 and print summaries around lines ~119–136.)

---

## Core formulas (implemented in backend — [`main.terminal_solar_math`](backend/main.py), ≈ lines 61–136)

Notation:
- avg_monthly = monthly billed units (kWh)
- PEAK_SUN_HOURS = 5.0 (constant)
- EFFICIENCY_FACTOR = 0.78 (losses)
- backup_hours = 4 (default)
- total_load_kw = base_load_kw + app_load_kw

1. Base load (from bill)
   - daily_avg_kwh = avg_monthly / 30
   - base_load_kw = daily_avg_kwh / (PEAK_SUN_HOURS * EFFICIENCY_FACTOR)
   - Implementation: [`main.terminal_solar_math`](backend/main.py) (see initial formula prints around lines ~61–80)

2. Appliance load
   - app_load_kw = sum((a.wattage * a.quantity) / 1000 for each appliance)
   - Implementation: [`main.terminal_solar_math`](backend/main.py) (app load print at lines ~77–80)

3. Total load
   - total_load_kw = base_load_kw + app_load_kw

4. Solar capacity (includes safety margin)
   - solar_kw = total_load_kw * 1.2  // 20% margin for losses
   - Rounding: Round up to nearest 0.5 kW (panel increments) — implemented after solar_kw calculation (see rounding logic in backend/main.py)

5. Battery sizing (package-dependent)
   - Default backup_hours = 4
   - Smart Lite:
     - storage_kwh = 10.0 (fixed)
   - Smart Plus:
     - calculated_storage = (total_load_kw * backup_hours) / 0.8
     - storage_kwh = clamp and round: max(20.0, min(40.0, ceil(calculated_storage / 2.5) * 2.5))
   - Estate Max:
     - calculated_storage = (total_load_kw * backup_hours) / 0.8
     - storage_kwh = round up to 5 kWh blocks (ceil(calculated_storage / 5.0) * 5.0)
   - (See battery sizing branch in [backend/main.py](backend/main.py) around lines ~100–120)

6. Inverter sizing
   - inverter_kw = max(solar_kw, total_load_kw) * 1.25  // 25% surge margin
   - Snap to standard sizes:
     - STANDARD_SIZES = [3,5,6,8,10,12,15,20,25,30,40,50,60,80,100]
     - inverter_kw = next standard size >= inverter_kw (fallback to value if none)
   - (Implementation: inverter sizing at lines ~119–136 in [backend/main.py](backend/main.py))

7. Impact & savings
   - solar_units_month = solar_kw * PEAK_SUN_HOURS * 30
   - units_offset = min(solar_units_month, avg_monthly)
   - monthly_save = units_offset * 55  // Rs. 55 per unit tariff (hardcoded)
   - grid_impact = min(100, (solar_units_month / max(avg_monthly, 1)) * 100)  // percent
   - carbon_offset = solar_kw * 1.4  // tons/year (constant multiplier)
   - (Printed & returned near lines ~119–136 in [backend/main.py](backend/main.py))

---

## Rounding & Tier determination rules
- Tier selection:
  - if solar_kw >= 50 => "Estate Max"
  - elif solar_kw >= 15 => "Smart Plus"
  - else => "Smart Lite"
  - (See tier assignment in [backend/main.py](backend/main.py) around lines ~96–104)
- Rounding:
  - Solar: round up to 0.5 kW increments
  - Smart Plus battery: round to 2.5 kWh steps, clamped between 20–40 kWh
  - Estate Max battery: round to 5 kWh blocks
  - Inverter: snap up to next item in STANDARD_SIZES

---

## AI-produced values (which fields and where AI runs)

1. Bill parsing (structured bill data)
   - Backend handler: [`main.extract_bill_data`](backend/main.py) — uses Google Generative AI (`genai`) model "gemini-2.5-flash" and LlamaParse to extract fields.
   - Output fields produced by the model (expected JSON):
     - consumer_name, location, units_consumed, billing_month, is_peak_available, peak_units, off_peak_units
   - Location in code: [backend/main.py](backend/main.py) (bill extraction & model call around lines ~154–170). The upload endpoint `/upload-bill` calls these functions (see `/upload-bill` in backend/main.py around line ~198).

2. AI Insights (strategy / bullet points)
   - Backend endpoint: `/ai-insights` implemented in [backend/main.py](backend/main.py) (see ai_insights handler around lines ~231–293).
   - The server composes a prompt and calls `genai.GenerativeModel("gemini-2.5-flash")` to generate an array of 6 short bullet points. If Gemini fails, a fallback static list is used.
   - Frontend: [`App.requestAIInsights`](src/App.tsx) calls `/ai-insights` and maps the returned `insights` array into `aiInsights` state (see call site around lines ~64 and the post-upload trigger around line ~121 in [src/App.tsx](src/App.tsx)).

3. Visual / UX animations
   - The frontend `AIAnalyzer` component displays staged UI steps but does not generate data. See [src/components/AIAnalyzer.tsx](src/components/AIAnalyzer.tsx).

---

## UI & data flow (step-by-step)
1. User uploads bill (or drags into UI) — handled by [`App.handleFileUpload`](src/App.tsx) (see upload handler in [src/App.tsx](src/App.tsx), around the file input and handler).
2. Frontend posts file to backend `/upload-bill` — backend saves file, runs [`main.extract_text`](backend/main.py) and [`main.extract_bill_data`](backend/main.py) to get structured bill JSON.
3. Backend returns parsed `units_consumed` and other details to frontend; frontend sets:
   - `billUnits` and `userData` in [`App`](src/App.tsx).
4. Frontend triggers system sizing: calls [`App.fetchSystemSpecs`](src/App.tsx) which POSTs to backend `/calculate` supplying `units` and `appliances`.
5. Backend calculates sizing via [`main.terminal_solar_math`](backend/main.py) using the formulas above and returns `specs` object (solarKw, storageKwh, inverterKw, packageId, gridImpact, carbonOffset, monthlySavings).
6. Frontend sets `specs` state and displays results in `EnergyHub` UI and other panels (`ComponentRow`, `ImpactBox`).
7. Frontend optionally calls AI insights: [`App.requestAIInsights`](src/App.tsx) POSTs to `/ai-insights` with bill/specs; backend returns an array of bullet points produced by Gemini — frontend stores it in `aiInsights` and shows in `PlanningPanel` / AI Strategy block.

(See the orchestration calls in [src/App.tsx](src/App.tsx): upload flow around lines ~121, fetchSystemSpecs around ~90, requestAIInsights around ~64.)

---

## Where the UI derives reactive visuals
- Load curve bars: calculated in [`App.loadCurveData`](src/App.tsx) via useMemo from a base hourly profile scaled by number of selected appliances. (See `const loadCurveData = useMemo(...)` in [src/App.tsx](src/App.tsx).)
- Energy flow arrows/lines: [`EnergyFlow`](src/components/SolarHouse/EnergyFlow.tsx) consumes `appliances` and `specs` to show animated flows. ([src/components/SolarHouse/EnergyFlow.tsx](src/components/SolarHouse/EnergyFlow.tsx))

---

## Quick reference: exact lines (locations in repo)
- Frontend:
  - [`App.handleFileUpload`](src/App.tsx) — upload & post to `/upload-bill` (see handler in [src/App.tsx](src/App.tsx), file upload UI around the `input` element).
  - [`App.fetchSystemSpecs`](src/App.tsx) — POST `/calculate` and set `specs` (see in [src/App.tsx](src/App.tsx), function around lines ~90).
  - [`App.requestAIInsights`](src/App.tsx) — POST `/ai-insights` (see in [src/App.tsx](src/App.tsx), around lines ~64 and where called after upload).
  - `loadCurveData` useMemo — in [src/App.tsx](src/App.tsx) (hourly base + multiplier by selected appliances).
  - Appliance UI & toggles — [`PlanningPanel`](src/components/PlanningPanel.tsx) (selection UI) and mapping [`config/applianceConfigs.ts`](src/config/applianceConfigs.ts).

- Backend:
  - Bill extraction: [`main.extract_text`](backend/main.py) and [`main.extract_bill_data`](backend/main.py) (≈ lines 154–174).
  - Upload endpoint `/upload-bill` — in [backend/main.py](backend/main.py) (≈ line 198).
  - Calculation core: [`main.terminal_solar_math`](backend/main.py) (definition starts ≈ line 61; returns specs around ≈ line 136).
  - `/calculate` route — calls `terminal_solar_math` (≈ lines 181–188).
  - AI insights: `/ai-insights` handler (≈ lines 231–293) — calls Gemini model and returns array of strings.

(Use the linked files above to open the exact code.)

---

## Notes & developer tips
- Tariff and constants (PEAK_SUN_HOURS, EFFICIENCY_FACTOR, Rs.55/unit, carbon multiplier 1.4) are hardcoded in backend — change in [backend/main.py](backend/main.py) if needed.
- Appliance wattages come from `WATTAGE_MAP` (in [`App`](src/App.tsx)) and `types.APPLIANCES_LIST` (in [`src/types.ts`](src/types.ts)) / `applianceConfigs` mapping.
- AI failures fallback to static insights — see fallback list in [backend/main.py](backend/main.py).

---

If you want, I can write this file into the repo as `/home/khadeeja/Desktop/solarsystemrecommender/logic.md`.  
Specify if you want additional diagrams, exact line numbers expanded, or a YAML