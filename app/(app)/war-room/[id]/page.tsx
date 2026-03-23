"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mic, MicOff, Users, MessageSquare, Hand, ChevronLeft,
  Clock, Loader2, Crown, Shield, Volume2, Share2, Copy, Check, X, MoreVertical
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Track } from "livekit-client";
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useTracks, useParticipants, BarVisualizer } from "@livekit/components-react";
import "@livekit/components-styles";
import dynamic from "next/dynamic";
import * as Toast from "@radix-ui/react-toast";
import * as Dialog from "@radix-ui/react-dialog";

import { useFeatures } from "@/hooks/use-features";

const WarRoomPage = dynamic(() => Promise.resolve(WarRoomPageInner), { ssr: false });
export default WarRoomPage;

function WarRoomPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const { isEnabled } = useFeatures();

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
  const [toastMsg, setToastMsg] = useState("");
  const [modTarget, setModTarget] = useState<{ id: string, name: string } | null>(null);
  const [isTimeEnded, setIsTimeEnded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isHost = currentUser?.id && room?.host_id && currentUser.id === room.host_id;
  const isPreRoom = room?.status === 'scheduled';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (room?.status === 'live' && room?.started_at) {
      const start = new Date(room.started_at).getTime();
      const maxMs = (room.max_duration_minutes || 60) * 60 * 1000;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((maxMs - (now - start)) / 1000));
      if (remaining <= 0) {
        setIsTimeEnded(true);
      }
    }
  }, [room]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const [lkToken, setLkToken] = useState("");
  const [isLoopbackOn, setIsLoopbackOn] = useState(false);
  const loopbackRef = useRef<HTMLAudioElement>(null);

  const timerRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔄 SINCRONISMO REALTIME GLOBAL
  useEffect(() => {
    if (!id || !currentUser) return;

    const channel = supabase
      .channel(`war-room-${id}`, {
        config: { presence: { key: currentUser.id } }
      })

      // 1. Monitorar Status (Encerramento)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'prayer_rooms', filter: `id=eq.${id}` }, (p: any) => {
        setRoom(p.new);
      })

      // 2. Chat Realtime
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayer_room_messages', filter: `room_id=eq.${id}` }, async (p: any) => {
        setMessages(prev => {
          if (prev.some(m => m.id === p.new.id)) return prev;

          const newMessage = {
            id: p.new.id,
            profile_id: p.new.profile_id,
            text: p.new.text,
            author: "Carregando...",
            time: new Date(p.new.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          };

          supabase.from("profiles").select("full_name").eq("id", p.new.profile_id).single().then(({ data }: any) => {
            if (data?.full_name) {
              setMessages(current => current.map(m => m.id === p.new.id ? { ...m, author: data.full_name } : m));
            }
          });

          return [...prev, newMessage];
        });
      })

      // 3. Reações Realtime 
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayer_room_reactions', filter: `room_id=eq.${id}` }, (p: any) => {
        if (!isEnabled('war_room_reactions')) return; // Controle via Dashboard

        const reactId = Date.now();
        setReactions(prev => [...prev, {
          id: reactId,
          icon: p.new.icon,
          left: Math.random() * 60 + 20,
          scatter: (Math.random() - 0.5) * 400
        }]);
        setTimeout(() => setReactions(prev => prev.filter(r => r.id !== reactId)), 4000);
      })

      // 4. Presença Online (Sempre 'VIVO')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeUsers = Object.values(state).flat() as any[];
        setParticipants(activeUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: any[] }) => {
        if (!isEnabled('war_room_presence')) return; // Controle via Dashboard

        newPresences.forEach((p: any) => {
          if (p.user_id !== currentUser?.id) {
            showToast(`🙏 ${p.name || "Alguém"} entrou para orar com você.`);
            setMessages(prev => [...prev, {
              id: `sys-join-${Date.now()}-${p.user_id}`,
              profile_id: 'system',
              text: `entrou na sala para interceder 🙏`,
              author: p.name || "Intercessor",
              time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              isSystem: true
            }]);
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: any[] }) => {
        if (!isEnabled('war_room_presence')) return; // Controle via Dashboard

        leftPresences.forEach((p: any) => {
          showToast(`🕊️ ${p.name || "Um irmão"} saiu da sala.`);
        });
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            name: currentUser.user_metadata?.full_name || "Membro",
            role: isHost ? 'host' : 'listener',
            is_muted: isMuted,
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
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setLoading(false);
          return;
        }
        setCurrentUser(user);
        
        if (user && id) {
        // LiveKit Audio Token
        const username = user.user_metadata?.full_name || user.email || "Membro";
        fetch(`/api/livekit?room=${id}&username=${encodeURIComponent(username)}`)
          .then(res => res.json())
          .then(data => { if (data.token) setLkToken(data.token); });

        setLoading(true);
        const { data: roomData, error: roomError } = await supabase.from("prayer_rooms").select(`*, host:profiles!host_id(full_name, username)`).eq("id", id).single();

        if (roomError || !roomData) {
          setLoading(false);
          return;
        }

        // 🛡️ VERIFICAÇÃO DE PRIVACIDADE PARA SALAS PRIVADAS
        if (roomData.is_private && roomData.host_id !== user.id) {
          const currentUsername = user.user_metadata?.username || user.email?.split('@')[0];
          const { data: invite } = await supabase
            .from('prayer_room_invites')
            .select('id')
            .eq('room_id', id)
            .eq('guest_username', currentUsername)
            .single();

          if (!invite) {
            alert("🔒 Esta é uma Sala de Guerra privada. Apenas intercessores convidados podem entrar.");
            router.push("/");
            return;
          }
        }

        // 🔒 VERIFICAÇÃO DE COMUNIDADE EXCLUSIVA
        if (roomData.community_id && roomData.host_id !== user.id) {
          const { data: membership } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', roomData.community_id)
            .eq('profile_id', user.id)
            .maybeSingle();

          if (!membership) {
            alert("⛪ Esta Sala de Guerra é exclusiva para membros desta comunidade.");
            router.push(`/communities/${roomData.community_id}`);
            return;
          }
        }

        setRoom(roomData);

        const { data: msgs } = await supabase.from("prayer_room_messages").select("*, profiles(full_name)").eq("room_id", id).order('created_at', { ascending: true }).limit(50);
        if (msgs) {
          setMessages(msgs.map((m: any) => ({
            id: m.id,
            profile_id: m.profile_id,
            text: m.text,
            author: m.profiles?.full_name || "Membro",
            time: new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          })));
        }
        setLoading(false);
        }
      } catch (err) {
        console.error("Auth lock error:", err);
        setLoading(false);
      }
    };
    init();
  }, [id, supabase, router]);

  // Timer
  useEffect(() => {
    if (room?.status === 'live' && room?.started_at) {
      timerRef.current = setInterval(() => {
        const start = new Date(room.started_at).getTime();
        const maxMs = (room.max_duration_minutes || 60) * 60 * 1000;
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((maxMs - (now - start)) / 1000));
        setTimeLeft(remaining);

        if (remaining === 30) showToast("⚠️ Faltam 30 segundos!");
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handleEndRoomAuto();
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [room]);

  const handleEndRoomAuto = async () => {
    const { error } = await supabase
      .from("prayer_rooms")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", id);
    
    if (error) {
      showToast("❌ Erro ao encerrar sala no altar.");
      console.error("Erro ao encerrar:", error);
    }
  };

  // 👥 SINCRONISMO DE CONTADOR (VIVO NO BANCO)
  useEffect(() => {
    if (!isHost || !room || room.status !== 'live' || !id) return;
    
    const syncCount = async () => {
      await supabase
        .from("prayer_rooms")
        .update({ current_viewers: participants.length })
        .eq("id", id);
    };

    const timer = setTimeout(syncCount, 2500); // Debounce leve para estabilidade
    return () => clearTimeout(timer);
  }, [participants.length, isHost, room?.status, id, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !currentUser) return;
    await supabase.from("prayer_room_messages").insert({ room_id: id, profile_id: currentUser.id, text: chatMsg.trim() });
    setChatMsg("");
  };

  const addReaction = async (icon: string) => {
    if (!currentUser) return;
    // Dispara a animação (via banco/realtime)
    await supabase.from("prayer_room_reactions").insert({ room_id: id, profile_id: currentUser.id, icon });
    // Envia o emoji para o chat
    await supabase.from("prayer_room_messages").insert({ room_id: id, profile_id: currentUser.id, text: icon });
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

  const handleRequestSpeak = async () => {
    if (!currentUser) return;
    
    // Verifica se já existe um pedido pendente no estado local de mensagens (minimalista)
    const alreadyRequested = messages.some(m => m.profile_id === currentUser.id && m.text.includes("✋"));
    
    if (alreadyRequested) {
      showToast("🙏 Você já enviou um pedido de fala. Aguarde o anfitrião.");
      return;
    }

    await supabase.from("prayer_room_messages").insert({ room_id: id, profile_id: currentUser.id, text: "✋ Estou pedindo permissão para falar." });
    showToast("Pedido de fala enviado! Aguarde o anfitrião.");
  };

  const handleMod = async (targetId: string | undefined, role: string) => {
    if (!isHost || !targetId || targetId === currentUser?.id) return;

    const { error } = await supabase
      .from("prayer_room_participants")
      .upsert({
        room_id: id,
        profile_id: targetId,
        role: role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'room_id,profile_id' } as any);

    if (error) {
      showToast("❌ Erro ao processar moderação.");
      return;
    }

    if (role === 'banned') showToast(`Usuário removido da sala.`);
    else if (role === 'speaker') showToast(`Microfone liberado.`);
    else if (role === 'listener') showToast(`Microfone desligado (Ouvinte).`);

    // 📢 BROADCAST: Notifica a sala sobre a mudança de permissão
    supabase.channel(`war-room-${id}`).send({
      type: 'broadcast',
      event: 'role-update',
      payload: { profile_id: targetId, role: role }
    });

    setModTarget(null);
  };


  if (!mounted || loading) return (
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
    <Toast.Provider swipeDirection="down">
      <Dialog.Root open={room?.status === 'ended' || isTimeEnded}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", animation: "fadeIn 0.2s" }} />
          <Dialog.Content style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#ffffff", width: "90%", maxWidth: 320, borderRadius: 28, padding: 32, textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", zIndex: 1001, outline: "none", animation: "float-up 0.3s forwards" }}>
            <div style={{ display: "inline-grid", placeItems: "center", width: 64, height: 64, background: "rgba(239, 68, 68, 0.1)", borderRadius: "50%", marginBottom: 16, color: "#ef4444" }}>
              <Shield size={32} />
            </div>
            <Dialog.Title style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 900, color: "#111827" }}>Sala Encerrada</Dialog.Title>
            <Dialog.Description style={{ margin: "0 0 24px", fontSize: 14, color: "#4b5563", lineHeight: 1.5, fontWeight: 500 }}>
              O tempo de oração desta Sala de Guerra foi concluído.
            </Dialog.Description>
            <button onClick={() => router.push("/")} style={{ width: "100%", background: "#ef4444", padding: "14px", border: "0", color: "#ffffff", borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "0.2s", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)" }}>Voltar para o Feed</button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
 
      {/* 🌑 OVERLAY PARA FECHAR MENU AO CLICAR FORA */}
      {modTarget && (
        <div 
          onClick={() => setModTarget(null)}
          style={{ position: "fixed", inset: 0, zIndex: 998, background: "transparent" }} 
        />
      )}

      {/* PAINEL DE MODERAÇÃO FOI REMOVIDO PARA USAR CONTROLE INLINE */}

      <LiveKitRoom
        video={false}
        audio={isHost}
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
                {room?.is_private && (
                  <span style={{ fontSize: 10, fontWeight: 900, background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: 100, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    🔒 PRIVADA
                  </span>
                )}
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
                    title="Testador de Áudio"
                  >
                    {isLoopbackOn ? <Volume2 size={20} className="shake" /> : <Volume2 size={20} />}
                  </button>
                  <MicButton
                    isHost={isHost}
                    participants={participants}
                    currentUser={currentUser}
                    id={id}
                    supabase={supabase}
                    showToast={showToast}
                  />
                  {!isHost && (
                    <button onClick={handleRequestSpeak} className="button" style={{ flex: 1, background: "rgba(255,255,255,0.2)" }}>✋ PEDIR P/ FALAR</button>
                  )}
                </div>

                <div style={{ background: "rgba(0,0,0,0.1)", padding: 20, borderRadius: 20 }}>
                  <h4 style={{ margin: 0 }}>{room.title}</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.7 }}>{room.description}</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", height: 500, borderRadius: 32, overflow: "hidden" }}>
              <div style={{ padding: 20, borderBottom: "1px solid var(--line)", background: "white", zIndex: 10 }}><strong>Chat ao Vivo</strong></div>
              <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                
                {/* ✋ PEDIDOS DE FALA (FLUTUANTE NO TOPO DO CHAT) */}
                {isHost && messages.filter(m => m.text.includes("✋")).length > 0 && (
                  <div style={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 50, padding: "16px", borderRadius: 20, background: "#fff7ed", border: "1px solid #ffedd5", boxShadow: "0 10px 25px rgba(251, 146, 60, 0.2)", animation: "float-up 0.3s forwards" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 18 }}>✋</span>
                      <p style={{ fontSize: 11, fontWeight: 900, color: "#9a3412", margin: 0, letterSpacing: "0.05em" }}>PEDIDOS DE FALA</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {messages.filter(m => m.text.includes("✋")).map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "8px 12px", borderRadius: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{m.author}</span>
                          <button onClick={() => handleMod(m.profile_id, 'speaker')} style={{ padding: "6px 12px", borderRadius: 10, background: "var(--primary)", color: "white", fontSize: 11, fontWeight: 800, border: 0, cursor: "pointer", transition: "0.2s" }}>Autorizar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {/* 👑 SEÇÃO DE PALCO (STAGING) - VIVO COM AUDIO */}
                <AltarParticipants 
                  participants={participants} 
                  isHost={isHost} 
                  currentUser={currentUser} 
                  setModTarget={setModTarget} 
                  modTarget={modTarget}
                  handleMod={handleMod}
                />


                {/* Chat Mensagens */}
                {messages.map((m: any, i: number) => {
                  if (m.isSystem) {
                    return (
                      <div key={i} style={{ textAlign: "center", margin: "8px 0", background: "rgba(0,0,0,0.02)", padding: "4px 12px", borderRadius: 100 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>✨ <strong>{m.author}</strong> {m.text}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={i} style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: "var(--line)", borderRadius: 8, display: "grid", placeItems: "center" }}>🙏</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <strong style={{ fontSize: 13 }}>{m.author}</strong>
                            <span style={{ fontSize: 10, opacity: 0.5 }}>{m.time}</span>
                          </div>
                          {isHost && m.profile_id !== currentUser?.id && (
                            <div style={{ position: "relative" }}>
                              <button 
                                  onClick={() => setModTarget(modTarget?.id === m.profile_id ? null : { id: m.profile_id, name: m.author })}
                                  style={{ background: "none", border: 0, padding: 4, color: "var(--muted)", cursor: "pointer", display: "flex" }}
                              >
                                <MoreVertical size={14} />
                              </button>
                              {modTarget?.id === m.profile_id && (
                                <div style={{ position: "absolute", top: "100%", right: 0, background: "white", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", borderRadius: 12, padding: 8, zIndex: 999, display: "flex", flexDirection: "column", gap: 4, minWidth: 140, border: "1px solid var(--line)" }}>
                                  <button onClick={() => handleMod(m.profile_id, 'speaker')} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, border: 0, background: "none", fontSize: 13, fontWeight: 700, color: "var(--primary)", cursor: "pointer" }}>Autorizar Voz</button>
                                  <button onClick={() => handleMod(m.profile_id, 'listener')} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, border: 0, background: "none", fontSize: 13, fontWeight: 700, color: "#6b7280", cursor: "pointer" }}>Tirar Voz</button>
                                  <button onClick={() => handleMod(m.profile_id, 'banned')} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, border: 0, background: "none", fontSize: 13, fontWeight: 700, color: "#ef4444", cursor: "pointer", borderTop: "1px solid var(--line)" }}>Expulsar</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 13 }}>{m.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
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
        </div>

        {/* ÁUDIO DE RETORNO (RESTAURADO) */}
          <audio ref={loopbackRef} autoPlay style={{ display: "none" }} />

          {/* 🚪 CONTROLES DE ENCERRAMENTO (RESTAURADOS) */}
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => router.push("/")} className="button secondary" style={{ width: "100%", background: "white" }}>Sair da Sala (sem encerrar)</button>
            {isHost && (
              <button 
                onClick={() => { if(confirm("Deseja realmente encerrar esta Sala de Guerra para todos?")) handleEndRoomAuto(); }} 
                className="button danger" 
                style={{ width: "100%" }}
              >
                Encerrar Sala de Guerra
              </button>
            )}
          </div>

          {/* TOAST SYSTEM (RADIX UI) */}
          <Toast.Root open={!!toastMsg} onOpenChange={(o) => !o && setToastMsg("")} style={{ background: "#111827", color: "white", padding: "12px 24px", borderRadius: 100, fontWeight: 800, fontSize: 13, boxShadow: "0 10px 25px rgba(0,0,0,0.2)", animation: "float-up 0.3s forwards" }}>
            <Toast.Description>{toastMsg}</Toast.Description>
          </Toast.Root>

          <Toast.Viewport style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, outline: "none", margin: 0, padding: 0, listStyle: "none" }} />


          <style dangerouslySetInnerHTML={{ __html: `
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
          ` }} />
        </div>
      </LiveKitRoom>
    </Toast.Provider>
  );
}

function AltarParticipants({ participants, isHost, currentUser, setModTarget, modTarget, handleMod }: any) {
  const lkParticipants = useParticipants();
  const { isEnabled } = useFeatures();

  const onstage = participants.filter((p: any) => p.role === 'host' || p.role === 'speaker');

  if (onstage.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 9, fontWeight: 900, color: "var(--primary)", marginBottom: 8, letterSpacing: "0.05em" }}>👑 NO ALTAR</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {onstage.map((p: any, i: number) => {
          // Busca o participante correspondente no LiveKit pela identidade (nome ou username)
          const lkP = lkParticipants.find(lp => lp.identity === p.name);
          const isSpeaking = lkP?.isSpeaking && isEnabled('war_room_speaking_indicator');

          return (
            <div key={i} style={{ 
              padding: "4px 12px", borderRadius: 12, 
              background: isSpeaking ? "var(--primary)" : "var(--primary-soft)", 
              color: isSpeaking ? "white" : "inherit",
              border: `2px solid ${isSpeaking ? "white" : "var(--primary)"}`, 
              fontSize: 11, fontWeight: 800, 
              display: "flex", alignItems: "center", gap: 8,
              transition: "var(--transition)",
              boxShadow: isSpeaking ? "0 0 15px var(--primary)" : "none",
              animation: isSpeaking ? "audio-pulse 1.5s infinite" : "none"
            }}>
              {p.role === 'host' ? <Crown size={12} /> : <Mic size={12} />} 
              {p.name}
              {isSpeaking && <span style={{ fontSize: 8 }}>● FALANDO</span>}
              
              {isHost && p.user_id !== currentUser?.id && (
                <div style={{ position: "relative", marginLeft: 4 }}>
                  <button 
                    onClick={() => setModTarget(modTarget?.id === p.user_id ? null : { id: p.user_id, name: p.name })}
                    style={{ background: "none", border: 0, padding: 0, color: "inherit", cursor: "pointer", display: "flex", opacity: 0.6 }}
                  >
                    <MoreVertical size={14} />
                  </button>
                  {modTarget?.id === p.user_id && (
                    <div style={{ position: "absolute", top: "100%", right: 0, background: "white", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", borderRadius: 12, padding: 8, zIndex: 999, display: "flex", flexDirection: "column", gap: 4, minWidth: 140, border: "1px solid var(--line)" }}>
                      <button onClick={() => handleMod(p.user_id, 'speaker')} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, border: 0, background: "none", fontSize: 13, fontWeight: 700, color: "var(--primary)", cursor: "pointer" }}>Autorizar Voz</button>
                      <button onClick={() => handleMod(p.user_id, 'listener')} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, border: 0, background: "none", fontSize: 13, fontWeight: 700, color: "#6b7280", cursor: "pointer" }}>Tirar Voz</button>
                      <button onClick={() => handleMod(p.user_id, 'banned')} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, border: 0, background: "none", fontSize: 13, fontWeight: 700, color: "#ef4444", cursor: "pointer", borderTop: "1px solid var(--line)" }}>Expulsar</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HostAudioDisplay() {
  const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* AVATAR DO ANFITRIÃO */}
      <div className={tracks.length > 0 ? "audio-active" : ""} style={{ width: 120, height: 120, borderRadius: "50%", border: "4px solid rgba(255, 255, 255, 0.4)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, background: "rgba(255, 255, 255, 0.1)" }}>
        <Users size={64} style={{ opacity: 0.2 }} />
        <RoomAudioRenderer />
      </div>

      {/* ONDAS SONORAS REPOSICIONADAS */}
      <div style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", opacity: tracks.length > 0 ? 0.8 : 0, transition: "opacity 0.3s" }}>
        {tracks.length > 0 && (
          <BarVisualizer trackRef={tracks[0] as any} barCount={15} style={{ height: '100%', display: "flex", gap: 6, alignItems: "center" }} />
        )}
      </div>
    </div>
  );
}

function MicButton({ isHost, participants, currentUser, id, supabase, showToast }: any) {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const [canSpeak, setCanSpeak] = useState(isHost);

  // 1. Verificar permissão inicial (Proteção contra 406)
  useEffect(() => {
    if (isHost || !currentUser?.id || !id) return;
    
    let isMounted = true;
    const checkPermission = async () => {
      const { data, error } = await supabase
        .from('prayer_room_participants')
        .select('role')
        .eq('room_id', id)
        .eq('profile_id', currentUser.id)
        .maybeSingle(); // maybeSingle evita o erro 406 se não houver registro

      if (isMounted && data && ['moderator', 'speaker'].includes(data.role)) {
        setCanSpeak(true);
      }
    };
    checkPermission();
    return () => { isMounted = false; };
  }, [id, currentUser?.id, isHost, supabase]);

  // 2. Ouvir mudanças em tempo real (Broadcast e Postgres)
  useEffect(() => {
    if (isHost || !currentUser?.id || !id) return;
    
    const channel = supabase.channel(`war-room-mic-${currentUser.id}`)
      .on('broadcast', { event: 'role-update' }, (payload: any) => {
        if (payload.payload.profile_id === currentUser.id) {
          const role = payload.payload.role;
          if (role === 'speaker') setCanSpeak(true);
          if (role === 'listener') {
             setCanSpeak(false);
             localParticipant?.setMicrophoneEnabled(false);
          }
          if (role === 'banned') window.location.href = '/';
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_room_participants', filter: `room_id=eq.${id}` }, (payload: any) => {
        if (payload.new?.profile_id === currentUser.id) {
          const role = payload.new.role;
          if (role === 'speaker') setCanSpeak(true);
          if (role === 'listener') {
            setCanSpeak(false);
            localParticipant?.setMicrophoneEnabled(false);
          }
          if (role === 'banned') window.location.href = '/';
        }
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); }
  }, [id, currentUser, isHost, localParticipant, supabase]);

  const handleMicToggle = async () => {
    if (!canSpeak) {
      showToast("⚠️ O anfitrião ainda não liberou seu microfone nesta sala.");
      return;
    }

    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      await supabase.from("prayer_room_participants")
        .update({ is_muted: isMicrophoneEnabled })
        .eq("room_id", id)
        .eq("profile_id", currentUser?.id);
    } catch (err) {
      showToast("❌ Erro ao acessar microfone.");
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
