import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Battery, Zap, Home, Car, Bike, Plus, Minus, 
  Upload, FileText, Settings, ChevronRight, CheckCircle2,
  Info, Ruler, Moon, Lightbulb, Wind, Droplets
} from 'lucide-react';
import { InteractiveHouse } from './components/InteractiveHouse';
import { analyzeBill } from './services/geminiService';
import { InputMode, ApplianceCounts, CalculationResult } from './types';

export default function App() {
  const [mode, setMode] = useState<InputMode>(null);
  const [step, setStep] = useState(0);
  const [isNight, setIsNight] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Form States
  const [units, setUnits] = useState<number>(0);
  const [roofSize, setRoofSize] = useState<number>(0);
  const [appliances, setAppliances] = useState<ApplianceCounts>({
    ac15: 0,
    ac20: 0,
    fan: 0,
    light: 0,
    fridge: 0,
    motor: 0
  });
  const [hasEvCar, setHasEvCar] = useState(false);
  const [evCarModel, setEvCarModel] = useState('');
  const [hasEvBike, setHasEvBike] = useState(false);
  const [evBikeModel, setEvBikeModel] = useState('');
  const [otherKwh, setOtherKwh] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation cycle for day/night
  useEffect(() => {
    const interval = setInterval(() => {
      setIsNight(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApplianceChange = (key: keyof ApplianceCounts, delta: number) => {
    setAppliances(prev => ({
      ...prev,
      [key]: Math.min(10, Math.max(0, prev[key] + delta))
    }));
  };

  const calculate = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/calculate-from-units';
      let body: any = { units, roofSize };

      if (mode === 'appliances') {
        endpoint = '/api/calculate-from-appliances';
        body = { appliances, evCar: hasEvCar, evBike: hasEvBike, otherKwh, roofSize };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setResult(data);
      setStep(10); // Result step
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const extractedUnits = await analyzeBill(base64, file.type);
      if (extractedUnits) {
        setUnits(extractedUnits);
        setMode('units');
        setStep(1);
      } else {
        alert("Could not extract units from bill. Please enter manually.");
        setMode('units');
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const renderSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
      {[
        { id: 'bill', title: 'Upload Bill', icon: Upload, desc: 'Image or PDF only' },
        { id: 'units', title: 'Monthly Units', icon: Zap, desc: 'Enter kWh directly' },
        { id: 'appliances', title: 'By Appliances', icon: Home, desc: 'Interactive designer' }
      ].map((opt) => (
        <motion.button
          key={opt.id}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (opt.id === 'bill') fileInputRef.current?.click();
            else {
              setMode(opt.id as InputMode);
              setStep(1);
            }
          }}
          className="glass p-8 rounded-3xl flex flex-col items-center text-center group transition-colors hover:border-sky-blue"
        >
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-blue group-hover:text-white transition-colors">
            <opt.icon className="w-8 h-8 text-sky-blue group-hover:text-white" />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">{opt.title}</h3>
          <p className="text-slate-500 text-sm">{opt.desc}</p>
        </motion.button>
      ))}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
      />
    </div>
  );

  const renderApplianceForm = () => {
    const fields = [
      { key: 'ac15', label: 'AC 1.5 Ton', icon: Wind },
      { key: 'ac20', label: 'AC 2.0 Ton', icon: Wind },
      { key: 'fan', label: 'Fans', icon: Droplets },
      { key: 'light', label: 'Lights', icon: Lightbulb },
      { key: 'fridge', label: 'Refrigerators', icon: Settings },
      { key: 'motor', label: 'Motors', icon: Zap },
    ];

    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start px-4">
        <div className="space-y-6">
          {fields.map((f, idx) => (
            <div 
              key={f.key}
              className={`step-blur ${step < idx + 1 ? 'step-hidden' : 'step-visible'}`}
            >
              <div className="flex items-center justify-between p-4 glass rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="font-medium">{f.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleApplianceChange(f.key as keyof ApplianceCounts, -1)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{appliances[f.key as keyof ApplianceCounts]}</span>
                  <button 
                    onClick={() => {
                      handleApplianceChange(f.key as keyof ApplianceCounts, 1);
                      if (step === idx + 1) setStep(idx + 2);
                    }}
                    className="w-8 h-8 rounded-full bg-sky-blue text-white flex items-center justify-center hover:bg-sky-dark"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* EV Section */}
          <div className={`step-blur ${step < 7 ? 'step-hidden' : 'step-visible'} space-y-4`}>
            <div className="p-4 glass rounded-2xl">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Car className="w-6 h-6 text-sky-blue" />
                    <span className="font-medium">Do you have an EV Car?</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={hasEvCar} 
                    onChange={(e) => {
                      setHasEvCar(e.target.checked);
                      if (step === 7) setStep(8);
                    }}
                    className="w-6 h-6 accent-sky-blue"
                  />
               </div>
               {hasEvCar && (
                 <input 
                  type="text" 
                  placeholder="Enter Model (e.g. Tesla Model 3)"
                  value={evCarModel}
                  onChange={(e) => setEvCarModel(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-blue outline-none"
                 />
               )}
            </div>
          </div>

          <div className={`step-blur ${step < 8 ? 'step-hidden' : 'step-visible'} space-y-4`}>
            <div className="p-4 glass rounded-2xl">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Bike className="w-6 h-6 text-sky-green" />
                    <span className="font-medium">Do you have an EV Bike?</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={hasEvBike} 
                    onChange={(e) => {
                      setHasEvBike(e.target.checked);
                      if (step === 8) setStep(9);
                    }}
                    className="w-6 h-6 accent-sky-green"
                  />
               </div>
               {hasEvBike && (
                 <input 
                  type="text" 
                  placeholder="Enter Model"
                  value={evBikeModel}
                  onChange={(e) => setEvBikeModel(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-blue outline-none"
                 />
               )}
            </div>
          </div>

          <div className={`step-blur ${step < 9 ? 'step-hidden' : 'step-visible'}`}>
            <div className="p-4 glass rounded-2xl space-y-4">
              <div className="flex items-center gap-4">
                <Ruler className="w-6 h-6 text-slate-400" />
                <span className="font-medium">Roof Size (Optional sqft)</span>
              </div>
              <input 
                type="number" 
                placeholder="e.g. 500"
                value={roofSize || ''}
                onChange={(e) => setRoofSize(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
              <button 
                onClick={calculate}
                disabled={loading}
                className="w-full bg-sky-blue text-white py-4 rounded-2xl font-bold text-lg hover:bg-sky-dark transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Calculating...' : 'Get Recommendation'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="sticky top-24">
          <InteractiveHouse 
            appliances={{
              ac: appliances.ac15 + appliances.ac20,
              fan: appliances.fan,
              light: appliances.light,
              fridge: appliances.fridge,
              motor: appliances.motor
            }}
            isNight={isNight}
            hasPanels={false}
            isCharging={hasEvCar || hasEvBike}
          />
          <div className="mt-8 text-center text-slate-400 text-sm italic">
            Watch your house update as you add appliances!
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-blue rounded-full font-bold text-sm uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          Optimized for your home
        </div>
        <h2 className="text-5xl font-display font-extrabold leading-tight">
          Your Personalized <span className="text-sky-blue">Solar Solution</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Solar Panels', value: `${result?.suggestedPv} kW`, icon: Sun, color: 'text-yellow-500' },
            { label: 'Inverter', value: `${result?.suggestedInverter} kW`, icon: Zap, color: 'text-sky-blue' },
            { label: 'Battery', value: `${result?.suggestedBattery} kWh`, icon: Battery, color: 'text-sky-green' }
          ].map((item) => (
            <div key={item.label} className="glass p-6 rounded-3xl text-center">
              <item.icon className={`w-8 h-8 mx-auto mb-4 ${item.color}`} />
              <div className="text-2xl font-bold mb-1">{item.value}</div>
              <div className="text-slate-500 text-xs uppercase font-bold tracking-widest">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-sky-blue" />
            <h4 className="font-bold">Why this system?</h4>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Based on your consumption of ~{result?.monthlyUnits.toFixed(0)} units/month, this {result?.suggestedPv}kW system will offset 100% of your energy needs. 
            The {result?.suggestedBattery}kWh battery storage ensures your {hasEvCar ? evCarModel : 'home'} stays powered through the night and during outages.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-sky-blue hover:text-white transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>

      <div className="relative">
        <InteractiveHouse 
          appliances={{
            ac: appliances.ac15 + appliances.ac20,
            fan: appliances.fan,
            light: appliances.light,
            fridge: appliances.fridge,
            motor: appliances.motor
          }}
          isNight={isNight}
          hasPanels={true}
          isCharging={hasEvCar || hasEvBike}
        />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isNight ? 'bg-indigo-400' : 'bg-yellow-400'} animate-pulse`} />
          <span className="font-bold text-sm uppercase tracking-widest">
            {isNight ? 'Night Mode: Battery Power' : 'Day Mode: Solar Charging'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sky-blue rounded-xl flex items-center justify-center">
            <Sun className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-black tracking-tighter">
            SKY<span className="text-sky-blue">ELECTRIC</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-sky-blue transition-colors">Solutions</a>
          <a href="#" className="hover:text-sky-blue transition-colors">Impact</a>
          <button className="bg-slate-900 text-white px-6 py-2 rounded-full hover:bg-sky-blue transition-colors">
            Contact Us
          </button>
        </div>
      </header>

      <main className="pt-12">
        <AnimatePresence mode="wait">
          {!mode ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-12"
            >
              <div className="space-y-4 px-4">
                <h1 className="text-6xl md:text-7xl font-display font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
                  Design Your Own <br />
                  <span className="text-sky-blue">Solar System</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                  Get a precision-engineered solar recommendation in minutes. 
                  Choose how you'd like to start.
                </p>
              </div>
              {renderSelection()}
            </motion.div>
          ) : step === 10 ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-8"
            >
              {renderResult()}
            </motion.div>
          ) : mode === 'units' ? (
            <motion.div 
              key="units-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-xl mx-auto px-4 space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-display font-bold">Enter Your Consumption</h2>
                <p className="text-slate-500">How many units do you consume on average per month?</p>
              </div>
              <div className="glass p-8 rounded-3xl space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Monthly Units (kWh)</label>
                  <input 
                    type="number" 
                    value={units || ''}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full text-4xl font-display font-bold p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-blue outline-none transition-colors"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Roof Size (Optional sqft)</label>
                  <input 
                    type="number" 
                    value={roofSize || ''}
                    onChange={(e) => setRoofSize(Number(e.target.value))}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"
                    placeholder="e.g. 500"
                  />
                </div>
                <button 
                  onClick={calculate}
                  disabled={loading || !units}
                  className="w-full bg-sky-blue text-white py-5 rounded-2xl font-bold text-xl hover:bg-sky-dark transition-colors shadow-lg shadow-sky-blue/20"
                >
                  {loading ? 'Analyzing...' : 'Generate Design'}
                </button>
                <button 
                  onClick={() => setMode(null)}
                  className="w-full text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="appliance-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center mb-12 px-4">
                <h2 className="text-4xl font-display font-bold mb-2">Build Your Home Profile</h2>
                <p className="text-slate-500">Add your appliances to see the impact in real-time.</p>
              </div>
              {renderApplianceForm()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass px-6 py-3 rounded-full flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          <span>Powered by Gemini AI</span>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-sky-blue">SkyElectric Designer v1.0</span>
        </div>
      </footer>
    </div>
  );
}
