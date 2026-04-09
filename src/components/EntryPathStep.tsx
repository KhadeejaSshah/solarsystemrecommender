import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { EntryPath } from '../types';
import { FileText, Zap, LayoutGrid } from 'lucide-react';

interface EntryPathStepProps {
  onSelect: (path: EntryPath) => void;
}

export default function EntryPathStep({ onSelect }: EntryPathStepProps) {
  const options: { id: EntryPath; label: string; icon: any; description: string }[] = [
    { 
      id: 'upload-bill', 
      label: 'Upload Bill', 
      icon: FileText, 
      description: 'AI extracts units and load from your bill image.' 
    },
    { 
      id: 'monthly-units', 
      label: 'Monthly Units', 
      icon: Zap, 
      description: 'Quickly enter your average monthly unit consumption.' 
    },
    { 
      id: 'appliances', 
      label: 'Appliance Journey', 
      icon: LayoutGrid, 
      description: 'Build your load profile step-by-step with appliances.' 
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="right" className="max-w-3xl">
        <h2 className="text-3xl font-display font-bold text-white mb-2 text-center">
          Design Method
        </h2>
        <p className="text-white/50 mb-12 text-center">How would you like to calculate your solar needs?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(option.id)}
              className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-solar-orange/50 transition-all duration-300 group text-center"
            >
              <div className="w-16 h-16 rounded-full bg-solar-orange/10 flex items-center justify-center mb-4 group-hover:bg-solar-orange/20 transition-colors">
                <option.icon className="w-8 h-8 text-solar-orange" />
              </div>
              <h3 className="text-xl font-bold mb-2">{option.label}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{option.description}</p>
            </motion.button>
          ))}
        </div>
      </StepWrapper>
    </div>
  );
}
