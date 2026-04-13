import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Appliance, EVInfo } from '../types';

import { Battery, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApplianceIcon } from './ApplianceIcons';

interface HouseVisualProps {
  appliances: Appliance[];
  evInfo: EVInfo;
}

export default function HouseVisual({ appliances, evInfo }: HouseVisualProps) {

  const applianceSlots: Record<string, { left: string; top: string }> = {
    fridge: { left: '28%', top: '70%' },
    microwave: { left: '35%', top: '72%' },
    tv: { left: '68%', top: '72%' },
    lights: { left: '78%', top: '60%' },
    ac: { left: '40%', top: '35%' },
    fan: { left: '30%', top: '40%' },
    iron: { left: '72%', top: '45%' },
    motor: { left: '22%', top: '85%' }
  };

  const fallbackSlots = [
    { left: '45%', top: '65%' },
    { left: '55%', top: '65%' },
    { left: '65%', top: '65%' }
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">

      {/* Background Glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(58,134,255,0.06),transparent)]"
      />

      {/* HOUSE CONTAINER */}
      <div className="relative w-full max-w-2xl">

        {/* VIDEO HOUSE */}
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="w-full relative z-10 rounded-2xl"
        >
          {/* ✅ FIXED PATH */}
          <source src="frontend/public/assets/v3.mp4" type="video/mp4" />
        </motion.video>

        {/* SOLAR GLOW */}
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-[12%] left-[42%] w-[18%] h-[20%] bg-solar-electric/20 blur-xl rounded-lg z-20"
        />

        {/* INVERTER */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute right-[8%] bottom-[28%] z-30"
        >
          <div className="p-3 bg-white rounded-xl shadow-xl">
            <Zap className="w-6 h-6 text-solar-electric" />
          </div>
        </motion.div>

        {/* BATTERY */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 }}
          className="absolute right-[3%] bottom-[18%] z-30"
        >
          <div className="p-3 bg-white rounded-xl shadow-xl">
            <Battery className="w-6 h-6 text-green-500" />
          </div>
        </motion.div>

        {/* APPLIANCES (OPTIONAL - ENABLE IF NEEDED)
        <div className="absolute inset-0 z-30 pointer-events-none">
          {appliances.map((app, i) => {
            const slot = applianceSlots[app.id] || fallbackSlots[i % fallbackSlots.length];

            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="absolute"
                style={{
                  left: slot.left,
                  top: slot.top,
                  transform: "translate(-50%, -50%)"
                }}
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
                  {getApplianceIcon(app.id, "w-6 h-6")}
                </div>
              </motion.div>
            );
          })}
        </div> */}

        {/* ================= EV CAR (IMAGE) ================= */}
        {(evInfo.status === 'own' || evInfo.status === 'planning') && (
          <motion.div
            initial={{ x: 80, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
            className="absolute right-[-2%] bottom-[-4%] z-50"
          >
            {/* CAR IMAGE */}
            <img
              src="frontend/public/assets/teslacar.png"
              alt="EV Car"
              className="w-70 h-auto drop-shadow-2xl"
            />

            {/* GLOW UNDER CAR */}
            <motion.div
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-solar-electric blur-xl rounded-full"
            />
          </motion.div>
        )}

        {/* ENERGY FLOW LINE */}
        {/* {(evInfo.status === 'own' || evInfo.status === 'planning') && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "140px" }}
            transition={{ delay: 2.5 }}
            className="absolute left-[14%] bottom-[22%] h-[2px] bg-gradient-to-r from-solar-electric to-transparent z-20"
          />
        )} */}

        {/* ENERGY PARTICLES */}
        {/* {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ x: [0, 140] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4 }}
            className="absolute left-[14%] bottom-[22%] w-2 h-2 bg-solar-electric rounded-full z-30"
          />
        ))} */}

        {/* HOUSE GLOW */}
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute inset-0 bg-solar-electric/5 blur-2xl z-0"
        />

      </div>
    </div>
  );
}