import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StepWrapper from './StepWrapper';
import { APPLIANCES_LIST, Appliance } from '../types';
import { Plus, Minus, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApplianceIcon } from './ApplianceIcons';

interface ApplianceStagingProps {
  onComplete: (appliances: Appliance[]) => void;
}

export default function ApplianceStaging({ onComplete }: ApplianceStagingProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  const currentAppliance = APPLIANCES_LIST[currentIdx];

  const handleNext = (hasAppliance: boolean) => {
    if (currentIdx < APPLIANCES_LIST.length - 1) {
      if (hasAppliance) {
        setSelectedAppliances(prev => {
          const existing = prev.find(a => a.id === currentAppliance.id);
          if (existing) return prev;
          return [...prev, { 
            ...currentAppliance, 
            quantity, 
            wattage: selectedOption ? selectedOption : currentAppliance.wattage,
            selectedOption: selectedOption
          }];
        });
      }
      setCurrentIdx(prev => prev + 1);
      setQuantity(1);
      setSelectedOption(null);
    } else {
      const finalAppliances = hasAppliance 
        ? [...selectedAppliances.filter(a => a.id !== currentAppliance.id), { 
            ...currentAppliance, 
            quantity, 
            wattage: selectedOption ? selectedOption : currentAppliance.wattage,
            selectedOption: selectedOption
          }] 
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
              className="mb-8 flex justify-center"
            >
              <div className="w-56 h-56 rounded-[2.5rem] flex items-center justify-center bg-white shadow-2xl border-4 border-solar-electric/10 relative group p-12 text-solar-text transition-all hover:border-solar-electric/30">
                {getApplianceIcon(currentAppliance.id, "w-full h-full drop-shadow-xl")}
                <div className="absolute inset-0 bg-gradient-to-tr from-solar-electric/5 to-transparent rounded-[2rem] pointer-events-none" />
              </div>
            </motion.div>
            
            <h2 className="text-3xl font-display font-bold text-solar-text mb-2">
              {currentAppliance.name}
            </h2>
            <p className="text-solar-text/50 mb-8 font-medium">Do you have this in your home?</p>

            <div className="space-y-8">
              <AnimatePresence>
                {quantity > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    {/* Quantity Selector */}
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-[10px] uppercase tracking-widest text-solar-electric font-bold">Quantity</span>
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="p-3 rounded-full bg-white border-2 border-solar-electric/20 text-solar-electric hover:bg-solar-electric hover:text-white transition-all shadow-md"
                        >
                          <Minus className="w-6 h-6" />
                        </button>
                        <span className="text-4xl font-display font-bold w-12 text-solar-text">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(q => q + 1)}
                          className="p-3 rounded-full bg-white border-2 border-solar-electric/20 text-solar-electric hover:bg-solar-electric hover:text-white transition-all shadow-md"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {/* Options Selector (if any) */}
                    {currentAppliance.options && (
                      <div className="flex flex-col items-center gap-3 w-full">
                        <span className="text-[10px] uppercase tracking-widest text-solar-electric font-bold">Select Type / Capacity</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
                          {currentAppliance.options.map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() => setSelectedOption(opt.value)}
                              className={cn(
                                "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                                selectedOption === opt.value 
                                  ? "bg-solar-electric text-white border-solar-electric shadow-lg shadow-solar-electric/20" 
                                  : "bg-white text-solar-text border-solar-text/10 hover:border-solar-electric/50"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                  <Check className="w-5 h-5 text-white" />
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
                    i === currentIdx ? "w-8 bg-solar-electric" : "w-2 bg-solar-text/10"
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
