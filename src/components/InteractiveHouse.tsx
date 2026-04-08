import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Battery, Zap, Home, Car, Bike, 
  Wind, Fan, Lightbulb, Refrigerator, 
  Settings, Moon, Cloud, ZapOff
} from 'lucide-react';

interface HouseProps {
  appliances: {
    ac: number;
    fan: number;
    light: number;
    fridge: number;
    motor: number;
  };
  isNight: boolean;
  hasPanels: boolean;
  hasEvCar: boolean;
  hasEvBike: boolean;
}

export const InteractiveHouse: React.FC<HouseProps> = ({ appliances, isNight, hasPanels, hasEvCar, hasEvBike }) => {
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Sky/Atmosphere */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: isNight 
            ? 'radial-gradient(circle at 50% 20%, #1e293b 0%, #020617 100%)' 
            : 'radial-gradient(circle at 50% 20%, #bae6fd 0%, #0ea5e9 100%)' 
        }}
      >
        {/* Celestial Body */}
        <motion.div
          className="absolute top-12 right-12"
          animate={{ 
            y: isNight ? 20 : 0,
            rotate: isNight ? 180 : 0,
            scale: isNight ? 0.8 : 1
          }}
          transition={{ type: 'spring', stiffness: 50 }}
        >
          {isNight ? (
            <Moon className="w-16 h-16 text-slate-200 fill-slate-200/20 blur-[1px]" />
          ) : (
            <div className="relative">
              <Sun className="w-16 h-16 text-yellow-400 fill-yellow-400 blur-[1px]" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-yellow-400 rounded-full blur-xl"
              />
            </div>
          )}
        </motion.div>

        {/* Clouds / Stars */}
        <AnimatePresence mode="wait">
          {!isNight ? (
            <motion.div 
              key="day-atmosphere"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Cloud className="absolute top-20 left-10 w-12 h-12 text-white/40" />
              <Cloud className="absolute top-32 left-40 w-8 h-8 text-white/20" />
            </motion.div>
          ) : (
            <motion.div 
              key="night-atmosphere"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {[...Array(30)].map((_, i) => (
                <motion.div 
                  key={`star-${i}`}
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{ top: `${Math.random() * 60}%`, left: `${Math.random() * 100}%` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ground / Landscape */}
      <div className="absolute bottom-0 w-full h-[20%] bg-slate-950/50 backdrop-blur-sm border-t border-white/5" />

      {/* Pitched Roof - Positioned above the house */}
      <div className="absolute bottom-[calc(20%+16rem)] left-1/2 -translate-x-1/2 w-80 h-32 z-10">
        <div className="absolute inset-0 bg-slate-800 [clip-path:polygon(50%_0%,0%_100%,100%_100%)] shadow-2xl border-b-4 border-slate-900" />
        
        {/* Solar Panels on Pitched Roof */}
        {hasPanels && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-16 bg-slate-900/80 grid grid-cols-4 gap-1 p-1 rounded border border-sky-500/30 rotate-[5deg]"
          >
            {[...Array(8)].map((_, i) => (
              <div key={`panel-${i}`} className="relative bg-sky-900/80 border border-sky-400/20 overflow-hidden">
                {!isNight && (
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute inset-0 w-full h-full bg-white/5 skew-x-12"
                  />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* House Structure - 2 Stories Cutaway */}
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-72 h-64 bg-white/10 backdrop-blur-md border-x-4 border-b-4 border-slate-700 rounded-b-xl shadow-2xl overflow-hidden">
        {/* Interior Rooms Grid */}
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-1 p-1 bg-slate-800/50">
          
          {/* Top Left: Bedroom */}
          <div className="relative bg-indigo-900/20 border border-white/5 rounded p-2">
            <div className="text-[8px] font-bold text-white/30 uppercase">Bedroom</div>
            {/* Bed */}
            <div className="absolute bottom-2 left-2 w-12 h-6 bg-indigo-500/40 rounded-t-sm border-t border-indigo-400/30" />
            
            {/* AC in Bedroom */}
            {appliances.ac > 0 && (
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-1 right-1">
                <Wind className="w-6 h-6 text-sky-400 animate-pulse" />
              </motion.div>
            )}

            {/* Lamp 1 */}
            {appliances.light > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-8 left-4">
                <div className={`w-3 h-3 rounded-t-full ${isNight ? 'bg-yellow-400 shadow-[0_0_10px_#fbbf24]' : 'bg-slate-400'}`} />
                <div className="w-0.5 h-3 bg-slate-600 mx-auto" />
              </motion.div>
            )}
          </div>

          {/* Top Right: Bathroom */}
          <div className="relative bg-sky-900/20 border border-white/5 rounded p-2">
            <div className="text-[8px] font-bold text-white/30 uppercase">Bathroom</div>
            {/* Bathtub */}
            <div className="absolute bottom-2 right-2 w-10 h-4 bg-white/20 rounded-b-xl border-b border-white/10" />
            
            {/* Lamp 2 */}
            {appliances.light > 1 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                <div className={`w-4 h-4 rounded-full ${isNight ? 'bg-yellow-200 shadow-[0_0_15px_#fef08a]' : 'bg-slate-400'}`} />
              </motion.div>
            )}
          </div>

          {/* Bottom Left: Drawing Room */}
          <div className="relative bg-amber-900/20 border border-white/5 rounded p-2">
            <div className="text-[8px] font-bold text-white/30 uppercase">Drawing Room</div>
            {/* Sofa */}
            <div className="absolute bottom-2 left-2 w-16 h-6 bg-amber-600/30 rounded border border-amber-500/20" />
            
            {/* Fan in Drawing Room */}
            {appliances.fan > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 left-1/2 -translate-x-1/2">
                <Fan className="w-8 h-8 text-slate-400 animate-spin-slow" />
              </motion.div>
            )}

            {/* Lamp 3 */}
            {appliances.light > 2 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-8 right-4">
                <div className={`w-3 h-3 rounded-t-full ${isNight ? 'bg-yellow-400 shadow-[0_0_10px_#fbbf24]' : 'bg-slate-400'}`} />
                <div className="w-0.5 h-3 bg-slate-600 mx-auto" />
              </motion.div>
            )}
          </div>

          {/* Bottom Right: Kitchen */}
          <div className="relative bg-emerald-900/20 border border-white/5 rounded p-2">
            <div className="text-[8px] font-bold text-white/30 uppercase">Kitchen</div>
            
            {/* Refrigerator in Kitchen */}
            {appliances.fridge > 0 && (
              <motion.div 
                initial={{ x: 20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                className="absolute bottom-2 right-2 w-8 h-14 bg-slate-200 rounded border border-slate-300 flex items-center justify-center"
              >
                <Refrigerator className="w-5 h-5 text-slate-500" />
              </motion.div>
            )}

            {/* Lamp 4 */}
            {appliances.light > 3 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 left-2">
                <div className={`w-4 h-4 rounded-full ${isNight ? 'bg-yellow-200 shadow-[0_0_15px_#fef08a]' : 'bg-slate-400'}`} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Motor - Utility Area Outside */}
      {appliances.motor > 0 && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="absolute bottom-[30%] right-90 w-10 h-10 bg-slate-800 rounded border border-white/10 flex items-center justify-center"
        >
          <Settings className="w-6 h-6 text-sky-400 animate-spin" />
          <div className="absolute -top-4 text-[6px] font-bold text-white/50 uppercase">Motor</div>
        </motion.div>
      )}

      {/* Energy Infrastructure */}
      <div className="absolute bottom-[30%] right-2 w-12 h-20 bg-slate-800 rounded border border-white/10 shadow-lg flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-1 bg-sky-500 rounded-full shadow-[0_0_10px_#0ea5e9]" />
        <Battery className={`w-6 h-6 ${isNight ? 'text-sky-400' : 'text-green-400'}`} />
        <div className="text-[8px] font-bold text-white/50 uppercase">Inverter</div>
      </div>

      {/* EV Section - STANDING OUTSIDE */}
      <AnimatePresence>
        {(hasEvCar || hasEvBike) && (
          <motion.div 
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            className="absolute bottom-[4%] left-13 flex items-end gap-6"
          >
            {hasEvCar && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Car className="w-28 h-18 text-sky-400 drop-shadow-[0_0_15px_rgba(14,165,233,0.4)]" />
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-sky-400/20 blur-md rounded-full"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-full border border-sky-500/30">
                  <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Charging</span>
                </div>
              </div>
            )}
            
            {hasEvBike && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Bike className="w-16 h-16 text-sky-300 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-sky-400/20 blur-md rounded-full"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-full border border-sky-500/30">
                  <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Charging</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Energy Flow Lines (Visual only) */}
      {!isNight && hasPanels && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.path
            d="M 250 150 L 350 350"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="10 10"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <defs>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};
