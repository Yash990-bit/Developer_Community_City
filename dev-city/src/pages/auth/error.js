import { useRouter } from "next/router";
import Link from "next/link";

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4 text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute w-full h-full bg-[url('/textures/block-textures/metro-windows.png')] bg-repeat opacity-30" style={{ backgroundSize: '64px 64px' }} />
      </div>

      <div className="w-full max-w-md bg-black/80 border-2 border-red-500 p-8 rounded-sm shadow-[8px_8px_0px_0px_rgba(239,68,68,0.5)] relative z-10 backdrop-blur-md text-center">
        <h1 className="text-2xl text-red-500 mb-6 uppercase tracking-widest">SYSTEM ERROR</h1>
        
        <div className="bg-red-950/50 border border-red-500/30 p-4 mb-8">
          <p className="text-[10px] leading-relaxed text-red-200 uppercase">
            {error === "OAuthSignin" || error === "OAuthCallback"
              ? "ACCESS DENIED: Missing or invalid GitHub OAuth credentials."
              : error || "An unknown anomaly occurred during identity verification."}
          </p>
        </div>

        <Link href="/auth/signin" className="inline-block bg-white text-black py-4 px-6 hover:bg-gray-200 transition-colors uppercase text-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          RETURN TO LOGIN
        </Link>
      </div>
    </div>
  );
}
