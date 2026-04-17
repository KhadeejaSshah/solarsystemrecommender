import React from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { Appliance } from '../../types';
import { getApplianceIcon } from '../ApplianceIcons';
import { SLOT_MAP, FALLBACK_SLOTS } from '../../config/applianceConfigs';

interface ApplianceMarkersProps {
  appliances: Appliance[];
}

// Data moved to src/config/applianceConfigs.ts to resolve HMR issues

export const ApplianceMarkers = ({ appliances }: ApplianceMarkersProps) => {
  return (
    <group>
      <AnimatePresence>
        {appliances.map((app, i) => {
          const position = SLOT_MAP[app.id] || FALLBACK_SLOTS[i % FALLBACK_SLOTS.length];
          const [x, y, z] = position;
          
          return (
            <group key={`${app.id}-${i}`} position={[x, y, z]}>
              {/* Removed Interior Pin - Now Wall Mounted */}

              <Html
                position={[0, 0, 0]}
                center
                distanceFactor={10}
                className="pointer-events-none select-none"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0, y: 10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="group relative">
                    {/* Pulsing Outer Ring */}
                    <div className="absolute inset-0 bg-white/40 rounded-2xl animate-ping opacity-20" />
                    
                    <div className="relative w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center border border-white/40 overflow-hidden">
                      <div className="w-8 h-8 text-[#0f172a] transition-transform group-hover:scale-110 duration-300 z-10">
                        {getApplianceIcon(app.id)}
                      </div>
                      
                      {/* Sub-glow inside the icon box */}
                      <div className="absolute inset-0 bg-gradient-to-br from-solar-electric/10 to-transparent" />
                    </div>
                  </div>

                  {/* Quantity and Label */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0f172a]/90 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                    {app.quantity > 1 && (
                      <span className="text-[10px] font-black text-solar-orange leading-none">{app.quantity}x</span>
                    )}
                    <span className="text-[10px] font-bold text-white/90 leading-none whitespace-nowrap">{app.name}</span>
                  </div>
                </motion.div>
              </Html>
            </group>
          );
        })}
      </AnimatePresence>
    </group>
  );
};
