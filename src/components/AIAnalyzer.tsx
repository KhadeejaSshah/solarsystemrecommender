import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Home, Zap, Cpu } from 'lucide-react';

interface AIAnalyzerProps {
  onComplete: () => void;
}

export default function AIAnalyzer({ onComplete }: AIAnalyzerProps) {
  const [status, setStatus] = useState("Initializing Design...");
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const sequence = [
      "Building Solar Panel Array...",
      "Constructing Smart Home Model...",
      "Integrating Hybrid Inverter...",
      "Simulating Energy Flows...",
      "Finalizing SkyElectric Blueprint..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setStatus(sequence[i]);
        setStep(i);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const ShieldCheck = () => <Zap className="w-12 h-12 text-solar-electric" />;
  const icons = [Sun, Home, Zap, Cpu, ShieldCheck];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-solar-navy p-4">
      <div className="relative w-80 h-80 mb-12 flex items-center justify-center">
        {/* Orbiting Elements */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-32 h-32 rounded-3xl bg-solar-surface shadow-2xl flex items-center justify-center border border-solar-text/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-solar-electric/5 to-transparent" />
              {step === 0 && <Sun className="w-16 h-16 text-solar-orange animate-pulse" />}
              {step === 1 && <Home className="w-16 h-16 text-solar-electric animate-bounce" />}
              {step === 2 && <Zap className="w-16 h-16 text-solar-orange animate-pulse" />}
              {step === 3 && <Cpu className="w-16 h-16 text-solar-electric animate-spin" />}
              {step === 4 && <Zap className="w-16 h-16 text-solar-orange" />}
            </div>
            
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === step ? "w-8 bg-solar-electric" : "w-2 bg-solar-text/10"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-solar-text/5 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 border border-solar-text/5 rounded-full border-dashed"
        />
      </div>

      <div className="text-center max-w-md">
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-solar-text font-display font-bold text-2xl mb-2"
          >
            {status}
          </motion.p>
        </AnimatePresence>
        <p className="text-solar-text/40 text-sm uppercase tracking-widest font-bold">
          SkyElectric AI Designer
        </p>
      </div>
    </div>
  );
}
