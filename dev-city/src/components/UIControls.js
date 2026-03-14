export default function UIControls({ onBack }) {
  return (
    <>
      {/* Bottom Left: Controls */}
      <div className="fixed bottom-12 left-12 flex items-center gap-3 pointer-events-auto">
        <button 
          className="px-3 py-2 border border-white/10 bg-black/40 text-white rounded-sm text-[8px] uppercase tracking-widest opacity-60 transition-all hover:opacity-100"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          ▶ Audio: Lo-fi Cyberspace
        </button>
      </div>
    </>
  );
}
