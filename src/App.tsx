import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sun, Moon, Zap } from 'lucide-react';
import PlanningPanel from './components/PlanningPanel';
import SolarHouse3D from './components/SolarHouse/SolarHouse3D';
import EnergyHub from './components/EnergyHub';
import { Appliance, UserData } from './types';
import { cn } from './lib/utils';
import { UI_NAME_TO_ID } from './config/applianceConfigs';

type InteractionLevel = 'initial' | 'bill-uploaded' | 'appliances-selected';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [interactionLevel, setInteractionLevel] = useState<InteractionLevel>('initial');
  const [billUnits, setBillUnits] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<string>('plus');
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [evStatus, setEvStatus] = useState<'own' | 'planning' | 'none'>('none');

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const handleFileUpload = (data: { monthlyUnits: number }) => {
    setBillUnits(data.monthlyUnits);
    setInteractionLevel('bill-uploaded');
  };

  const toggleAppliance = (name: string) => {
    const techId = UI_NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, '-');

    if (techId === 'tesla' || techId === 'bike') {
      setEvStatus('own');
    }

    setSelectedAppliances(prev => {
      const exists = prev.find(a => a.id === techId);
      if (exists) {
        return prev.filter(a => a.id !== techId);
      }
      return [...prev, { id: techId, name, wattage: 500, quantity: 1, icon: 'zap' }];
    });
    
    if (interactionLevel === 'bill-uploaded') {
      setInteractionLevel('appliances-selected');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--fg)] transition-colors duration-500 selection:bg-solar-emerald/30 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-solar-electric/5 rounded-full blur-[120px]" />
      </div>

      <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 bg-solar-emerald/20 flex items-center justify-center rounded-xl border border-solar-emerald/30 glow-emerald">
            <Zap className="w-6 h-6 text-solar-emerald" />
          </div>
          <span className={cn(
            "text-2xl font-display font-black tracking-tighter transition-colors duration-500",
            theme === 'light' ? "text-slate-900" : "text-white"
          )}>
            SolarNest
          </span>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <nav className="hidden md:flex items-center gap-8 mr-8">
            {['Overview', 'Appliances', 'Financials'].map(link => (
              <a key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">{link}</a>
            ))}
          </nav>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md text-[var(--fg)] hover:scale-110 active:scale-95 transition-all shadow-lg"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-solar-gold" /> : <Moon className="w-5 h-5 text-solar-electric" />}
          </button>
        </div>
      </header>

      <main className="dashboard-grid relative z-10 pt-20 min-h-0">
        {/* Left Panel: Inputs & Steps */}
        <motion.div
          className="h-full min-h-0"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <PlanningPanel
            interactionLevel={interactionLevel}
            onFileUpload={handleFileUpload}
            selectedPlan={selectedPlan}
            onPlanSelect={setSelectedPlan}
            appliances={selectedAppliances}
            onApplianceToggle={toggleAppliance}
          />
        </motion.div>

        {/* Center Panel: High-Fidelity 3D Rotating Island */}
        <div className="relative h-full min-h-0">
          <SolarHouse3D
            appliances={selectedAppliances}
            evInfo={{ status: evStatus }}
            isDark={theme === 'dark'}
          />
        </div>

        {/* Right Panel: Energy Hub */}
        <motion.div
          className="h-full min-h-0"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <EnergyHub
            interactionLevel={interactionLevel}
            billUnits={billUnits}
            selectedPlan={selectedPlan}
          />
        </motion.div>
      </main>

      <CursorGlow />
    </div>
  );
}

function CursorGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-[600px] h-[600px] bg-solar-emerald/[0.1] rounded-full blur-[120px] pointer-events-none z-0 mix-blend-plus-lighter"
      animate={{
        x: mousePos.x - 300,
        y: mousePos.y - 300,
      }}
      transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 0.5 }}
    />
  );
}

