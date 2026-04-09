import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PEAK_SUN_HOURS = 5.0;
const SYSTEM_DERATE = 0.8;
const BATTERY_EFFICIENCY = 0.85;
const POWER_FACTOR = 0.9;
const PANEL_WATTAGE = 400;
const PANEL_AREA_SQFT = 17.5;
const DAYS_PER_MONTH = 30.44;
const DAY_LOAD_FRACTION = 0.4;
const NIGHT_LOAD_FRACTION = 0.6;
const LIFEPO4_DOD = 0.9;
const PHANTOM_LOAD_FACTOR = 1.1;
const STANDARD_INVERTER_KVA = [3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50];
const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.45;
const TREE_CO2_ABSORPTION_KG_PER_YEAR = 21.7;

type ApplianceCounts = {
  ac15?: number;
  ac20?: number;
  fan?: number;
  light?: number;
  fridge?: number;
  motor?: number;
};

function pickInverterSize(requiredKva: number) {
  return STANDARD_INVERTER_KVA.find((size) => size >= requiredKva) ?? STANDARD_INVERTER_KVA[STANDARD_INVERTER_KVA.length - 1];
}

function runSizingEngine(dailyDemandKwh: number, peakLoadKw: number, roofSizeSqft?: number) {
  const dayDemand = dailyDemandKwh * DAY_LOAD_FRACTION;
  const nightDemand = dailyDemandKwh * NIGHT_LOAD_FRACTION;

  console.log("[FORMULA] day_demand = daily_demand x 0.40");
  console.log(`[VALUES ] day_demand = ${dailyDemandKwh.toFixed(3)} x ${DAY_LOAD_FRACTION} = ${dayDemand.toFixed(3)} kWh/day`);
  console.log("[FORMULA] night_demand = daily_demand x 0.60");
  console.log(`[VALUES ] night_demand = ${dailyDemandKwh.toFixed(3)} x ${NIGHT_LOAD_FRACTION} = ${nightDemand.toFixed(3)} kWh/day`);

  const effectiveDemand = dayDemand + (nightDemand / BATTERY_EFFICIENCY);
  const pvRequiredKw = effectiveDemand / (PEAK_SUN_HOURS * SYSTEM_DERATE);

  console.log("[FORMULA] effective_demand = day_demand + (night_demand / battery_efficiency)");
  console.log(`[VALUES ] effective_demand = ${dayDemand.toFixed(3)} + (${nightDemand.toFixed(3)} / ${BATTERY_EFFICIENCY}) = ${effectiveDemand.toFixed(3)} kWh/day`);
  console.log("[FORMULA] pv_required_kW = effective_demand / (peak_sun_hours x system_derate)");
  console.log(`[VALUES ] pv_required_kW = ${effectiveDemand.toFixed(3)} / (${PEAK_SUN_HOURS} x ${SYSTEM_DERATE}) = ${pvRequiredKw.toFixed(3)} kW`);

  let pvRecommendedKw = pvRequiredKw;
  if (typeof roofSizeSqft === "number" && roofSizeSqft > 0) {
    const maxPanels = Math.floor(roofSizeSqft / PANEL_AREA_SQFT);
    const maxPvFromRoof = (maxPanels * PANEL_WATTAGE) / 1000;
    pvRecommendedKw = Math.min(pvRequiredKw, maxPvFromRoof);
    console.log("[FORMULA] max_panels = floor(roof_sqft / panel_area_sqft)");
    console.log(`[VALUES ] max_panels = floor(${roofSizeSqft} / ${PANEL_AREA_SQFT}) = ${maxPanels}`);
    console.log("[FORMULA] max_pv_from_roof = (max_panels x panel_wattage) / 1000");
    console.log(`[VALUES ] max_pv_from_roof = (${maxPanels} x ${PANEL_WATTAGE}) / 1000 = ${maxPvFromRoof.toFixed(3)} kW`);
    console.log("[FORMULA] pv_recommended = min(pv_required, max_pv_from_roof)");
    console.log(`[VALUES ] pv_recommended = min(${pvRequiredKw.toFixed(3)}, ${maxPvFromRoof.toFixed(3)}) = ${pvRecommendedKw.toFixed(3)} kW`);
  }

  const inverterByLoad = peakLoadKw / POWER_FACTOR;
  const inverterByPv = pvRecommendedKw * 1.25;
  const inverterRaw = Math.max(inverterByLoad, inverterByPv);
  const inverterKva = pickInverterSize(inverterRaw);

  console.log("[FORMULA] inverter_by_load = peak_load / power_factor");
  console.log(`[VALUES ] inverter_by_load = ${peakLoadKw.toFixed(3)} / ${POWER_FACTOR} = ${inverterByLoad.toFixed(3)} kVA`);
  console.log("[FORMULA] inverter_by_pv = pv_recommended x 1.25");
  console.log(`[VALUES ] inverter_by_pv = ${pvRecommendedKw.toFixed(3)} x 1.25 = ${inverterByPv.toFixed(3)} kVA`);
  console.log("[FORMULA] inverter_raw = max(inverter_by_load, inverter_by_pv)");
  console.log(`[VALUES ] inverter_raw = max(${inverterByLoad.toFixed(3)}, ${inverterByPv.toFixed(3)}) = ${inverterRaw.toFixed(3)} kVA`);
  console.log(`[VALUES ] inverter_selected = nearest standard >= ${inverterRaw.toFixed(3)} = ${inverterKva} kVA`);

  const batteryUsable = nightDemand / BATTERY_EFFICIENCY;
  const batteryNominal = batteryUsable / LIFEPO4_DOD;

  console.log("[FORMULA] battery_usable = night_demand / battery_efficiency");
  console.log(`[VALUES ] battery_usable = ${nightDemand.toFixed(3)} / ${BATTERY_EFFICIENCY} = ${batteryUsable.toFixed(3)} kWh`);
  console.log("[FORMULA] battery_nominal = battery_usable / DoD");
  console.log(`[VALUES ] battery_nominal = ${batteryUsable.toFixed(3)} / ${LIFEPO4_DOD} = ${batteryNominal.toFixed(3)} kWh`);

  return {
    dailyUnits: Number(dailyDemandKwh.toFixed(2)),
    suggestedPv: Number(pvRecommendedKw.toFixed(2)),
    suggestedInverter: inverterKva,
    suggestedBattery: Number(batteryNominal.toFixed(2)),
  };
}

