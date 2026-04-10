import { motion } from 'motion/react';
import { ChevronRight, Zap, Sun, Shield } from 'lucide-react';
import { APPLIANCES_LIST } from '../types';
import { getApplianceIcon } from './ApplianceIcons';

interface EntryScreenProps {
  onStart: () => void;
}

export default function EntryScreen({ onStart }: EntryScreenProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-solar-electric/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-solar-orange/5 rounded-full blur-[120px]" />
      </div>

      {/* Dancing Appliances */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {APPLIANCES_LIST.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{
              x: Math.random() * 1000,
              y: Math.random() * 800,
              opacity: 0
            }}
            animate={{
              x: [
                Math.random() * 1000,
                Math.random() * 1000,
                Math.random() * 1000
              ],
              y: [
                Math.random() * 800,
                Math.random() * 800,
                Math.random() * 800
              ],
              opacity: [0.05, 0.15, 0.05],
              rotate: [0, 180, 360],
              scale: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-24 h-24 flex items-center justify-center text-solar-text/20"
          >
            {getApplianceIcon(app.id, "w-full h-full opacity-30")}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-solar-electric/10 border border-solar-electric/20 text-solar-electric text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3" /> Pakistan's #1 Solar Designer
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold text-solar-text leading-tight tracking-tighter flex flex-col items-center">
            <span>Your Energy,</span>
            <span className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-24 h-24 md:w-32 md:h-32 relative inline-block align-middle"
              >
                <img
                  src="/logo.png"
                  alt="SkyElectric Logo"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    // Fallback to a themed zap icon if logo.png is missing
                    e.currentTarget.src = "https://api.iconify.design/lucide:zap.svg?color=%232563EB";
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-solar-electric/10 rounded-full blur-2xl -z-10" />
              </motion.div>
              Designed.
            </span>
          </h1>

          <p className="text-xl text-solar-text/60 max-w-2xl mx-auto leading-relaxed">
            Experience the future of solar with SkyElectric. Our AI-driven designer builds the perfect system for your home in minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          <button
            onClick={onStart}
            className="btn-primary text-xl px-12 py-6 flex items-center gap-3 group shadow-2xl"
          >
            Start Appliance Journey
            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="flex items-center gap-8 text-solar-text/40">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Solar Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Tier-1 Quality</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Visual */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
