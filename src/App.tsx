// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Sun, Moon, Zap, BarChart3, Globe, Leaf, 
//   TrendingDown, Wallet, FileText, Settings2, 
//   RefreshCcw, ChevronRight, CheckCircle2, Battery, 
//   CloudSun, Activity, Wind, Utensils, Tv, Plus, Minus
// } from 'lucide-react';

// // Components
// import PlanningPanel from './components/PlanningPanel';
// import EnergyHub from './components/EnergyHub';
// import SolarHouse3D from './components/SolarHouse/SolarHouse3D';

// // Config & Types
// import { Appliance } from './types';
// import { UI_NAME_TO_ID } from './config/applianceConfigs';
// import { cn } from './lib/utils';

// const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// // Categories for the Journey
// const CATEGORIES = [
//   { id: 'climate', name: 'Climate', icon: Wind, items: ['Air Conditioner', 'Ceiling Fan'] },
//   { id: 'kitchen', name: 'Kitchen', icon: Utensils, items: ['Refrigerator', 'Microwave Oven', 'Water Motor'] },
//   { id: 'tech', name: 'Tech', icon: Tv, items: ['LED TV', 'LED Lights'] },
//   { id: 'ev', name: 'Mobility', icon: Zap, items: ['EV Car', 'Electric Bike'] }
// ];

// export default function App() {
//   const [theme, setTheme] = useState<'dark' | 'light'>('dark');
//   const isDark = theme === 'dark';

//   const [interactionLevel, setInteractionLevel] = useState<'initial' | 'bill-uploaded' | 'appliances-selected'>('initial');
//   const [isScanning, setIsScanning] = useState(false);
//   const [billUnits, setBillUnits] = useState(0);
//   const [userData, setUserData] = useState({ name: '', city: '' });
//   const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
//   const [applianceJourneyActive, setApplianceJourneyActive] = useState(false);
//   const [specs, setSpecs] = useState<any>({
//     solarKw: 0, storageKwh: 0, inverterKw: 0, packageId: 'lite',
//     gridImpact: 0, carbonOffset: 0, monthlySavings: 0
//   });

//   const fetchSystemSpecs = async (units: number, apps: Appliance[]) => {
//     try {
//       const res = await fetch(`${API_BASE}/calculate`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ units, appliances: apps }),
//       });
//       if (res.ok) setSpecs(await res.json());
//     } catch (e) { console.error(e); }
//   };

//   const handleFileUpload = async (file: File) => {
//     setIsScanning(true);
//     const formData = new FormData();
//     formData.append('file', file);
//     try {
//       const response = await fetch(`${API_BASE}/upload-bill`, { method: 'POST', body: formData });
//       const result = await response.json();
//       if (result.success) {
//         setBillUnits(Number(result.data.units_consumed) || 0);
//         setUserData({ name: result.data.consumer_name || 'Customer', city: result.data.location || 'Islamabad' });
//         setInteractionLevel('bill-uploaded');
//         fetchSystemSpecs(Number(result.data.units_consumed), []);
//       }
//     } finally { setIsScanning(false); }
//   };

//   const toggleAppliance = (name: string) => {
//     const techId = UI_NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, '-');
//     setSelectedAppliances(prev => {
//       const exists = prev.find(a => a.id === techId);
//       const newSelection = exists ? prev.filter(a => a.id !== techId) : 
//         [...prev, { id: techId, name, wattage: 500, quantity: 1, icon: 'zap' }];
//       fetchSystemSpecs(billUnits, newSelection);
//       return newSelection;
//     });
//     if (interactionLevel === 'bill-uploaded') setInteractionLevel('appliances-selected');
//   };

//   const startOver = () => {
//     setInteractionLevel('initial');
//     setBillUnits(0);
//     setUserData({ name: '', city: '' });
//     setSelectedAppliances([]);
//     setApplianceJourneyActive(false);
//     setSpecs({ solarKw: 0, storageKwh: 0, inverterKw: 0, packageId: 'lite', gridImpact: 0, carbonOffset: 0, monthlySavings: 0 });
//   };

//   useEffect(() => {
//     document.documentElement.classList.toggle('light', theme === 'light');
//   }, [theme]);

//   return (
//     <div className={cn("h-screen w-full overflow-hidden font-sans relative transition-colors duration-700", isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900")}>

