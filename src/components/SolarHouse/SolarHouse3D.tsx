import React, { Suspense } from 'react';
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
import { ModernHouseModel } from './HouseModel';
import { Appliance, EVInfo } from '../../types';
import { cn } from '../../lib/utils';
import { ApplianceMarkers } from './ApplianceMarkers';
import { EnergyFlow } from './EnergyFlow';
import { EVCar } from './EVCar'; // Assuming this is your Tesla model file

interface SolarHouse3DProps {
  appliances: Appliance[];
  evInfo: EVInfo;
  isDark?: boolean;
}

export default function SolarHouse3D({ appliances, evInfo, isDark = true }: SolarHouse3DProps) {
  // Check if EV Car is in the selected appliances list
  const hasEVCar = appliances.some(a => a.id === 'tesla' || a.name === 'EV Car');

  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden bg-gradient-to-b from-transparent to-[var(--surface)] group">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[-25, 12, 25]} fov={38} />
          
          <SceneContent appliances={appliances} evInfo={evInfo} isDark={isDark} hasEVCar={hasEVCar} />
          
          <OrbitControls
            enablePan={false}
            minDistance={15}
            maxDistance={80}
            autoRotate={!hasEVCar} // Stop auto-rotate when car is shown for better viewing
            autoRotateSpeed={0.5}
            makeDefault
          />
          
          <Environment preset={isDark ? "night" : "forest"} />
          <ambientLight intensity={isDark ? 0.4 : 1.0} color={isDark ? "#4466cc" : "#ffffff"} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={isDark ? 1.5 : 3.0}
            castShadow
          />
          
          {isDark && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
        </Suspense>
      </Canvas>

      {/* VR UI Overlay */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <div className={cn(
            "p-6 rounded-3xl shadow-2xl backdrop-blur-xl border transition-all duration-700",
            isDark ? "bg-slate-950/45 border-white/10" : "bg-white/80 border-slate-900/10"
          )}>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-2 h-2 rounded-full bg-solar-emerald animate-pulse" />
             <h2 className={cn("text-xl font-black tracking-tighter", isDark ? "text-white" : "text-slate-900")}>SolarNest VR</h2>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-50">Proprietary Simulation</span>
        </div>
      </div>
    </div>
  );
}

function SceneContent({ appliances, evInfo, isDark, hasEVCar }: any) {
  return (
    <group position={[0, -5.2, 0]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <Center top>
          <FloatingBase isDark={isDark} />
          
          <group position={[0, 0.5, 0]}>
            <ModernHouseModel isDark={isDark} />
            
            {/* Render Tesla Model if selected */}
            {hasEVCar && (
              <group position={[-6.5, 0.7, 0.9]} rotation={[0, -Math.PI / 2, 0]}>
                <EVCar />
              </group>
            )}
            
            <ApplianceMarkers appliances={appliances} />
            <EnergyFlow
              isSolarActive={!isDark}
              isBatteryDischarging={true}
              hasEV={hasEVCar}
              appliances={appliances}
            />
          </group>
        </Center>
      </Float>

      <ContactShadows position={[0, -1.1, 0]} opacity={0.4} scale={40} blur={2.5} far={10} />
    </group>
  );
}

function FloatingBase({ isDark }: { isDark: boolean }) {
  return (
    <group>
      <mesh position={[0, -2.5, 0]} castShadow receiveShadow scale={[1.2, 0.6, 1.2]}>
        <dodecahedronGeometry args={[6.5, 2]} />
        <MeshDistortMaterial color={isDark ? "#111827" : "#cbd5e1"} roughness={1} distort={0.35} speed={0} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
        <circleGeometry args={[7.8, 48]} />
        <meshStandardMaterial color={isDark ? "#064E3B" : "#10B981"} />
      </mesh>
    </group>
  );
}