import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, Trash2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { APPLIANCES_LIST, Appliance } from '../types';
import { getApplianceIcon } from './ApplianceIcons';
import { cn } from '../lib/utils';

interface ApplianceStagingProps {
  onComplete: (appliances: Appliance[]) => void;
  onChange?: (appliances: Appliance[]) => void;
}

export default function ApplianceStaging({ onComplete, onChange }: ApplianceStagingProps) {
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});

  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

    const existingIndex = selectedAppliances.findIndex(a =>
      a.id === baseAppliance.id && a.selectedOption === newAppliance.selectedOption
    );

    let updatedList: Appliance[] = [...selectedAppliances];

    if (existingIndex !== -1) {
      updatedList[existingIndex].quantity += qty;
    } else {
      updatedList.push(newAppliance);
    }

    setSelectedAppliances(updatedList);
    onChange?.(updatedList);
  };

  const removeAppliance = (index: number) => {
    const updated = selectedAppliances.filter((_, i) => i !== index);
    setSelectedAppliances(updated);
    onChange?.(updated);
  };

  const totalSelected = selectedAppliances.reduce((sum, app) => sum + app.quantity, 0);
  const totalWattage = selectedAppliances.reduce((sum, app) => sum + (app.wattage * app.quantity), 0);

  // Scroll with arrows
  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 350; // Good step for 3-card view
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Mouse drag support
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const onMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartX(e.pageX - carousel.offsetLeft);
      setScrollLeft(carousel.scrollLeft);
    };

    const onMouseLeave = () => setIsDragging(false);
    const onMouseUp = () => setIsDragging(false);

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      carousel.scrollLeft = scrollLeft - walk;
    };

    carousel.addEventListener('mousedown', onMouseDown);
    carousel.addEventListener('mouseleave', onMouseLeave);
    carousel.addEventListener('mouseup', onMouseUp);
    carousel.addEventListener('mousemove', onMouseMove);

    return () => {
      carousel.removeEventListener('mousedown', onMouseDown);
      carousel.removeEventListener('mouseleave', onMouseLeave);
      carousel.removeEventListener('mouseup', onMouseUp);
      carousel.removeEventListener('mousemove', onMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  return (
    <div className="flex h-full gap-8 p-6 max-w-7xl mx-auto">
      {/* LEFT SIDEBAR - Your Appliances (Live Profile) */}
      {/* <div className="w-96 bg-solar-navy/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Your Appliances</h2>
          <p className="text-solar-text/60 text-sm">Live summary</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {selectedAppliances.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-solar-text/40">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <Plus className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium">Your list is empty</p>
              <p className="text-sm mt-2">Add appliances from the center</p>
            </div>
          ) : (
            selectedAppliances.map((app, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-2xl p-4 flex gap-4 group"
              >
                <div className="w-12 h-12 flex-shrink-0 bg-white/10 rounded-xl flex items-center justify-center">
                  {getApplianceIcon(app.id, "w-7 h-7")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{app.quantity}× {app.variantLabel || app.name}</div>
                  <div className="text-xs text-solar-text/60">
                    {app.wattage}W × {app.quantity} = {app.wattage * app.quantity}W
                  </div>
                </div>
                <button
                  onClick={() => removeAppliance(index)}
                  className="p-2 text-red-400/70 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {selectedAppliances.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-solar-text/60">Total items</span>
              <span className="font-semibold">{totalSelected}</span>
            </div>
            <div className="flex justify-between mb-6 text-sm">
              <span className="text-solar-text/60">Total load</span>
              <span className="font-semibold text-solar-electric">{totalWattage}W</span>
            </div>

            <button
              onClick={() => onComplete(selectedAppliances)}
              className="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2"
            >
              Continue <Check className="w-5 h-5" />
            </button>
          </div>
        )}
      </div> */}

      {/* CENTER - Carousel with 3 visible cards */}
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">What appliances do you use?</h1>
          <p className="text-solar-text/60 text-lg">Choose appliances • Pick variant • Adjust quantity</p>
        </div>
       

        {/* Arrow Controls */}
        <div className="ml-auto flex items-center justify-between mb-4 px-2">
          <div className="flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="p-3 bg-solar-navy/80 hover:bg-solar-navy border border-white/10 rounded-2xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 bg-solar-navy/80 hover:bg-solar-navy border border-white/10 rounded-2xl transition-all active:scale-95"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative flex-1">
          {/* Fade gradients to show scrollable area */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0f1c] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0f1c] to-transparent z-10 pointer-events-none" />

          <div
            ref={carouselRef}
            className={cn(
              " flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory",
              "scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            {APPLIANCES_LIST.map((appliance) => {
              const qty = quantities[appliance.id] || 1;
              const selectedVariant = selectedVariants[appliance.id];
              const currentWattage = selectedVariant ? selectedVariant.value : appliance.wattage;

              return (
                <motion.div
                  key={appliance.id}
                  whileHover={{ y: -6 }}
                  className="min-w-[310px] bg-solar-card rounded-3xl p-7 border border-white/10 hover:border-solar-electric/40 transition-all snap-start flex-shrink-0"
                >
                  <div className="flex justify-center mb-7">
                    <div className="w-24 h-24">
                      {getApplianceIcon(appliance.id, "w-full h-full drop-shadow-md")}
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-center mb-2">{appliance.name}</h3>
                  <p className="text-center text-solar-text/60 mb-7 text-sm">
                    {currentWattage}W base load
                  </p>

                  {appliance.options && (
                    <div className="flex flex-wrap gap-2 justify-center mb-8">
                      {appliance.options.map((opt: any) => (
                        <button
                          key={opt.label}
                          onClick={() => updateVariant(appliance.id, opt)}
                          className={cn(
                            "px-4 py-1.5 text-xs rounded-full border transition-all",
                            selectedVariant?.value === opt.value
                              ? "bg-solar-electric text-white border-solar-electric"
                              : "border-white/20 hover:border-white/40"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-solar-navy/60 rounded-2xl p-1">
                      <button
                        onClick={() => updateQuantity(appliance.id, qty - 1)}
                        className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-display font-bold text-2xl">{qty}</span>
                      <button
                        onClick={() => updateQuantity(appliance.id, qty + 1)}
                        className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => addAppliance(appliance)}
                      className="flex-1 btn-primary py-4 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      <Plus className="w-5 h-5" /> Add
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
         <button
              onClick={() => onComplete(selectedAppliances)}
              className="btn-primary w-40 py-4 text-base font-semibold flex items-center gap-2 ml-auto"
            >
              Continue <Check className="w-5 h-5" />
            </button>
      </div>
      
    </div>
    
  );
}