import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const TrophyModel = ({ isVisible }) => {
  const { scene } = useGLTF('/african_cup_of_nations.glb');
  const meshRef = useRef();

  // Clone the GLTF scene to avoid issues with multiple instances
  const clonedScene = scene.clone();

  // Add rotation animation - trophy revolves around itself
  useFrame(() => {
    if (meshRef.current && isVisible) {
      // Smooth rotation around Y axis (revolving around itself)
      meshRef.current.rotation.y += 0.01;
    }
  });

  useEffect(() => {
    if (meshRef.current) {
      // Smaller size as requested
      meshRef.current.scale.set(3, 3, 3);
      meshRef.current.position.set(0, 0, 0); // Centered at origin
      
      // Add golden material effect
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0xFFD700), // Gold color
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [clonedScene]);

  return (
    <primitive 
      ref={meshRef} 
      object={clonedScene} 
      visible={isVisible}
    />
  );
};

const Trophy3D = ({ isVisible = true, height = "300px" }) => {
  return (
    <div style={{ 
      height, 
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Canvas
        camera={{ 
          position: [0, 2, 6], 
          fov: 50,
          aspect: 1
        }}
        style={{ 
          background: 'transparent',
          width: '100%',
          height: '100%'
        }}
        shadows
      >
        {/* Ambient light */}
        <ambientLight intensity={0.5} />
        
        {/* Main directional light */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.0} 
          castShadow
        />
        
        {/* Additional point lights for better illumination */}
        <pointLight position={[-5, 0, -10]} intensity={0.5} />
        <pointLight position={[0, -5, 0]} intensity={0.3} />
        
        {/* The Trophy Model - CENTERED AND ROTATING */}
        <TrophyModel isVisible={isVisible} />
        
        {/* Camera controls - disabled to keep trophy centered */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={false}
        />
        
        {/* Environment for reflections */}
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

// Preload the GLB model for better performance
useGLTF.preload('/african_cup_of_nations.glb');

export default Trophy3D;
