"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Mic2, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Search,
  Sparkles,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

export default function WarRoomDirectoryPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [scheduledRooms, setScheduledRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Buscar Salas Ao Vivo
      const { data: live } = await supabase
        .from("prayer_rooms")
        .select("*, host:profiles!host_id(full_name, avatar_url)")
        .eq("status", "live")
        .eq("is_private", false)
        .is("community_id", null)
        .order("created_at", { ascending: false });

      // 2. Buscar Salas Agendadas
      const { data: scheduled } = await supabase
        .from("prayer_rooms")
        .select("*, host:profiles!host_id(full_name, avatar_url)")
        .eq("status", "scheduled")
        .eq("is_private", false)
        .is("community_id", null)
        .gte("scheduled_for", new Date().toISOString())
        .order("scheduled_for", { ascending: true });

      if (live) setActiveRooms(live);
      if (scheduled) setScheduledRooms(scheduled);
    } catch (err) {
      console.error("Erro ao carregar diretório:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredLive = useMemo(() => {
    return activeRooms.filter(r => 
      r.host?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeRooms, searchTerm]);

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      
      {/* 🔴 HEADER DA PÁGINA */}
      <div style={{ marginBottom: 48 }}>
        <button 
          onClick={() => router.push('/')}
          style={{ 
            background: "none", border: 0, padding: 0, cursor: "pointer", 
            display: "flex", alignItems: "center", gap: 8, color: "var(--muted)",
            fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 1,
            marginBottom: 24
          }}
        >
          <ArrowLeft size={16} /> Voltar ao Feed
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--danger-soft)", color: "var(--danger)", display: "grid", placeItems: "center" }}>
                <Mic2 size={24} />
              </div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>Salas de Guerra</h1>
            </div>
            <p style={{ fontSize: 16, color: "var(--muted)", fontWeight: 600, maxWidth: 600 }}>
              Encontre um altar de intercessão aberto agora ou agende sua participação em vigílias futuras.
            </p>
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
            <Search style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} size={18} />
            <input 
              type="text" 
              placeholder="Buscar pelo nome ou tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: "100%", padding: "16px 16px 16px 48px", borderRadius: 18, 
                border: "1px solid var(--line)", background: "white", fontSize: 14, fontWeight: 700,
                outline: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
          <Loader2 size={40} className="spin primary" />
        </div>
      ) : (
        <>
          {/* 🔴 SALAS AO VIVO */}
          <Section 
            title={`🔥 Em Oração Agora (${filteredLive.length})`} 
            description="Intercessões ativas esperando por você."
            spacing={48}
          >
            {filteredLive.length === 0 ? (
              <Card variant="outline" padding={60} style={{ textAlign: "center", borderStyle: "dashed" }}>
                <p className="muted" style={{ fontWeight: 700 }}>Ninguém orando no momento com este filtro. 🙏</p>
              </Card>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
                {filteredLive.map((room) => (
                  <WarRoomCard key={room.id} room={room} onClick={() => router.push(`/war-room/${room.id}`)} />
                ))}
              </div>
            )}
          </Section>

          {/* 🔴 VIGÍLIAS AGENDADAS */}
          {scheduledRooms.length > 0 && (
            <Section 
              title="📅 Próximas Vigílias" 
              description="Prepare seu coração para os próximos momentos de fé."
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
                {scheduledRooms.map((room) => (
                  <ScheduledRoomCard key={room.id} room={room} />
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      <style jsx global>{`
        .war-room-grid-card:hover {
          transform: translateY(-8px);
          border-color: var(--danger) !important;
          box-shadow: 0 20px 40px rgba(239, 68, 68, 0.15) !important;
        }
      `}</style>
    </div>
  );
}

function WarRoomCard({ room, onClick }: any) {
  return (
    <Card 
      variant="glass" 
      onClick={onClick}
      className="war-room-grid-card"
      style={{ 
        padding: "32px", cursor: "pointer", transition: "0.3s cubic-bezier(0.2, 0.8, 0.2, 1)", 
        border: "1px solid var(--line)", position: "relative", overflow: "hidden"
      }}
    >
       <div style={{ position: "absolute", top: 16, right: 16 }}>
          <div style={{ padding: "4px 10px", borderRadius: 100, background: "var(--danger)", color: "white", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", gap: 4 }}>
             <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} /> AO VIVO
          </div>
       </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--line)", display: "grid", placeItems: "center", overflow: "hidden" }}>
             {room.host?.avatar_url ? (
               <img src={room.host.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
             ) : "🙏"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 18, fontWeight: 900, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.title}</strong>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>{room.host?.full_name} (Líder)</span>
          </div>
       </div>

       <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5, minHeight: 42 }}>
         {room.description || room.verse_base || "No altar intercedendo em unidade. Junte-se a nós em espírito e em verdade."}
       </p>

       <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "var(--danger)" }}>
             <Users size={14} /> {room.current_viewers || 0} online
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "var(--muted)" }}>
             <Calendar size={14} /> Ativa agora
          </div>
       </div>

       <Button variant="primary" style={{ width: "100%", background: "var(--danger)", borderRadius: 14, padding: "14px", fontWeight: 900 }}>ENTRAR NA ORAÇÃO</Button>
    </Card>
  );
}

function ScheduledRoomCard({ room }: any) {
  const dateStr = room.scheduled_for ? new Date(room.scheduled_for).toLocaleString("pt-BR", { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : "";

  return (
    <Card 
      variant="flat" 
      style={{ padding: "32px", border: "1px solid var(--line)", background: "white", opacity: 0.8 }}
    >
       <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f1f5f9", display: "grid", placeItems: "center", overflow: "hidden" }}>
             {room.host?.avatar_url ? (
               <img src={room.host.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
             ) : <Calendar size={20} className="muted" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 16, fontWeight: 900, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.title}</strong>
            <span style={{ fontSize: 11, color: "var(--danger)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Agendada por {room.host?.full_name}</span>
          </div>
       </div>

       <div style={{ background: "var(--line-soft)", padding: "12px 16px", borderRadius: 12, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>{dateStr}</p>
       </div>

       <Button variant="outline" style={{ width: "100%", borderRadius: 14, padding: "12px", fontWeight: 800 }}>LEMBRAR-ME</Button>
    </Card>
  );
}
