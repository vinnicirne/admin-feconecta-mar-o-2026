"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Mic, MicOff, Users, MessageSquare, Hand, ChevronLeft, 
  Clock, Loader2, Crown, Shield, Volume2, Share2, Copy, Check
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function WarRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPraying, setIsPraying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; icon: string; left: number }[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [pinnedPrayer, setPinnedPrayer] = useState<string | null>("Minha família precisa de oração");
  const timerRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addReaction = (icon: string) => {
    const id = Date.now();
    const left = Math.random() * 60 + 20;
    setReactions(prev => [...prev, { id, icon, left }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 4000);
  };

  useEffect(() => {
    loadRoom();
    loadUser();
  }, [id]);

  useEffect(() => {
    if (room?.started_at && room?.max_duration_minutes) {
      timerRef.current = setInterval(() => {
        const start = new Date(room.started_at).getTime();
        const maxMs = room.max_duration_minutes * 60 * 1000;
        const now = Date.now();
        const spent = now - start;
        const remaining = Math.max(0, Math.floor((maxMs - spent) / 1000));
        setTimeLeft(remaining);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [room]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/war-room/${id}`;
    const shareData = {
      title: room?.title || "Sala de Guerra - FéConecta",
      text: `🙏 Junte-se à nossa oração ao vivo: "${room?.title}"\n\nAcesse o link e participe:`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const loadRoom = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("prayer_rooms")
        .select(`*, host:profiles!host_id(full_name, username)`)
        .eq("id", id)
        .single();
      if (error) throw error;
      setRoom(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEndRoom = async () => {
    if (!confirm("Encerrar esta sala de oração?")) return;
    await supabase.from("prayer_rooms").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", id);
    router.push("/war-room/new");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: chatMsg.trim(),
      author: currentUser?.user_metadata?.full_name || "Você",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }]);
    setChatMsg("");
  };

  const handleStartRoom = async () => {
    try {
      const { error } = await supabase
        .from("prayer_rooms")
        .update({ status: "live", started_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      loadRoom();
    } catch (err: any) {
      alert(`Erro ao iniciar: ${err.message}`);
    }
  };

  const isHost = currentUser?.id === room?.host_id;
  const isPreRoom = room?.status === 'scheduled';

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} className="spin muted" />
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p className="muted">Sala não encontrada.</p>
        <button onClick={() => router.push("/")} className="button" style={{ marginTop: 20 }}>Voltar ao Feed</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 16px 100px" }}>

      {/* 🔴 HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--muted)", display: "grid", placeItems: "center" }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: isPreRoom ? "var(--primary)" : "#ef4444", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: isPreRoom ? "var(--primary)" : "#ef4444", animation: "pulse 1.5s infinite" }} />
              {isPreRoom ? "PRÓXIMA VIGÍLIA" : "AO VIVO AGORA"}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
              • <Users size={14} /> {room.current_viewers || 0} pessoas
            </span>
          </div>
        </div>
        <button
          onClick={handleShare}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 100, border: 0, cursor: "pointer",
            background: copied ? "rgba(16, 185, 129, 0.1)" : "var(--primary-soft)",
            color: copied ? "#10b981" : "var(--primary)",
            fontWeight: 800, fontSize: 11, transition: "0.2s"
          }}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? "Copiado!" : "Convidar"}
        </button>
      </div>

      <div className="war-room-grid" style={{ display: "grid", gap: 24, alignItems: "stretch" }}>
        
        {/* 🟢 CARD PRINCIPAL */}
        <div className="card" style={{ 
          padding: 32, margin: 0, 
          background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)", 
          color: "white", border: 0, height: "100%", 
          display: "flex", flexDirection: "column", 
          position: "relative", overflow: "hidden",
          borderRadius: 32
        }}>
          {reactions.map(r => (
            <div key={r.id} className="floating-reaction" style={{ left: `${r.left}%` }}>
              {r.icon}
            </div>
          ))}

          <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center" }}>
                <Crown size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 900, opacity: 0.7, textTransform: "uppercase" }}>Anfitrião</p>
                <strong style={{ fontSize: 15 }}>{room.host?.full_name || "Líder"}</strong>
              </div>
            </div>

            <div style={{ textAlign: "center", margin: "40px 0" }}>
               {isPreRoom ? (
                 <div style={{ padding: "40px 0" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Inicia em</div>
                    <div style={{ fontSize: 56, fontWeight: 900, fontFamily: "monospace" }}>
                      {new Date(room.scheduled_for).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {room.verse_base && (
                      <div style={{ marginTop: 24, padding: "12px 20px", background: "rgba(255,255,255,0.1)", borderRadius: 12, display: "inline-block", fontSize: 13, fontWeight: 700, fontStyle: "italic" }}>
                        " {room.verse_base} "
                      </div>
                    )}
                 </div>
               ) : (
                 <div style={{ position: "relative", display: "inline-block" }}>
                    <div className="avatar-glow" />
                    <div style={{ width: 120, height: 120, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.2)", overflow: "hidden", background: "rgba(255,255,255,0.1)", margin: "0 auto", position: "relative", zIndex: 1 }}>
                      <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}><Users size={48} style={{ opacity: 0.3 }} /></div>
                    </div>
                    <div className="wave-container">{[1, 2, 3, 4, 5].map(i => <div key={i} className="wave" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
                 </div>
               )}
               {!isPreRoom && (
                 <>
                  <h3 style={{ fontSize: 22, fontWeight: 900, margin: "24px 0 4px" }}>{room.host?.full_name?.split(' ')[0]}</h3>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, opacity: 0.8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Volume2 size={16} /> Orando agora...</p>
                 </>
               )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isPreRoom && isHost ? "1fr" : "1fr auto 1fr", gap: 12, margin: "40px 0", padding: "24px 0", borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
               {isPreRoom ? (
                 isHost ? (
                    <button onClick={handleStartRoom} style={{ width: "100%", height: 64, borderRadius: 16, border: 0, background: "white", color: "#0f766e", fontWeight: 900, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}><Mic size={20} /> INICIAR TRANSMISSÃO</button>
                 ) : (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "10px", opacity: 0.7, fontSize: 13, fontWeight: 700 }}>Aguardando o anfitrião iniciar...</div>
                 )
               ) : (
                 <>
                  <button onClick={() => setIsMuted(!isMuted)} className="ctrl-btn"><div className={`btn-icon ${isMuted ? 'muted' : 'active'}`}>{isMuted ? <MicOff size={20} /> : <Mic size={20} />}</div><span>{isMuted ? "MUTADO" : "FALAR"}</span></button>
                  <button onClick={() => setIsPraying(!isPraying)} style={{ padding: "0 32px", height: 64, borderRadius: 100, border: 0, background: isPraying ? "white" : "rgba(255,255,255,0.15)", color: isPraying ? "#0f766e" : "white", fontWeight: 900, fontSize: 15, cursor: "pointer", transition: "0.2s", display: "flex", alignItems: "center", gap: 10, boxShadow: isPraying ? "0 10px 25px rgba(0,0,0,0.2)" : "none" }}>🙏 {isPraying ? "Orando..." : "Participar"}</button>
                  <button onClick={() => addReaction("⚡")} className="ctrl-btn"><div className="btn-icon"><Hand size={20} /></div><span>PEDIR FALA</span></button>
                 </>
               )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.08)", padding: 24, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
               <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>🇧🇷 {room.title}</h2>
               <p style={{ margin: 0, opacity: 0.7, fontSize: 13, lineHeight: 1.5 }}>{room.description || "Unidos em um só propósito de intercessão profética."}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 32 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={16} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace" }}>{isPreRoom ? "--:--" : formatTime(timeLeft)}</span>
               </div>
               <div style={{ flex: 1 }} />
               <div style={{ padding: "8px 16px", background: isPreRoom ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.15)", color: isPreRoom ? "white" : "#10b981", borderRadius: 100, fontSize: 11, fontWeight: 900, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: isPreRoom ? "white" : "#10b981", animation: "pulse 1.5s infinite" }} />
                  {isPreRoom ? "Preparação" : "Intercessão Ativa"}
               </div>
            </div>
          </div>
        </div>

        {/* 💬 CHAT AREA */}
        <div className={`card shadow-sm chat-container ${isFocusMode ? 'focus-mode' : ''}`} style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", background: "white", borderRadius: 32 }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s infinite" }} />
              <strong style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)" }}>Chat ao Vivo</strong>
            </div>
            <button onClick={() => setIsFocusMode(!isFocusMode)} style={{ padding: "6px 12px", borderRadius: 8, border: 0, background: "var(--line)", color: "var(--muted)", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>{isFocusMode ? "EXIBIR CHAT" : "MODO FOCO"}</button>
          </div>

          {!isFocusMode && (
            <>
              {pinnedPrayer && (
                <div style={{ padding: "12px 20px", background: "rgba(15,118,110,0.05)", borderBottom: "1px solid rgba(15,118,110,0.1)", display: "flex", gap: 12, alignItems: "center" }}>
                   <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--primary)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}><Crown size={16} /></div>
                   <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase" }}>Pedido Fixado</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f766e" }}>{pinnedPrayer}</p>
                   </div>
                </div>
              )}
              <div ref={chatScrollRef} style={{ flex: 1, minHeight: 400, maxHeight: 600, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.length === 0 ? (<div style={{ margin: "auto", textAlign: "center", opacity: 0.5 }}><p style={{ fontSize: 13 }}>Seja o primeiro a interceder 🙏</p></div>) : messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>{msg.author === room.host?.full_name ? "👑" : "🙏"}</div>
                    <div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 4, background: msg.author === room.host?.full_name ? "#0f766e" : "var(--line)", color: msg.author === room.host?.full_name ? "white" : "var(--muted)" }}>{msg.author === room.host?.full_name ? "LÍDER" : "INTERCESSOR"}</span>
                        <strong style={{ fontSize: 13 }}>{msg.author}</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 20px", display: "flex", gap: 12, justifyContent: "center", borderTop: "1px solid var(--line)" }}>
                 {["❤️", "🙏", "🔥", "⚡"].map(emoji => (<button key={emoji} onClick={() => { addReaction(emoji); setChatMsg(emoji); }} style={{ fontSize: 20, background: "none", border: 0, cursor: "pointer" }}>{emoji}</button>))}
              </div>
              <form onSubmit={handleSendMessage} style={{ padding: "16px 20px", borderTop: "1px solid var(--line)", background: "var(--line)", position: "relative" }}>
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Escreva uma oração..." style={{ width: "100%", padding: "14px 44px 14px 16px", borderRadius: 24, border: "1px solid rgba(0,0,0,0.05)", fontSize: 14, background: "white", outline: "none" }} />
                <button type="submit" style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", background: "none", border: 0, color: "var(--primary)", fontWeight: 900, cursor: "pointer" }}>➤</button>
              </form>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => router.push("/war-room/new")} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "1px solid var(--line)", background: "white", color: "var(--muted)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Sair da Sala (sem encerrar)</button>
        {isHost && (
          <button onClick={handleEndRoom} style={{ width: "100%", padding: "14px", borderRadius: 16, border: 0, background: "rgba(185, 28, 28, 0.08)", color: "var(--danger)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Encerrar Sala de Guerra</button>
        )}
      </div>

      <style jsx>{`
        .war-room-grid { grid-template-columns: 1fr; }
        @media (min-width: 1024px) { .war-room-grid { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); } }
        .avatar-glow { position: absolute; inset: -20px; background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%); border-radius: 50%; animation: glow 3s infinite ease-in-out; }
        .wave-container { position: absolute; inset: -40px; display: grid; place-items: center; pointer-events: none; }
        .wave { position: absolute; width: 120px; height: 120px; border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; animation: wave-ripple 2s infinite ease-out; }
        .floating-reaction { position: absolute; bottom: 0; font-size: 24px; animation: float-up 4s forwards linear; pointer-events: none; z-index: 10; }
        .ctrl-btn { background: none; border: 0; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; color: white; transition: 0.2s; }
        .btn-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.15); display: grid; place-items: center; transition: 0.2s; }
        .btn-icon.active { background: white; color: #0f766e; }
        .ctrl-btn span { font-size: 10px; font-weight: 800; opacity: 0.7; }
        @keyframes glow { 0%, 100% { transform: scale(1); opacity: 0.2; } 50% { transform: scale(1.1); opacity: 0.4; } }
        @keyframes wave-ripple { from { transform: scale(1); opacity: 0.5; } to { transform: scale(2.5); opacity: 0; } }
        @keyframes float-up { 0% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(-400px) scale(1.5); opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }
        .focus-mode { height: auto !important; }
      `}</style>
    </div>
  );
}
