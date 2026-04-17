import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  ChevronDown, 
  Zap, 
  Settings, 
  Navigation,
  Wind,
  Refrigerator,
  Tv,
  Utensils
} from 'lucide-react';
import { Appliance, APPLIANCES_LIST } from '../types';
import { cn } from '../lib/utils';

interface PlanningPanelProps {
  interactionLevel: 'initial' | 'bill-uploaded' | 'appliances-selected';
  onFileUpload: (data: { monthlyUnits: number }) => void;
  selectedPlan: string;
  onPlanSelect: (plan: string) => void;
  appliances: Appliance[];
  onApplianceToggle: (name: string) => void;
}

export default function PlanningPanel({
  interactionLevel,
  onFileUpload,
  selectedPlan,
  onPlanSelect,
  appliances,
  onApplianceToggle
}: PlanningPanelProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Group appliances by category
  const categories = [
    { id: 'climate', name: 'Climate Control', icon: Wind, items: ['Air Conditioner', 'Ceiling Fan'] },
    { id: 'kitchen', name: 'Kitchen & Appliances', icon: Utensils, items: ['Refrigerator', 'Microwave Oven', 'Water Motor', 'Electric Iron'] },
    { id: 'entertainment', name: 'Home Entertainment', icon: Tv, items: ['LED TV', 'LED Lights'] },
    { id: 'ev', name: 'EV & Mobility', icon: Zap, items: ['EV Car', 'Electric Bike'] }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload({ monthlyUnits: 1200 }); // Mocked for speed
  };

  const isSelected = (name: string) => appliances.some(a => a.name === name);

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar border-r border-[var(--border)] bg-[var(--surface)] backdrop-blur-3xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-solar-emerald/20 flex items-center justify-center">
          <Settings className="w-4 h-4 text-solar-emerald" />
        </div>
        <h2 className="text-xl font-black tracking-tighter text-[var(--fg)]">Project Config</h2>
      </div>

      {/* Step 1: Bill Upload */}
      <section className="space-y-4">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40 px-1">
          <span>01. Digital Onboarding</span>
          <span className="text-solar-emerald">Verified</span>
        </div>
        <div className={cn(
          "p-6 rounded-[2rem] border-2 border-dashed transition-all group relative overflow-hidden",
          interactionLevel === 'initial' 
            ? "border-solar-emerald/30 bg-solar-emerald/5" 
            : "border-[var(--border)] bg-[var(--card)] opacity-50"
        )}>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            onChange={handleFileUpload}
            accept=".pdf,image/*"
          />
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-full bg-solar-emerald/10 text-solar-emerald group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-[var(--fg)]">Upload Electric Bill</p>
              <p className="text-[10px] text-[var(--muted)] mt-1">PDF or Jpeg (Max 10MB)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Appliance Selection (Accordion) */}
      <section className={cn("space-y-4 transition-all duration-700", interactionLevel === 'initial' && "opacity-20 pointer-events-none grayscale")}>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">02. Demand Profiling</div>
        
        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const isOpen = openSection === cat.id;
            const CatIcon = cat.icon;
            const count = cat.items.filter(isSelected).length;

            return (
              <div key={cat.id} className={cn(
                "rounded-[1.5rem] border transition-all duration-500 overflow-hidden",
                isOpen ? "bg-[var(--card)] border-white/20" : "bg-transparent border-[var(--border)] hover:border-white/10"
              )}>
                <button 
                  onClick={() => setOpenSection(isOpen ? null : cat.id)}
                  className="w-full p-5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isOpen ? "bg-solar-electric/20 text-solar-electric" : "bg-[var(--card)] text-[var(--muted)]"
                    )}>
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-[var(--fg)]">{cat.name}</p>
                      <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">{count} Selected</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-[var(--muted)] transition-transform duration-500", isOpen && "rotate-180 text-solar-electric")} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 grid grid-cols-1 gap-2"
                    >
                      {cat.items.map(item => {
                        const active = isSelected(item);
                        return (
                          <button
                            key={item}
                            onClick={() => onApplianceToggle(item)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                              active 
                                ? "bg-solar-electric/10 border-solar-electric/30 text-solar-electric" 
                                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:bg-white/10"
                            )}
                          >
                            <span className="text-[11px] font-black">{item}</span>
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
                              active ? "border-solar-electric bg-solar-electric" : "border-white/10"
                            )}>
                              {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Insight */}
      <div className="mt-auto p-5 rounded-3xl bg-solar-emerald/5 border border-solar-emerald/10">
        <div className="flex gap-4">
           <div className="p-2 rounded-xl bg-solar-emerald/20 h-fit">
             <Navigation className="w-4 h-4 text-solar-emerald" />
           </div>
           <div>
             <p className="text-[11px] font-black text-[var(--fg)] mb-1">ROI Tracking</p>
             <p className="text-[9px] text-[var(--muted)] leading-relaxed font-medium">
               Your energy profile currently predicts a <span className="text-solar-emerald font-bold">2.4 year payback period</span> based on current PKR tariffs.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
