import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Zap, 
  BarChart3, 
  Globe, 
  Leaf, 
  TrendingDown, 
  Wallet 
} from 'lucide-react';

// Components
import PlanningPanel from './components/PlanningPanel';
import EnergyHub from './components/EnergyHub';
import SolarHouse3D from './components/SolarHouse/SolarHouse3D';

// Config & Types
import { Appliance } from './types';
import { UI_NAME_TO_ID } from './config/applianceConfigs';
import { cn } from './lib/utils';

/**
 * PRODUCTION URL LOGIC
 * Vite uses import.meta.env.VITE_API_URL. 
 * If you are running locally, it defaults to 127.0.0.1:8000.
 * On a live server, set VITE_API_URL in your hosting dashboard.
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // UI Interaction States
  const [interactionLevel, setInteractionLevel] = useState<'initial' | 'bill-uploaded' | 'appliances-selected'>('initial');
  const [isScanning, setIsScanning] = useState(false);
  
  // User & Bill Data (Scraped from Backend)
  const [billUnits, setBillUnits] = useState(0);
  const [userData, setUserData] = useState({ 
    name: '', 
    city: '' 
  });

  // System Specification State (Calculated by Backend for Terminal Logging)
 // const [specs, setSpecs] = useState<any>(null);
  const [specs, setSpecs] = useState<any>({
      solarKw: 0,
      storageKwh: 0,
      inverterKw: 0,
      packageId: 'lite',
      gridImpact: 0,
      carbonOffset: 0,
      monthlySavings: 0
  });

  // Selected Appliances
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);

  // Effect to sync Dark Mode with Tailwind
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  /**
   * BACKEND CALCULATION CALL
   * Triggers the Engineering Logic in Python so formulas print to the terminal.
   */

