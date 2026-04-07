/**
 * SkyElectric Solar Sizing Service
 * Core calculation engine for Pakistan solar PV recommendations
 */

const PAKISTAN_DEFAULTS = {
  sunHoursPerDay: 5,
  systemLossPercent: 0.20,
  batteryUsablePercent: 0.80,
  nightUsagePercent: 0.60,
  pkrPerUnit: 55,
  sqftPerKw: 80,
};

const INVERTER_STANDARD_SIZES = [5, 8, 10, 12, 15, 20]; // kW

/**
 * Round PV size to nearest 0.5 kW
 */
function roundPV(kw) {
  return Math.round(kw * 2) / 2;
}

/**
 * Round battery to nearest 5 kWh
 */
function roundBattery(kwh) {
  return Math.ceil(kwh / 5) * 5;
}

/**
 * Round inverter to nearest standard size
 */
function roundInverter(kw) {
  for (const size of INVERTER_STANDARD_SIZES) {
    if (size >= kw) return size;
  }
  return 20;
}

/**
 * Get backup days based on system size
 */
function getBackupDays(pvKw) {
  if (pvKw <= 3) return 1;
  if (pvKw <= 6) return 2;
  if (pvKw <= 10) return 3;
  return 4;
}

/**
 * Get system tier label
 */
function getSystemTier(pvKw) {
  if (pvKw <= 3) return { tier: 'Starter', description: 'Ideal for small apartments or low-consumption homes' };
  if (pvKw <= 6) return { tier: 'Essential', description: 'Great for average households with moderate usage' };
  if (pvKw <= 10) return { tier: 'Comfort', description: 'Suits medium-large homes with regular appliance use' };
  if (pvKw <= 15) return { tier: 'Premium', description: 'For large homes with high energy demands' };
  return { tier: 'Enterprise', description: 'Maximum capacity — suited for large properties or small businesses' };
}

/**
 * Estimate approximate cost range in PKR
 */
function estimateCost(pvKw, batKwh, invKw) {
  const panelCostPerKw = 85000;   // PKR per kW installed
  const batteryCostPerKwh = 55000; // PKR per kWh
  const inverterCost = invKw * 12000; // PKR per kW
  const miscPercent = 0.15;

  const base = (pvKw * panelCostPerKw) + (batKwh * batteryCostPerKwh) + inverterCost;
  const total = base * (1 + miscPercent);
  const low = Math.round(total * 0.9 / 10000) * 10000;
  const high = Math.round(total * 1.1 / 10000) * 10000;
  return {
    low: low,
    high: high,
    formatted: `PKR ${(low / 1000).toFixed(0)}K – ${(high / 1000).toFixed(0)}K`
  };
}

/**
 * Estimate annual savings in PKR
 */
function estimateAnnualSavings(monthlyKwh) {
  const annualKwh = monthlyKwh * 12;
  return Math.round(annualKwh * PAKISTAN_DEFAULTS.pkrPerUnit);
}

/**
 * Calculate CO2 offset (kg/year) — Pakistan grid emission factor ~0.46 kg/kWh
 */
function estimateCO2Offset(monthlyKwh) {
  const annualKwh = monthlyKwh * 12;
  return Math.round(annualKwh * 0.46);
}

/**
 * Core sizing calculation
 * @param {number} monthlyKwh - Average monthly consumption in kWh
 * @param {number|null} roofSqft - Optional roof area in sq ft
 * @returns {object} Full recommendation object
 */
function calculateSolarSystem(monthlyKwh, roofSqft = null) {
  const { sunHoursPerDay, systemLossPercent, batteryUsablePercent, nightUsagePercent } = PAKISTAN_DEFAULTS;

  const dailyKwh = monthlyKwh / 30;

  // PV sizing: daily consumption / (sun hours × efficiency)
  let rawPV = dailyKwh / (sunHoursPerDay * (1 - systemLossPercent));

  // Apply roof constraint if provided
  if (roofSqft && roofSqft > 0) {
    const maxFromRoof = roofSqft / PAKISTAN_DEFAULTS.sqftPerKw;
    if (rawPV > maxFromRoof) {
      rawPV = maxFromRoof;
    }
  }

  const pvKw = roundPV(rawPV);

  // Backup calculation
  const backupDays = getBackupDays(pvKw);
  const nightlyUsage = dailyKwh * nightUsagePercent;
  const rawBattery = (nightlyUsage * backupDays) / batteryUsablePercent;
  const batKwh = roundBattery(rawBattery);

  // Inverter sizing: slightly above PV to handle peak loads
  const peakLoad = pvKw * 0.85;
  const invKw = roundInverter(Math.max(peakLoad, pvKw * 0.75));

  // Derived stats
  const annualKwh = monthlyKwh * 12;
  const annualSavings = estimateAnnualSavings(monthlyKwh);
  const co2Offset = estimateCO2Offset(monthlyKwh);
  const costRange = estimateCost(pvKw, batKwh, invKw);
  const paybackYears = parseFloat((costRange.low / annualSavings).toFixed(1));
  const roofRequired = pvKw * PAKISTAN_DEFAULTS.sqftPerKw;
  const tierInfo = getSystemTier(pvKw);
  const usableStorage = parseFloat((batKwh * batteryUsablePercent).toFixed(1));

  return {
    // Core recommendation
    pvKw,
    batKwh,
    invKw,
    backupDays,
    // Usage
    dailyKwh: parseFloat(dailyKwh.toFixed(2)),
    monthlyKwh: parseFloat(monthlyKwh.toFixed(1)),
    annualKwh: Math.round(annualKwh),
    // Financials
    annualSavings,
    costRange,
    paybackYears,
    // Environmental
    co2Offset,
    treesEquivalent: Math.round(co2Offset / 21),
    // Physical
    roofRequired: Math.round(roofRequired),
    roofConstrained: roofSqft ? rawPV > (roofSqft / PAKISTAN_DEFAULTS.sqftPerKw) : false,
    usableStorage,
    // Meta
    tierInfo,
    gridOffset: '~100%',
    pkrPerUnit: PAKISTAN_DEFAULTS.pkrPerUnit,
    defaults: {
      sunHours: PAKISTAN_DEFAULTS.sunHoursPerDay,
      systemLoss: `${PAKISTAN_DEFAULTS.systemLossPercent * 100}%`,
      batteryDoD: `${PAKISTAN_DEFAULTS.batteryUsablePercent * 100}%`,
      nightUsage: `${PAKISTAN_DEFAULTS.nightUsagePercent * 100}%`,
    }
  };
}

/**
 * Convert monthly PKR bill to kWh
 */
function billToKwh(pkrAmount) {
  return pkrAmount / PAKISTAN_DEFAULTS.pkrPerUnit;
}

module.exports = {
  calculateSolarSystem,
  billToKwh,
  PAKISTAN_DEFAULTS,
};