import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

// Enhanced procedural textures (unchanged)
function createDetailedTexture(
  size: number,
  baseColor: string,
  noiseDensity: number,
  roughness: number = 0.8,
  isGlossyRock = false,
  isMoss = false
) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < noiseDensity; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = Math.random() * 30 - 15;
    ctx.fillStyle = `rgba(${100 + v},${100 + v},${100 + v},0.25)`;
    ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }

  if (isGlossyRock) {
    ctx.strokeStyle = 'rgba(30, 30, 50, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * size, Math.random() * size);
      ctx.quadraticCurveTo(
        Math.random() * size,
        Math.random() * size,
        Math.random() * size,
        Math.random() * size
      );
      ctx.stroke();
    }
  }

  if (isMoss) {
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillStyle = `rgba(34, 139, 34, ${Math.random() * 0.6 + 0.4})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export const ModernHouseModel = ({ 
  solarPanels = 12, 
  isDark = false 
}: { 
  solarPanels?: number; 
  isDark?: boolean; 
}) => {
  const { scene } = useThree();

  // Dynamic Sky Background
  useEffect(() => {
    if (isDark) {
      scene.background = new THREE.Color('#0A0F1F');     // Night sky
    } else {
      scene.background = new THREE.Color('#F8FAFC');     // ← Changed to clean white daytime sky
    }

    return () => {
      scene.background = null;
    };
  }, [scene, isDark]);

  const materials = useMemo(() => {
    const wallTex = createDetailedTexture(1024, '#E2E8F0', 28000);
    const roofTex = createDetailedTexture(1024, '#1E293B', 32000);
    const rockBaseTex = createDetailedTexture(1024, '#111827', 35000, 0.4, true);
    const mossTex = createDetailedTexture(512, '#166534', 12000, 0.9, false, true);

    return {
      rockBase: new THREE.MeshStandardMaterial({ 
        map: rockBaseTex, color: '#1F2937', roughness: 0.35, metalness: 0.15, envMapIntensity: 1.3 
      }),
      concrete: new THREE.MeshStandardMaterial({ 
        map: wallTex, 
        color: isDark ? '#475569' : '#F1F5F9', 
        roughness: 0.75, metalness: 0.1 
      }),
      darkRoof: new THREE.MeshStandardMaterial({ 
        map: roofTex, color: '#111827', roughness: 0.9, metalness: 0.25 
      }),
      mossRoofAccent: new THREE.MeshStandardMaterial({ 
        map: mossTex, color: '#166534', roughness: 0.95, metalness: 0 
      }),
      glass: new THREE.MeshPhysicalMaterial({ 
        color: '#67E8F9', transparent: true, opacity: 0.28, roughness: 0, 
        metalness: 0.85, transmission: 0.9, ior: 1.5, thickness: 0.4, envMapIntensity: 1.8 
      }),
      solarPanel: new THREE.MeshStandardMaterial({ 
        color: '#0F172A', roughness: 0.15, metalness: 0.95, envMapIntensity: 2.2 
      }),
      interiorLight: new THREE.MeshStandardMaterial({ 
        color: '#FDE047', emissive: '#FDE047', emissiveIntensity: isDark ? 3.5 : 0 
      }),
      wood: new THREE.MeshStandardMaterial({ color: '#3F2A1F', roughness: 0.85 }),
      garageFloor: new THREE.MeshStandardMaterial({ 
        color: '#E2E8F0', roughness: 0.9, metalness: 0.1 
      }),
      fence: new THREE.MeshStandardMaterial({ 
        color: '#334155', roughness: 0.7, metalness: 0.2 
      }),
      neonAccent: new THREE.MeshStandardMaterial({ 
        color: '#22D3EE', emissive: '#22D3EE', emissiveIntensity: isDark ? 4 : 0 
      })
    };
  }, [isDark]);

  return (
    <group>
      {/* === FOUNDATION / ROCK-LIKE BASE === */}
      <mesh position={[0, -0.35, 0]} material={materials.rockBase} castShadow receiveShadow>
        <boxGeometry args={[16.5, 0.8, 9]} />
      </mesh>

      {/* === MAIN GROUND FLOOR === */}
      <mesh position={[0.8, 1.6, 0]} material={materials.concrete} castShadow receiveShadow>
        <boxGeometry args={[9, 3.4, 6.8]} />
      </mesh>

      {/* === LARGE GLASS CANTILEVER - transparent for tesla === */}
      <group position={[-3.8, 1.6, 1.2]}>
        <mesh material={materials.glass} castShadow>
          <boxGeometry args={[6.2, 3.2, 6.5]} />
        </mesh>
        <mesh position={[0, -1.75, 0]} material={materials.concrete}>
          <boxGeometry args={[6.5, 0.25, 5.1]} />
        </mesh>
        <mesh position={[0, 1.75, 0]} material={materials.concrete}>
          <boxGeometry args={[8.5, 0.25, 5.1]} />
        </mesh>
        
        <mesh position={[2, -1.2, -1.8]} material={materials.concrete}>
          <cylinderGeometry args={[0.18, 0.18, 2.8, 8]} />
        </mesh>
      </group>

      {/* === UPPER FLOOR === */}
      <mesh position={[2.2, 3.8, -0.8]} material={materials.concrete} castShadow>
        <boxGeometry args={[7.2, 2.4, 4.8]} />
      </mesh>

      {/* === MOSS ROOF ACCENT === */}
      <mesh position={[2.2, 4.9, -0.8]} material={materials.mossRoofAccent} castShadow receiveShadow>
        <boxGeometry args={[7.4, 0.25, 4.9]} />
      </mesh>

      {/* === PITCH ROOF + SOLAR PANELS === */}
      <group position={[2.5, 5.1, -0.8]}>
        <mesh rotation={[0, 0, 0.18]} material={materials.darkRoof}>
          <boxGeometry args={[8, 0.25, 5.8]} />
        </mesh>

        <group position={[0, 0.3, 0]} rotation={[0, 0, 0.18]}>
          {[...Array(Math.min(solarPanels, 12))].map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            return (
              <mesh 
                key={i} 
                position={[col * 1.65 - 2.5, 0, row * 2.1 - 1.5]} 
                material={materials.solarPanel}
                castShadow
              >
                <boxGeometry args={[1.55, 0.08, 2]} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* === WOOD SLAT WALL === */}
      <group position={[5.8, 1.6, 2.2]}>
        {[...Array(14)].map((_, i) => (
          <mesh 
            key={i} 
            position={[i * 0.12 - 0.8, 0, 1.1]} 
            material={materials.wood}
          >
            <boxGeometry args={[0.06, 3.4 + Math.random() * 0.6 - 0.3, 0.12]} />
          </mesh>
        ))}
      </group>

      {/* === ENTRANCE + STAIRS === */}
      <group position={[5.3, 1.1, -0.2]}>
        <mesh position={[0, 0, 0]} material={materials.wood}>
          <boxGeometry args={[0.12, 2.6, 1.4]} />
        </mesh>
        <mesh position={[-0.05, 0, 0.05]} material={materials.wood}>
          <boxGeometry args={[0.05, 2.4, 1.2]} />
        </mesh>
        <mesh position={[0.4, 0.3, 0.7]} material={materials.solarPanel}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 16]} />
        </mesh>

        {[...Array(4)].map((_, i) => (
          <mesh 
            key={i} 
            position={[0.8, -0.8 + i * 0.45, -1.2 - i * 0.4]} 
            material={materials.concrete}
          >
            <boxGeometry args={[2.2, 0.22, 1.1]} />
          </mesh>
        ))}
      </group>

      {/* === WINDOWS (Front + Back) === */}
      <group>
        <Window3D position={[0.8, 1.6, 3.4]} width={5} height={2} materials={materials} />
        <Window3D position={[2.2, 3.8, 1.4]} width={3.8} height={1.4} materials={materials} />
        <Window3D position={[-3, 1.6, -2.8]} width={2.2} height={2.8} materials={materials} />
        <Window3D position={[0.8, 1.6, -3.5]} width={4.2} height={1.9} materials={materials} />
        <Window3D position={[2.5, 3.8, -3.2]} width={3.2} height={1.3} materials={materials} />
      </group>

      {/* === BALCONY RAILING === */}
      <group position={[5.5, 3.4, -1.2]}>
        <mesh position={[0, -0.1, 0]} material={materials.concrete}>
          <boxGeometry args={[3, 0.2, 1.8]} />
        </mesh>
        {[...Array(9)].map((_, i) => (
          <mesh 
            key={i} 
            position={[i * 0.35 - 1.2, 0.6, 0]} 
            material={materials.neonAccent}
          >
            <boxGeometry args={[0.04, 1.4, 0.04]} />
          </mesh>
        ))}
        <mesh position={[0, 1.3, 0]} material={materials.neonAccent}>
          <boxGeometry args={[3.2, 0.06, 0.06]} />
        </mesh>
      </group>

      {/* ====================== NEW: OPEN GARAGE / CARPORT ====================== */}
      {/* Garage Floor */}
      {/* <mesh position={[7.5, -0.1, 0]} material={materials.garageFloor} receiveShadow>
        <boxGeometry args={[5, 0.2, 6]} />
      </mesh> */}

      {/* Garage Back Wall (partial) */}
      {/* <mesh position={[9.8, 1.2, 0]} material={materials.concrete}>
        <boxGeometry args={[0.3, 3, 5.5]} />
      </mesh> */}

      {/* Garage Roof / Canopy */}
      <mesh position={[5.5, 2.8, 0]} material={materials.darkRoof}>
        <boxGeometry args={[5.2, 0.25, 6.2]} />
      </mesh>

      {/* Support Pillars for Garage Roof */}
      <mesh position={[4.3, 1.4, -2]} material={materials.concrete}>
        <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
      </mesh>
      <mesh position={[5.3, 1.4, 2]} material={materials.concrete}>
        <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
      </mesh>

      {/* Side Fence / Boundary Wall blue one */}
      {/* <mesh position={[11.5, 0.8, 0]} material={materials.fence}>
        <boxGeometry args={[0.2, 2, 6]} />
      </mesh> */}

      {/* Front Low Fence (to define parking area) blue one*/}
      <mesh position={[6.5, 0.6, -3.2]} material={materials.fence}>
        <boxGeometry args={[5, 1.2, 0.15]} />
      </mesh>

      {/* Simple Car Placeholder (you can replace this with a real car model) */}
     

      {/* === VEGETATION ===  removed for tesla*/}
      <group position={[-6, 0.2, 2]}>
        {/* <mesh material={materials.mossRoofAccent}>
          <sphereGeometry args={[1.2, 6, 6]} />
        </mesh> */}
      </group>
      <group position={[7, 0.2, -3]}>
        <mesh material={materials.mossRoofAccent}>
          <sphereGeometry args={[0.9, 6, 6]} />
        </mesh>
      </group>

      {/* === FLOWER ON ROOF === */}
      <group position={[3.8, 5.8, -2]}>
        <mesh position={[0, 0.6, 0]} material={new THREE.MeshStandardMaterial({ color: '#166534' })}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        </mesh>
        <mesh position={[0, 1.2, 0]} material={new THREE.MeshStandardMaterial({ color: '#F97316', emissive: '#F97316', emissiveIntensity: 0.8 })}>
          <sphereGeometry args={[0.25, 8, 8]} />
        </mesh>
      </group>

      {/* === LIGHTING === */}
      {!isDark && (
        <directionalLight
          position={[12, 18, -10]}
          intensity={1.9}
          color="#FFF7ED"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
      )}

      <ambientLight intensity={isDark ? 0.18 : 0.75} color="#E0F2FE" />

      {isDark && (
        <>
          <pointLight position={[1, 1.8, 3.5]} color="#FDE047" intensity={3} distance={8} />
          <pointLight position={[5.5, 3.8, -1]} color="#22D3EE" intensity={4} distance={6} />
        </>
      )}
    </group>
  );
};

function Window3D({ 
  position, 
  width, 
  height, 
  materials 
}: { 
  position: [number, number, number]; 
  width: number; 
  height: number; 
  materials: any; 
}) {
  return (
    <group position={position}>
      <mesh material={materials.glass}>
        <boxGeometry args={[width, height, 0.12]} />
      </mesh>
      <mesh position={[0, 0, -0.08]} material={materials.interiorLight}>
        <boxGeometry args={[width - 0.2, height - 0.2, 0.03]} />
      </mesh>
      <mesh position={[0, 0, 0.02]} material={materials.neonAccent}>
        <boxGeometry args={[width + 0.15, height + 0.15, 0.03]} />
      </mesh>
    </group>
  );
}