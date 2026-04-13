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
    <div className="h-screen p-3 md:p-5 pt-14 flex flex-col overflow-hidden transition-colors duration-500 bg-solar-navy text-solar-text relative">
      {/* Premium Aurora Background Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-solar-electric/10 rounded-full blur-[120px] animate-aurora" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-solar-orange/5 rounded-full blur-[100px] animate-aurora" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-3 min-h-0 relative z-10">

        {/* Row 1: Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-xl font-display font-bold leading-tight"
            >
              System Blueprint
            </motion.h1>
            <div className="flex items-center gap-3 mt-0.5 text-[10px] opacity-40">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {data.details?.name}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.details?.address}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] rounded-lg border border-solar-border bg-solar-card hover:bg-solar-navy transition-all">
              <Share2 className="w-3 h-3" /> Share
            </button>
            <button className="btn-primary px-3 py-1.5 flex items-center gap-1.5 text-[10px] rounded-lg">
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>

        {/* Row 2: Main Content — House | Insights */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-3 min-h-0">

          {/* House Visual — 3/5 width */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <div className="glass-card p-0 overflow-hidden relative flex-1 bg-gradient-to-br from-solar-navy to-solar-card transition-colors duration-500">
              <HouseVisual appliances={data.appliances} evInfo={data.evInfo} />
              <div className="absolute top-3 left-3">
                <div className="bg-solar-electric/10 border border-solar-electric/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-solar-electric rounded-full animate-pulse" />
                  <span className="text-[7px] font-bold uppercase tracking-widest text-solar-electric">Live Simulation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel — 2/5 width */}
          <div className="lg:col-span-2 flex flex-col gap-3 min-h-0">

            {/* Technical Specs */}
            <div className="glass-card glass-card-hover p-4 shrink-0 transition-colors">
              <div className="grid grid-cols-2 gap-4">
                <SpecItem icon={Sun} label="PV Capacity" value={`${systemSizeKW} kW`} />
                <SpecItem icon={Battery} label="Storage" value={`${batteryKWh.toFixed(1)} kWh`} />
                <SpecItem icon={Zap} label="Inverter" value={`${systemSizeKW} kW`} />
                <SpecItem icon={Leaf} label="CO₂ Offset" value={`${(systemSizeKW * 0.7).toFixed(1)} T/yr`} />
              </div>
            </div>

            {/* AI Insights */}
            <div className="glass-card glass-card-hover p-4 border-l-2 border-l-solar-electric flex flex-col flex-1 transition-colors overflow-hidden">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <Cpu className="w-4 h-4 text-solar-electric" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">AI Insights</h3>
              </div>
              <div className="text-[11px] leading-relaxed overflow-y-auto flex-1 pr-1 custom-scrollbar opacity-80 prose prose-invert prose-xs max-w-none">
                {loadingAi ? (
                  <div className="space-y-2.5 animate-pulse">
                    <div className="h-2 bg-solar-text/5 rounded w-full" />
                    <div className="h-2 bg-solar-text/5 rounded w-4/5" />
                    <div className="h-2 bg-solar-text/5 rounded w-3/5" />
                    <div className="h-2 bg-solar-text/5 rounded w-full" />
                    <div className="h-2 bg-solar-text/5 rounded w-2/3" />
                  </div>
                ) : (
                  <Markdown components={{
                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                    li: ({children}) => <li className="mb-1 text-solar-text/90 marker:text-solar-electric">{children}</li>,
                    strong: ({children}) => <strong className="text-solar-orange font-bold">{children}</strong>
                  }}>{aiInsights}</Markdown>
                )}
              </div>
            </div>

            {/* Volatility */}
            <div className="glass-card glass-card-hover p-4 border-l-2 border-l-solar-orange shrink-0 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-solar-orange" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Cost Stability</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-60">Stability Score</span>
                  <span className="font-bold text-green-500">8.4/10</span>
                </div>
                <div className="w-full h-1.5 bg-solar-text/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-solar-orange rounded-full" />
                </div>
                <p className="text-[10px] leading-snug opacity-50">
                  Solar provides 84% more cost stability than grid-only over 10 years.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Row 3: Next Steps CTA + Footer */}
        <div className="shrink-0 flex flex-col gap-2">
          <div className="glass-card p-3 bg-gradient-to-r from-solar-electric/5 to-transparent border-solar-electric/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 flex items-center gap-6">
                {[
                  "Review blueprint & specs",
                  "Get a detailed quotation",
                  "Schedule free site survey"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-solar-electric/10 flex items-center justify-center text-solar-electric text-[9px] font-bold shrink-0">{i + 1}</div>
                    <p className="text-[11px] opacity-70 hidden md:block">{step}</p>
                  </div>
                ))}
              </div>
              <button className="btn-primary px-5 py-2.5 flex items-center gap-2 group shrink-0">
                <span className="text-xs font-semibold">Book Free Site Visit</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* SkyElectric Footer */}
          <div className="flex items-center justify-center gap-6 py-1">
            {[
              "Smart SEMS System",
              "Tier-1 550W Panels",
              "24/7 Remote Support"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[8px] opacity-30 font-medium">
                <div className="w-1 h-1 rounded-full bg-solar-electric" />
                {feature}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md flex items-center justify-center border border-solar-border bg-solar-card transition-colors">
        <Icon className="w-3.5 h-3.5 text-solar-electric" />
      </div>
      <div>
        <p className="text-[7px] uppercase tracking-wider opacity-40 font-medium leading-none">{label}</p>
        <p className="text-xs font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}
