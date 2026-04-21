import React from 'react';
import { motion } from 'framer-motion';
import { Info, Cpu, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface IntelligencePanelProps {
  isFormed: boolean;
  isDark: boolean;
}

export default function IntelligencePanel({ isFormed, isDark }: IntelligencePanelProps) {
  if (!isFormed) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed bottom-8 right-8 z-50 w-80 p-6 rounded-[2.5rem] border backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500",
        isDark ? "bg-slate-950/40 border-white/10" : "bg-white/60 border-black/5"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-solar-emerald/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-solar-emerald" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Intelligence Node</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-solar-emerald/10 border border-solar-emerald/20">
          <div className="w-1.5 h-1.5 rounded-full bg-solar-emerald animate-pulse" />
          <span className="text-[8px] font-black text-solar-emerald uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-solar-electric" />
            <span className="text-[9px] font-black uppercase tracking-widest text-solar-electric">Site Intelligence</span>
          </div>
          <p className="text-[11px] font-medium opacity-70 leading-relaxed italic">
            Optimal Tilt: <span className="text-[var(--fg)] font-black">28° South</span> for Islamabad Region. Peak irradiance verified at <span className="text-[var(--fg)] font-black">5.2 kWh/m²</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <Activity className="w-3.5 h-3.5 text-solar-gold mb-2" />
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Grid Sync</p>
            <p className="text-[10px] font-bold">50Hz Active</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-solar-emerald mb-2" />
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Redundancy</p>
            <p className="text-[10px] font-bold">Full N+1</p>
          </div>
        </div>
        
        <div className="pt-2 flex items-center justify-between opacity-30">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-current rounded-full" />)}
          </div>
          <span className="text-[7px] font-black uppercase tracking-tighter">System ID: SN-2026-X1</span>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-solar-emerald/10 blur-[50px] -z-10 pointer-events-none" />
    </motion.div>
  );
}
