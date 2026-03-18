import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';

const AnimatedSphere = ({ color, position, distort, speed, scale }) => {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.5;
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.1;
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={distort}
        speed={speed}
        roughness={0.2}
        metalness={0.8}
        clearcoat={1}
        clearcoatRoughness={0.1}
        wireframe={false}
      />
    </Sphere>
  );
};

const Background3D = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0f172a]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#4f46e5" />
        <pointLight position={[10, -10, 5]} intensity={1} color="#e11d48" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <AnimatedSphere 
          color="#4f46e5" 
          position={[-4, 2, -2]} 
          distort={0.4} 
          speed={2} 
          scale={2.5} 
        />
        <AnimatedSphere 
          color="#9333ea" 
          position={[5, -2, -4]} 
          distort={0.5} 
          speed={1.5} 
          scale={3} 
        />
        <AnimatedSphere 
          color="#e11d48" 
          position={[-6, -4, -6]} 
          distort={0.3} 
          speed={1} 
          scale={2} 
        />
        
        {/* Subtle fog for depth */}
        <fog attach="fog" args={['#0f172a', 10, 30]} />
      </Canvas>
    </div>
  );
};

export default Background3D;
