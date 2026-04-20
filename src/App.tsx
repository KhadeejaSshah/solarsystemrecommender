import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Zap, BarChart3, Globe, Leaf, 
  TrendingDown, Wallet, FileText, Settings2, 
  RefreshCcw, ChevronRight, CheckCircle2, Battery, PanelTop
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

  // --- LOGIC FUNCTIONS ---
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

      {/* LAYER 2: TOP MIDDLE SYSTEM SPECS (FROSTED GLASS) */}
      <AnimatePresence>
        {specs.solarKw > 0 && (
          <motion.div 
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 24, x: '-50%', opacity: 1 }}
            className={cn(
              "absolute left-1/2 z-50 px-8 py-4 rounded-[2rem] border backdrop-blur-2xl shadow-2xl flex items-center gap-8 pointer-events-auto",
              isDark ? "bg-slate-900/60 border-white/10" : "bg-white/70 border-black/5"
            )}
          >
            {/* round off all values to 2 decimal place: */}
            <QuickStat icon={Sun} label="PV SIZE" value={`${specs.solarKw.toFixed(2)} kW`} color="text-solar-gold" />
            <div className="w-px h-8 bg-current opacity-10" />
            <QuickStat icon={Battery} label="BATTERY" value={`${specs.storageKwh.toFixed(2)} kWh`} color="text-solar-emerald" />
            <div className="w-px h-8 bg-current opacity-10" />
            <QuickStat icon={Zap} label="INVERTER" value={`${specs.inverterKw.toFixed(2)} kW`} color="text-solar-electric" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 3: FLOATING UI OVERLAY */}
      <div className="relative z-10 h-full w-full flex flex-col pointer-events-none">
        
        {/* HEADER */}
        <header className="h-20 px-10 flex justify-between items-center">
          <div className={cn("flex items-center gap-4 py-3 px-6 rounded-3xl border backdrop-blur-xl mt-4 pointer-events-auto", isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-black/5")}>
            <div className="w-8 h-8 rounded-lg bg-solar-emerald flex items-center justify-center">
               <img src="/logo.png" alt="L" className="w-5 h-5 invert" />
            </div>
            <h1 className="text-lg font-black tracking-tighter italic leading-none">SKYELECTRIC</h1>
          </div>

          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={cn("p-4 rounded-3xl border backdrop-blur-xl transition-all pointer-events-auto mt-4", isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-black/5")}
          >
            {isDark ? <Sun size={20} className="text-solar-gold" /> : <Moon size={20} className="text-solar-electric" />}
          </button>
        </header>

        <div className="flex-1 relative flex overflow-hidden">
          {/* SIDEBAR (DATA PANEL) */}
          <aside className={cn(
            "w-[420px] m-8 rounded-[2.5rem] border backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto transition-colors duration-500",
            isDark ? "bg-slate-900/40 border-white/10" : "bg-white/80 border-black/5 shadow-slate-200"
          )}>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
                    {/* Bill Profile */}
                    <div className={cn("p-6 rounded-3xl border", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-xl bg-solar-emerald/20 flex items-center justify-center text-solar-emerald">
                               <FileText size={20} />
                            </div>
                            <div>
                               <h3 className={cn("font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>{userData.name}</h3>
                               <p className={cn("text-[10px] uppercase font-bold tracking-widest", isDark ? "text-white/40" : "text-slate-400")}>{userData.city} • {billUnits} Units</p>
                            </div>
                         </div>
                         <button onClick={startOver} className={cn("p-2 rounded-xl transition-colors", isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-200 text-slate-400")}><RefreshCcw size={16}/></button>
                      </div>
                    </div>

                    {/* Load Config */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", isDark ? "text-white/30" : "text-slate-400")}>Load Builder</span>
                        <button onClick={() => setApplianceJourneyActive(!applianceJourneyActive)} className="text-xs font-bold text-solar-emerald">
                          {applianceJourneyActive ? 'Close' : 'Modify'}
                        </button>
                      </div>
                      {applianceJourneyActive ? (
                        <ApplianceConfigurator selectedAppliances={selectedAppliances} onToggle={toggleAppliance} isDark={isDark} />
                      ) : (
                        <div className="h-12 rounded-2xl border border-dashed flex items-center justify-center">
                          <p className="text-[10px] font-bold italic">Select appliances for precise sizing</p>
                        </div>
                      )}
                    </div>

                    {/* Injected EnergyHub */}
                    <div className={cn("pt-6 border-t", isDark ? "border-white/5" : "border-slate-200")}>
                       <EnergyHub interactionLevel={interactionLevel} specs={specs} isDark={isDark} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>

          {/* BOTTOM IMPACT BAR */}
          <AnimatePresence>
            {specs.solarKw > 0 && (
              <motion.div initial={{ y: 100 }} animate={{ y: -40 }} className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-auto">
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
    </div>
  );
}

// --- SUB COMPONENTS ---

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

function ApplianceConfigurator({ selectedAppliances, onToggle, isDark }: any) {
  const APPS = [{ name: 'Fridge', icon: '❄️' }, { name: 'AC', icon: '💨' }, { name: 'EV Car', icon: '🚗' }, { name: 'LED Lights', icon: '💡' }];
  return (
    <div className="grid grid-cols-2 gap-3">
      {APPS.map(cat => {
        const isActive = selectedAppliances.some((a: any) => a.name === cat.name);
        return (
          <button key={cat.name} onClick={() => onToggle(cat.name)} className={cn(
            "p-4 rounded-3xl border transition-all flex flex-col gap-2 relative",
            isActive 
              ? (isDark ? "bg-solar-emerald/10 border-solar-emerald/50" : "bg-solar-emerald/5 border-solar-emerald/30") 
              : (isDark ? "bg-white/5 border-white/5" : "bg-slate-100 border-transparent")
          )}>
            <span className="text-xl">{cat.icon}</span>
            <div className="text-left">
               <p className={cn("text-[10px] font-black uppercase", isActive ? "text-solar-emerald" : (isDark ? "text-white" : "text-slate-700"))}>{cat.name}</p>
               {isActive && <CheckCircle2 size={12} className="absolute top-3 right-3 text-solar-emerald" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}