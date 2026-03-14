import { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import SolarSystem from "../components/SolarSystem";
import District from "../components/District";
import { classifyDeveloper } from "../lib/domainClassifier";
import CameraControls from "../components/CameraControls";
import Building from "../components/Building";
import LoginButton from "../components/LoginButton";
import TopStats from "../components/TopStats";
import EventTicker from "../components/EventTicker";
import UIControls from "../components/UIControls";
import DevProfile from "../components/DevProfile";
import Leaderboard from "../components/Leaderboard";
import SearchBar from "../components/SearchBar";
import Guestbook from "../components/Guestbook";
import CustomCursor from "../components/CustomCursor";
import { aiDevs, webDevs, mobileDevs } from "../data/developers";
import { Stars, Environment, ContactShadows, Float, MeshDistortMaterial } from "@react-three/drei";
import { useSession } from "next-auth/react";
import * as THREE from "three";
import { getGitHubStats } from "../lib/github";
import { supabase } from "../lib/supabase";

export default function Home() {
  const { data: session } = useSession();
  // Start with mock data; will be replaced by Supabase data if available
  const mockData = [...aiDevs, ...webDevs, ...mobileDevs];
  const [inhabitants, setInhabitants] = useState(mockData);
  const [theme, setTheme] = useState("night");
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [activeDeveloperId, setActiveDeveloperId] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [activePlanet, setActivePlanet] = useState(null);

  const isNight = theme === "night";

  const filteredInhabitants = useMemo(() => {
    if (!activePlanet) return inhabitants;
    return inhabitants.filter(dev => classifyDeveloper(dev) === activePlanet.id);
  }, [inhabitants, activePlanet]);

  const handlePlanetSelect = (planetConfig) => {
    setActivePlanet(planetConfig);
    setActiveBuilding(null);
    setActiveDeveloperId(null);
    setSelectedDeveloper(null);
  };

  const handleBackToOrbit = () => {
    setActivePlanet(null);
    setActiveBuilding(null);
    setActiveDeveloperId(null);
    setSelectedDeveloper(null);
  };

  const handleSearchSelect = (username) => {
    const dev = inhabitants.find(d => d.github_username === username);
    if (!dev) return;

    // Open their profile immediately
    setSelectedDeveloper(dev);
    
    // Switch to their planet
    const planetId = classifyDeveloper(dev);
    const planetConfig = require("../lib/domainClassifier").PLANETS.find(p => p.id === planetId);
    if (planetConfig) {
      setActivePlanet(planetConfig);
    }
    
    // Tell the camera to find their building and zoom
    setActiveBuilding(null);
    setActiveDeveloperId(username);
  };

  // 1. Initial Load: Fetch all existing developers from Supabase (if connected)
  useEffect(() => {
    async function loadCity() {
      if (!supabase) return; // No Supabase configured, keep using mock data
      
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error loading city data from Supabase:", error);
        // Keep mock data on error
      } else if (data && data.length > 0) {
        setInhabitants(data);
      }
      // If data is empty, keep mock data so the city isn't blank
    }
    loadCity();
  }, []);

  // 2. Auth Load: When a user logs in, fetch their GitHub stats and save them to Supabase
  useEffect(() => {
    async function handleLogin() {
      if (session && session.accessToken) {
        // Fetch up-to-date stats from GitHub
        const stats = await getGitHubStats(session.user.name, session.accessToken);
        
        if (stats) {
          const newDeveloper = {
            github_username: stats.username,
            stats: stats,
            last_visited: new Date().toISOString()
          };
          
          // Save to Supabase if connected
          if (supabase) {
            const { error } = await supabase
              .from('developers')
              .upsert(newDeveloper, { onConflict: 'github_username' });
              
            if (error) {
              console.error("Error saving developer to Supabase:", error);
            }
          }
          
          // Always update local state so they appear immediately
          setInhabitants((prev) => {
            const exists = prev.find(u => u.github_username === newDeveloper.github_username);
            if (exists) {
              return prev.map(u => u.github_username === newDeveloper.github_username ? { ...u, stats: newDeveloper.stats } : u);
            }
            return [...prev, newDeveloper];
          });
        }
      }
    }
    handleLogin();
  }, [session]);

  const handleBuildingClick = (meshRef, developerData) => {
    setActiveBuilding(meshRef);
    setActiveDeveloperId(null); // Clear search ID if any
    setSelectedDeveloper(developerData);
  };

  const handleCloseProfile = () => {
    setActiveBuilding(null);
    setActiveDeveloperId(null);
    setSelectedDeveloper(null);
  };

  return (
    <div className={`w-full h-screen transition-colors duration-1000 ${isNight ? "bg-[#0a0f1d]" : "bg-[#f0f0f5]"}`}>
      <Canvas shadows camera={{ position: [100, 80, 100], fov: 50 }}>
        <color attach="background" args={[isNight ? "#0a0f1d" : "#f0f0f5"]} />
        <fog attach="fog" args={[isNight ? "#0a0f1d" : "#f0f0f5", 30, 250]} />
        
        {isNight ? (
          <>
            <Stars radius={100} depth={50} count={6000} factor={6} saturation={0} fade speed={1} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 30, 10]} intensity={1.5} color="#4444ff" />
            
            {/* The Giant Moon */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <mesh position={[20, 80, -100]}>
                <sphereGeometry args={[15, 64, 64]} />
                <meshStandardMaterial 
                  emissive="#ffffff" 
                  emissiveIntensity={2} 
                  color="white" 
                />
              </mesh>
            </Float>
          </>
        ) : (
          <>
            <ambientLight intensity={0.7} />
            <directionalLight position={[50, 50, 50]} intensity={1.2} castShadow />
            <Sky />
          </>
        )}
        
        <Environment preset={isNight ? "city" : "apartment"} />
        
        {!activePlanet ? (
          <SolarSystem 
            developers={inhabitants} 
            texture={isNight ? "/textures/block-textures/metro-windows.png" : "/textures/block-textures/white-clean.png"} 
            onPlanetSelect={handlePlanetSelect}
            isNight={isNight}
          />
        ) : (
          <group>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[1000, 1000]} />
              <meshStandardMaterial 
                color={isNight ? "#0a0a0f" : "#ffffff"} 
                roughness={isNight ? 0.8 : 0.2} 
                metalness={isNight ? 0.2 : 0.1}
              />
            </mesh>

            <ContactShadows resolution={1024} scale={200} blur={2} opacity={0.4} far={20} color={isNight ? "#000000" : "#999999"} />

            {/* Unified District */}
            <District 
              developers={filteredInhabitants} 
              startX={-20} 
              startZ={-20} 
              texture={isNight ? "/textures/block-textures/metro-windows.png" : "/textures/block-textures/white-clean.png"} 
              onClick={handleBuildingClick}
            />
          </group>
        )}

        <CameraControls 
          activeBuilding={activeBuilding} 
          activePlanet={activePlanet} 
          activeDeveloperId={activeDeveloperId}
        />
      </Canvas>
      
      {/* Premium UI Overlay */}
      <div className="fixed top-10 left-10 pointer-events-none z-50">
        <h1 className={`text-4xl font-bold tracking-[0.2em] uppercase mb-1 transition-colors duration-500 ${isNight ? 'text-white' : 'text-black'}`} style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Dev City
        </h1>
        <p className={`text-[10px] uppercase tracking-[0.5em] transition-colors duration-500 ${isNight ? 'text-indigo-400' : 'text-gray-400'} mb-4`}>
          Transforming code into construction
        </p>

        {activePlanet && (
          <button 
            onClick={handleBackToOrbit}
            className={`pointer-events-auto px-4 py-2 mt-2 text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${isNight ? 'border-white/20 text-white hover:bg-white/10 shadow-[4px_4px_0_0_rgba(255,255,255,0.1)]' : 'border-black/20 text-black hover:bg-black/10 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]'}`}
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            ← LEAVE {activePlanet.label}
          </button>
        )}
      </div>

      <TopStats theme={theme} />
      <EventTicker theme={theme} inhabitants={inhabitants} />
      <UIControls theme={theme} setTheme={setTheme} />
      
      <div className="fixed top-24 right-10 pointer-events-auto z-40">
        <LoginButton />
      </div>

      <Guestbook 
        activePlanet={activePlanet} 
        theme={theme} 
      />

      <DevProfile 
        developer={selectedDeveloper} 
        onClose={handleCloseProfile} 
        theme={theme} 
      />

      <Leaderboard 
        inhabitants={inhabitants} 
        theme={theme} 
      />

      <SearchBar 
        inhabitants={inhabitants} 
        theme={theme} 
        onSearchResult={handleSearchSelect}
      />

      <CustomCursor />
    </div>
  );
}

function Sky() {
  return (
    <mesh position={[0, 0, -200]}>
      <sphereGeometry args={[500, 32, 32]} />
      <meshBasicMaterial color="#ffffff" side={THREE.BackSide} />
    </mesh>
  );
}
