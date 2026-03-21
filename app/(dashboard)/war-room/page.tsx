import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Mic2, Users, Timer, ShieldCheck, Plus } from "lucide-react";

export default async function WarRoomPage() {
  const supabase = await createServerSupabaseClient();
  
  // Buscar salas ativas e agendadas no banco
  const { data: rooms } = await supabase
    .from('prayer_rooms')
    .select(`
      *,
      host:profiles!host_id(full_name, username),
      community:communities!community_id(name)
    `)
    .in('status', ['live', 'scheduled'])
    .order('created_at', { ascending: false });

  return (
    <div className="grid" style={{ gap: 24 }}>
      <header className="card" style={{ padding: 32, background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)", color: "white", border: 0 }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
               <span className="pill" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: 0 }}>Módulo WebRTC Premium</span>
               <h1 style={{ marginTop: 12, fontSize: "2.5rem", fontWeight: 800 }}>SALA DE GUERRA</h1>
               <p style={{ opacity: 0.8, margin: "8px 0 0", maxWidth: 500 }}>
                 Monitore salas ao vivo e agendadas. O sistema agora conta com **Auto-Encerramento** inteligente ao zerar o timer.
               </p>
            </div>
            <button className="button" style={{ background: "white", color: "var(--primary)", fontWeight: 800, padding: "12px 24px", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
               <Plus size={18} /> Agendar Nova Vigília
            </button>
         </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
         {(!rooms || rooms.length === 0) ? (
            <div className="card" style={{ gridColumn: "1 / -1", padding: 60, textAlign: "center", border: "2px dashed var(--line)" }}>
               <Mic2 size={48} className="muted" style={{ marginBottom: 16, opacity: 0.2 }} />
               <h3 className="muted">Nenhuma Sala de Guerra ativa ou agendada.</h3>
            </div>
         ) : rooms.map((room: any) => (
            <article key={room.id} className="card shadow-hover" style={{ padding: 24, border: "1px solid var(--line)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  {room.status === 'live' ? (
                    <div style={{ padding: "4px 12px", borderRadius: 100, background: "#ef4444", color: "white", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
                       <div className="anim-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} /> AO VIVO
                    </div>
                  ) : (
                    <div style={{ padding: "4px 12px", borderRadius: 100, background: "var(--primary)", color: "white", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
                       AGENDADA
                    </div>
                  )}
                  <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{room.community?.name || "Geral"}</span>
               </div>

               <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>{room.title}</h3>
               {room.verse_base && (
                 <p style={{ fontSize: 12, fontStyle: "italic", color: "var(--primary)", marginBottom: 8 }}>"{room.verse_base}"</p>
               )}
               <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Host: <strong>{room.host?.full_name}</strong></p>

               <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ padding: 12, background: "var(--line)", borderRadius: 12 }}>
                     <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>{room.status === 'live' ? 'Intercessores' : 'Interessados'}</div>
                     <div style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}><Users size={14}/> {room.status === 'live' ? room.current_viewers : room.interested_count}</div>
                  </div>
                  <div style={{ padding: 12, background: "var(--line)", borderRadius: 12 }}>
                     <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>{room.status === 'live' ? 'Timer Ativo' : 'Duração Prev.'}</div>
                     <div style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}><Timer size={14}/> {room.max_duration_minutes}m</div>
                  </div>
               </div>

               {room.status === 'live' && (
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: 16, borderRadius: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: "#059669", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <ShieldCheck size={12} /> Auto-Encerramento Ativo
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: "white", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line)" }}>
                        👑 {room.host?.full_name} (Host)
                      </span>
                      {/* Futuramente: Mapear participantes reais via join em tempo real no dashboard */}
                    </div>
                  </div>
               )}

               <div className="grid" style={{ gap: 10 }}>
                  <button className="button secondary" style={{ width: "100%", fontWeight: 700 }}>
                    <ShieldCheck size={16} /> Auditar Sala
                  </button>
                  <button className="button" style={{ width: "100%", background: "var(--danger)", fontWeight: 700 }}>
                    Forçar Término
                  </button>
               </div>
            </article>
         ))}
      </div>
    </div>
  );
}
