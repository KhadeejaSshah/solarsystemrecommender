import React from 'react';

export const FanIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 12c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6zM12 12c0 3.3-2.7 6-6 6S0 15.3 0 12s2.7-6 6-6 6 2.7 6 6zM12 12c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zM12 12c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z" />
    <circle cx="12" cy="12" r="2" fill="white" />
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
