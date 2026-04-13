import { motion } from 'motion/react';
import { Appliance, EVInfo } from '../types';
import SolarHouse3D from './SolarHouse/SolarHouse3D';

interface HouseVisualProps {
  appliances: Appliance[];
  evInfo: EVInfo;
  isDark?: boolean;
}

export default function HouseVisual({ appliances, evInfo, isDark = true }: HouseVisualProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(58,134,255,0.05),transparent)]"
      />

      {/* 3D HOUSE CONTAINER */}
      <div className="relative w-full h-full z-10">
        <SolarHouse3D 
          appliances={appliances} 
          evInfo={evInfo} 
          isDark={isDark} 
        />
      </div>

      {/* DECORATIVE ELEMENTS (Optional, since 3D handles most) */}
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute inset-0 bg-solar-electric/5 blur-3xl z-0 pointer-events-none"
      />
    </div>
  );
}