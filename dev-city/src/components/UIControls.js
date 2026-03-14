export default function UIControls({ theme, setTheme }) {
  const isNight = theme === "night";

  return (
    <>
      {/* Top Left: ESC/BACK */}
      <div className="fixed top-6 left-6 flex items-center gap-4 pointer-events-auto">
        <button 
          className={`px-3 py-1 border ${isNight ? 'border-white/20 bg-black/40 text-white' : 'border-black/20 bg-white/40 text-black'} rounded-sm text-[8px] uppercase tracking-widest hover:scale-105 transition-transform`}
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Esc Back
        </button>
      </div>

      {/* Bottom Left: Controls */}
      <div className="fixed bottom-12 left-6 flex items-center gap-3 pointer-events-auto">
        <button 
          onClick={() => setTheme(isNight ? 'white' : 'night')}
          className={`px-3 py-2 border ${isNight ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-400' : 'border-orange-500/50 bg-orange-500/20 text-orange-600'} rounded-sm text-[8px] uppercase tracking-widest font-bold shadow-lg`}
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          {isNight ? '▶ Night Mode' : '▷ White Mode'}
        </button>
        <button 
          className={`px-3 py-2 border ${isNight ? 'border-white/10 bg-black/40 text-white' : 'border-black/10 bg-white/40 text-black'} rounded-sm text-[8px] uppercase tracking-widest opacity-60`}
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          ▶ Lo-fi ...
        </button>
      </div>
    </>
  );
}
