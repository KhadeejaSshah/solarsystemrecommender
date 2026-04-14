import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserData, PAKISTAN_CONSTANTS } from '../types';
import { 
  Sun, Zap, Battery, TrendingUp, Leaf, Download, Share2, 
  User, MapPin, Trash2, Settings, X 
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

  // Editable appliances
  const [appliances, setAppliances] = useState(data.appliances);
  const [showAppliancesPanel, setShowAppliancesPanel] = useState(false);

  // Recalculate based on current appliances
  const totalWattage = appliances.reduce((acc, app) => acc + (app.wattage * app.quantity), 0);
  const evLoad = data.evInfo.status !== 'none' ? (data.evInfo.batterySize || 40) * 1000 : 0;
  const totalLoad = Math.round(totalWattage + (evLoad / 10));

  // System sizing
  const systemSizeKW = Math.ceil((totalLoad * 1.25) / 1000);
  const panelCount = Math.ceil((systemSizeKW * 1000) / 550);
  const batteryKWh = 5.0;
  const inverterSize = systemSizeKW;

  const estimatedAnnualProduction = Math.round(systemSizeKW * 1450);
  const monthlySavings = Math.round(estimatedAnnualProduction / 12 * PAKISTAN_CONSTANTS.TARIFF_RATE);
  const annualSavings = monthlySavings * 12;
  const estimatedCost = Math.round(systemSizeKW * 180000 + batteryKWh * 65000);
  const paybackYears = (estimatedCost / annualSavings).toFixed(1);
  const lifetimeValue = Math.round(annualSavings * 25 * 0.85);

  // Simulated live metrics
  const [currentProduction, setCurrentProduction] = useState(systemSizeKW * 0.65);
  const [batterySOC, setBatterySOC] = useState(78);

  const removeAppliance = (index: number) => {
    const updated = [...appliances];
    updated.splice(index, 1);
    setAppliances(updated);
  };

  const resetAppliances = () => {
    setAppliances([...data.appliances]);
  };

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains('light'));
    const observer = new MutationObserver(() => {
      setIsDark(!document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // AI Insights
  useEffect(() => {
    async function fetchAiInsights() {
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

        const prompt = `
          As a solar expert in Pakistan, give 4 concise bullet points:
          - Name: ${data.details?.name || 'Homeowner'}
          - Current Load: ${totalLoad}W
          - System: ${systemSizeKW}kW PV, ${batteryKWh}kWh storage
          - Appliances: ${appliances.map(a => a.name).join(', ')}
          
          Focus on smart usage, savings, CO₂ impact, and one optimization tip.
        `;

        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        
        setAiInsights(response.text || "...");
      } catch (error) {
        console.error("AI Error:", error);
        setAiInsights("• Shift high-consumption appliances to daytime.\n• Expected monthly savings with net metering: ₨" + monthlySavings + ".\n• Offsets ~" + (systemSizeKW * 0.75).toFixed(1) + " tons CO₂ yearly.\n• Monitor and optimize usage for best results.");
      } finally {
        setLoadingAi(false);
      }
    }

    fetchAiInsights();
  }, [appliances, systemSizeKW, monthlySavings]);

  // Simulate live production
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProduction(Math.max(0.8, systemSizeKW * (0.55 + Math.random() * 0.45)));
      setBatterySOC(Math.max(25, Math.min(92, batterySOC + (Math.random() * 6 - 3))));
    }, 7000);
    return () => clearInterval(interval);
  }, [systemSizeKW]);

  return (
    <div className="h-screen p-4 md:p-6 pt-20 flex flex-col overflow-hidden bg-solar-navy text-solar-text">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-display font-bold"
            >
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
        <div className="flex-1 flex gap-6 rounded-[2.5rem] bg-gradient-to-br from-solar-navy to-solar-card shadow-2xl overflow-hidden">

          {/* LEFT SIDE: Visual + Appliances Icon */}
          <div className="flex-1 flex flex-col gap-6 bg-solar-navy/90 rounded-l-[2.5rem] overflow-hidden p-6 relative">

            {/* House Visual */}
            <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/10">
              <HouseVisual 
                appliances={appliances} 
                evInfo={data.evInfo} 
                isDark={isDark}
              />

              {/* Live Status Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-3 flex items-center gap-8 text-xs z-40 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {/* Solar Harvesting Active */}
                                  {/* Solar Harvesting or Emergency Storage */}
                <div className="col-span-2">
                  <span className="opacity-60">
                    {isDark ? "Emergency Storage" : "Solar Harvesting"}
                  </span>
                  <br />
                  
                </div>
                  {/* <HouseVisual appliances={data.appliances} evInfo={data.evInfo} isDark={isDark} /> */}

                </div>
                <div>Producing: <span className="font-mono font-bold">{currentProduction.toFixed(1)} kW</span></div>
                {/* roundoff battery to 2 decimal place: */}
                <div>Battery: <span className="font-mono font-bold">{batterySOC.toFixed(2)}%</span></div>
                <div className="text-solar-orange">Grid: Exporting</div>
              </div>

              {/* Day/Night Toggle */}
              <div className="absolute bottom-6 right-6 flex gap-2 z-40">
                <button 
                  onClick={() => setIsDark(true)} 
                  className={cn("px-5 py-2 rounded-full text-xs font-bold tracking-widest", 
                    isDark ? "bg-solar-orange text-white" : "bg-white/10 text-white/60")}
                >
                  NIGHT
                </button>
                <button 
                  onClick={() => setIsDark(false)} 
                  className={cn("px-5 py-2 rounded-full text-xs font-bold tracking-widest", 
                    !isDark ? "bg-solar-orange text-white" : "bg-white/10 text-white/60")}
                >
                  DAY
                </button>
              </div>
            </div>

            {/* Appliances Floating Button */}
            <button
              onClick={() => setShowAppliancesPanel(!showAppliancesPanel)}
              className="absolute top-12 right-12 z-50 flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 transition-all group"
            >
              <Settings className="w-5 h-5" />
              <div className="text-sm font-medium">Your Appliances</div>
              <div className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-mono">
                {appliances.length}
              </div>
            </button>

            {/* Appliances Panel (Popover) */}
            <AnimatePresence>
              {showAppliancesPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute top-28 right-12 z-50 w-96 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">Your Appliances</h3>
                    <button 
                      onClick={() => setShowAppliancesPanel(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto pr-2 space-y-3 text-sm mb-5">
                    {appliances.length === 0 ? (
                      <p className="opacity-60 italic py-8 text-center">No appliances selected.</p>
                    ) : (
                      appliances.map((app, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 rounded-2xl p-4 group">
                          <div>
                            <div className="font-medium">{app.name}</div>
                            <div className="text-xs opacity-60 mt-0.5">
                              {app.quantity} × {app.wattage}W = {app.wattage * app.quantity}W
                            </div>
                          </div>
                          <button
                            onClick={() => removeAppliance(index)}
                            className="opacity-40 hover:opacity-100 text-red-400 p-2 rounded-xl hover:bg-white/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {appliances.length !== data.appliances.length && (
                    <button 
                      onClick={resetAppliances}
                      className="text-xs text-solar-orange hover:underline w-full text-center py-2"
                    >
                      Reset to original selection
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDEBAR - Unchanged */}
          <div className="w-96 flex flex-col gap-4 p-8 bg-solar-card/90 overflow-y-auto rounded-r-[2.5rem]">
            {/* System Summary */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h2 className="text-xl font-bold mb-4">System Summary</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div><span className="opacity-60">Peak Load</span><br /><b>{totalLoad} W</b></div>
                <div><span className="opacity-60">PV Capacity</span><br /><b>{systemSizeKW} kW</b></div>
                <div><span className="opacity-60">Storage</span><br /><b>{batteryKWh} kWh</b></div>
                <div><span className="opacity-60">Inverter</span><br /><b>{inverterSize} kW</b></div>
                <div><span className="opacity-60">Panels</span><br /><b>{panelCount} × 550W</b></div>
                <div><span className="opacity-60">Est. Annual Production</span><br /><b>{estimatedAnnualProduction} kWh</b></div>

              </div>
            </div>

            {/* Financial Snapshot */}
            {/* <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" /> Financials
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">Estimated Cost</span>
                  <span className="font-bold">₨{estimatedCost.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Monthly Savings</span>
                  <span className="font-bold text-green-400">₨{monthlySavings.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Payback Period</span>
                  <span className="font-bold">{paybackYears} years</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <span className="opacity-70">25-Year Value</span>
                  <span className="font-bold">₨{lifetimeValue.toLocaleString('en-PK')}</span>
                </div>
              </div>
            </div> */}
            

            {/* AI Insights */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h3 className="uppercase text-xs tracking-widest font-bold mb-3">AI Insights</h3>
              <div className="text-sm leading-relaxed opacity-80">
                {loadingAi ? "Generating insights based on your appliances..." : <Markdown>{aiInsights}</Markdown>}
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md mt-auto">
              <h3 className="text-lg font-bold mb-4">Next Steps</h3>
              <ol className="space-y-3 text-sm opacity-80">
                <li className="flex gap-3"><span className="font-mono text-solar-orange">1</span> Review your adjusted blueprint</li>
                <li className="flex gap-3"><span className="font-mono text-solar-orange">2</span> Download detailed proposal</li>
                <li className="flex gap-3"><span className="font-mono text-solar-orange">3</span> Book free site survey</li>
              </ol>
              <button className="btn-primary w-full py-4 mt-6 text-base font-semibold">Book Free Site Visit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}