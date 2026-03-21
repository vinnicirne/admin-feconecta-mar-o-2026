"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Mic, MicOff, Users, MessageSquare, Hand, ChevronLeft, 
  Clock, Loader2, Crown, Shield, Volume2, Share2, Copy, Check
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Track } from "livekit-client";
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useTracks, AudioVisualizer } from "@livekit/components-react";
import "@livekit/components-styles";
import dynamic from "next/dynamic";

const WarRoomPage = dynamic(() => Promise.resolve(WarRoomPageInner), { ssr: false });
export default WarRoomPage;

function WarRoomPageInner() {
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
  const [reactions, setReactions] = useState<{ id: number; icon: string; left: number; scatter: number }[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [pinnedPrayer, setPinnedPrayer] = useState<string | null>("Minha família precisa de oração");
  
  const [lkToken, setLkToken] = useState("");
  const [isLoopbackOn, setIsLoopbackOn] = useState(false);
  const loopbackRef = useRef<HTMLAudioElement>(null);

  const timerRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 🔄 SINCRONISMO REALTIME GLOBAL
  useEffect(() => {
    if (!id || !currentUser) return;

    const channel = supabase
      .channel(`war-room-${id}`, {
        config: { presence: { key: currentUser.id } }
      })
      
      // 1. Monitorar Status (Encerramento)
      .on('postgres_changes', { event: 'UPDATE', table: 'prayer_rooms', filter: `id=eq.${id}` }, (p: any) => {
        if (p.new.status === 'ended') {
          alert("⚠️ A Sala de Guerra foi encerrada.");
          router.push("/");
        }
        setRoom(p.new);
      })

      // 2. Chat Realtime
      .on('postgres_changes', { event: 'INSERT', table: 'prayer_room_messages', filter: `room_id=eq.${id}` }, async (p: any) => {
        setMessages(prev => {
          if (prev.some(m => m.id === p.new.id)) return prev;
          
          const newMessage = {
            id: p.new.id,
            text: p.new.text,
            author: "Carregando...",
            time: new Date(p.new.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          };

          supabase.from("profiles").select("full_name").eq("id", p.new.profile_id).single().then(({data}: any) => {
            if (data?.full_name) {
              setMessages(current => current.map(m => m.id === p.new.id ? { ...m, author: data.full_name } : m));
            }
          });

          return [...prev, newMessage];
        });
      })

      // 3. Reações Realtime 
      .on('postgres_changes', { event: 'INSERT', table: 'prayer_room_reactions', filter: `room_id=eq.${id}` }, (p: any) => {
        const reactId = Date.now();
        setReactions(prev => [...prev, { 
          id: reactId, 
          icon: p.new.icon, 
          left: Math.random() * 60 + 20, 
          scatter: (Math.random() - 0.5) * 400 
        }]);
        setTimeout(() => setReactions(prev => prev.filter(r => r.id !== reactId)), 4000);
      })

      // 4. Presença Online
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeUsers = Object.values(state).flat() as any[];
        setParticipants(activeUsers);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            user_id: currentUser.id, 
            name: currentUser.user_metadata?.full_name || "Membro",
            online_at: new Date().toISOString() 
          });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [id, currentUser, router, supabase]);

  // 🎧 LÓGICA DE RETORNO (TESTAR ÁUDIO LOCAL)
  useEffect(() => {
    if (isLoopbackOn && typeof window !== 'undefined') {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        if (loopbackRef.current) {
          loopbackRef.current.srcObject = stream;
        }
      }).catch(() => setIsLoopbackOn(false));
    } else if (loopbackRef.current) {
      loopbackRef.current.srcObject = null;
    }
  }, [isLoopbackOn]);

  // Carregar dados iniciais e LiveKit Token
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user && id) {
        // LiveKit Audio Token
        const username = user.user_metadata?.full_name || user.email || "Membro";
        fetch(`/api/livekit?room=${id}&username=${encodeURIComponent(username)}`)
          .then(res => res.json())
          .then(data => { if (data.token) setLkToken(data.token); });

        setLoading(true);
        const { data: roomData } = await supabase.from("prayer_rooms").select(`*, host:profiles!host_id(full_name, username)`).eq("id", id).single();
        setRoom(roomData);
        
        const { data: msgs } = await supabase.from("prayer_room_messages").select("*, profiles(full_name)").eq("room_id", id).order('created_at', { ascending: true }).limit(50);
        if (msgs) {
          setMessages(msgs.map((m: any) => ({
            id: m.id,
            text: m.text,
            author: m.profiles?.full_name || "Membro",
            time: new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          })));
        }
        setLoading(false);
      }
    };
    init();
  }, [id, supabase]);

  // Timer
  useEffect(() => {
    if (room?.status === 'live' && room?.started_at) {
      timerRef.current = setInterval(() => {
        const start = new Date(room.started_at).getTime();
        const maxMs = (room.max_duration_minutes || 60) * 60 * 1000;
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((maxMs - (now - start)) / 1000));
        setTimeLeft(remaining);

        if (remaining === 30) alert("⚠️ Faltam 30 segundos!");
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handleEndRoomAuto();
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [room]);

  const handleEndRoomAuto = async () => {
    await supabase.from("prayer_rooms").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", id);
    router.push("/");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !currentUser) return;
    await supabase.from("prayer_room_messages").insert({ room_id: id, profile_id: currentUser.id, text: chatMsg.trim() });
    setChatMsg("");
  };

  const addReaction = async (icon: string) => {
    if (!currentUser) return;
    await supabase.from("prayer_room_reactions").insert({ room_id: id, profile_id: currentUser.id, icon });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/war-room/${id}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: "Sala de Guerra", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = currentUser?.id && room?.host_id && currentUser.id === room.host_id;
  const isPreRoom = room?.status === 'scheduled';

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <Loader2 size={32} className="spin muted" />
    </div>
  );

  if (!room) return (
    <div style={{ textAlign: "center", padding: 64 }}>
      <p className="muted">Sala não encontrada.</p>
      <button onClick={() => router.push("/")} className="button" style={{ marginTop: 24 }}>Voltar</button>
    </div>
  );

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={lkToken}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      onDisconnected={() => setLkToken("")}
      connect={!!lkToken}
    >
      <div style={{ padding: "24px 40px 120px", width: "100%", margin: "0" }}>
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: 0, cursor: "pointer" }}><ChevronLeft /></button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: isPreRoom ? "var(--primary)" : "#ef4444", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isPreRoom ? "var(--primary)" : "#ef4444", animation: "pulse 1.5s infinite" }} />
                {isPreRoom ? "PRÓXIMA VIGÍLIA" : "AO VIVO AGORA"}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>• <Users size={14} /> {participants.length} seguidores</span>
            </div>
          </div>
          <button onClick={handleShare} className="button secondary small">{copied ? <Check size={14} /> : <Share2 size={14} />}</button>
        </div>

        <div className="war-room-grid">
          {/* CARD PRINCIPAL */}
          <div className="card" style={{ padding: 32, background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)", color: "white", borderRadius: 32, position: "relative", overflow: "hidden" }}>
            {reactions.map(r => (
              <div key={r.id} className="floating-reaction" style={{ left: `${r.left}%`, '--scatter': r.scatter } as any}>{r.icon}</div>
            ))}

            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
                <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", borderRadius: 12, display: "grid", placeItems: "center" }}><Crown size={20} /></div>
                <div><p style={{ margin: 0, fontSize: 10, opacity: 0.7 }}>Anfitrião</p><strong>{room.host?.full_name}</strong></div>
              </div>

              <div style={{ textAlign: "center", margin: "48px 0" }}>
                {isPreRoom ? (
                  <div>
                    <p className="muted" style={{ color: "rgba(255,255,255,0.6)" }}>INICIA EM</p>
                    <h1 style={{ fontSize: 48, fontWeight: 900 }}>{new Date(room.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h1>
                  </div>
                ) : (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <HostAudioDisplay />

                    <h3 style={{ marginTop: 20 }}>{room.host?.full_name?.split(' ')[0]}</h3>
                    <p style={{ opacity: 0.8 }}><Volume2 size={16} /> Orando agora...</p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, margin: "32px 0" }}>
                <button 
                  onClick={() => setIsLoopbackOn(!isLoopbackOn)}
                  className="button"
                  style={{ width: 56, height: 56, padding: 0, flexShrink: 0, background: isLoopbackOn ? "#fbbf24" : "rgba(255,255,255,0.2)", color: "white" }}
                  title="Testar meu fone"
                >
                  {isLoopbackOn ? <Volume2 size={20} className="shake" /> : <Shield size={20} />}
                </button>
                <MicButton 
                  isHost={isHost} 
                  participants={participants} 
                  currentUser={currentUser} 
                  id={id}
                  supabase={supabase}
                />
                <button className="button" style={{ flex: 1, background: "rgba(255,255,255,0.2)" }}>🙏 PARTICIPAR</button>
              </div>

              <div style={{ background: "rgba(0,0,0,0.1)", padding: 20, borderRadius: 20 }}>
                <h4 style={{ margin: 0 }}>{room.title}</h4>
                <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.7 }}>{room.description}</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", height: 500, borderRadius: 32 }}>
            <div style={{ padding: 20, borderBottom: "1px solid var(--line)" }}><strong>Chat ao Vivo</strong></div>
            <div ref={chatScrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: "var(--line)", borderRadius: 8, display: "grid", placeItems: "center" }}>🙏</div>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <strong style={{ fontSize: 13 }}>{m.author}</strong>
                      <span style={{ fontSize: 10, opacity: 0.5 }}>{m.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13 }}>{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, padding: "12px 20px", borderTop: "1px solid var(--line)", background: "var(--line)", justifyContent: "center" }}>
              {["🙏", "❤️", "🔥", "🙌"].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addReaction(emoji)}
                  style={{ fontSize: 24, background: "none", border: 0, cursor: "pointer", transition: "transform 0.2s" }}
                  title="Enviar Reação"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: "0 20px 20px", background: "var(--line)" }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Escreva uma oração..." style={{ width: "100%", padding: 12, borderRadius: 12, border: 0, outline: "none" }} />
            </form>
          </div>
        </div>

        {/* ÁUDIO DE RETORNO (RESTAURADO) */}
        <audio ref={loopbackRef} autoPlay style={{ display: "none" }} />

        {/* 🚪 CONTROLES DE ENCERRAMENTO (RESTAURADOS) */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => router.push("/")} className="button secondary" style={{ width: "100%", background: "white" }}>Sair da Sala (sem encerrar)</button>
          {isHost && (
            <button onClick={handleEndRoomAuto} className="button danger" style={{ width: "100%" }}>Encerrar Sala de Guerra</button>
          )}
        </div>

        <style jsx>{`
          .war-room-grid { display: grid; grid-template-columns: 1fr; gap: 20px; padding: 0 16px; }
          @media (min-width: 1024px) { 
            .war-room-grid { 
              grid-template-columns: 1.6fr 1fr; 
              gap: 40px; 
            } 
          }
          .audio-active { animation: audio-pulse 1.5s infinite; }
          @keyframes audio-pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
            100% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
          }
          .shake { animation: shake 0.5s infinite linear; }
          @keyframes shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }
          .floating-reaction { position: absolute; bottom: 0; font-size: 24px; animation: float-up 4s forwards linear; }
          @keyframes float-up {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translate(calc(var(--scatter) * 1px), -500px) scale(2); opacity: 0; }
          }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
      </div>
    </LiveKitRoom>
  );
}

function HostAudioDisplay() {
  const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }]);
  
  return (
    <>
      {/* ONDAS SONORAS (VISUALIZADOR) */}
      <div style={{ position: "absolute", top: -20, left: -40, right: -40, bottom: -20, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 1 }}>
         {tracks[0]?.trackRef && (
           <AudioVisualizer trackRef={tracks[0].trackRef} barCount={15} gap={4} height={130} />
         )}
      </div>

      <div className={tracks.length > 0 ? "audio-active" : ""} style={{ width: 120, height: 120, borderRadius: "50%", border: "4px solid white", overflow: "hidden", margin: "0 auto", position: "relative", zIndex: 2 }}>
        <Users size={64} style={{ opacity: 0.2, marginTop: 20 }} />
        <RoomAudioRenderer />
      </div>
    </>
  );
}

function MicButton({ isHost, participants, currentUser, id, supabase }: any) {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  const handleMicToggle = async () => {
    const myPart = participants.find((p: any) => p.profile_id === currentUser?.id);
    const canSpeak = isHost || ['moderator', 'speaker'].includes(myPart?.role);
    
    if (!canSpeak) {
      alert("⚠️ Apenas o anfitrião e moderadores podem ativar o microfone nesta sala.");
      return;
    }

    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      await supabase.from("prayer_room_participants")
        .update({ is_muted: isMicrophoneEnabled })
        .eq("room_id", id)
        .eq("profile_id", currentUser?.id);
    } catch (err) {
      alert("❌ Erro ao acessar microfone.");
    }
  };

  return (
    <button 
      className="button" 
      style={{ flex: 1, height: 56, background: "white", color: "#0f766e" }}
      onClick={handleMicToggle}
    >
      {isMicrophoneEnabled ? <Mic /> : <MicOff />} 
      {isMicrophoneEnabled ? "FALAR" : "MUTADO"}
    </button>
  );
}
