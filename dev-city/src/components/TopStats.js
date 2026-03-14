import { Github, MessageSquare, Radio, Users } from "lucide-react";

export default function TopStats({ theme }) {
  const isNight = theme === "night";
  const textColor = isNight ? "text-white" : "text-black";
  const borderColor = isNight ? "border-white/10" : "border-black/10";
  const bgColor = isNight ? "bg-black/50" : "bg-white/50";

  const StatItem = ({ icon: Icon, value, label, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1 ${bgColor} ${borderColor} border rounded-sm backdrop-blur-md`}>
      <Icon size={14} className={color} />
      <span className={`text-[10px] font-bold ${textColor} tracking-tight`}>{value}</span>
      <span className="text-[8px] uppercase opacity-60 tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="fixed top-6 right-6 flex items-center gap-3 pointer-events-auto" style={{ fontFamily: "'Press Start 2P', cursive" }}>
      <StatItem icon={Github} value="3,695" label="Stars" color="text-yellow-400" />
      <StatItem icon={MessageSquare} value="411" label="Discord" color="text-indigo-400" />
      <StatItem icon={Radio} value="85" label="Live" color="text-green-400" />
      <StatItem icon={Users} value="3" label="Coding" color="text-cyan-400" />
    </div>
  );
}
