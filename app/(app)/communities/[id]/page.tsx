"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Globe, Users, ChevronLeft, Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunity();
  }, [id]);

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("communities")
        .select(`*, leader:profiles!leader_id(full_name, username)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      setCommunity(data);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} className="spin muted" />
      </div>
    );
  }

  if (!community) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p className="muted">Comunidade não encontrada.</p>
        <button onClick={() => router.push("/")} className="button" style={{ marginTop: 20 }}>Voltar ao Feed</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 120px" }}>

      <button onClick={() => router.push("/")} style={{ background: "none", border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 24, fontWeight: 700, fontSize: 14 }}>
        <ChevronLeft size={18} /> Voltar
      </button>

      {/* Header da Comunidade */}
      <div className="card" style={{ padding: 32, marginBottom: 20, background: "linear-gradient(135deg, #d97706 0%, #92400e 100%)", color: "white", border: 0 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center", marginBottom: 20 }}>
          <Globe size={32} />
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: "0 0 8px" }}>{community.name}</h1>
        <span style={{ padding: "4px 14px", borderRadius: 100, background: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 800 }}>
          {community.category}
        </span>

        {community.description && (
          <p style={{ margin: "20px 0 0", opacity: 0.85, fontSize: 14, lineHeight: 1.7 }}>{community.description}</p>
        )}
      </div>

      {/* Info */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--line)", display: "grid", placeItems: "center" }}>
            <Users size={20} className="muted" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>LÍDER FUNDADOR</p>
            <strong style={{ fontSize: 15 }}>{community.leader?.full_name || "Líder"}</strong>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>@{community.leader?.username || "lider"}</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <button
        style={{
          width: "100%", padding: "16px", borderRadius: 100, border: 0,
          background: "var(--accent)", color: "white",
          fontWeight: 900, fontSize: 15, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10
        }}
      >
        <UserPlus size={20} /> Participar desta Comunidade
      </button>
    </div>
  );
}
