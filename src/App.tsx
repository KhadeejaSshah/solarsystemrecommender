import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Zap, BarChart3, Globe, Leaf, TrendingDown, Wallet } from 'lucide-react';
import PlanningPanel from './components/PlanningPanel';
import EnergyHub from './components/EnergyHub';
import SolarHouse3D from './components/SolarHouse/SolarHouse3D';
import { Appliance, APPLIANCES_LIST } from './types';
import { UI_NAME_TO_ID } from './config/applianceConfigs';
import { cn } from './lib/utils';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [interactionLevel, setInteractionLevel] = useState<'initial' | 'bill-uploaded' | 'appliances-selected'>('initial');
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [billUnits, setBillUnits] = useState(0);
  const [userLocation, setUserLocation] = useState('Islamabad');
  const [billRandomOffsets, setBillRandomOffsets] = useState({ solar: 0, storage: 0, inverter: 0 });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const handleFileUpload = (data: { monthlyUnits: number; name?: string; location?: string }) => {
    setBillUnits(data.monthlyUnits);
    setUserLocation(data.location || 'Islamabad');
    setBillRandomOffsets({
      solar: Math.random() * 1.6 + 0.4,
      storage: Math.random() * 2.8 + 1.2,
      inverter: Math.random() * 1.2 + 0.3,
    });
    setInteractionLevel('bill-uploaded');
  };
// 1. Calculate if the EV Car is selected
const hasEVCar = selectedAppliances.some(a => a.id === 'tesla');
const hasEVBike = selectedAppliances.some(a => a.id === 'bike');

// 2. Update the SolarHouse3D component call in the return statement:
<div className="w-full h-full">
  <SolarHouse3D 
    appliances={selectedAppliances} 
    evInfo={{ 
      status: hasEVCar ? 'own' : 'none',
      showCar: hasEVCar,
      showBike: hasEVBike 
    }} 
    isDark={theme === 'dark'} 
  />
</div>
  const toggleAppliance = (name: string) => {
    const techId = UI_NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, '-');
    setSelectedAppliances(prev => {
      const exists = prev.find(a => a.id === techId);
      if (exists) return prev.filter(a => a.id !== techId);
      const meta = APPLIANCES_LIST.find(a => a.id === techId || a.name === name);
      return [...prev, {
        id: techId,
        name,
        wattage: meta?.wattage ?? 500,
        quantity: 1,
        icon: meta?.icon ?? 'zap'
      }];
    });
    if (interactionLevel === 'bill-uploaded') setInteractionLevel('appliances-selected');
  };

  const isFormed = interactionLevel !== 'initial';

  return (
    <div className="h-screen w-full bg-[var(--surface)] text-[var(--fg)] overflow-hidden font-sans transition-colors duration-500">
      <header className="h-20 px-8 flex justify-between items-center z-50 relative border-b border-[var(--border)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-solar-emerald rounded-xl flex items-center justify-center shadow-lg shadow-solar-emerald/20">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">SkyElectric</span>
        </div>

        <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:scale-110 transition-all shadow-xl"
        >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-solar-gold" /> : <Moon className="w-5 h-5 text-solar-electric" />}
        </button>
      </header>

      <main className="h-[calc(100vh-80px)] grid grid-cols-[380px_1fr_400px] relative">
        <aside className="h-full overflow-y-auto custom-scrollbar border-r border-[var(--border)] bg-[var(--surface)]">
          <PlanningPanel 
            interactionLevel={interactionLevel}
            onFileUpload={handleFileUpload}
            appliances={selectedAppliances}
            onApplianceToggle={toggleAppliance}
          />
        </aside>

        <section className="relative h-full flex flex-col items-center justify-center">
          {/* Floating Badges - Only pop out after upload */}
          <AnimatePresence>
            {isFormed && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute top-8 flex gap-4 z-20"
              >
                <StatusBadge icon={Globe} label={`Region: ${userLocation}`} color="emerald" />
                <StatusBadge icon={BarChart3} label="Status: Calculating" color="electric" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="w-full h-full">
            <SolarHouse3D appliances={selectedAppliances} evInfo={{ status: 'none' }} isDark={theme === 'dark'} />
          </div>

          {/* Bottom Stats bar - Only pop out after upload */}
          <AnimatePresence>
            {isFormed && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-10 px-10 py-5 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] backdrop-blur-2xl flex gap-12 shadow-2xl z-20"
              >
                 <StatMini label="Grid Impact" value="-92%" icon={TrendingDown} color="text-solar-emerald" />
                 <div className="w-[1px] h-10 bg-[var(--border)]" />
                 <StatMini label="Carbon Offset" value="4.2 Tons" icon={Leaf} color="text-solar-electric" />
                 <div className="w-[1px] h-10 bg-[var(--border)]" />
                 <StatMini label="Monthly Save" value="Rs. 42k" icon={Wallet} color="text-[var(--fg)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <aside className="h-full overflow-y-auto custom-scrollbar border-l border-[var(--border)] bg-[var(--surface)]">
          <EnergyHub 
            interactionLevel={interactionLevel}
            billUnits={billUnits}
            appliances={selectedAppliances}
            billRandomOffsets={billRandomOffsets}
          />
        </aside>
      </main>
    </div>
  );
}

function StatusBadge({ icon: Icon, label, color }: any) {
  const styles: any = {
    emerald: 'text-solar-emerald bg-solar-emerald/10 border-solar-emerald/20',
    electric: 'text-solar-electric bg-solar-electric/10 border-solar-electric/20'
  };
  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md", styles[color])}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

function StatMini({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("p-2 rounded-xl bg-white/5", color)}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">{label}</p>
        <p className={cn("text-lg font-black tracking-tighter", color)}>{value}</p>
      </div>
    </div>
  );
}