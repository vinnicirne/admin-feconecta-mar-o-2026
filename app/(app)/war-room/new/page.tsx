"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic2, Clock, Users, ChevronLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewWarRoomPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feedCopy, setFeedCopy] = useState("");
  const [duration, setDuration] = useState(60);
  const [isCreating, setIsCreating] = useState(false);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'create'>('live');
  
  // Agendamento
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [verseBase, setVerseBase] = useState("");

  useEffect(() => {
    fetchActiveRooms();
    fetchUser();
  }, []);

  // Se houver salas ativas, começar na aba 'live'. Se não, começar na 'create'.
  useEffect(() => {
    if (!loadingRooms) {
      setActiveTab(activeRooms.length > 0 ? 'live' : 'create');
    }
  }, [loadingRooms, activeRooms.length]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchActiveRooms = async () => {
    try {
      setLoadingRooms(true);
      const { data } = await supabase
        .from('prayer_rooms')
        .select('*, host:profiles(full_name)')
        .in('status', ['live', 'scheduled'])
        .order('scheduled_for', { ascending: true })
        .order('started_at', { ascending: false });
      setActiveRooms(data || []);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleEndRoom = async (roomId: string) => {
    if (!confirm("Deseja realmente encerrar esta sala de oração?")) return;
    try {
      const { error } = await supabase
        .from("prayer_rooms")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", roomId);
      
      if (error) throw error;
      fetchActiveRooms(); // Atualiza a lista
    } catch (err: any) {
      alert(`Erro ao encerrar sala: ${err.message}`);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Dê um título para a sala de oração.");
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const scheduledTimestamp = isScheduled ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : new Date().toISOString();

      const { data, error } = await supabase
        .from("prayer_rooms")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          host_id: user.id,
          status: isScheduled ? "scheduled" : "live",
          max_duration_minutes: duration,
          is_scheduled: isScheduled,
          scheduled_for: isScheduled ? scheduledTimestamp : null,
          started_at: isScheduled ? null : new Date().toISOString(),
          verse_base: verseBase.trim() || null,
          livekit_room_name: `war-room-${user.id}-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      // 📢 PUBLICAÇÃO AUTOMÁTICA NO FEED (Para convocar a comunidade)
      const typeLabel = isScheduled ? '📅 AGENDADO' : '🚨 AGORA';
      const timeLabel = isScheduled ? `para ${new Date(scheduledTimestamp).toLocaleString('pt-BR')}` : 'imediatamente';
      const defaultCopy = `${typeLabel}: Acabei de convocar uma Sala de Guerra ${timeLabel}! TEMA: "${title.trim()}". 🙏`;
      
      await supabase.from('posts').insert([{
        profile_id: user.id,
        content: feedCopy.trim() || defaultCopy,
        post_type: 'oracao',
        background_style: isScheduled ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' : 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
        is_bold: true,
        metadata: { war_room_id: data.id }
      }]);

      if (!isScheduled) {
        router.push(`/war-room/${data.id}`);
      } else {
        alert("Sala agendada com sucesso! Ela aparecerá na lista de eventos futuros.");
        setActiveTab('live');
        fetchActiveRooms();
        setTitle("");
        setDescription("");
        setVerseBase("");
      }
    } catch (err: any) {
      alert(`Erro ao criar sala: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ padding: "40px 40px 120px" }}>

      {/* Header */}
      <button
        onClick={() => router.back()}
        style={{ background: "none", border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 32, fontWeight: 700, fontSize: 14 }}
      >
        <ChevronLeft size={18} /> Voltar
      </button>

      <div style={{ textAlign: "left", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--primary-soft)", display: "grid", placeItems: "center", color: "var(--primary)" }}>
            <Mic2 size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>Sala de Guerra</h1>
            <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>Central de intercessão ao vivo.</p>
          </div>
        </div>
      </div>

      {/* 🔴 SISTEMA DE ABAS (TABS) */}
      <div style={{ 
        display: "flex", 
        background: "var(--line)", 
        padding: 6, 
        borderRadius: 16, 
        marginBottom: 32,
        maxWidth: 600
      }}>
        <button 
          onClick={() => setActiveTab('live')}
          style={{ 
            flex: 1, padding: "12px", borderRadius: 12, border: 0, cursor: "pointer",
            fontWeight: 800, fontSize: 13, transition: "0.2s",
            background: activeTab === 'live' ? "white" : "transparent",
            color: activeTab === 'live' ? "var(--primary)" : "var(--muted)",
            boxShadow: activeTab === 'live' ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}
        >
          <Mic2 size={16} /> Opção Aberta
          {activeRooms.length > 0 && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />}
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          style={{ 
            flex: 1, padding: "12px", borderRadius: 12, border: 0, cursor: "pointer",
            fontWeight: 800, fontSize: 13, transition: "0.2s",
            background: activeTab === 'create' ? "white" : "transparent",
            color: activeTab === 'create' ? "var(--primary)" : "var(--muted)",
            boxShadow: activeTab === 'create' ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}
        >
          <Loader2 size={16} /> + Iniciar Nova Sala
        </button>
      </div>

      <div style={{ minHeight: 400 }}>
        {/* CONTEÚDO DA ABA 1: SALAS ABERTAS */}
        {activeTab === 'live' && (
          <section className="anim-fade-in">
          
          {/* 🔴 SEÇÃO AO VIVO */}
          <p style={{ fontSize: 11, fontWeight: 900, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
            Intercessão ao Vivo
          </p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 48 }}>
            {activeRooms.filter(r => r.status === 'live').map(room => (
              <div key={room.id} className="card shadow-sm" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, background: "white", borderRadius: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.05)", color: "#ef4444", display: "grid", placeItems: "center" }}>
                    <Mic2 size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                     <strong style={{ fontSize: 15 }}>{room.title}</strong>
                     <p className="muted" style={{ fontSize: 12, margin: 0 }}>{room.current_viewers || 0} orando agora</p>
                  </div>
                </div>
                <button onClick={() => router.push(`/war-room/${room.id}`)} className="button" style={{ width: "100%", padding: 12, borderRadius: 14, fontSize: 13 }}>ENRTAR AGORA</button>
              </div>
            ))}
            {activeRooms.filter(r => r.status === 'live').length === 0 && !loadingRooms && (
               <div style={{ padding: "40px 0", textAlign: "center", border: "2px dashed var(--line)", borderRadius: 24, gridColumn: "1/-1" }}>
                 <p className="muted" style={{ fontSize: 13 }}>Nenhuma sala ativa. Inicie uma nova!</p>
               </div>
            )}
          </div>

          {/* 📅 SEÇÃO AGENDADAS */}
          <p style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={14} /> Próximas Vigílias Agendadas
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {activeRooms.filter(r => r.status === 'scheduled').map(room => (
              <div key={room.id} className="card shadow-sm" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, background: "white", borderRadius: 24, border: "1px solid var(--line)" }}>
                <div>
                   <span style={{ fontSize: 10, fontWeight: 900, background: "var(--primary-soft)", color: "var(--primary)", padding: "4px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                     📅 {new Date(room.scheduled_for).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {new Date(room.scheduled_for).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   <h3 style={{ fontSize: 16, fontWeight: 900, margin: "12px 0 4px" }}>{room.title}</h3>
                   <p className="muted" style={{ fontSize: 12, margin: 0 }}>Líder: {room.host?.full_name || "Convidado"}</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => alert("Lembrete ativado! Notificaremos você 5 min antes.")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid var(--line)", background: "white", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>🔔 Lembrar-me</button>
                  <button onClick={() => router.push(`/war-room/${room.id}`)} className="button-soft" style={{ flex: 1, padding: "10px", borderRadius: 12, border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Pré-Sala</button>
                </div>
              </div>
            ))}
            {activeRooms.filter(r => r.status === 'scheduled').length === 0 && !loadingRooms && (
               <div style={{ padding: "40px 0", textAlign: "center", border: "2px dashed var(--line)", borderRadius: 24, gridColumn: "1/-1" }}>
                 <p className="muted" style={{ fontSize: 13 }}>Nenhum agendamento para hoje.</p>
               </div>
            )}
          </div>
        </section>
        )}

        {/* CONTEÚDO DA ABA 2: NOVA ORAÇÃO */}
        {activeTab === 'create' && (
        <section className="anim-fade-in" style={{ maxWidth: 600 }}>
          <p style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
            Convocação Ministerial
          </p>
          <div className="card shadow-lg" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24, background: "white", border: "1px solid var(--line)", borderRadius: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Nova Convocação</h2>
              <div style={{ display: "flex", background: "var(--line)", padding: 4, borderRadius: 12 }}>
                <button onClick={() => setIsScheduled(false)} style={{ padding: "6px 12px", border: 0, borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", background: !isScheduled ? "white" : "transparent", color: !isScheduled ? "var(--primary)" : "var(--muted)", boxShadow: !isScheduled ? "0 2px 5px rgba(0,0,0,0.05)" : "none" }}>AGORA</button>
                <button onClick={() => setIsScheduled(true)} style={{ padding: "6px 12px", border: 0, borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", background: isScheduled ? "white" : "transparent", color: isScheduled ? "var(--primary)" : "var(--muted)", boxShadow: isScheduled ? "0 2px 5px rgba(0,0,0,0.05)" : "none" }}>AGENDAR</button>
              </div>
            </div>

            {isScheduled && (
              <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, display: "block", marginBottom: 6, color: "var(--muted)" }}>DATA DA VIGÍLIA</label>
                  <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="input" style={{ width: "100%", padding: 12 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, display: "block", marginBottom: 6, color: "var(--muted)" }}>HORÁRIO</label>
                  <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="input" style={{ width: "100%", padding: 12 }} />
                </div>
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>Título da Intercessão *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Vigília pela Família"
            className="input"
            style={{ width: "100%", padding: "14px 16px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>Versículo Base (Opcional)</label>
          <input
            value={verseBase}
            onChange={(e) => setVerseBase(e.target.value)}
            placeholder="Ex: Salmos 91:1"
            className="input"
            style={{ width: "100%", padding: "14px 16px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>Propósito da Oração</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qual o objetivo principal deste clamor?"
            rows={2}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: "1px solid rgba(31,41,55,0.14)", background: "rgba(255,255,255,0.78)", resize: "none", font: "inherit", fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>Convite para o Feed (opcional)</label>
          <textarea
            value={feedCopy}
            onChange={(e) => setFeedCopy(e.target.value)}
            placeholder="Como você quer convocar a comunidade no feed principal? (Deixe vazio para gerar automático)"
            rows={3}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: "1px solid rgba(31,41,55,0.14)", background: "rgba(255,255,255,0.78)", resize: "none", font: "inherit", fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 12 }}>
            <Clock size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Duração Máxima
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {[30, 60, 120, 360].map((min) => (
              <button
                key={min}
                onClick={() => setDuration(min)}
                style={{
                  flex: 1, padding: "10px 4px", borderRadius: 12, border: 0,
                  fontWeight: 800, fontSize: 12,
                  background: duration === min ? "var(--primary)" : "var(--line)",
                  color: duration === min ? "white" : "var(--muted)",
                  cursor: "pointer", transition: "0.2s"
                }}
              >
                {min >= 60 ? `${min / 60}h` : `${min}m`}
              </button>
            ))}
          </div>
        </div>

            {/* Info */}
            <div style={{ background: "var(--primary-soft)", padding: 16, borderRadius: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Users size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                Todos os participantes entram <strong>mutados</strong>. Você como anfitrião controla quem pode falar.
              </p>
            </div>

            <button
              onClick={handleCreate}
              disabled={isCreating || !title.trim() || (isScheduled && (!scheduledDate || !scheduledTime))}
              className="button"
              style={{
                width: "100%", padding: "16px", fontSize: 15, fontWeight: 900,
                opacity: (isCreating || !title.trim() || (isScheduled && (!scheduledDate || !scheduledTime))) ? 0.5 : 1,
                cursor: (isCreating || !title.trim() || (isScheduled && (!scheduledDate || !scheduledTime))) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10
              }}
            >
              {isCreating ? <Loader2 size={20} className="spin" /> : (isScheduled ? <Clock size={20} /> : <Mic2 size={20} />)}
              {isCreating ? "Processando..." : (isScheduled ? "📅 Agendar Convocação" : "🙏 Iniciar Sala Agora")}
            </button>
          </div>
        </section>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
