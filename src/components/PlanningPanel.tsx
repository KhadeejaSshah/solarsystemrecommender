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





// export default function PlanningPanel({
//   interactionLevel,
//   onFileUpload,
//   appliances,
//   onApplianceToggle
// }: any) {
//   // Category accordion closed by default
//   const [openSection, setOpenSection] = useState<string | null>(null);

//   const categories = [
//     { id: 'climate', name: 'Climate Control', icon: Wind, items: ['Air Conditioner', 'Ceiling Fan'] },
//     { id: 'kitchen', name: 'Kitchen & Power', icon: Utensils, items: ['Refrigerator', 'Microwave Oven', 'Water Motor', 'Electric Iron'] },
//     { id: 'entertainment', name: 'Living & Tech', icon: Tv, items: ['LED TV', 'LED Lights'] },
//     { id: 'ev', name: 'EV & Mobility', icon: Zap, items: ['EV Car', 'Electric Bike'] }
//   ];
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (!file) return;

//   const validTypes = ['image/png', 'application/pdf'];
//   if (!validTypes.includes(file.type)) {
//     alert("Upload only .png or .pdf");
//     e.target.value = "";
//     return;
//   }
  
//   // Pass the actual file object to the App.tsx handler
//   onFileUpload(file); 
// };
//   // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   const file = e.target.files?.[0];
//   //   if (!file) return;

//   //   const fileExt = file.name.split('.').pop()?.toLowerCase();
//   //   if (fileExt === 'png' || fileExt === 'pdf') {
//   //     onFileUpload({ monthlyUnits: 1200, name: 'Khadeeja', location: 'Islamabad' });
//   //   } else {
//   //     alert("Invalid format. Please upload only .png or .pdf files.");
//   //     e.target.value = ''; // Reset input
//   //   }
//   // };

//   const isSelected = (name: string) => appliances.some((a: any) => a.name === name);

//   return (
//     <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar bg-[var(--surface)]">
//       <div className="flex items-center gap-4 mb-2">
//         <div className="w-10 h-10 rounded-2xl bg-solar-emerald/10 border border-solar-emerald/20 flex items-center justify-center">
//           <Settings className="w-5 h-5 text-solar-emerald" />
//         </div>
//         <h2 className="text-xl font-black tracking-tight text-[var(--fg)]">Project Config</h2>
//       </div>

//       {/* Step 1: File Upload */}
//       <section className="space-y-4">
//         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40 italic">
//           <span>01. Digital Onboarding</span>
//           {interactionLevel !== 'initial' && <CheckCircle2 className="w-4 h-4 text-solar-emerald" />}
//         </div>
//         <div className={cn(
//           "p-8 rounded-[2.5rem] border-2 border-dashed transition-all relative group overflow-hidden",
//           interactionLevel === 'initial' ? "border-solar-emerald/40 bg-solar-emerald/5" : "border-[var(--border)] bg-[var(--card)] opacity-50"
//         )}>
//           <input 
//             type="file" 
//             accept=".png,.pdf" 
//             className="absolute inset-0 opacity-0 cursor-pointer z-10" 
//             onChange={handleFileChange}
//           />
//           <div className="flex flex-col items-center gap-3 text-center">
//             <FileText className="w-8 h-8 text-solar-emerald group-hover:scale-110 transition-transform" />
//             <p className="text-sm font-black text-[var(--fg)] italic">Drop Utility Bill Here</p>
//             <p className="text-[9px] font-bold opacity-40 uppercase">Only .png or .pdf</p>
//           </div>
//         </div>
//       </section>


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
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-5 rounded-[2rem] bg-solar-emerald/10 border border-solar-emerald/20">
            <h3 className="text-lg font-black text-solar-emerald mb-1 italic">Welcome, {userData.name}!</h3>
            <p className="text-[10px] font-bold opacity-60">Here is your personalized smart energy design for your property in <span className="text-green">{userData.city}</span>.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: File Upload */}
      <section className="space-y-4">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">01. Digital Onboarding</div>
        <div className={cn("p-8 rounded-[2.5rem] border-2 border-dashed transition-all relative group", isScanning ? "animate-pulse border-solar-electric bg-solar-electric/5" : "border-solar-emerald/40 bg-solar-emerald/5")}>
          <input type="file" accept=".png,.pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => onFileUpload(e.target.files![0])} />
          <div className="flex flex-col items-center gap-3 text-center">
            {isScanning ? <Zap className="w-8 h-8 text-solar-electric animate-spin" /> : <FileText className="w-8 h-8 text-solar-emerald" />}
            <p className="text-sm font-black italic">{isScanning ? "AI is Scanning..." : "Upload Utility Bill"}</p>
          </div>
        </div>
      </section>
      {/* <section className="space-y-4">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">01. Digital Onboarding</div>
        <div className={cn("p-8 rounded-[2.5rem] border-2 border-dashed transition-all relative group", isScanning ? "animate-pulse border-solar-electric" : "border-solar-emerald/40")}>
          <input type="file" accept=".png,.pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => onFileUpload(e.target.files![0])} />
          <div className="flex flex-col items-center gap-3 text-center">
            <FileText className={cn("w-8 h-8", isScanning ? "text-solar-electric animate-spin" : "text-solar-emerald")} />
            <p className="text-sm font-black italic">{isScanning ? 'AI Scanning Bill...' : 'Upload Utility Bill'}</p>
          </div>
        </div>
      </section> */}



      {/* Step 2: Appliance Selection */}
      <section className={cn(
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
      </section>

      {/* Investment Recovery - Hidden until upload */}
      <AnimatePresence>
        {interactionLevel !== 'initial' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-auto p-6 rounded-[2.5rem] bg-gradient-to-br from-solar-emerald/20 to-transparent border border-solar-emerald/20"
          >
            <div className="flex gap-4">
               <div className="p-3 rounded-2xl bg-solar-emerald text-black h-fit">
                 <MapPin className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[11px] font-black uppercase text-[var(--fg)] mb-1 tracking-tighter">Investment Recovery</p>
                 <p className="text-[10px] opacity-70 leading-relaxed font-medium">
                   System payback estimated in <span className="text-solar-emerald font-black">2.4 years</span>. ROI outpaces standard local bank deposits by 300%.
                 </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}