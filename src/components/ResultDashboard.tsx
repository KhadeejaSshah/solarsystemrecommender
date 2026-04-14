// import { useState, useEffect } from 'react';
// import { motion } from 'motion/react';
// import { UserData, PAKISTAN_CONSTANTS } from '../types';
// import { 
//   Sun,
//   Zap, 
//   Battery, 
//   TrendingDown, 
//   Leaf, 
//   Download, 
//   Share2, 
//   Cpu,
//   ChevronRight,
//   User,
//   MapPin
// } from 'lucide-react';
// import { GoogleGenAI } from "@google/genai";
// import HouseVisual from './HouseVisual';
// import Markdown from 'react-markdown';
// import { cn } from '../lib/utils';

// interface ResultDashboardProps {
//   data: UserData;
// }

// export default function ResultDashboard({ data }: ResultDashboardProps) {
//   const [aiInsights, setAiInsights] = useState<string>('');
//   const [loadingAi, setLoadingAi] = useState(true);
//   const [isDark, setIsDark] = useState(true);

//   useEffect(() => {
//     setIsDark(!document.documentElement.classList.contains('light'));
    
//     // Listen for theme changes
//     const observer = new MutationObserver(() => {
//       setIsDark(!document.documentElement.classList.contains('light'));
//     });
//     observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
//     return () => observer.disconnect();
//   }, []);

//   // Simplified calculations for the dashboard
//   const totalWattage = data.appliances.reduce((acc, app) => acc + (app.wattage * app.quantity), 0);
//   const evLoad = data.evInfo.status !== 'none' ? (data.evInfo.batterySize || 40) * 1000 : 0;
//   const totalLoad = totalWattage + (evLoad / 10); // Amortized EV load for daily sizing
  
//   const systemSizeKW = Math.ceil((totalLoad * 1.2) / 1000); // 20% buffer
//   const panelCount = Math.ceil((systemSizeKW * 1000) / 550); // 550W panels
//   const batteryKWh = data.backupPreference === 'full' ? systemSizeKW * 2 : typeof data.backupPreference === 'number' ? systemSizeKW * (data.backupPreference / 4) : systemSizeKW;
  
//   const estimatedCost = systemSizeKW * 180000; // ~180k PKR per kW
//   const monthlySavings = (systemSizeKW * 5 * 30) * PAKISTAN_CONSTANTS.TARIFF_RATE;
//   const paybackYears = (estimatedCost / (monthlySavings * 12)).toFixed(1);

//   useEffect(() => {
//     async function fetchAiInsights() {
//       try {
//         const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

//         const prompt = `
//           As a solar expert in Pakistan, provide 3 concise, high-impact bullet points for this user:
//           - Name: ${data.details?.name}
//           - System: ${systemSizeKW}kW with ${panelCount} panels
//           - Load: ${totalLoad}W (includes EV status: ${data.evInfo.status})
//           - Backup: ${data.backupPreference}
          
//           Focus on:
//           1. Specific appliance/EV management.
//           2. Net metering benefits in PKR.
//           3. Environmental impact.
//           Keep it professional and encouraging.
//         `;

//         const response = await genAI.models.generateContent({
//           model: "gemini-3-flash-preview",
//           contents: prompt,
//         });
        
//         setAiInsights(response.text || "• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
//       } catch (error) {
//         console.error("AI Insight Error:", error);
//         setAiInsights("• Switch to net-metering to maximize your ROI.\n• Use heavy appliances during peak sun hours (10 AM - 3 PM).\n• Your system will offset approximately 5 tons of CO2 annually.");
//       } finally {
//         setLoadingAi(false);
//       }
//     }

//     fetchAiInsights();
//   }, [data]);

//   return (
//     <div className="h-screen p-4 md:p-6 pt-20 flex flex-col overflow-hidden transition-colors duration-500 bg-solar-navy text-solar-text">
//       <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-4 min-h-0">
        
