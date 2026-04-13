import React from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { Appliance } from '../../types';
import { getApplianceIcon } from '../ApplianceIcons';

interface ApplianceMarkersProps {
  appliances: Appliance[];
}

// Precise 3D coordinate mapping based on updated HouseModel
const SLOT_MAP: Record<string, [number, number, number]> = {
  fridge: [2.5, 1.2, 1.8],    // Kitchen area Ground
  microwave: [3.8, 1.5, 1.8], // Kitchen counter Ground
  tv: [0.5, 1.5, -1.8],       // Living Room Ground
  lights: [1, 3.2, 0],          // Main House Ceiling
  ac: [1.8, 5.5, 2.5],        // Bedroom 2nd Floor
  fan: [0.8, 6.4, 0],          // 2nd Floor Ceiling
  iron: [3.5, 4.2, -1.2],     // Laundry/Study 2nd Floor
  motor: [-4.2, 0.4, 2.0],    // Garage / Utility area
};

const FALLBACK_SLOTS: [number, number, number][] = [
  [0, 2, 0],
  [-1, 2, 0],
  [1, 2, 0],
];

export const ApplianceMarkers = ({ appliances }: ApplianceMarkersProps) => {
  return (
    <group>
      <AnimatePresence>
        {appliances.map((app, i) => {
          const position = SLOT_MAP[app.id] || FALLBACK_SLOTS[i % FALLBACK_SLOTS.length];
          const [x, y, z] = position;
          
          return (
            <group key={`${app.id}-${i}`} position={[x, y, z]}>
              {/* Vertical Pin / Line connecting marker to interior */}
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.015, 0.005, 1.2, 6]} />
                <meshStandardMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.3} 
                  emissive="#ffffff" 
                  emissiveIntensity={0.5} 
                />
              </mesh>

              {/* Base Glow at the tip which points to the room */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
              </mesh>

              <Html
                position={[0, 1.2, 0]}
                center
                distanceFactor={12}
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
                      <div className="w-9 h-9 text-solar-navy transition-transform group-hover:scale-110 duration-300">
                        {getApplianceIcon(app.id)}
                      </div>
                      
                      {/* Sub-glow inside the icon box */}
                      <div className="absolute inset-0 bg-gradient-to-br from-solar-electric/10 to-transparent" />
                    </div>
                  </div>

                  {/* Quantity and Label */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-solar-navy/80 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
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
