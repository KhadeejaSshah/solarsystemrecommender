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

type Step = 'entry' | 'user-details' | 'appliances' | 'ev-info' | 'usage' | 'backup' | 'optional-bill' | 'analyzing' | 'result';

export default function App() {
  const [step, setStep] = useState<Step>('entry');
  const [userData, setUserData] = useState<Partial<UserData>>({
    appliances: [],
    budgetSensitivity: 50,
    evInfo: { status: 'none' },
    houseType: 'house',
    entryPath: 'appliances',
  });

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

  const journeySteps: Step[] = ['user-details', 'appliances', 'ev-info', 'usage', 'backup', 'optional-bill'];
  const currentProgressIdx = journeySteps.indexOf(step);

  return (
    <div className="min-h-screen bg-solar-navy text-white selection:bg-solar-orange/30">
      <CursorGlow />

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
                  <ApplianceStaging onComplete={handleAppliances} />
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
