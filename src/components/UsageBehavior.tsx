import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { UsageBehavior } from '../types';
import { Sun, Moon, Scale } from 'lucide-react';

interface UsageBehaviorProps {
  onSelect: (behavior: UsageBehavior) => void;
}

export default function UsageBehaviorStep({ onSelect }: UsageBehaviorProps) {
  const options: { id: UsageBehavior; label: string; icon: any; description: string }[] = [
    { 
      id: 'day-heavy', 
      label: 'Day-heavy', 
      icon: Sun, 
      description: 'Most usage during sunlight hours (ACs, office work).' 
    },
    { 
      id: 'night-heavy', 
      label: 'Night-heavy', 
      icon: Moon, 
      description: 'Peak usage after sunset (Lights, TV, evening cooling).' 
    },
    { 
      id: 'balanced', 
      label: 'Balanced', 
      icon: Scale, 
      description: 'Consistent usage throughout the day and night.' 
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="bottom" className="max-w-3xl">
        <h2 className="text-3xl font-display font-bold text-solar-text mb-2 text-center">
          Usage Behavior
        </h2>
        <p className="text-solar-text/50 mb-12 text-center">How do you typically use electricity?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(option.id)}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border border-solar-text/10 hover:bg-solar-navy hover:border-solar-electric/50 transition-all duration-300 group text-center"
            >
              <div className="w-16 h-16 rounded-full bg-solar-electric/10 flex items-center justify-center mb-4 group-hover:bg-solar-electric/20 transition-colors">
                <option.icon className="w-8 h-8 text-solar-electric" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-solar-text">{option.label}</h3>
              <p className="text-sm text-solar-text/40 leading-relaxed">{option.description}</p>
            </motion.button>
          ))}
        </div>
      </StepWrapper>
    </div>
  );
}
