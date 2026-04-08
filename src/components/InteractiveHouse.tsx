import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Battery, Zap, Home, Car, Bike, Plus, Minus, Upload, FileText, Settings } from 'lucide-react';

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
  isCharging: boolean;
}

export const InteractiveHouse: React.FC<HouseProps> = ({ appliances, isNight, hasPanels, isCharging }) => {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Sky Background */}
      <motion.div 
        className="absolute inset-0 rounded-3xl overflow-hidden"
        animate={{ 
          background: isNight 
            ? 'linear-gradient(to bottom, #0f172a, #1e293b)' 
            : 'linear-gradient(to bottom, #bae6fd, #f0f9ff)' 
        }}
      >
        {/* Sun/Moon */}
        <motion.div
          className="absolute top-8 right-8"
          animate={{ 
            y: isNight ? 100 : 0,
            opacity: isNight ? 0 : 1
          }}
        >
          <Sun className="w-12 h-12 text-yellow-400 fill-yellow-400 blur-[1px]" />
        </motion.div>
        
        {/* Stars for night */}
        <AnimatePresence>
          {isNight && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{ 
                    top: `${Math.random() * 60}%`, 
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random()
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-1/4 bg-slate-200" />

      {/* House Structure */}
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-48 bg-white border-x-4 border-b-4 border-slate-300 shadow-2xl">
        {/* Roof */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-24">
          <div className="absolute inset-0 bg-slate-700 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
          
          {/* Solar Panels */}
          {hasPanels && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-sky-600 grid grid-cols-4 gap-1 p-1"
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-sky-400/30 border border-sky-300/50" />
              ))}
              {/* Sun rays animation */}
              {!isNight && (
                <motion.div 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-12 left-0 w-full h-12 bg-gradient-to-b from-yellow-200/0 to-yellow-200/40"
                />
              )}
            </motion.div>
          )}
        </div>

        {/* Windows & Door */}
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-sky-100 border-2 border-slate-200" />
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-sky-100 border-2 border-slate-200" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-24 bg-slate-800 rounded-t-lg" />

        {/* Interior Appliances (Simplified representation) */}
        <div className="absolute inset-4 overflow-hidden">
          <AnimatePresence>
            {appliances.ac > 0 && (
              <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute top-2 right-2 p-1 bg-slate-100 rounded shadow-sm border border-slate-200"
              >
                <Settings className="w-4 h-4 text-slate-400 animate-spin-slow" />
              </motion.div>
            )}
            {appliances.fridge > 0 && (
              <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute bottom-2 left-2 w-6 h-10 bg-slate-200 rounded border border-slate-300"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* EV Charging Station */}
      <div className="absolute bottom-1/4 right-4 w-8 h-12 bg-slate-700 rounded-t-sm">
        {isCharging && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </motion.div>
        )}
      </div>

      {/* EV Car/Bike */}
      <AnimatePresence>
        {isCharging && (
          <motion.div 
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            className="absolute bottom-1/4 right-16"
          >
            <Car className="w-16 h-10 text-sky-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
