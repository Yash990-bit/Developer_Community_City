import { useState } from "react";

export default function SearchBar({ inhabitants, theme, onSearchResult }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const isNight = theme === "night";

  const handleSearch = (value) => {
    setQuery(value);
    if (value.trim().length > 0) {
      const filtered = inhabitants.filter(dev =>
        dev.github_username?.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  };

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-72">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-sm border backdrop-blur-xl transition-all ${
        isNight 
          ? 'bg-black/70 border-cyan-500/20 text-white' 
          : 'bg-white/80 border-gray-300 text-black'
      }`}>
        <span className="text-sm opacity-50">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search developer..."
          className={`flex-1 bg-transparent outline-none text-[9px] placeholder-gray-500 ${
            isNight ? 'text-white' : 'text-black'
          }`}
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        />
      </div>

      {/* Results Dropdown */}
      {results.length > 0 && (
        <div className={`mt-1 rounded-sm border backdrop-blur-xl overflow-hidden ${
          isNight ? 'bg-black/90 border-cyan-500/20' : 'bg-white/95 border-gray-200'
        }`}>
          {results.map(dev => (
            <button
              key={dev.github_username}
              onClick={() => {
                onSearchResult && onSearchResult(dev.github_username);
                setQuery("");
                setResults([]);
              }}
              className={`w-full text-left px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                isNight ? 'hover:bg-cyan-900/20 text-white' : 'hover:bg-blue-50 text-black'
              }`}
            >
              <span className="text-[8px] font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                {dev.github_username}
              </span>
              <span className="text-[7px] opacity-50">
                {(dev.stats?.commits || 0) + (dev.stats?.stars || 0)} pts
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
