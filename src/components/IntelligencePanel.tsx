import React from 'react';
import { motion } from 'framer-motion';
import { Info, Cpu, Activity, ShieldCheck } from 'lucide-react';

interface IntelligencePanelProps {
  isFormed: boolean;
  isDark: boolean;
}

export default function IntelligencePanel({ isFormed }: IntelligencePanelProps) {
  if (!isFormed) return null;

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed top-28 right-[280px] z-20 w-64 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-blue-400" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400">Site Intelligence</span>
          </div>
          <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
            Optimal Tilt: <span className="text-slate-900 font-bold">28° South</span> for Islamabad. Peak irradiance: <span className="text-slate-900 font-bold">5.2 kWh/m²</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Activity className="w-3 h-3 text-solar-gold mb-1.5" />
            <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Grid Sync</p>
            <p className="text-[10px] font-bold text-slate-900">50Hz Active</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-3 h-3 text-emerald-400 mb-1.5" />
            <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Redundancy</p>
            <p className="text-[10px] font-bold text-slate-900">Full N+1</p>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-2.5 bg-slate-200 rounded-full" />)}
          </div>
          <span className="text-[7px] font-bold uppercase tracking-wider text-slate-300">SN-2026-X1</span>
        </div>
      </div>
    </motion.div>
  );
}
