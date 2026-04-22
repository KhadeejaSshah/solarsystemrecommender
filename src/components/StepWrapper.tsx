import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ReactNode } from 'react';

interface StepWrapperProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export default function StepWrapper({ children, className, direction = 'up' }: StepWrapperProps) {
  const variants = {
    initial: {
      opacity: 0,
      x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
      y: direction === 'up' ? -20 : direction === 'down' ? 20 : 0,
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
