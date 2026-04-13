import React, { useMemo } from 'react';
import * as THREE from 'three';

// Procedural texture utilities
function makeTex(size: number, fn: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) fn(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
}

export const useHouseMaterials = (isDark = false) => {
  return useMemo(() => {
    // Wall texture (stucco)
    const wallTex = makeTex(512, (ctx, s) => {
      ctx.fillStyle = '#9ba5ad';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 6000; i++) {
        const x = Math.random() * s, y = Math.random() * s, r = Math.random() * 2 + 0.5;
        const v = Math.floor(Math.random() * 30 - 15);
        ctx.fillStyle = `rgba(${128 + v},${133 + v},${140 + v},0.4)`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    });
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(3, 2);

    // Roof texture (flat concrete/felt)
    const roofTex = makeTex(512, (ctx, s) => {
      ctx.fillStyle = '#333b47';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * s, y = Math.random() * s;
        const v = Math.random() * 20 - 10;
        ctx.fillStyle = `rgba(${50 + v},${60 + v},${75 + v},0.3)`;
        ctx.fillRect(x, y, 2, 2);
      }
    });

    // Solar panel texture
    const solarTex = makeTex(512, (ctx, s) => {
      ctx.fillStyle = '#0d2244';
      ctx.fillRect(0, 0, s, s);
      const cols = 6, rows = 4;
      const cw = s / cols, rh = s / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cw + 2, y = r * rh + 2, w = cw - 4, h = rh - 4;
          const grd = ctx.createLinearGradient(x, y, x + w, y + h);
          grd.addColorStop(0, '#152d52');
          grd.addColorStop(1, '#0a1a36');
          ctx.fillStyle = grd;
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = 'rgba(100,150,220,0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        }
      }
    });

    return {
      wall: new THREE.MeshStandardMaterial({ map: wallTex, color: 0xc8cfd8, roughness: 0.85 }),
      roof: new THREE.MeshStandardMaterial({ map: roofTex, color: 0x4a5566, roughness: 0.9 }),
      solar: new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.1, metalness: 0.4 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x88bbdd, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 }),
      glassWarm: new THREE.MeshStandardMaterial({ color: 0xffcc66, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.55, emissive: 0xffaa33, emissiveIntensity: isDark ? 2 : 0 }),
      trim: new THREE.MeshStandardMaterial({ color: 0x2a2e35, roughness: 0.5, metalness: 0.4 }),
      battery: new THREE.MeshStandardMaterial({ color: 0xe8eaed, roughness: 0.4, metalness: 0.3 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 0.9 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 }),
      trunk: new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 }),
      foliage: new THREE.MeshStandardMaterial({ color: 0x2d6e2d, roughness: 1.0 }),
      garageDoor: new THREE.MeshStandardMaterial({ color: 0xd0d4d8, roughness: 0.4, metalness: 0.2 }),
    };
  }, [isDark]);
};

