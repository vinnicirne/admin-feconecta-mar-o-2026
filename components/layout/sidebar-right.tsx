"use client";
import Script from "next/script";

import { User as UserIcon, Flame, Mic2, TrendingUp, Music, Headphones, Volume2, Play, Pause } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function GlobalPresence() {
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState({ praying: 0, rooms: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const fetchStats = async () => {
    const { data } = await supabase
      .from("prayer_rooms")
      .select("current_viewers")
      .eq("status", "live");
    
    if (data) {
      const total = data.reduce((acc: number, curr: any) => acc + (curr.current_viewers || 0), 0);
      setStats({ praying: total, rooms: data.length });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchStats();

    const channel = supabase.channel('global_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_rooms' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  if (!isMounted) return <div style={{ height: 160, background: "rgba(0,0,0,0.05)", borderRadius: 24, marginBottom: 24 }} />;

  return (
    <div style={{ padding: "20px", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", borderRadius: 24, color: "white", marginBottom: 24, boxShadow: "0 10px 30px rgba(30, 27, 75, 0.4)", position: "relative", overflow: "hidden" }}>
       <div style={{ position: "absolute", top: -20, right: -20, background: "rgba(255,255,255,0.05)", width: 100, height: 100, borderRadius: "50%" }} />
       
       <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, opacity: 0.8 }}>
         <TrendingUp size={14} />
         <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Radar do Trono</span>
       </div>

       <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="presence-pulse" style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(249, 115, 22, 0.2)", display: "grid", placeItems: "center", color: "#f97316" }}>
               <Flame size={24} fill="#f97316" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{stats.praying}</h3>
              <p style={{ fontSize: 11, margin: 0, opacity: 0.7, fontWeight: 600 }}>INTERCESSORES AGORA</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(34, 197, 94, 0.2)", display: "grid", placeItems: "center", color: "#22c55e" }}>
               <Mic2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{stats.rooms}</h3>
              <p style={{ fontSize: 11, margin: 0, opacity: 0.7, fontWeight: 600 }}>SALAS DE GUERRA ATIVAS</p>
            </div>
          </div>
       </div>

       <style dangerouslySetInnerHTML={{ __html: `
         @keyframes presence-pulse {
           0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
           70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
           100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
         }
         .presence-pulse { animation: presence-pulse 2s infinite; }
       `}} />
    </div>
  );
}

export function LivePraisePlayer() {
  const supabase = useMemo(() => createClient(), []);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [listeners, setListeners] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [floatingReactions, setFloatingReactions] = useState<{id: number, type: string}[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchSession = async () => {
      const { data } = await supabase.from('praise_session').select('*').limit(1).single();
      if (data) setSession(data);
    };
    fetchSession();

    // 🔵 PASSO 8 - TROCAR MÚSICA AUTOMÁTICA (Realtime)
    const sub = supabase.channel('praise_changes')
      .on('postgres_changes', { event: 'UPDATE', table: 'praise_session', schema: 'public' }, (payload: any) => {
        setSession(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [supabase]);

  // 🟢 PASSO 3 & 4 - SINCRONIZAR YOUTUBE
  useEffect(() => {
    if (!isPlaying || !session || !playerRef.current) return;

    const syncMusic = () => {
      const startedAt = new Date(session.started_at).getTime();
      const now = Date.now();
      const diffSeconds = (now - startedAt) / 1000;
      
      if (playerRef.current.seekTo) {
        playerRef.current.seekTo(diffSeconds, true);
        playerRef.current.playVideo();
      }
    };

    const interval = setTimeout(syncMusic, 1000);
    return () => clearTimeout(interval);
  }, [isPlaying, session?.track_id, session?.started_at]);

  // 🟡 PASSO 2, 5 & 6 - REAÇÕES E PRESENÇA (WOW)
  useEffect(() => {
    const channel = supabase.channel('global_praise', {
      config: { presence: { key: 'worship' } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setListeners(Object.values(state).flat().length);
      })
      .on('broadcast', { event: 'receive_reaction' }, (payload: any) => {
        setFloatingReactions(prev => [...prev.slice(-10), { id: Date.now(), type: payload.payload.type }]);
      })
      .on('broadcast', { event: 'user_joined' }, (payload: any) => {
        setShowNotification(`${payload.payload.name} entrou na adoração 🙌`);
        setTimeout(() => setShowNotification(null), 3000);
      })
      .subscribe(async (status: any) => {
        if (status === 'SUBSCRIBED' && isPlaying) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            const name = user?.user_metadata?.full_name?.split(" ")[0] || "Irmão";
            await channel.track({ listening: true });
            await channel.send({ type: 'broadcast', event: 'user_joined', payload: { name } });
          } catch (e) {
            // Silencioso em caso de lock
          }
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [supabase, isPlaying]);

  const sendReaction = (type: string) => {
    supabase.channel('global_praise').send({
      type: 'broadcast',
      event: 'receive_reaction',
      payload: { type }
    });
    setFloatingReactions(prev => [...prev.slice(-10), { id: Date.now(), type }]);
  };

  if (!isMounted) return <div style={{ height: 200, background: "rgba(0,0,0,0.05)", borderRadius: 32 }} />;

  return (
    <div style={{ padding: 24, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 32, color: "white", marginBottom: 24, position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
       <Script 
          src="https://www.youtube.com/iframe_api" 
          onReady={() => {
            (window as any).onYouTubeIframeAPIReady = () => {
               playerRef.current = new (window as any).YT.Player('praise-yt-player', {
                 height: '0', width: '0',
                 videoId: session?.track_id || '7Euvg8YkL_0',
                 playerVars: { 
                    'autoplay': 0, 
                    'controls': 0, 
                    'disablekb': 1, 
                    'enablejsapi': 1,
                    'origin': window.location.origin 
                  },
                 events: { 'onReady': () => console.log('Player Pronto') }
               });
            };
          }} 
       />
       
       <div id="praise-yt-player" style={{ display: "none" }} />

       {/* REAÇÕES FLUTUANTES (EFEITO WOW) */}
       {floatingReactions.map(r => (
         <div key={r.id} className="floating-emoji" style={{ position: "absolute", bottom: 40, left: `${20 + Math.random() * 60}%`, fontSize: 24, opacity: 0, pointerEvents: "none" }}>{r.type}</div>
       ))}

       {showNotification && (
          <div className="anim-pop-in" style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", padding: "4px 12px", borderRadius: 100, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)" }}>
            {showNotification}
          </div>
       )}

       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12 }}>
             <div style={{ width: 44, height: 44, borderRadius: 16, background: isPlaying ? "#8b5cf6" : "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", color: "white", transition: "0.4s", boxShadow: isPlaying ? "0 0 20px rgba(139, 92, 246, 0.4)" : "none" }}>
                <Music size={22} color={isPlaying ? "white" : "#94a3b8"} />
             </div>
             <div>
                <strong style={{ fontSize: 14, display: "block" }}>{session?.track_title || 'Ambiente de Louvor'}</strong>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Sincronizado</span>
                </div>
             </div>
          </div>
          {isPlaying && (
            <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
              {[1,2,3,4].map(i => <div key={i} className="wave-bar" style={{ width: 3, height: 12, background: "#8b5cf6", borderRadius: 10 }} />)}
            </div>
          )}
       </div>

       {isPlaying ? (
         <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button onClick={() => sendReaction('🙌')} className="react-btn">🙌</button>
            <button onClick={() => sendReaction('🔥')} className="react-btn">🔥</button>
            <button onClick={() => sendReaction('❤️')} className="react-btn">❤️</button>
            <button onClick={() => sendReaction('🙏')} className="react-btn">🙏</button>
         </div>
       ) : (
         <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: 20, marginBottom: 20, border: "1px dotted rgba(255,255,255,0.1)" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", textAlign: "center", fontWeight: 600 }}>Clique abaixo para entrar em adoração com a igreja.</p>
         </div>
       )}

       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ 
              background: isPlaying ? "#334155" : "#8b5cf6", 
              color: "white", border: 0, borderRadius: 16, 
              padding: "10px 24px", fontWeight: 800, fontSize: 13,
              cursor: "pointer", transition: "0.3s", display: "flex", alignItems: "center", gap: 8
            }}
          >
            {isPlaying ? <Volume2 size={18} /> : <Play size={18} fill="white" />}
            {isPlaying ? "ADORANDO" : "ENTRAR NO LOUVOR"}
          </button>
          
          <div style={{ textAlign: "right" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                <Headphones size={13} color="#94a3b8" />
                <strong style={{ fontSize: 15 }}>{listeners}</strong>
             </div>
             <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Fiéis ouvindo</span>
          </div>
       </div>

       <style dangerouslySetInnerHTML={{ __html: `
         @keyframes emoji-float {
           0% { transform: translateY(0) scale(0.5); opacity: 0; }
           20% { opacity: 1; transform: translateY(-20px) scale(1.2); }
           100% { transform: translateY(-100px) scale(0.8); opacity: 0; }
         }
         .floating-emoji { animation: emoji-float 2.5s forwards ease-out; }
         .react-btn { flex: 1; height: 36, border-radius: 12px; background: rgba(255,255,255,0.08); border: 0; cursor: pointer; font-size: 16px; transition: 0.2s; }
         .react-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
         .wave-bar { animation: wave 1s infinite ease-in-out; }
         @keyframes wave { 0%, 100% { height: 4px; } 50% { height: 16px; } }
       `}} />
    </div>
  );
}

export function GlobalSidebarRight() {
  return (
    <aside className="faith-sidebar-right" style={{
      position: "sticky", top: 72, height: "calc(100vh - 72px)",
      padding: "24px 24px 24px 16px", overflowY: "auto",
      flexDirection: "column", gap: 16, background: "white", zIndex: 10
    }}>
      <GlobalPresence />
      <LivePraisePlayer />
      <div>
        <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, fontWeight: 900, color: "var(--muted)", margin: "0 0 16px 8px" }}>Conexões Espirituais</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="menu-btn" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 16, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--line)", position: "relative", display: "grid", placeItems: "center" }}>
               <UserIcon size={18} className="muted" />
               <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e", position: "absolute", bottom: -2, right: -2, border: "2px solid #f8fafc" }} />
            </div>
            <strong style={{ fontSize: 15, color: "var(--foreground)" }}>Samuel Marcos</strong>
          </div>
          <div className="menu-btn" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 16, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--line)", position: "relative", display: "grid", placeItems: "center" }}>
               <UserIcon size={18} className="muted" />
               <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e", position: "absolute", bottom: -2, right: -2, border: "2px solid #f8fafc" }} />
            </div>
            <strong style={{ fontSize: 15, color: "var(--foreground)" }}>Rebeca Silva</strong>
          </div>
          <div className="menu-btn" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 16, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--line)", position: "relative", display: "grid", placeItems: "center" }}>
               <UserIcon size={18} className="muted" />
               <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444", position: "absolute", bottom: -2, right: -2, border: "2px solid #f8fafc" }} />
            </div>
            <div>
               <strong style={{ fontSize: 15, color: "var(--foreground)", display: "block" }}>Pastor João</strong>
               <span style={{ fontSize: 12, color: "var(--muted)" }}>Ocupado</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ margin: "8px 0", borderTop: "1px solid var(--line)" }} />
      
      <div style={{ padding: 20, background: "rgba(14, 165, 233, 0.05)", borderRadius: 20, border: "1px dashed rgba(14, 165, 233, 0.3)" }}>
         <strong style={{ color: "#0ea5e9", fontSize: 14 }}>Eventos Próximos</strong>
         <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Culto de Jovens inicia hoje às 19:30. Sua comunhão fortalece a rede!</p>
      </div>
    </aside>
  );
}
