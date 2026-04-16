import React from 'react';


export type ApplianceOption = {
  id: string;  name: string;
};

export const APPLIANCE_LIST: ApplianceOption[] = [
  { id: 'fan', name: 'Fan' },
  { id: 'ac', name: 'AC' },
  { id: 'fridge', name: 'Fridge' },
  { id: 'lights', name: 'Lights' },
  { id: 'motor', name: 'Water motor' },
  { id: 'tv', name: 'TV' },
  { id: 'iron', name: 'Iron' },
  { id: 'microwave', name: 'Microwave' },
];

export const FanIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 10V3" />
    <path d="M12 21v-7" />
    <path d="M10 12H3" />
    <path d="M21 12h-7" />
    <path d="M12 12c4-4 8-2 8 2s-4 6-8 2" />
    <path d="M12 12c-4 4-8 2-8-2s4-6 8-2" />
    <path d="M12 12c4 4 2 8-2 8s-6-4-2-8" />
    <path d="M12 12c-4-4-2-8 2-8s6 4 2 8" />
  </svg>
);

export const ACIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <rect x="4" y="14" width="16" height="1" fill="white" opacity="0.5" />
    <rect x="4" y="16" width="16" height="1" fill="white" opacity="0.5" />
    <circle cx="19" cy="9" r="1" fill="white" />
  </svg>
);

export const FridgeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <rect x="4" y="10" width="16" height="1" fill="white" />
    <rect x="15" y="5" width="2" height="3" rx="1" fill="white" />
    <rect x="15" y="13" width="2" height="5" rx="1" fill="white" />
  </svg>
);

export const LightsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" />
  </svg>
);

export const MotorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="4" y="8" width="12" height="8" rx="2" />
    <circle cx="18" cy="12" r="4" />
    <rect x="2" y="10" width="2" height="4" />
    <rect x="8" y="6" width="4" height="2" />
  </svg>
);

export const TVIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="2" y="4" width="20" height="14" rx="1" />
    <rect x="3" y="5" width="18" height="12" fill="white" opacity="0.1" />
    <path d="M8 21h8M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IronIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2 18h18a2 2 0 002-2V8a2 2 0 00-2-2H8c-4 0-6 4-6 8v2z" />
    <rect x="10" y="8" width="8" height="2" rx="1" fill="white" />
  </svg>
);

export const MicrowaveIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <rect x="4" y="8" width="10" height="8" rx="1" fill="white" opacity="0.2" />
    <circle cx="18" cy="9" r="1.5" fill="white" />
    <circle cx="18" cy="13" r="1.5" fill="white" />
    <circle cx="18" cy="16" r="1.5" fill="white" />
  </svg>
);

export function getApplianceIcon(id: string, className = "", isDark = true) {
  // Map appliance IDs to image filenames
  const iconMap: Record<string, string> = {
    fan: isDark ? "frontend/public/assets/fann.png" : "frontend/public/assets/fann.png",
    fridge: isDark ? "frontend/public/assets/blackfridge.png" : "frontend/public/assets/fridge.png",
    lights: isDark ? "frontend/public/assets/lightbulb.png" : "frontend/public/assets/lightbulb.png",
    microwave: isDark ? "frontend/public/assets/micro.png" : "frontend/public/assets/micro.png",
    motor: isDark ? "frontend/public/assets/motor.png" : "frontend/public/assets/motor.png",
    ac: isDark ? "frontend/public/assets/ac.png" : "frontend/public/assets/ac.png",
    iron: isDark ? "frontend/public/assets/iron.png" : "frontend/public/assets/iron.png",
    tv: isDark ? "frontend/public/assets/ledtv.png" : "frontend/public/assets/ledtv.png",
  };

  if (iconMap[id]) {
    return (
      <img
        src={iconMap[id]}
        alt={id}
        className={className}
        style={{ objectFit: "contain", width: "100%", height: "100%" }}
        draggable={false}
      />
    );
  }

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
