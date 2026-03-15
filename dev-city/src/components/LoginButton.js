import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3 bg-black/50 p-2 rounded-lg border border-white/10 backdrop-blur-md">
          <img 
            src={session.user.image || `https://github.com/${session.githubUsername || session.user.name}.png`} 
            alt={session.user.name} 
            className="w-8 h-8 rounded-full border border-green-400 object-cover"
            onError={(e) => {
              e.target.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
            }}
          />
          <div className="text-left">
            <p className="text-white text-xs font-bold uppercase tracking-wider">{session.user.name}</p>
            <p className="text-green-400 text-[10px]">Citizen of Dev City</p>
          </div>
        </div>
        <button 
          onClick={() => signOut()}
          className="text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-widest pointer-events-auto"
        >
          [ Leave City ]
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="bg-white text-black px-6 py-2 font-black uppercase tracking-widest hover:bg-green-400 transition-colors pointer-events-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-xs"
    >
      Login to City
    </button>
  );
}
