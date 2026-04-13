import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlowProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  speed?: number;
  count?: number;
  active?: boolean;
}

const FlowParticles = ({ start, end, color, speed = 1, count = 20, active = true }: FlowProps) => {
  const points = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const progress = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      progress[i] = Math.random();
    }
    return { pos, progress };
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current || !active) return;
    
    for (let i = 0; i < count; i++) {
      particles.progress[i] += delta * speed * (0.8 + Math.random() * 0.4);
      if (particles.progress[i] > 1) particles.progress[i] = 0;
      
      const t = particles.progress[i];
      // Quadratic bezier curve or simple lerp
      const currentX = start[0] + (end[0] - start[0]) * t;
      const currentY = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI * 0.5) * 0.5;
      const currentZ = start[2] + (end[2] - start[2]) * t;
      
      particles.pos[i * 3] = currentX;
      particles.pos[i * 3 + 1] = currentY;
      particles.pos[i * 3 + 2] = currentZ;
    }
    
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

export const EnergyFlow = ({ isSolarActive = true, isBatteryDischarging = true, hasEV = false }: { isSolarActive?: boolean, isBatteryDischarging?: boolean, hasEV?: boolean }) => {
  return (
    <group>
      {/* Solar to Battery */}
      <FlowParticles
        start={[1, 7.5, 1]}
        end={[0.6, 2.8, 3.1]}
        color="#fbbf24"
        speed={0.8}
        count={25}
        active={isSolarActive}
      />
      
      {/* Battery to House */}
      <FlowParticles
        start={[0.6, 1, 3.1]}
        end={[1.5, 1.2, 0.5]}
        color="#3b82f6"
        speed={1.5}
        count={20}
        active={isBatteryDischarging}
      />

      {/* Battery to EV */}
      {hasEV && (
        <FlowParticles
          start={[0.6, 0.5, 3.1]}
          end={[-5.5, 0.2, 5.5]}
          color="#10b981"
          speed={1.2}
          count={15}
          active={isBatteryDischarging}
        />
      )}
    </group>
  );
};
