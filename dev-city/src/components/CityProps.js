import { TILE_SIZE } from "../lib/cityGrid";
import { Html } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function Road({ position, isHorizontal }) {
  return (
    <group position={position}>
      {/* Asphalt Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      
      {/* Neon Center Line */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, isHorizontal ? Math.PI / 2 : 0]}>
        <planeGeometry args={[0.2, TILE_SIZE]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </group>
  );
}

export function Tree({ position }) {
  // A tiered pine-tree voxel look
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.9} />
      </mesh>
      
      {/* Bottom Tier Leaves */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[1.5, 0.8, 1.5]} />
        <meshStandardMaterial color="#0f380f" />
      </mesh>
      {/* Middle Tier Leaves */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <boxGeometry args={[1.1, 0.8, 1.1]} />
        <meshStandardMaterial color="#1a521a" />
      </mesh>
      {/* Top Tier Leaves */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <boxGeometry args={[0.7, 0.8, 0.7]} />
        <meshStandardMaterial color="#226e22" />
      </mesh>

      {/* Cyber Glow Accent (Wireframe over middle tier) */}
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[1.2, 0.9, 1.2]} />
        <meshStandardMaterial 
          color="#00ff66"
          emissive="#00ff66"
          emissiveIntensity={0.3}
          wireframe={true}
        />
      </mesh>
    </group>
  );
}

export function StreetLight({ position }) {
  // A sleek, modern overhead street lamp
  return (
    <group position={position}>
      {/* Main Base/Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 5]} />
        <meshStandardMaterial color="#222222" metalness={0.8} />
      </mesh>
      
      {/* Arm extending over the road */}
      <mesh position={[0.6, 4.9, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.06, 1.2]} />
        <meshStandardMaterial color="#222222" metalness={0.8} />
      </mesh>

      {/* Light Fixture Cover */}
      <mesh position={[1.1, 4.9, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.3]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* The actual Glowing Bulb */}
      <mesh position={[1.1, 4.85, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.2]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} />
      </mesh>

      {/* Dynamic Lighting cast onto the road */}
      <pointLight 
        position={[1.1, 4.5, 0]} 
        color="#ff00ff" 
        intensity={2.5} 
        distance={15} 
        decay={2}
        castShadow
      />
    </group>
  );
}

// Moves back and forth along a given axis
export function Car({ position, isHorizontal, speed = 0.5, distance = 25, color = "#ff0055" }) {
  const meshRef = useRef();
  
  // Quick pseudo-random offset so cars don't all move in sync
  const startOffset = position[0] + position[2]; 

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Use Math.cos for smooth back-and-forth movement at a slower rate
      const movement = Math.cos(time * speed + startOffset) * distance;
      
      // Determine direction of travel for rotation (are we moving forward or backward right now?)
      const isMovingForward = Math.sin(time * speed + startOffset) < 0;
      
      if (isHorizontal) {
        meshRef.current.position.x = position[0] + movement;
        meshRef.current.position.z = position[2];
        // Face movement direction
        meshRef.current.rotation.y = isMovingForward ? Math.PI / 2 : -Math.PI / 2;
      } else {
        meshRef.current.position.x = position[0];
        meshRef.current.position.z = position[2] + movement;
        // Face movement direction
        meshRef.current.rotation.y = isMovingForward ? 0 : Math.PI;
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Car Base/Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 1.6]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Car Cabin (Top part) */}
      <mesh position={[0, 0.5, -0.1]} castShadow>
        <boxGeometry args={[0.7, 0.25, 0.8]} />
        <meshStandardMaterial color="#000000" metalness={1} roughness={0} />
      </mesh>
      
      {/* Neon Underglow / Trim */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.85, 0.05, 1.65]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>

      {/* Tail Lights */}
      <mesh position={[0.2, 0.3, -0.81]}>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.2, 0.3, -0.81]}>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>

      {/* Headlights */}
      <mesh position={[0.2, 0.3, 0.81]}>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.2, 0.3, 0.81]}>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// Small floating box that bobs and moves slowly
export function Pedestrian({ position, bounds = 4, speed = 0.5 }) {
  const meshRef = useRef();
  const startOffset = position[0] * position[2];

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Move in a small circle/figure-eight within the Bounds
      meshRef.current.position.x = position[0] + Math.sin(time * speed + startOffset) * bounds;
      meshRef.current.position.z = position[2] + Math.cos(time * speed * 0.8 + startOffset) * bounds;
      
      // Bob up and down (walking animation)
      meshRef.current.position.y = position[1] + Math.abs(Math.sin(time * 8)) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.3, 0.6, 0.3]} />
      <meshStandardMaterial color="#ffffff" emissive="#4444ff" emissiveIntensity={0.5} />
    </mesh>
  );
}
