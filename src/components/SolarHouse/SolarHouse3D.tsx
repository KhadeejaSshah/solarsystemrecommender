import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Stars, Sky, Cloud } from '@react-three/drei';
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

  // Dynamic colors for horizon blending
  const skyColor = isDark ? '#020408' : '#87ceeb';
  const fogColor = isDark ? '#020408' : '#a3d8ff';
  const goldenLight = "#ffaa33";

  return (
    <div className="w-full h-full min-h-[600px] relative rounded-[2.5rem] overflow-hidden bg-black shadow-2xl">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[fogColor, 30, 200]} />

        <PerspectiveCamera makeDefault position={[-28, 7, 24]} fov={32} />
        <OrbitControls
          enablePan={false}
          minDistance={20}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={false}
          target={[0, 2, 0]}
        />

        {/* Global Lighting */}
        <ambientLight intensity={isDark ? 0.2 : 0.8} color={isDark ? "#4466cc" : "#ffffff"} />

        {/* Dynamic Light Setup */}
        <directionalLight
          position={[50, 60, 30]}
          intensity={isDark ? 0.6 : 3.8}
          color={isDark ? "#8ab4cc" : "#fff4e0"}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
          shadow-bias={-0.0001}
        />

        {/* Night Atmosphere */}
        {isDark && (
          <group>
            {/* Interior Ambient Glow */}
            <pointLight position={[0, 3.5, 1.5]} intensity={2.5} distance={15} color="#ffcc55" />

            {/* Entrance Detail Lights (Warm Golden) */}
            <pointLight position={[1.5, 3.5, 4]} intensity={2.0} distance={10} color={goldenLight} castShadow />
            <pointLight position={[-4, 3.5, 3.5]} intensity={1.5} distance={8} color={goldenLight} />

            {/* Porch Floodlight */}
            <spotLight
              position={[1.5, 5, 4.5]}
              angle={0.6}
              penumbra={1}
              intensity={8}
              distance={12}
              color={goldenLight}
              target-position={[1.5, 0, 8]}
              castShadow
            />
          </group>
        )}

        {/* Sky / Environment */}
        {!isDark ? (
          <>
            <Sky sunPosition={[50, 60, 30]} turbidity={0.02} rayleigh={0.1} mieCoefficient={0.002} />
            <Cloud position={[-20, 20, -50]} opacity={0.5} scale={2} />
            <Cloud position={[30, 25, -60]} opacity={0.3} scale={3} />
            <Environment preset="park" shadow-bias={-0.001} />
          </>
        ) : (
          <>
            <Stars radius={150} depth={50} count={8000} factor={4} saturation={0} fade speed={2} />
            <Environment preset="night" />
          </>
        )}

        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            {/* House and its synchronized elements */}
            <group rotation={[0, -Math.PI / 2, 0]}>
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
            </group>

            {hasEV && (
              <EVCar
                position={[-6.5, 0.75, -3.0]} // Re-aligned to new garage position
                rotation={[0, -Math.PI / 2, 0]}
                isDark={isDark}
              />
            )}

            {/* Expansive Farm Estate */}
            <FarmEstate isDark={isDark} />

            {/* Distant Horizon Elements */}
            <DistantScenery isDark={isDark} />

            <ContactShadows
              opacity={0.6}
              scale={60}
              blur={2.5}
              far={10}
              resolution={1024}
              color={isDark ? "#000000" : "#112200"}
            />
          </group>
        </Suspense>
      </Canvas>

      {/* Floating UI Branding */}
      <div className="absolute top-10 left-10 pointer-events-none group">
        <h2 className="text-white font-black text-4xl tracking-tighter drop-shadow-2xl transition-all duration-300 group-hover:scale-105">SolarNest</h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[2px] w-12 bg-yellow-400 shadow-[0_0_10px_#facc15]" />
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-[0.4em]">SOLAR BUILDER.</span>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/5 z-50 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full animate-pulse ${!isDark ? 'bg-yellow-400 shadow-[0_0_20px_#facc15]' : 'bg-blue-400 shadow-[0_0_20px_#60a5fa]'}`} />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/40">Power Grid Status</span>
            <span className="text-xs font-bold text-white/90">
              {!isDark ? 'Solar Harvesting Active' : 'Emergency Storage Mode'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FarmEstate = ({ isDark }: { isDark: boolean }) => {
  return (
    <group>
      {/* Infinite-feel Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color={isDark ? "#0d1a0d" : "#2d4d2d"} roughness={1.0} />
      </mesh>

      {/* Main Farm Lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={isDark ? "#1a2e1a" : "#3d6e3d"} roughness={1.0} />
      </mesh>

      {/* Vineyard Rows with Bollard Lights */}
      <group position={[8, 0, -2]}>
        {[...Array(8)].map((_, i) => (
          <group key={i}>
            <VineyardRow position={[i * 3, 0, 0]} length={40} isDark={isDark} />
            {isDark && i % 2 === 0 && (
              <BollardLight position={[i * 3 + 1.5, 0, 10]} />
            )}
          </group>
        ))}
      </group>

      {/* Dirt Access Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.02, 12]} receiveShadow>
        <planeGeometry args={[8, 100]} />
        <meshStandardMaterial color={isDark ? "#2a1e12" : "#4a3a2a"} roughness={1.0} />
      </mesh>
     
      {/* Path Bollards along road */}
      {isDark && (
        <group>
          {[8, 16, 24].map(z => (
            <BollardLight key={z} position={[-8.5, 0, z]} />
          ))}
        </group>
      )}
    </group>
  );
};

const BollardLight = ({ position }: { position: [number, number, number] }) => {
  const goldenLight = "#fcb450ff";
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={goldenLight} emissive={goldenLight} emissiveIntensity={5} />
      </mesh>
      <pointLight intensity={2} distance={8} color={goldenLight} />
    </group>
  );
};

const VineyardRow = ({ position, length, isDark }: any) => {
  const posts = Math.floor(length / 2.5);
  return (
    <group position={position}>
      {[...Array(posts + 1)].map((_, i) => (
        <mesh key={i} position={[0, 0.9, (i / posts - 0.5) * length]} castShadow>
          <boxGeometry args={[0.1, 1.8, 0.1]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>
      ))}
      {[1.2, 1.6].map(y => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, length, 4]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      ))}
      {[...Array(posts * 2)].map((_, i) => (
        <mesh key={i} position={[0, 0.8 + Math.random() * 0.8, (i / (posts * 2) - 0.5) * length]} castShadow>
          <sphereGeometry args={[0.3 + Math.random() * 0.2, 8, 8]} />
          <meshStandardMaterial color={isDark ? "#122a12" : "#2d5a2d"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

const DistantScenery = ({ isDark }: { isDark: boolean }) => {
  return (
    <group>
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 120 + Math.random() * 60;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, -5, Math.sin(angle) * radius]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <coneGeometry args={[40 + Math.random() * 40, 30 + Math.random() * 20, 6]} />
            <meshStandardMaterial color={isDark ? "#080c08" : "#2a3d2a"} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
};
