import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserData, PAKISTAN_CONSTANTS } from '../types';
import { 
  Sun,
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
import { cn } from '../lib/utils';

interface ResultDashboardProps {
  data: UserData;
}

export default function ResultDashboard({ data }: ResultDashboardProps) {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(true);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains('light'));
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(!document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Simplified calculations for the dashboard
  const totalWattage = data.appliances.reduce((acc, app) => acc + (app.wattage * app.quantity), 0);
  const evLoad = data.evInfo.status !== 'none' ? (data.evInfo.batterySize || 40) * 1000 : 0;
  const totalLoad = totalWattage + (evLoad / 10); // Amortized EV load for daily sizing
  
  const systemSizeKW = Math.ceil((totalLoad * 1.2) / 1000); // 20% buffer
  const panelCount = Math.ceil((systemSizeKW * 1000) / 550); // 550W panels
  const batteryKWh = data.backupPreference === 'full' ? systemSizeKW * 2 : typeof data.backupPreference === 'number' ? systemSizeKW * (data.backupPreference / 4) : systemSizeKW;
  
  const estimatedCost = systemSizeKW * 180000; // ~180k PKR per kW
  const monthlySavings = (systemSizeKW * 5 * 30) * PAKISTAN_CONSTANTS.TARIFF_RATE;
  const paybackYears = (estimatedCost / (monthlySavings * 12)).toFixed(1);

  useEffect(() => {
    async function fetchAiInsights() {
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

        const prompt = `
          As a solar expert in Pakistan, provide 3 concise, high-impact bullet points for this user:
          - Name: ${data.details?.name}
          - System: ${systemSizeKW}kW with ${panelCount} panels
          - Load: ${totalLoad}W (includes EV status: ${data.evInfo.status})
          - Backup: ${data.backupPreference}
          
          Focus on:
          1. Specific appliance/EV management.
          2. Net metering benefits in PKR.
          3. Environmental impact.
          Keep it professional and encouraging.
        `;

        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        
        setAiInsights(response.text || "• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
      } catch (error) {
        console.error("AI Insight Error:", error);
        setAiInsights("• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
      } finally {
        setLoadingAi(false);
      }
    }

    fetchAiInsights();
  }, [data]);

  return (
    <div className="h-screen p-4 md:p-6 pt-20 flex flex-col overflow-hidden transition-colors duration-500 bg-solar-navy text-solar-text">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-display font-bold"
            >
              System Blueprint
            </motion.h1>
            <div className="flex items-center gap-4 mt-1 text-xs opacity-40">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {data.details?.name}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.details?.address}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 flex items-center gap-2 text-xs rounded-xl border border-solar-border bg-solar-card hover:bg-solar-navy transition-all">
              <Share2 className="w-3 h-3" /> Share
            </button>
            <button className="btn-primary px-4 py-1.5 flex items-center gap-2 text-xs">
              <Download className="w-3 h-3" /> Download Proposal
            </button>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          
          {/* Left Column: Visualization */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="glass-card p-0 overflow-hidden relative flex-1 bg-gradient-to-br from-solar-navy to-solar-card transition-colors duration-500">
              <HouseVisual appliances={data.appliances} evInfo={data.evInfo} />
              
              <div className="absolute top-4 left-4">
                <div className="bg-solar-electric/10 border border-solar-electric/30 px-2 py-0.5 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-solar-electric rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-solar-electric">Live Simulation</span>
                </div>
              </div>
            </div>

            {/* Technical Specs Bar */}
            <div className="glass-card p-4 shrink-0 transition-colors">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SpecItem icon={Sun} label="PV Capacity" value={`${systemSizeKW} kW`} />
                <SpecItem icon={Battery} label="Storage" value={`${batteryKWh.toFixed(1)} kWh`} />
                <SpecItem icon={Zap} label="Inverter" value={`${systemSizeKW} kW`} />
                <SpecItem icon={Leaf} label="Eco Impact" value={`${(systemSizeKW * 0.7).toFixed(1)} T`} />
              </div>
            </div>
          </div>

          {/* Right Column: Insights & CTA */}
          <div className="flex flex-col gap-4 min-h-0">
            {/* Insights & Volatility Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
              <div className="glass-card p-4 border-l-2 border-l-solar-electric flex flex-col transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-solar-electric" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">AI Insights</h3>
                </div>
                <div className="text-[10px] leading-relaxed overflow-y-auto max-h-24 pr-1 custom-scrollbar opacity-70">
                  {loadingAi ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-2 bg-solar-text/5 rounded w-full" />
                      <div className="h-2 bg-solar-text/5 rounded w-3/4" />
                    </div>
                  ) : (
                    <Markdown>{aiInsights}</Markdown>
                  )}
                </div>
              </div>

              <div className="glass-card p-4 border-l-2 border-l-solar-orange flex flex-col transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-solar-orange" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Volatility</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="opacity-60">Stability</span>
                    <span className="font-bold text-green-500">8.4/10</span>
                  </div>
                  <div className="w-full h-1 bg-solar-text/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-solar-orange" />
                  </div>
                  <p className="text-[9px] leading-tight opacity-50">
                    Solar provides 84% more cost stability than grid-only over 10 years.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps & CTA */}
            <div className="glass-card p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-solar-electric/5 to-transparent border-solar-electric/20 transition-colors">
              <div>
                <h3 className="text-lg font-bold mb-4">Next Steps</h3>
                <div className="space-y-3">
                  {[
                    "Review your AI-generated blueprint and technical specs.",
                    "Get a detailed quotation based on current market rates.",
                    "Schedule a free site survey with our expert engineers."
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-solar-electric/10 flex items-center justify-center text-solar-electric text-[10px] font-bold shrink-0">{i+1}</div>
                      <p className="text-xs opacity-70">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button className="btn-primary w-full py-4 flex flex-col items-center justify-center gap-0.5 group">
                  <span className="text-base">Book Free Site Visit</span>
                  <span className="text-[8px] uppercase tracking-widest opacity-80">Get Quotation from SkyElectric</span>
                </button>
                <p className="text-[9px] text-center uppercase tracking-widest opacity-30">
                  No commitment required • Expert consultation
                </p>
              </div>
            </div>

            {/* Why SkyElectric Footer */}
            <div className="glass-card p-4 shrink-0 transition-colors">
              <div className="flex items-center justify-around">
                {[
                  "Smart SEMS System",
                  "Tier-1 550W Panels",
                  "24/7 Remote Support"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] opacity-60">
                    <div className="w-1 h-1 rounded-full bg-solar-electric" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-solar-border bg-solar-card transition-colors">
        <Icon className="w-4 h-4 text-solar-electric" />
      </div>
      <div>
        <p className="text-[8px] uppercase tracking-wider opacity-50">{label}</p>
        <p className="text-xs font-bold">{value}</p>
      </div>
    </div>
  );
}
