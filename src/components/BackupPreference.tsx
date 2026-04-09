import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { BackupPreference } from '../types';
import { Battery, BatteryFull, BatteryMedium } from 'lucide-react';

interface BackupPreferenceProps {
  onSelect: (pref: BackupPreference) => void;
}

export default function BackupPreferenceStep({ onSelect }: BackupPreferenceProps) {
  const options: { id: BackupPreference; label: string; icon: any; description: string }[] = [
    { 
      id: '2h', 
      label: '2 Hours', 
      icon: BatteryMedium, 
      description: 'Essential backup for short load shedding cycles.' 
    },
    { 
      id: '4h', 
      label: '4 Hours', 
      icon: Battery, 
      description: 'Standard backup for typical daily interruptions.' 
    },
    { 
      id: 'full', 
      label: 'Full Backup', 
      icon: BatteryFull, 
      description: 'Maximum reliability for extended outages.' 
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="left" className="max-w-3xl">
        <h2 className="text-3xl font-display font-bold text-white mb-2 text-center">
          Backup Preference
        </h2>
        <p className="text-white/50 mb-12 text-center">How long should your system last during load shedding?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(option.id)}
              className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-solar-electric/50 transition-all duration-300 group text-center"
            >
              <div className="w-16 h-16 rounded-full bg-solar-electric/10 flex items-center justify-center mb-4 group-hover:bg-solar-electric/20 transition-colors">
                <option.icon className="w-8 h-8 text-solar-electric" />
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
