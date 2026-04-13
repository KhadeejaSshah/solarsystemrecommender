import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appliance, EVInfo } from '../types';

import { Car, Battery, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApplianceIcon } from './ApplianceIcons';

interface HouseVisualProps {
  appliances: Appliance[];
  evInfo: EVInfo;
}

export default function HouseVisual({ appliances, evInfo }: HouseVisualProps) {


  // Appliance positions aligned to realistic house image
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
        className="absolute inset-0 
        bg-[radial-gradient(circle_at_center,rgba(58,134,255,0.06),transparent)]"
      />

      {/* House Container */}
      <div className="relative w-full max-w-2xl">

        {/* House Image */}
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
        <source src="frontend/public/assets/v3.mp4" type="video/mp4" />
      </motion.video>
        {/* <motion.img
          src="frontend/public/assets/housenight.jpeg"
          alt="Solar House"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="w-full relative z-10"
        /> */}

        {/* Solar Panel Glow */}
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute 
          top-[12%] left-[42%] 
          w-[18%] h-[20%]
          bg-solar-electric/20
          blur-xl rounded-lg
          z-20"
        />

        {/* Inverter */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute right-[8%] bottom-[28%] z-30"
        >
          <div className="relative p-3 bg-white rounded-xl shadow-xl">
            <Zap className="w-6 h-6 text-solar-electric" />

            <motion.div
              animate={{ opacity: [0,1,0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute 
              -top-1 -right-1 
              w-2 h-2 
              bg-solar-electric 
              rounded-full"
            />
          </div>
        </motion.div>


        {/* Battery */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 }}
          className="absolute right-[3%] bottom-[18%] z-30"
        >
          <div className="relative p-3 bg-white rounded-xl shadow-xl">
            <Battery className="w-6 h-6 text-green-500" />

            <motion.div
              animate={{ height: ["20%", "80%", "20%"] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute 
              bottom-1 left-1 
              w-[4px] 
              bg-green-400"
            />
          </div>
        </motion.div>


        {/* Appliances
        <div className="absolute inset-0 z-30">

          {appliances.map((app, i) => {

            const slot =
              applianceSlots[app.id] ||
              fallbackSlots[i % fallbackSlots.length];

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

                <div className="
                  w-10 h-10 
                  bg-white 
                  rounded-xl 
                  shadow-lg
                  flex items-center justify-center
                ">
                  {getApplianceIcon(app.id, "w-6 h-6")}
                </div>

              </motion.div>
            );

          })}
        </div> */}



        {/* EV Car */}
        {(evInfo.status === 'own' || evInfo.status === 'planning') && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}

            transition={{ delay: 2 }}
            className="absolute left-[2%] bottom-[10%] z-30"
          >
            <Car className="w-16 h-16 text-solar-electric" />

            {/* Car Glow */}
            <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="
              absolute 
              bottom-0 left-1/2 
              -translate-x-1/2
              w-12 h-2 
              bg-solar-electric
              blur-md
              "
            />
          </motion.div>
        )}


        {/* Charging Line */}
        {(evInfo.status === 'own' || evInfo.status === 'planning') && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "140px" }}
            transition={{ delay: 2.5 }}
            className="
            absolute 
            left-[14%] 
            bottom-[22%] 
            h-[2px] 
            bg-gradient-to-r 
            from-solar-electric 
            to-transparent
            z-20
            "
          />
        )}


        {/* Energy Flow Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ x: [0, 140] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: i * 0.4
            }}
            className="
            absolute
            left-[14%]
            bottom-[22%]
            w-2 h-2
            bg-solar-electric
            rounded-full
            z-30
            "
          />
        ))}


        {/* House Glow */}
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="
          absolute 
          inset-0 
          bg-solar-electric/5 
          blur-2xl 
          z-0
          "
        />

      </div>

    </div>
  );
}