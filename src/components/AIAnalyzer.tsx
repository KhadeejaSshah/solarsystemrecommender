import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AIAnalyzerProps {
  onComplete: () => void;
}

export default function AIAnalyzer({ onComplete }: AIAnalyzerProps) {
  const [status, setStatus] = useState("Analyzing usage patterns...");
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const sequence = [
      "Optimizing panel tilt for Pakistan sun hours...",
      "Matching inverter capacity to your peak load...",
      "Calculating 4-hour backup for load shedding...",
      "Simulating net metering savings...",
      "Generating SkyElectric Blueprint..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setStatus(sequence[i]);
        setProgress((prev) => Math.min(prev + 20, 100));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-solar-navy p-4">
      <div className="relative w-64 h-64 mb-12">
        {/* Orbit Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-solar-orange/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-2 border-solar-electric/20 rounded-full"
        />
        
        {/* Pulsing Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-solar-orange rounded-full blur-xl"
          />
          <div className="w-8 h-8 bg-white rounded-full z-10 shadow-[0_0_20px_#fff]" />
        </div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: 360,
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              rotate: { duration: 5 + i, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, delay: i * 0.2 }
            }}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-solar-orange rounded-full"
            style={{ 
              marginLeft: -4, 
              marginTop: -4,
              transform: `rotate(${i * 45}deg) translateX(100px)` 
            }}
          />
        ))}
      </div>

      <div className="text-center max-w-md">
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-solar-orange font-mono tracking-tighter text-xl mb-4 h-8"
          >
            {status}
          </motion.p>
        </AnimatePresence>

        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-solar-orange"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5 }}
          />
        </div>
      </div>
    </div>
  );
}
