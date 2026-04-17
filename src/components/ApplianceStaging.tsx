import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { APPLIANCES_LIST, Appliance } from '../types';
import { getApplianceIcon } from './ApplianceIcons';
import { cn } from '../lib/utils';

interface ApplianceStagingProps {
  onComplete: (appliances: Appliance[]) => void;
  onChange?: (appliances: Appliance[]) => void;
}

export default function ApplianceStaging({ onComplete, onChange }: ApplianceStagingProps) {
  const [activeIdx, setActiveIdx] = useState(2);
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

    // Auto-advance to next appliance after adding
    if (activeIdx < APPLIANCES_LIST.length - 1) {
      setActiveIdx(prev => prev + 1);
    }
  };

  const rotate = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeIdx > 0) setActiveIdx(prev => prev - 1);
    if (direction === 'right' && activeIdx < APPLIANCES_LIST.length - 1) setActiveIdx(prev => prev + 1);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto min-h-[850px] flex flex-col items-center overflow-hidden py-20 px-4 bg-transparent">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-solar-electric/10 dark:bg-solar-electric/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center mb-24 relative z-10 flex-shrink-0">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl font-black text-solar-text tracking-tighter mb-4"
        >
          Build Your Load Profile
        </motion.h1>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-solar-text/50 text-lg font-medium"
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
              "p-4 rounded-full bg-white/80 dark:bg-solar-navy/80 border border-solar-border text-solar-text backdrop-blur-xl transition-all pointer-events-auto shadow-lg",
              activeIdx === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95 hover:bg-gray-50 dark:hover:bg-solar-navy"
            )}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => rotate('right')}
            disabled={activeIdx === APPLIANCES_LIST.length - 1}
            className={cn(
              "p-4 rounded-full bg-white/80 dark:bg-solar-navy/80 border border-solar-border text-solar-text backdrop-blur-xl transition-all pointer-events-auto shadow-lg",
              activeIdx === APPLIANCES_LIST.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95 hover:bg-gray-50 dark:hover:bg-solar-navy"
            )}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Carousel Track — render all cards, animate positions via motion */}
        <div className="flex items-center justify-center h-full w-full gap-8 relative">
          {APPLIANCES_LIST.map((appliance, index) => {
            const distance = index - activeIdx;
            const isNear = Math.abs(distance) <= 2;
            const isActive = distance === 0;
            const isInteractive = Math.abs(distance) <= 1;

            // Only render cards within ±2 range for performance
            if (!isNear) return null;

            const qty = quantities[appliance.id] || 1;
            const selectedVariant = selectedVariants[appliance.id];

            return (
              <motion.div
                key={appliance.id}
                animate={{
                  opacity: isInteractive ? (isActive ? 1 : 0.55) : 0,
                  scale: isActive ? 1.12 : isInteractive ? 0.88 : 0.7,
                  x: distance * 310,
                  rotateY: distance * -25,
                  zIndex: isActive ? 50 : 20 - Math.abs(distance),
                }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
                className={cn(
                  "absolute w-[320px] md:w-[360px] h-[480px] rounded-[3rem] p-8 flex flex-col items-center justify-between overflow-hidden border transition-[border-color,background-color,box-shadow]",
                  isActive
                    ? "bg-card-bg backdrop-blur-3xl border-solar-electric/60 shadow-2xl"
                    : "bg-card-bg-subtle backdrop-blur-xl border-solar-border"
                )}
              >
                {/* Active Glow Border */}
                {isActive && (
                  <div className="absolute inset-0 rounded-[3rem] border border-solar-electric/30 pointer-events-none" />
                )}

                {/* Subtle Shine Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 dark:from-white/5 to-transparent pointer-events-none rounded-[3rem]" />

                <div className="flex flex-col items-center w-full relative z-10">
                  {/* Icon Container */}
                  <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-solar-electric/10 dark:bg-solar-electric/20 rounded-full blur-2xl animate-pulse" />
                    <div className="w-full h-full text-solar-text">
                      {getApplianceIcon(
                        appliance.id,
                        "w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                      )}
                    </div>
                  </div>

                  <h2 className="text-3xl font-black text-solar-text text-center mb-1">
                    {appliance.name}
                  </h2>
                  <p className="text-solar-text/40 font-bold uppercase tracking-widest text-[10px] mb-6">
                    Base Load: {appliance.wattage}W
                  </p>

                  {/* Variant Selector */}
                  <div className="w-full px-4 mb-2">
                    {appliance.options ? (
                      <div className="relative">
                        <button
                          disabled={!isActive}
                          onClick={() => {
                            const key = `dropdown-${appliance.id}`;
                            setSelectedVariants(prev => ({ ...prev, [key]: !prev[key] }));
                          }}
                          className={cn(
                            "w-full px-6 py-4 rounded-2xl border flex items-center justify-between text-sm font-medium transition-all",
                            isActive
                              ? "bg-card-bg border-solar-border text-solar-text hover:bg-solar-navy/10"
                              : "bg-card-bg-subtle/50 border-solar-border text-solar-text/50"
                          )}
                        >
                          <span>{selectedVariant?.label || "Select Variant"}</span>
                          <ArrowLeft className={cn(
                            "w-4 h-4 transition-transform",
                            selectedVariants[`dropdown-${appliance.id}`] ? "rotate-[-90deg]" : "-rotate-90"
                          )} />
                        </button>

                        {selectedVariants[`dropdown-${appliance.id}`] && isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-full left-0 right-0 mb-2 bg-card-bg border border-solar-border rounded-2xl p-2 shadow-xl z-50"
                          >
                            {appliance.options.map((opt: any) => (
                              <button
                                key={opt.label}
                                onClick={() => {
                                  updateVariant(appliance.id, opt);
                                  setSelectedVariants(prev => ({ ...prev, [`dropdown-${appliance.id}`]: false }));
                                }}
                                className={cn(
                                  "w-full px-4 py-3 rounded-xl text-left text-sm transition-all",
                                  selectedVariant?.value === opt.value
                                    ? "bg-solar-electric text-white"
                                    : "hover:bg-solar-navy/10 text-solar-text/70"
                                )}
                              >
                                {opt.label} ({opt.value}W)
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full px-6 py-4 rounded-2xl bg-card-bg-subtle/50 border border-solar-border text-center text-sm text-solar-text/30">
                        Standard Configuration
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity & Add Button */}
                <div className="w-full space-y-3 relative z-10 mt-auto">
                  <div className="flex items-center justify-between bg-card-bg-subtle/50 rounded-2xl p-2 border border-solar-border">
                    <button
                      disabled={!isActive}
                      onClick={() => updateQuantity(appliance.id, qty - 1)}
                      className="p-3 hover:bg-solar-navy/10 rounded-xl transition-colors disabled:opacity-40 text-solar-text"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-black text-3xl text-solar-text">{qty}</span>
                    <button
                      disabled={!isActive}
                      onClick={() => updateQuantity(appliance.id, qty + 1)}
                      className="p-3 hover:bg-solar-navy/10 rounded-xl transition-colors disabled:opacity-40 text-solar-text"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    disabled={!isActive}
                    onClick={() => addAppliance(appliance)}
                    className={cn(
                      "w-full py-5 rounded-[2rem] font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all",
                      isActive
                        ? "bg-solar-electric hover:bg-solar-electric/90 text-white shadow-xl shadow-solar-electric/30 active:scale-[0.985]"
                        : "bg-card-bg-subtle/50 text-solar-text/30 cursor-not-allowed"
                    )}
                  >
                    <Plus className="w-5 h-5" /> Add Appliance
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <motion.div
        layout
        className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xs p-2 bg-card-bg/95 backdrop-blur-2xl border border-solar-border rounded-[2.5rem] shadow-2xl z-[100]"
      >
        <button
          onClick={() => onComplete(selectedAppliances)}
          disabled={selectedAppliances.length === 0}
          className={cn(
            "w-full py-4 rounded-[2rem] font-black text-sm tracking-widest transition-all",
            selectedAppliances.length > 0
              ? "bg-solar-electric text-white hover:scale-[1.02] active:scale-95 shadow-lg"
              : "bg-card-bg-subtle/50 text-solar-text/30 cursor-not-allowed border border-solar-border"
          )}
        >
          CONTINUE <Check className="inline w-5 h-5 ml-2" />
        </button>
      </motion.div>
    </div>
  );
}
