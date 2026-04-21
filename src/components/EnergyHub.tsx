import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Battery, Zap, Info, Download, ChevronRight, X, Layout, Users, ShieldCheck, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

// Package Data Dictionary
const PACKAGES = {
  lite: {
    id: 'lite',
    name: 'Smart Lite',
    sub: 'Compact home, shared walls',
    target: 'Up to 10 Marla / 250 yards / Portions',
    capacity: '5–10 kW · 10 kWh Smart Battery',
    support: 'Mobile App + Cloud Monitoring',
    loads: ['Basic lights & fans', 'Fridge & LED TV', '1–2 Inverter ACs'],
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  plus: {
    id: 'plus',
    name: 'Smart Plus',
    sub: 'Full home backup for 1–2 Kanal',
    target: '1–2 Kanal / 500 yards Houses',
    capacity: '15–30 kW · 20–40 kWh Smart Battery',
    support: 'Mobile App + Cloud Monitoring',
    loads: ['Full home backup', '4–6 ACs + Water Pump', 'Built-in EV Charger'],
    color: 'text-solar-emerald',
    bg: 'bg-solar-emerald/10'
  },
  max: {
    id: 'max',
    name: 'Estate Max',
    sub: 'Large estates, high-capacity loads',
    target: 'Farmhouses / Large Estates / 1000 yards+',
    capacity: '50 kW+ · High-Capacity Lithium Bank',
    support: '24/7 Dedicated NOC Support',
    loads: ['Centralized cooling & pools', 'Lifts & heavy equipment', 'Multiple EV Chargers'],
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  }
};
export default function EnergyHub({ specs, interactionLevel }: any) {
  const isFormed = interactionLevel !== 'initial';
  
  // Use the specs passed from the parent
  const { solarKw, storageKwh, inverterKw, packageId } = specs || {
    solarKw: 0, storageKwh: 0, inverterKw: 0, packageId: 'lite'
  };

  //const currentPkg = PACKAGES[packageId];
  const currentPkg = PACKAGES[packageId as keyof typeof PACKAGES] || PACKAGES.lite;

// export default function EnergyHub({ interactionLevel, billUnits, appliances, billRandomOffsets }: any) {
  const [showDetails, setShowDetails] = useState(false);
//   const isFormed = interactionLevel !== 'initial';
//   const isActive = interactionLevel === 'appliances-selected';

  return (
    <div className="p-6 flex flex-col gap-6 h-full relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Recommendation</h3>
      </div>

      {/* Recommended Package Section */}
      <div className={cn(
        "p-6 rounded-[2rem] border transition-all duration-700 relative overflow-hidden", 
        isFormed ? "bg-[var(--card)] border-white/10 shadow-2xl" : "bg-[var(--card)] border-[var(--border)] opacity-20"
      )}>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className={cn("text-xl font-black italic tracking-tighter", isFormed ? currentPkg.color : "text-[var(--fg)]")}>
                  {isFormed ? currentPkg.name : "Analyzing..."}
                </h4>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{isFormed ? currentPkg.sub : "Requirement Pending"}</p>
              </div>
              {isFormed && (
                <button 
                  onClick={() => setShowDetails(true)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                  <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={cn("w-4 h-4", isFormed ? currentPkg.color : "text-white/20")} />
                <span className="text-[10px] font-bold opacity-80 italic">Tier Classification</span>
              </div>
              <button onClick={() => setShowDetails(true)} className="text-[9px] font-black uppercase text-solar-emerald underline underline-offset-4">Details</button>
            </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      {/* <div className="space-y-3">
        {[
          { icon: Sun, label: "Solar Array", val: solarKw, unit: "kW" },
          { icon: Battery, label: "Storage System", val: storageKwh, unit: "kWh" },
          { icon: Zap, label: "Inverter Matrix", val: inverterKw, unit: "kW" }
        ].map((spec, i) => (
          <motion.div
            key={spec.label}
            animate={{ opacity: isFormed ? 1 : 0.2, x: isFormed ? 0 : 20 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between group hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center border border-[var(--border)]">
                    <spec.icon className="w-5 h-5 text-solar-emerald" />
                </div>
                <div>
                    <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">{spec.label}</p>
                    <p className="text-xl font-black">{isFormed ? spec.val.toFixed(1) : "0.0"} <span className="text-xs opacity-30 tracking-normal font-bold">{spec.unit}</span></p>
                </div>
            </div>
          </motion.div>
        ))}
      </div> */}


      {/* <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <p className="text-[9px] font-black opacity-40 uppercase mb-2">Tier Classification</p>
        <h4 className={cn("text-xl font-black italic", currentPkg?.color)}>{isFormed ? currentPkg?.name : "Awaiting Bill"}</h4>
      </div> */}
      {/* Package Detail Modal Overlay */}
      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--card)] border border-white/10 w-full max-w-lg rounded-[3rem] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => setShowDetails(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={cn("h-32 w-full absolute top-0 left-0 opacity-20 blur-3xl", currentPkg.bg)} />

              <div className="p-10 relative z-10">
                <div className="mb-8">
                  <h2 className={cn("text-4xl font-black italic tracking-tighter mb-2", currentPkg.color)}>{currentPkg.name}</h2>
                  <p className="text-sm font-bold opacity-60">{currentPkg.sub}</p>
                </div>

                <div className="grid gap-6">
                  <DetailItem icon={Layout} label="Target Property" val={currentPkg.target} />
                  <DetailItem icon={Cpu} label="System Capacity" val={currentPkg.capacity} />
                  <DetailItem icon={ShieldCheck} label="Support Level" val={currentPkg.support} />
                  
                  <div className="pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Load Coverage</p>
                    <div className="flex flex-wrap gap-2">
                      {currentPkg.loads.map(load => (
                        <span key={load} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/80">
                          {load}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowDetails(false)}
                  className="w-full mt-10 h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[10px]"
                >
                  Close Specification
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ icon: Icon, label, val }: any) {
  return (
    <div className="flex gap-4 items-start">
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
        <Icon className="w-4 h-4 text-solar-emerald" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white/90">{val}</p>
      </div>
    </div>
  );
}