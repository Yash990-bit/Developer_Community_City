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
  const [liveEvents, setLiveEvents] = useState([]);
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false });

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
        // Use githubUsername from session (fallback to name for mock login)
        const usernameToFetch = session.githubUsername || session.user.name;
        
        console.log("Syncing city profile for:", usernameToFetch);
        const stats = await getGitHubStats(usernameToFetch, session.accessToken);
        
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
            const others = prev.filter(u => u.github_username !== newDeveloper.github_username);
            return [newDeveloper, ...others];
          });
        }
      }
    }
    handleLogin();
  }, [session]);

  // 3. Real-time Subscriptions: Listen for new citizens and transmissions
  useEffect(() => {
    if (!supabase) return;

    const devsChannel = supabase
      .channel('realtime:developers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'developers' },
        (payload) => {
          const newDev = payload.new;
          const isUpdate = payload.eventType === 'UPDATE';
          
          setLiveEvents(prev => [{
            text: isUpdate ? `@${newDev.github_username} updated their profile!` : `@${newDev.github_username} just landed in the city!`,
            icon: isUpdate ? "🛠️" : "🛸",
            timestamp: Date.now()
          }, ...prev.slice(0, 9)]);
          
          setInhabitants(prev => {
            const existing = prev.find(d => d.github_username === newDev.github_username);
            if (existing) {
              // Update existing and move to front if it's the current session user
              const others = prev.filter(d => d.github_username !== newDev.github_username);
              return [newDev, ...others];
            }
            return [newDev, ...prev];
          });
        }
      )
      .subscribe();

    const msgsChannel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'planet_messages' },
        (payload) => {
          const newMsg = payload.new;
          setLiveEvents(prev => [{
            text: `@${newMsg.github_username} transmitted a new message`,
            icon: "📡",
            timestamp: Date.now()
          }, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(devsChannel);
      supabase.removeChannel(msgsChannel);
    };
  }, []);

  const handleBuildingClick = (meshRef, developerData) => {
    setActiveBuilding(meshRef);
    setActiveDeveloperId(null); // Clear search ID if any
    setSelectedDeveloper(developerData);
  };

  // 3. Dynamic Stats Calculation
  const cityStats = useMemo(() => {
    const totalStars = inhabitants.reduce((sum, dev) => sum + (dev.stats?.stars || 0), 0);
    const totalInhabitants = inhabitants.length;
    
    // "Live" = Users visited in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const liveCount = inhabitants.filter(dev => {
      if (!dev.last_visited) return false;
      return new Date(dev.last_visited) > oneDayAgo;
    }).length;

    return { totalStars, totalInhabitants, liveCount };
  }, [inhabitants]);

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
          movement={movement}
        />
      </Canvas>
      
      {/* Premium UI Overlay */}
      <div className="fixed top-12 left-12 pointer-events-none z-50">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-1 text-white">
          Dev City
        </h1>
        <p className="text-[10px] uppercase tracking-[0.5em] text-indigo-400 mb-6">
          Transforming code into construction
        </p>

        {(activePlanet || selectedDeveloper) && (
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={handleEscBack}
              className="px-2 py-1 text-[8px] uppercase tracking-widest transition-all cursor-pointer border border-white/20 text-white bg-black/40 hover:bg-white/10"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              ← ESC
            </button>
            {activePlanet && !selectedDeveloper && (
              <span className="text-[7px] text-indigo-400/60 uppercase tracking-widest ml-1">
                {activePlanet.label}
              </span>
            )}
          </div>
        )}
      </div>

      <TopStats 
        totalStars={cityStats.totalStars}
        totalInhabitants={cityStats.totalInhabitants}
        liveCount={cityStats.liveCount}
      />
      <EventTicker theme="night" inhabitants={inhabitants} liveEvents={liveEvents} />
      <UIControls theme="night" onBack={handleEscBack} setMovement={setMovement} />
      
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
    </div>
  );
}
