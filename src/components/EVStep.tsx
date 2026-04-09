import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StepWrapper from './StepWrapper';
import { EVInfo } from '../types';
import { Car, Bike, Check, ChevronRight } from 'lucide-react';

interface EVStepProps {
  onComplete: (info: EVInfo) => void;
}

export default function EVStep({ onComplete }: EVStepProps) {
  const [info, setInfo] = useState<EVInfo>({
    hasCar: false,
    hasBike: false,
  });

  const [carModel, setCarModel] = useState('');
  const [bikeModel, setBikeModel] = useState('');

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="bottom">
        <h2 className="text-3xl font-display font-bold text-white mb-2 text-center">
          Electric Vehicles
        </h2>
        <p className="text-white/50 mb-8 text-center">Do you own or plan to buy an EV?</p>

        <div className="space-y-6">
          {/* EV Car */}
          <div className="space-y-4">
            <button
              onClick={() => setInfo(prev => ({ ...prev, hasCar: !prev.hasCar }))}
              className={`w-full p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                info.hasCar ? 'bg-solar-orange/10 border-solar-orange' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${info.hasCar ? 'bg-solar-orange/20' : 'bg-white/5'}`}>
                  <Car className={`w-6 h-6 ${info.hasCar ? 'text-solar-orange' : 'text-white/40'}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Electric Car</h3>
                  <p className="text-xs text-white/40">Requires high-power charging</p>
                </div>
              </div>
              {info.hasCar && <Check className="text-solar-orange w-6 h-6" />}
            </button>

            <AnimatePresence>
              {info.hasCar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Car Model (e.g. Tesla Model 3, MG ZS EV)"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-solar-orange/50 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* EV Bike */}
          <div className="space-y-4">
            <button
              onClick={() => setInfo(prev => ({ ...prev, hasBike: !prev.hasBike }))}
              className={`w-full p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                info.hasBike ? 'bg-solar-electric/10 border-solar-electric' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${info.hasBike ? 'bg-solar-electric/20' : 'bg-white/5'}`}>
                  <Bike className={`w-6 h-6 ${info.hasBike ? 'text-solar-electric' : 'text-white/40'}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Electric Bike</h3>
                  <p className="text-xs text-white/40">Standard charging requirements</p>
                </div>
              </div>
              {info.hasBike && <Check className="text-solar-electric w-6 h-6" />}
            </button>

            <AnimatePresence>
              {info.hasBike && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Bike Model (e.g. Vlektra, E-Bike)"
                    value={bikeModel}
                    onChange={(e) => setBikeModel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-solar-electric/50 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-6">
            <button 
              onClick={() => onComplete({ ...info, carModel, bikeModel })}
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