//       {/* LAYER 1: 3D BACKDROP */}
//       <div className="absolute inset-0 z-0">
//         <SolarHouse3D 
//           appliances={selectedAppliances} 
//           evInfo={{ status: selectedAppliances.some(a => a.name === 'EV Car') ? 'own' : 'none' }} 
//           isDark={isDark} 
//         />
//       </div>

//       {/* LAYER 2: TOP SPECS */}
//       <AnimatePresence>
//         {specs.solarKw > 0 && (
//           <motion.div 
//             initial={{ y: -100, x: '-50%', opacity: 0 }}
//             animate={{ y: 24, x: '0%', opacity: 1 }}
//             className={cn(
//               "absolute left-[calc(420px+(100%-420px)/2)] z-50 px-8 py-4 rounded-[2rem] border backdrop-blur-2xl shadow-2xl flex items-center gap-8 pointer-events-auto",
//               isDark ? "bg-slate-900/60 border-white/10" : "bg-white/70 border-black/5"
//             )}
//           >
//             <QuickStat icon={Sun} label="PV SIZE" value={`${specs.solarKw.toFixed(1)} kW`} color="text-solar-gold" />
//             <QuickStat icon={Battery} label="BATTERY" value={`${specs.storageKwh.toFixed(1)} kWh`} color="text-solar-emerald" />
//             <QuickStat icon={Zap} label="INVERTER" value={`${specs.inverterKw.toFixed(1)} kW`} color="text-solar-electric" />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* COMPANY LOGO OVERLAY */}
//       <div className="absolute top-6 left-[450px] z-40 pointer-events-auto">
//         <img src="/logofull.png" alt="Logo" className="h-10" />
//       </div>

//       <div className="absolute top-6 right-8 z-40 pointer-events-auto">
//         <button 
//           onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
//           className={cn("p-2 rounded-xl transition-all", isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5")}
//         >
//           {isDark ? <Sun size={18} className="text-solar-gold" /> : <Moon size={18} className="text-solar-electric" />}
//         </button>
//       </div>

//       {/* LAYER 3: UI OVERLAY */}
//       <div className="relative z-10 h-full w-full flex pointer-events-none">

//         <aside className={cn(
//           "w-[420px] h-full border-r backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto transition-all duration-500",
//           isDark ? "bg-slate-950/60 border-white/5" : "bg-white/95 border-black/5"
//         )}>
//           {/* Sidebar Padding for Logo space */}
//           <div className="h-24" />

//           <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar space-y-6">
//             <AnimatePresence mode="wait">
//               {interactionLevel === 'initial' ? (
//                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="p1">
//                   <PlanningPanel 
//                      interactionLevel={interactionLevel}
//                      onFileUpload={handleFileUpload}
//                      isScanning={isScanning}
//                      userData={userData}
//                      appliances={selectedAppliances}
//                      onApplianceToggle={toggleAppliance}
//                   />
//                 </motion.div>
//               ) : (
//                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
//                   {/* User Card */}
//                   <div className={cn("p-6 rounded-[2rem] border", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
//                     <div className="flex items-center justify-between">
//                        <div className="flex items-center gap-4">
//                           <div className="w-12 h-12 rounded-2xl bg-solar-emerald/20 flex items-center justify-center text-solar-emerald">
//                              <FileText size={24} />
//                           </div>
//                           <div>
//                              <h3 className="font-black text-lg">{userData.name}</h3>
//                              <p className="text-[10px] uppercase font-black opacity-40">{userData.city} • {billUnits} Units</p>
//                           </div>
//                        </div>
//                        <button onClick={startOver} className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400"><RefreshCcw size={16}/></button>
//                     </div>
//                   </div>

//                   {/* APPLIANCE JOURNEY (LOAD BUILDER) */}
//                   <div className="space-y-3">
//                     <button 
//                       onClick={() => setApplianceJourneyActive(!applianceJourneyActive)}
//                       className={cn("w-full p-4 rounded-2xl border flex items-center justify-between transition-all", 
//                         applianceJourneyActive ? "bg-solar-emerald text-black" : (isDark ? "bg-white/5" : "bg-slate-100"))}
//                     >
//                       <div className="flex items-center gap-3">
//                         <Settings2 size={16} />
//                         <span className="text-xs font-black uppercase tracking-tight">Configure Appliances</span>
//                       </div>
//                       {applianceJourneyActive ? <Minus size={16}/> : <Plus size={16}/>}
//                     </button>

