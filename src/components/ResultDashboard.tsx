import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserData, PAKISTAN_CONSTANTS } from '../types';
import { 
  Settings, X, Trash2, TrendingUp, Share2, Download, 
  User, MapPin, Leaf, Zap, Battery, Sun, Home 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import HouseVisual from './HouseVisual';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

interface ResultDashboardProps {
  data: UserData;
}

export default function ResultDashboard({ data }: ResultDashboardProps) {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [appliances, setAppliances] = useState(data.appliances);
  const [showAppliancesPanel, setShowAppliancesPanel] = useState(false);

  // Calculations
  const totalWattage = appliances.reduce((acc, app) => acc + (app.wattage * app.quantity), 0);
  const evLoad = data.evInfo.status !== 'none' ? (data.evInfo.batterySize || 40) * 1000 : 0;
  const totalLoad = Math.round(totalWattage + (evLoad / 10));

  const systemSizeKW = Math.ceil((totalLoad * 1.25) / 1000);
  const panelCount = Math.ceil((systemSizeKW * 1000) / 550);
  const batteryKWh = 5.0;
  const inverterSize = systemSizeKW;

  const estimatedAnnualProduction = Math.round(systemSizeKW * 1450);
  const monthlySavings = Math.round(estimatedAnnualProduction / 12 * PAKISTAN_CONSTANTS.TARIFF_RATE);
  const paybackYears = (45677 / 45).toFixed(1); // Note: you'll need to define estimatedCost & annualSavings if not already

  // Live metrics
  const [currentProduction, setCurrentProduction] = useState(systemSizeKW * 0.65);
  const [batterySOC, setBatterySOC] = useState(78);

  const removeAppliance = (index: number) => {
    const updated = [...appliances];
    updated.splice(index, 1);
    setAppliances(updated);
  };

  const resetAppliances = () => setAppliances([...data.appliances]);

  // ... (keep your existing useEffects for dark mode, AI, and live simulation)

  return (
    <div className="h-screen p-4 md:p-8 pt-20 flex flex-col overflow-hidden bg-solar-navy text-solar-text">
      <div className="max-w-[1480px] mx-auto w-full flex-1 flex flex-col gap-6 min-h-0">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-3xl font-display font-bold">
              Your Solar System
            </motion.h1>
            <div className="flex items-center gap-4 mt-1 text-xs opacity-60">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {data.details?.name}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.details?.address}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 flex items-center gap-2 text-sm rounded-2xl border border-solar-border hover:bg-white/5 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="btn-primary px-5 py-2 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Download Proposal
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex gap-8 rounded-[2.5rem] bg-gradient-to-br from-solar-navy to-solar-card shadow-2xl overflow-hidden">

          {/* LEFT SIDE - House Visual (Kept Larger) */}
          <div className="flex-[1.28] flex flex-col gap-6 bg-solar-navy/90 rounded-l-[2.5rem] overflow-hidden p-9 relative">

            {/* House Visual */}
            <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/10">
              <HouseVisual appliances={appliances} evInfo={data.evInfo} isDark={isDark} />

              {/* Appliances Button - Top Right of House */}
              <button
                onClick={() => setShowAppliancesPanel(!showAppliancesPanel)}
                className="absolute top-6 right-6 z-50 flex items-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-2.5 transition-all"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Your Appliances</span>
                <div className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">{appliances.length}</div>
              </button>

              {/* Live Status Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-3 flex items-center gap-8 text-xs z-40 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {isDark ? "Emergency Storage" : "Solar Harvesting"}
                </div>
                <div>Producing: <span className="font-mono font-bold">{currentProduction.toFixed(1)} kW</span></div>
                <div>Battery: <span className="font-mono font-bold">{batterySOC.toFixed(1)}%</span></div>
                <div className="text-solar-orange">Grid: Exporting</div>
              </div>

              {/* Day/Night Toggle */}
              <div className="absolute bottom-6 right-6 flex gap-2 z-40">
                <button onClick={() => setIsDark(true)} className={cn("px-5 py-2 rounded-full text-xs font-bold tracking-widest", isDark ? "bg-solar-orange text-white" : "bg-white/10 text-white/60")}>NIGHT</button>
                <button onClick={() => setIsDark(false)} className={cn("px-5 py-2 rounded-full text-xs font-bold tracking-widest", !isDark ? "bg-solar-orange text-white" : "bg-white/10 text-white/60")}>DAY</button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Compact & Icon-Rich */}
          <div className="flex-[0.82] flex flex-col gap-5 p-9 bg-solar-card/90 rounded-r-[2.5rem] overflow-y-auto h-full max-h-full min-h-0">
            {/* System Summary */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-5">
                <Home className="w-5 h-5" /> System Summary
              </h2>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-sm">
                <div className="flex items-center gap-3"><Zap className="w-4 h-4 opacity-70" /> <span><span className="opacity-60">Peak Load</span><br /><b>{totalLoad} W</b></span></div>
                <div className="flex items-center gap-3"><Sun className="w-4 h-4 opacity-70" /> <span><span className="opacity-60">PV Capacity</span><br /><b>{systemSizeKW} kW</b></span></div>
                <div className="flex items-center gap-3"><Battery className="w-4 h-4 opacity-70" /> <span><span className="opacity-60">Storage</span><br /><b>{batteryKWh} kWh</b></span></div>
                <div className="flex items-center gap-3"><Zap className="w-4 h-4 opacity-70" /> <span><span className="opacity-60">Inverter</span><br /><b>{inverterSize} kW</b></span></div>
                <div className="flex items-center gap-3"><Sun className="w-4 h-4 opacity-70" /> <span><span className="opacity-60">Panels</span><br /><b>{panelCount} × 550W</b></span></div>
                <div className="flex items-center gap-3"><Leaf className="w-4 h-4 opacity-70" /> <span><span className="opacity-60">Est. Annual Production</span><br /><b>{estimatedAnnualProduction} kWh</b></span></div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md flex items-start gap-4">
              <div className="mt-1">
                <Leaf className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Environmental Impact</h3>
                <p className="text-sm opacity-80">This system offsets approximately <b className="text-emerald-400">9.0 tons of CO₂</b> per year — equivalent to planting 150 trees.</p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h3 className="uppercase text-xs tracking-widest font-bold mb-3">AI Insights</h3>
              <div className="text-sm leading-relaxed opacity-80">
                {loadingAi ? "Generating insights..." : <Markdown>{aiInsights}</Markdown>}
              </div>
            </div>

            {/* Market Volatility */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h3 className="flex items-center gap-2 uppercase text-xs tracking-widest font-bold mb-3">
                <TrendingUp className="w-4 h-4" /> Market Volatility
              </h3>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium opacity-70">Inflation Shield</span>
                <span className="font-bold text-green-400">8.4 / 10</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-green-500 rounded-full" />
              </div>
              <p className="text-xs mt-4 opacity-60">Solar provides 84% more cost stability than grid-only over 10 years.</p>
            </div>

            {/* Next Steps */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md mt-auto">
              <h3 className="text-lg font-bold mb-4">Next Steps</h3>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-3 items-start"><span className="font-mono text-solar-orange font-bold mt-0.5">01</span> Review your adjusted blueprint</li>
                <li className="flex gap-3 items-start"><span className="font-mono text-solar-orange font-bold mt-0.5">02</span> Download detailed proposal</li>
                <li className="flex gap-3 items-start"><span className="font-mono text-solar-orange font-bold mt-0.5">03</span> Book free site survey</li>
              </ol>
              <button className="btn-primary w-full py-4 mt-6 text-base font-semibold">Book Free Site Visit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Appliances Panel */}
      <AnimatePresence>
        {showAppliancesPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
            onClick={() => setShowAppliancesPanel(false)}
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Your Appliances</h3>
                <button onClick={() => setShowAppliancesPanel(false)}><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {appliances.map((app, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/5 rounded-2xl p-4">
                    <div>
                      <div className="font-medium">{app.name}</div>
                      <div className="text-xs opacity-60">{app.quantity} × {app.wattage}W = {app.wattage * app.quantity}W</div>
                    </div>
                    <button onClick={() => removeAppliance(index)} className="text-red-400 hover:bg-white/10 p-2 rounded-xl">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {appliances.length !== data.appliances.length && (
                <button onClick={resetAppliances} className="text-solar-orange text-sm hover:underline mt-6 block w-full text-center">
                  Reset to original
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}