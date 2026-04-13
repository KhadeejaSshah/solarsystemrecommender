import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Stars, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { HouseModel } from './HouseModel';
import { ApplianceMarkers } from './ApplianceMarkers';
import { EnergyFlow } from './EnergyFlow';
import { EVCar } from './EVCar';
import { Appliance, EVInfo } from '../../types';

interface SolarHouse3DProps {
  appliances: Appliance[];
  evInfo: EVInfo;
  isDark?: boolean;
}

export default function SolarHouse3D({ appliances, evInfo, isDark = true }: SolarHouse3DProps) {
  const hasEV = evInfo.status !== 'none';
  
  return (
    <div className="w-full h-full min-h-[600px] relative rounded-[2.5rem] overflow-hidden bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={[isDark ? '#020408' : '#87ceeb']} />
        {isDark && <fog attach="fog" args={['#020408', 40, 120]} />}
        
        <PerspectiveCamera makeDefault position={[22, 14, 25]} fov={38} />
        <OrbitControls 
          enablePan={false}
          minDistance={15}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={false}
          target={[0, 2, 0]}
        />

        {/* Global Lighting */}
        <ambientLight intensity={isDark ? 0.05 : 0.4} color={isDark ? "#4466aa" : "#ffffff"} />
        
        {/* Main Light (Sun or Moon) */}
        <directionalLight 
          position={[20, 30, 15]} 
          intensity={isDark ? 0.8 : 4.0} 
          color={isDark ? "#8ab4cc" : "#fff4e0"}
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0005}
        />

        {/* Interior Point Lights (at night) */}
        {isDark && (
          <group>
            <pointLight position={[0, 3.5, 1.5]} intensity={1.5} distance={10} color="#ffcc55" />
            <pointLight position={[-2.5, 3.5, 1.2]} intensity={1.2} distance={8} color="#ffcc55" />
            <pointLight position={[2.5, 3.5, 1.2]} intensity={1.2} distance={8} color="#ffcc55" />
            
            {/* Street Lamp Glow */}
            <pointLight position={[-6.5, 4.2, 3.5]} intensity={2.5} distance={12} color="#ffee66" />
          </group>
        )}

        {/* Sky / Environment */}
        {!isDark ? (
          <>
            <Sky sunPosition={[20, 30, 15]} turbidity={0.1} rayleigh={0.5} />
            <Environment preset="city" />
          </>
        ) : (
          <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="night" />
          </>
        )}

        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <HouseModel 
              solarPanels={Math.ceil(appliances.length * 1.5)} 
              isDark={isDark} 
            />
            
            <ApplianceMarkers appliances={appliances} />
            
            <EnergyFlow 
              isSolarActive={!isDark} 
              isBatteryDischarging={true} 
              hasEV={hasEV} 
            />

            {hasEV && (
              <EVCar 
                position={[-5.8, 0.05, 6.2]} 
                rotation={[0, -Math.PI / 1.1, 0]} 
                isDark={isDark} 
              />
            )}

            {/* Street Lamp Housing (Simplified) */}
            <group position={[-6.5, 0, 3.5]}>
              <mesh position={[0, 2.15, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 4.3, 8]} />
                <meshStandardMaterial color="#444444" metalness={0.8} />
              </mesh>
              <mesh position={[0.4, 4.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
                <meshStandardMaterial color="#444444" metalness={0.8} />
              </mesh>
              <mesh position={[0.8, 4.1, 0]} material={new THREE.MeshStandardMaterial({ 
                color: isDark ? "#ffee66" : "#ffffff", 
                emissive: "#ffee66", 
                emissiveIntensity: isDark ? 2 : 0 
              })}>
                <sphereGeometry args={[0.15, 16, 16]} />
              </mesh>
            </group>
            
            {/* Realistic Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#222222" roughness={1} />
            </mesh>
            
            <ContactShadows 
              opacity={0.6} 
              scale={30} 
              blur={2} 
              far={10} 
              resolution={512} 
              color={isDark ? "#000000" : "#112200"} 
            />
          </group>
        </Suspense>
      </Canvas>

      {/* Floating Mode Badge */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-50 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${!isDark ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-blue-400 shadow-[0_0_10px_#60a5fa]'}`} />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/80">
            {!isDark ? 'System Status: Active Solar' : 'System Status: Battery Backup'}
          </span>
        </div>
      </div>
    </div>
  );
}
