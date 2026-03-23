"use client";

import { PrayerRoom } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LiveRoomsProps {
  rooms: PrayerRoom[];
  onStartRoom: () => void;
}

export function LiveRooms({ rooms, onStartRoom }: LiveRoomsProps) {
  const router = useRouter();

  if (rooms.length === 0) {
    return (
      <Card variant="outline" padding={20} style={{ textAlign: "center", background: "rgba(234, 179, 8, 0.05)", borderStyle: "dashed", borderColor: "rgba(234, 179, 8, 0.5)" }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#a16207" }}>🟡 Nenhuma oração ativa agora</p>
        <Button 
          onClick={onStartRoom} 
          size="sm"
          style={{ background: "#eab308", marginTop: 12 }}
        >
          Iniciar oração
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="live-pulse-bg" padding={24} style={{ border: "2px solid #ef4444" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#ef4444", marginBottom: 16 }}>
        <div className="live-dot" style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 12px #ef4444" }} />
        <strong style={{ fontSize: 13, letterSpacing: 2 }}>AO VIVO AGORA</strong>
      </div>
      {rooms.map(room => (
        <div key={room.id} style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
          <div>
            <strong style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, marginBottom: 8 }}>
              🙏 Sala de Guerra ativa
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>👥 <strong style={{ color: "var(--foreground)"}}>{room.current_viewers || 0} pessoas</strong> orando</span>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>🎧 <strong style={{ color: "var(--foreground)"}}>{room.host?.full_name?.split(" ")[0] || "Líder"}</strong> conduzindo</span>
            </div>
          </div>
          <Button 
            onClick={() => router.push(`/war-room/${room.id}`)} 
            style={{ background: "#ef4444", boxShadow: "0 8px 20px rgba(239, 68, 68, 0.3)", width: "100%" }}
          >
            ENTRAR NA SALA
          </Button>
        </div>
      ))}
    </Card>
  );
}
