import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Zap, Leaf, Wallet, Clock, Plus, Minus,
  Wind, CloudSnow, Flower2, ThermometerSun,
  Download, Bell, Home, Calendar, ShieldCheck,
  CloudSun, Gauge, Info, TreeDeciduous, TrendingUp,
  Activity, Cpu, BatteryMedium, Layers, X
} from 'lucide-react';

// Types & Config
import { Appliance } from './types';
import { UI_NAME_TO_ID } from './config/applianceConfigs';
import { cn } from './lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const CATEGORIES = [
  { id: 'climate', name: 'Climate', items: ['Air Conditioner', 'Ceiling Fan'] },
  { id: 'kitchen', name: 'Kitchen', items: ['Refrigerator', 'Microwave Oven', 'Water Motor'] },
  { id: 'tech', name: 'Tech', items: ['LED TV', 'LED Lights'] },
  { id: 'ev', name: 'Mobility', items: ['EV Car', 'Electric Bike'] }
];

const SEASONS = [
  { name: 'Spring', color: 'from-green-100 to-rose-100', darkColor: 'from-emerald-950/40 to-slate-900', icon: Flower2, particle: '🌸' },
  { name: 'Summer', color: 'from-sky-100 to-amber-50', darkColor: 'from-blue-950/40 to-slate-950', icon: ThermometerSun, particle: '☀️' },
  { name: 'Autumn', color: 'from-orange-100 to-red-50', darkColor: 'from-orange-950/40 to-slate-950', icon: Wind, particle: '🍂' },
  { name: 'Winter', color: 'from-slate-100 to-blue-50', darkColor: 'from-slate-900 to-blue-950', icon: CloudSnow, particle: '❄️' }
];

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [seasonIdx, setSeasonIdx] = useState(0);
  const [interactionLevel, setInteractionLevel] = useState<'initial' | 'bill-uploaded'>('initial');
  const [isScanning, setIsScanning] = useState(false);
  const [showTierDetails, setShowTierDetails] = useState(false);
  const [billUnits, setBillUnits] = useState(0);
  const [userData, setUserData] = useState({ name: '', city: '' });
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [specs, setSpecs] = useState<any>({
    solarKw: 0, storageKwh: 0, inverterKw: 0, packageId: 'Lite',
    monthlySavings: 0, carbonOffset: 0, gridImpact: 0
  });

  const isDark = theme === 'dark';

  // --- REACTIVE PLOT LOGIC ---
  // The load curve grows taller and wider as more appliances are selected
  const loadCurveData = useMemo(() => {
    const base = [15, 20, 18, 25, 45, 70, 85, 90, 75, 60, 40, 25, 20, 35, 50, 65, 80, 95, 85, 60, 45, 30, 20, 15];
    const multiplier = 1 + (selectedAppliances.length * 0.15);
    return base.map(val => Math.min(100, val * multiplier));
  }, [selectedAppliances]);

  useEffect(() => {
    const timer = setInterval(() => setSeasonIdx(prev => (prev + 1) % SEASONS.length), 15000);
    return () => clearInterval(timer);
  }, []);

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

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE}/upload-bill`, { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        setBillUnits(Number(result.data.units_consumed) || 0);
        setUserData({ name: result.data.consumer_name || 'Valued User', city: result.data.location || 'Detecting...' });
        setInteractionLevel('bill-uploaded');
        fetchSystemSpecs(Number(result.data.units_consumed), []);
      }
    } finally { setIsScanning(false); }
  };

  const toggleAppliance = (name: string) => {
    const techId = UI_NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, '-');
    const exists = selectedAppliances.find(a => a.id === techId);
    const newSelection = exists
      ? selectedAppliances.filter(a => a.id !== techId)
      : [...selectedAppliances, { id: techId, name, wattage: 500, quantity: 1, icon: 'zap' }];

    setSelectedAppliances(newSelection);
    fetchSystemSpecs(billUnits, newSelection);
  };

  const currentSeason = SEASONS[seasonIdx];

  return (
    <div className={cn("h-screen w-full overflow-hidden transition-all duration-1000 font-sans", isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>

      {/* 1. BACKGROUND / WEATHER LAYER */}
      <div className={cn("absolute inset-0 z-0 transition-all duration-[3000ms] bg-gradient-to-br", isDark ? currentSeason.darkColor : currentSeason.color)}>
        {/* <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`${seasonIdx}-${i}`}
              initial={{ y: -100, x: Math.random() * 100 + "%", opacity: 0 }}
              animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
              transition={{ duration: 10 + Math.random() * 8, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
              className="absolute text-4xl opacity-30"
            >
              {currentSeason.particle}
            </motion.div>
          ))}
        </div> */}
        <div className="absolute inset-0 flex items-center justify-center p-20 pointer-events-none">
          <img
            src="/houseeee.png"
            alt="Solar House"
            className="h-[80%] w-auto object-contain 
               drop-shadow-[0_35px_35px_rgba(15,23,42,0.4)]
               transition-transform duration-1000
               translate-x-[150px] translate-y-[-30px]"
          /></div>
      </div>


      {/* 2. LOGO & STATUS (CENTERED-LEFT) */}
      <div className={cn("absolute p-2 top-10 left-[480px] z-50 flex items-center gap-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg", isDark ? "bg-white/40 border-black/10" : "bg-black/60 border-white/80")}>
        <img src="/logofull.png" className={cn("h-10 transition-all")} alt="Logo" />
        <div className={cn("px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3", isDark ? "bg-black/80 border-white/10" : "bg-white/60 border-black/80")}>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="opacity-100">Optimization Active</span>
        </div>

      </div>
      <button
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        className="p-3 absolute top-10 right-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg"
      >
        {isDark ? <Sun size={18} className="text-orange-400" /> : <Moon size={18} />}
      </button>
      {/* 3. LEFT PANEL: LOAD PROFILING */}
      <motion.aside
        className={cn(
          "absolute left-10 top-14 bottom-10 w-[380px] z-50 rounded-[2.5rem] border backdrop-blur-[40px] shadow-2xl flex flex-col transition-all duration-500 overflow-hidden",
          isDark ? "bg-black/40 border-white/10" : "bg-white/60 border-white/80"
        )}
      >
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter">
              {interactionLevel === 'initial' ? "System Design" : `Hello, ${userData.name.split(' ')[0]}`}
            </h2>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
              <Home size={10} /> {userData.city || "Upload Bill to Start"}
            </p>
          </div>

          {interactionLevel === 'initial' ? (
            <div className="pt-4 space-y-4">
              <div className="p-8 border-2 border-dashed border-current/10 rounded-[2rem] text-center space-y-4 hover:border-orange-500/50 transition-all cursor-pointer relative group">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Download className="text-white" size={20} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest">{isScanning ? "Processing..." : "Drop Energy Bill"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Load Profiling</span>
                <span className="text-[9px] font-bold bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">{selectedAppliances.length} Active</span>
              </div>
              <div className="space-y-6">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="space-y-3">
                    <p className="text-[9px] font-black text-current/30 uppercase tracking-widest">{cat.name}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {cat.items.map(item => {
                        const isSelected = selectedAppliances.some(a => a.name === item);
                        return (
                          <button key={item} onClick={() => toggleAppliance(item)} className={cn(
                            "p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all",
                            isSelected ? "bg-orange-500 text-white border-transparent shadow-lg" : "bg-current/5 border-transparent opacity-60 hover:opacity-100"
                          )}>
                            {item} {isSelected ? <Minus size={14} /> : <Plus size={14} className="opacity-40" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* 4. RECOMMENDED SIZE + COMPONENTS (RIGHT CENTER) */}
      <AnimatePresence>
        {specs.solarKw > 0 && (
          <motion.div
            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className={cn(
              "absolute right-10 top-70 -translate-y-1/2 z-50 p-8 rounded-[3rem] border backdrop-blur-[50px] shadow-2xl w-[400px]",
              isDark ? "bg-black/30 border-white/10" : "bg-white/40 border-white/80"
            )}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Designed Capacity</p>
            <div className="flex items-baseline gap-3 mb-8">
              <h3 className="text-[100px] font-black leading-none tracking-tighter text-orange-500">{specs.solarKw.toFixed(2)}</h3>
              <span className="text-3xl font-black text-current opacity-40 italic">kW</span>
            </div>

            {/* PV, Inverter, Battery Grid */}
            <div className="grid grid-cols-1 gap-3">
              <ComponentRow icon={Sun} label="PV Panel Matrix" value={`${specs.solarKw.toFixed(1)} kW`} />
              <ComponentRow icon={Cpu} label="Hybrid Inverter" value={`${specs.inverterKw.toFixed(2) || (specs.solarKw * 0.8).toFixed(1)} kW`} />
              <ComponentRow icon={BatteryMedium} label="LFP Battery Storage" value={`${specs.storageKwh.toFixed(2)} kWh`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. BOTTOM GROUP: REACTIVE PLOT + IMPACT GRID */}
      <AnimatePresence>
        {specs.solarKw > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-10 left-[420px] right-10 z-50 space-y-4"
          >
            {/* REACTIVE LOAD PLOT */}
            <div className={cn("w-[46%] h-32 ml-6 rounded-[2rem] border backdrop-blur-2xl p-6 flex flex-col justify-center relative", isDark ? "bg-black/20 border-white/5" : "bg-white/20 border-white/60")}>
              <div className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                <Activity size={12} className="text-orange-500" /> Dynamic Load Projection
              </div>
              <div className="flex items-end h-16 gap-1">
                {loadCurveData.map((h, i) => (
                  <motion.div
                    key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                    className={cn("flex-1 rounded-t-sm transition-all", i > 5 && i < 18 ? "bg-orange-500/60 shadow-[0_0_10px_rgba(249,115,22,0.2)]" : "bg-current/10")}
                  />
                ))}
              </div>
            </div>

            {/* IMPACT BOXES */}
            <div className="flex gap-4 ml-6 ">
              <ImpactBox label="Investment Recovery" value={`Rs ${(specs.monthlySavings / 1000).toFixed(1)}k`} sub="Monthly ROI" icon={Wallet} color="text-emerald-500" />
              <ImpactBox label="Inflation Mastery" value={`${specs.gridImpact || 98}%`} sub="Cost Hedged" icon={TrendingUp} color="text-blue-500" />



              <ImpactBox label="Carbon Offset" value={`${specs.carbonOffset.toFixed(1)} KG`} sub="Impact" icon={TreeDeciduous} color="text-emerald-400" />
              {/* TIER BADGE (Clickable) */}
              <div
                onClick={() => setShowTierDetails(true)}
                className={cn("flex-[1.2] p-6 rounded-[2rem] border cursor-pointer hover:scale-[1.02] transition-transform shadow-lg", isDark ? "bg-black/20 border-white/5" : "bg-white/20 border-white/60")}
              >
                <p className="text-[8px] font-black uppercase tracking-widest mb-1">System Metadata</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase flex items-center opacity-80 gap-1"><Layers size={10} /> {specs.packageId || "Lite"}</p>
                    <p className="text-[8px] opacity-40 font-bold uppercase">Package Tier</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase opacity-80">3.2 Years</p>
                    <p className="text-[8px] opacity-40 font-bold uppercase">ROI Est.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. TIER DETAILS MODAL */}
      <AnimatePresence>
        {showTierDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/40 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className={cn("w-[500px] p-10 rounded-[3rem] border shadow-2xl relative", isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200")}>
              <button onClick={() => setShowTierDetails(false)} className="absolute top-8 right-8 opacity-40 hover:opacity-100"><X size={24} /></button>
              <h3 className="text-3xl font-black tracking-tighter mb-2">{specs.packageId || "Lite"} Package Details</h3>
              <p className="text-sm opacity-60 mb-8 font-medium italic">"Optimized for standard residential load with high-efficiency tier-1 components."</p>
              <div className="space-y-4">
                <DetailRow label="PV Warranty" value="25 Years" />
                <DetailRow label="Inverter Type" value="Hybrid Smart" />
                <DetailRow label="Battery Cells" value="LiFePO4" />
                <DetailRow label="Installation" value="Standard Incl." />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// COMPONENTS
function ComponentRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-current/5 border border-current/5">
      <div className="flex items-center gap-3">
        <Icon size={14} className="text-orange-500" />
        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</span>
      </div>
      <span className="text-xs font-black uppercase">{value}</span>
    </div>
  );
}

function ImpactBox({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="flex-1 p-6 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-xl flex flex-col justify-between">
      <div className="flex justify-between items-start"><p className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</p><Icon size={14} className={color} /></div>
      <div><h4 className={cn("text-2xl font-black tracking-tighter", color)}>{value}</h4><p className="text-[9px] font-bold opacity-40 uppercase mt-1">{sub}</p></div>
    </div>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <div className="flex justify-between border-b border-current/5 pb-3">
      <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black uppercase">{value}</span>
    </div>
  );
}