import { Github, Radio, Users } from "lucide-react";

export default function TopStats({ totalStars = 0, totalInhabitants = 0, liveCount = 0 }) {
  const textColor = "text-white";
  const borderColor = "border-white/10";
  const bgColor = "bg-black/50";

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const StatItem = ({ icon: Icon, value, label, color, isLive }) => (
    <div className={`flex items-center gap-2 px-3 py-1 ${bgColor} ${borderColor} border rounded-sm backdrop-blur-md relative overflow-hidden`}>
      <Icon size={14} className={`${color} ${isLive ? 'animate-pulse scale-110' : ''}`} />
      <span className={`text-[10px] font-bold ${textColor} tracking-tight`}>{value}</span>
      <span className="text-[8px] uppercase opacity-60 tracking-widest">{label}</span>
      {isLive && (
        <span className="absolute top-0 right-0 w-1 h-1 bg-green-500 rounded-full m-1 shadow-[0_0_8px_rgba(34,197,94,1)]" />
      )}
    </div>
  );

  return (
    <>
      <style jsx global>{`
        @keyframes customPulse {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        .animate-pulse {
          animation: customPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div className="fixed top-12 right-12 flex items-center gap-3 pointer-events-auto" style={{ fontFamily: "'Press Start 2P', cursive" }}>
        <StatItem icon={Github} value={formatNumber(totalStars)} label="Stars" color="text-yellow-400" />
        <StatItem icon={Radio} value={formatNumber(liveCount)} label="Live" color="text-green-400" isLive={true} />
        <StatItem icon={Users} value={formatNumber(totalInhabitants)} label="Residents" color="text-cyan-400" />
      </div>
    </>
  );
}
