import { useState, useMemo } from "react";
import { PLANETS, classifyDeveloper } from "../lib/domainClassifier";

export default function Leaderboard({ inhabitants, theme, onSelectDeveloper }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("citizens"); // "citizens" | "planets"
  const isNight = theme === "night";

  // Sort by achievement score (commits + stars), descending
  const rankedCitizens = useMemo(() => {
    return [...inhabitants]
      .map(dev => ({
        ...dev,
        score: (dev.stats?.commits || 0) + (dev.stats?.stars || 0),
        repos: dev.stats?.repos || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10
  }, [inhabitants]);

  const rankedPlanets = useMemo(() => {
    const scores = {};
    const counts = {};
    
    // Initialize
    PLANETS.forEach(p => {
      scores[p.id] = 0;
      counts[p.id] = 0;
    });

    // Aggregate
    inhabitants.forEach(dev => {
      const planetId = classifyDeveloper(dev);
      const score = (dev.stats?.commits || 0) + (dev.stats?.stars || 0);
      if (scores[planetId] !== undefined) {
        scores[planetId] += score;
        counts[planetId] += 1;
      }
    });

    return PLANETS.map(p => ({
      ...p,
      score: scores[p.id],
      count: counts[p.id]
    })).sort((a, b) => b.score - a.score);
  }, [inhabitants]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className={`fixed top-48 left-12 z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-10'}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 flex items-center justify-center rounded-sm border backdrop-blur-md cursor-pointer transition-all ${
          isNight 
            ? 'bg-black/60 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30' 
            : 'bg-white/60 border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}
      >
        🏆
      </button>

      {/* Leaderboard Panel */}
      {isOpen && (
        <div className={`mt-2 rounded-sm border backdrop-blur-xl overflow-hidden transition-all duration-300 ${
          isNight 
            ? 'bg-black/80 border-cyan-500/20 text-white' 
            : 'bg-white/90 border-gray-200 text-black'
        }`}>
          <div className="p-3 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-60 flex-1" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {viewMode === "citizens" ? "Top Builders" : "Top Planets"}
            </h3>
            <button 
              onClick={() => setViewMode(viewMode === "citizens" ? "planets" : "citizens")}
              className={`text-[6px] px-2 py-1 rounded-sm border opacity-80 hover:opacity-100 transition-opacity ${
                isNight ? 'border-cyan-500/30' : 'border-blue-500/30'
              }`}
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {viewMode === "citizens" ? "🪐" : "🧑‍💻"}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {viewMode === "citizens" ? (
              rankedCitizens.map((dev, i) => (
                <button
                  key={dev.github_username}
                  onClick={() => onSelectDeveloper && onSelectDeveloper(dev.github_username)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors ${
                    isNight ? 'hover:bg-cyan-900/20' : 'hover:bg-blue-50'
                  }`}
                >
                  <span className="text-sm w-5 text-center">
                    {i < 3 ? medals[i] : <span className="text-[8px] opacity-40">{i + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[8px] font-bold truncate ${
                      i === 0 ? (isNight ? 'text-yellow-400' : 'text-yellow-600') : ''
                    }`} style={{ fontFamily: "'Press Start 2P', cursive" }}>
                      {dev.github_username}
                    </p>
                    <p className="text-[7px] opacity-50">
                      {dev.score} pts · {dev.repos} repos
                    </p>
                  </div>
                  <div className={`text-[7px] px-1.5 py-0.5 rounded-sm ${
                    isNight ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    Lv.{Math.min(Math.floor(dev.score / 50) + 1, 99)}
                  </div>
                </button>
              ))
            ) : (
              rankedPlanets.map((planet, i) => (
                <div
                  key={planet.id}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
                    isNight ? 'hover:bg-cyan-900/20' : 'hover:bg-blue-50'
                  }`}
                >
                  <span className="text-sm w-5 text-center">
                    {i < 3 ? medals[i] : <span className="text-[8px] opacity-40">{i + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[8px] font-bold truncate`} 
                       style={{ fontFamily: "'Press Start 2P', cursive", color: planet.color }}>
                      {planet.emoji} {planet.label}
                    </p>
                    <p className="text-[7px] opacity-50 mt-1">
                      {planet.score} pts · {planet.count} devs
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {rankedCitizens.length === 0 && viewMode === "citizens" && (
            <p className="p-3 text-[7px] opacity-40 text-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              No developers yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
