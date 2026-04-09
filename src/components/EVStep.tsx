import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StepWrapper from './StepWrapper';
import { EVInfo } from '../types';
import { Car, Zap, Check, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface EVStepProps {
  onComplete: (info: EVInfo) => void;
}

export default function EVStep({ onComplete }: EVStepProps) {
  const [status, setStatus] = useState<'own' | 'planning' | 'none'>('none');
  const [batterySize, setBatterySize] = useState<string>('');

  const handleComplete = () => {
    onComplete({
      status,
      batterySize: batterySize ? parseFloat(batterySize) : undefined,
    });
  };

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="bottom" className="max-w-md">
        <h2 className="text-3xl font-display font-bold text-solar-text mb-2 text-center">
          Electric Vehicles
        </h2>
        <p className="text-solar-text/50 mb-8 text-center">Do you own or plan to buy an EV?</p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'own', label: 'I own an EV', icon: Car },
              { id: 'planning', label: 'Planning to buy', icon: Zap },
              { id: 'none', label: 'No EV', icon: Check },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStatus(opt.id as any)}
                className={cn(
                  "w-full p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
                  status === opt.id 
                    ? 'bg-solar-electric/10 border-solar-electric' 
                    : 'bg-white border-solar-text/10 hover:bg-solar-navy'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    status === opt.id ? 'bg-solar-electric/20' : 'bg-solar-text/5'
                  )}>
                    <opt.icon className={cn(
                      "w-6 h-6",
                      status === opt.id ? 'text-solar-electric' : 'text-solar-text/40'
                    )} />
                  </div>
                  <h3 className={cn(
                    "font-bold",
                    status === opt.id ? 'text-solar-text' : 'text-solar-text/60'
                  )}>{opt.label}</h3>
                </div>
                {status === opt.id && <Check className="text-solar-electric w-6 h-6" />}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {(status === 'own' || status === 'planning') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-solar-electric font-bold ml-1">
                    EV Battery Size (kWh)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 40, 60, 80"
                    value={batterySize}
                    onChange={(e) => setBatterySize(e.target.value)}
                    className="w-full bg-white border border-solar-text/10 rounded-2xl py-4 px-6 text-solar-text placeholder:text-solar-text/20 focus:outline-none focus:border-solar-electric transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6">
            <button 
              onClick={handleComplete}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </StepWrapper>
    </div>
  );
}
