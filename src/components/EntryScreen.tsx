import { motion } from 'motion/react';
import { Sun } from 'lucide-react';

interface EntryScreenProps {
  onStart: () => void;
}

export default function EntryScreen({ onStart }: EntryScreenProps) {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-solar-navy">
      {/* Background Solar Rays */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-solar-orange rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-solar-electric rounded-full blur-[100px] opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="z-10 text-center px-4"
      >
        <div className="relative inline-block mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 bg-solar-orange/20 rounded-full blur-xl"
          />
          <Sun className="w-24 h-24 text-solar-orange drop-shadow-[0_0_15px_rgba(255,159,28,0.8)]" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 tracking-tighter">
          SKY<span className="text-solar-orange">ELECTRIC</span>
        </h1>
        <p className="text-white/60 text-lg md:text-xl mb-12 max-w-md mx-auto font-light tracking-wide">
          The future of energy in Pakistan, designed by AI for your home.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 159, 28, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-12 py-4 bg-transparent border border-solar-orange text-solar-orange rounded-full font-bold tracking-widest uppercase text-sm hover:bg-solar-orange hover:text-white transition-all duration-300 group"
        >
          <span className="relative z-10">Start Building</span>
          <motion.div 
            className="absolute inset-0 bg-solar-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
            layoutId="button-bg"
          />
        </motion.button>
      </motion.div>

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}
