import { getProviders, signIn } from "next-auth/react";
import { useState } from "react";
import { Github, Play } from "lucide-react";

export default function SignIn({ providers }) {
  const [username, setUsername] = useState("");

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute w-full h-full bg-[url('/textures/block-textures/metro-windows.png')] bg-repeat opacity-30" style={{ backgroundSize: '64px 64px' }} />
      </div>

      <div className="w-full max-w-md bg-black/80 border-2 border-indigo-500 p-8 rounded-sm shadow-[8px_8px_0px_0px_rgba(79,70,229,0.5)] relative z-10 backdrop-blur-md">
        <h1 className="text-4xl text-white text-center mb-8 uppercase font-black tracking-tighter italic">City Login</h1>

        {/* Real GitHub Login */}
        <div className="mb-8">
          <p className="text-[8px] text-gray-400 mb-4 text-center uppercase leading-relaxed">Enter with your Profile</p>
          <button
            onClick={() => signIn("github", { callbackUrl: '/' })}
            className="w-full bg-white text-black py-4 px-4 flex items-center justify-center gap-4 hover:bg-gray-200 transition-colors uppercase text-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
          >
            <Github size={18} /> Login via GitHub
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px bg-white/20 flex-1"></div>
          <span className="text-white/50 text-[10px]">Simple Login</span>
          <div className="h-px bg-white/20 flex-1"></div>
        </div>

        {/* Mock Login */}
        <form onSubmit={(e) => {
          e.preventDefault();
          signIn("credentials", { username: username || "pixel_dev", callbackUrl: '/' });
        }}>
          <p className="text-[8px] text-green-400 mb-4 text-center uppercase leading-relaxed">Spawn with any handle</p>
          <input 
            type="text" 
            placeholder="GITHUB_HANDLE" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black border border-green-500/50 text-white p-4 mb-4 text-[10px] focus:outline-none focus:border-green-400 font-bold uppercase placeholder:text-gray-700"
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-black py-4 px-4 flex items-center justify-center gap-4 hover:bg-green-400 transition-colors uppercase text-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Play size={18} /> Enter City
          </button>
        </form>

      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