// Initialize with a skeleton object instead of null to prevent EnergyHub crash


  const fetchSystemSpecs = async (units: number, apps: Appliance[]) => {
  try {
    const res = await fetch(`${API_BASE}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        units: units,       // Ensure keys match Backend CalculationRequest
        appliances: apps 
      }),
    });
    
    if (!res.ok) {
        console.error("Server Error:", res.status);
        return;
    }

    const data = await res.json();
    setSpecs(data);
  } catch (e) {
    console.error("Engineering Math Sync Error:", e);
  }
};

  /**
   * BILL UPLOAD HANDLER
   * Sends file to LlamaParse/Gemini scraper and processes results.
   */
  const handleFileUpload = async (file: File) => {
    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload-bill`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const d = result.data;
        
        // Match keys exactly as printed in your backend terminal
        const extractedUnits = Number(d.units_consumed) || 0;
        setBillUnits(extractedUnits);
        setUserData({
          name: d.consumer_name || 'Valued Customer',
          city: d.location || 'Islamabad'
        });

        setInteractionLevel('bill-uploaded');
        
        // Initial calculation call
        fetchSystemSpecs(extractedUnits, []);
      }
    } catch (err) {
      console.error("Scraper Connection Error:", err);
      alert("Failed to connect to the Smart Scraper. Ensure the backend is running.");
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * APPLIANCE TOGGLE LOGIC
   * Recalculates system size in real-time.
   */
  const toggleAppliance = (name: string) => {
    const techId = UI_NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, '-');
    
    setSelectedAppliances(prev => {
      const exists = prev.find(a => a.id === techId);
      let newSelection;
      
      if (exists) {
        newSelection = prev.filter(a => a.id !== techId);
      } else {
        newSelection = [...prev, { 
          id: techId, 
          name, 
          wattage: 500, 
          quantity: 1, 
          icon: 'zap' 
        }];
      }
      
      // Call backend calculation to trigger Terminal Prints
      fetchSystemSpecs(billUnits, newSelection);
      return newSelection;
    });

    if (interactionLevel === 'bill-uploaded') {
      setInteractionLevel('appliances-selected');
    }
  };

  const isFormed = interactionLevel !== 'initial';
  const hasEVCar = selectedAppliances.some(a => a.id === 'tesla' || a.name === 'EV Car');

  return (
    <div className="h-screen w-full bg-[var(--surface)] text-[var(--fg)] overflow-hidden font-sans transition-colors duration-500 selection:bg-solar-emerald/30 relative">
      
      {/* Sleek Cursor Glow Effect */}
      <CursorGlow />

      <header className="h-20 px-8 flex justify-between items-center z-50 relative border-b border-[var(--border)] backdrop-blur-md bg-[var(--surface)]/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-solar-emerald/20 overflow-hidden bg-[var(--card)]">
            <img src="/logo.png" alt="SKYELECTIC logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="text-xl font-black tracking-tighter uppercase italic">SKYELECTRIC</span>
            <span className="text-[8px] font-bold tracking-[0.4em] text-solar-emerald">AI DESIGN SUITE</span>
          </div>
        </div>

        <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:scale-110 active:scale-95 transition-all shadow-xl"
        >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-solar-gold animate-pulse" /> : <Moon className="w-5 h-5 text-solar-electric" />}
        </button>
      </header>

      <main className="h-[calc(100vh-80px)] grid grid-cols-[380px_1fr_400px] relative z-10">
        
        {/* LEFT: Inputs & User Context */}
        <aside className="h-full overflow-hidden border-r border-[var(--border)]">
          <PlanningPanel 
            interactionLevel={interactionLevel}
            onFileUpload={handleFileUpload}
            appliances={selectedAppliances}
            onApplianceToggle={toggleAppliance}
            isScanning={isScanning}
            userData={userData}
          />
        </aside>

        {/* CENTER: 3D Visualization & Floating Impact Metrics */}
        <section className="relative h-full flex flex-col items-center justify-center overflow-hidden">
          
          <AnimatePresence>
            {isFormed && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-8 flex gap-4 z-20"
              >
                <StatusBadge icon={Globe} label={`Region: ${userData.city}`} color="emerald" />
                <StatusBadge icon={BarChart3} label="Status: Optimized" color="electric" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <SolarHouse3D 
                appliances={selectedAppliances} 
                evInfo={{ status: hasEVCar ? 'own' : 'none' }} 
                isDark={theme === 'dark'} 
            />
          </div>

          <AnimatePresence>
            {specs && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-10 px-10 py-5 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] backdrop-blur-2xl flex gap-12 shadow-2xl z-20 border-white/5"
              >
                 <StatMini 
                    label="Grid Impact" 
                    value={`-${specs.gridImpact?.toFixed(0)}%`} 
                    icon={TrendingDown} 
                    color="text-solar-emerald" 
                 />
                 <div className="w-[1px] h-10 bg-[var(--border)]" />
                 <StatMini 
                    label="Carbon Offset" 
                    value={`${specs.carbonOffset?.toFixed(1)} Tons`} 
                    icon={Leaf} 
                    color="text-solar-electric" 
                 />
                 <div className="w-[1px] h-10 bg-[var(--border)]" />
                 <StatMini 
                    label="Monthly Save" 
                    value={`Rs. ${(specs.monthlySavings / 1000).toFixed(0)}k`} 
                    icon={Wallet} 
                    color="text-[var(--fg)]" 
                 />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT: System Specs & Packages */}
        <aside className="h-full overflow-hidden border-l border-[var(--border)]">
          <EnergyHub 
            interactionLevel={interactionLevel}
            specs={specs}
          />
        </aside>
      </main>
    </div>
  );
}

/**
 * UI HELPER: Status Badge (Region/Status)
 */
function StatusBadge({ icon: Icon, label, color }: any) {
  const styles: any = {
    emerald: 'text-solar-emerald bg-solar-emerald/10 border-solar-emerald/20',
    electric: 'text-solar-electric bg-solar-electric/10 border-solar-electric/20'
  };
  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg", styles[color])}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

/**
 * UI HELPER: Mini Stat (Bottom Impact Bar)
 */
function StatMini({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("p-2 rounded-xl bg-white/5 shadow-inner", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={cn("text-lg font-black tracking-tighter leading-none", color)}>{value}</p>
      </div>
    </div>
  );
}

/**
 * UI HELPER: Decorative Background Glow
 */
function CursorGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 bg-solar-emerald/30"
      animate={{
        x: mousePos.x - 300,
        y: mousePos.y - 300,
      }}
      transition={{ type: 'spring', damping: 50, stiffness: 200 }}
    />
  );
}