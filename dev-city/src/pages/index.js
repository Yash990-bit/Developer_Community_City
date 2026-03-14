import dynamic from 'next/dynamic';

// Dynamically import the main Home content with SSR disabled
// This prevents Three.js Canvas and Supabase from throwing errors during server-side rendering
const Scene = dynamic(() => import('../components/Scene'), {
  ssr: false,
});

export default function Home() {
  return <Scene />;
}
