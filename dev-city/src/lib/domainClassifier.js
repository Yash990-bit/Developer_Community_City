// Classifies a developer into a domain/planet based on their top languages

const DOMAIN_MAP = {
  // AI / ML
  "Nexus-AI": ["Python", "R", "Jupyter Notebook", "Julia", "MATLAB"],
  // Web Development
  "WebSphere": ["JavaScript", "TypeScript", "HTML", "CSS", "Vue", "Svelte", "PHP", "Ruby"],
  // Mobile Development  
  "MobileCore": ["Swift", "Kotlin", "Dart", "Objective-C", "Java"],
  // Game Development
  "PixelForge": ["C++", "C#", "Lua", "GDScript", "GLSL", "HLSL"],
  // Systems Programming
  "IronStack": ["Rust", "Go", "C", "Assembly", "Zig", "Haskell", "Erlang"],
  // Data / DevOps
  "DataStream": ["SQL", "Shell", "Scala", "HCL", "Dockerfile", "PowerShell", "Nix"],
};

// Planet configuration (orbit, color, size, speed, emoji, label)
export const PLANETS = [
  { id: "Nexus-AI",   label: "AI / ML",      emoji: "🤖", color: "#9333ea", orbitRadius: 30,  size: 5,   speed: 0.08 },
  { id: "WebSphere",  label: "Web Dev",       emoji: "🌐", color: "#06b6d4", orbitRadius: 50,  size: 6,   speed: 0.06 },
  { id: "MobileCore", label: "Mobile",        emoji: "📱", color: "#22c55e", orbitRadius: 70,  size: 4.5, speed: 0.05 },
  { id: "PixelForge", label: "Game Dev",      emoji: "🎮", color: "#ef4444", orbitRadius: 90,  size: 5.5, speed: 0.04 },
  { id: "IronStack",  label: "Systems",       emoji: "⚙️", color: "#94a3b8", orbitRadius: 110, size: 4,   speed: 0.03 },
  { id: "DataStream", label: "Data / DevOps", emoji: "📊", color: "#f97316", orbitRadius: 130, size: 4.5, speed: 0.025 },
  { id: "OpenWorld",  label: "General",       emoji: "🌀", color: "#e2e8f0", orbitRadius: 150, size: 5,   speed: 0.02 },
];

/**
 * Classify a developer into a domain based on their topLanguages
 * @param {object} developer - Developer object with stats.topLanguages
 * @returns {string} Planet ID (e.g. "Nexus-AI", "WebSphere", etc.)
 */
export function classifyDeveloper(developer) {
  const langs = developer.stats?.topLanguages || [];
  
  if (langs.length === 0) return "OpenWorld";

  // Check each language against the domain map, first match wins
  for (const lang of langs) {
    for (const [domain, domainLangs] of Object.entries(DOMAIN_MAP)) {
      if (domainLangs.includes(lang)) {
        return domain;
      }
    }
  }

  return "OpenWorld";
}

/**
 * Group an array of developers by their planet
 * @param {Array} developers
 * @returns {Object} { "Nexus-AI": [...], "WebSphere": [...], ... }
 */
export function groupByPlanet(developers) {
  const groups = {};
  PLANETS.forEach(p => { groups[p.id] = []; });
  
  developers.forEach(dev => {
    const planet = classifyDeveloper(dev);
    groups[planet].push(dev);
  });
  
  return groups;
}
