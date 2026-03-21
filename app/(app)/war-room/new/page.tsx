"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic2, Clock, Users, ChevronLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewWarRoomPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [isCreating, setIsCreating] = useState(false);

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

      const { data, error } = await supabase
        .from("prayer_rooms")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          host_id: user.id,
          status: "live",
          max_duration_minutes: duration,
          started_at: new Date().toISOString(),
          livekit_room_name: `war-room-${user.id}-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/war-room/${data.id}`);
    } catch (err: any) {
      alert(`Erro ao criar sala: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 120px" }}>

      {/* Header */}
      <button
        onClick={() => router.back()}
        style={{ background: "none", border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 32, fontWeight: 700, fontSize: 14 }}
      >
        <ChevronLeft size={18} /> Voltar
      </button>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "var(--primary-soft)", display: "grid", placeItems: "center", margin: "0 auto 20px", color: "var(--primary)" }}>
          <Mic2 size={36} />
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Nova Sala de Guerra</h1>
        <p className="muted" style={{ marginTop: 8 }}>Convoque a comunidade para oração ao vivo.</p>
      </div>

      {/* Formulário */}
      <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>Título da Oração *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Intercessão pela Família"
            className="input"
            style={{ width: "100%", padding: "14px 16px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>Descrição (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o foco desta oração..."
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
          disabled={isCreating || !title.trim()}
          className="button"
          style={{
            width: "100%", padding: "16px", fontSize: 15, fontWeight: 900,
            opacity: (isCreating || !title.trim()) ? 0.5 : 1,
            cursor: (isCreating || !title.trim()) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10
          }}
        >
          {isCreating ? <Loader2 size={20} className="spin" /> : <Mic2 size={20} />}
          {isCreating ? "Iniciando..." : "🙏 Iniciar Sala de Guerra"}
        </button>
      </div>
    </div>
  );
}