//                     {applianceJourneyActive && (
//                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4">
//                         {CATEGORIES.map(cat => (
//                           <div key={cat.id} className="space-y-2">
//                             <div className="flex items-center gap-2 px-1 opacity-40">
//                               <cat.icon size={12} />
//                               <span className="text-[9px] font-black uppercase">{cat.name}</span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-2">
//                               {cat.items.map(item => (
//                                 <button key={item} onClick={() => toggleAppliance(item)} className={cn(
//                                   "p-3 rounded-xl border text-[10px] font-bold transition-all text-left flex items-center justify-between",
//                                   selectedAppliances.some(a => a.name === item) 
//                                     ? "bg-solar-emerald/10 border-solar-emerald text-solar-emerald" 
//                                     : (isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200")
//                                 )}>
//                                   {item}
//                                   {selectedAppliances.some(a => a.name === item) && <CheckCircle2 size={12} />}
//                                 </button>
//                               ))}
//                             </div>
//                           </div>
//                         ))}
//                       </motion.div>
//                     )}
//                   </div>

//                   {/* GRAPHS WITH LABELS */}
//                   <div className="space-y-6">
//                     <ChartSection title="Solar Harvest" icon={CloudSun} isDark={isDark}>
//                       <SunlightGraph isDark={isDark} />
//                     </ChartSection>

//                     <ChartSection title="Energy Experience" icon={Activity} isDark={isDark}>
//                       <EnergyExperienceGraph isDark={isDark} />
//                     </ChartSection>
//                   </div>

//                   <EnergyHub interactionLevel={interactionLevel} specs={specs} isDark={isDark} />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </aside>

//         {/* BOTTOM IMPACT */}
//         <AnimatePresence>
//           {specs.solarKw > 0 && (
//             <motion.div initial={{ y: 100 }} animate={{ y: -40 }} className="absolute bottom-0 left-[440px] right-8 pointer-events-auto flex justify-center">
//               <div className={cn("px-12 py-6 rounded-[3rem] border backdrop-blur-3xl flex gap-16 shadow-2xl", isDark ? "bg-slate-900/80 border-white/10" : "bg-white/90 border-black/5")}>
//                  <StatMini label="Savings" value={`${specs.gridImpact?.toFixed(0)}%`} icon={TrendingDown} color="text-solar-emerald" isDark={isDark} />
//                  <StatMini label="Carbon" value={`${specs.carbonOffset?.toFixed(1)}T`} icon={Leaf} color="text-solar-electric" isDark={isDark} />
//                  <StatMini label="Monthly" value={`Rs.${(specs.monthlySavings / 1000).toFixed(0)}k`} icon={Wallet} color={isDark ? "text-white" : "text-slate-900"} isDark={isDark} />
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

// // --- VISUAL COMPONENTS ---

// function ChartSection({ title, icon: Icon, children, isDark }: any) {
//   return (
//     <div className="space-y-3">
//       <div className="flex items-center gap-2 px-1 opacity-60">
//         <Icon size={14} className="text-solar-emerald" />
//         <h4 className="text-[10px] font-black uppercase tracking-widest">{title}</h4>
//       </div>
//       <div className={cn("h-40 w-full rounded-[2rem] border p-6 relative flex flex-col", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200 shadow-inner")}>
//         {children}
//       </div>
//     </div>
//   );
// }

// function SunlightGraph({ isDark }: { isDark: boolean }) {
//   return (
//     <div className="h-full w-full flex flex-col">
//       <div className="flex-1 relative flex">
//         {/* Y-Axis */}
//         <div className="flex flex-col justify-between text-[7px] font-black opacity-30 pr-2 border-r border-current border-opacity-5">
//           <span>100%</span><span>50%</span><span>0%</span>
//         </div>
//         {/* Graph */}
//         <svg className="flex-1 h-full pl-2" viewBox="0 0 100 40" preserveAspectRatio="none">
//           <path d="M 0,40 Q 50,0 100,40" fill={isDark ? "rgba(251,191,36,0.1)" : "rgba(251,191,36,0.05)"} stroke="#fbbf24" strokeWidth="2" />
//         </svg>
//       </div>
//       {/* X-Axis */}
//       <div className="flex justify-between pl-8 mt-2 border-t border-current border-opacity-5 pt-1 text-[8px] font-black opacity-30 uppercase">
//         <span>6 AM</span><span>12 PM</span><span>6 PM</span>
//       </div>
//     </div>
//   );
// }

