import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface StepWrapperProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export default function StepWrapper({ children, direction = 'right', className }: StepWrapperProps) {
  const variants = {
    initial: { 
      opacity: 0, 
      filter: 'blur(10px)', 
      scale: 0.9,
      x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
      y: direction === 'top' ? -100 : direction === 'bottom' ? 100 : 0,
    },
    animate: { 
      opacity: 1, 
      filter: 'blur(0px)', 
      scale: 1, 
      x: 0, 
      y: 0 
    },
    exit: { 
      opacity: 0, 
      filter: 'blur(10px)', 
      scale: 1.1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className={cn("glass-card p-8 rounded-3xl border border-white/10 backdrop-blur-2xl bg-white/5 shadow-2xl max-w-2xl w-full", className)}
    >
      {children}
    </motion.div>
  );
}
