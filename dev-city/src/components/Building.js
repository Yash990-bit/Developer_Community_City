import { useRef, useState, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Language -> Building accent color mapping
const LANG_COLORS = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

// Achievement tiers
function getAchievementTier(score) {
  if (score >= 1000) return { label: "Legend", emoji: "👑", color: "#ffd700", intensity: 0.6 };
  if (score >= 500)  return { label: "Elite",  emoji: "💎", color: "#c026d3", intensity: 0.4 };
  if (score >= 200)  return { label: "Pro",    emoji: "⚡", color: "#00ffff", intensity: 0.3 };
  if (score >= 50)   return { label: "Rising", emoji: "🌱", color: "#22c55e", intensity: 0.2 };
  return { label: "Starter", emoji: "🔰", color: "#000000", intensity: 0 };
}

export default function Building({ 
  position, 
  width = 2, 
  height = 5, 
  depth = 2, 
  texture, 
  isNew, 
  stats: devStats,
  github_username,
  onClick
}) {
  const meshRef = useRef();
  const moonRef = useRef();
  const [scaleY, setScaleY] = useState(isNew ? 0.01 : 1);
  const [hovered, setHovered] = useState(false);

  const score = useMemo(() => {
    if (!devStats) return 0;
    return (devStats.commits || 0) + (devStats.stars || 0);
  }, [devStats]);

  const tier = useMemo(() => getAchievementTier(score), [score]);

  const langColor = useMemo(() => {
    if (devStats?.topLanguages?.length > 0) {
      return LANG_COLORS[devStats.topLanguages[0]] || "#888888";
    }
    return "#888888";
  }, [devStats]);

  const finalHeight = useMemo(() => {
    if (devStats) {
      return Math.min(Math.max(score / 10, 3), 35);
    }
    return height;
  }, [devStats, score, height]);

  const finalWidth = useMemo(() => {
    if (devStats) {
      const repos = devStats.repos || 0;
      return Math.min(Math.max(repos / 3, 1.5), 3.5);
    }
    return width;
  }, [devStats, width]);

  const tex = useLoader(THREE.TextureLoader, texture || "/textures/block-textures/white-clean.png");
  if (tex) {
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
  }

  useFrame((state, delta) => {
    if (isNew && scaleY < 1) {
      setScaleY((prev) => Math.min(prev + delta * 2, 1));
    }
    if (meshRef.current) {
      meshRef.current.scale.y = scaleY;
      meshRef.current.position.y = (finalHeight * scaleY) / 2;
    }
    // Animate the orbiting moon for Legend tier
    if (moonRef.current) {
      const t = state.clock.getElapsedTime();
      const radius = Math.max(finalWidth, depth) * 0.8 + 1;
      moonRef.current.position.x = Math.cos(t * 1.5) * radius;
      moonRef.current.position.z = Math.sin(t * 1.5) * radius;
      // Bob up and down slightly
      moonRef.current.position.y = finalHeight + 1 + Math.sin(t * 2) * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        name={`building-${github_username}`}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(meshRef, { github_username, stats: devStats });
        }}
      >
        <boxGeometry args={[finalWidth, finalHeight, depth]} />
        <meshStandardMaterial 
          map={tex}
          roughness={0.4}
          metalness={0.2}
          emissive={hovered ? "#4444ff" : tier.color}
          emissiveIntensity={hovered ? 0.5 : tier.intensity}
        />
        {hovered && (
          <Html distanceFactor={15}>
            <div className="bg-black/95 text-white p-3 rounded-sm border border-white/20 whitespace-nowrap pointer-events-none min-w-[140px]" 
                 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '6px', zIndex: 100 }}>
              <div className="flex items-center gap-2 mb-2">
                <span>{tier.emoji}</span>
                <span className="text-blue-400">{github_username || "Citizen"}</span>
              </div>
              
              <div className="mb-2 px-1.5 py-0.5 text-center text-[5px] border" 
                   style={{ borderColor: tier.color, color: tier.color }}>
                {tier.label} · {score} pts
              </div>

              {devStats ? (
                <div className="opacity-80 leading-[1.8] space-y-0.5">
                  <p>📦 {devStats.repos || 0} repos</p>
                  <p>🔨 {devStats.commits || 0} commits</p>
                  <p>⭐ {devStats.stars || 0} stars</p>
                  {devStats.topLanguages?.length > 0 && (
                    <p style={{ color: langColor }}>💻 {devStats.topLanguages[0]}</p>
                  )}
                </div>
              ) : (
                <p className="opacity-50 italic">Processing Data...</p>
              )}
            </div>
          </Html>
        )}
      </mesh>

      {/* Language Accent Strip at the base */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[finalWidth + 0.1, 0.3, depth + 0.1]} />
        <meshStandardMaterial 
          color={langColor} 
          emissive={langColor} 
          emissiveIntensity={0.5} 
        />
      </mesh>

      {/* Orbiting Moon for Top 1% (Legend Tier) */}
      {tier.label === "Legend" && (
        <mesh ref={moonRef}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={2} 
          />
          <pointLight color="#ffffff" intensity={1} distance={5} />
        </mesh>
      )}
    </group>
  );
}
