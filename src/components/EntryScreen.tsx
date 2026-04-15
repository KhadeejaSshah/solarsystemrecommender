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

      {/* Background Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-solar-electric/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-solar-orange/5 rounded-full blur-[120px]" />
      </div>


      {/* Floating Appliances */}
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


{/* Top Badge */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="absolute top-16 left-1/2 -translate-x-1/2 z-10"
>
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-solar-electric/10 border border-solar-electric/20 text-solar-electric text-xs font-bold uppercase tracking-widest">
    <Zap className="w-3 h-3" />
    Pakistan's #1 Solar Designer
  </div>
</motion.div>


{/* CENTER HERO */}
<div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
  <div className="text-center space-y-6 pointer-events-auto">

    {/* Headline */}
    <h1 className="text-6xl md:text-8xl font-display font-bold text-solar-text leading-[0.95] tracking-tight flex flex-col items-center">

      <motion.span
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Your Energy,
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-transparent bg-clip-text bg-gradient-to-r from-solar-electric via-solar-blue to-solar-electric"
      >
        Intelligently
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Designed.
      </motion.span>

    </h1>


    {/* Underline */}
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "140px" }}
      transition={{ delay: 0.7 }}
      className="h-[3px] bg-gradient-to-r from-transparent via-solar-electric to-transparent mx-auto rounded-full"
    />

  </div>
</div>


{/* Bottom CTA */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1 }}
  className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-10"
>

  <p className="text-lg text-solar-text/60 max-w-xl text-center">
    Experience the future of solar with SkyElectric. AI designs your perfect
    energy system in minutes.
  </p>

  <button
    onClick={onStart}
    className="btn-primary text-xl px-12 py-6 flex items-center gap-3 group shadow-2xl"
  >
    Start Appliance Journey
    <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
  </button>

</motion.div>
    </div>
  );
}
