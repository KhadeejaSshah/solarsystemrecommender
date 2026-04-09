import { useState } from 'react';
import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { Wallet, ShieldCheck, Sparkles } from 'lucide-react';

interface BudgetSliderProps {
  onComplete: (value: number) => void;
}

export default function BudgetSlider({ onComplete }: BudgetSliderProps) {
  const [value, setValue] = useState(50);

  const getLabel = () => {
    if (value < 33) return { text: 'Economy', icon: Wallet, color: 'text-white/60' };
    if (value < 66) return { text: 'Balanced', icon: ShieldCheck, color: 'text-solar-electric' };
    return { text: 'Premium', icon: Sparkles, color: 'text-solar-orange' };
  };

  const label = getLabel();

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="top">
        <h2 className="text-3xl font-display font-bold text-white mb-2 text-center">
          Budget Sensitivity
        </h2>
        <p className="text-white/50 mb-12 text-center">Choose your preferred balance between cost and quality.</p>

        <div className="space-y-12">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              key={label.text}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <label.icon className={`w-16 h-16 mb-4 ${label.color}`} />
              <span className={`text-4xl font-display font-bold uppercase tracking-tighter ${label.color}`}>
                {label.text}
              </span>
            </motion.div>
          </div>

          <div className="relative w-full h-12 flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-orange"
            />
            <div className="absolute -bottom-8 w-full flex justify-between text-xs uppercase tracking-widest text-white/30 font-bold">
              <span>Cheapest</span>
              <span>Balanced</span>
              <span>Premium</span>
            </div>
          </div>

          <div className="pt-8 flex justify-center">
            <button 
              onClick={() => onComplete(value)}
              className="btn-primary w-full"
            >
              Finalize Design
            </button>
          </div>
        </div>
      </StepWrapper>
    </div>
  );
}
