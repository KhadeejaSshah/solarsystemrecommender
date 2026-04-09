import { useState, useEffect } from 'react';
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

interface ResultDashboardProps {
  data: UserData;
}

export default function ResultDashboard({ data }: ResultDashboardProps) {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(true);

  // Simplified calculations for the dashboard
  const totalWattage = data.appliances.reduce((acc, app) => acc + (app.wattage * app.quantity), 0);
  const evLoad = (data.evInfo.hasCar ? 7000 : 0) + (data.evInfo.hasBike ? 1000 : 0);
  const totalLoad = totalWattage + evLoad;
  
  const systemSizeKW = Math.ceil((totalLoad * 1.2) / 1000); // 20% buffer
  const panelCount = Math.ceil((systemSizeKW * 1000) / 550); // 550W panels
  const batteryKWh = data.backupPreference === 'full' ? systemSizeKW * 2 : data.backupPreference === '4h' ? systemSizeKW : systemSizeKW * 0.5;
  
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
          - Load: ${totalLoad}W (includes ${data.evInfo.hasCar ? `EV Car: ${data.evInfo.carModel}` : ''} ${data.evInfo.hasBike ? `EV Bike: ${data.evInfo.bikeModel}` : ''})
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
                <SpecItem icon={Zap} label="System Capacity" value={`${systemSizeKW} kW`} />
                <SpecItem icon={Cpu} label="Solar Panels" value={`${panelCount} x 550W`} />
                <SpecItem icon={Battery} label="Storage" value={`${batteryKWh.toFixed(1)} kWh`} />
                <SpecItem icon={TrendingDown} label="Payback" value={`${paybackYears} Years`} />
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Leaf className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Eco Impact</span>
                </div>
                <p className="text-2xl font-display font-bold">{(systemSizeKW * 0.7).toFixed(1)} Tons</p>
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
                  Rs. {(estimatedCost / 100000).toFixed(1)}<span className="text-xl ml-1">Lakh</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Monthly Savings</p>
                  <p className="text-lg font-bold">Rs. {Math.round(monthlySavings / 1000)}k</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Annual ROI</p>
                  <p className="text-lg font-bold text-green-400">~{Math.round((monthlySavings * 12 / estimatedCost) * 100)}%</p>
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
