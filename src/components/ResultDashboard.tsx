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

        {/* Main Curved Container */}
        <div className="flex-1 grow-3 flex items-stretch gap-10 rounded-[2.5rem] bg-gradient-to-br from-solar-navy to-solar-card shadow-2xl overflow-hidden">
          {/* Left: Live Simulation */}
          <div className="relative grow-3 flex-1 flex flex-col justify-end items-center bg-solar-navy/80 rounded-l-[2.5rem] overflow-hidden">
            {/* Stat Boxes Floating Over Video */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-6 z-30 text-black ">
              <SpecItem icon={Sun} label="PV Capacity" value={`${systemSizeKW} kW`} />
              <SpecItem icon={Battery} label="Storage" value={`${batteryKWh.toFixed(1)} kWh`} />
              <SpecItem icon={Zap} label="Inverter" value={`${systemSizeKW} kW`} />
              {/* <SpecItem icon={Leaf} label="Eco Impact" value={
                <span className="flex items-center gap-1">
                  {Array.from({ length: Math.max(1, Math.round(systemSizeKW * 1.5)) }).map((_, i) => (
                    <Leaf key={i} className="w-3 h-3 text-green-600 inline" />
                  ))}
                  <span className="ml-1">{(systemSizeKW * 0.7).toFixed(1)} T</span>
                </span>
              } /> */}
            </div>
            {/* Live Simulation Video */}
            <div className="w-full h-full flex items-center justify-center">
              <HouseVisual appliances={data.appliances} evInfo={data.evInfo} />
            </div>
          </div>

          {/* Right: Summary & Insights */}
          <div className="flex-1 flex flex-col justify-between p-8 bg-solar-card/80 rounded-r-[2.5rem] min-w-[350px]">
            {/* System Summary */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">System Summary</h2>
              <ul className="text-xs opacity-80 space-y-1">
                <li><b>Load:</b> {totalLoad}W</li>
                <li><b>Backup:</b> {data.backupPreference}</li>
                <li><b>EV:</b> {data.evInfo.status}</li>
                <li><b>Panels:</b> {panelCount} x 550W</li>
              </ul>
            </div>
            {/* AI Insights */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-1">AI Insights</h3>
              <div className="text-[10px] leading-relaxed opacity-70">
                {loadingAi ? <div>Loading...</div> : <Markdown>{aiInsights}</Markdown>}
              </div>
            </div>
            {/* Volatility */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Volatility</h3>
              <div className="flex items-center justify-between text-[10px]">
                <span className="opacity-60">Stability</span>
                <span className="font-bold text-green-500">8.4/10</span>
              </div>
              <div className="w-full h-1 bg-solar-text/5 rounded-full overflow-hidden mb-1">
                <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-solar-orange" />
              </div>
              <p className="text-[9px] leading-tight opacity-50">
                Solar provides 84% more cost stability than grid-only over 10 years.
              </p>
            </div>






            {/* Next Steps */}
            <div>
              <h3 className="text-lg font-bold mb-2">Next Steps</h3>
              <ol className="space-y-2 text-xs opacity-70">
                <li>1. Review your AI-generated blueprint and technical specs.</li>
                <li>2. Get a detailed quotation based on current market rates.</li>
                <li>3. Schedule a free site survey with our expert engineers.</li>
              </ol>
              <button className="btn-primary w-full py-4 mt-4">Book Free Site Visit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: any) {
  return (
    <div className="min-w-[120px] px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg flex flex-col items-start">
      <div className="mb-1">
        <Icon className="w-5 h-5 text-solar-electric" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider opacity-60">{label}</p>
        <p className="text-base font-bold">{value}</p>
      </div>
    </div>
  );
}
