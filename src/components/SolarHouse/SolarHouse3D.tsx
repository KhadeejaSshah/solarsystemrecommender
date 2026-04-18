import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Stars, 
  Float,
  Center,
  MeshDistortMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { ModernHouseModel } from './HouseModel';
import { Appliance, EVInfo } from '../../types';
import { cn } from '../../lib/utils';
import { ApplianceMarkers } from './ApplianceMarkers';
import { EnergyFlow } from './EnergyFlow';

interface SolarHouse3DProps {
  appliances: Appliance[];
  evInfo: EVInfo;
  isDark?: boolean;
}

export default function SolarHouse3D({ appliances, evInfo, isDark = true }: SolarHouse3DProps) {
  const hasEV = evInfo.status !== 'none';

  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden bg-gradient-to-b from-transparent to-[var(--surface)] group">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[-25, 8, 25]} fov={38} />
          
          <SceneContent appliances={appliances} evInfo={evInfo} isDark={isDark} />
          
          <OrbitControls
            enablePan={false}
            minDistance={15}
            maxDistance={80}
            autoRotate
            autoRotateSpeed={0.5}
            makeDefault
          />
          
          {/* High-End Global Lighting */}
          <Environment preset={isDark ? "night" : "forest"} />
          <ambientLight intensity={isDark ? 0.4 : 1.0} color={isDark ? "#4466cc" : "#ffffff"} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={isDark ? 1.5 : 3.0}
            color={isDark ? "#8ab4cc" : "#fff4e0"}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          {isDark && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
        </Suspense>
      </Canvas>

      {/* Premium UI Overlay */}
      <div className="absolute top-8 left-8 pointer-events-none transition-transform duration-500 group-hover:translate-x-2">
        <div
          className={cn(
            "premium-glass p-6 rounded-3xl shadow-2xl backdrop-blur-xl border",
            isDark
              ? "bg-slate-950/45 border-white/10"
              : "bg-white/80 border-slate-900/10"
          )}
        >
          <div className="flex items-center gap-3 mb-1">
             <div className="w-2 h-2 rounded-full bg-solar-emerald animate-pulse" />
             <h2 className={cn(
               "text-xl font-black tracking-tighter",
               isDark ? "text-white" : "text-slate-900"
             )}>SolarNest VR</h2>
          </div>
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-[0.4em]",
            isDark ? "text-white/50" : "text-slate-700/80"
          )}>Proprietary Simulation Engine</span>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.6em]",
          isDark ? "text-white/30" : "text-slate-700/80"
        )}>Interactive 3D Orbital Model</span>
      </div>
    </div>
  );
}

function SceneContent({ appliances, evInfo, isDark }: any) {
  const hasEV = evInfo.status !== 'none';
  
  return (
    <group position={[0, -5.2, 0]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <Center top>
          {/* The Floating Rock Base Fragment */}
          <FloatingBase isDark={isDark} />
          
          {/* The Modern Multi-Volume House */}
          <group position={[0, 0.5, 0]}>
            <ModernHouseModel isDark={isDark} />
            
            {/* Markers and Flow Logic */}
            <ApplianceMarkers appliances={appliances} />
            
            <EnergyFlow
              isSolarActive={!isDark}
              isBatteryDischarging={true}
              hasEV={hasEV}
              appliances={appliances}
            />
          </group>
        </Center>
      </Float>

      <ContactShadows
        position={[0, -1.1, 0]}
        opacity={isDark ? 0.4 : 0.2}
        scale={40}
        blur={2.5}
        far={10}
        color={isDark ? "#000" : "#475569"}
      />
    </group>
  );
}

function FloatingBase({ isDark }: { isDark: boolean }) {
  return (
    <group>
      {/* Ancient Rock Fragment Geometry */}
      <mesh position={[0, -2.5, 0]} castShadow receiveShadow scale={[1.2, 0.6, 1.2]}>
        <dodecahedronGeometry args={[6.5, 2]} />
        <MeshDistortMaterial
          color={isDark ? "#111827" : "#cbd5e1"}
          roughness={1}
          distort={0.35}
          speed={0}
        />
      </mesh>
      
      {/* Manicured Estate Surface Layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
        <circleGeometry args={[7.8, 48]} />
        <meshStandardMaterial 
          color={isDark ? "#064E3B" : "#10B981"} 
          roughness={1} 
        />
      </mesh>

      {/* Sustainable Visual Detail (Floating Crystals) */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i * 1.0) * 6.5,
            -1.5 - Math.random() * 2,
            Math.sin(i * 1.0) * 6.5
          ]}
        >
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial 
            color={isDark ? "#00D1FF" : "#10B981"} 
            emissive={isDark ? "#00D1FF" : "#10B981"} 
            emissiveIntensity={isDark ? 4 : 1} 
          />
        </mesh>
      ))}
    </group>
  );
}