export const HouseModel = ({ solarPanels = 10, isDark = false }: { solarPanels?: number, isDark?: boolean }) => {
  const M = useHouseMaterials(isDark);

  return (
    <group>
      {/* Foundation */}
      <mesh position={[0.5, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, 0.4, 7]} />
        <meshStandardMaterial color="#888888" roughness={0.9} />
      </mesh>

      {/* Main Body */}
      <mesh position={[1, 3.9, 0]} receiveShadow castShadow material={M.wall}>
        <boxGeometry args={[8, 7, 6]} />
      </mesh>

      {/* Garage Wing */}
      <mesh position={[-4, 2.9, 0]} receiveShadow castShadow material={M.wall}>
        <boxGeometry args={[4.5, 5, 5.5]} />
      </mesh>

      {/* Trim / Base */}
      <mesh position={[-0.25, 0.57, 0]} material={M.trim}>
        <boxGeometry args={[13.5, 0.35, 6.6]} />
      </mesh>

      {/* Corner Trim Strips */}
      {[-8.3, 5.1].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 3.9, 3.05]} material={M.trim}>
            <boxGeometry args={[0.18, 7.5, 0.18]} />
          </mesh>
          <mesh position={[x, 3.9, -3.05]} material={M.trim}>
            <boxGeometry args={[0.18, 7.5, 0.18]} />
          </mesh>
        </group>
      ))}

      {/* Windows */}
      <group>
        {[-1.8, 0.8, 3.2].map((x, i) => (
          <DetailedWindow key={`fg-${i}`} position={[x, 2.1, 3.08]} materials={M} />
        ))}
        {[-1.8, 0.8, 3.2].map((x, i) => (
          <DetailedWindow key={`f2-${i}`} position={[x, 5.5, 3.08]} materials={M} />
        ))}
        {[-1.8, 1.8].map((y, i) => (
          <DetailedWindow 
            key={`s-${i}`} 
            position={[5.1, y + 3.5, -1.5]} 
            rotation={[0, Math.PI / 2, 0]} 
            args={[1.4, 1.1]} 
            materials={M} 
          />
        ))}
        <DetailedWindow position={[-4, 3.8, 2.82]} args={[1.0, 0.8]} materials={M} />
      </group>

      {/* Garage Door */}
      <group position={[-4, 1.4, 2.84]}>
        <mesh material={M.garageDoor} castShadow>
          <boxGeometry args={[2.9, 2.6, 0.08]} />
        </mesh>
        {[0, 1, 2].map(i => (
          <mesh key={i} position={[0, -0.7 + i * 0.7, 0.05]} material={M.trim}>
            <boxGeometry args={[2.6, 0.04, 0.1]} />
          </mesh>
        ))}
        <mesh position={[0, -0.95, 0.1]} material={M.trim}>
          <boxGeometry args={[0.5, 0.04, 0.06]} />
        </mesh>
      </group>

      {/* FLAT MODERN ROOFS (Removed V structure) */}
      <FlatRoof position={[1, 7.4, 0]} args={[8.2, 0.4, 6.2]} material={M.roof} trimMaterial={M.trim} />
      <FlatRoof position={[-4, 5.4, 0]} args={[4.7, 0.4, 5.7]} material={M.roof} trimMaterial={M.trim} />

      {/* Architectural Details */}
      <mesh position={[3.5, 8.5, 1]} castShadow>
        <boxGeometry args={[0.7, 2, 0.7]} />
        <meshStandardMaterial color="#884444" roughness={0.9} />
      </mesh>
      <mesh position={[5.1, 4, 4.6]} material={M.concrete}>
        <cylinderGeometry args={[0.05, 0.05, 7.5, 8]} />
      </mesh>
      <mesh position={[-0.5, 3.05, 3.7]} material={M.trim}>
        <boxGeometry args={[2.4, 0.12, 1.2]} />
      </mesh>

      {/* Solar Panel Array on Flat Roof */}
      <SolarPanelArray position={[1, 7.8, 0.4]} panels={solarPanels} material={M.solar} frameMaterial={M.trim} />

      {/* Battery & Inverter */}
      <group position={[0.6, 1.05, 3.13]}>
        <mesh material={M.battery} castShadow>
          <boxGeometry args={[0.65, 2.0, 0.32]} />
        </mesh>
        <mesh position={[0, 1.04, 0]} material={M.trim}>
          <boxGeometry args={[0.75, 0.08, 0.42]} />
        </mesh>
        <mesh position={[0, -1.04, 0]} material={M.trim}>
          <boxGeometry args={[0.75, 0.08, 0.42]} />
        </mesh>
        <mesh position={[0, 0.4, 0.2]}>
          <boxGeometry args={[0.45, 0.55, 0.06]} />
          <meshStandardMaterial color="#001133" emissive="#0044aa" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0.2]}>
          <boxGeometry args={[0.45, 0.06, 0.06]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* Environment */}
      <mesh position={[-4.5, 0.02, 2.5]} material={M.concrete} receiveShadow>
        <boxGeometry args={[6, 0.05, 11]} />
      </mesh>
      <mesh position={[2.5, 0.02, -2]} material={M.concrete} receiveShadow>
        <boxGeometry args={[9, 0.05, 7]} />
      </mesh>
      <FenceSection start={[-9, 5.5]} end={[7, 5.5]} material={M.wood} />
      <FenceSection start={[7, 5.5]} end={[7, -6]} material={M.wood} />
      <Tree position={[-9, 0, -4]} materials={M} />
      <Tree position={[8, 0, -5]} scale={1.2} materials={M} />
    </group>
  );
};

