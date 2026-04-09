import { useState } from 'react';
import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { Zap, ChevronRight } from 'lucide-react';

interface MonthlyUnitsStepProps {
  onComplete: (units: number) => void;
}

export default function MonthlyUnitsStep({ onComplete }: MonthlyUnitsStepProps) {
  const [units, setUnits] = useState<string>('500');

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="top">
        <h2 className="text-3xl font-display font-bold text-white mb-2 text-center">
          Monthly Units
        </h2>
        <p className="text-white/50 mb-12 text-center">Enter your average monthly electricity consumption in kWh.</p>

        <div className="space-y-8">
          <div className="relative flex flex-col items-center">
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-full bg-transparent border-b-2 border-white/10 py-8 text-center text-7xl font-display font-bold text-solar-orange focus:outline-none focus:border-solar-orange transition-all"
              placeholder="0"
            />
            <span className="absolute -bottom-6 text-sm uppercase tracking-[0.3em] text-white/20 font-bold">Units (kWh)</span>
          </div>

          <div className="pt-12">
            <button 
              onClick={() => onComplete(parseInt(units) || 0)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            {[300, 500, 1000].map(val => (
              <button
                key={val}
                onClick={() => setUnits(val.toString())}
                className="py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
              >
                {val} Units
              </button>
            ))}
          </div>
        </div>
      </StepWrapper>
    </div>
  );
}
