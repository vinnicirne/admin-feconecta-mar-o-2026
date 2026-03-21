"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronLeft, Loader2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewCommunityPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Igreja Local");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Dê um nome para a comunidade.");
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Gerar slug a partir do nome
      const slug = name.trim()
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        + `-${Date.now()}`;

      const { data, error } = await supabase
        .from("communities")
        .insert({
          name: name.trim(),
          slug,
          description: description.trim() || null,
          category,
          leader_id: user.id,
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/communities/${data.id}`);
    } catch (err: any) {
      alert(`Erro ao criar comunidade: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const categories = ["Igreja Local", "Célula", "Ministério", "Grupo de Oração", "Jovens", "Louvor"];

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
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(217, 119, 6, 0.1)", display: "grid", placeItems: "center", margin: "0 auto 20px", color: "var(--accent)" }}>
          <Globe size={36} />
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Fundar Comunidade</h1>
        <p className="muted" style={{ marginTop: 8 }}>Crie sua igreja, célula ou ministério no Refúgio.</p>
      </div>

      {/* Formulário */}
      <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>Nome da Comunidade *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Igreja Comunidade Vida"
            className="input"
            style={{ width: "100%", padding: "14px 16px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>Descrição (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fale sobre a visão da sua comunidade..."
            rows={3}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: "1px solid rgba(31,41,55,0.14)", background: "rgba(255,255,255,0.78)", resize: "none", font: "inherit", fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 12 }}>Categoria</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "8px 16px", borderRadius: 100, border: 0,
                  fontWeight: 700, fontSize: 12,
                  background: category === cat ? "var(--primary)" : "var(--line)",
                  color: category === cat ? "white" : "var(--muted)",
                  cursor: "pointer", transition: "0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ background: "rgba(217, 119, 6, 0.08)", padding: 16, borderRadius: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Users size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
            Você será o <strong>líder fundador</strong> desta comunidade e poderá convidar membros e moderadores.
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={isCreating || !name.trim()}
          style={{
            width: "100%", padding: "16px", fontSize: 15, fontWeight: 900,
            border: 0, borderRadius: 100,
            background: "var(--accent)", color: "white",
            opacity: (isCreating || !name.trim()) ? 0.5 : 1,
            cursor: (isCreating || !name.trim()) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10
          }}
        >
          {isCreating ? <Loader2 size={20} className="spin" /> : <Globe size={20} />}
          {isCreating ? "Criando..." : "🏛️ Fundar Comunidade"}
        </button>
      </div>
    </div>
  );
}
