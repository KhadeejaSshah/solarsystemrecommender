import React from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function SolarPanelModel(props: any) {
  const { scene } = useGLTF('/models/solar_panel/scene.gltf');
  
  // Clone the scene so we can place multiple instances
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  React.useLayoutEffect(() => {
    clonedScene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        
        // Enhance material if needed
        const mesh = node as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.envMapIntensity = 2;
          mat.roughness = 0.1;
          mat.metalness = 0.8;
        }
      }
    });
  }, [clonedScene]);

  return <primitive object={clonedScene} {...props} />;
}

useGLTF.preload('/models/solar_panel/scene.gltf');
