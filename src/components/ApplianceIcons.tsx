import React from 'react';

export const FanIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Mounting rod */}
    <line x1="32" y1="2" x2="32" y2="18" />
    {/* Motor housing dome */}
    <path d="M24 30c0-6 3.5-12 8-12s8 6 8 12" fill="currentColor" />
    {/* Motor bottom cap */}
    <path d="M22 30 Q23 36 32 36 Q41 36 42 30 Z" fill="currentColor" />
    {/* Blade 1 - upper right */}
    <path d="M38 24 C44 16 54 10 58 12 C62 14 56 22 28 32" fill="currentColor" opacity="0.85" />
    {/* Blade 2 - upper left */}
    <path d="M26 24 C20 16 10 10 6 12 C2 14 8 22 28 28" fill="currentColor" opacity="0.85" />
    {/* Blade 3 - bottom center */}
    <path d="M28 34 C26 42 26 54 30 58 C34 62 38 54 36 30" fill="currentColor" opacity="0.85" />
  </svg>
);

export const ACIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* AC Body */}
    <path d="M4 16 L60 16 Q62 16 62 20 L62 44 Q62 48 60 48 L4 48 Q2 48 2 44 L2 20 Q2 16 4 16 Z" fill="currentColor" fillOpacity="0.05" />
    <rect x="2" y="16" width="60" height="32" rx="4" />
    {/* Vents */}
    <line x1="8" y1="36" x2="56" y2="36" />
    <line x1="8" y1="40" x2="56" y2="40" />
    <line x1="8" y1="44" x2="56" y2="44" opacity="0.3" />
    {/* Intake grill top */}
    <line x1="8" y1="22" x2="56" y2="22" strokeWidth="1" opacity="0.5" />
    <line x1="8" y1="26" x2="56" y2="26" strokeWidth="1" opacity="0.5" />
    {/* Brand area */}
    <rect x="28" y="28" width="8" height="2" rx="1" fill="currentColor" opacity="0.2" />
    {/* Status display */}
    <rect x="52" y="26" width="4" height="4" rx="1" fill="currentColor" />
  </svg>
);

export const FridgeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Fridge Body */}
    <rect x="12" y="4" width="40" height="56" rx="4" fill="currentColor" fillOpacity="0.05" />
    {/* Split line */}
    <line x1="12" y1="24" x2="52" y2="24" />
    {/* Handles */}
    <rect x="44" y="12" width="2" height="8" rx="1" fill="currentColor" />
    <rect x="44" y="32" width="2" height="12" rx="1" fill="currentColor" />
    {/* Display */}
    <rect x="26" y="10" width="12" height="4" rx="1" fill="currentColor" opacity="0.2" />
  </svg>
);

export const LightsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Bulb glass */}
    <path d="M32 40c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z" />
    <path d="M26 40h12v4a4 4 0 01-4 4h-4a4 4 0 01-4-4v-4z" />
    {/* Base detail */}
    <line x1="28" y1="44" x2="36" y2="44" />
    <line x1="30" y1="48" x2="34" y2="48" />
    {/* Glow rays */}
    <line x1="32" y1="6" x2="32" y2="10" />
    <line x1="50.4" y1="13.6" x2="47.6" y2="16.4" />
    <line x1="58" y1="28" x2="54" y2="28" />
    <line x1="50.4" y1="42.4" x2="47.6" y2="39.6" />
    <line x1="13.6" y1="42.4" x2="16.4" y2="39.6" />
    <line x1="6" y1="28" x2="10" y2="28" />
    <line x1="13.6" y1="13.6" x2="16.4" y2="16.4" />
  </svg>
);

export const MotorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Motor body */}
    <rect x="8" y="20" width="40" height="28" rx="2" fill="currentColor" fillOpacity="0.05" />
    {/* Cooling fins */}
    <line x1="16" y1="20" x2="16" y2="48" strokeWidth="1" opacity="0.3" />
    <line x1="24" y1="20" x2="24" y2="48" strokeWidth="1" opacity="0.3" />
    <line x1="32" y1="20" x2="32" y2="48" strokeWidth="1" opacity="0.3" />
    <line x1="40" y1="20" x2="40" y2="48" strokeWidth="1" opacity="0.3" />
    {/* Pulley/Axle */}
    <circle cx="52" cy="34" r="6" />
    <circle cx="52" cy="34" r="2" fill="currentColor" />
    {/* Base mount */}
    <line x1="12" y1="48" x2="12" y2="52" />
    <line x1="44" y1="48" x2="44" y2="52" />
    <line x1="8" y1="52" x2="48" y2="52" />
  </svg>
);

export const TVIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Screen Frame */}
    <rect x="4" y="10" width="56" height="36" rx="2" fill="currentColor" fillOpacity="0.05" />
    {/* Inner screen */}
    <rect x="8" y="14" width="48" height="28" rx="1" opacity="0.2" />
    {/* Stand */}
    <path d="M28 46h8 L38 52 H26 Z" />
    <line x1="32" y1="46" x2="32" y2="50" />
    {/* Power LED */}
    <circle cx="54" cy="42" r="1" fill="currentColor" />
  </svg>
);

export const IronIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Iron Shape */}
    <path d="M12 48h40c4 0 8-4 8-8 L56 24 C56 16 48 12 40 12 H12 Z" fill="currentColor" fillOpacity="0.05" />
    <path d="M12 48h40c4 0 8-4 8-8 L56 24 C56 16 48 12 40 12 H12 v36z" />
    {/* Handle */}
    <path d="M20 12c-4 0-8 4-8 8v12h32s0-20-24-20z" opacity="0.5" />
    {/* Dial */}
    <circle cx="36" cy="30" r="4" opacity="0.4" />
  </svg>
);

export const MicrowaveIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Microwave Body */}
    <rect x="4" y="12" width="56" height="36" rx="4" fill="currentColor" fillOpacity="0.05" />
    {/* Window */}
    <rect x="10" y="20" width="32" height="20" rx="2" opacity="0.3" />
    {/* Controls */}
    <rect x="48" y="20" width="6" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <circle cx="51" cy="32" r="3" opacity="0.4" />
    <circle cx="51" cy="40" r="3" opacity="0.4" />
    {/* Handle */}
    <rect x="42" y="20" width="2" height="20" rx="1" fill="currentColor" />
  </svg>
);

export const getApplianceIcon = (id: string, className?: string) => {
  switch (id) {
    case 'fan': return <FanIcon className={className} />;
    case 'ac': return <ACIcon className={className} />;
    case 'fridge': return <FridgeIcon className={className} />;
    case 'lights': return <LightsIcon className={className} />;
    case 'motor': return <MotorIcon className={className} />;
    case 'tv': return <TVIcon className={className} />;
    case 'iron': return <IronIcon className={className} />;
    case 'microwave': return <MicrowaveIcon className={className} />;
    default: return null;
  }
};