function estimateNewHomeDailyDemand(appliances: ApplianceCounts, evCar: boolean, evBike: boolean, otherKwh: number) {
  const safeCount = (n: number | undefined) => Math.max(0, Number(n) || 0);

  // Mode C appliance profiles: kW ratings x realistic usage hours/day.
  const applianceProfiles = [
    { count: safeCount(appliances.ac15), kw: 1.8, hours: 8 },
    { count: safeCount(appliances.ac20), kw: 2.5, hours: 8 },
    { count: safeCount(appliances.fan), kw: 0.08, hours: 12 },
    { count: safeCount(appliances.light), kw: 0.02, hours: 6 },
    { count: safeCount(appliances.fridge), kw: 0.3, hours: 9.6 },
    { count: safeCount(appliances.motor), kw: 1.0, hours: 2 },
    { count: evCar ? 1 : 0, kw: 7.0, hours: 4 },
    { count: evBike ? 1 : 0, kw: 1.5, hours: 4 },
  ];

  const applianceEnergy = applianceProfiles.reduce((sum, profile) => {
    return sum + (profile.count * profile.kw * profile.hours);
  }, 0);

  const additionalDailyKwh = Math.max(0, Number(otherKwh) || 0);
  const dailyDemand = (applianceEnergy + additionalDailyKwh) * PHANTOM_LOAD_FACTOR;

  console.log("[FORMULA] appliance_energy = sum(count x kW x hours)");
  console.log(`[VALUES ] appliance_energy = ${applianceEnergy.toFixed(3)} kWh/day`);
  console.log("[FORMULA] daily_demand = (appliance_energy + other_kWh) x phantom_factor");
  console.log(`[VALUES ] daily_demand = (${applianceEnergy.toFixed(3)} + ${additionalDailyKwh.toFixed(3)}) x ${PHANTOM_LOAD_FACTOR} = ${dailyDemand.toFixed(3)} kWh/day`);

  const peakLoadKw = applianceProfiles.reduce((sum, profile) => {
    return sum + (profile.count * profile.kw);
  }, 0) + (additionalDailyKwh / 4);

  console.log("[FORMULA] peak_load = sum(count x kW) + (other_kWh / 4)");
  console.log(`[VALUES ] peak_load = appliance_peak + (${additionalDailyKwh.toFixed(3)} / 4) = ${peakLoadKw.toFixed(3)} kW`);

  return { dailyDemand, peakLoadKw };
}

