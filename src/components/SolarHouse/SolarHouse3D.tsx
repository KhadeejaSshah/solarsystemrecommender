import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Stars,
  Float,
  Center,
  Sky
} from '@react-three/drei';
import { EffectComposer, GodRays } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ModernHouseModel } from './HouseModel';
import { Appliance, EVInfo } from '../../types';
import { ApplianceMarkers } from './ApplianceMarkers';
import { EnergyFlow } from './EnergyFlow';
import { EVCar } from './EVCar';

export default function SolarHouse3D({ appliances, evInfo }: { appliances: Appliance[], evInfo: EVInfo }) {
  const hasEVCar = appliances.some(a => a.id === 'tesla' || a.name === 'EV Car');

  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden bg-slate-950">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          {/* Camera adjusted for the 2x house size */}
          <PerspectiveCamera makeDefault position={[-45, 20, 45]} fov={35} />

          <SceneController appliances={appliances} evInfo={evInfo} hasEVCar={hasEVCar} />

          <OrbitControls
            enablePan={false}
            minDistance={30}
            maxDistance={120}
            autoRotate={false}
            autoRotateSpeed={0.5}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function SceneController({ appliances, evInfo, hasEVCar }: any) {
  const sunRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  // TIME LOGIC
  // We use useFrame to create a loop (0 to 1)
  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 0.2; // Adjust speed here
    const cycle = (Math.sin(time) + 1) / 2; // Smoothly bounces between 0 and 1

    // 1. ANIMATE SUN POSITION
    const angle = time * 0.5;
    const x = Math.cos(angle) * 100;
    const y = Math.sin(angle) * 60;
    const z = -50;

    if (sunRef.current) sunRef.current.position.set(x, y, z);
    if (lightRef.current) lightRef.current.position.set(x, y, z);

    // 2. ANIMATE BACKGROUND GRADIENT (COLORS FROM YOUR IMAGE)
    // We interpolate between Deep Purple, Sunset Orange, and Soft Pink
    const colorNight = new THREE.Color("#020617"); // Deep Midnight Navy
    const colorSunset = new THREE.Color("#f59e0b"); // SkyElectric Amber
    const colorDay = new THREE.Color("#bae6fd"); // Crisp Sky Blue
    const colorMorning = new THREE.Color("#f8fafc"); // Misty White Morning

    let finalColor = new THREE.Color();
    if (y > 20) finalColor.lerpColors(colorMorning, colorDay, (y - 20) / 40);
    else if (y > -10) finalColor.lerpColors(colorSunset, colorMorning, (y + 10) / 30);
    else finalColor.lerpColors(colorNight, colorSunset, (y + 60) / 50);

    state.scene.background = finalColor;
  });

  return (
    <>
      {/* THE SUN MESH (Required for Sunrays/GodRays) */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#fffbeb" />
      </mesh>

      <directionalLight
        ref={lightRef}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <ambientLight intensity={0.5} />

      {/* GOD RAYS EFFECT */}
      <EffectComposer multisampling={0}>
        {sunRef.current && (
          <GodRays
            sun={sunRef.current}
            samples={60}
            density={0.96}
            decay={0.9}
            weight={0.4}
            exposure={0.6}
            clampMax={1}
            blur={true}
          />
        )}
      </EffectComposer>

      {/* STARS (only visible when sun is low) */}
      <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* THE HOUSE CONTENT */}
      {/* TO MOVE HOUSE: Change position={[Left/Right, Up/Down, Forward/Back]} */}
      <group position={[9, -11, 0]} scale={2.5}>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
          <Center top>
            <ModernHouseModel isDark={false} />

            {hasEVCar && (
              <group position={[-5.7, 0.7, 0.9]} rotation={[0, -Math.PI / 2, 0]}>
                <EVCar />
              </group>
            )}

            <ApplianceMarkers appliances={appliances} />
            <EnergyFlow isSolarActive={true} appliances={appliances} />
          </Center>
        </Float>
      </group>

      <ContactShadows position={[0, -7.1, 0]} opacity={0.4} scale={80} blur={2.5} far={20} />
      <Environment preset="sunset" />
    </>
  );
}