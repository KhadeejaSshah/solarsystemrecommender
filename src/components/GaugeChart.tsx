import React from 'react';
import { motion } from 'framer-motion';

interface GaugeChartProps {
  progress?: number;
  label?: string;
}

export default function GaugeChart({ progress = 70, label = "System" }: GaugeChartProps) {
  const size = 64;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#fbbf24"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        </div>
      )}
    </div>
  );
}
