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
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadRoom();
    loadUser();
  }, [id]);

  // Timer da sessão (Regressivo)
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
    // Não redirecionar aqui - o layout já protege a auth
    // Redirect aqui causava expulsão por user=null transitório na hidratação
    setCurrentUser(user);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/war-room/${id}`;
    const shareData = {
      title: room?.title || "Sala de Guerra - FéConecta",
      text: `🙏 Junte-se à nossa oração ao vivo: "${room?.title}"\n\nAcesse o link e participe (é necessário ter uma conta no FéConecta):`,
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
      // fallback silencioso
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
        .select(`
          *,
          host:profiles!host_id(full_name, username)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setRoom(data);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
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
    await supabase
      .from("prayer_rooms")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", id);
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

  const isHost = currentUser?.id === room?.host_id;

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

      {/* Header da Sala */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--muted)", display: "grid", placeItems: "center" }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: "#ef4444" }}>AO VIVO</span>
          </div>
        </div>
        {/* 🔗 BOTÃO COMPARTILHAR */}
        <button
          onClick={handleShare}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px", borderRadius: 100, border: 0, cursor: "pointer",
            background: copied ? "rgba(16, 185, 129, 0.1)" : "var(--primary-soft)",
            color: copied ? "#10b981" : "var(--primary)",
            fontWeight: 800, fontSize: 12, transition: "0.2s", whiteSpace: "nowrap"
          }}
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          {copied ? "Copiado!" : "Compartilhar"}
        </button>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: 24,
        alignItems: "stretch"
      }}>
        {/* Card Principal da Sala */}
        <div className="card" style={{ padding: 32, margin: 0, background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)", color: "white", border: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Host */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center" }}>
                <Crown size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>ANFITRIÃO</p>
                <strong style={{ fontSize: 15 }}>{room.host?.full_name || "Líder"}</strong>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, opacity: 0.8 }}>
                <Users size={14} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{room.current_viewers || 1} orando</span>
              </div>
            </div>

            {/* CONTROLES (CENTRO DO CARD) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 32, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
               {/* Mute */}
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => setIsMuted(m => !m)}
                    style={{
                      width: 56, height: 56, borderRadius: "50%", border: 0, cursor: "pointer",
                      background: isMuted ? "rgba(255,255,255,0.15)" : "white",
                      color: isMuted ? "rgba(255,255,255,0.6)" : "var(--primary)",
                      display: "grid", placeItems: "center", transition: "0.2s"
                    }}
                  >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                  <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.6 }}>{isMuted ? "MUTADO" : "AO VIVO"}</span>
               </div>

               {/* Oração */}
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => setIsPraying(p => !p)}
                    style={{
                      padding: "0 24px", height: 56, borderRadius: 100, border: 0, cursor: "pointer",
                      background: isPraying ? "white" : "rgba(255,255,255,0.2)",
                      color: isPraying ? "var(--primary)" : "white",
                      fontWeight: 900, fontSize: 14, transition: "0.2s"
                    }}
                  >
                    🙏 {isPraying ? "Orando..." : "Estou Orando"}
                  </button>
                  <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.6 }}>ORAÇÃO</span>
               </div>

               {/* Pedir Fala */}
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => alert("Solicitação enviada ao anfitrião.")}
                    style={{
                      width: 56, height: 56, borderRadius: "50%", border: 0, cursor: "pointer",
                      background: "rgba(255,255,255,0.15)", color: "white",
                      display: "grid", placeItems: "center", transition: "0.2s"
                    }}
                  >
                    <Hand size={22} />
                  </button>
                  <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.6 }}>PEDIR FALA</span>
               </div>
            </div>

            {/* INFO DA SALA (BASE DO CARD) */}
            <div style={{ marginTop: 8 }}>
               <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>{room.title}</h2>
               {room.description && (
                 <p style={{ margin: "0 0 24px", opacity: 0.8, fontSize: 14, lineHeight: 1.6, maxWidth: "90%" }}>{room.description}</p>
               )}

               <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 40 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, opacity: 0.6, fontWeight: 800, textTransform: "uppercase" }}>Tempo Restante</p>
                    <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "monospace", letterSpacing: "-0.05em", color: "white", marginTop: 4 }}>
                       {formatTime(timeLeft)}
                    </div>
                  </div>
                  <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 11, opacity: 0.6, fontWeight: 800, textTransform: "uppercase" }}>Duração Prevista</p>
                    <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 900, color: "white" }}>
                       {room.max_duration_minutes >= 60 ? `${room.max_duration_minutes / 60}h` : `${room.max_duration_minutes}m`}
                    </p>
                  </div>
                  <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 11, opacity: 0.6, fontWeight: 800, textTransform: "uppercase" }}>Status</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 900, background: "white", color: "#0f766e", padding: "6px 12px", borderRadius: 100, display: "inline-block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Intercessão Ativa</p>
                  </div>
               </div>
            </div>
          </div>

          <div>
            {/* O bloco inferior ficará vazio ou com alguma outra info secundária se necessário */}
          </div>
        </div>

        {/* Chat de texto */}
        <div className="card shadow-sm" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <MessageSquare size={16} className="muted" />
            <strong style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Intercessão em Tempo Real</strong>
          </div>

          <div style={{ flex: 1, height: "calc(100vh - 400px)", minHeight: 400, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center" }}>
                 <p className="muted" style={{ fontSize: 13 }}>Seja o primeiro a enviar uma mensagem 🙏</p>
              </div>
            ) : messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--primary-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Volume2 size={14} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <strong style={{ fontSize: 13 }}>{msg.author}</strong>
                    <span className="muted" style={{ fontSize: 10 }}>{msg.time}</span>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: 13, lineHeight: 1.5 }}>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", display: "flex", gap: 10 }}>
            <input
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              placeholder="Escreva uma oração..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13, background: "var(--line)" }}
            />
            <button type="submit" className="button" style={{ padding: "10px 18px", borderRadius: 12, fontSize: 13 }}>
              Enviar
            </button>
          </form>
        </div>
      </div>

      {/* Sair da sala (qualquer usuário) ou Encerrar (apenas host) */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Qualquer pessoa pode SAIR sem encerrar */}
        <button
          onClick={() => router.push("/war-room/new")}
          style={{
            width: "100%", padding: "14px", borderRadius: 16, border: "1px solid var(--line)",
            background: "white", color: "var(--muted)",
            fontWeight: 700, fontSize: 14, cursor: "pointer"
          }}
        >
          Sair da Sala (sem encerrar)
        </button>

        {/* Apenas o HOST pode ENCERRAR a sala */}
        {isHost && (
          <button
            onClick={handleEndRoom}
            style={{
              width: "100%", padding: "14px", borderRadius: 16, border: 0,
              background: "rgba(185, 28, 28, 0.08)", color: "var(--danger)",
              fontWeight: 800, fontSize: 14, cursor: "pointer"
            }}
          >
            Encerrar Sala de Guerra
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
