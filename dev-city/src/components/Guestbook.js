import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "next-auth/react";

export default function Guestbook({ activePlanet, theme }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  
  const isNight = theme === "night";

  const fetchMessages = async () => {
    if (!supabase || !activePlanet) return;
    
    const { data, error } = await supabase
      .from('planet_messages')
      .select('*')
      .eq('planet_id', activePlanet.id)
      .order('created_at', { ascending: true })
      .limit(50);
      
    if (error) {
      console.error("Error fetching planet messages:", error);
    } else if (data) {
      setMessages(data);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Set up realtime subscription
    if (!supabase || !activePlanet) return;
    
    const channel = supabase
      .channel(`public:planet_messages:planet_id=eq.${activePlanet.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'planet_messages',
        filter: `planet_id=eq.${activePlanet.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePlanet]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !session || !supabase || !activePlanet) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('planet_messages')
      .insert([
        { 
          planet_id: activePlanet.id, 
          github_username: session.user.name,
          message: newMessage.trim().substring(0, 100) // max 100 chars
        }
      ]);
      
    if (error) {
      console.error("Error posting message:", error);
    } else {
      setNewMessage("");
    }
    
    setIsSubmitting(false);
  };

  if (!activePlanet) return null;

  return (
    <div className={`fixed top-24 right-6 z-40 w-72 rounded-sm border backdrop-blur-xl flex flex-col transition-all duration-300 ${
      isNight 
        ? 'bg-black/80 border-cyan-500/20 text-white' 
        : 'bg-white/90 border-gray-200 text-black'
    }`} style={{ height: "400px" }}>
      
      {/* Header */}
      <div className={`p-3 border-b flex items-center justify-between ${isNight ? 'border-cyan-500/20' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm">{activePlanet.emoji}</span>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: activePlanet.color }}>
            {activePlanet.label} FREQ
          </h3>
        </div>
        <div className="flex gap-1 animate-pulse">
          <div className="w-1 h-1 bg-green-500 rounded-full" />
          <div className="w-1 h-1 bg-green-500 rounded-full" />
          <div className="w-1 h-1 bg-green-500 rounded-full" />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-[7px] opacity-40 text-center mt-4 uppercase leading-[1.8] tracking-widest">
            No transmissions yet.<br/>Be the first to hail this planet.
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className={`text-[6px] opacity-70 ${isNight ? 'text-yellow-400' : 'text-blue-600'}`}>
                  {msg.github_username}
                </span>
                <span className="text-[5px] opacity-30">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[7px] leading-relaxed break-words opacity-90">
                {"> "}{msg.message}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className={`p-3 border-t ${isNight ? 'border-cyan-500/20 bg-black/50' : 'border-gray-200 bg-gray-50/50'}`}>
        {!session ? (
          <p className="text-[6px] text-center opacity-50 tracking-widest leading-[1.8] uppercase">
            Initialize GitHub uplink<br/>to transmit messages
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Transmit..."
              maxLength={100}
              disabled={isSubmitting}
              className={`flex-1 bg-transparent outline-none text-[7px] border-b pb-1 px-1 transition-colors ${
                isNight 
                  ? 'border-cyan-500/30 text-white placeholder-cyan-500/30 focus:border-cyan-400' 
                  : 'border-blue-500/30 text-black placeholder-blue-500/30 focus:border-blue-400'
              }`}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newMessage.trim()}
              className={`text-[6px] font-bold uppercase tracking-wider px-2 py-1 border rounded-sm transition-all ${
                isNight
                  ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40 disabled:opacity-30'
                  : 'border-blue-500/40 text-blue-600 hover:bg-blue-100 disabled:opacity-30'
              }`}
            >
              SEND
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