//         {/* Header */}
//         <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
//           <div>
//             <motion.h1 
//               initial={{ x: -20, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               className="text-3xl font-display font-bold"
//             >
//               System Blueprint
//             </motion.h1>
//             <div className="flex items-center gap-4 mt-1 text-xs opacity-40">
//               <span className="flex items-center gap-1"><User className="w-3 h-3" /> {data.details?.name}</span>
//               <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.details?.address}</span>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <button className="px-3 py-1.5 flex items-center gap-2 text-xs rounded-xl border border-solar-border bg-solar-card hover:bg-solar-navy transition-all">
//               <Share2 className="w-3 h-3" /> Share
//             </button>
//             <button className="btn-primary px-4 py-1.5 flex items-center gap-2 text-xs">
//               <Download className="w-3 h-3" /> Download Proposal
//             </button>
//           </div>
//         </header>

//         {/* Main Curved Container */}
//         <div className="flex-1 grow-3 flex items-stretch gap-10 rounded-[2.5rem] bg-gradient-to-br from-solar-navy to-solar-card shadow-2xl overflow-hidden">
//           {/* Left: Live Simulation */}
//           <div className="relative grow-3 flex-1 flex flex-col justify-end items-center bg-solar-navy/80 rounded-l-[2.5rem] overflow-hidden">
//             {/* Stat Boxes Floating Over Video */}
//             <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-6 z-30 text-black ">
//               <SpecItem icon={Sun} label="PV Capacity" value={`${systemSizeKW} kW`} />
//               <SpecItem icon={Battery} label="Storage" value={`${batteryKWh.toFixed(1)} kWh`} />
//               <SpecItem icon={Zap} label="Inverter" value={`${systemSizeKW} kW`} />
//               {/* <SpecItem icon={Leaf} label="Eco Impact" value={
//                 <span className="flex items-center gap-1">
//                   {Array.from({ length: Math.max(1, Math.round(systemSizeKW * 1.5)) }).map((_, i) => (
//                     <Leaf key={i} className="w-3 h-3 text-green-600 inline" />
//                   ))}
//                   <span className="ml-1">{(systemSizeKW * 0.7).toFixed(1)} T</span>
//                 </span>
//               } /> */}
//             </div>
//             {/* Live Simulation Video */}
//             <div className="w-full h-full flex items-center justify-center">
//               <HouseVisual appliances={data.appliances} evInfo={data.evInfo} isDark={isDark} />
//             </div>

//             {/* Day/Night Toggle Overlay */}
//             <div className="absolute bottom-10 left-10 flex gap-2 z-40">
//               <button 
//                 onClick={() => setIsDark(true)}
//                 className={cn(
//                   "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
//                   isDark ? "bg-solar-orange text-white shadow-lg" : "bg-white/10 text-white/40 hover:bg-white/20"
//                 )}
//               >
//                 Night
//               </button>
//               <button 
//                 onClick={() => setIsDark(false)}
//                 className={cn(
//                   "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
//                   !isDark ? "bg-solar-orange text-white shadow-lg" : "bg-white/10 text-white/40 hover:bg-white/20"
//                 )}
//               >
//                 Day
//               </button>
//             </div>
//           </div>