const FlatRoof = ({ position, args, material, trimMaterial }: any) => {
  const [w, h, d] = args;
  return (
    <group position={position}>
      {/* Roof Surface */}
      <mesh material={material} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {/* Parapet Edge */}
      <mesh position={[0, h/2 + 0.1, 0]} material={trimMaterial}>
        <boxGeometry args={[w + 0.1, 0.2, d + 0.1]} />
      </mesh>
      {/* Top Cap */}
      <mesh position={[0, h/2 + 0.2, 0]} material={trimMaterial}>
        <boxGeometry args={[w + 0.2, 0.05, d + 0.2]} />
      </mesh>
    </group>
  );
};

const DetailedWindow = ({ position, rotation = [0, 0, 0], args = [1.8, 1.3], materials }: any) => {
  const [w, h] = args;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={materials.trim}>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.12]} />
      </mesh>
      <mesh material={materials.glass}>
        <boxGeometry args={[w, h, 0.06]} />
      </mesh>
      <mesh material={materials.trim}>
        <boxGeometry args={[w, 0.06, 0.14]} />
      </mesh>
      <mesh material={materials.trim}>
        <boxGeometry args={[0.06, h, 0.14]} />
      </mesh>
      <mesh position={[0, 0, -0.04]} material={materials.glassWarm}>
        <boxGeometry args={[w - 0.1, h - 0.1, 0.03]} />
      </mesh>
    </group>
  );
};

const SolarPanelArray = ({ position, panels, material, frameMaterial }: any) => {
  const panelWidth = 1.05;
  const panelHeight = 0.78;
  const gap = 0.05;

  return (
    <group position={position} rotation={[-0.15, 0, 0]}> {/* Slight tilt on flat roof */}
      {[...Array(Math.min(24, panels))].map((_, i) => (
        <group key={i} position={[(i % 6 - 2.5) * (panelWidth + gap), Math.floor(i / 4) * (panelHeight + gap), 0]}>
          <mesh material={material} castShadow>
            <boxGeometry args={[panelWidth, 0.04, panelHeight]} />
          </mesh>
          <mesh material={frameMaterial}>
            <boxGeometry args={[panelWidth + 0.04, 0.06, panelHeight + 0.04]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const FenceSection = ({ start, end, material }: any) => {
  const [x1, z1] = start;
  const [x2, z2] = end;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  const posts = Math.floor(len / 1.5);

  return (
    <group position={[(x1 + x2) / 2, 0, (z1 + z2) / 2]} rotation={[0, angle, 0]}>
      <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
        <cylinderGeometry args={[0.03, 0.03, len, 6]} />
      </mesh>
      <mesh position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
        <cylinderGeometry args={[0.03, 0.03, len, 6]} />
      </mesh>
      {[...Array(posts + 1)].map((_, i) => (
        <mesh key={i} position={[0, 0.65, (i / posts - 0.5) * len]} material={material} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.3, 8]} />
        </mesh>
      ))}
    </group>
  );
};

const Tree = ({ position, scale = 1, materials }: any) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]} material={materials.trunk} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 2, 8]} />
      </mesh>
      <mesh position={[0, 2.5, 0]} material={materials.foliage} castShadow>
        <sphereGeometry args={[1.2, 10, 8]} />
      </mesh>
    </group>
  );
};