// function EnergyExperienceGraph({ isDark }: { isDark: boolean }) {
//   return (
//     <div className="h-full w-full flex flex-col">
//       <div className="flex-1 relative flex">
//         {/* Y-Axis */}
//         <div className="flex flex-col justify-between text-[7px] font-black opacity-30 pr-2 border-r border-current border-opacity-5">
//           <span>MAX</span><span>MID</span><span>0kW</span>
//         </div>
//         <svg className="flex-1 h-full pl-2 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
//           {/* Grid line */}
//           <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.1" opacity="0.1" />
//           {/* Solar curve */}
//           <path d="M 10,40 Q 50,10 90,40" fill="none" stroke="#10b981" strokeWidth="2" />
//           {/* Battery curve */}
//           <path d="M 0,20 L 30,20 C 45,20 50,5 65,5 L 85,5 C 95,5 100,20 100,35" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 2" />
//         </svg>
//       </div>
//       <div className="flex justify-between pl-8 mt-2 border-t border-current border-opacity-5 pt-1 text-[8px] font-black opacity-30 uppercase">
//         <span>Morning</span><span>Noon</span><span>Night</span>
//       </div>
//       <div className="flex gap-4 mt-2 pl-8 justify-center">
//         <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-solar-emerald"/><span className="text-[6px] font-bold opacity-50 uppercase">Solar</span></div>
//         <div className="flex items-center gap-1"><div className="w-2 h-0.5 border-t border-dashed border-blue-500"/><span className="text-[6px] font-bold opacity-50 uppercase">Storage</span></div>
//       </div>
//     </div>
//   );
// }

// function QuickStat({ icon: Icon, label, value, color }: any) {
//   return (
//     <div className="flex flex-col items-center gap-1">
//       <div className="flex items-center gap-2">
//         <Icon size={16} className={color} />
//         <span className="text-xl font-black tracking-tighter">{value}</span>
//       </div>
//       <span className="text-[9px] font-bold tracking-widest opacity-40 uppercase">{label}</span>
//     </div>
//   );
// }

// function StatMini({ label, value, icon: Icon, color, isDark }: any) {
//   return (
//     <div className="flex items-center gap-4">
//       <div className={cn("p-4 rounded-2xl", isDark ? "bg-white/5" : "bg-slate-100", color)}><Icon size={20} /></div>
//       <div>
//         <p className="text-[10px] font-black uppercase opacity-40 mb-1">{label}</p>
//         <p className={cn("text-2xl font-black tracking-tighter leading-none", color)}>{value}</p>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Zap, BarChart3, Globe, Leaf,
  TrendingDown, Wallet, FileText, Settings2,
  RefreshCcw, ChevronRight, CheckCircle2, Battery,
  CloudSun, Activity, Wind, Utensils, Tv, Plus, Minus,
  ArrowUpRight, TreeDeciduous
} from 'lucide-react';

// Components
import PlanningPanel from './components/PlanningPanel';
import EnergyHub from './components/EnergyHub';
import SolarHouse3D from './components/SolarHouse/SolarHouse3D';
import IntelligencePanel from './components/IntelligencePanel';

