import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Check, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { APPLIANCES_LIST, Appliance } from '../types';
import { getApplianceIcon } from './ApplianceIcons';
import { cn } from '../lib/utils';

interface ApplianceStagingProps {
  onComplete: (appliances: Appliance[]) => void;
  onChange?: (appliances: Appliance[]) => void;
}

export default function ApplianceStaging({ onComplete, onChange }: ApplianceStagingProps) {
  const [activeIdx, setActiveIdx] = useState(2); // Start with Fridge centered (index 2)
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});

  const updateQuantity = (id: string, newQty: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, newQty) }));
  };

  const updateVariant = (id: string, variant: any) => {
    setSelectedVariants(prev => ({ ...prev, [id]: variant }));
  };

  const addAppliance = (baseAppliance: any) => {
    const qty = quantities[baseAppliance.id] || 1;
    const variant = selectedVariants[baseAppliance.id];

    const newAppliance: Appliance = {
      ...baseAppliance,
      quantity: qty,
      wattage: variant ? variant.value : baseAppliance.wattage,
      selectedOption: variant?.value || null,
      variantLabel: variant?.label || baseAppliance.name,
    };

    const updatedList = [...selectedAppliances];
    const existingIndex = updatedList.findIndex(a =>
      a.id === baseAppliance.id && a.selectedOption === newAppliance.selectedOption
    );

    if (existingIndex !== -1) {
      updatedList[existingIndex].quantity += qty;
    } else {
      updatedList.push(newAppliance);
    }

    setSelectedAppliances(updatedList);
    onChange?.(updatedList);
  };

  const totalWattage = selectedAppliances.reduce((sum, app) => sum + (app.wattage * app.quantity), 0);
  const totalItems = selectedAppliances.reduce((sum, app) => sum + app.quantity, 0);

  const rotate = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeIdx > 0) setActiveIdx(activeIdx - 1);
    if (direction === 'right' && activeIdx < APPLIANCES_LIST.length - 1) setActiveIdx(activeIdx + 1);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto min-h-[850px] flex flex-col items-center overflow-hidden py-20 px-4">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-solar-electric/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center mb-24 relative z-10 flex-shrink-0">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4"
        >
          Build Your Load Profile
        </motion.h1>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-solar-text/40 text-lg font-medium"
        >
          Select appliances and quantities to calculate your energy needs.
        </motion.p>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full flex-1 flex items-center justify-center perspective-[2000px]">
        {/* Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-12 z-50 pointer-events-none">
          <button
            onClick={() => rotate('left')}
            disabled={activeIdx === 0}
            className={cn(
              "p-4 rounded-full bg-solar-navy/80 border border-white/10 text-white backdrop-blur-xl transition-all pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)]",
              activeIdx === 0 ? "opacity-20 cursor-not-allowed" : "hover:scale-110 active:scale-95 hover:bg-solar-navy hover:shadow-solar-electric/20"
            )}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => rotate('right')}
            disabled={activeIdx === APPLIANCES_LIST.length - 1}
            className={cn(
              "p-4 rounded-full bg-solar-navy/80 border border-white/10 text-white backdrop-blur-xl transition-all pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)]",
              activeIdx === APPLIANCES_LIST.length - 1 ? "opacity-20 cursor-not-allowed" : "hover:scale-110 active:scale-95 hover:bg-solar-navy hover:shadow-solar-electric/20"
            )}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Carousel Track */}
        <div className="flex items-center justify-center h-full w-full gap-8 relative">
          <AnimatePresence mode="popLayout" initial={false}>
            {APPLIANCES_LIST.map((appliance, index) => {
              const distance = index - activeIdx;
              const isVisible = Math.abs(distance) <= 1;
              const isActive = distance === 0;

              if (!isVisible) return null;

              const qty = quantities[appliance.id] || 1;
              const selectedVariant = selectedVariants[appliance.id];
              const currentWattage = selectedVariant ? selectedVariant.value : appliance.wattage;

              return (
                <motion.div
                  key={appliance.id}
                  initial={{ opacity: 0, scale: 0.8, x: distance * 500, rotateY: distance * 45 }}
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    scale: isActive ? 1.15 : 0.85,
                    x: distance * 310,
                    rotateY: distance * -25,
                    zIndex: isActive ? 50 : 1,
                    filter: isActive ? "none" : "blur(4px)"
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  className={cn(
                    "absolute w-[320px] md:w-[360px] h-[480px] rounded-[3rem] p-8 flex flex-col items-center justify-between transition-all duration-500 overflow-hidden",
                    isActive
                      ? "bg-[#0a0f1c]/80 backdrop-blur-3xl border-2 border-solar-electric/50 shadow-[0_30px_100px_rgba(0,194,255,0.25)]"
                      : "bg-[#0a0f1c]/40 backdrop-blur-xl border border-white/10"
                  )}
                >
                  {/* Glowing Edge Effect (Top) */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-[3rem] border-t-2 border-l-2 border-solar-electric/30 pointer-events-none" />
                  )}

                  {/* Glass Shine Effect */}
                  <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-gradient-to-br from-white/5 to-transparent pointer-events-none transform rotate-12" />

                  <div className="flex flex-col items-center w-full relative z-10">
                    {/* Icon Container */}
                    <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                      <div className="absolute inset-0 bg-solar-electric/10 rounded-full blur-2xl animate-pulse" />
                      <div className="w-full h-full text-solar-text group-hover:scale-110 transition-transform duration-500">
                        {getApplianceIcon(appliance.id, "w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]")}
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-white text-center mb-1">{appliance.name}</h2>
                    <p className="text-solar-text/40 font-bold uppercase tracking-widest text-[10px] mb-6">
                      Base Load: {appliance.wattage}W
                    </p>

                    {/* Variant Dropdown */}
                    <div className="w-full relative px-4 mb-2">
                      {appliance.options ? (
                        <div className="relative">
                          <button
                            disabled={!isActive}
                            onClick={() => {
                              const key = `dropdown-${appliance.id}`;
                              setSelectedVariants(prev => ({
                                ...prev,
                                [key]: !prev[key]
                              }));
                            }}
                            className={cn(
                              "w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all",
                              isActive ? "hover:bg-white/10 active:scale-[0.98]" : "opacity-50"
                            )}
                          >
                            <span className="text-white">
                              {selectedVariant?.label || "Select Variant"}
                            </span>
                            <div className={cn(
                              "transition-transform duration-300",
                              selectedVariants[`dropdown-${appliance.id}`] ? "rotate-180" : ""
                            )}>
                              <ArrowLeft className="w-3 h-3 rotate-[-90deg]" />
                            </div>
                          </button>

                          <AnimatePresence>
                            {selectedVariants[`dropdown-${appliance.id}`] && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute bottom-full left-0 right-0 mb-2 bg-solar-navy/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 z-[60] shadow-2xl"
                              >
                                {appliance.options.map((opt: any) => (
                                  <button
                                    key={opt.label}
                                    onClick={() => {
                                      updateVariant(appliance.id, opt);
                                      const key = `dropdown-${appliance.id}`;
                                      setSelectedVariants(prev => ({ ...prev, [key]: false }));
                                    }}
                                    className={cn(
                                      "w-full px-4 py-3 rounded-xl text-left text-[10px] font-black uppercase tracking-wider transition-all mb-1 last:mb-0",
                                      selectedVariant?.value === opt.value
                                        ? "bg-solar-electric text-white"
                                        : "text-white/40 hover:bg-white/5 hover:text-white"
                                    )}
                                  >
                                    {opt.label} ({opt.value}W)
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/20">
                          Standard Configuration
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Add Action */}
                  <div className="w-full space-y-2 relative z-10">
                    <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2 border border-white/5">
                      <button
                        disabled={!isActive}
                        onClick={() => updateQuantity(appliance.id, qty - 1)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-2xl text-white">{qty}</span>
                      <button
                        disabled={!isActive}
                        onClick={() => updateQuantity(appliance.id, qty + 1)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      disabled={!isActive}
                      onClick={() => addAppliance(appliance)}
                      className={cn(
                        "w-full py-5 rounded-[2rem] font-black tracking-widest uppercase text-xs flex items-center justify-center gap-3 transition-all",
                        isActive
                          ? "bg-solar-electric text-white shadow-xl shadow-solar-electric/20 hover:scale-[1.02] active:scale-95"
                          : "bg-white/10 text-white/20"
                      )}
                    >
                      <Plus className="w-5 h-5" /> Add Appliance
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent Summary Footer */}
      <motion.div
        layout
        className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xs p-2 bg-solar-navy/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-[100]"
      >
        <button
          onClick={() => onComplete(selectedAppliances)}
          disabled={selectedAppliances.length === 0}
          className={cn(
            "group relative w-full py-4 rounded-[2rem] font-black transition-all overflow-hidden",
            selectedAppliances.length > 0
              ? "bg-solar-electric text-white shadow-xl shadow-solar-electric/30 hover:scale-[1.02] active:scale-95"
              : "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
          )}
        >
          <div className="relative z-10 flex items-center justify-center gap-3 text-xs tracking-[0.2em] font-black">
            CONTINUE <Check className="w-5 h-5" />
          </div>
          <motion.div
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          />
        </button>
      </motion.div>
    </div>
  );
}