import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function UIControls({ onBack, setMovement }) {
  const handleStart = (dir) => setMovement(prev => ({ ...prev, [dir]: true }));
  const handleEnd = (dir) => setMovement(prev => ({ ...prev, [dir]: false }));

  const btnClass = "w-10 h-10 flex items-center justify-center border border-white/20 bg-black/60 text-white hover:bg-white/20 active:bg-indigo-500/50 transition-all pointer-events-auto backdrop-blur-md";

  return (
    <>
      {/* Bottom Left: Controls */}
      <div className="fixed bottom-12 left-12 flex flex-col gap-4">
        {/* Movement D-Pad */}
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button 
            onMouseDown={() => handleStart('forward')} onMouseUp={() => handleEnd('forward')} onMouseLeave={() => handleEnd('forward')}
            onTouchStart={() => handleStart('forward')} onTouchEnd={() => handleEnd('forward')}
            className={btnClass}
          >
            <ChevronUp size={20} />
          </button>
          <div />
          
          <button 
            onMouseDown={() => handleStart('left')} onMouseUp={() => handleEnd('left')} onMouseLeave={() => handleEnd('left')}
            onTouchStart={() => handleStart('left')} onTouchEnd={() => handleEnd('left')}
            className={btnClass}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onMouseDown={() => handleStart('backward')} onMouseUp={() => handleEnd('backward')} onMouseLeave={() => handleEnd('backward')}
            onTouchStart={() => handleStart('backward')} onTouchEnd={() => handleEnd('backward')}
            className={btnClass}
          >
            <ChevronDown size={20} />
          </button>
          <button 
            onMouseDown={() => handleStart('right')} onMouseUp={() => handleEnd('right')} onMouseLeave={() => handleEnd('right')}
            onTouchStart={() => handleStart('right')} onTouchEnd={() => handleEnd('right')}
            className={btnClass}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button 
          className="px-3 py-2 border border-white/10 bg-black/40 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest opacity-60 transition-all hover:opacity-100 pointer-events-auto"
        >
          ▶ Audio: Lo-fi Cyberspace
        </button>
      </div>
    </>
  );
}
