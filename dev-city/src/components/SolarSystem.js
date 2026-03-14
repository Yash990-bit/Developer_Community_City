import { useMemo } from "react";
import { Float } from "@react-three/drei";
import Planet from "./Planet";
import { PLANETS, groupByPlanet } from "../lib/domainClassifier";

export default function SolarSystem({ developers, onPlanetSelect, isNight }) {
  // Group developers by their planet/domain to get counts
  const grouped = useMemo(() => groupByPlanet(developers), [developers]);

  return (
    <group>
      {/* ☀️ THE SUN — Central glowing sphere */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh>
          <sphereGeometry args={[12, 64, 64]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#ff8800"
            emissiveIntensity={3}
            roughness={0.1}
          />
        </mesh>
        
        {/* Inner glow layer */}
        <mesh>
          <sphereGeometry args={[12.5, 64, 64]} />
          <meshBasicMaterial 
            color="#ffcc00" 
            transparent 
            opacity={0.2}
          />
        </mesh>
      </Float>
      
      {/* Sun light that illuminates planets */}
      <pointLight 
        position={[0, 0, 0]} 
        color="#ffd700" 
        intensity={5} 
        distance={300}
        decay={1}
      />

      {/* 🪐 ALL PLANETS */}
      {PLANETS.map((planetConfig) => (
        <Planet
          key={planetConfig.id}
          planetConfig={planetConfig}
          developerCount={(grouped[planetConfig.id] || []).length}
          onClick={onPlanetSelect}
          isNight={isNight}
        />
      ))}
    </group>
  );
}
