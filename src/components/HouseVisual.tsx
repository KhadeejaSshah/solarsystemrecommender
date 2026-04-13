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
    'fridge': { left: '22%', top: '72%', room: 'Kitchen' },
    'microwave': { left: '34%', top: '72%', room: 'Kitchen' },
    'tv': { left: '68%', top: '72%', room: 'Living' },
    'lights': { left: '80%', top: '72%', room: 'Living' },
    'ac': { left: '22%', top: '48%', room: 'Bedroom' },
    'fan': { left: '34%', top: '48%', room: 'Bedroom' },
    'iron': { left: '68%', top: '42%', room: 'Study' },
    'motor': { left: '12%', top: '88%', room: 'Utility' },
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
      {/* Drifting Clouds (Day Only) */}
      {!isNight && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: -200, y: 100 + (i * 60) }}
              animate={{ x: '110vw' }}
              transition={{ duration: 40 + (i * 15), repeat: Infinity, ease: 'linear', delay: i * 8 }}
              className="absolute opacity-20"
            >
              <div className="w-48 h-12 bg-white rounded-full blur-3xl" />
            </motion.div>
          ))}
        </div>
      )}
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
          <rect x="0" y="250" width="400" height="50" fill={isNight ? "#0f172a" : "#cbd5e1"} />

          {/* Stars (Night Only) */}
          {isNight && [...Array(15)].map((_, i) => (
            <motion.circle
              key={i}
              cx={20 + (Math.random() * 360)}
              cy={20 + (Math.random() * 80)}
              r={0.5 + Math.random()}
              fill="white"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}

          {/* Pool */}
          <motion.rect
            x="20" y="240" width="180" height="40"
            fill="#38bdf8"
            opacity={isNight ? 0.3 : 0.5}
            animate={{ opacity: isNight ? [0.2, 0.4, 0.2] : [0.4, 0.6, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* House Structure */}
          {/* Main Body - Left */}
          <path d="M40 250 V120 L180 80 V250 Z" fill={isNight ? "#1e293b" : "#475569"} />
          <path d="M40 120 L180 80 L195 90 L55 130 Z" fill={isNight ? "#0f172a" : "#334155"} /> {/* Roof edge thickness */}

          {/* Main Body - Right */}
          <rect x="180" y="100" width="160" height="150" fill={isNight ? "#334155" : "#f8fafc"} />
          <rect x="180" y="100" width="160" height="12" fill={isNight ? "#1e293b" : "#f1f5f9"} /> {/* Flat roof edge */}

          {/* Large Windows with Sheen */}
          <rect x="60" y="150" width="80" height="70" fill={isNight ? "#fef08a" : "#94a3b8"} opacity={isNight ? 0.9 : 0.2} />
          {!isNight && <path d="M60 150 L140 220" stroke="white" strokeWidth="0.5" opacity="0.1" />} {/* Glass reflection */}
          <rect x="60" y="150" width="80" height="70" fill="none" stroke={isNight ? "#fde047" : "#475569"} strokeWidth="1.5" />

          <rect x="200" y="170" width="50" height="60" fill={isNight ? "#fef08a" : "#94a3b8"} opacity={isNight ? 0.9 : 0.2} />
          <rect x="270" y="170" width="50" height="60" fill={isNight ? "#fef08a" : "#94a3b8"} opacity={isNight ? 0.9 : 0.2} />

          {/* Labels */}
          <text x="110" y="145" fontSize="6" fontWeight="800" className={isNight ? "fill-white/30" : "fill-slate-400"} textAnchor="middle" letterSpacing="1">BEDROOM</text>
          <text x="290" y="165" fontSize="6" fontWeight="800" className={isNight ? "fill-white/30" : "fill-slate-400"} textAnchor="middle" letterSpacing="1">STUDY</text>
        </svg>

        {/* Solar Panels Structure ABOVE House with Grid Detail */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30">
          <div className="flex gap-1.5 bg-black/40 p-2 rounded-lg backdrop-blur-md border border-white/5 shadow-2xl">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + (i * 0.1) }}
                className={cn(
                  "w-10 h-16 rounded-[1px] border relative overflow-hidden flex flex-col pt-1",
                  isNight ? "bg-slate-900 border-indigo-500/30" : "bg-blue-950 border-blue-400/50"
                )}
              >
                {/* PV Cell Grid */}
                <div className="flex-1 grid grid-cols-2 gap-[1px] opacity-20 px-1">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="bg-white/40 h-2" />
                  ))}
                </div>
                {/* Glass Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
              </motion.div>
            ))}
          </div>
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
            <span className={cn("text-[6px] font-bold mt-1", isNight ? "text-white" : "text-slate-700")}>INVERTER</span>
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
            <span className={cn("text-[6px] font-bold mt-1", isNight ? "text-white" : "text-slate-700")}>BATTERY</span>
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
                <span className={cn("text-[8px] font-bold", isNight ? "text-blue-400" : "text-solar-electric")}>EV CHARGING</span>
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
