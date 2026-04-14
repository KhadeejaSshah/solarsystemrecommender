import React, { useLayoutEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface EVCarProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isDark?: boolean;
}

export const EVCar = ({ position = [0, 0, 0], rotation = [0, 0, 0], isDark = false }: EVCarProps) => {
  // Load the Tesla model
  const { scene } = useGLTF('/models/tesla/scene.gltf');

  // Configure materials and shadows
  useLayoutEffect(() => {
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        // Enhance lighting materials if dark
        const mesh = node as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;

          // Try to identify headlights/taillights by name or transparency
          const name = node.name.toLowerCase();
          if (name.includes('light') || name.includes('glass') || name.includes('emissive')) {
            if (isDark) {
              if (name.includes('head') || name.includes('front')) {
                mat.emissive = new THREE.Color('#ffffff');
                mat.emissiveIntensity = 5;
              } else if (name.includes('rear') || name.includes('tail') || name.includes('red')) {
                mat.emissive = new THREE.Color('#ff0000');
                mat.emissiveIntensity = 2;
              }
            } else {
              mat.emissiveIntensity = 0;
            }
          }
        }
      }
    });
  }, [scene, isDark]);

  return (
    <group position={position} rotation={rotation}>
      {/* 
        The model might need scaling and a base rotation. 
        Tesla Model 3 is ~4.7m long. The scene house is ~12m wide.
        Scale 0.01 or similar might be needed if it was exported in cm, 
        but often GLTF is in meters. Let's try 1.0 as a starting point.
      */}
      <primitive
        object={scene}
        scale={0.01}
        rotation={[0, +1.5 * Math.PI, 0]} // Rotate to face forward if needed
      />
    </group>
  );
};

// Preload the model
useGLTF.preload('/models/tesla/scene.gltf');
