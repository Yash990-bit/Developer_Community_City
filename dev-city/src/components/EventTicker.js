import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

export default function EventTicker({ theme, inhabitants = [] }) {
  const isNight = theme === "night";
  const [index, setIndex] = useState(0);

  // Generate real events from inhabitants data
  const events = useMemo(() => {
    const generated = [];

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

    // Recent joiners
    inhabitants.slice(-3).forEach(dev => {
      generated.push({ text: `@${dev.github_username} joined Developer Community City`, icon: "🏗️" });
    });

    // Achievement milestones
    sorted.forEach(dev => {
      if (dev.score >= 1000) generated.push({ text: `@${dev.name} reached Legend status!`, icon: "👑" });
      else if (dev.score >= 500) generated.push({ text: `@${dev.name} reached Elite tier!`, icon: "💎" });
      else if (dev.commits >= 100) generated.push({ text: `@${dev.name} passed 100 commits!`, icon: "🔥" });
    });

    // Language diversity
    const langs = new Set(sorted.filter(d => d.lang).map(d => d.lang));
    if (langs.size > 0) {
      generated.push({ text: `${langs.size} programming languages represented in the city`, icon: "💻" });
    }

    // City stats
    generated.push({ text: `${inhabitants.length} developers building in the city`, icon: "🌆" });

    // Fallback if empty
    if (generated.length === 0) {
      generated.push({ text: "Welcome to Developer Community City!", icon: "🏙️" });
      generated.push({ text: "Login with GitHub to claim your building", icon: "🔐" });
    }

    return generated;
  }, [inhabitants]);

  useEffect(() => {
    if (events.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [events.length]);

  const currentEvent = events[index] || { text: "Welcome!", icon: "🏙️" };

  return (
    <div className={`fixed bottom-0 left-0 w-full h-8 flex items-center px-6 ${isNight ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md border-t ${isNight ? 'border-white/10' : 'border-black/10'} pointer-events-none`}>
      <div className="flex items-center gap-4 overflow-hidden w-full">
        <span className={`text-[8px] uppercase font-bold ${isNight ? 'text-gray-500' : 'text-gray-400'} tracking-widest shrink-0`}>Live Feed //</span>
        <div className="relative flex-grow h-full flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-[9px] uppercase tracking-wider flex items-center gap-2 ${isNight ? 'text-white' : 'text-black'}`}
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              <span>{currentEvent.icon}</span>
              <span>{currentEvent.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3 text-[7px] uppercase text-gray-500 tracking-tighter shrink-0">
          <span>🏗️ {inhabitants.length} devs</span>
        </div>
      </div>
    </div>
  );
}
