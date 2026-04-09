import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { UserData, PAKISTAN_CONSTANTS } from '../types';
import { 
  Zap, 
  Battery, 
  TrendingDown, 
  Leaf, 
  Download, 
  Share2, 
  Cpu,
  ChevronRight,
  User,
  MapPin
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import HouseVisual from './HouseVisual';
import Markdown from 'react-markdown';

const PEAK_SUN_HOURS = 5;
const SYSTEM_DERATE = 0.8;
const BATTERY_EFFICIENCY = 0.85;
const POWER_FACTOR = 0.9;
const PANEL_WATTAGE = 550;
const PHANTOM_LOAD_FACTOR = 1.1;
const LIFEPO4_DOD = 0.9;
const BATTERY_VOLTAGE = 48;
const BATTERY_AH = 200;
const DAYS_PER_MONTH = 30.44;
const STANDARD_INVERTER_KVA = [3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50];

const USAGE_HOURS: Record<string, number> = {
  'Ceiling Fan': 12,
  'Air Conditioner (1.5 Ton)': 8,
  'Refrigerator': 9.6,
  'LED Lights (Set of 5)': 6,
  'Water Motor': 2,
  'LED TV': 5,
  'Electric Iron': 1,
  'Microwave Oven': 0.5,
};

interface RecommendationSpecs {
  demandSource: string;
  totalConcurrentLoadW: number;
  dailyDemandKWh: number;
  dayDemandKWh: number;
  nightDemandKWh: number;
  effectiveDemandKWh: number;
  pvRequiredKW: number;
  panelCount: number;
  inverterRawKVA: number;
  inverterKVA: number;
  batteryUsableKWh: number;
  batteryNominalKWh: number;
  batteryUnits: number;
  batteryBankKWh: number;
  monthlyGenerationKWh: number;
  estimatedMonthlySavings: number;
  estimatedCost: number;
  paybackYears: number;
  ecoImpactTons: number;
}

interface SizingTracePayload {
  timestamp: string;
  source: string;
  formulas: string[];
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
}

function getStandardInverterSize(rawSize: number) {
  return STANDARD_INVERTER_KVA.find((size) => size >= rawSize) ?? STANDARD_INVERTER_KVA[STANDARD_INVERTER_KVA.length - 1];
}

function calculateRecommendation(data: UserData): RecommendationSpecs {
  const isNewHome = data.entryPath === 'appliances';
  const totalConcurrentLoadW = data.appliances.reduce((acc, app) => acc + (app.wattage * app.quantity), 0) + (data.evInfo.hasCar ? 7000 : 0) + (data.evInfo.hasBike ? 1000 : 0);

  console.groupCollapsed('[ResultDashboard] sizing debug');
  console.log('[ResultDashboard] input data', data);
  console.log('[ResultDashboard] entry path', data.entryPath);
  console.log('[ResultDashboard] backup preference', data.backupPreference);
  console.log('[ResultDashboard] total concurrent load (W)', totalConcurrentLoadW);

  let dailyDemandKWh = 0;

  if (isNewHome) {
    console.log('[ResultDashboard] using MODE C / appliance-based logic');
    const applianceBreakdown = data.appliances.map((app) => {
      const hours = USAGE_HOURS[app.name] ?? 4;
      const energy = (app.wattage * app.quantity * hours) / 1000;
      console.log('[ResultDashboard] appliance estimate', {
        name: app.name,
        wattage: app.wattage,
        quantity: app.quantity,
        hours,
        dailyEnergyKWh: Number(energy.toFixed(3)),
      });
      return energy;
    });

    const baseApplianceEnergy = applianceBreakdown.reduce((acc, value) => acc + value, 0);
    dailyDemandKWh = baseApplianceEnergy * PHANTOM_LOAD_FACTOR;
    console.log('[ResultDashboard] appliance energy total (kWh/day)', Number(baseApplianceEnergy.toFixed(3)));
    console.log('[ResultDashboard] phantom-adjusted daily demand (kWh/day)', Number(dailyDemandKWh.toFixed(3)));
  } else {
    const monthlyConsumption = data.monthlyUnits > 0
      ? data.monthlyUnits
      : data.monthlyBill > 0
        ? data.monthlyBill / PAKISTAN_CONSTANTS.TARIFF_RATE
        : 0;

    console.log('[ResultDashboard] using bill/monthly-units logic', {
      monthlyUnits: data.monthlyUnits,
      monthlyBill: data.monthlyBill,
      monthlyConsumption,
    });

    dailyDemandKWh = monthlyConsumption / DAYS_PER_MONTH;
  }

  const dayDemandKWh = dailyDemandKWh * 0.4;
  const nightDemandKWh = dailyDemandKWh * 0.6;
  const effectiveDemandKWh = dayDemandKWh + (nightDemandKWh / BATTERY_EFFICIENCY);
  const pvRequiredKW = effectiveDemandKWh / (PEAK_SUN_HOURS * SYSTEM_DERATE);
  const panelCount = Math.ceil((pvRequiredKW * 1000) / PANEL_WATTAGE);

  const inverterByLoad = (totalConcurrentLoadW / 1000) / POWER_FACTOR;
  const inverterByPv = pvRequiredKW * 1.25;
  const inverterRawKVA = Math.max(inverterByLoad, inverterByPv);
  const inverterKVA = getStandardInverterSize(inverterRawKVA);

  const batteryUsableKWh = nightDemandKWh / BATTERY_EFFICIENCY;
  const batteryNominalKWh = batteryUsableKWh / LIFEPO4_DOD;
  const unitKWh = (BATTERY_VOLTAGE * BATTERY_AH) / 1000;
  const batteryUnits = Math.ceil(batteryNominalKWh / unitKWh);
  const batteryBankKWh = batteryUnits * unitKWh;

  const monthlyGenerationKWh = pvRequiredKW * PEAK_SUN_HOURS * 30 * SYSTEM_DERATE;
  const estimatedMonthlySavings = monthlyGenerationKWh * PAKISTAN_CONSTANTS.TARIFF_RATE * PAKISTAN_CONSTANTS.NET_METERING_EFFICIENCY;
  const estimatedCost = pvRequiredKW * 180000;
  const paybackYears = estimatedMonthlySavings > 0 ? estimatedCost / (estimatedMonthlySavings * 12) : 0;
  const ecoImpactTons = pvRequiredKW * 0.7;

  console.log('[ResultDashboard] day/night split', {
    dailyDemandKWh: Number(dailyDemandKWh.toFixed(3)),
    dayDemandKWh: Number(dayDemandKWh.toFixed(3)),
    nightDemandKWh: Number(nightDemandKWh.toFixed(3)),
  });
  console.log('[ResultDashboard] pv sizing', {
    effectiveDemandKWh: Number(effectiveDemandKWh.toFixed(3)),
    pvRequiredKW: Number(pvRequiredKW.toFixed(3)),
    panelCount,
  });
  console.log('[ResultDashboard] inverter sizing', {
    inverterByLoad: Number(inverterByLoad.toFixed(3)),
    inverterByPv: Number(inverterByPv.toFixed(3)),
    inverterRawKVA: Number(inverterRawKVA.toFixed(3)),
    inverterKVA,
  });
  console.log('[ResultDashboard] battery sizing', {
    batteryUsableKWh: Number(batteryUsableKWh.toFixed(3)),
    batteryNominalKWh: Number(batteryNominalKWh.toFixed(3)),
    batteryUnits,
    batteryBankKWh: Number(batteryBankKWh.toFixed(3)),
  });
  console.log('[ResultDashboard] cost and savings', {
    monthlyGenerationKWh: Number(monthlyGenerationKWh.toFixed(3)),
    estimatedMonthlySavings: Number(estimatedMonthlySavings.toFixed(3)),
    estimatedCost: Number(estimatedCost.toFixed(3)),
    paybackYears: Number(paybackYears.toFixed(2)),
    ecoImpactTons: Number(ecoImpactTons.toFixed(2)),
  });
  console.groupEnd();

  return {
    demandSource: isNewHome ? 'New Home -- Appliance Estimation' : 'Bill / Monthly Units',
    totalConcurrentLoadW,
    dailyDemandKWh,
    dayDemandKWh,
    nightDemandKWh,
    effectiveDemandKWh,
    pvRequiredKW,
    panelCount,
    inverterRawKVA,
    inverterKVA,
    batteryUsableKWh,
    batteryNominalKWh,
    batteryUnits,
    batteryBankKWh,
    monthlyGenerationKWh,
    estimatedMonthlySavings,
    estimatedCost,
    paybackYears,
    ecoImpactTons,
  };
}

interface ResultDashboardProps {
  data: UserData;
}

export default function ResultDashboard({ data }: ResultDashboardProps) {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(true);
  const lastTraceSignatureRef = useRef<string>('');
  const specs = useMemo(() => calculateRecommendation(data), [data]);

  useEffect(() => {
    const tracePayload: SizingTracePayload = {
      timestamp: new Date().toISOString(),
      source: 'ResultDashboard.calculateRecommendation',
      formulas: [
        'daily_demand_kWh = SUM(appliance_wattage * qty * usage_hours)/1000 * 1.10 (MODE C)',
        'day_demand_kWh = daily_demand_kWh * 0.40',
        'night_demand_kWh = daily_demand_kWh * 0.60',
        'effective_demand_kWh = day_demand_kWh + (night_demand_kWh / 0.85)',
        'pv_required_kW = effective_demand_kWh / (5.0 * 0.80)',
        'panel_count = ceil((pv_required_kW * 1000) / 550)',
        'inverter_raw_kVA = max((peak_load_kW / 0.90), (pv_required_kW * 1.25))',
        'inverter_kVA = next standard size in [3,5,6,8,10,12,15,20,25,30,40,50]',
        'battery_usable_kWh = night_demand_kWh / 0.85',
        'battery_nominal_kWh = battery_usable_kWh / 0.90',
        'battery_units = ceil(battery_nominal_kWh / 9.6)',
        'battery_bank_kWh = battery_units * 9.6',
        'monthly_generation_kWh = pv_required_kW * 5 * 30 * 0.80',
        'monthly_savings_pkr = monthly_generation_kWh * tariff * 0.90',
        'payback_years = estimated_cost / (monthly_savings_pkr * 12)',
      ],
      inputs: {
        entryPath: data.entryPath,
        backupPreference: data.backupPreference,
        budgetSensitivity: data.budgetSensitivity,
        monthlyUnits: data.monthlyUnits,
        monthlyBill: data.monthlyBill,
        tariffRate: PAKISTAN_CONSTANTS.TARIFF_RATE,
        peakSunHours: PEAK_SUN_HOURS,
        systemDerate: SYSTEM_DERATE,
        batteryEfficiency: BATTERY_EFFICIENCY,
        powerFactor: POWER_FACTOR,
        panelWattage: PANEL_WATTAGE,
        lifePo4Dod: LIFEPO4_DOD,
        phantomLoadFactor: PHANTOM_LOAD_FACTOR,
        appliances: data.appliances.map((app) => ({
          id: app.id,
          name: app.name,
          wattage: app.wattage,
          quantity: app.quantity,
          usageHours: USAGE_HOURS[app.name] ?? 4,
        })),
        evInfo: data.evInfo,
      },
      outputs: {
        demandSource: specs.demandSource,
        totalConcurrentLoadW: Number(specs.totalConcurrentLoadW.toFixed(3)),
        dailyDemandKWh: Number(specs.dailyDemandKWh.toFixed(3)),
        dayDemandKWh: Number(specs.dayDemandKWh.toFixed(3)),
        nightDemandKWh: Number(specs.nightDemandKWh.toFixed(3)),
        effectiveDemandKWh: Number(specs.effectiveDemandKWh.toFixed(3)),
        pvRequiredKW: Number(specs.pvRequiredKW.toFixed(3)),
        panelCount: specs.panelCount,
        inverterRawKVA: Number(specs.inverterRawKVA.toFixed(3)),
        inverterKVA: specs.inverterKVA,
        batteryUsableKWh: Number(specs.batteryUsableKWh.toFixed(3)),
        batteryNominalKWh: Number(specs.batteryNominalKWh.toFixed(3)),
        batteryUnits: specs.batteryUnits,
        batteryBankKWh: Number(specs.batteryBankKWh.toFixed(3)),
        monthlyGenerationKWh: Number(specs.monthlyGenerationKWh.toFixed(3)),
        estimatedMonthlySavings: Number(specs.estimatedMonthlySavings.toFixed(3)),
        estimatedCost: Number(specs.estimatedCost.toFixed(3)),
        paybackYears: Number(specs.paybackYears.toFixed(3)),
        ecoImpactTons: Number(specs.ecoImpactTons.toFixed(3)),
      },
    };

    const signature = JSON.stringify({
      entryPath: data.entryPath,
      monthlyUnits: data.monthlyUnits,
      monthlyBill: data.monthlyBill,
      appliances: data.appliances,
      evInfo: data.evInfo,
      specs,
    });

    if (lastTraceSignatureRef.current === signature) {
      return;
    }
    lastTraceSignatureRef.current = signature;

    fetch('/__debug/sizing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tracePayload),
    }).catch((error) => {
      console.error('[ResultDashboard] terminal debug post failed', error);
    });
  }, [data, specs]);

  useEffect(() => {
    async function fetchAiInsights() {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        console.log('[ResultDashboard] preparing AI insight request', {
          hasApiKey: Boolean(apiKey),
          demandSource: specs.demandSource,
          pvRequiredKW: Number(specs.pvRequiredKW.toFixed(2)),
          panelCount: specs.panelCount,
          batteryBankKWh: Number(specs.batteryBankKWh.toFixed(2)),
        });

        if (!apiKey) {
          console.log('[ResultDashboard] VITE_GEMINI_API_KEY is missing; using fallback insights');
          setAiInsights("• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
          return;
        }

        const genAI = new GoogleGenAI({ apiKey });

        const prompt = `
          As a solar expert in Pakistan, provide 3 concise, high-impact bullet points for this user:
          - Name: ${data.details?.name}
          - Demand source: ${specs.demandSource}
          - System: ${specs.pvRequiredKW.toFixed(2)}kW with ${specs.panelCount} panels
          - Peak load: ${specs.totalConcurrentLoadW}W (includes ${data.evInfo.hasCar ? `EV Car: ${data.evInfo.carModel}` : ''} ${data.evInfo.hasBike ? `EV Bike: ${data.evInfo.bikeModel}` : ''})
          - Battery bank: ${specs.batteryBankKWh.toFixed(1)}kWh
          - Backup: ${data.backupPreference}
          - Budget Sensitivity: ${data.budgetSensitivity}/100
          
          Focus on:
          1. Specific appliance/EV management.
          2. Net metering benefits in PKR.
          3. Environmental impact for their specific location.
          Keep it professional and encouraging.
        `;

        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        
        console.log('[ResultDashboard] AI response text', response.text);
        setAiInsights(response.text || "• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
      } catch (error) {
        console.error('[ResultDashboard] AI Insight Error:', error);
        setAiInsights("• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
      } finally {
        setLoadingAi(false);
      }
    }

    fetchAiInsights();
  }, [data, specs]);

  return (
    <div className="min-h-screen bg-solar-navy p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: System Overview */}
        <div className="lg:col-span-8 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-4xl font-display font-bold text-white"
              >
                System Blueprint
              </motion.h1>
              <div className="flex items-center gap-4 mt-2 text-white/40 text-sm">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {data.details?.name}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.details?.address}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="btn-primary px-6 py-2 flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" /> Download Proposal
              </button>
            </div>
          </header>

          {/* Main Visualization Card */}
          <div className="glass-card p-0 overflow-hidden relative min-h-[400px] flex flex-col md:flex-row">
            <div className="flex-1 bg-gradient-to-br from-solar-navy to-solar-navy/50 relative">
              <HouseVisual appliances={data.appliances} evInfo={data.evInfo} />
              
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="bg-solar-orange/20 border border-solar-orange/30 px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-solar-orange rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-solar-orange">Live Simulation</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 p-6 space-y-6 bg-white/[0.02]">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Technical Specs</h3>
              <div className="space-y-4">
                <SpecItem icon={Zap} label="System Capacity" value={`${specs.pvRequiredKW.toFixed(2)} kW`} />
                <SpecItem icon={Cpu} label="Solar Panels" value={`${specs.panelCount} x ${PANEL_WATTAGE}W`} />
                <SpecItem icon={Battery} label="Storage" value={`${specs.batteryBankKWh.toFixed(1)} kWh`} />
                <SpecItem icon={TrendingDown} label="Payback" value={`${specs.paybackYears.toFixed(1)} Years`} />
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Leaf className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Eco Impact</span>
                </div>
                <p className="text-2xl font-display font-bold">{specs.ecoImpactTons.toFixed(1)} Tons</p>
                <p className="text-[10px] text-white/30 uppercase">CO2 Offset Annually</p>
              </div>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="glass-card p-8 border-l-4 border-l-solar-orange">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-solar-orange/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-solar-orange" />
              </div>
              <div>
                <h2 className="text-xl font-bold">SkyElectric AI Insights</h2>
                <p className="text-xs text-white/40">Personalized optimization for your profile</p>
              </div>
            </div>
            
            {loadingAi ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-4 bg-white/5 rounded w-2/3" />
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="text-white/70 leading-relaxed markdown-body">
                  <Markdown>{aiInsights}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financials & CTA */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-8 bg-gradient-to-b from-white/[0.05] to-transparent">
            <h3 className="text-lg font-bold mb-6">Investment Summary</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Estimated Total</p>
                <p className="text-4xl font-display font-bold text-solar-orange">
                  Rs. {(specs.estimatedCost / 100000).toFixed(1)}<span className="text-xl ml-1">Lakh</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Monthly Savings</p>
                  <p className="text-lg font-bold">Rs. {Math.round(specs.estimatedMonthlySavings / 1000)}k</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Annual ROI</p>
                  <p className="text-lg font-bold text-green-400">~{Math.round((specs.estimatedMonthlySavings * 12 / specs.estimatedCost) * 100)}%</p>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <button className="btn-primary w-full py-4 flex items-center justify-center gap-2 group">
                  Book Free Site Survey
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-center text-white/20 uppercase tracking-widest">
                  No commitment required
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-solar-electric/30">
            <h4 className="text-sm font-bold mb-4">Why this system?</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-xs text-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-solar-electric mt-1" />
                Optimized for your home in Pakistan
              </li>
              <li className="flex items-start gap-3 text-xs text-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-solar-electric mt-1" />
                Tier-1 Jinko/Longi 550W Panels
              </li>
              <li className="flex items-start gap-3 text-xs text-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-solar-electric mt-1" />
                Hybrid Inverter with 5-Year Warranty
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
        <Icon className="w-5 h-5 text-solar-electric" />
      </div>
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
