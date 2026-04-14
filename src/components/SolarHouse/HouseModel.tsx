import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SolarPanelModel } from './SolarPanelModel';

// Procedural texture utilities
function makeTex(size: number, fn: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) fn(ctx, size);
  const t = new THREE.CanvasTexture(c);
  // @ts-ignore
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 8;
  return t;
}

export const useHouseMaterials = (isDark = false) => {
  return useMemo(() => {
    // Wall texture (stucco with noise)
    const wallTex = makeTex(512, (ctx, s) => {
      ctx.fillStyle = '#9ba5ad';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 12000; i++) {
        const x = Math.random() * s, y = Math.random() * s, r = Math.random() * 1.5 + 0.5;
        const v = Math.floor(Math.random() * 40 - 20);
        ctx.fillStyle = `rgba(${128 + v},${133 + v},${140 + v},0.3)`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    });
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(4, 3);

    // Roof texture (weathered flat concrete)
    const roofTex = makeTex(1024, (ctx, s) => {
      ctx.fillStyle = '#2c3440';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * s, y = Math.random() * s;
        const v = Math.random() * 30 - 15;
        ctx.fillStyle = `rgba(${40 + v},${50 + v},${65 + v},0.4)`;
        ctx.fillRect(x, y, 2, 2);
      }
    });

    return {
      wall: new THREE.MeshStandardMaterial({ map: wallTex, color: 0xe0e4e8, roughness: 0.9, metalness: 0.05 }),
      roof: new THREE.MeshStandardMaterial({ map: roofTex, color: 0x5a6678, roughness: 0.85, metalness: 0.1 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x88bbdd, roughness: 0.02, metalness: 0.3, transparent: true, opacity: 0.45 }),
      glassWarm: new THREE.MeshStandardMaterial({ color: 0xffcc66, roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.6, emissive: 0xffaa33, emissiveIntensity: isDark ? 2.5 : 0 }),
      trim: new THREE.MeshStandardMaterial({ color: 0x1a1c21, roughness: 0.4, metalness: 0.5 }),
      battery: new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.2, metalness: 0.5 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8, metalness: 0.05 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x4a3116, roughness: 0.85, metalness: 0.05 }),
      trunk: new THREE.MeshStandardMaterial({ color: 0x3d2812, roughness: 0.9 }),
      foliage: new THREE.MeshStandardMaterial({ color: 0x1e4d1e, roughness: 1.0 }),
      garageDoor: new THREE.MeshStandardMaterial({ color: 0xd0d4d8, roughness: 0.3, metalness: 0.3 }),
      gutter: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.8 }),
      uplight: new THREE.MeshStandardMaterial({
        color: "#ffcc66",
        emissive: "#ffaa33",
        emissiveIntensity: isDark ? 10 : 0
      }),
    };
  }, [isDark]);
};

export const HouseModel = ({ solarPanels = 10, isDark = false }: { solarPanels?: number, isDark?: boolean }) => {
  const M = useHouseMaterials(isDark);
  const goldenLight = "#ffaa33";

  return (
    <group>
      {/* Foundation */}
      <mesh position={[-.05, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.4, 7.5]} />
        <meshStandardMaterial color="#666666" roughness={0.9} />
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
        <boxGeometry args={[13.5, 0.35, 7.1]} />
      </mesh>

      {/* Gutters & Downpipes */}
      <Gutter position={[1, 7.6, 3.05]} length={8.2} orientation="x" material={M.gutter} />
      <Gutter position={[1, 7.6, -3.05]} length={8.2} orientation="x" material={M.gutter} />
      <Gutter position={[-4, 5.6, 2.8]} length={4.75} orientation="x" material={M.gutter} />
      {/* Downpipes */}
      <mesh position={[5.05, 4.1, 3.05]} material={M.gutter}>
        <cylinderGeometry args={[0.08, 0.08, 7, 8]} />
      </mesh>
      <mesh position={[-6.2, 3.1, 2.8]} material={M.gutter}>
        <cylinderGeometry args={[0.08, 0.08, 5, 8]} />
      </mesh>

      {/* Front Door */}
      <FrontDoor position={[1.5, 2.05, 3.05]} materials={M} />

      {/* Façade Uplights (Warm Golden) */}
      {isDark && (
        <group position={[0, 0.5, 3.1]}>
          {[-1.5, 0.5, 4.5].map((x, i) => (
            <group key={i} position={[x, 0.1, 0]}>
              <mesh material={M.uplight}>
                <boxGeometry args={[0.2, 0.1, 0.1]} />
              </mesh>
              <pointLight intensity={3} distance={5} color={goldenLight} />
              <spotLight
                position={[0, 0.1, 0]}
                angle={0.4}
                penumbra={1}
                intensity={10}
                distance={6}
                color={goldenLight}
                target-position={[0, 5, 0]}
              />
            </group>
          ))}
        </group>
      )}

      {/* Windows */}
      <group>
        {[-1.2, 3.8].map((x, i) => (
          <DetailedWindow key={`fg-${i}`} position={[x, 2.4, 3.08]} materials={M} />
        ))}
        {[-1.8, 0.8, 3.2].map((x, i) => (
          <DetailedWindow key={`f2-${i}`} position={[x, 5.8, 3.08]} materials={M} />
        ))}
        {[-1.8, 1.8].map((y, i) => (
          <DetailedWindow
            key={`s-${i}`}
            position={[5.1, y + 3.5, -1.5]}
            rotation={[0, Math.PI / 2, 0]}
            args={[1.6, 1.2]}
            materials={M}
          />
        ))}
      </group>

      {/* Garage Door */}
      <GarageDoor position={[-4.5, 1.4, 2.84]} materials={M} />

      {/* Flat Roofs */}
      <FlatRoof position={[1, 7.4, 0]} args={[8.2, 0.4, 6.2]} material={M.roof} trimMaterial={M.trim} />
      <FlatRoof position={[-4, 5.4, 0]} args={[4.7, 0.4, 5.7]} material={M.roof} trimMaterial={M.trim} />

      {/* GLTF Solar Panels */}
      <GLTFSolarArray
        position={[1, 7.6, 0]}
        width={7.8}
        depth={5.8}
      />

      <GLTFSolarArray
        position={[-4, 5.6, 0]}
        width={4.2}
        depth={5.2}
      />

      {/* Battery & Inverter (Wall Mounted) */}
      <group position={[0.4, 1.2, 3.2]}>
        <mesh material={M.battery} castShadow>
          <boxGeometry args={[0.7, 1.8, 0.35]} />
        </mesh>
        <mesh position={[0, 0, 0.18]} material={M.trim}>
          <boxGeometry args={[0.5, 0.4, 0.05]} />
        </mesh>
        <mesh position={[0, -0.4, 0.18]} material={M.glass}>
          <boxGeometry args={[0.4, 0.05, 0.05]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.0} />
        </mesh>
      </group>
    </group>
  );
};

