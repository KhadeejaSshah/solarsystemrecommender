/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import EntryScreen from './components/EntryScreen';
import UserDetailsStep from './components/UserDetailsStep';
import ApplianceStaging from './components/ApplianceStaging';
import EVStep from './components/EVStep';
import UsageBehaviorStep from './components/UsageBehavior';
import BackupPreferenceStep from './components/BackupPreference';
import OptionalBillStep from './components/OptionalBillStep';
import AIAnalyzer from './components/AIAnalyzer';
import ResultDashboard from './components/ResultDashboard';
import { UserData, HouseType, Appliance, UsageBehavior, BackupPreference, UserDetails, EntryPath, EVInfo } from './types';
import { cn } from './lib/utils';
import { ChevronLeft, Sun, Moon } from 'lucide-react';

type Step = 'entry' | 'user-details' | 'appliances' | 'ev-info' | 'usage' | 'backup' | 'optional-bill' | 'analyzing' | 'result';

export default function App() {
  const [step, setStep] = useState<Step>('entry');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [userData, setUserData] = useState<Partial<UserData>>({
    appliances: [],
    budgetSensitivity: 50,
    evInfo: { status: 'none' },
    houseType: 'house',
    entryPath: 'appliances',
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const updateData = (newData: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = (currentStep: Step): Step => {
    switch (currentStep) {
      case 'entry': return 'user-details';
      case 'user-details': return 'appliances';
      case 'appliances': return 'ev-info';
      case 'ev-info': return 'usage';
      case 'usage': return 'backup';
      case 'backup': return 'optional-bill';
      case 'optional-bill': return 'analyzing';
      case 'analyzing': return 'result';
      default: return 'entry';
    }
  };

  const handleStart = () => setStep('user-details');

  const handleUserDetails = (details: UserDetails) => {
    updateData({ details });
    setStep('appliances');
  };

  const handleAppliances = (apps: Appliance[]) => {
    updateData({ appliances: apps });
    setStep('ev-info');
  };

  const handleEVInfo = (info: EVInfo) => {
    updateData({ evInfo: info });
    setStep('usage');
  };

  const handleUsage = (behavior: UsageBehavior) => {
    updateData({ usageBehavior: behavior });
    setStep('backup');
  };

  const handleBackup = (pref: BackupPreference) => {
    updateData({ backupPreference: pref });
    setStep('optional-bill');
  };

  const handleOptionalBill = (data: { monthlyUnits?: number; monthlyBill?: number }) => {
    updateData(data);
    setStep('analyzing');
  };

  const handleAnalysisComplete = () => {
    setStep('result');
  };

  const handleBack = () => {
    if (step === 'result') {
      setStep('optional-bill');
      return;
    }
    const currentIndex = journeySteps.indexOf(step);
    if (currentIndex > 0) {
      setStep(journeySteps[currentIndex - 1]);
    } else if (step === 'user-details') {
      setStep('entry');
    }
  };

  const journeySteps: Step[] = ['user-details', 'appliances', 'ev-info', 'usage', 'backup', 'optional-bill'];
  const currentProgressIdx = journeySteps.indexOf(step);

  return (
    <div className="min-h-screen bg-solar-navy text-solar-text transition-colors duration-500 selection:bg-solar-orange/30 relative">
      {/* Persistent Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <div className={cn(
          "relative w-[40%] aspect-square opacity-[0.03] grayscale transition-opacity duration-500",
          theme === 'light' && "opacity-[0.5]"
        )}>
          <img
            src="/logo.png"
            alt=""
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = "https://api.iconify.design/lucide:zap.svg?color=%232563EB";
            }}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <CursorGlow />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        className="fixed top-8 right-8 p-3 rounded-full border border-solar-text/10 bg-solar-navy/50 backdrop-blur-md text-solar-text hover:bg-solar-navy transition-all z-[100] shadow-lg"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Global Back Button (except entry and analyzing) */}
      {step !== 'entry' && step !== 'analyzing' && (
        <button
          onClick={handleBack}
          className="fixed top-8 left-8 p-3 rounded-full border border-solar-text/10 bg-solar-navy/50 backdrop-blur-md text-solar-text hover:bg-solar-navy transition-all z-[100] flex items-center gap-2 group shadow-lg"
        >
          <motion.div whileHover={{ x: -2 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
          <span className="text-xs font-bold uppercase tracking-widest pr-2">Back</span>
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 'entry' && (
          <motion.div key="entry" exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.8 }}>
            <EntryScreen onStart={handleStart} />
          </motion.div>
        )}

        {step !== 'entry' && step !== 'result' && step !== 'analyzing' && (
          <motion.div
            key="journey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex items-center justify-center p-4"
          >
            {/* Side Status */}
            <div className="hidden lg:block fixed left-8 top-133 -translate-y-1/2 w-64 glass-card p-6 z-20 transition-colors duration-500">
              <h3 className="text-sm font-bold uppercase tracking-widest text-solar-electric mb-4">Live Load Profile</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-solar-text/60">Total Appliances</span>
                  <span className="text-xl font-display font-bold text-solar-text">
                    {userData.appliances?.reduce((acc, app) => acc + app.quantity, 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-solar-text/60">Estimated Peak Load</span>
                  <span className="text-xl font-display font-bold text-solar-electric">
                    {((userData.appliances?.reduce((acc, app) => acc + (app.wattage * app.quantity), 0) || 0) / 1000).toFixed(1)} kW
                  </span>
                </div>
                <div className="pt-4 border-t border-solar-text/5">
                  <span className="text-[10px] uppercase tracking-widest block mb-2 text-solar-text/40">Selected Items</span>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {userData.appliances?.map((app, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="truncate mr-2 text-solar-text/80">{app.name} x{app.quantity}</span>
                        <span className="shrink-0 text-solar-text/40">{(app.wattage * app.quantity)}W</span>
                      </div>
                    ))}
                    {(!userData.appliances || userData.appliances.length === 0) && (
                      <span className="text-xs italic text-solar-text/30">No items added yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-solar-orange/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-solar-electric/5 rounded-full blur-[120px]" />
            </div>

            <AnimatePresence mode="wait">
              {step === 'user-details' && (
                <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                  <UserDetailsStep onComplete={handleUserDetails} />
                </motion.div>
              )}
              {step === 'appliances' && (
                <motion.div key="apps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                  <ApplianceStaging
                    onComplete={handleAppliances}
                    onChange={(apps) => updateData({ appliances: apps })}
                  />
                </motion.div>
              )}
              {step === 'ev-info' && (
                <motion.div key="ev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                  <EVStep onComplete={handleEVInfo} />
                </motion.div>
              )}
              {step === 'usage' && (
                <motion.div key="usage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                  <UsageBehaviorStep onSelect={handleUsage} />
                </motion.div>
              )}
              {step === 'backup' && (
                <motion.div key="backup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                  <BackupPreferenceStep onSelect={handleBackup} />
                </motion.div>
              )}
              {step === 'optional-bill' && (
                <motion.div key="optional-bill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                  <OptionalBillStep onComplete={handleOptionalBill} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Indicator */}
            {currentProgressIdx !== -1 && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Step</span>
                <div className="flex gap-1">
                  {journeySteps.map((s, i) => (
                    <div
                      key={s}
                      className={cn(
                        "h-1 rounded-full transition-all duration-500",
                        i <= currentProgressIdx ? "w-8 bg-solar-orange" : "w-2 bg-white/10"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AIAnalyzer onComplete={handleAnalysisComplete} />
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ResultDashboard data={userData as UserData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CursorGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-[400px] h-[400px] bg-solar-orange/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"
      animate={{
        x: mousePos.x - 200,
        y: mousePos.y - 200,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
    />
  );
}
