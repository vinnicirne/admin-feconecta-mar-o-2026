"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Globe, Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function CommunitiesExplorer() {
  const router = useRouter();
  const supabase = createClient();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setCommunities(data);
    setLoading(false);
  };

  const filtered = communities.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 120px" }}>
      <button onClick={() => router.push("/")} style={{ background: "none", border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 24, fontWeight: 700, fontSize: 14 }}>
        <ChevronLeft size={18} /> Voltar
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Descobrir Igrejas</h1>
        <Link href="/communities/new" style={{ padding: "8px 16px", borderRadius: 10, background: "var(--primary)", color: "white", fontWeight: 800, textDecoration: "none", fontSize: 13 }}>
          + Fundar
        </Link>
      </div>

      <div style={{ position: "relative", marginBottom: 24 }}>
        <Search size={18} className="muted" style={{ position: "absolute", left: 14, top: 14 }} />
        <input 
          placeholder="Buscar igrejas ou ministérios..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", padding: "14px 14px 14px 40px", borderRadius: 14, border: "1px solid var(--line)", background: "white", fontSize: 14, fontWeight: 600 }}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 className="spin muted" /></div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          {filtered.map(c => (
             <Link key={c.id} href={`/communities/${c.id}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: "white", border: "1px solid var(--line)", textDecoration: "none", color: "inherit", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239, 68, 68, 0.1)", display: "grid", placeItems: "center", color: "#ef4444" }}>
                <Globe size={20} />
              </div>
              <div>
                <strong style={{ display: "block", fontSize: 15 }}>{c.name}</strong>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.category || "Comunidade Local"}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 40 }}>Nenhuma igreja encontrada nesse radar.</p>}
        </div>
      )}
    </div>
  );
}
