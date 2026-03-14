import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export default function Planet({ 
  planetConfig, 
  developerCount, 
  onClick,
  isNight 
}) {
  const orbitRef = useRef();
  const planetRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { id, label, emoji, color, orbitRadius, size, speed } = planetConfig;

  // Slowly orbit the sun
  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = state.clock.getElapsedTime() * speed;
    }
    // Slow self-rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Orbit Ring (visual guide) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.08, orbitRadius + 0.08, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Orbiting group (planet) */}
      <group ref={orbitRef}>
        <group position={[orbitRadius, 0, 0]}>
          
          {/* The Planet Sphere */}
          <mesh 
            ref={planetRef} 
            castShadow
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick(planetConfig);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(false);
              document.body.style.cursor = 'auto';
            }}
          >
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={hovered ? (isNight ? 0.6 : 0.4) : (isNight ? 0.3 : 0.1)}
              roughness={0.6}
              metalness={0.3}
            />
          </mesh>

          {/* Planet glow */}
          <pointLight 
            position={[0, 0, 0]}
            color={color}
            intensity={hovered ? 2.5 : 1.5}
            distance={size * 6}
            decay={2}
          />

          {/* Planet Label */}
          <Html position={[0, size + 2, 0]} center distanceFactor={40}>
            <div className={`pointer-events-none whitespace-nowrap text-center transition-transform duration-300 ${hovered ? 'scale-125' : 'scale-100'}`}
                 style={{ fontFamily: "'Press Start 2P', cursive" }}>
              <div className="text-[10px] mb-0.5">{emoji}</div>
              <div className="text-[7px] uppercase tracking-wider font-bold"
                   style={{ color: color, textShadow: '0 0 10px ' + color }}>
                {label}
              </div>
              <div className="text-[6px] text-white/50 mt-0.5">
                {developerCount} dev{developerCount !== 1 ? 's' : ''}
              </div>
              {hovered && (
                <div className="text-[4px] text-white mt-1 animate-pulse uppercase tracking-[0.2em]">
                  Click to Enter
                </div>
              )}
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}
