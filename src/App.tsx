import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Zap, BarChart3, Globe, Leaf, TrendingDown, Wallet } from 'lucide-react';
import PlanningPanel from './components/PlanningPanel';
import EnergyHub from './components/EnergyHub';
import SolarHouse3D from './components/SolarHouse/SolarHouse3D';
import { Appliance } from './types';
import { UI_NAME_TO_ID } from './config/applianceConfigs';
import { cn } from './lib/utils';
import { calculateSystemSpecs, SolarSystemSpecs } from './utils/solarMath';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [interactionLevel, setInteractionLevel] = useState<'initial' | 'bill-uploaded' | 'appliances-selected'>('initial');
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [billUnits, setBillUnits] = useState(0);
  const [userData, setUserData] = useState({ name: '', address: '', city: 'Islamabad' });
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [billRandomOffsets, setBillRandomOffsets] = useState({ solar: 0, storage: 0, inverter: 0 });
  const [specs, setSpecs] = useState<SolarSystemSpecs | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // RE-CALCULATE SPECS ON EVERY CHANGE
  useEffect(() => {
    if (interactionLevel !== 'initial') {
      const newSpecs = calculateSystemSpecs(billUnits, monthlyHistory, selectedAppliances, billRandomOffsets);
      setSpecs(newSpecs);
    }
  }, [billUnits, monthlyHistory, selectedAppliances, interactionLevel]);
  
  // const handleFileUpload = async (file: File) => {
  //   setIsScanning(true);
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   try {
  //     const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  //     const response = await fetch(`${apiUrl}/upload-bill`, { method: 'POST', body: formData });
  //     const result = await response.json();
      
  //     if (result.success) {
  //       const d = result.data;
  //       setBillUnits(Number(d.billing?.units_consumed || 200));
  //       setUserData({
  //         name: d.consumer_details?.name || 'Valued Customer',
  //         address: d.consumer_details?.address || '',
  //         city: d.consumer_details?.address?.split(',').pop()?.trim() || 'Islamabad'
  //       });
  //       setMonthlyHistory(d.monthly_history || []);
  //       setInteractionLevel('bill-uploaded');
  //     }
  //   } catch (err) {
  //     console.error("Upload failed", err);
  //   } finally {
  //     setIsScanning(false);
  //   }
  // };
  const handleFileUpload = async (file: File) => {
    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/upload-bill`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // MATCHING YOUR BACKEND KEYS:
        const d = result.data;
        
        console.log("✅ Scraper Success:", d);

        setBillUnits(Number(d.units_consumed) || 0);
        
        // Update user data with actual backend keys
        setUserData({
          name: d.consumer_name || 'Nadeem Ahmed',
          address: '', 
          city: d.location || 'TAXILA' 
        });

        // Update history if available, else empty array
        setMonthlyHistory(d.monthly_history || []);
        
        // Trigger the UI flow
        setInteractionLevel('bill-uploaded');
        setUserLocation(d.location || 'TAXILA');
        
        // Generate static offsets so numbers don't jump randomly later
        setBillRandomOffsets({
          solar: Math.random() * 0.5,
          storage: Math.random() * 0.8,
          inverter: Math.random() * 0.3,
        });

      } else {
        alert("Failed to parse bill details.");
      }
    } catch (err) {
      console.error("Connection to scraper failed:", err);
      alert("Could not connect to backend server.");
    }
  };

  const toggleAppliance = (name: string) => {
    const techId = UI_NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, '-');
    setSelectedAppliances(prev => {
      const exists = prev.find(a => a.id === techId);
      if (exists) return prev.filter(a => a.id !== techId);
      return [...prev, { id: techId, name, wattage: 500, quantity: 1, icon: 'zap' }];
    });
    setInteractionLevel('appliances-selected');
  };

  const hasEVCar = selectedAppliances.some(a => a.id === 'tesla');
  const hasEVBike = selectedAppliances.some(a => a.id === 'bike');

  return (
    <div className="h-screen w-full bg-[var(--surface)] text-[var(--fg)] overflow-hidden font-sans transition-colors duration-500">
      <header className="h-20 px-8 flex justify-between items-center z-50 relative border-b border-[var(--border)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-[var(--card)]">
            <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">SKYELECTRIC</span>
        </div>
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
          {theme === 'dark' ? <Sun className="w-5 h-5 text-solar-gold" /> : <Moon className="w-5 h-5 text-solar-electric" />}
        </button>
      </header>

      <main className="h-[calc(100vh-80px)] grid grid-cols-[380px_1fr_400px] relative">
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

        <section className="relative h-full flex flex-col items-center justify-center">
          <AnimatePresence>
            {specs && (
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-8 flex gap-4 z-20">
                <StatusBadge icon={Globe} label={`Region: ${userData.city}`} color="emerald" />
                <StatusBadge icon={BarChart3} label="Status: Calculating" color="electric" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="w-full h-full">
            <SolarHouse3D 
              appliances={selectedAppliances} 
              evInfo={{ status: hasEVCar ? 'own' : 'none', showCar: hasEVCar, showBike: hasEVBike }} 
              isDark={theme === 'dark'} 
            />
          </div>

          <AnimatePresence>
            {specs && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-10 px-10 py-5 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] backdrop-blur-2xl flex gap-12 shadow-2xl z-20">
                 <StatMini label="Grid Impact" value={`-${specs.gridImpact.toFixed(0)}%`} icon={TrendingDown} color="text-solar-emerald" />
                 <div className="w-[1px] h-10 bg-[var(--border)]" />
                 <StatMini label="Carbon Offset" value={`${specs.carbonOffset.toFixed(1)} Tons`} icon={Leaf} color="text-solar-electric" />
                 <div className="w-[1px] h-10 bg-[var(--border)]" />
                 <StatMini label="Monthly Save" value={`Rs. ${(specs.monthlySavings/1000).toFixed(0)}k`} icon={Wallet} color="text-[var(--fg)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <aside className="h-full overflow-hidden border-l border-[var(--border)]">
          <EnergyHub interactionLevel={interactionLevel} specs={specs} />
        </aside>
      </main>
    </div>
  );
}

// ... StatMini and StatusBadge components remain same

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