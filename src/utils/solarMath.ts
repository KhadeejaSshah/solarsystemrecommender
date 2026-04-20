import { Appliance } from '../types';

export interface SolarSystemSpecs {
  solarKw: number;
  storageKwh: number;
  inverterKw: number;
  packageId: 'lite' | 'plus' | 'max';
}

export const calculateSystemSpecs = (
  billUnits: number,
  appliances: Appliance[],
  offsets: { solar: number; storage: number; inverter: number }
): SolarSystemSpecs => {
  // 1. Calculate base load from Bill (Daily Avg)
  // Pakistan average: 5.5 peak sun hours
  const dailyUnits = billUnits / 30;
  const baseLoadKw = dailyUnits / 5.5;

  // 2. Calculate appliance load
  const totalApplianceKw = appliances.reduce(
    (sum, app) => sum + ((app.wattage || 500) * (app.quantity || 1)) / 1000, 
    0
  );

  // 3. Hardware Sizing Logic
  // Solar: Cover bill load + 40% of instantaneous appliance load
  const solarKw = Math.max(0, baseLoadKw + (totalApplianceKw * 0.4) + offsets.solar);
  
  // Storage: Multiplier of solar size + battery buffer
  const storageKwh = Math.max(0, (solarKw * 2.2) + offsets.storage);
  
  // Inverter: Must handle the solar output or total appliance load (whichever is higher)
  const inverterKw = Math.max(solarKw, totalApplianceKw) + offsets.inverter;

  // 4. Package Determination
  let packageId: 'lite' | 'plus' | 'max' = 'lite';
  if (inverterKw >= 60) packageId = 'max';
  else if (inverterKw >= 30) packageId = 'plus';

  return { solarKw, storageKwh, inverterKw, packageId };
};