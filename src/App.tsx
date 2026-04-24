import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Zap, Leaf, Wallet, Clock, Plus, Minus,
  Wind, CloudSnow, Flower2, ThermometerSun,
  Download, Bell, Home, Calendar, ShieldCheck,
  CloudSun, Gauge, Info, TreeDeciduous, TrendingUp,
  Activity, Cpu, BatteryMedium, Layers, X, ArrowLeft,
  ChevronDown, Sparkles
} from 'lucide-react';

// Types & Config
import { Appliance } from './types';
import { UI_NAME_TO_ID } from './config/applianceConfigs';
import { APPLIANCE_WATTAGE_CONFIG } from './config/applianceWattages';
import { cn } from './lib/utils';


const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const CATEGORIES = [
  {
    id: 'climate',
    name: 'Climate',
    items: [
      {
        name: 'Air Conditioner',
        id: 'ac',
        variants: [
          { key: '1-ton', label: '1.0 Ton' },
          { key: '1.5-ton', label: '1.5 Ton' },
          { key: '2-ton', label: '2.0 Ton' }
        ]
      },
      {
        name: 'Ceiling Fan',
        id: 'fan',
        variants: [
          { key: 'standard', label: 'Standard Fan' }
        ]
      }
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    items: [
      {
        name: 'Refrigerator',
        id: 'fridge',
        variants: [
          { key: 'small', label: 'Small' },
          { key: 'medium', label: 'Medium' },
          { key: 'large', label: 'Large' }
        ]
      },
      {
        name: 'Microwave Oven',
        id: 'microwave',
        variants: [
          { key: 'standard', label: 'Standard' }
        ]
      },
      {
        name: 'Water Motor',
        id: 'motor',
        variants: [
          { key: '1hp', label: '1 HP' }
        ]
      }
    ]
  },
  {
    id: 'tech',
    name: 'Tech',
    items: [
      { name: 'LED TV', id: 'tv', variants: [{ key: 'std', label: 'LED TV' }] },
      { name: 'LED Lights', id: 'lights', variants: [{ key: 'std', label: 'LED Lights' }] }
    ]
  },
  {
    id: 'ev',
    name: 'Mobility',
    items: [
      { name: 'EV Car', id: 'tesla', variants: [{ key: 'ev', label: 'EV Car' }] },
      { name: 'Electric Bike', id: 'bike', variants: [{ key: 'ebike', label: 'E-Bike' }] }
    ]
  }
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

  const [showLoadProfiling, setShowLoadProfiling] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null); // Re-used for bill upload errors

  const [billUnits, setBillUnits] = useState(0);
  const [userData, setUserData] = useState({ name: '', city: '' });
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [specs, setSpecs] = useState<any>({
    solarKw: 0, storageKwh: 0, inverterKw: 0, packageId: 'Smart Lite',
    monthlySavings: 0, carbonOffset: 0, gridImpact: 0
  });

  const [variantOpen, setVariantOpen] = useState<string | null>(null);
  const [applianceCounts, setApplianceCounts] = useState<Record<string, Record<string, { quantity: number; watt: number; name: string }>>>({});

  const isDark = theme === 'dark';

  const loadCurveData = useMemo(() => {
    const base = [15, 20, 18, 25, 45, 70, 85, 90, 75, 60, 40, 25, 20, 35, 50, 65, 80, 95, 85, 60, 45, 30, 20, 15];
    const multiplier = 1 + (selectedAppliances.length * 0.15);
    return base.map(val => Math.min(100, val * multiplier));
  }, [selectedAppliances]);

  useEffect(() => {
    const timer = setInterval(() => setSeasonIdx(prev => (prev + 1) % SEASONS.length), 15000);
    return () => clearInterval(timer);
  }, []);

  const requestAIInsights = async (payload: any) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_BASE}/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const insights = Array.isArray(data.insights)
          ? data.insights
          : data.text?.split('\n').filter((l: string) => l.trim().length > 0);
        setAiInsights(insights);
      } else {
        setAiError(data.error || "AI insights temporarily unavailable.");
      }
    } catch (e) {
      setAiError("Failed to connect to AI advisor.");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchSystemSpecs = async (units: number, apps: Appliance[]) => {
    try {
      const res = await fetch(`${API_BASE}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units, appliances: apps }),
      });
      if (res.ok) {
        const data = await res.json();
        setSpecs(data);
        return data;
      }
    } catch (e) { console.error(e); }
    return null;
  };

  // --- MODIFIED: This function now handles success and failure from the backend ---
  const handleFileUpload = async (event: any) => {
    const file = event.target.files?.[0];
    setAiError(null); // Clear previous errors on new upload
    if (!file) return;

    const allowed = ['application/pdf', 'image/png'];
    if (!allowed.includes(file.type)) {
      setAiError("Only PDF and PNG files are allowed.");
      return;
    }
    
    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE}/upload-bill`, { method: 'POST', body: formData });
      const result = await response.json();

      // Check the success flag from the backend
      if (result.success) {
        // --- Success Path ---
        const units = Number(result.data.units_consumed) || 0;
        const user = { name: result.data.consumer_name || 'Valued User', city: result.data.location || 'Detecting...' };
        
        setBillUnits(units);
        setUserData(user);
        setInteractionLevel('bill-uploaded'); // <-- Move to the next screen
        
        const currentSpecs = await fetchSystemSpecs(units, []);
        requestAIInsights({ bill: result.data, specs: currentSpecs, units, appliances: [] });
      } else {
        // --- Failure Path (e.g., Invalid Bill) ---
        setAiError(result.error || "An unknown error occurred.");
        // We DO NOT change the interactionLevel, so the user stays on the upload screen.
      }
    } catch (err) {
        setAiError("Could not connect to the server. Please try again.");
    } finally { 
        setIsScanning(false); 
    }
  };
  
  const openVariantPanel = (itemId: string) => {
    setVariantOpen(current => current === itemId ? null : itemId);
  };

  const updateApplianceCount = (itemId: string, name: string, variantKey: string, delta: number) => {
    const watt = APPLIANCE_WATTAGE_CONFIG[itemId]?.[variantKey];
    if (typeof watt === 'undefined') {
      console.error(`Wattage not found in config for: ${itemId} -> ${variantKey}`);
      return;
    }

    setApplianceCounts(prev => {
      const next: Record<string, Record<string, { quantity: number; watt: number; name: string }>> = { ...prev };
      next[itemId] = { ...(prev[itemId] || {}) };
      const existing = next[itemId][variantKey];
      const currentQty = existing?.quantity || 0;
      const newQty = Math.min(10, Math.max(0, currentQty + delta));
      if (newQty <= 0) {
        delete next[itemId][variantKey];
        if (Object.keys(next[itemId]).length === 0) delete next[itemId];
      } else {
        next[itemId][variantKey] = { quantity: newQty, watt, name };
      }
      const arr: Appliance[] = [];
      Object.entries(next).forEach(([id, variants]) => {
        Object.entries(variants).forEach(([vKey, d]) => {
          arr.push({ id: `${id}:${vKey}`, name: `${d.name} (${vKey})`, wattage: d.watt, quantity: d.quantity, icon: 'zap' });
        });
      });
      setSelectedAppliances(arr);
      fetchSystemSpecs(billUnits, arr);
      return next;
    });
  };

  const addOne = (itemId: string, name: string, variantKey: string) => updateApplianceCount(itemId, name, variantKey, +1);
  const removeOne = (itemId: string, name: string, variantKey: string) => updateApplianceCount(itemId, name, variantKey, -1);

  const currentSeason = SEASONS[seasonIdx];

  const getPackageDetails = (pkg: string) => {
    const id = (pkg || 'Smart Lite').toLowerCase();
    if (id.includes('plus')) {
      return {
        title: 'Smart Plus (Most Popular)',
        target: '1–2 Kanal / 500 yards Houses',
        capacity: '15–30 kW | 20–40 kWh Smart Battery',
        powers: ['Full Home Backup', '4–6 Air Conditioners', 'Water Pump', 'Built-in EV Charger'],
        support: 'Mobile App + Cloud Monitoring'
      };
    }
    if (id.includes('estate') || id.includes('max')) {
      return {
        title: 'Estate Max',
        target: 'Farmhouses / Large Estates',
        capacity: '50 kW+ | High-Capacity Lithium Bank',
        powers: ['Centralized Cooling', 'Pools', 'Lifts', 'Multiple EV Chargers'],
        support: '24/7 Dedicated NOC Support'
      };
    }
    return {
      title: 'Smart Lite',
      target: 'Up to 10 Marla / Portions',
      capacity: '5–10 kW | 10 kWh Smart Battery',
      powers: ['Basic Lights & Fans', 'Refrigerator', '1–2 Inverter ACs', 'LED TV'],
      support: 'Mobile App + Cloud Monitoring'
    };
  };

  return (
    <div className={cn("h-screen w-full overflow-hidden transition-all duration-1000 font-sans", isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
       {/* (The rest of your JSX is largely unchanged) */}

       {/* ... Background, Logo, Theme Button ... */}
      <div className={cn("absolute inset-0 z-0 transition-all duration-[3000ms] bg-gradient-to-br", isDark ? currentSeason.darkColor : currentSeason.color)}>
        <div className="absolute inset-0 flex items-center justify-center p-20 pointer-events-none">
          <img src="/h23.png" alt="Solar House" className="absolute w-full h-full object-cover" />
        </div>
      </div>
      <div className={cn("absolute p-2 top-10 left-[465px] z-50 flex items-center gap-8 rounded-[2rem] backdrop-blur-xl border shadow-lg", isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-black/10")}>
        <img src="/logofull.png" className="h-10" alt="Logo" />
        <div className={cn("px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-3", isDark ? "bg-black/60 border-white/10" : "bg-black/5 border-black/10")}>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>Optimization Active</span>
        </div>
      </div>
      <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className={cn("p-3 absolute top-10 right-10 rounded-[2rem] backdrop-blur-xl border shadow-lg transition-all z-[100]", isDark ? "bg-black/60 border-white/10 hover:bg-black/80" : "bg-white/70 border-black/10 hover:bg-white/90")}>
        {isDark ? <Sun size={18} className="text-orange-400" /> : <Moon size={18} className="text-slate-700" />}
      </button>

      <motion.aside className={cn("absolute left-12 top-10 bottom-10 w-[380px] z-50 rounded-[2rem] border backdrop-blur-[40px] shadow-2xl flex flex-col transition-all duration-500 overflow-hidden", isDark ? "bg-black/40 border-white/10" : "bg-white/60 border-white/80")}>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tighter">
                {interactionLevel === 'initial' ? "System Design" : `Hello, ${userData.name.split(' ')[0]}`}
              </h2>
              {interactionLevel === 'bill-uploaded' && (
                <button
                  onClick={() => {
                    setInteractionLevel('initial');
                    setSelectedAppliances([]);
                    setBillUnits(0);
                    setAiInsights(null);
                    setAiError(null); // Clear errors when resetting
                    setSpecs({ solarKw: 0, storageKwh: 0, inverterKw: 0, packageId: 'Smart Lite', monthlySavings: 0, carbonOffset: 0, gridImpact: 0 });
                  }}
                  className="p-2 rounded-xl bg-current/5 hover:bg-orange-500 hover:text-white transition-all"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
            </div>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
              <Home size={10} /> {userData.city || "Upload Bill to Start"}
            </p>
          </div>

          {interactionLevel === 'initial' ? (
            <div className="pt-4 space-y-4">
              <div className="p-8 border-2 border-dashed border-current/10 rounded-[2rem] text-center space-y-4 hover:border-orange-500 transition-all cursor-pointer relative group">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Download className="text-white" size={20} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest">{isScanning ? "Processing..." : "Drop Energy Bill"}</p>
                <input
                  type="file"
                  accept="application/pdf,image/png"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={isScanning} // Disable input while scanning
                />
              </div>
              
              {/* --- START: UI TO DISPLAY THE BILL ERROR --- */}
              <AnimatePresence>
                {aiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
                  >
                    <p className="text-xs font-semibold text-red-500">{aiError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* --- END: UI TO DISPLAY THE BILL ERROR --- */}

            </div>
          ) : (
            // --- This part is rendered only AFTER a valid bill is uploaded ---
            <div className="space-y-6">
              {/* COLLAPSIBLE LOAD PROFILING */}
              <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/5">
                <button 
                  onClick={() => setShowLoadProfiling(!showLoadProfiling)}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Load Profiling </span>
                    <span className="text-[10px] font-bold text-orange-500 mt-0.5">{selectedAppliances.length} Active Devices</span>
                  </div>
                  <ChevronDown size={18} className={cn("transition-transform duration-500", showLoadProfiling ? "rotate-180" : "")} />
                </button>
                
                <AnimatePresence>
                  {showLoadProfiling && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 space-y-6 overflow-hidden"
                    >
                      {CATEGORIES.map(cat => (
                        <div key={cat.id} className="space-y-3">
                          <p className="text-[9px] font-black text-current/30 uppercase tracking-widest">{cat.name}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {cat.items.map((item: any) => {
                              const displayName = item.name;
                              const itemId = item.id;
                              const totalSelected = applianceCounts[itemId] ? Object.values(applianceCounts[itemId]).reduce((s, d) => s + d.quantity, 0) : 0;
                              const totalWatt = applianceCounts[itemId] ? Object.values(applianceCounts[itemId]).reduce((s, d) => s + (d.watt * d.quantity), 0) : 0;
                              return (
                                <div key={itemId} className="relative">
                                  <button
                                    onClick={() => openVariantPanel(itemId)}
                                    className={cn("w-full p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all", totalSelected > 0 ? "bg-orange-500 text-white border-transparent shadow-lg" : "bg-current/5 border-transparent opacity-60 hover:opacity-100")}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{displayName}</span>
                                      {totalSelected > 0 && <span className="text-[10px] font-bold opacity-90">x{totalSelected}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] opacity-60">{totalSelected > 0 ? `${totalWatt} W` : ''}</span>
                                      <Plus size={14} className="opacity-40" />
                                    </div>
                                  </button>
                                  <AnimatePresence>
                                    {variantOpen === itemId && (
                                      <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-2 p-3 rounded-2xl bg-current/3 border space-y-2 overflow-hidden"
                                      >
                                        {item.variants.map((v: any) => {
                                          const cnt = applianceCounts[itemId]?.[v.key]?.quantity || 0;
                                          const watt = APPLIANCE_WATTAGE_CONFIG[itemId]?.[v.key] || 0;
                                          return (
                                            <div key={v.key} className="flex items-center justify-between">
                                              <div>
                                                <div className="text-[10px] font-bold">{v.label}</div>
                                                <div className="text-[9px] opacity-50">{watt} W / unit</div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removeOne(itemId, displayName, v.key); }} className="p-2 rounded-full bg-current/5"><Minus size={12} /></button>
                                                <div className="text-[11px] font-black">{cnt}</div>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); addOne(itemId, displayName, v.key); }} className="p-2 rounded-full bg-current/5"><Plus size={12} /></button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                        <div className="text-[9px] opacity-40 italic">You can add up to 10 units per variant. Quantities update the system sizing immediately.</div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI STRATEGY BLOCK */}
              <div className={cn("p-6 rounded-[2.5rem] border transition-all duration-700", isDark ? "bg-orange-500/5 border-orange-500/20" : "bg-orange-50 border-orange-200")}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20"><Sparkles size={14} className="text-white" /></div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest">AI Strategy Advisor</h4>
                </div>
                {aiLoading ? ( <div className="space-y-3">{[1, 2, 3, 4, 5, 6].map(i => (<div key={i} className="h-2 bg-orange-500/10 rounded-full animate-pulse" style={{ width: `${100 - (i * 8)}%` }} />))}</div>) 
                : aiError ? (<p className="text-[10px] text-red-500 font-bold">{aiError}</p>) 
                : aiInsights ? ( <ul className="space-y-4">{aiInsights.map((insight, i) => (<motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="text-[11px] leading-relaxed flex gap-3 group"><span className="text-orange-500 font-bold">•</span><span className={isDark ? "text-white/80" : "text-slate-700"}>{insight}</span></motion.li>))}</ul>) 
                : (<p className="text-[10px] opacity-40 italic text-center py-4">Generating personalized energy insights...</p>)}
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ... The rest of the JSX (Recommended Size, Impact Grid, Modal) remains unchanged ... */}
      <AnimatePresence>
        {specs.solarKw > 0 && (
          <motion.div
            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className={cn(
              "absolute right-10 top-72 -translate-y-1/2 z-50 p-8 rounded-[2rem] border backdrop-blur-[50px] shadow-2xl w-[400px]",
              isDark ? "bg-black/30 border-white/10" : "bg-white/40 border-white/80"
            )}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Designed Capacity</p>
            <div className="flex items-baseline gap-3 mb-8">
              <h3 className="text-[100px] font-black leading-none tracking-tighter text-orange-500">{specs.solarKw.toFixed(2)}</h3>
              <span className="text-3xl font-black text-current opacity-40 italic">kW</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <ComponentRow icon={Sun} label="PV Panel Matrix" value={`${specs.solarKw.toFixed(1)} kW`} />
              <ComponentRow icon={Cpu} label="Hybrid Inverter" value={`${specs.inverterKw.toFixed(2) || (specs.solarKw * 0.8).toFixed(1)} kW`} />
              <ComponentRow icon={BatteryMedium} label="LFP Battery Storage" value={`${specs.storageKwh.toFixed(2)} kWh`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {specs.solarKw > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-10 left-[420px] right-10 z-50 space-y-4"
          >
            <div className={cn("w-[46.5%] h-36 ml-11 rounded-[2rem] border backdrop-blur-2xl p-6 flex flex-col justify-center relative", isDark ? "bg-black/20 border-white/5" : "bg-white/20 border-white/60")}>
              <div className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                <Activity size={12} className="text-orange-500" /> Dynamic Load Projection
              </div>
              <div className="flex items-end h-30 mt-9 gap-1">
                {loadCurveData.map((h, i) => (
                  <motion.div
                    key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                    className={cn("flex-1 rounded-t-sm transition-all", i > 5 && i < 18 ? "bg-orange-500/60 shadow-[0_0_10px_rgba(249,115,22,0.2)]" : "bg-current/10")}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 ml-11 ">
              <ImpactBox isDark={isDark} label="Investment Recovery" value={`Rs ${(specs.monthlySavings / 1000).toFixed(1)}k`} sub="Monthly ROI" icon={Wallet} color="text-emerald-500" />
              <ImpactBox isDark={isDark} label="Inflation Mastery" value={`${specs.gridImpact || 98}%`} sub="Cost Hedged" icon={TrendingUp} color="text-blue-500" />

              <div
                onClick={() => setShowTierDetails(true)}
                className={cn("flex-[1.2] p-6 rounded-[2rem] border cursor-pointer hover:scale-[1.02] transition-transform shadow-lg", isDark ? "bg-black/20 border-white/5" : "bg-white/20 border-white/60")}
              >
                <p className="text-[8px] font-black uppercase tracking-widest mb-1">System Metadata</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase flex items-center opacity-80 gap-1"><Layers size={10} /> {specs.packageId || "Smart Lite"}</p>
                    <p className="text-[8px] opacity-40 font-bold uppercase">Package Tier</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase opacity-80">3.2 Years</p>
                    <p className="text-[8px] opacity-40 font-bold uppercase">ROI Est.</p>
                  </div>
                </div>
              </div>

              <ImpactBox isDark={isDark} label="Carbon Offset" value={`${specs.carbonOffset.toFixed(1)} KG`} sub="Impact" icon={TreeDeciduous} color="text-emerald-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTierDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/40 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className={cn("w-[600px] p-8 rounded-[3rem] border shadow-2xl relative", isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200")}>
              <button onClick={() => setShowTierDetails(false)} className="absolute top-6 right-6 opacity-40 hover:opacity-100"><X size={24} /></button>

              {(() => {
                const pd = getPackageDetails(specs.packageId);
                return (
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-2">{pd.title}</h3>
                    <p className="text-sm opacity-60 mb-6 font-medium italic">Optimized configuration and support for the selected package.</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Target</p>
                        <p className="text-sm font-bold">{pd.target}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Capacity</p>
                        <p className="text-sm font-bold">{pd.capacity}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-3">Powers</p>
                      <ul className="list-disc ml-5 space-y-1 text-sm">
                        {pd.powers.map((p: string, i: number) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

function ImpactBox({ label, value, sub, icon: Icon, color, isDark }: any) {
  return (
    <div className={cn("flex-1 p-6 rounded-[2rem] backdrop-blur-3xl border shadow-xl flex flex-col justify-between", isDark ? "bg-black/20 border-white/5" : "bg-white/20 border-white/60")}>
      <div className="flex justify-between items-start"><p className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</p><Icon size={14} className={color} /></div>
      <div><h4 className={cn("text-2xl font-black tracking-tighter", color)}>{value}</h4><p className="text-[9px] font-bold opacity-40 uppercase mt-1">{sub}</p></div>
    </div>
  );
}