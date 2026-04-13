import React from 'react';
import { useHouseMaterials } from './HouseModel';

interface EVCarProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isDark?: boolean;
}

export const EVCar = ({ position = [0, 0, 0], rotation = [0, 0, 0], isDark = false }: EVCarProps) => {
  const M = useHouseMaterials();

  return (
    <group position={position} rotation={rotation}>
      {/* Lower Body */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.7, 2.0]} />
        <meshStandardMaterial color={isDark ? "#b0b2b5" : "#f0f2f5"} roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Body Sides */}
      <mesh position={[0, 0.85, 1.08]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.5, 0.15]} />
        <meshStandardMaterial color={isDark ? "#b0b2b5" : "#f0f2f5"} roughness={0.15} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.85, -1.08]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.5, 0.15]} />
        <meshStandardMaterial color={isDark ? "#b0b2b5" : "#f0f2f5"} roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Cabin / Greenhouse */}
      <mesh position={[-0.2, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.65, 1.75]} />
        <meshStandardMaterial color="#223344" roughness={0.05} metalness={0.3} transparent opacity={0.65} />
      </mesh>

      {/* Roof */}
      <mesh position={[-0.2, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.15, 1.7]} />
        <meshStandardMaterial color={isDark ? "#b0b2b5" : "#f0f2f5"} roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Hood */}
      <mesh position={[1.55, 0.62, 0]} rotation={[-0.07, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.25, 2.0]} />
        <meshStandardMaterial color={isDark ? "#b0b2b5" : "#f0f2f5"} roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Trunk */}
      <mesh position={[-1.85, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.3, 2.0]} />
        <meshStandardMaterial color={isDark ? "#b0b2b5" : "#f0f2f5"} roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Headlights */}
      <group position={[2.13, 0.75, 0.6]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.2, 0.45]} />
          <meshStandardMaterial color="#cccccc" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.05, 12]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={isDark ? 5 : 0} 
            transparent 
            opacity={0.8}
          />
        </mesh>
      </group>
      <group position={[2.13, 0.75, -0.6]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.2, 0.45]} />
          <meshStandardMaterial color="#cccccc" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.05, 12]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={isDark ? 5 : 0} 
            transparent 
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Taillights */}
      <mesh position={[-2.12, 0.75, 0.7]}>
        <boxGeometry args={[0.05, 0.15, 0.4]} />
        <meshStandardMaterial 
          color="#ff2200" 
          emissive="#ff2200" 
          emissiveIntensity={isDark ? 2 : 0} 
        />
      </mesh>
      <mesh position={[-2.12, 0.75, -0.7]}>
        <boxGeometry args={[0.05, 0.15, 0.4]} />
        <meshStandardMaterial 
          color="#ff2200" 
          emissive="#ff2200" 
          emissiveIntensity={isDark ? 2 : 0} 
        />
      </mesh>

      {/* Wheels */}
      {[ [1.3, 0.3, 0.9], [1.3, 0.3, -0.9], [-1.3, 0.3, 0.9], [-1.3, 0.3, -0.9] ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.3, 24]} />
            <meshStandardMaterial color="#151515" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.05, 12]} />
            <meshStandardMaterial color="#cccccc" roughness={0.2} metalness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
