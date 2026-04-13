import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { BackupPreference } from '../types';
import { Battery, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface BackupPreferenceProps {
  onSelect: (pref: BackupPreference) => void;
}

export default function BackupPreferenceStep({ onSelect }: BackupPreferenceProps) {
  const [value, setValue] = useState(4); // Default 4 hours
  const [isFull, setIsFull] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  const handleComplete = () => {
    onSelect(isFull ? 'full' : value);
  };

  const calculateAngle = (clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; // Normalize to 0-360 starting from top
    return angle;
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const angle = calculateAngle(clientX, clientY);
    
    // Map 0-360 angle to 1-13 values (13 is Full)
    const newValue = Math.max(1, Math.min(13, Math.round((angle / 360) * 12) + 1));
    
    if (newValue === 13) {
      setIsFull(true);
    } else {
      setIsFull(false);
      setValue(newValue);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', () => setIsDragging(false));
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', () => setIsDragging(false));
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="left" className="max-w-md w-full">
        <h2 className="text-3xl font-display font-bold text-solar-text mb-2 text-center">
          Backup Duration
        </h2>
        <p className="text-solar-text/50 mb-12 text-center font-medium">Hold and rotate the dial to set your backup preference.</p>

        <div className="flex flex-col items-center gap-12">
          {/* Modern Dial */}
          <div 
            ref={dialRef}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            className="relative w-64 h-64 flex items-center justify-center cursor-pointer select-none touch-none"
          >
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-solar-text/5 shadow-inner bg-solar-navy/30" />
            
            {/* Progress Arc (SVG) */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke={isFull ? "#FF9F1C" : "#3A86FF"}
                strokeWidth="12"
                strokeDasharray={754}
                strokeDashoffset={isFull ? 0 : 754 - (754 * (value / 12))}
                strokeLinecap="round"
                className="transition-all duration-200 ease-out"
              />
            </svg>

            {/* Dial Center */}
            <div className={cn(
              "relative z-10 w-48 h-48 rounded-full bg-solar-surface shadow-2xl border border-solar-text/10 flex flex-col items-center justify-center transition-transform duration-200",
              isDragging && "scale-105 shadow-solar-electric/30"
            )}>
              <Battery className={cn(
                "w-8 h-8 mb-2 transition-colors",
                isFull ? "text-solar-orange" : "text-solar-electric"
              )} />
              <div className="text-5xl font-display font-bold text-solar-text">
                {isFull ? "FULL" : value}
              </div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-solar-text/50 mt-1">
                {isFull ? "Backup" : "Hours"}
              </div>
              
              {/* Rotation Indicator */}
              <motion.div 
                animate={{ rotate: isFull ? 360 : (value / 12) * 360 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className={cn(
                  "absolute top-2 left-1/2 -translate-x-1/2 w-2 h-6 rounded-full",
                  isFull ? "bg-solar-orange" : "bg-solar-electric"
                )} />
              </motion.div>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="flex gap-4 w-full">
            <button
              onClick={() => { setIsFull(false); setValue(4); }}
              className={cn(
                "flex-1 py-4 rounded-2xl border text-sm font-bold transition-all",
                !isFull && value === 4 ? "bg-solar-electric text-white border-solar-electric shadow-lg shadow-solar-electric/20" : "bg-solar-surface text-solar-text border-solar-text/10 hover:border-solar-electric/30"
              )}
            >
              Standard (4h)
            </button>
            <button
              onClick={() => setIsFull(true)}
              className={cn(
                "flex-1 py-4 rounded-2xl border text-sm font-bold transition-all",
                isFull ? "bg-solar-orange text-white border-solar-orange shadow-lg shadow-solar-orange/20" : "bg-solar-surface text-solar-text border-solar-text/10 hover:border-solar-orange/30"
              )}
            >
              Full Backup
            </button>
          </div>

          <button 
            onClick={handleComplete}
            className="btn-primary w-full py-5 flex items-center justify-center gap-2 text-lg"
          >
            Continue <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </StepWrapper>
    </div>
  );
}
