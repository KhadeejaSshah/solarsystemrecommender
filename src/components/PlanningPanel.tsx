import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  ChevronDown, 
  Settings, 
  Wind, 
  Utensils, 
  Tv, 
  Zap, 
  MapPin, 
  CheckCircle2,
  Bike,
  Car
} from 'lucide-react';
import { cn } from '../lib/utils';


export default function PlanningPanel({ interactionLevel, onFileUpload, appliances, onApplianceToggle, isScanning, userData }: any) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const categories = [
    { id: 'climate', name: 'Climate Control', icon: Wind, items: ['Air Conditioner', 'Ceiling Fan'] },
    { id: 'kitchen', name: 'Kitchen & Power', icon: Utensils, items: ['Refrigerator', 'Microwave Oven', 'Water Motor', 'Electric Iron'] },
    { id: 'entertainment', name: 'Living & Tech', icon: Tv, items: ['LED TV', 'LED Lights'] },
    { id: 'ev', name: 'EV & Mobility', icon: Zap, items: ['EV Car', 'Electric Bike'] }
  ];
     const isSelected = (name: string) => appliances.some((a: any) => a.name === name);

  return (
    <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
      {/* Personalized Greeting */}
      <AnimatePresence>
        {interactionLevel !== 'initial' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-1">Welcome, {userData.name}!</h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-loose">Personalized smart energy design for <span className="text-solar-gold font-black">{userData.city}</span>.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: File Upload */}
      <section className="space-y-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">01. Digital Onboarding</div>
        <div className={cn("p-8 rounded-[2.5rem] border-2 border-dashed transition-all relative group", isScanning ? "animate-pulse border-solar-gold bg-solar-gold/5" : "border-slate-200 bg-slate-50 shadow-inner")}>
          <input type="file" accept=".png,.pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => onFileUpload(e.target.files![0])} />
          <div className="flex flex-col items-center gap-3 text-center">
            {isScanning ? <Zap className="w-8 h-8 text-solar-gold animate-spin" /> : <FileText className="w-8 h-8 text-slate-400 group-hover:text-solar-gold transition-colors" />}
            <p className="text-sm font-black text-slate-900">{isScanning ? "AI is Scanning..." : "Upload Utility Bill"}</p>
          </div>
        </div>
      </section>
    

      {/* Step 2: Appliance Selection */}
      {/* <section className={cn(
        "space-y-3 transition-all duration-700", 
        interactionLevel === 'initial' && "opacity-20 pointer-events-none grayscale"
      )}>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">02. Demand Profiling</div>
        
        {categories.map((cat) => (
          <div key={cat.id} className={cn(
            "rounded-3xl border border-[var(--border)] transition-all overflow-hidden",
            openSection === cat.id ? "bg-[var(--card)] shadow-xl" : "bg-transparent"
          )}>
            <button 
              onClick={() => setOpenSection(openSection === cat.id ? null : cat.id)}
              className="w-full p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 text-left">
                <cat.icon className={cn("w-5 h-5", openSection === cat.id ? "text-solar-emerald" : "opacity-30")} />
                <div>
                  <p className="text-xs font-black text-[var(--fg)]">{cat.name}</p>
                  <p className="text-[9px] font-bold opacity-40 uppercase">{cat.items.filter(isSelected).length} active</p>
                </div>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-500", openSection === cat.id && "rotate-180")} />
            </button>

            <AnimatePresence>
              {openSection === cat.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 grid gap-2"
                >
                  {cat.items.map(item => {
                    const active = isSelected(item);
                    return (
                      <button
                        key={item}
                        onClick={() => onApplianceToggle(item)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                          active ? "bg-solar-emerald/10 border-solar-emerald/30 text-solar-emerald" : "bg-[var(--surface)] border-[var(--border)] opacity-60"
                        )}
                      >
                        <span className="text-[11px] font-black">{item}</span>
                        <div className={cn("w-4 h-4 rounded-full border-2", active ? "bg-solar-emerald border-solar-emerald" : "border-white/10")} />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section> */}
      {/* Step 2: Optional Appliance Journey */}
<section
  className={cn(
    "space-y-4 transition-all duration-700",
    interactionLevel === "initial" &&
      "opacity-20 pointer-events-none grayscale"
  )}
>
  <div className="flex items-center justify-between">
    <div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
        02. Optional Appliance Journey
      </div>
      <p className="text-[10px] opacity-40 font-bold uppercase">
        Add appliances (Optional)
      </p>
    </div>
  </div>

  <div className="grid grid-cols-3 gap-3">
    {categories.map((cat) => (
      <div
        key={cat.id}
        className={cn(
          "rounded-3xl border border-[var(--border)] transition-all overflow-hidden",
          openSection === cat.id
            ? "bg-[var(--card)] shadow-xl"
            : "bg-transparent"
        )}
      >
        {/* Icon Card */}
        <button
          onClick={() =>
            setOpenSection(openSection === cat.id ? null : cat.id)
          }
          className="w-full p-4 flex flex-col items-center gap-2"
        >
          <cat.icon
            className={cn(
              "w-6 h-6 transition-all",
              openSection === cat.id
                ? "text-solar-gold"
                : "opacity-30"
            )}
          />

          <p className="text-[10px] font-black text-center text-[var(--fg)]">
            {cat.name}
          </p>

          <p className="text-[8px] uppercase opacity-40 font-bold">
            {cat.items.filter(isSelected).length} selected
          </p>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {openSection === cat.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-3 pb-3 grid gap-2"
            >
              {cat.items.map((item) => {
                const active = isSelected(item);

                return (
                  <button
                    key={item}
                    onClick={() => onApplianceToggle(item)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border transition-all text-left",
                      active
                        ? "bg-solar-gold/10 border-solar-gold/30 text-slate-900"
                        : "bg-white border-slate-100 opacity-60"
                    )}
                  >
                    <span className="text-[10px] font-black">
                      {item}
                    </span>

                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2",
                        active
                          ? "bg-solar-gold border-solar-gold shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                          : "border-slate-200"
                      )}
                    />
                  </button>
                );
              })}

              {/* Close Button */}
              <button
                onClick={() => setOpenSection(null)}
                className="text-[9px] uppercase font-bold opacity-40 hover:opacity-80 pt-2"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ))}
  </div>
</section>

      <AnimatePresence>
        {interactionLevel !== 'initial' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6 p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl"
          >
            <div className="flex gap-4">
               <div className="p-3 rounded-2xl bg-solar-gold text-slate-900 h-fit">
                 <MapPin className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[11px] font-black uppercase text-white/40 mb-1 tracking-widest">Investment Recovery</p>
                 <p className="text-[10px] opacity-70 leading-relaxed font-medium">
                   System payback estimated in <span className="text-solar-gold font-black">2.4 years</span>. ROI outpaces standard bank deposits by 300%.
                 </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}