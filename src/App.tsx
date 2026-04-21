import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Zap, BarChart3, Globe, Leaf, 
  TrendingDown, Wallet, FileText, Settings2, 
  RefreshCcw, ChevronRight, CheckCircle2, Battery, 
  CloudSun, Activity
} from 'lucide-react';

// Components
import PlanningPanel from './components/PlanningPanel';
import EnergyHub from './components/EnergyHub';
import SolarHouse3D from './components/SolarHouse/SolarHouse3D';

// Config & Types
import { Appliance } from './types';
import { UI_NAME_TO_ID } from './config/applianceConfigs';
import { cn } from './lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
      
      {/* LAYER 1: 3D BACKDROP */}
      <div className="absolute inset-0 z-0">
        <SolarHouse3D 
          appliances={selectedAppliances} 
          evInfo={{ status: selectedAppliances.some(a => a.name === 'EV Car') ? 'own' : 'none' }} 
          isDark={isDark} 
        />
      </div>

      {/* LAYER 2: TOP SPECS (FROSTED GLASS) */}
      <AnimatePresence>
        {specs.solarKw > 0 && (
          <motion.div 
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 24, x: '-10%', opacity: 1 }} // Shifted slightly right to clear sidebar
            className={cn(
              "absolute left-1/2 z-50 px-8 py-4 rounded-[2rem] border backdrop-blur-2xl shadow-2xl flex items-center gap-8 pointer-events-auto",
              isDark ? "bg-slate-900/60 border-white/10" : "bg-white/70 border-black/5"
            )}
          >
            <QuickStat icon={Sun} label="PV SIZE" value={`${specs.solarKw.toFixed(2)} kW`} color="text-solar-gold" />
            <div className="w-px h-8 bg-current opacity-10" />
            <QuickStat icon={Battery} label="BATTERY" value={`${specs.storageKwh.toFixed(2)} kWh`} color="text-solar-emerald" />
            <div className="w-px h-8 bg-current opacity-10" />
            <QuickStat icon={Zap} label="INVERTER" value={`${specs.inverterKw.toFixed(2)} kW`} color="text-solar-electric" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPANY LOGO (OVERLAY, CENTER-RIGHT, IN FRONT OF LEFT INFO PANEL) */}
      <div className={cn("absolute top-6 left-[450px] right-8 z-40 pointer-events-auto flex")}>
        <div className={cn("flex items-center gap-3")}>
          <div>
            <img src="/logofull.png" alt="Logo" />
          </div>
          {/* <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={cn("p-2 rounded-xl ml-2 transition-all", isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-black/5")}
          >
            {isDark ? <Sun size={18} className="text-solar-gold" /> : <Moon size={18} className="text-solar-electric" />}
          </button> */}
        </div>
      </div>



   {/* COMPANY LOGO (OVERLAY, CENTER-RIGHT, IN FRONT OF right INFO PANEL) */}
      <div className={cn("absolute top-6 right-[950px] right-8 z-40 pointer-events-auto flex")}>
        <div className={cn("flex items-center gap-3")}>
          
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={cn("p-2 rounded-xl ml-2 transition-all", isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-black/5")}
          >
            {isDark ? <Sun size={18} className="text-solar-gold" /> : <Moon size={18} className="text-solar-electric" />}
          </button>
        </div>
      </div>






      {/* LAYER 3: UI OVERLAY */}
      <div className="relative z-10 h-full w-full flex pointer-events-none">
        
        {/* SIDEBAR (NOW FULL HEIGHT) */}
        <aside className={cn(
          "w-[420px] h-full border-r backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto transition-all duration-500",
          isDark ? "bg-slate-950/60 border-white/5" : "bg-white/90 border-black/5 shadow-slate-200"
        )}>
          {/* SIDEBAR HEADER WITH LOGO */}
          <div className="p-8 pb-4 flex items-center justify-between">
            {/* <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-solar-emerald flex items-center justify-center shadow-lg shadow-solar-emerald/20">
                 <img src="/logo.png" alt="L" className="w-6 h-6 invert" />
              </div>
              <h1 className="text-xl font-black tracking-tighter italic leading-none">SKYELECTRIC</h1>
            </div> */}
            {/* <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className={cn("p-3 rounded-2xl border transition-all", isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-black/5")}
            >
              {isDark ? <Sun size={18} className="text-solar-gold" /> : <Moon size={18} className="text-solar-electric" />}
            </button> */}
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar space-y-4">
            <AnimatePresence mode="wait">
              {interactionLevel === 'initial' && !applianceJourneyActive ? (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="p1">
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* User Profile Card */}
                  <div className={cn("p-6 rounded-[2rem] border", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-solar-emerald/20 flex items-center justify-center text-solar-emerald">
                             <FileText size={24} />
                          </div>
                          <div>
                             <h3 className={cn("font-black tracking-tight text-lg", isDark ? "text-white" : "text-slate-900")}>{userData.name}</h3>
                             <p className={cn("text-[10px] uppercase font-black tracking-[0.2em]", isDark ? "text-white/40" : "text-slate-400")}>{userData.city} • {billUnits} Units</p>
                          </div>
                       </div>
                       <button onClick={startOver} className={cn("p-2 rounded-xl transition-colors", isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-200 text-slate-400")}><RefreshCcw size={16}/></button>
                    </div>
                  </div>

                  {/* Visual Analytics Section */}
                  <div className="space-y-6">
                    <ChartSection 
                      title="Daily Sunlight Exposure" 
                      subtitle="Average peak hours: 5.8h"
                      icon={CloudSun}
                      isDark={isDark}
                    >
                      <SunlightGraph isDark={isDark} />
                    </ChartSection>

                    <ChartSection 
                      title="Energy Experience" 
                      subtitle="Solar vs. Grid vs. Storage"
                      icon={Activity}
                      isDark={isDark}
                    >
                      <EnergyExperienceGraph isDark={isDark} />
                    </ChartSection>
                  </div>

                  {/* Existing Components */}
                  <div className={cn("pt-6 border-t", isDark ? "border-white/5" : "border-slate-200")}>
                     <EnergyHub interactionLevel={interactionLevel} specs={specs} isDark={isDark} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* BOTTOM IMPACT BAR (SHIFTED RIGHT TO OFFSET SIDEBAR) */}
        <AnimatePresence>
          {specs.solarKw > 0 && (
            <motion.div 
              initial={{ y: 100 }} 
              animate={{ y: -40 }} 
              className="absolute bottom-0 left-[440px] right-8 pointer-events-auto flex justify-center"
            >
              <div className={cn("px-12 py-6 rounded-[3rem] border backdrop-blur-3xl flex gap-16 shadow-2xl", isDark ? "bg-slate-900/60 border-white/10" : "bg-white/80 border-black/5")}>
                 <StatMini label="Savings" value={`${specs.gridImpact?.toFixed(0)}%`} icon={TrendingDown} color="text-solar-emerald" isDark={isDark} />
                 <StatMini label="Carbon" value={`${specs.carbonOffset?.toFixed(1)}T`} icon={Leaf} color="text-solar-electric" isDark={isDark} />
                 <StatMini label="Monthly" value={`Rs.${(specs.monthlySavings / 1000).toFixed(0)}k`} icon={Wallet} color={isDark ? "text-white" : "text-slate-900"} isDark={isDark} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- NEW CHART COMPONENTS ---

function ChartSection({ title, subtitle, icon: Icon, children, isDark }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <Icon size={16} className="text-solar-emerald" />
        <div>
          <h4 className={cn("text-[11px] font-black uppercase tracking-wider", isDark ? "text-white/80" : "text-slate-700")}>{title}</h4>
          <p className="text-[9px] opacity-50 font-bold">{subtitle}</p>
        </div>
      </div>
      <div className={cn("h-32 w-full rounded-[1.5rem] border p-4 overflow-hidden relative", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
        {children}
      </div>
    </div>
  );
}

function SunlightGraph({ isDark }: { isDark: boolean }) {
  return (
    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Bell curve representing sun intensity */}
      <path 
        d="M 0 60 Q 50 60 70 40 T 100 10 T 130 40 T 200 60" 
        fill="url(#sunGradient)"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Time markers */}
      <line x1="100" y1="10" x2="100" y2="60" stroke="currentColor" strokeDasharray="2 2" opacity="0.1" />
    </svg>
  );
}

function EnergyExperienceGraph({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative h-full w-full">
      <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
        {/* Load Profile (Roughly spikes in morning/evening) */}
        <path 
          d="M 0 45 L 20 40 L 40 50 L 60 45 L 80 48 L 100 52 L 120 45 L 140 30 L 160 35 L 180 40 L 200 45" 
          fill="none" 
          stroke={isDark ? "white" : "#0f172a"} 
          strokeWidth="1.5"
          opacity="0.3"
        />
        {/* Solar Generation */}
        <path 
          d="M 40 60 Q 100 -10 160 60" 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        {/* Battery State */}
        <path 
          d="M 0 30 C 40 30 60 10 100 10 C 140 10 160 50 200 50" 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2"
        />
      </svg>
      <div className="absolute top-0 right-0 flex flex-col gap-1">
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-solar-emerald" /><span className="text-[7px] font-bold opacity-60">SOLAR</span></div>
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /><span className="text-[7px] font-bold opacity-60">STORAGE</span></div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS (KEEP EXISTING) ---

function QuickStat({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <Icon size={14} className={color} />
        <span className="text-lg font-black tracking-tighter">{value}</span>
      </div>
      <span className="text-[8px] font-bold tracking-[0.2em] opacity-40 uppercase">{label}</span>
    </div>
  );
}

function StatMini({ label, value, icon: Icon, color, isDark }: any) {
  return (
    <div className="flex items-center gap-4 text-left">
      <div className={cn("p-3 rounded-2xl", isDark ? "bg-white/5" : "bg-slate-100", color)}>
        <Icon size={20} />
      </div>
      <div>
        <p className={cn("text-[9px] font-black uppercase tracking-widest mb-0.5", isDark ? "text-white/30" : "text-slate-400")}>{label}</p>
        <p className={cn("text-xl font-black tracking-tighter leading-none", color)}>{value}</p>
      </div>
    </div>
  );
}