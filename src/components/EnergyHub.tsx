import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Sun, Battery, Zap, Download, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface EnergyHubProps {
  interactionLevel: 'initial' | 'bill-uploaded' | 'appliances-selected';
  billUnits: number;
  selectedPlan: string;
}

const PLAN_DETAILS: Record<string, { name: string, hardware: string, system: string }> = {
  lite: {
    name: 'Smart Lite',
    hardware: '5kW Hybrid System | 5kWh Storage',
    system: 'Economy Optimized for Essential Loads'
  },
  plus: {
    name: 'Smart Plus',
    hardware: '10kW Hybrid System | 10kWh Storage',
    system: 'Balanced Capacity for Modern Home'
  },
  max: {
    name: 'Estate Max',
    hardware: '15kW+ Industrial System | 20kWh Storage',
    system: 'Full Energy Independence & Resilience'
  }
};

export default function EnergyHub({ interactionLevel, billUnits, selectedPlan = 'plus' }: EnergyHubProps) {
  const isFormed = interactionLevel !== 'initial';
  const isActive = interactionLevel === 'appliances-selected';
  const systemSize = billUnits > 0 ? (billUnits / 100).toFixed(1) : '0.0';
  const currentPlan = PLAN_DETAILS[selectedPlan] || PLAN_DETAILS.plus;

  return (
    <div className="h-full min-h-0 flex flex-col p-6 gap-6 overflow-y-auto overscroll-contain custom-scrollbar border-l border-[var(--border)] bg-[var(--surface)] backdrop-blur-3xl">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-electric">Solar Energy Hub</h3>
        <div className="px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] text-[8px] font-black opacity-40">STABLE</div>
      </div>

      {/* Selected System Configuration */}
      <div className={cn("p-5 rounded-3xl border border-solar-electric/20 bg-solar-electric/5 transition-all duration-700", !isFormed && "opacity-20")}>
        <div className="flex justify-between items-start mb-3">
           <div>
             <h4 className="text-sm font-black text-solar-electric">{currentPlan.name}</h4>
             <p className="text-[10px] text-[var(--muted)] font-bold">{currentPlan.system}</p>
           </div>
           <div className="px-2 py-1 bg-solar-electric text-black text-[9px] font-black rounded-lg">SELECTED</div>
        </div>
        <div className="flex items-center gap-3">
           <Zap className="w-4 h-4 text-solar-electric" />
           <span className="text-[11px] font-black text-[var(--fg)]">{currentPlan.hardware}</span>
        </div>
      </div>

      {/* Real-time System Specs */}
      <div className={cn("space-y-4 transition-all duration-700", !isFormed && "opacity-20")}>
        {[
          { icon: Sun, label: "Solar Array", value: `${systemSize} kW`, sub: "Mono-PERC 550W Panels", active: isActive },
          { icon: Battery, label: "Storage System", value: `${(parseFloat(systemSize) * 2).toFixed(1)} kWh`, sub: "LiFePO4 Active Cooling", active: isActive },
          { icon: Zap, label: "Inverter Matrix", value: `${systemSize} kW`, sub: "Hybrid Pure Sine Wave", active: isActive }
        ].map((spec, i) => (
          <motion.div
            key={spec.label}
            initial={{ x: 20, opacity: 0 }}
            animate={{ 
              x: isFormed ? 0 : 20, 
              opacity: isFormed ? 1 : 0.2 
            }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <SpecCard {...spec} />
          </motion.div>
        ))}
      </div>


      {/* Volatility & Insights */}
      <div className={cn("space-y-6 mt-4 transition-all duration-[1000ms]", !isFormed && "opacity-20")}>
        <section>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Economic Risk</span>
            <span className="text-[10px] font-black text-solar-emerald">Shield Active</span>
          </div>
          <div className="p-4 premium-glass rounded-2xl relative overflow-hidden group">
             <div className="flex items-center gap-3 mb-2 underline-offset-4 decoration-solar-emerald/30">
               <TrendingUp className="w-4 h-4 text-solar-emerald group-hover:scale-110 transition-transform" />
               <span className="text-[13px] font-black text-[var(--fg)]">Inflation Mastery</span>
             </div>
             <div className="text-[9px] text-[var(--muted)] leading-tight mb-3 italic">
               Decouple your energy costs from the grid's 14% annual inflation rate.
             </div>
             <div className="w-full h-1 bg-[var(--card)] rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: isFormed ? '92%' : 0 }}
                className="h-full bg-solar-emerald shadow-[0_0_10px_#10B981]"
               />
             </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2 opacity-40">
            <Info className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Meteorological Data</span>
          </div>
          <div className="p-4 premium-glass rounded-2xl border-solar-emerald/10 bg-solar-emerald/5">
            <p className="text-[11px] font-bold text-solar-emerald mb-1">Lahore Region</p>
            <p className="text-[9px] text-[var(--muted)] leading-relaxed">
              Verified 5.2 kWh/m² daily irradiance. 1825 annual sun hours. 
              <span className="text-solar-electric font-bold ml-1">Optimal Tilt: 28° South.</span>
            </p>
          </div>
        </section>
      </div>

      {/* Final Action */}
      <div className="mt-auto pt-6">
        <button 
          disabled={!isFormed}
          className="btn-proposal w-full flex items-center justify-center gap-3 group px-4 h-14"
        >
          <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          <span className="tracking-widest">Generate Proposal</span>
        </button>
      </div>
    </div>
  );
}

function SpecCard({ icon: Icon, label, value, sub, active }: any) {
  return (
    <div className={cn(
      "p-4 premium-glass rounded-2xl border-[var(--border)] flex items-center gap-4 transition-all group",
      active ? "border-solar-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.08)]" : "hover:border-solar-electric/30"
    )}>
      <div className="w-10 h-10 rounded-xl bg-solar-electric/10 flex items-center justify-center group-hover:bg-solar-electric/20 transition-all relative text-[var(--fg)]">
        <Icon className="w-5 h-5 text-solar-electric" />
        {active && (
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl bg-solar-emerald/30"
          />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest mb-0.5">{label}</div>
          {active && <div className="text-[8px] font-black text-solar-emerald bg-solar-emerald/10 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Live</div>}
        </div>
        <div className="text-[15px] font-display font-black leading-none mb-1 text-[var(--fg)]">{value}</div>
        <div className="text-[9px] text-[var(--muted)] font-medium tracking-tight font-sans opacity-80">{sub}</div>
      </div>
    </div>
  );
}
