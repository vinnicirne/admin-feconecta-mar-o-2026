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
  const [elapsed, setElapsed] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPraying, setIsPraying] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadRoom();
    loadUser();
  }, [id]);

  // Timer da sessão
  useEffect(() => {
    if (room?.started_at) {
      timerRef.current = setInterval(() => {
        const start = new Date(room.started_at).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
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
    router.push("/");
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
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 120px" }}>

      {/* Header da Sala */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--muted)", display: "grid", placeItems: "center" }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: "#ef4444" }}>AO VIVO</span>
            <span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>• {formatTime(elapsed)}</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 900, margin: "4px 0 0" }}>{room.title}</h1>
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

      {/* Card Principal da Sala */}
      <div className="card" style={{ padding: 32, marginBottom: 20, background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)", color: "white", border: 0 }}>
        
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

        {/* Descrição */}
        {room.description && (
          <p style={{ margin: "0 0 24px", opacity: 0.85, fontSize: 14, lineHeight: 1.6 }}>{room.description}</p>
        )}

        {/* Controles de Áudio */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <button
            onClick={() => setIsMuted(m => !m)}
            style={{
              width: 64, height: 64, borderRadius: "50%", border: 0, cursor: "pointer",
              background: isMuted ? "rgba(255,255,255,0.15)" : "white",
              color: isMuted ? "rgba(255,255,255,0.6)" : "var(--primary)",
              display: "grid", placeItems: "center", transition: "0.2s"
            }}
          >
            {isMuted ? <MicOff size={26} /> : <Mic size={26} />}
          </button>

          <button
            onClick={() => setIsPraying(p => !p)}
            style={{
              padding: "0 28px", height: 64, borderRadius: 100, border: 0, cursor: "pointer",
              background: isPraying ? "white" : "rgba(255,255,255,0.2)",
              color: isPraying ? "var(--primary)" : "white",
              fontWeight: 900, fontSize: 16, transition: "0.2s"
            }}
          >
            🙏 {isPraying ? "Orando..." : "Estou Orando"}
          </button>

          <button
            onClick={() => alert("Solicitação enviada ao anfitrião.")}
            style={{
              width: 64, height: 64, borderRadius: "50%", border: 0, cursor: "pointer",
              background: "rgba(255,255,255,0.15)", color: "white",
              display: "grid", placeItems: "center", transition: "0.2s"
            }}
          >
            <Hand size={26} />
          </button>
        </div>

        {/* Legenda dos controles */}
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 10, opacity: 0.6 }}>
          <span style={{ fontSize: 10, fontWeight: 700 }}>{isMuted ? "Mutado" : "Transmitindo"}</span>
          <span style={{ fontSize: 10, fontWeight: 700 }}>Oração</span>
          <span style={{ fontSize: 10, fontWeight: 700 }}>Pedir Fala</span>
        </div>
      </div>

      {/* Chat de texto */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
          <MessageSquare size={16} className="muted" />
          <strong style={{ fontSize: 14 }}>Chat da Sala</strong>
        </div>

        <div style={{ height: 200, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 ? (
            <p className="muted" style={{ fontSize: 13, textAlign: "center", margin: "auto" }}>Seja o primeiro a enviar uma mensagem 🙏</p>
          ) : messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--primary-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Volume2 size={14} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <strong style={{ fontSize: 13 }}>{msg.author}</strong>
                  <span className="muted" style={{ fontSize: 10 }}>{msg.time}</span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 13 }}>{msg.text}</p>
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

      {/* Sair da sala (qualquer usuário) ou Encerrar (apenas host) */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Qualquer pessoa pode SAIR sem encerrar */}
        <button
          onClick={() => router.push("/")}
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
