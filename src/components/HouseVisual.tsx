import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appliance, EVInfo } from '../types';
import { Car, Bike, Sun, Moon, Battery, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApplianceIcon } from './ApplianceIcons';

interface HouseVisualProps {
  appliances: Appliance[];
  evInfo: EVInfo;
}

export default function HouseVisual({ appliances, evInfo }: HouseVisualProps) {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsNight(prev => !prev);
    }, 8000); // Cycle every 8 seconds
    return () => clearInterval(interval);
  }, []);

  // Define room-based slots for appliances in the new modern house layout
  const applianceSlots: Record<string, { left: string; top: string; room: string }> = {
    'fridge': { left: '35%', top: '75%', room: 'Kitchen' },
    'microwave': { left: '42%', top: '75%', room: 'Kitchen' },
    'tv': { left: '75%', top: '75%', room: 'Living' },
    'lights': { left: '85%', top: '75%', room: 'Living' },
    'ac': { left: '35%', top: '45%', room: 'Bedroom' },
    'fan': { left: '45%', top: '45%', room: 'Bedroom' },
    'iron': { left: '75%', top: '45%', room: 'Study' },
    'motor': { left: '15%', top: '85%', room: 'Utility' },
  };

  const fallbackSlots = [
    { left: '35%', top: '60%' },
    { left: '45%', top: '60%' },
    { left: '55%', top: '60%' },
    { left: '65%', top: '60%' },
  ];

  return (
    <div className={cn(
      "relative w-full h-full flex items-center justify-center p-4 overflow-hidden transition-colors duration-[2000ms]",
      isNight ? "bg-slate-900" : "bg-sky-50"
    )}>
      {/* Sky Elements */}
      <div className="absolute top-10 right-10">
        <AnimatePresence mode="wait">
          {isNight ? (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-yellow-100"
            >
              <Moon className="w-12 h-12 fill-current" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-yellow-400"
            >
              <Sun className="w-12 h-12 fill-current animate-spin-slow" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern House SVG */}
      <div className="relative aspect-[4/3] w-full max-w-2xl">
        <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl">
          {/* Ground */}
          <rect x="0" y="250" width="400" height="50" fill={isNight ? "#0f172a" : "#e2e8f0"} />
          
          {/* Pool */}
          <motion.rect 
            x="20" y="240" width="180" height="40" 
            fill="#38bdf8" 
            opacity={isNight ? 0.4 : 0.6}
            animate={{ opacity: isNight ? [0.3, 0.5, 0.3] : [0.5, 0.7, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <rect x="20" y="240" width="180" height="2" fill="white" opacity="0.3" />

          {/* Left Section (Grey with sloped roof) */}
          <path d="M40 250 V120 L180 80 V250 Z" fill={isNight ? "#1e293b" : "#475569"} />
          <path d="M40 120 L180 80 L190 90 L50 130 Z" fill={isNight ? "#0f172a" : "#334155"} /> {/* Roof edge */}

          {/* Right Section (White Boxy) */}
          <rect x="180" y="100" width="160" height="150" fill={isNight ? "#334155" : "#f8fafc"} />
          <rect x="180" y="100" width="160" height="10" fill={isNight ? "#1e293b" : "#e2e8f0"} /> {/* Roof edge */}

          {/* Balcony */}
          <rect x="180" y="150" width="160" height="5" fill={isNight ? "#0f172a" : "#94a3b8"} />
          <rect x="190" y="110" width="140" height="40" fill={isNight ? "#1e293b" : "#cbd5e1"} opacity="0.3" /> {/* Balcony glass */}

          {/* Windows with Night Glow */}
          {/* Left Window */}
          <rect x="60" y="150" width="80" height="70" fill={isNight ? "#fef08a" : "#94a3b8"} opacity={isNight ? 0.8 : 0.2} className="transition-all duration-[2000ms]" />
          <rect x="60" y="150" width="80" height="70" fill="none" stroke={isNight ? "#fde047" : "#475569"} strokeWidth="2" />
          
          {/* Right Windows */}
          <rect x="200" y="170" width="50" height="60" fill={isNight ? "#fef08a" : "#94a3b8"} opacity={isNight ? 0.8 : 0.2} className="transition-all duration-[2000ms]" />
          <rect x="270" y="170" width="50" height="60" fill={isNight ? "#fef08a" : "#94a3b8"} opacity={isNight ? 0.8 : 0.2} className="transition-all duration-[2000ms]" />
          
          {/* Door */}
          <rect x="190" y="210" width="30" height="40" fill="#1e293b" />

          {/* Interior Labels (Subtle) */}
          <text x="110" y="100" fontSize="6" className={isNight ? "fill-white/10" : "fill-slate-400"}>BEDROOM</text>
          <text x="260" y="120" fontSize="6" className={isNight ? "fill-white/10" : "fill-slate-400"}>STUDY</text>
          <text x="110" y="240" fontSize="6" className={isNight ? "fill-white/10" : "fill-slate-400"}>KITCHEN</text>
          <text x="260" y="240" fontSize="6" className={isNight ? "fill-white/10" : "fill-slate-400"}>LIVING</text>
        </svg>

        {/* Solar Panels Structure ABOVE House */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div className="flex gap-2 bg-solar-navy/20 p-2 rounded-xl backdrop-blur-sm border border-white/10">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + (i * 0.1) }}
                className={cn(
                  "w-8 h-12 rounded-sm border flex flex-col gap-1 p-1 shadow-lg",
                  isNight ? "bg-indigo-950 border-indigo-800" : "bg-blue-900 border-blue-700"
                )}
              >
                <div className="flex-1 bg-white/5" />
                <div className="flex-1 bg-white/5" />
              </motion.div>
            ))}
          </div>
          <div className="w-1 h-16 bg-slate-400/30" /> {/* Support pole */}
        </div>

        {/* Inverter and Battery Visuals */}
        <div className="absolute bottom-10 right-20 z-30 flex gap-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "p-2 rounded-lg border shadow-xl flex flex-col items-center",
              isNight ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            )}
          >
            <Zap className="w-5 h-5 text-solar-electric" />
            <span className="text-[6px] font-bold mt-1">INVERTER</span>
          </motion.div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "p-2 rounded-lg border shadow-xl flex flex-col items-center",
              isNight ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            )}
          >
            <Battery className="w-5 h-5 text-green-500" />
            <span className="text-[6px] font-bold mt-1">BATTERY</span>
          </motion.div>
        </div>

        {/* Appliance Icons Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {appliances.map((app, i) => {
            const slot = applianceSlots[app.id] || fallbackSlots[i % fallbackSlots.length];
            return (
              <motion.div
                key={`${app.id}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="absolute flex flex-col items-center"
                style={{
                  left: slot.left,
                  top: slot.top,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg border p-1.5 transition-all",
                  isNight ? "bg-slate-800 border-slate-700 text-yellow-400" : "bg-white border-slate-100 text-slate-700"
                )}>
                  {getApplianceIcon(app.id, "w-full h-full")}
                </div>
                {app.quantity > 1 && (
                  <span className="absolute -top-2 -right-2 bg-solar-electric text-[8px] font-bold px-1 py-0.5 rounded-full text-white">
                    {app.quantity}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* EV Section */}
        {(evInfo.status === 'own' || evInfo.status === 'planning') && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute bottom-10 right-10 z-30"
          >
            <div className={cn(
              "p-2 rounded-xl border shadow-xl flex items-center gap-2",
              isNight ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            )}>
              <Car className={cn("w-6 h-6", isNight ? "text-blue-400" : "text-solar-electric")} />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-solar-electric">EV CHARGING</span>
                <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500"
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
