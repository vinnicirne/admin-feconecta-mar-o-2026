"use client";

import { useMemo, useState } from "react";
import type { ManagedPost, PostType } from "@/types";
import { X, FileText, Search, Filter, Eye, EyeOff, Trash2, AlertTriangle, MessageSquare, BarChart3, History } from "lucide-react";

type PostManagementPanelProps = {
  posts: ManagedPost[];
};

const typeLabels: Record<PostType, string> = {
  text: "Texto Ministerial",
  image: "Galeria / Imagem",
  video: "Vídeo / Live",
  audio: "Podcast / Áudio"
};

export function PostManagementPanel({ posts = [] }: PostManagementPanelProps) {
  const [type, setType] = useState<"all" | PostType>("all");
  const [minimumEngagement, setMinimumEngagement] = useState("");
  const [onlyReported, setOnlyReported] = useState(false);
  const [dateQuery, setDateQuery] = useState("");
  const [selectedId, setSelectedId] = useState(posts?.[0]?.id ?? "");

  const filteredPosts = useMemo(() => {
    return (posts || []).filter((post) => {
      const matchesType = type === "all" || post.type === type;
      const matchesDate = !dateQuery || post.createdAt.includes(dateQuery);
      const matchesReports = !onlyReported || post.reports > 0;
      const engagementThreshold = parseFloat(minimumEngagement);
      const matchesEngagement =
        !minimumEngagement || isNaN(engagementThreshold) || post.engagementValue >= engagementThreshold;

      return matchesType && matchesDate && matchesReports && matchesEngagement;
    });
  }, [dateQuery, minimumEngagement, onlyReported, posts, type]);

  const selectedPost = filteredPosts.find((post) => post.id === selectedId) || filteredPosts[0] || posts[0];

  return (
    <section className="grid" style={{ gridTemplateColumns: selectedPost ? "minmax(0, 1fr) 380px" : "1fr", gap: 20, transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      {/* 🔴 LISTAGEM DE POSTAGENS */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 28 }}>
          <span className="pill" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>Governança de Conteúdo</span>
          <h2 style={{ marginTop: 12, marginBottom: 8, fontSize: "2rem", fontWeight: 800 }}>Auditória de Publicações</h2>
          <p className="muted" style={{ margin: 0, maxWidth: 600 }}>Monitore o pulso da comunidade. Revise postagens, gerencie denúncias de conteúdo e assegure a integridade ministerial.</p>
        </div>

        {/* Filtros Compactos - Simetria Absoluta (5 Colunas de 20%) */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Tipo / Busca</span>
            <select className="input" style={{ width: "100%", padding: "8px 12px", fontSize: "12px", height: "38px" }} value={type} onChange={(event) => setType(event.target.value as "all" | PostType)}>
              <option value="all">Global (Todos)</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Período</span>
            <input className="input" style={{ width: "100%", padding: "8px 12px", fontSize: "12px", height: "38px" }} type="month" value={dateQuery} onChange={(event) => setDateQuery(event.target.value)} />
          </div>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Engajamento</span>
            <input className="input" style={{ width: "100%", padding: "8px 12px", fontSize: "12px", height: "38px" }} type="number" value={minimumEngagement} onChange={(event) => setMinimumEngagement(event.target.value)} placeholder="0" />
          </div>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Status</span>
            <select className="input" style={{ width: "100%", padding: "8px 12px", fontSize: "12px", height: "38px" }} value={onlyReported ? "reported" : "all"} onChange={(event) => setOnlyReported(event.target.value === "reported")}>
              <option value="all">Todos</option>
              <option value="reported">⚠️ Denunciados</option>
              <option value="pending">📜 Pendentes</option>
            </select>
          </div>
          <div className="grid" style={{ gap: 6, alignContent: "end" }}>
            <button className="button secondary" style={{ width: "100%", height: "38px", fontSize: "11px", fontWeight: 700 }} onClick={() => { setType("all"); setDateQuery(""); setMinimumEngagement(""); setOnlyReported(false); }}>
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Listagem Estilo Card-Row Harmonizada (Grade 20% Uniforme) */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0 16px", width: "20%" }}>Informação</th>
                <th style={{ padding: "0 16px", width: "20%" }}>Escopo</th>
                <th style={{ padding: "0 16px", width: "20%" }}>Métrica</th>
                <th style={{ padding: "0 16px", width: "20%" }}>Condição</th>
                <th style={{ padding: "0 16px", width: "20%", textAlign: "right" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => {
                const isSelected = selectedId === post.id;
                const isPending = post.status === 'pending';
                return (
                  <tr 
                    key={post.id} 
                    onClick={() => setSelectedId(post.id)}
                    className="user-row"
                    style={{ 
                      cursor: "pointer",
                      background: isSelected ? "rgba(15,118,110,0.06)" : isPending ? "rgba(245,158,11,0.04)" : "white",
                      transition: "all 0.2s",
                      boxShadow: isSelected ? "inset 4px 0 0 var(--primary)" : "none"
                    }}
                  >
                    <td style={{ padding: "12px 16px", borderRadius: "10px 0 0 10px" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: isPending ? "rgba(245,158,11,0.1)" : "var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                          {isPending ? <History size={16} style={{ color: "var(--accent)" }} /> : <FileText size={16} className="muted" />}
                        </div>
                        <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                          <strong style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</strong>
                          <span className="muted" style={{ fontSize: 11 }}>{post.authorName}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{post.communityName || "🌐 Global"}</span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--primary)", fontSize: 13 }}>
                         <BarChart3 size={14} /> {post.engagement}
                      </div>
                    </td>
                    <td style={{ padding: 12 }}>
                      {isPending ? (
                        <span className="pill" style={{ background: "rgba(245,158,11,0.12)", color: "var(--accent)", fontSize: 9, fontWeight: 800 }}>PENDENTE</span>
                      ) : post.reports > 0 ? (
                        <span className="pill" style={{ background: "#fee2e2", color: "#991b1b", fontSize: 9, fontWeight: 800 }}>⚠️ {post.reports}</span>
                      ) : (
                        <span className="pill" style={{ background: "rgba(16,185,129,0.1)", color: "#059669", fontSize: 9, fontWeight: 800 }}>Limpo</span>
                      )}
                    </td>
                    <td style={{ padding: 12, borderRadius: "0 10px 10px 0", textAlign: "right" }}>
                      <button className="button secondary" style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700 }}>{isPending ? "Aprovar" : "Revisar"}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔴 PAINEL DE REVISÃO EDITORIAL */}
      {selectedPost && (
        <aside className="card" style={{ padding: 32, position: "sticky", top: 20, alignSelf: "start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <span className="pill" style={{ background: "rgba(15,118,110,0.1)", color: "var(--primary)" }}>Revisão Editorial</span>
            <button onClick={() => setSelectedId("")} style={{ background: "none", border: 0, cursor: "pointer" }}><X size={20} /></button>
          </div>

          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "20px 0 8px", letterSpacing: "-0.02em" }}>{selectedPost.title}</h3>
          <p className="muted" style={{ fontSize: "1rem", marginBottom: 24 }}>Autor: {selectedPost.authorName} (@{selectedPost.authorUsername})</p>

          <div className="card" style={{ background: "var(--line)", padding: 20, marginBottom: 24, borderRadius: 12 }}>
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: "0.95rem", fontStyle: "italic" }}>"{selectedPost.excerpt}"</p>
          </div>

          <div className="grid" style={{ gap: 16, marginBottom: 32 }}>
            {[
              { label: "Tipo de Conteúdo", value: typeLabels[selectedPost.type] },
              { label: "Total Comentários", value: selectedPost.commentsCount },
              { label: "Status de Visibilidade", value: selectedPost.hidden ? "Oculto" : "Público", alert: selectedPost.hidden },
              { label: "Conteúdo Sensível", value: selectedPost.sensitive ? "Marcado" : "Normal", alert: selectedPost.sensitive },
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                <strong style={{ fontSize: 13, color: item.alert ? "var(--accent)" : "inherit" }}>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button className="button secondary" style={{ display: "flex", gap: 8, justifyContent: "center" }}><MessageSquare size={16}/> Comentários</button>
            <button className="button secondary" style={{ display: "flex", gap: 8, justifyContent: "center" }}><History size={16}/> Logs</button>
            <button className="button secondary" style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "center" }}>
              {selectedPost.hidden ? <Eye size={16}/> : <EyeOff size={16}/>} 
              {selectedPost.hidden ? "Restaurar Visibilidade" : "Ocultar Publicação"}
            </button>
            <button className="button" style={{ gridColumn: "1 / -1", background: "var(--danger)", padding: 16, display: "flex", gap: 10, justifyContent: "center", fontWeight: 700 }}>
              <Trash2 size={20} /> Banir Publicação Definitivamente
            </button>
          </div>
        </aside>
      )}
    </section>
  );
}
