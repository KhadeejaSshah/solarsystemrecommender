import { motion } from 'motion/react';
import { Appliance, EVInfo } from '../types';
import { Car, Bike } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApplianceIcon } from './ApplianceIcons';

interface HouseVisualProps {
  appliances: Appliance[];
  evInfo: EVInfo;
}

export default function HouseVisual({ appliances, evInfo }: HouseVisualProps) {
  // Define room-based slots for appliances to make them look "fitted"
  const applianceSlots: Record<string, { left: string; top: string; room: string }> = {
    'fridge': { left: '25%', top: '80%', room: 'Kitchen' },
    'microwave': { left: '35%', top: '80%', room: 'Kitchen' },
    'tv': { left: '65%', top: '80%', room: 'Living' },
    'lights': { left: '78%', top: '80%', room: 'Living' },
    'ac': { left: '25%', top: '60%', room: 'Bedroom' },
    'fan': { left: '35%', top: '60%', room: 'Bedroom' },
    'iron': { left: '65%', top: '60%', room: 'Study' },
    'motor': { left: '20%', top: '85%', room: 'Utility' },
  };

  const fallbackSlots = [
    { left: '35%', top: '70%' },
    { left: '45%', top: '70%' },
    { left: '55%', top: '70%' },
    { left: '65%', top: '70%' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
      {/* Background Glow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(58,134,255,0.03),transparent)] pointer-events-none"
      />

      {/* Aspect Ratio Container */}
      <div className="relative aspect-[4/3] w-full max-w-md">
        {/* House Base SVG */}
        <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-[0_0_30px_rgba(58,134,255,0.1)] z-10">
          {/* Roof */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M50 150 L200 50 L350 150"
            fill="none"
            stroke="#2563EB"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Walls */}
          <motion.rect
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            x="70" y="150" width="260" height="120"
            fill="none"
            stroke="#2563EB"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Interior Room Dividers */}
          {/* Floor Divider */}
          <motion.line 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ delay: 1 }}
            x1="70" y1="210" x2="330" y2="210" 
            stroke="currentColor" strokeWidth="2" 
            className="text-solar-text"
          />
          {/* Vertical Divider (Bedroom/Study) */}
          <motion.line 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ delay: 1.2 }}
            x1="200" y1="150" x2="200" y2="210" 
            stroke="currentColor" strokeWidth="2" 
            className="text-solar-text"
          />
          {/* Vertical Divider (Kitchen/Living) */}
          <motion.line 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ delay: 1.4 }}
            x1="160" y1="210" x2="160" y2="270" 
            stroke="currentColor" strokeWidth="2" 
            className="text-solar-text"
          />

          {/* Furniture Outlines */}
          {/* Kitchen Counter */}
          <rect x="75" y="245" width="80" height="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" rx="2" className="text-solar-text" />
          {/* Sofa in Living */}
          <path d="M220 265 h80 v-15 h-10 v10 h-60 v-10 h-10 z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" className="text-solar-text" />
          {/* TV Stand */}
          <rect x="240" y="235" width="40" height="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" className="text-solar-text" />
          {/* Bed in Bedroom */}
          <rect x="80" y="185" width="60" height="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" rx="2" className="text-solar-text" />
          <rect x="80" y="185" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" className="text-solar-text" />
          {/* Desk in Study */}
          <rect x="240" y="195" width="60" height="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" rx="1" className="text-solar-text" />

          {/* Room Labels */}
          <text x="110" y="165" fontSize="8" className="fill-solar-text/20 font-bold uppercase tracking-wider">Bedroom</text>
          <text x="240" y="165" fontSize="8" className="fill-solar-text/20 font-bold uppercase tracking-wider">Study</text>
          <text x="90" y="225" fontSize="8" className="fill-solar-text/20 font-bold uppercase tracking-wider">Kitchen</text>
          <text x="210" y="225" fontSize="8" className="fill-solar-text/20 font-bold uppercase tracking-wider">Living Room</text>

          {/* Windows */}
          <motion.rect 
            initial={{ fill: "#2563EB", opacity: 0.02 }}
            animate={{ opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            x="100" y="170" width="30" height="30" rx="4" 
          />
          <motion.rect 
            initial={{ fill: "#2563EB", opacity: 0.02 }}
            animate={{ opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 4, repeat: Infinity, delay: 3 }}
            x="270" y="170" width="30" height="30" rx="4" 
          />
          {/* Door */}
          <motion.rect x="185" y="230" width="30" height="40" rx="2" fill="currentColor" opacity="0.03" className="text-solar-text" />
        </svg>

        {/* Appliance Icons Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {appliances.map((app, i) => {
            const slot = applianceSlots[app.id] || fallbackSlots[i % fallbackSlots.length];
            return (
              <motion.div
                key={`${app.id}-${i}`}
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ 
                  delay: 1.5 + (i * 0.1), 
                  type: 'spring',
                  stiffness: 260,
                  damping: 20 
                }}
                className="absolute flex flex-col items-center group"
                style={{
                  left: slot.left,
                  top: slot.top,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="absolute -bottom-1 w-6 h-1 bg-solar-electric/10 blur-[2px] rounded-full" />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-lg border border-solar-text/5 p-2 text-solar-text transition-all hover:scale-110 hover:text-solar-electric">
                  {getApplianceIcon(app.id, "w-full h-full")}
                </div>
                {app.quantity > 1 && (
                  <span className="absolute -top-2 -right-2 bg-solar-electric text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg text-white">
                    x{app.quantity}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Solar Panels on Roof */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 z-30 grid grid-cols-4 gap-2 rotate-[-5deg]">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 3 + (i * 0.1), duration: 0.5 }}
              className="w-6 h-10 bg-solar-electric/10 border border-solar-electric/30 rounded-sm flex flex-col gap-1 p-1 shadow-sm"
            >
              <div className="flex-1 bg-solar-electric/5" />
              <div className="flex-1 bg-solar-electric/5" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* EV Icons */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {(evInfo.status === 'own' || evInfo.status === 'planning') && (
          <motion.div
            initial={{ x: -150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 2.5, type: 'spring' }}
            className="absolute bottom-6 left-6 flex flex-col items-center"
          >
            <div className="relative p-3 bg-white rounded-2xl border border-solar-text/5 shadow-xl">
              <Car className={cn(
                "w-8 h-8",
                evInfo.status === 'own' ? "text-solar-electric" : "text-solar-orange"
              )} />
              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                  evInfo.status === 'own' ? "bg-solar-electric shadow-[0_0_5px_#3A86FF]" : "bg-solar-orange shadow-[0_0_5px_#FF9F1C]"
                )}
              />
            </div>
            <span className="text-[8px] uppercase font-bold text-solar-text/30 mt-2">
              {evInfo.status === 'own' ? 'EV OWNED' : 'EV PLANNED'}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