// Config & Types
import { Appliance } from './types';
import { UI_NAME_TO_ID } from './config/applianceConfigs';
import { cn } from './lib/utils';
import { Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const CATEGORIES = [
  { id: 'climate', name: 'Climate', icon: Wind, items: ['Air Conditioner', 'Ceiling Fan'] },
  { id: 'kitchen', name: 'Kitchen', icon: Utensils, items: ['Refrigerator', 'Microwave Oven', 'Water Motor'] },
  { id: 'tech', name: 'Tech', icon: Tv, items: ['LED TV', 'LED Lights'] },
  { id: 'ev', name: 'Mobility', icon: Zap, items: ['EV Car', 'Electric Bike'] }
];

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  const [interactionLevel, setInteractionLevel] = useState<'initial' | 'bill-uploaded' | 'appliances-selected'>('initial');
  const [isScanning, setIsScanning] = useState(false);
  const [billUnits, setBillUnits] = useState(0);
  const [userData, setUserData] = useState({ name: '', city: '' });
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [applianceJourneyActive, setApplianceJourneyActive] = useState(false);
  const [specs, setSpecs] = useState<any>({
    solarKw: 0, storageKwh: 0, inverterKw: 0, packageId: 'lite',
    gridImpact: 0, carbonOffset: 0, monthlySavings: 0
  });

  const fetchSystemSpecs = async (units: number, apps: Appliance[]) => {
    try {
      const res = await fetch(`${API_BASE}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units, appliances: apps }),
      });
      if (res.ok) setSpecs(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (file: File) => {
    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE}/upload-bill`, { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        setBillUnits(Number(result.data.units_consumed) || 0);
        setUserData({ name: result.data.consumer_name || 'Customer', city: result.data.location || 'Islamabad' });
        setInteractionLevel('bill-uploaded');
        fetchSystemSpecs(Number(result.data.units_consumed), []);
      }
    } finally { setIsScanning(false); }
  };

  const toggleAppliance = (name: string) => {
    const techId = UI_NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, '-');
    setSelectedAppliances(prev => {
      const exists = prev.find(a => a.id === techId);
      const newSelection = exists ? prev.filter(a => a.id !== techId) :
        [...prev, { id: techId, name, wattage: 500, quantity: 1, icon: 'zap' }];
      fetchSystemSpecs(billUnits, newSelection);
      return newSelection;
    });
    if (interactionLevel === 'bill-uploaded') setInteractionLevel('appliances-selected');
  };

  const startOver = () => {
    setInteractionLevel('initial');
    setBillUnits(0);
    setUserData({ name: '', city: '' });
    setSelectedAppliances([]);
    setApplianceJourneyActive(false);
    setSpecs({ solarKw: 0, storageKwh: 0, inverterKw: 0, packageId: 'lite', gridImpact: 0, carbonOffset: 0, monthlySavings: 0 });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return (
    <div className={cn("h-screen w-full overflow-hidden font-sans relative transition-colors duration-700", isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900")}>

      {/* 3D BACKDROP */}
      <div className="absolute inset-0 z-0">
        <SolarHouse3D
          appliances={selectedAppliances}
          evInfo={{ status: selectedAppliances.some(a => a.name === 'EV Car') ? 'own' : 'none' }}
          isDark={isDark}
        />
      </div>

      {/* TOP ACTIONS LAYER */}
      <div className="absolute top-6 left-[450px] right-8 z-40 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <img src="/logofull.png" alt="Logo" className="h-10" />
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <AnimatePresence>
            {interactionLevel !== 'initial' && (
              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-6 h-12 rounded-2xl bg-solar-emerald text-black font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Download className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Generate Proposal</span>
              </motion.button>
            )}
          </AnimatePresence>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-3 rounded-2xl border border-current/10 backdrop-blur-xl bg-[var(--card)]/30 transition-transform hover:scale-110 active:scale-90 shadow-lg">
            {isDark ? <Sun size={18} className="text-solar-gold" /> : <Moon size={18} className="text-solar-electric" />}
          </button>
        </div>
      </div>

      {/* SIDEBAR PANEL */}
      <div className="relative z-10 h-full w-full flex pointer-events-none">
        <aside className={cn(
          "w-[420px] h-full border-r backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto transition-all duration-500",
          isDark ? "bg-slate-950/70 border-white/5" : "bg-white/95 border-black/5"
        )}>

          <div className="h-24" /> {/* Spacer for Logo */}

          <div className="flex-1 overflow-hidden p-8 pt-0 space-y-6">
            <AnimatePresence mode="wait">
              {interactionLevel === 'initial' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="p1">
                  <PlanningPanel
                    interactionLevel={interactionLevel}
                    onFileUpload={handleFileUpload}
                    isScanning={isScanning}
                    userData={userData}
                    appliances={selectedAppliances}
                    onApplianceToggle={toggleAppliance}
                  />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                  {/* HERO POWER CARD (The Layout from your image) */}
                  <EnergyOverviewCard isDark={isDark} specs={specs} />

                  {/* APPLIANCE JOURNEY */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setApplianceJourneyActive(!applianceJourneyActive)}
                      className={cn("w-full p-5 rounded-[1.5rem] border flex items-center justify-between transition-all",
                        applianceJourneyActive ? "bg-solar-emerald text-black" : (isDark ? "bg-white/5 border-white/5" : "bg-slate-100 border-transparent"))}
                    >
                      <div className="flex items-center gap-3">
                        <Settings2 size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Load Builder</span>
                      </div>
                      {applianceJourneyActive ? <Minus size={16} /> : <Plus size={16} />}
                    </button>

                    {applianceJourneyActive && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4">
                        {CATEGORIES.map(cat => (
                          <div key={cat.id} className="space-y-2">
                            <span className="text-[9px] font-black uppercase opacity-40 px-2">{cat.name}</span>
                            <div className="grid grid-cols-2 gap-2">
                              {cat.items.map(item => (
                                <button key={item} onClick={() => toggleAppliance(item)} className={cn(
                                  "p-3 rounded-xl border text-[10px] font-bold transition-all text-left flex items-center justify-between",
                                  selectedAppliances.some(a => a.name === item)
                                    ? "bg-solar-emerald/10 border-solar-emerald text-solar-emerald"
                                    : (isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200")
                                )}>
                                  {item}
                                  {selectedAppliances.some(a => a.name === item) && <CheckCircle2 size={12} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <EnergyHub interactionLevel={interactionLevel} specs={specs} isDark={isDark} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* BOTTOM IMPACT BAR (RESTORED) */}
        <AnimatePresence>
          {specs.solarKw > 0 && (
            <motion.div initial={{ y: 100 }} animate={{ y: -40 }} className="absolute bottom-0 left-[calc(100px+(100%-100px)/2)] -translate-x-1/2 pointer-events-auto flex justify-center">
              <div className={cn("px-12 py-6 rounded-[3rem] border backdrop-blur-3xl flex gap-16 shadow-2xl", isDark ? "bg-slate-900/80 border-white/10" : "bg-white/90 border-black/5")}>
                <StatMini label="Grid Savings" value={`${specs.gridImpact?.toFixed(0)}%`} icon={TrendingDown} color="text-solar-emerald" isDark={isDark} />
                <StatMini label="Carbon Offset" value={`${specs.carbonOffset?.toFixed(1)}T`} icon={Leaf} color="text-solar-electric" isDark={isDark} />
                <StatMini label="Monthly ROI" value={`Rs.${(specs.monthlySavings / 1000).toFixed(0)}k`} icon={Wallet} color={isDark ? "text-white" : "text-slate-900"} isDark={isDark} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <IntelligencePanel isFormed={interactionLevel !== 'initial'} isDark={isDark} />
      </div>
    </div>
  );
}

// --- NEW COMPONENT: ENERGY OVERVIEW CARD (IMAGE LAYOUT) ---

// function EnergyOverviewCard({ isDark, specs }: any) {
//   // Generate random data for the bar chart
//   const bars = [40, 60, 45, 90, 65, 30, 40, 55, 80, 70, 45, 60, 40, 50, 90, 75, 40, 60, 30, 45, 55, 60, 40, 30];

//   return (
//     <div className={cn("p-8 rounded-[2.5rem] border shadow-2xl space-y-8", isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>

//       {/* 1. Header Hero */}
//       <div className="space-y-1">
//         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Power</p>
//         <div className="flex items-baseline gap-2">
//           <h2 className="text-4xl font-black tracking-tighter">{(specs.solarKw || 3.25).toFixed(2)}</h2>
//           <span className="text-xl font-black opacity-40 italic">kW</span>
//         </div>
//         <p className="text-xs font-bold opacity-60">House Usage</p>
//       </div>

//       {/* 2. Bar Chart Visualization */}
//       <div className="flex items-end justify-between h-24 gap-[2px]">
//         {bars.map((h, i) => (
//           <div 
//             key={i} 
//             className={cn("flex-1 rounded-t-sm transition-all duration-1000", i === 12 ? "bg-orange-500" : "bg-solar-gold/30")} 
//             style={{ height: `${h}%` }}
//           />
//         ))}
//       </div>

//       {/* 3. Small Stats Grid */}
//       <div className="grid grid-cols-3 gap-4 border-t border-current/5 pt-6">
//         <MiniMetric label="Next Hour" value="4.00 kW" />
//         <MiniMetric label="Grid Export" value="2.45 kW" />
//         <MiniMetric label="Battery" value="12.75 kW" />
//       </div>

//       {/* 4. Large Impact Footer */}
//       <div className="grid grid-cols-2 gap-8 border-t border-current/5 pt-6">
//         <div className="space-y-1">
//           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Earnings</p>
//           <p className="text-xl font-black tracking-tighter">Rs.{(specs.monthlySavings || 34578).toLocaleString()}</p>
//           <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Currency: PKR</p>
//         </div>
//         <div className="space-y-1 text-right">
//           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">CO₂ Offset</p>
//           <div className="flex items-center justify-end gap-2">
//              <p className="text-xl font-black tracking-tighter">{(specs.carbonOffset || 6.12).toFixed(2)} KG</p>
//           </div>
//           <p className="text-[9px] font-bold text-solar-emerald uppercase tracking-widest flex items-center justify-end gap-1">
//             <TreeDeciduous size={10} /> Equivalent to 20 Trees
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-8 border-t border-current/5 pt-6">
//         <div className="space-y-1">
//           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Earnings</p>
//           <p className="text-xl font-black tracking-tighter">Rs.{(specs.monthlySavings || 34578).toLocaleString()}</p>
//           <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Currency: PKR</p>
//         </div>
//         <div className="space-y-1 text-right">
//           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">CO₂ Offset</p>
//           <div className="flex items-center justify-end gap-2">
//              <p className="text-xl font-black tracking-tighter">{(specs.carbonOffset || 6.12).toFixed(2)} KG</p>
//           </div>
//           <p className="text-[9px] font-bold text-solar-emerald uppercase tracking-widest flex items-center justify-end gap-1">
//             <TreeDeciduous size={10} /> Equivalent to 20 Trees
//           </p>
//         </div>
//       </div>

//     </div>
//   );
// }

// ...existing code...
function EnergyOverviewCard({ isDark, specs }: any) {
  // Generate random data for the bar chart
  const bars = [40, 60, 45, 90, 65, 30, 40, 55, 80, 70, 45, 60, 40, 50, 90, 75, 40, 60, 30, 45, 55, 60, 40, 30];

  return (
    <div className={cn("p-8 rounded-[2.5rem] border shadow-2xl space-y-8", isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>

      {/* 1. Header Hero */}
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Power</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black tracking-tighter">{(specs.solarKw || 3.25).toFixed(2)}</h2>
          <span className="text-xl font-black opacity-40 italic">kW</span>
        </div>
        <p className="text-xs font-bold opacity-60">House Usage</p>
      </div>

      {/* 2. Bar Chart Visualization */}
      <div className="flex items-end justify-between h-24 gap-[2px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn("flex-1 rounded-t-sm transition-all duration-1000", i === 12 ? "bg-orange-500" : "bg-solar-gold/30")}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* 3. Small Stats Grid */}
      <div className="grid grid-cols-3 gap-4 border-t border-current/5 pt-6">
        <MiniMetric label="Next Hour" value="4.00 kW" />
        <MiniMetric label="Grid Export" value="2.45 kW" />
        <MiniMetric label="Battery" value="12.75 kW" />
      </div>

      {/* 4. Large Impact Footer */}
      <div className="grid grid-cols-2 gap-8 border-t border-current/5 pt-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Earnings</p>
          <p className="text-xl font-black tracking-tighter">Rs.{(specs.monthlySavings || 34578).toLocaleString()}</p>
          <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Currency: PKR</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">CO₂ Offset</p>
          <div className="flex items-center justify-end gap-2">
            <p className="text-xl font-black tracking-tighter">{(specs.carbonOffset || 6.12).toFixed(2)} KG</p>
          </div>
          <p className="text-[9px] font-bold text-solar-emerald uppercase tracking-widest flex items-center justify-end gap-1">
            <TreeDeciduous size={10} /> Equivalent to 20 Trees
          </p>
        </div>
      </div>

    </div>
  );
}
// ...existing code...

function MiniMetric({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</p>
      <p className="text-xs font-black tracking-tight truncate">{value}</p>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <Icon size={16} className={color} />
        <span className="text-xl font-black tracking-tighter">{value}</span>
      </div>
      <span className="text-[9px] font-bold tracking-widest opacity-40 uppercase">{label}</span>
    </div>
  );
}

function StatMini({ label, value, icon: Icon, color, isDark }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("p-4 rounded-2xl", isDark ? "bg-white/5" : "bg-slate-100", color)}><Icon size={20} /></div>
      <div>
        <p className="text-[10px] font-black uppercase opacity-40 mb-1">{label}</p>
        <p className={cn("text-2xl font-black tracking-tighter leading-none", color)}>{value}</p>
      </div>
    </div>
  );
}