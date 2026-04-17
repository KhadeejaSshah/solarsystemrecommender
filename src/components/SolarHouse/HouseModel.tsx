import React, { useMemo } from 'react';
import * as THREE from 'three';

// Realistic procedural textures for 3D surfaces
function createDetailedTexture(size: number, color: string, noiseDensity: number) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.Texture();
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  for (let i = 0; i < noiseDensity; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const v = Math.random() * 20 - 10;
    ctx.fillStyle = `rgba(${100 + v},${100 + v},${100 + v},0.15)`;
    ctx.fillRect(x, y, 2, 2);
  }
  
  const text = new THREE.CanvasTexture(c);
  text.wrapS = text.wrapT = THREE.RepeatWrapping;
  return text;
}

export const ModernHouseModel = ({ solarPanels = 10, isDark = false }: { solarPanels?: number, isDark?: boolean }) => {
  const materials = useMemo(() => {
    const wallTex = createDetailedTexture(512, '#F8FAFC', 15000);
    const roofTex = createDetailedTexture(1024, '#1E293B', 25000);
    
    return {
      concrete: new THREE.MeshStandardMaterial({ 
        map: wallTex, 
        color: isDark ? '#475569' : '#FFFFFF', 
        roughness: 0.8, 
        metalness: 0.1 
      }),
      darkConcrete: new THREE.MeshStandardMaterial({ 
        map: roofTex, 
        color: '#1E293B', 
        roughness: 0.9, 
        metalness: 0.2 
      }),
      glass: new THREE.MeshStandardMaterial({ 
        color: '#00D1FF', 
        transparent: true, 
        opacity: 0.3, 
        roughness: 0, 
        metalness: 1 
      }),
      interiorLight: new THREE.MeshStandardMaterial({ 
        color: '#FCD34D', 
        emissive: '#FCD34D', 
        emissiveIntensity: isDark ? 2 : 0 
      }),
      wood: new THREE.MeshStandardMaterial({ 
        color: '#4B2C20', 
        roughness: 0.9 
      }),
      solarFrame: new THREE.MeshStandardMaterial({ 
        color: '#0A0F1A', 
        roughness: 0.3 
      })
    };
  }, [isDark]);

  return (
    <group>
      {/* Foundation / Multi-level concrete base */}
      <mesh position={[0, -0.2, 0]} material={materials.darkConcrete} receiveShadow>
        <boxGeometry args={[14, 0.4, 8]} />
      </mesh>

      {/* Main Ground Floor Volume */}
      <mesh position={[1, 1.5, 0]} material={materials.concrete} castShadow receiveShadow>
        <boxGeometry args={[8, 3, 6]} />
      </mesh>

      {/* Large Glass Cantilever / Living Area */}
      <group position={[-3, 1.5, 1]}>
        <mesh material={materials.glass}>
          <boxGeometry args={[4, 3, 4]} />
        </mesh>
        <mesh position={[0, -1.4, 0]} material={materials.concrete}>
          <boxGeometry args={[4.2, 0.2, 4.2]} />
        </mesh>
        <mesh position={[0, 1.4, 0]} material={materials.concrete}>
          <boxGeometry args={[4.2, 0.2, 4.2]} />
        </mesh>
      </group>

      {/* Upper Floor Bedroom Wing */}
      <mesh position={[2, 3.5, -1]} material={materials.concrete} castShadow>
        <boxGeometry args={[6, 2, 4]} />
      </mesh>

      {/* Decorative Wood Slat Wall (Vertical Detail) */}
      <group position={[5, 1.5, 2]}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[i * 0.15 - 0.5, 0, 1.05]} material={materials.wood}>
            <boxGeometry args={[0.05, 3, 0.1]} />
          </mesh>
        ))}
      </group>

      {/* Modern Pitch Roof Accent */}
      <group position={[2.5, 4.5, -1]}>
        <mesh rotation={[0, 0, 0.15]} material={materials.darkConcrete}>
          <boxGeometry args={[7, 0.2, 5]} />
        </mesh>
        {/* Solar Panels on Pitch */}
        <group position={[0, 0.2, 0]} rotation={[0, 0, 0.15]}>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[(i % 3 - 1) * 1.5, 0, (Math.floor(i / 3) - 0.5) * 2]} material={materials.solarFrame}>
              <boxGeometry args={[1.4, 0.05, 1.8]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Entrance Door Area */}
      <group position={[5.05, 1.0, 0]}>
        <mesh material={materials.wood}>
          <boxGeometry args={[0.1, 2.2, 1.2]} />
        </mesh>
        {isDark && <pointLight position={[0.2, 1, 0]} color="#FCD34D" intensity={2} distance={5} />}
      </group>

      {/* Windows with Interior Lighting */}
      <group>
        <Window3D position={[1, 1.5, 3.05]} width={4} height={1.5} materials={materials} />
        <Window3D position={[2, 3.5, 1.05]} width={3} height={1} materials={materials} />
      </group>
    </group>
  );
};

function Window3D({ position, width, height, materials }: any) {
  return (
    <group position={position}>
      <mesh material={materials.glass}>
        <boxGeometry args={[width, height, 0.1]} />
      </mesh>
      <mesh position={[0, 0, -0.05]} material={materials.interiorLight}>
        <boxGeometry args={[width - 0.1, height - 0.1, 0.02]} />
      </mesh>
    </group>
  );
}