const GLTFSolarArray = ({ position, width, depth }: { position: [number, number, number], width: number, depth: number }) => {
  // Panel dimensions (based on a typical model scale)
  const pW = 2.5;
  const pD = 1.5;
  const gap = 0.1;
  const cols = Math.floor(width / (pW + gap));
  const rows = Math.floor(depth / (pD + gap));

  const startX = -(cols * (pW + gap) - gap) / 2;
  const startZ = -(rows * (pD + gap) - gap) / 2;

  const panels = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      panels.push(
        <SolarPanelModel
          key={`${r}-${c}`}
          position={[startX + c * (pW + gap) + 1, 0.1, startZ + r * (pD + gap)]}
          scale={0.015} // Adjust scale as needed
          rotation={[0, 0, 0]}
        />
      );
    }
  }

  return (
    <group position={position}>
      {panels}
    </group>
  );
};

const Gutter = ({ position, length, orientation, material }: any) => {
  return (
    <mesh position={position} rotation={orientation === 'x' ? [0, 0, Math.PI / 2] : [0, 0, 0]} material={material}>
      <boxGeometry args={[0.15, length, 0.2]} />
    </mesh>
  );
};

const FrontDoor = ({ position, materials }: any) => {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh material={materials.trim}>
        <boxGeometry args={[1.4, 2.8, 0.2]} />
      </mesh>
      {/* Door Leaf */}
      <mesh position={[0, 0, 0.05]} material={materials.wood}>
        <boxGeometry args={[1.2, 2.6, 0.1]} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.45, -0.1, 0.15]} material={materials.trim}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </mesh>
      {/* Decorative Panels (Modern Lines) */}
      {[0.4, 0, -0.4].map(y => (
        <mesh key={y} position={[0, y, 0.11]} material={materials.trim}>
          <boxGeometry args={[0.8, 0.03, 0.02]} />
        </mesh>
      ))}
    </group>
  );
};

const GarageDoor = ({ position, materials }: any) => {
  return (
    <group position={position}>
      <mesh material={materials.garageDoor} castShadow>
        <boxGeometry args={[3.2, 2.6, 0.1]} />
      </mesh>
      {/* Panel Grooves */}
      {[0.4, 0, -0.4, -0.8].map(y => (
        <mesh key={y} position={[0, y, 0.06]} material={materials.trim}>
          <boxGeometry args={[3.0, 0.02, 0.02]} />
        </mesh>
      ))}
      {/* Top Windows */}
      <group position={[0, 0.8, 0.06]}>
        {[-1.0, -0.35, 0.35, 1.0].map(x => (
          <mesh key={x} position={[x, 0, 0]} material={materials.glass}>
            <boxGeometry args={[0.5, 0.3, 0.02]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const FlatRoof = ({ position, args, material, trimMaterial }: any) => {
  const [w, h, d] = args;
  return (
    <group position={position}>
      <mesh material={material} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh position={[0, h / 2 + 0.1, 0]} material={trimMaterial}>
        <boxGeometry args={[w + 0.15, 0.25, d + 0.15]} />
      </mesh>
    </group>
  );
};

const DetailedWindow = ({ position, rotation = [0, 0, 0], args = [1.8, 1.3], materials }: any) => {
  const [w, h] = args;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={materials.trim}>
        <boxGeometry args={[w + 0.2, h + 0.2, 0.15]} />
      </mesh>
      <mesh material={materials.glass}>
        <boxGeometry args={[w, h, 0.08]} />
      </mesh>
      {/* Muntins (Grids) */}
      <mesh material={materials.trim}>
        <boxGeometry args={[w, 0.04, 0.1]} />
      </mesh>
      <mesh material={materials.trim}>
        <boxGeometry args={[0.04, h, 0.1]} />
      </mesh>
      <mesh position={[0, 0, -0.05]} material={materials.glassWarm}>
        <boxGeometry args={[w - 0.1, h - 0.1, 0.02]} />
      </mesh>
    </group>
  );
};
