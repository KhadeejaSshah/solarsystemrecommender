import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Zap, Leaf,
  TrendingDown, Wallet, Battery,
  Activity, Download, Calendar
} from 'lucide-react';

// Components
import PlanningPanel from './components/PlanningPanel';
import EnergyHub from './components/EnergyHub';
import IntelligencePanel from './components/IntelligencePanel';
import GaugeChart from './components/GaugeChart';

// Config & Types
import { Appliance } from './types';
import { UI_NAME_TO_ID } from './config/applianceConfigs';
import { cn } from './lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
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

  const hasData = specs.solarKw > 0;

  return (
    <div className="h-screen w-full overflow-hidden font-sans relative bg-[#FDFCF9] text-slate-900">

      {/* ─── BACKDROP ─── */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-contain bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url('/house_static_zoom.png')`,
            backgroundPosition: 'right 10% center',
            backgroundSize: '55%',
          }}
        />
        {/* warm vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCF9] via-[#FDFCF9]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF9]/80 via-transparent to-[#FDFCF9]/40 pointer-events-none" />
      </div>

      {/* ─── TOP-RIGHT ACTIONS ─── */}
      <div className="absolute top-6 right-8 z-50 flex items-center gap-3">
        <AnimatePresence>
          {hasData && (
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 h-11 rounded-2xl bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate Proposal</span>
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:shadow-md transition-all"
        >
          {isDark ? <Sun size={16} className="text-solar-gold" /> : <Moon size={16} className="text-slate-400" />}
        </motion.button>
      </div>

      {/* ─── MAIN TITLE (right of sidebar) ─── */}
      <div className="absolute top-8 left-[420px] z-20 pointer-events-none">
        <h1 className="text-3xl font-black tracking-tight text-slate-800">Solar Energy Hub</h1>
        <div className="flex items-center gap-4 mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-1.5"><Sun size={11} className="text-solar-gold" /> House 1</span>
          <span className="flex items-center gap-1.5"><Calendar size={11} /> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>

      {/* ─── SIDEBAR ─── */}
      <aside className="fixed left-0 top-0 bottom-0 w-[396px] bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.04)] flex flex-col z-30">

        {/* Sidebar Header - SkyElectric Logo */}
        <div className="px-7 pt-6 pb-4 border-b border-slate-50">
          <img src="/logofull.png" alt="SkyElectric" className="h-10" />
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6 custom-scrollbar space-y-6">
          <AnimatePresence mode="wait">
            {interactionLevel === 'initial' ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="planning">
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
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="results" className="space-y-6">
                <EnergyOverviewCard specs={specs} />
                <EnergyHub interactionLevel={interactionLevel} specs={specs} isDark={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Gauge Footer */}
        <div className="px-7 py-4 border-t border-slate-50 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Total System Output</p>
              <p className="text-lg font-black text-slate-900 tracking-tight">{specs.gridImpact || 70}%</p>
            </div>
            <div className="w-16 h-16">
              <GaugeChart progress={specs.gridImpact || 70} label="" />
            </div>
          </div>
        </div>
      </aside>

      {/* ─── FLOATING BATTERY CARD (Top Right of backdrop) ─── */}
      <AnimatePresence>
        {hasData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
            className="fixed top-28 right-8 w-56 z-20"
          >
            <div className="p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Battery</span>
                <Battery size={16} className="text-solar-gold" />
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-black text-slate-900 leading-none">{(specs.storageKwh || 31).toFixed(0)}</span>
                <span className="text-xs font-bold text-solar-gold italic">kW</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-solar-gold to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: '72%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[9px] font-medium text-slate-400 mt-2 italic">Great day, charging good</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── BOTTOM STATS STRIP (Centered in right area) ─── */}
      <AnimatePresence>
        {hasData && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="fixed bottom-6 left-[420px] right-6 z-20 flex gap-4"
          >
            {/* Daily Energy Balance */}
            <div className="flex-1 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-lg">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Daily Energy Balance</h4>
              <div className="flex items-end gap-[3px] h-10">
                {[40, 60, 30, 80, 50, 70, 45, 90, 55, 65].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                    className="flex-1 bg-solar-gold/50 rounded-sm hover:bg-solar-gold transition-colors cursor-pointer"
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-between">
                <div><p className="text-[8px] font-bold uppercase text-slate-400">Generated</p><p className="text-sm font-black text-slate-900">6.3 kW</p></div>
                <div className="text-right"><p className="text-[8px] font-bold uppercase text-slate-400">Consumed</p><p className="text-sm font-black text-slate-900">4.5 kW</p></div>
              </div>
            </div>

            {/* Sunlight Hours */}
            <div className="flex-1 p-5 rounded-[1.5rem] bg-slate-900 text-white shadow-lg">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3">Sunlight Hours</h4>
              <svg className="w-full h-10" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path d="M 0,38 Q 50,2 100,38" fill="url(#sunGrad)" stroke="#fbbf24" strokeWidth="1.5" />
              </svg>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xl font-black tracking-tight leading-none">12.5 <span className="text-[9px] italic text-white/40">HRS</span></span>
                <div className="w-6 h-6 rounded-full bg-solar-gold flex items-center justify-center">
                  <Sun size={12} className="text-slate-900" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Energy Overview Card ───
function EnergyOverviewCard({ specs }: any) {
  const bars = [40, 60, 45, 90, 65, 30, 40, 55, 80, 70, 45, 60, 40, 50, 90, 75];

  return (
    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-5">
      <div className="space-y-0.5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Current Power</p>
        <div className="flex items-baseline gap-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">{(specs.solarKw || 3.25).toFixed(2)}</h2>
          <span className="text-sm font-bold text-slate-400 italic">kW</span>
        </div>
      </div>

      <div className="flex items-end justify-between h-16 gap-[2px]">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.03, duration: 0.5 }}
            className={cn(
              "flex-1 rounded-sm transition-colors cursor-pointer",
              i === 12 ? "bg-orange-400 hover:bg-orange-500" : "bg-solar-gold/40 hover:bg-solar-gold/70"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Earnings</p>
          <p className="text-sm font-black text-slate-900 tracking-tight">PKR {(specs.monthlySavings || 34578).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">CO₂ Offset</p>
          <p className="text-sm font-black text-emerald-500 tracking-tight">{(specs.carbonOffset || 6.12).toFixed(2)} KG</p>
        </div>
      </div>
    </div>
  );
}