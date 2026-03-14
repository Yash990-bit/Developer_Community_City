import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

export default function EventTicker({ theme, inhabitants = [], liveEvents = [] }) {
  const isNight = theme === "night";
  const [index, setIndex] = useState(0);

  // Merge static architectural events with real-time live events
  const events = useMemo(() => {
    const generated = [...liveEvents];

    // Sort by score for awards
    const sorted = [...inhabitants]
      .map(dev => ({
        name: dev.github_username,
        score: (dev.stats?.commits || 0) + (dev.stats?.stars || 0),
        commits: dev.stats?.commits || 0,
        stars: dev.stats?.stars || 0,
        repos: dev.stats?.repos || 0,
        lang: dev.stats?.topLanguages?.[0] || null
      }))
      .sort((a, b) => b.score - a.score);

    // Top builder announcement
    if (sorted.length > 0) {
      generated.push({ text: `@${sorted[0].name} has the tallest building in the city!`, icon: "🏆" });
    }

    // Recent joiners (static fallback)
    inhabitants.slice(-2).forEach(dev => {
      generated.push({ text: `@${dev.github_username} is online`, icon: "🏗️" });
    });

    // Achievement milestones
    sorted.slice(0, 5).forEach(dev => {
      if (dev.score >= 1000) generated.push({ text: `@${dev.name} reached Legend status!`, icon: "👑" });
      else if (dev.score >= 500) generated.push({ text: `@${dev.name} reached Elite tier!`, icon: "💎" });
    });

    // City stats
    generated.push({ text: `${inhabitants.length} developers detected in sector`, icon: "🌆" });

    // Fallback if empty
    if (generated.length === 0) {
      generated.push({ text: "SYSTEM STANDBY: SCANNING SECTORS...", icon: "🏙️" });
    }

    return generated;
  }, [inhabitants, liveEvents]);

  useEffect(() => {
    if (events.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [events.length]);

  const currentEvent = events[index] || { text: "SYSTEM ONLINE", icon: "🏙️" };

  return (
    <>
      <style jsx>{`
        .ticker-line {
          background: linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.05) 50%, transparent 100%);
          height: 1px;
          width: 100%;
          position: absolute;
          top: 0;
          animation: scan 3s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .glitch-text {
          text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
          animation: glitch 5s infinite;
        }
        @keyframes glitch {
          0%, 95%, 100% { transform: translate(0); text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
          96% { transform: translate(-1px, 1px); text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; }
          97% { transform: translate(1px, -1px); text-shadow: 3px 0 #ff00ff, -3px 0 #00ffff; }
          98% { transform: translate(-1px, -1px); text-shadow: -1px 0 #ff00ff, 1px 0 #00ffff; }
        }
      `}</style>
      
      <div className="fixed bottom-0 left-0 w-full h-10 flex items-center px-8 bg-black/90 backdrop-blur-xl border-t border-cyan-500/20 pointer-events-none z-50">
        <div className="ticker-line" />
        
        <div className="flex items-center gap-6 overflow-hidden w-full relative">
          {/* Label with scanning indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-1 h-3 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
            <span className="text-[7px] uppercase font-black text-cyan-400 tracking-[0.3em] font-mono">
              Live_Sector_Feed_v2.0
            </span>
          </div>

          <div className="relative flex-grow h-full flex items-center border-l border-white/5 pl-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-[9px] uppercase tracking-[0.2em] flex items-center gap-3 text-white font-mono"
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                <span className="text-cyan-400 opacity-80">{currentEvent.icon}</span>
                <span className="font-bold tracking-widest glitch-text">
                  {currentEvent.text}
                </span>
                <span className="text-[7px] text-white/20 ml-2">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}]</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 text-[7px] uppercase text-indigo-400 font-mono tracking-widest shrink-0 opacity-60">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" />
              Sync_Active
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
