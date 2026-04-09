import { motion } from 'motion/react';
import { Appliance, EVInfo } from '../types';
import { Car, Bike } from 'lucide-react';

interface HouseVisualProps {
  appliances: Appliance[];
  evInfo: EVInfo;
}

export default function HouseVisual({ appliances, evInfo }: HouseVisualProps) {
  // Define room-based slots for appliances to make them look "fitted"
  // These percentages are relative to a 4:3 container that matches the SVG viewBox
  const applianceSlots: Record<string, { left: string; top: string; room: string }> = {
    'fridge': { left: '26%', top: '80%', room: 'Kitchen' },
    'microwave': { left: '38%', top: '80%', room: 'Kitchen' },
    'tv': { left: '68%', top: '75%', room: 'Living' },
    'lights': { left: '80%', top: '75%', room: 'Living' },
    'ac': { left: '26%', top: '58%', room: 'Bedroom' },
    'fan': { left: '38%', top: '58%', room: 'Bedroom' },
    'iron': { left: '62%', top: '65%', room: 'Study' },
    'motor': { left: '18%', top: '80%', room: 'Utility' },
  };

  // Default fallback slots for any extra appliances (staying within boundaries)
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
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(58,134,255,0.05),transparent)] pointer-events-none"
      />

      {/* Aspect Ratio Container to keep icons and SVG aligned */}
      <div className="relative aspect-[4/3] w-full max-w-md">
        {/* House Base SVG */}
        <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-[0_0_30px_rgba(58,134,255,0.2)] z-10">
          {/* Roof */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M50 150 L200 50 L350 150"
            fill="none"
            stroke="#3A86FF"
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
            stroke="#3A86FF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
        {/* Interior Dividers (Floors and Rooms) */}
        <motion.line 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 }}
          transition={{ delay: 1 }}
          x1="70" y1="210" x2="330" y2="210" 
          stroke="white" strokeWidth="1" 
        />
        <motion.line 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 }}
          transition={{ delay: 1.2 }}
          x1="200" y1="150" x2="200" y2="270" 
          stroke="white" strokeWidth="1" 
        />

        {/* Room Labels */}
        <text x="135" y="165" fontSize="7" fill="white" opacity="0.4" textAnchor="middle" fontWeight="bold" letterSpacing="1">BEDROOM</text>
        <text x="265" y="165" fontSize="7" fill="white" opacity="0.4" textAnchor="middle" fontWeight="bold" letterSpacing="1">STUDY</text>
        <text x="135" y="225" fontSize="7" fill="white" opacity="0.4" textAnchor="middle" fontWeight="bold" letterSpacing="1">KITCHEN</text>
        <text x="265" y="225" fontSize="7" fill="white" opacity="0.4" textAnchor="middle" fontWeight="bold" letterSpacing="1">LIVING</text>

        {/* Furniture Outlines */}
        {/* Bedroom: Bed & Wardrobe */}
        <rect x="80" y="185" width="40" height="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" rx="2" />
        <rect x="85" y="188" width="10" height="8" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" rx="1" />
        <rect x="160" y="160" width="25" height="45" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1" rx="1" />
        
        {/* Study: Desk & Bookshelf */}
        <rect x="220" y="195" width="35" height="10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" rx="1" />
        <rect x="290" y="160" width="30" height="45" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1" rx="1" />
        
        {/* Kitchen: Counter & Dining Table */}
        <rect x="80" y="250" width="60" height="15" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" rx="1" />
        <circle cx="90" cy="257" r="3" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" />
        <circle cx="105" cy="257" r="3" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" />
        <rect x="150" y="235" width="30" height="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1" rx="2" />
        
        {/* Living: Sofa & TV Stand */}
        <rect x="240" y="250" width="50" height="15" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" rx="2" />
        <line x1="255" y1="250" x2="255" y2="265" stroke="white" strokeWidth="0.5" opacity="0.15" />
        <line x1="275" y1="250" x2="275" y2="265" stroke="white" strokeWidth="0.5" opacity="0.15" />
        <rect x="250" y="230" width="30" height="5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1" rx="1" />

        {/* EV Charging Stations */}
        <g opacity="0.4">
          {/* Car Charger */}
          <rect x="50" y="230" width="12" height="24" rx="2" fill="#151619" stroke="#FF9F1C" strokeWidth="1" />
          <path d="M56 236 L56 248" stroke="#FF9F1C" strokeWidth="1" strokeLinecap="round" />
          <circle cx="56" cy="238" r="1.5" fill="#FF9F1C" />
          
          {/* Bike Charger */}
          <rect x="338" y="230" width="12" height="24" rx="2" fill="#151619" stroke="#3A86FF" strokeWidth="1" />
          <path d="M344 236 L344 248" stroke="#3A86FF" strokeWidth="1" strokeLinecap="round" />
          <circle cx="344" cy="238" r="1.5" fill="#3A86FF" />
        </g>

          {/* Windows */}
          <motion.rect 
            initial={{ fill: "white", opacity: 0.05 }}
            animate={{ opacity: [0.05, 0.2, 0.05] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            x="100" y="170" width="30" height="30" rx="4" 
          />
          <motion.rect 
            initial={{ fill: "white", opacity: 0.05 }}
            animate={{ opacity: [0.05, 0.2, 0.05] }}
            transition={{ duration: 4, repeat: Infinity, delay: 3 }}
            x="270" y="170" width="30" height="30" rx="4" 
          />
          {/* Door */}
          <motion.rect x="185" y="230" width="30" height="40" rx="2" fill="white" opacity="0.1" />
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
                {/* Subtle platform/glow under the appliance */}
                <div className="absolute -bottom-1 w-6 h-1 bg-solar-electric/20 blur-[2px] rounded-full" />
                
                <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] filter grayscale-[0.2] hover:grayscale-0 transition-all">
                  {app.icon}
                </span>
                
                {app.quantity > 1 && (
                  <span className="absolute -top-2 -right-2 bg-solar-orange text-[9px] font-bold px-1 py-0.5 rounded-full shadow-lg border border-white/20">
                    x{app.quantity}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Solar Panels on Roof - Arranged in a 2x4 grid */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 z-30 grid grid-cols-4 gap-2 rotate-[-5deg]">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                delay: 3 + (i * 0.1), 
                duration: 0.5,
                type: 'spring'
              }}
              whileHover={{ scale: 1.1, zIndex: 50 }}
              className="w-6 h-10 bg-solar-navy border border-solar-electric/40 rounded-sm flex flex-col gap-1 p-1 shadow-lg cursor-help group relative"
            >
              <div className="flex-1 bg-solar-electric/10 group-hover:bg-solar-electric/30 transition-colors" />
              <div className="flex-1 bg-solar-electric/10 group-hover:bg-solar-electric/30 transition-colors" />
              
              {/* Energy Sparkle Animation */}
              <motion.div
                animate={{ 
                  top: ["0%", "100%"],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                className="absolute left-0 right-0 h-0.5 bg-solar-electric blur-[1px] pointer-events-none"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* EV Icons - Outside the aspect ratio container to stay at corners */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {evInfo.hasCar && (
          <motion.div
            initial={{ x: -150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 2.5, type: 'spring', stiffness: 100 }}
            className="absolute bottom-6 left-6 flex flex-col items-center"
          >
            <div className="relative p-2 bg-solar-orange/5 rounded-xl border border-solar-orange/20">
              <Car className="w-8 h-8 text-solar-orange drop-shadow-[0_0_10px_rgba(255,159,28,0.4)]" />
              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-solar-orange rounded-full shadow-[0_0_5px_rgba(255,159,28,1)]"
              />
            </div>
            <span className="text-[8px] uppercase font-bold text-solar-orange/60 mt-1">{evInfo.carModel || 'EV Car'}</span>
          </motion.div>
        )}
        {evInfo.hasBike && (
          <motion.div
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 2.7, type: 'spring', stiffness: 100 }}
            className="absolute bottom-6 right-6 flex flex-col items-center"
          >
            <div className="relative p-2 bg-solar-electric/5 rounded-xl border border-solar-electric/20">
              <Bike className="w-8 h-8 text-solar-electric drop-shadow-[0_0_10px_rgba(58,134,255,0.4)]" />
              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-solar-electric rounded-full shadow-[0_0_5px_rgba(58,134,255,1)]"
              />
            </div>
            <span className="text-[8px] uppercase font-bold text-solar-electric/60 mt-1">{evInfo.bikeModel || 'EV Bike'}</span>
          </motion.div>
        )}
      </div>

      {/* Energy Flow Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30">
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 4, repeat: Infinity }}
          d="M200 50 Q250 100 200 150"
          fill="none"
          stroke="#3A86FF"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}
