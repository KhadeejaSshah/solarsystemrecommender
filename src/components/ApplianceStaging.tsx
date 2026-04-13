import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StepWrapper from './StepWrapper';
import { APPLIANCES_LIST, Appliance } from '../types';
import { Plus, Minus, Check, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApplianceIcon } from './ApplianceIcons';

interface ApplianceStagingProps {
  onComplete: (appliances: Appliance[]) => void;
  onChange?: (appliances: Appliance[]) => void;
}

export default function ApplianceStaging({ onComplete, onChange }: ApplianceStagingProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  const currentAppliance = APPLIANCES_LIST[currentIdx];

  const handleAdd = () => {
    const newAppliance: Appliance = {
      ...currentAppliance,
      quantity,
      wattage: selectedOption ? selectedOption : currentAppliance.wattage,
      selectedOption: selectedOption
    };
    const newList = [...selectedAppliances, newAppliance];
    setSelectedAppliances(newList);
    onChange?.(newList);
    setQuantity(1);
    setSelectedOption(null);
  };

  const handleRemove = (index: number) => {
    const newList = selectedAppliances.filter((_, i) => i !== index);
    setSelectedAppliances(newList);
    onChange?.(newList);
  };

  const handleNext = () => {
    if (currentIdx < APPLIANCES_LIST.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setQuantity(1);
      setSelectedOption(null);
    } else {
      onComplete(selectedAppliances);
    }
  };

  const currentCategorySelected = selectedAppliances.filter(a => a.id === currentAppliance.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-4xl">
      <AnimatePresence mode="wait">
        <motion.div key={currentAppliance.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
          <StepWrapper direction="right" className="text-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex justify-center"
                >
                  <div className="w-48 h-48 rounded-[2.5rem] flex items-center justify-center bg-solar-card shadow-2xl border-4 border-solar-electric/10 relative group p-10 text-solar-text transition-all hover:border-solar-electric/30">
                    {getApplianceIcon(currentAppliance.id, "w-full h-full drop-shadow-xl")}
                    <div className="absolute inset-0 bg-gradient-to-tr from-solar-electric/5 to-transparent rounded-[2rem] pointer-events-none" />
                  </div>
                </motion.div>
                
                <div>
                  <h2 className="text-3xl font-display font-bold text-solar-text mb-2">
                    {currentAppliance.name}
                  </h2>
                  <p className="text-solar-text/50 font-medium">Configure and add to your list</p>
                </div>

                <div className="space-y-6">
                  {/* Quantity Selector */}
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-solar-electric font-bold">Quantity</span>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-2 rounded-full bg-solar-card border-2 border-solar-electric/20 text-solar-electric hover:bg-solar-electric hover:text-white transition-all shadow-md"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-3xl font-display font-bold w-10 text-solar-text">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="p-2 rounded-full bg-solar-card border-2 border-solar-electric/20 text-solar-electric hover:bg-solar-electric hover:text-white transition-all shadow-md"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Options Selector */}
                  {currentAppliance.options && (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <span className="text-[10px] uppercase tracking-widest text-solar-electric font-bold">Select Type / Capacity</span>
                      <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                        {currentAppliance.options.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => setSelectedOption(opt.value)}
                            className={cn(
                              "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                              selectedOption === opt.value 
                                ? "bg-solar-electric text-white border-solar-electric shadow-lg shadow-solar-electric/20" 
                                : "bg-solar-card text-solar-text border-solar-border hover:border-solar-electric/50"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleAdd} 
                    className="btn-primary w-full max-w-xs flex items-center justify-center gap-2 py-4"
                  >
                    <Plus className="w-5 h-5" />
                    Add to List
                  </button>
                </div>
              </div>

              {/* Summary of current category */}
              <div className="glass-card p-6 text-left min-h-[300px] flex flex-col">
                <h3 className="text-sm font-bold uppercase tracking-widest text-solar-electric mb-4 flex items-center justify-between">
                  Added {currentAppliance.name}s
                  <span className="bg-solar-electric/10 text-solar-electric px-2 py-0.5 rounded text-[10px]">
                    {currentCategorySelected.length} Items
                  </span>
                </h3>
                
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {currentCategorySelected.map((app, idx) => (
                    <motion.div 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      key={idx} 
                      className="flex items-center justify-between p-3 bg-solar-navy/50 rounded-xl border border-solar-border group"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-solar-text">
                          {app.quantity}x {app.options?.find(o => o.value === app.selectedOption)?.label || app.name}
                        </span>
                        <span className="text-[10px] text-solar-text/40 uppercase tracking-wider">
                          {(app.wattage * app.quantity)}W Load
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRemove(selectedAppliances.indexOf(app))}
                        className="p-2 text-solar-text/20 hover:text-red-500 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  {currentCategorySelected.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-solar-text/30 italic py-12">
                      <Plus className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-xs">No {currentAppliance.name.toLowerCase()}s added yet</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-solar-text/5">
                  <button 
                    onClick={handleNext}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                      currentCategorySelected.length > 0
                        ? "bg-solar-electric text-white shadow-lg shadow-solar-electric/20"
                        : "bg-solar-text/5 text-solar-text/40 hover:bg-solar-text/10"
                    )}
                  >
                    {currentIdx === APPLIANCES_LIST.length - 1 ? 'Finalize List' : 'Next Appliance'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {currentCategorySelected.length === 0 && (
                    <button 
                      onClick={handleNext}
                      className="w-full mt-2 text-[10px] uppercase tracking-widest text-solar-text/30 hover:text-solar-text/60 transition-colors"
                    >
                      Skip this appliance
                    </button>
                  )}
                </div>
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
