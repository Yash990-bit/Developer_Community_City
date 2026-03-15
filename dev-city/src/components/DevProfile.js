import { X } from "lucide-react";

function getAchievementTier(score) {
  if (score >= 1000) return { label: "Legend", emoji: "👑", color: "#ffd700" };
  if (score >= 500)  return { label: "Elite",  emoji: "💎", color: "#c026d3" };
  if (score >= 200)  return { label: "Pro",    emoji: "⚡", color: "#00ffff" };
  if (score >= 50)   return { label: "Rising", emoji: "🌱", color: "#22c55e" };
  return { label: "Starter", emoji: "🔰", color: "#888888" };
}

export default function DevProfile({ developer, onClose, theme }) {
  if (!developer) return null;

  const isNight = theme === "night";
  const score = (developer.stats?.commits || 0) + (developer.stats?.stars || 0);
  const tier = getAchievementTier(score);
  const level = Math.min(Math.floor(score / 50) + 1, 99);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`w-full max-w-sm border-2 p-6 relative ${isNight ? 'bg-[#0a0a10] border-indigo-500 shadow-[8px_8px_0px_0px_rgba(79,70,229,0.5)] text-white' : 'bg-white border-blue-500 shadow-[8px_8px_0px_0px_rgba(59,130,246,0.5)] text-black'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 transition-colors cursor-pointer ${isNight ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-black hover:bg-black/10'}`}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6 mt-4">
          {/* GitHub Avatar */}
          <div className="w-16 h-16 mb-4 border-2 border-current overflow-hidden rounded-sm bg-indigo-500/10 flex items-center justify-center">
            <img 
              src={developer.stats?.avatar || `https://github.com/${developer.github_username}.png`} 
              alt={developer.github_username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-2xl">👤</span>';
              }}
            />
          </div>
          <h2 className="text-sm uppercase tracking-widest text-center leading-relaxed">
            {developer.github_username}
          </h2>

          {/* Achievement Badge */}
          <div className="flex items-center gap-2 mt-3 px-3 py-1 border text-[8px]"
               style={{ borderColor: tier.color, color: tier.color }}>
            <span>{tier.emoji}</span>
            <span>{tier.label}</span>
            <span>· Lv.{level}</span>
          </div>
          
          {/* Top Languages */}
          {developer.stats?.topLanguages && developer.stats.topLanguages.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {developer.stats.topLanguages.map(lang => (
                <span key={lang} className={`text-[6px] px-2 py-1 uppercase border ${isNight ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-blue-500/50 bg-blue-500/10 text-blue-600'}`}>
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`p-3 border-2 text-center ${isNight ? 'border-white/20 bg-white/5' : 'border-black/20 bg-black/5'}`}>
            <p className="text-[6px] text-gray-500 mb-2 uppercase">Commits</p>
            <p className="text-sm">🔨 {developer.stats?.commits || 0}</p>
          </div>
          <div className={`p-3 border-2 text-center ${isNight ? 'border-white/20 bg-white/5' : 'border-black/20 bg-black/5'}`}>
            <p className="text-[6px] text-gray-500 mb-2 uppercase">Stars</p>
            <p className="text-sm">⭐ {developer.stats?.stars || 0}</p>
          </div>
          <div className={`p-3 border-2 text-center ${isNight ? 'border-white/20 bg-white/5' : 'border-black/20 bg-black/5'}`}>
            <p className="text-[6px] text-gray-500 mb-2 uppercase">Repos</p>
            <p className="text-sm">📦 {developer.stats?.repos || 0}</p>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-[6px] mb-1 opacity-60">
            <span>Achievement Score</span>
            <span>{score} pts</span>
          </div>
          <div className={`w-full h-2 ${isNight ? 'bg-white/10' : 'bg-black/10'}`}>
            <div 
              className="h-full transition-all duration-500" 
              style={{ width: `${Math.min((score / 1000) * 100, 100)}%`, backgroundColor: tier.color }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            className={`py-3 text-[8px] uppercase tracking-widest transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer ${isNight ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-blue-500 hover:bg-blue-400 text-white'}`}
            onClick={() => window.open(`https://github.com/${developer.github_username}`, '_blank')}
          >
            GitHub
          </button>
          <button 
            className={`py-3 text-[8px] uppercase tracking-widest transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer ${isNight ? 'bg-gray-800 hover:bg-gray-700 text-white border border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-black border border-black/10'}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
