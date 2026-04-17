import { useState, useEffect, useMemo } from 'react';
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
  MapPin,
  TrendingUp,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import SolarHouse3D from './SolarHouse/SolarHouse3D';
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
    const observer = new MutationObserver(() => {
      setIsDark(!document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // calculations
  const totalWattage = data.appliances.reduce((acc, app) => acc + (app.wattage * app.quantity), 0);
  const evLoad = data.evInfo.status !== 'none' ? (data.evInfo.batterySize || 40) * 1000 : 0;
  const totalLoad = totalWattage + (evLoad / 10);

  const systemSizeKW = Math.ceil((totalLoad * 1.2) / 1000); // 20% buffer
  const panelCount = Math.ceil((systemSizeKW * 1000) / 550); // 550W panels
  const batteryKWh = data.backupPreference === 'full' ? systemSizeKW * 2 : typeof data.backupPreference === 'number' ? systemSizeKW * (data.backupPreference / 4) : systemSizeKW;

  useEffect(() => {
    async function fetchAiInsights() {
      try {
        const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
        if (!apiKey) {
          setAiInsights("• Switch to net-metering to maximize your ROI.<br/><br/>• Use heavy appliances during peak sun hours (10 AM - 3 PM).<br/>• Your system will offset approximately 5 tons of CO2 annually.");
          setLoadingAi(false);
          return;
        }
        const genAI = new GoogleGenAI({ apiKey });
        const prompt = `
          As a solar expert in Pakistan, provide 3 concise, high-impact bullet points for this user:
          - Name: ${data.details?.name}
          - System: ${systemSizeKW}kW with ${panelCount} panels
          - Load: ${totalLoad}W (includes EV status: ${data.evInfo.status})
          - Backup: ${data.backupPreference}
          Focus on appliance management, net metering benefits, and environmental impact.
        `;
        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        setAiInsights(response.text || "• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
      } catch (error) {
        setAiInsights("• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
      } finally {
        setLoadingAi(false);
      }
    }
    fetchAiInsights();
  }, [data, systemSizeKW, panelCount, totalLoad]);

  return (
    <div className={cn(
      "h-screen p-4 md:p-6 pt-20 flex flex-col overflow-hidden transition-all duration-700",
      isDark ? "bg-[#050a14] text-white" : "bg-solar-navy text-solar-text"
    )}>
      <div className="max-w-[1800px] mx-auto w-full flex-1 flex flex-col gap-6 min-h-0">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 px-4">
          <div className="pl-16 md:pl-28 flex flex-col gap-0.5 transition-all">
            <div className="flex items-center gap-3">
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-4xl font-display font-black tracking-tighter"
              >
                System Blueprint
              </motion.h1>
              <div className="px-2.5 py-1 rounded-lg bg-solar-electric/10 text-solar-electric text-[10px] font-black uppercase tracking-widest border border-solar-electric/20">
                AI OPTIMIZED
              </div>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs font-bold opacity-30">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {data.details?.name}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {data.details?.address || 'Site A102'}</span>
            </div>
          </div>
          <div className="flex gap-3 md:pr-16 transition-all duration-700">
            <button className={cn(
              "px-5 py-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-widest rounded-2xl border transition-all",
              isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/10 hover:bg-black/10"
            )}>
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="btn-primary px-8 py-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-solar-electric/20">
              <Download className="w-4 h-4" /> Export Proposal
            </button>
          </div>
        </header>

        {/* 3-Column Layout Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 overflow-y-auto md:overflow-hidden p-2">

          {/* COLUMN 1: System Metrics (25%) */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2 px-4">Core Architecture</h3>
            <div className="flex-1 flex flex-col gap-4">
              <ModernSpecItem
                icon={Sun}
                label="Solar Capacity"
                value={`${systemSizeKW}`}
                unit="kW PV"
                subtext={`Using ${panelCount}x 550W Panels`}
                isDark={isDark}
              />
              <ModernSpecItem
                icon={Battery}
                label="Storage Cluster"
                value={`${batteryKWh.toFixed(1)}`}
                unit="kWh"
                subtext={`Lithium-ion LFP Battery`}
                isDark={isDark}
              />
              <ModernSpecItem
                icon={Zap}
                label="Inverter Matrix"
                value={`${systemSizeKW}`}
                unit="kW"
                subtext="Phase-Synchronized Pure Sine"
                isDark={isDark}
              />
              <div className={cn(
                "mt-auto p-6 rounded-[2rem] border flex flex-col gap-4",
                isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
              )}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider opacity-40">Grid Independence</div>
                    <div className="text-xl font-display font-black">94.8%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: SolarNest 3D View (50%) */}
          <div className="md:col-span-6 relative flex flex-col">
            <div className={cn(
              "flex-1 relative rounded-[3rem] overflow-hidden border shadow-3xl",
              isDark ? "bg-[#0a0f18] border-white/5" : "bg-white border-black/5 shadow-2xl"
            )}>
              <div className="absolute inset-0 z-0">
                <SolarHouse3D appliances={data.appliances} evInfo={data.evInfo} isDark={isDark} />
              </div>


            </div>
          </div>

          {/* COLUMN 3: Summary & AI (25%) */}
          <div className="md:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2 px-4">Efficiency Report</h3>

            {/* System Breakdown */}
            <DashboardCard title="System Summary" icon={Cpu} isDark={isDark}>
              <div className="grid grid-cols-2 gap-3">
                <SummaryStat label="Net Load" value={`${totalLoad}W`} isDark={isDark} />
                <SummaryStat label="Backup" value={`${data.backupPreference}`} isDark={isDark} />
                <SummaryStat label="EV Status" value={data.evInfo.status} isDark={isDark} />
                <SummaryStat label="Panels" value={`${panelCount} Un.`} isDark={isDark} />
              </div>
            </DashboardCard>

            {/* AI Insights */}
            <DashboardCard title="AI Intelligence" icon={TrendingUp} isDark={isDark}>
              <div className="text-xs leading-relaxed opacity-60 font-medium">
                {loadingAi ? (
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-solar-electric" />
                    Analyzing load profiles...
                  </div>
                ) : <Markdown>{aiInsights}</Markdown>}
              </div>
            </DashboardCard>

            {/* Stability Index */}
            <DashboardCard title="Market Volatility" icon={TrendingUp} isDark={isDark}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Inflation Shield</span>
                <span className="text-xs font-black text-green-500">8.4 / 10</span>
              </div>
              <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-green-500 rounded-full"
                />
              </div>
              <p className="text-[9px] mt-2 leading-tight opacity-40 italic">
                Solar provides 84% more cost stability than grid-only over a 10-year period.
              </p>
            </DashboardCard>

            {/* Next Action */}
            <div className={cn(
              "mt-auto p-6 rounded-[2.5rem] border flex flex-col gap-4",
              isDark ? "bg-solar-electric/10 border-solar-electric/20" : "bg-solar-electric/5 border-solar-electric/10"
            )}>
              <div className="text-xs font-black uppercase tracking-wider text-solar-electric flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> Recommended Action
              </div>
              <p className="text-[11px] font-medium opacity-60 leading-relaxed">
                Schedule a site survey to finalize structural mounting points and wiring routes.
              </p>
              <button className="w-full py-4 bg-solar-electric text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-solar-electric/20">
                Book Engineering Survey
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ModernSpecItem({ icon: Icon, label, value, unit, subtext, isDark }: any) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "p-6 rounded-[2.5rem] border transition-all hover:-translate-y-1 duration-300",
        isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-white border-black/5 shadow-xl hover:shadow-2xl"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          isDark ? "bg-solar-electric/20" : "bg-solar-electric/10"
        )}>
          <Icon className="w-6 h-6 text-solar-electric" />
        </div>
      </div>
      <div>
        <p className={cn(
          "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
          isDark ? "text-white/30" : "text-solar-text/40"
        )}>{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-display font-black tracking-tighter">{value}</span>
          <span className="text-sm font-black text-solar-electric">{unit}</span>
        </div>
        <p className={cn(
          "text-[10px] font-bold mt-2",
          isDark ? "text-white/30" : "text-solar-text/40"
        )}>{subtext}</p>
      </div>
    </motion.div>
  );
}

function DashboardCard({ title, icon: Icon, children, isDark }: any) {
  return (
    <div className={cn(
      "p-6 rounded-[2.5rem] border",
      isDark ? "bg-white/5 border-white/5" : "bg-white border-black/5 shadow-sm"
    )}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-4 h-4 text-solar-electric" />
        <h4 className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          isDark ? "text-white/40" : "text-solar-text/50"
        )}>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function SummaryStat({ label, value, isDark }: any) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={cn(
        "text-[9px] font-black uppercase tracking-tighter",
        isDark ? "text-white/30" : "text-solar-text/40"
      )}>{label}</span>
      <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">{value}</span>
    </div>
  );
}