//           {/* Right: Summary & Insights */}
//           <div className="flex-1 flex flex-col gap-4 justify-between p-8 bg-solar-card/80 rounded-r-[2.5rem] min-w-[350px]">
//             {/* System Summary */}
//             <div className="rounded-2xl bg-white/10 backdrop-blur-md shadow-lg p-5 mb-0">
//               <h2 className="text-xl font-bold mb-2">System Summary</h2>
//               <ul className="text-xs opacity-80 space-y-1">
//                 <li><b> ⚡ Load:</b> {totalLoad}W</li>
//                 <li><b> 🛡️ Backup:</b> {data.backupPreference}</li>
//                 <li><b> 🔌 EV:</b> {data.evInfo.status}</li>
//                 <li><b> ☀️ Panels:</b> {panelCount} x 550W</li>
//               </ul>
//             </div>
//             {/* AI Insights */}
//             <div className="rounded-2xl bg-white/10 backdrop-blur-md shadow-lg p-5 mb-0">
//               <h3 className="text-xs font-bold uppercase tracking-wider mb-1">AI Insights</h3>
//               <div className="text-sm leading-relaxed opacity-70">
//                 {loadingAi ? <div>Loading...</div> : <Markdown>{aiInsights}</Markdown>}
//               </div>
//             </div>
//             {/* Volatility */}
//             <div className="rounded-2xl bg-white/10 backdrop-blur-md shadow-lg p-5 mb-0">
//               <h3 className="text-sm font-bold uppercase tracking-wider mb-1">Volatility</h3>
//               <div className="flex items-center justify-between text-[10px]">
//                 <span className="opacity-60">Stability</span>
//                 <span className="font-bold text-green-500">8.4/10</span>
//               </div>
//               <div className="w-full h-1 bg-solar-text/5 rounded-full overflow-hidden mb-1">
//                 <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-solar-orange" />
//               </div>
//               <p className="text-xs leading-tight opacity-50">
//                 Solar provides 84% more cost stability than grid-only over 10 years.
//               </p>
//             </div>
//             {/* Next Steps */}
//             <div className="rounded-2xl bg-white/10 backdrop-blur-md shadow-lg p-5 mb-0 flex flex-col">
//               <h3 className="text-lg font-bold mb-2">Next Steps</h3>
//               <ol className="space-y-2 text-sm opacity-70 mb-4">
//                 <li>1. Review your AI-generated blueprint and technical specs.</li>
//                 <li>2. Get a detailed quotation based on current market rates.</li>
//                 <li>3. Schedule a free site survey with our expert engineers.</li>
//               </ol>
//               <button className="btn-primary w-full py-4 mt-auto">Book Free Site Visit</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SpecItem({ icon: Icon, label, value }: any) {
//   return (
//     <div className="min-w-[120px] px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg flex flex-col items-start">
//       <div className="mb-1">
//         <Icon className="w-5 h-5 text-solar-electric" />
//       </div>
//       <div>
//         <p className="text-[10px] uppercase tracking-wider opacity-60">{label}</p>
//         <p className="text-base font-bold">{value}</p>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserData, PAKISTAN_CONSTANTS } from '../types';
import { 
  Sun, Zap, Battery, TrendingDown, Leaf, Download, Share2, 
  Cpu, ChevronRight, User, MapPin, TrendingUp 
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

  // Configurable system values (interactive)
  const [pvSize, setPvSize] = useState(5);
  const [storageKwh, setStorageKwh] = useState(5.0);
  const [inverterSize, setInverterSize] = useState(5);

  // Derived values
  const totalWattage = data.appliances.reduce((acc, app) => acc + (app.wattage * app.quantity), 0);
  const evLoad = data.evInfo.status !== 'none' ? (data.evInfo.batterySize || 40) * 1000 : 0;
  const totalLoad = Math.round(totalWattage + (evLoad / 10));

  const panelCount = Math.ceil((pvSize * 1000) / 550);
  const estimatedAnnualProduction = Math.round(pvSize * 1450); // ~1450 kWh/kW/year average in Pakistan (adjust based on location)
  const monthlySavings = Math.round(estimatedAnnualProduction / 12 * PAKISTAN_CONSTANTS.TARIFF_RATE);
  const annualSavings = monthlySavings * 12;
  const estimatedCost = Math.round(pvSize * 180000 + storageKwh * 65000); // rough PKR pricing
  const paybackYears = (estimatedCost / annualSavings).toFixed(1);
  const lifetimeValue = Math.round(annualSavings * 25 * 0.85); // 25 years with degradation

  // Simulated live metrics
  const [currentProduction, setCurrentProduction] = useState(3.2); // kW
  const [batterySOC, setBatterySOC] = useState(72);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains('light'));
    const observer = new MutationObserver(() => {
      setIsDark(!document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // AI Insights (more personalized & quantitative)
  useEffect(() => {
    async function fetchAiInsights() {
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

        const prompt = `
          As a solar expert in Pakistan, provide 4 concise, actionable bullet points for this homeowner:
          - Name: ${data.details?.name || 'Homeowner'}
          - Recommended System: ${pvSize}kW PV, ${storageKwh}kWh storage, ${inverterSize}kW inverter
          - Total Load: ~${totalLoad}W (EV: ${data.evInfo.status})
          - Annual Production Estimate: ~${estimatedAnnualProduction} kWh
          
          Focus on:
          1. Optimizing self-consumption (appliance / EV timing)
          2. Net metering / bill savings in PKR
          3. Environmental impact (CO₂ offset)
          4. One smart tip for maximum ROI
          Keep tone professional, encouraging, and specific.
        `;

        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        
        setAiInsights(response.text || 
          `• Shift heavy appliances and EV charging to 10 AM–3 PM to increase self-consumption by up to 25%.\n` +
          `• With net-metering, you could save approximately ₨${Math.round(monthlySavings * 1.2)} per month on your bill.\n` +
          `• This system will offset roughly ${Math.round(pvSize * 0.75)} tons of CO₂ annually — equivalent to planting ${Math.round(pvSize * 18)} trees.\n` +
          `• Consider adding a smart energy monitor for real-time optimization.`
        );
      } catch (error) {
        console.error("AI Insight Error:", error);
        setAiInsights(`• Shift heavy appliances and EV charging to peak sun hours (10 AM–3 PM).\n• Expected monthly savings: ~₨${monthlySavings} with net-metering.\n• Annual CO₂ offset: ~${(pvSize * 0.75).toFixed(1)} tons.\n• Your system provides strong protection against future tariff hikes.`);
      } finally {
        setLoadingAi(false);
      }
    }

    fetchAiInsights();
  }, [data, pvSize, storageKwh, inverterSize]);

  // Simulate live production changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProduction(Math.max(0.5, pvSize * (0.6 + Math.random() * 0.4)));
      setBatterySOC(Math.max(20, Math.min(95, batterySOC + (Math.random() * 4 - 2))));
    }, 8000);
    return () => clearInterval(interval);
  }, [pvSize, batterySOC]);

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
              System Blueprint
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
              <Download className="w-4 h-4" /> Download Full Proposal (PDF)
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 rounded-[2.5rem] bg-gradient-to-br from-solar-navy to-solar-card shadow-2xl overflow-hidden">
          
          {/* Left: Interactive Visual + Controls */}
          <div className="flex-1 relative flex flex-col bg-solar-navy/90 rounded-l-[2.5rem] overflow-hidden">
            
            {/* Configurator Controls */}
            <div className="absolute top-6 left-6 z-40 bg-white/10 backdrop-blur-lg rounded-2xl p-5 shadow-xl border border-white/10 w-80">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Cpu className="w-4 h-4" /> Customize System</h3>
              
              <div className="space-y-5 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>PV Capacity</span>
                    <span className="font-mono font-bold">{pvSize} kW</span>
                  </div>
                  <input 
                    type="range" min="3" max="12" step="0.5" 
                    value={pvSize} 
                    onChange={(e) => setPvSize(parseFloat(e.target.value))} 
                    className="w-full accent-solar-orange"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Battery Storage</span>
                    <span className="font-mono font-bold">{storageKwh} kWh</span>
                  </div>
                  <input 
                    type="range" min="2" max="15" step="0.5" 
                    value={storageKwh} 
                    onChange={(e) => setStorageKwh(parseFloat(e.target.value))} 
                    className="w-full accent-solar-orange"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Inverter Size</span>
                    <span className="font-mono font-bold">{inverterSize} kW</span>
                  </div>
                  <input 
                    type="range" min="3" max="12" step="0.5" 
                    value={inverterSize} 
                    onChange={(e) => setInverterSize(parseFloat(e.target.value))} 
                    className="w-full accent-solar-orange"
                  />
                </div>
              </div>
            </div>

            {/* House Visual */}
            <div className="flex-1 flex items-center justify-center relative">
              <HouseVisual 
                appliances={data.appliances} 
                evInfo={data.evInfo} 
                isDark={isDark}
                pvSize={pvSize}
                storageKwh={storageKwh}
                // Pass more props here if you enhance HouseVisual
              />
            </div>

            {/* Live Status Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-3 flex items-center gap-8 text-xs z-40 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Solar Harvesting Active</span>
              </div>
              <div>Producing: <span className="font-mono font-bold">{currentProduction.toFixed(1)} kW</span></div>
              <div>Battery: <span className="font-mono font-bold">{batterySOC}%</span></div>
              <div className="text-solar-orange">Grid: Exporting</div>
            </div>

            {/* Day/Night Toggle */}
            <div className="absolute bottom-6 right-6 flex gap-2 z-40">
              <button onClick={() => setIsDark(true)} className={cn("px-5 py-2 rounded-full text-xs font-bold tracking-widest", isDark ? "bg-solar-orange text-white" : "bg-white/10 text-white/60")}>NIGHT</button>
              <button onClick={() => setIsDark(false)} className={cn("px-5 py-2 rounded-full text-xs font-bold tracking-widest", !isDark ? "bg-solar-orange text-white" : "bg-white/10 text-white/60")}>DAY</button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-96 flex flex-col gap-4 p-8 bg-solar-card/90 overflow-y-auto rounded-r-[2.5rem]">
            
            {/* System Summary */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h2 className="text-xl font-bold mb-4">System Summary</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div><span className="opacity-60">Peak Load</span><br /><b>{totalLoad} W</b></div>
                <div><span className="opacity-60">PV Capacity</span><br /><b>{pvSize} kW ({panelCount} panels)</b></div>
                <div><span className="opacity-60">Storage</span><br /><b>{storageKwh} kWh</b></div>
                <div><span className="opacity-60">Inverter</span><br /><b>{inverterSize} kW</b></div>
                <div><span className="opacity-60">Est. Annual Production</span><br /><b>{estimatedAnnualProduction} kWh</b></div>
                <div><span className="opacity-60">Backup Duration</span><br /><b>~4–6 hrs (critical load)</b></div>
              </div>
            </div>

            {/* Financial Snapshot */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400" /> Financials</h3>
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
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h3 className="uppercase text-xs tracking-widest font-bold mb-3">AI Insights</h3>
              <div className="text-sm leading-relaxed opacity-80">
                {loadingAi ? "Generating personalized insights..." : <Markdown>{aiInsights}</Markdown>}
              </div>
            </div>

            {/* Volatility / Stability */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Cost Stability</h3>
              <div className="flex justify-between text-xs mb-2">
                <span>Solar + Storage vs Grid</span>
                <span className="font-bold text-green-500">8.7/10</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }} 
                  animate={{ width: "87%" }} 
                  className="h-full bg-gradient-to-r from-solar-orange to-green-400" 
                />
              </div>
              <p className="text-xs mt-3 opacity-60">
                Provides 87% more protection against electricity price hikes over 10 years.
              </p>
            </div>

            {/* Next Steps */}
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md mt-auto">
              <h3 className="text-lg font-bold mb-4">Next Steps</h3>
              <ol className="space-y-3 text-sm opacity-80">
                <li className="flex gap-3"><span className="font-mono text-solar-orange">1</span> Review and fine-tune this configuration</li>
                <li className="flex gap-3"><span className="font-mono text-solar-orange">2</span> Download detailed proposal with full financial model</li>
                <li className="flex gap-3"><span className="font-mono text-solar-orange">3</span> Book a free site survey for shading analysis &amp; final quote</li>
              </ol>
              <button className="btn-primary w-full py-4 mt-6 text-base font-semibold">Book Free Site Visit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}