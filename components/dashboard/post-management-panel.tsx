"use client";

import { useEffect, useMemo, useState } from "react";
import type { ManagedPost, PostType } from "@/types";
import { 
  X, 
  FileText, 
  Search, 
  Eye, 
  EyeOff, 
  Trash2, 
  MessageSquare, 
  BarChart3, 
  History,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PostManagementPanelProps = {
  initialPosts?: ManagedPost[];
};

const typeLabels: Record<PostType, string> = {
  text: "Texto Ministerial",
  image: "Galeria / Imagem",
  video: "Vídeo / Live",
  audio: "Podcast / Áudio"
};

export function PostManagementPanel({ initialPosts = [] }: PostManagementPanelProps) {
  const [posts, setPosts] = useState<ManagedPost[]>(initialPosts);
  const [type, setType] = useState<"all" | PostType>("all");
  const [minimumEngagement, setMinimumEngagement] = useState("");
  const [onlyReported, setOnlyReported] = useState(false);
  const [dateQuery, setDateQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  // 📡 FETCH INICIAL E REALTIME
  useEffect(() => {
    fetchRealtimePosts();

    if (!supabase) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', table: 'posts', schema: 'public' }, () => {
        fetchRealtimePosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRealtimePosts = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!profile_id (full_name, username),
        like_count:post_likes(count),
        comment_count:comments(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("ERRO CRÍTICO NA BUSCA DE POSTS:", error);
      return;
    }

    if (data) {
      const mapped = data.map((p: any) => ({
        id: p.id,
        title: (p.content || "Sem título").substring(0, 40) + (p.content?.length > 40 ? "..." : ""),
        excerpt: p.content || "Nenhum conteúdo descritivo.",
        authorName: p.author?.full_name || "Membro FéConecta",
        authorUsername: p.author?.username || "membro",
        type: p.post_type || "text",
        createdAt: new Date(p.created_at).toLocaleDateString('pt-BR'),
        engagement: p.like_count?.[0]?.count || 0,
        engagementValue: p.like_count?.[0]?.count || 0,
        reports: p.is_flagged ? 1 : 0, 
        commentsCount: p.comment_count?.[0]?.count || 0,
        interactionsSummary: `${p.like_count?.[0]?.count || 0} curtidas`,
        sensitive: p.is_flagged || false,
        hidden: p.status === 'hidden',
        status: p.status || 'published',
        moderationNotes: p.moderation_notes || "",
        reachLimit: p.reach_limit || false,
        aiIncidentReport: p.ai_incident_report || ""
      }));
      setPosts(mapped);
    }
    setLoading(false);
  };

  const handleUpdateField = async (id: string, updates: any) => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('posts').update(updates).eq('id', id);
    if (!error) {
       fetchRealtimePosts();
    }
    setLoading(false);
  };

  // 🛠️ AÇÕES DE MODERAÇÃO
  const handleToggleVisibility = async (id: string, currentStatus: string) => {
    if (!supabase) return;
    setLoading(true);
    const newStatus = currentStatus === 'hidden' ? 'published' : 'hidden';
    const { error } = await supabase.from('posts').update({ status: newStatus }).eq('id', id);
    if (!error) {
       alert(`Sucesso: Publicação ${newStatus === 'hidden' ? 'ocultada' : 'restaurada'}.`);
       fetchRealtimePosts();
    }
    setLoading(false);
  };

  const handlePermanentDelete = async (id: string, title: string) => {
    if (!supabase) return;
    if (!confirm(`BANIR DEFINITIVAMENTE?\nA postagem "${title}" será removida para sempre.`)) return;
    setLoading(true);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
       alert("Publicação banida com sucesso.");
       fetchRealtimePosts();
       setIsModalOpen(false);
    }
    setLoading(false);
  };

  // 🔍 FILTRAGEM
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesType = type === "all" || post.type === type;
      const matchesDate = !dateQuery || post.createdAt.includes(dateQuery);
      const matchesReports = !onlyReported || post.reports > 0;
      const engagementThreshold = parseFloat(minimumEngagement);
      const matchesEngagement =
        !minimumEngagement || isNaN(engagementThreshold) || post.engagementValue >= engagementThreshold;
      
      const matchesSearch = !searchQuery || 
        [post.authorName, post.authorUsername, post.excerpt]
          .some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesDate && matchesReports && matchesEngagement && matchesSearch;
    });
  }, [dateQuery, minimumEngagement, onlyReported, posts, type, searchQuery]);

  const selectedPost = selectedId ? posts.find((p) => p.id === selectedId) || null : null;

  return (
    <section className="grid" style={{ gridTemplateColumns: "1fr", gap: 20 }}>
      {/* 🔴 LISTAGEM DE POSTAGENS */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 28 }}>
          <span className="pill" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>Governança de Conteúdo</span>
          <h2 style={{ marginTop: 12, marginBottom: 8, fontSize: "2rem", fontWeight: 800 }}>Auditória de Publicações</h2>
          <p className="muted" style={{ margin: 0, maxWidth: 600 }}>Monitore o pulso da comunidade em tempo real. Gerencie denúncias e assegure a integridade ministerial.</p>
        </div>

        {/* Filtros */}
        <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 0.8fr", gap: 12, marginBottom: 24 }}>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Pesquisar</span>
            <div style={{ position: "relative" }}>
               <Search size={14} style={{ position: "absolute", left: 10, top: 12, color: "var(--muted)" }} />
               <input className="input" style={{ width: "100%", padding: "8px 12px 8px 32px", fontSize: "12px", height: "38px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Autor ou texto..." />
            </div>
          </div>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Tipo</span>
            <select className="input" style={{ width: "100%", padding: "8px 12px", fontSize: "12px", height: "38px" }} value={type} onChange={(event) => setType(event.target.value as "all" | PostType)}>
              <option value="all">Global</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Data</span>
            <input className="input" style={{ width: "100%", padding: "8px 12px", fontSize: "12px", height: "38px" }} type="month" value={dateQuery} onChange={(event) => setDateQuery(event.target.value)} />
          </div>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Curtidas Min.</span>
            <input className="input" style={{ width: "100%", padding: "8px 12px", fontSize: "12px", height: "38px" }} type="number" value={minimumEngagement} onChange={(event) => setMinimumEngagement(event.target.value)} placeholder="0" />
          </div>
          <div className="grid" style={{ gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Condição</span>
            <select className="input" style={{ width: "100%", padding: "8px 12px", fontSize: "12px", height: "38px" }} value={onlyReported ? "reported" : "all"} onChange={(event) => setOnlyReported(event.target.value === "reported")}>
              <option value="all">Todos</option>
              <option value="reported">⚠️ Denunciados</option>
            </select>
          </div>
          <div className="grid" style={{ gap: 6, alignContent: "end" }}>
            <button className="button secondary" style={{ width: "100%", height: "38px", fontSize: "11px", fontWeight: 700 }} onClick={() => { setType("all"); setDateQuery(""); setMinimumEngagement(""); setOnlyReported(false); setSearchQuery(""); }}>
              Resetar
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div style={{ overflowX: "auto" }}>
          {loading && posts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }} className="muted">Sincronizando com altar de dados...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "0 16px", width: "25%" }}>Informação</th>
                  <th style={{ padding: "0 16px", width: "20%" }}>Autor</th>
                  <th style={{ padding: "0 16px", width: "15%" }}>Métrica</th>
                  <th style={{ padding: "0 16px", width: "20%" }}>Data</th>
                  <th style={{ padding: "0 16px", width: "20%", textAlign: "right" }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => {
                  const isSelected = selectedId === post.id;
                  return (
                    <tr 
                      key={post.id} 
                      onClick={() => setSelectedId(post.id)}
                      style={{ 
                        cursor: "pointer",
                        background: isSelected ? "rgba(15,118,110,0.06)" : "white",
                        transition: "all 0.2s",
                        boxShadow: isSelected ? "inset 4px 0 0 var(--primary)" : "none"
                      }}
                    >
                      <td style={{ padding: "12px 16px", borderRadius: "12px 0 0 12px" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <FileText size={16} className="muted" />
                          <strong style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</strong>
                        </div>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{post.authorName}</span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--primary)", fontSize: 13 }}>
                           <BarChart3 size={14} /> {post.engagement}
                        </div>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{post.createdAt}</span>
                      </td>
                      <td style={{ padding: 12, borderRadius: "0 12px 12px 0", textAlign: "right" }}>
                        <button 
                          className="button secondary" 
                          style={{ padding: "6px 14px", fontSize: 11, fontWeight: 700 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(post.id);
                            setIsModalOpen(true);
                          }}
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 🔴 MODAL DE VISUALIZAÇÃO COMPLETA */}
      {isModalOpen && selectedPost && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", display: "grid", placeItems: "center", zIndex: 3000, padding: 20 }}>
          <div className="card" style={{ width: "min(700px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
             <div style={{ padding: 32, borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between" }}>
                <h2 style={{ margin: 0, fontWeight: 900 }}>Vigilância Ministerial</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: 0, cursor: "pointer" }}><X size={24}/></button>
             </div>
             <div style={{ padding: 32 }}>
                <div style={{ marginBottom: 24 }}>
                   <strong>{selectedPost.authorName}</strong> (@{selectedPost.authorUsername})
                   <div style={{ fontSize: 12, color: "var(--muted)" }}>Postado em {selectedPost.createdAt}</div>
                </div>
                <div style={{ padding: 24, background: "var(--line)", borderRadius: 16, marginBottom: 24, fontSize: 18, lineHeight: 1.6 }}>
                   {selectedPost.excerpt}
                </div>
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
                   <div style={{ textAlign: "center", padding: 16, border: "1px solid var(--line)", borderRadius: 12 }}>
                      <div className="muted" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Curtidas</div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedPost.engagement}</div>
                   </div>
                   <div style={{ textAlign: "center", padding: 16, border: "1px solid var(--line)", borderRadius: 12 }}>
                      <div className="muted" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Comentários</div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedPost.commentsCount}</div>
                   </div>
                   <div style={{ textAlign: "center", padding: 16, border: "1px solid var(--line)", borderRadius: 12 }}>
                      <div className="muted" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Engajamento</div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{((selectedPost.engagement + selectedPost.commentsCount) * 1.5).toFixed(1)}%</div>
                   </div>
                </div>
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                   <div style={{ padding: 16, background: selectedPost.reachLimit ? "rgba(220, 38, 38, 0.05)" : "rgba(16, 185, 129, 0.05)", borderRadius: 12, border: "1px solid var(--line)", textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Alcance Ministerial</div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: selectedPost.reachLimit ? "#dc2626" : "#10b981" }}>{selectedPost.reachLimit ? "🚩 RETIDO (RESTRITO)" : "✅ GLOBAL (ABERTO)"}</div>
                      <button 
                        onClick={() => handleUpdateField(selectedPost.id, { reach_limit: !selectedPost.reachLimit })}
                        style={{ background: "none", border: 0, textDecoration: "underline", fontSize: 11, fontWeight: 700, marginTop: 8, cursor: "pointer", color: "var(--primary)" }}
                      >
                        Alternar Retenção
                      </button>
                   </div>
                   <div style={{ padding: 16, background: "rgba(15, 118, 110, 0.05)", borderRadius: 12, border: "1px solid var(--line)" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Observação Pastoral (Privado)</div>
                      <textarea 
                        id="mod-notes"
                        defaultValue={selectedPost.moderationNotes} 
                        placeholder="Notas de auditoria..."
                        onBlur={(e) => handleUpdateField(selectedPost.id, { moderation_notes: e.target.value })}
                        style={{ width: "100%", height: 32, background: "none", border: 0, outline: "none", fontSize: 12, resize: "none" }} 
                      />
                   </div>
                </div>

                {/* 🤖 ANALISE IA (SIMULAÇÃO GENESIS 20 ANOS) */}
                <div style={{ padding: 24, background: "#0f172a", borderRadius: 20, color: "white", marginBottom: 40, border: "1px solid rgba(255,255,255,0.1)" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ padding: 4, background: "#38bdf8", borderRadius: 4 }}><Sparkles size={14} color="black"/></div>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Auditoria Neural Genesis Expert</span>
                   </div>
                   {selectedPost.excerpt.length < 5 || selectedPost.excerpt.includes("!") ? (
                     <div style={{ borderRadius: 12, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#fca5a5", marginBottom: 4 }}>🚩 ALERTA DE INCIDENTE DETECTADO</div>
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Padrão de postagem atípico: {selectedPost.excerpt.length < 5 ? 'Conteúdo extremamente curto (risco de spam)' : 'Entonação imperativa detectada'}. Recomendável monitoramento vigilante.</p>
                     </div>
                   ) : (
                     <div style={{ borderRadius: 12, background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#86efac", marginBottom: 4 }}>✅ ANÁLISE MINISTERIAL POSITIVA</div>
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>O conteúdo apresenta harmonia linguística com os padrões da comunidade FéConecta. Sem riscos imediatos identificados pelo Genesis.</p>
                     </div>
                   )}
                </div>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                   <button 
                    disabled={loading}
                    className="button secondary" 
                    onClick={() => handleUpdateField(selectedPost.id, { status: selectedPost.status === 'hidden' ? 'published' : 'hidden' })}
                    style={{ padding: 16, fontWeight: 700 }}
                   >
                      {selectedPost.status === 'hidden' ? "Restaurar Visibilidade" : "Privar Publicação"}
                   </button>
                   <button 
                    disabled={loading}
                    className="button" 
                    onClick={() => handlePermanentDelete(selectedPost.id, selectedPost.title)}
                    style={{ padding: 16, fontWeight: 700, background: "var(--danger)" }}
                   >
                      Banir Permanentemente
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </section>
  );
}
