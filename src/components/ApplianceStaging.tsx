import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StepWrapper from './StepWrapper';
import { APPLIANCES_LIST, Appliance } from '../types';
import { Plus, Minus, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface ApplianceStagingProps {
  onComplete: (appliances: Appliance[]) => void;
}

export default function ApplianceStaging({ onComplete }: ApplianceStagingProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [quantity, setQuantity] = useState(1);

  const currentAppliance = APPLIANCES_LIST[currentIdx];

  const handleNext = (hasAppliance: boolean) => {
    if (currentIdx < APPLIANCES_LIST.length - 1) {
      if (hasAppliance) {
        setSelectedAppliances(prev => {
          // Prevent duplicates if already added
          if (prev.find(a => a.id === currentAppliance.id)) return prev;
          return [...prev, { ...currentAppliance, quantity }];
        });
      }
      setCurrentIdx(prev => prev + 1);
      setQuantity(1);
    } else {
      const finalAppliances = hasAppliance 
        ? [...selectedAppliances.filter(a => a.id !== currentAppliance.id), { ...currentAppliance, quantity }] 
        : selectedAppliances;
      onComplete(finalAppliances);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div key={currentAppliance.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
          <StepWrapper direction="right" className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl mb-6 block"
            >
              {currentAppliance.icon}
            </motion.div>
            
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {currentAppliance.name}
            </h2>
            <p className="text-white/50 mb-8">Do you have this in your home?</p>

            <div className="space-y-8">
              <AnimatePresence>
                {quantity > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <span className="text-sm uppercase tracking-widest text-solar-orange font-bold">Quantity</span>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <span className="text-4xl font-display font-bold w-12">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => handleNext(false)} 
                  className="btn-secondary flex-1 max-w-[140px]"
                >
                  No
                </button>
                <button 
                  onClick={() => handleNext(true)} 
                  className="btn-primary flex-1 max-w-[200px] flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Yes, Add it
                </button>
              </div>
            </div>

            <div className="mt-12 flex justify-center gap-1">
              {APPLIANCES_LIST.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i === currentIdx ? "w-8 bg-solar-orange" : "w-2 bg-white/10"
                  )}
                />
              ))}
            </div>
          </StepWrapper>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
