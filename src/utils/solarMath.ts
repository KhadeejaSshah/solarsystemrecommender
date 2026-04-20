import { Appliance } from '../types';

export interface SolarSystemSpecs {
  solarKw: number;
  storageKwh: number;
  inverterKw: number;
  packageId: 'lite' | 'plus' | 'max';
  gridImpact: number;
  carbonOffset: number;
  monthlySavings: number;
}

export const calculateSystemSpecs = (
  billUnits: number,
  history: any[],
  appliances: Appliance[],
  offsets: { solar: number; storage: number; inverter: number }
): SolarSystemSpecs => {
  console.group("🚀 SOLAR CALCULATION ENGINE");

  // 1. ANNUAL AVERAGE LOAD
  const historyUnits = history.map(h => Number(h.units) || 0);
  const avgMonthlyUnits = history.length > 0 
    ? history.reduce((sum, h) => sum + (Number(h.units) || 0), 0) / history.length 
    : billUnits;
  
  console.log(`[Input] Bill Units: ${billUnits} | Avg History: ${avgMonthlyUnits.toFixed(2)}`);

  // 2. DAILY CONSUMPTION & BASE LOAD
  // Formula: (Monthly Units / 30 days) / 5.5 Peak Sun Hours
  const dailyUnits = avgMonthlyUnits / 30;
  const baseLoadKw = dailyUnits / 5.5; 
  console.log(`[Formula] Base Load: (${avgMonthlyUnits.toFixed(1)} / 30) / 5.5 = ${baseLoadKw.toFixed(2)} kW`);

  // 3. APPLIANCE LOAD
  const totalApplianceKw = appliances.reduce(
    (sum, app) => sum + ((app.wattage || 500) * (app.quantity || 1)) / 1000, 0
  );
  console.log(`[Input] Active Appliances Load: ${totalApplianceKw.toFixed(2)} kW`);

  // 4. HARDWARE SIZING
  // Solar = Base + (45% of Appliances) + Random Offsets
  const solarKw = Math.max(0, baseLoadKw + (totalApplianceKw * 0.45) + offsets.solar);
  // Storage = 2.1x Solar capacity
  const storageKwh = Math.max(0, (solarKw * 2.1) + offsets.storage);
  // Inverter = Peak of Solar or Appliances
  const inverterKw = Math.max(solarKw, totalApplianceKw) + offsets.inverter;

  console.log(`[Output] Solar Array: ${solarKw.toFixed(2)} kW`);
  console.log(`[Output] Battery Storage: ${storageKwh.toFixed(2)} kWh`);
  console.log(`[Output] Inverter Matrix: ${inverterKw.toFixed(2)} kW`);

  // 5. IMPACT METRICS
  // Grid Impact: (Produced / Consumed) %
  const gridImpact = Math.min(98, ((solarKw * 5.5 * 30) / avgMonthlyUnits) * 100);
  // Carbon: 1kW Solar ≈ 1.4 Tons/Year
  const carbonOffset = solarKw * 1.4;
  // Savings: Units * Rs. 55 avg tariff
  const monthlySavings = avgMonthlyUnits * 55;

  console.log(`[Impact] Grid Coverage: ${gridImpact.toFixed(0)}%`);
  console.log(`[Impact] Carbon Saved: ${carbonOffset.toFixed(1)} Tons/Year`);
  console.log(`[Impact] Est. Savings: Rs. ${monthlySavings.toLocaleString()}`);

  let packageId: 'lite' | 'plus' | 'max' = 'lite';
  if (inverterKw >= 60) packageId = 'max';
  else if (inverterKw >= 30) packageId = 'plus';
  console.log(`[Result] Selected Tier: ${packageId.toUpperCase()}`);

  console.groupEnd();

  return { 
    solarKw, 
    storageKwh, 
    inverterKw, 
    packageId, 
    gridImpact, 
    carbonOffset, 
    monthlySavings 
  };
};