function calculateEnvironmentalImpact(monthlyUnits: number, suggestedPvKw: number) {
  const annualDemandKwh = monthlyUnits * 12;
  const annualSolarKwh = suggestedPvKw * PEAK_SUN_HOURS * SYSTEM_DERATE * 365;
  const annualOffsetKwh = Math.min(annualDemandKwh, annualSolarKwh);
  const co2Saved = annualOffsetKwh * GRID_EMISSION_FACTOR_KG_PER_KWH;
  const treesPlanted = co2Saved / TREE_CO2_ABSORPTION_KG_PER_YEAR;
  const carbonFootprintReduction = annualDemandKwh > 0 ? (annualOffsetKwh / annualDemandKwh) * 100 : 0;

  console.log("[FORMULA] annual_solar = pv_kW x PSH x derate x 365");
  console.log(`[VALUES ] annual_solar = ${suggestedPvKw.toFixed(3)} x ${PEAK_SUN_HOURS} x ${SYSTEM_DERATE} x 365 = ${annualSolarKwh.toFixed(3)} kWh/year`);
  console.log("[FORMULA] co2_saved = annual_offset x emission_factor");
  console.log(`[VALUES ] co2_saved = ${annualOffsetKwh.toFixed(3)} x ${GRID_EMISSION_FACTOR_KG_PER_KWH} = ${co2Saved.toFixed(3)} kg/year`);
  console.log("[FORMULA] trees_planted = co2_saved / 21.7");
  console.log(`[VALUES ] trees_planted = ${co2Saved.toFixed(3)} / ${TREE_CO2_ABSORPTION_KG_PER_YEAR} = ${treesPlanted.toFixed(3)}`);
  console.log("[FORMULA] carbon_reduction_% = (annual_offset / annual_demand) x 100");
  console.log(`[VALUES ] carbon_reduction_% = (${annualOffsetKwh.toFixed(3)} / ${annualDemandKwh.toFixed(3)}) x 100 = ${carbonFootprintReduction.toFixed(3)}%`);

  return {
    co2Saved: Number(co2Saved.toFixed(0)),
    treesPlanted: Number(treesPlanted.toFixed(0)),
    carbonFootprintReduction: Number(carbonFootprintReduction.toFixed(1)),
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/calculate-from-appliances", (req, res) => {
    const { appliances = {}, evCar = false, evBike = false, otherKwh = 0, roofSize } = req.body;

    console.log("\n========== MODE C CALCULATION (NEW HOME) ==========");
    console.log(`[INPUTS ] appliances=${JSON.stringify(appliances)} evCar=${evCar} evBike=${evBike} otherKwh=${otherKwh} roofSize=${roofSize}`);

    const { dailyDemand, peakLoadKw } = estimateNewHomeDailyDemand(appliances, evCar, evBike, otherKwh);
    const sizing = runSizingEngine(dailyDemand, peakLoadKw, Number(roofSize) || 0);
    const monthlyUnits = Number((dailyDemand * DAYS_PER_MONTH).toFixed(2));
    const environmental = calculateEnvironmentalImpact(monthlyUnits, sizing.suggestedPv);

    console.log(`[RESULTS] monthly=${monthlyUnits} daily=${sizing.dailyUnits} pv=${sizing.suggestedPv} inverter=${sizing.suggestedInverter} battery=${sizing.suggestedBattery}`);
    console.log("===================================================\n");

    res.json({
      monthlyUnits,
      ...sizing,
      ...environmental,
    });
  });

  app.post("/api/calculate-from-units", (req, res) => {
    const { units, roofSize } = req.body;
    const monthlyUnits = Math.max(0, Number(units) || 0);

    console.log("\n========== UNITS MODE CALCULATION ==========");
    console.log(`[INPUTS ] units=${units} roofSize=${roofSize}`);

    const dailyDemand = monthlyUnits / DAYS_PER_MONTH;
    const estimatedPeakLoadKw = dailyDemand / 6;
    const sizing = runSizingEngine(dailyDemand, estimatedPeakLoadKw, Number(roofSize) || 0);
    const environmental = calculateEnvironmentalImpact(monthlyUnits, sizing.suggestedPv);

    console.log(`[RESULTS] monthly=${monthlyUnits.toFixed(2)} daily=${sizing.dailyUnits} pv=${sizing.suggestedPv} inverter=${sizing.suggestedInverter} battery=${sizing.suggestedBattery}`);
    console.log("===========================================\n");

    res.json({
      monthlyUnits: Number(monthlyUnits.toFixed(2)),
      ...sizing,
      ...environmental,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
