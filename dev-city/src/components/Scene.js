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
  const theme = "night"; // Locked to night
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

  const handleEscBack = () => {
    if (selectedDeveloper) {
      handleCloseProfile();
    } else if (activePlanet) {
      handleBackToOrbit();
    }
  };

  return (
    <div className="w-full h-screen bg-[#0a0f1d]">
      <Canvas shadows camera={{ position: [100, 80, 100], fov: 50 }}>
        <color attach="background" args={["#0a0f1d"]} />
        <fog attach="fog" args={["#0a0f1d", 30, 250]} />
        
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
        
        <Environment preset="city" />
        
        {!activePlanet ? (
          <SolarSystem 
            developers={inhabitants} 
            texture="/textures/block-textures/metro-windows.png" 
            onPlanetSelect={handlePlanetSelect}
            isNight={true}
          />
        ) : (
          <group>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[1000, 1000]} />
              <meshStandardMaterial 
                color="#0a0a0f" 
                roughness={0.8} 
                metalness={0.2}
              />
            </mesh>

            <ContactShadows resolution={1024} scale={200} blur={2} opacity={0.4} far={20} color="#000000" />

            {/* Unified District */}
            <District 
              developers={filteredInhabitants} 
              startX={-20} 
              startZ={-20} 
              texture="/textures/block-textures/metro-windows.png" 
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
      <div className="fixed top-12 left-12 pointer-events-none z-50">
        <h1 className="text-4xl font-bold tracking-[0.2em] uppercase mb-1 text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Dev City
        </h1>
        <p className="text-[10px] uppercase tracking-[0.5em] text-indigo-400 mb-6">
          Transforming code into construction
        </p>

        {(activePlanet || selectedDeveloper) && (
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={handleEscBack}
              className="px-4 py-2 text-[10px] uppercase tracking-widest transition-all cursor-pointer border border-white/20 text-white bg-black/40 hover:bg-white/10 shadow-[4px_4px_0_0_rgba(255,255,255,0.1)]"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              ← ESC BACK
            </button>
            {activePlanet && !selectedDeveloper && (
              <span className="text-[8px] text-indigo-200/60 uppercase tracking-widest ml-1">
                Viewing {activePlanet.label}
              </span>
            )}
          </div>
        )}
      </div>

      <TopStats theme="night" />
      <EventTicker theme="night" inhabitants={inhabitants} />
      <UIControls theme="night" onBack={handleEscBack} />
      
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
