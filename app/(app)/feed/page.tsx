"use client";

import { useState, useEffect } from "react";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Maximize2, 
  User, 
  Sparkles, 
  Search, 
  Bell, 
  Home, 
  PlusCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  Repeat,
  Play,
  Volume2,
  Mic2,
  Globe
} from "lucide-react";
import { PostCreator } from "@/components/app/feed/post-creator";
import { getPostsAction } from "@/app/actions/post-actions";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function FeedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      console.error("ERRO AO CARREGAR FEED: Supabase não está configurado corretamente (variáveis de ambiente ausentes).");
      setLoading(false);
      return;
    }
    fetchPosts();
    fetchActiveRooms();

    // 🔴 REALTIME: Ouvir mudanças nas salas de oração
    const channel = supabase
      .channel('public:prayer_rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_rooms' }, () => {
        fetchActiveRooms();
      })
      .subscribe();

    return () => { 
      if (supabase && channel) supabase.removeChannel(channel); 
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getPostsAction();

      if (res.success) {
        setPosts(res.data || []);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      console.error("ERRO PROTEGIDO AO BUSCAR FEED:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_rooms')
        .select('id, title, description, current_viewers, started_at, scheduled_for, status')
        .in('status', ['live', 'scheduled'])
        .order('status', { ascending: false }) // 'scheduled' vem depois de 'live' alfabeticamente? Não, 'live' < 'scheduled'. ascending: true levaria live primeiro.
        .order('started_at', { ascending: false });

      if (error) {
        console.error("ERRO AO BUSCAR SALAS:", error.message);
        return;
      }
      setLiveRooms(data || []);
    } catch (err) {
      console.error("ERRO FETCH ACTIVE ROOMS:", err);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 120px" }}>
      
      {/* 🔴 MENSAGEM DO DIA */}
      <section className="message-day-card" onClick={() => setIsModalOpen(true)} style={{ marginBottom: 24, padding: 32, borderRadius: 32, background: "linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)", color: "white", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(15, 118, 110, 0.25)" }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span className="pill" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: 0, fontSize: 10, fontWeight: 800 }}>MENSAGEM DO DIA</span>
            <Sparkles size={18} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em" }}>"Porque nada é impossível para Deus."</h2>
          <p style={{ marginTop: 12, opacity: 0.9, fontSize: "0.95rem" }}>Lucas 1:37 • Refúgio de Hoje</p>
        </div>
        <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.1 }}><Maximize2 size={120} /></div>
      </section>

      {/* 🛡️ AÇÕES DE FÉ: SALA DE GUERRA E COMUNIDADES (PRIORIDADE MÁXIMA) */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, paddingLeft: 4 }}>
          Ferramentas de Fé
        </p>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button 
            onClick={() => window.location.href = '/war-room/new'}
            style={{ 
              background: "white", padding: "16px", borderRadius: 20, border: "1px solid var(--line)", 
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "0.2s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(15, 118, 110, 0.1)", display: "grid", placeItems: "center", color: "var(--primary)" }}>
              <Mic2 size={20} />
            </div>
            <div style={{ textAlign: "left" }}>
              <strong style={{ display: "block", fontSize: 13 }}>SALA DE GUERRA</strong>
              <span className="muted" style={{ fontSize: 10 }}>Oração ao vivo</span>
            </div>
          </button>

          <button 
            onClick={() => window.location.href = '/communities/new'}
            style={{ 
              background: "white", padding: "16px", borderRadius: 20, border: "1px solid var(--line)", 
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "0.2s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(217, 119, 6, 0.1)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
              <Globe size={20} />
            </div>
            <div style={{ textAlign: "left" }}>
              <strong style={{ display: "block", fontSize: 13 }}>COMUNIDADE</strong>
              <span className="muted" style={{ fontSize: 10 }}>Fundar igreja</span>
            </div>
          </button>
        </div>
      </div>

      {/* 🔴 SALAS ATIVAS / AGENDADAS */}
      {liveRooms.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              CONVITE PARA INTERCESSÃO
            </p>
            <button onClick={fetchActiveRooms} style={{ background: "none", border: 0, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>Recarregar</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {liveRooms.map(room => (
              <div key={room.id} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, background: room.status === 'live' ? "linear-gradient(135deg, rgba(15,118,110,0.08) 0%, rgba(19,78,74,0.06) 100%)" : "rgba(0,0,0,0.02)", border: room.status === 'live' ? "1px solid rgba(15,118,110,0.2)" : "1px solid var(--line)", borderRadius: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: room.status === 'live' ? "var(--primary)" : "var(--line)", display: "grid", placeItems: "center", color: room.status === 'live' ? "white" : "var(--muted)", flexShrink: 0 }}>
                  <Mic2 size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: room.status === 'live' ? "#ef4444" : "var(--primary)", background: room.status === 'live' ? "rgba(239,68,68,0.1)" : "var(--primary-soft)", padding: "2px 8px", borderRadius: 100 }}>
                      {room.status === 'live' ? "AO VIVO" : "AGENDADO"}
                    </span>
                    {room.status === 'scheduled' && room.scheduled_for && (
                      <span className="muted" style={{ fontSize: 10, fontWeight: 800 }}>
                        {new Date(room.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {room.status === 'live' && (
                      <span className="muted" style={{ fontSize: 11 }}>{room.current_viewers || 0} na sala</span>
                    )}
                  </div>
                  <strong style={{ fontSize: 15, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.title}</strong>
                </div>
                <Link href={`/war-room/${room.id}`} style={{ padding: "10px 20px", borderRadius: 100, background: room.status === 'live' ? "var(--primary)" : "var(--line)", color: room.status === 'live' ? "white" : "var(--muted)", fontWeight: 800, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>
                  {room.status === 'live' ? "Participar" : "Ver Detalhes"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔴 ÁREA DE CRIAÇÃO (VISÍVEL EM TODOS OS DISPOSITIVOS) */}
      <div style={{ marginBottom: 32 }}>
        <PostCreator />
      </div>

      {/* 🔴 FEED REAL COM MÍDIAS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 32 }}>
        {loading ? (
           <div style={{ textAlign: "center", padding: 40 }}><LoaderPlaceholder /></div>
        ) : posts.length === 0 ? (
           <div style={{ textAlign: "center", padding: 40, border: "2px dashed var(--line)", borderRadius: 32 }}>
              <p className="muted">Seja o primeiro a compartilhar no refúgio!</p>
           </div>
        ) : posts.map((post) => (
          <div key={post.id} className="card" style={{ padding: "0", borderRadius: 32, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            
            {/* Header com Padding */}
            <div style={{ padding: "20px 24px", display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--line)", display: "grid", placeItems: "center" }}><User size={20} className="muted" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                   <strong style={{ fontSize: 15, fontWeight: 700 }}>{post.profiles?.full_name || "Membro FéConecta"}</strong>
                   <span className="muted" style={{ fontSize: 11 }}>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <span className="muted" style={{ fontSize: 12 }}>@{post.profiles?.username || "usuario"}</span>
              </div>
            </div>
            
            {/* Renderização Inteligente por Tipo de Post */}
            <PostContent post={post} />

            {/* Footer de Interações Baseado no Tipo */}
            <PostInteractions post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PostContent({ post }: { post: any }) {
  const isEdificar = post.post_type === "edificar";
  const isOracao = post.post_type === "oracao";

  return (
    <div style={{ 
      background: post.background_style || (isEdificar ? "linear-gradient(135deg, #059669 0%, #064e3b 100%)" : "transparent"), 
      padding: post.background_style !== "transparent" || isEdificar ? "48px 24px" : "0 24px 20px",
      color: (post.background_style?.includes("gradient") || isEdificar) ? "white" : "inherit",
      textAlign: (post.background_style !== "transparent" || isEdificar) ? "center" : "left",
      position: "relative"
    }}>
      {isOracao && (
        <div style={{ position: "absolute", top: 12, right: 24, padding: "4px 12px", borderRadius: 100, background: "rgba(15, 118, 110, 0.1)", color: "var(--primary)", fontSize: 10, fontWeight: 900 }}>
          🙏 PEDIDO DE ORAÇÃO
        </div>
      )}
      
      <p style={{ 
        margin: "0 0 16px 0", 
        fontSize: (post.background_style !== "transparent" || isEdificar) ? "1.4rem" : "1rem", 
        lineHeight: 1.6, 
        fontWeight: (post.is_bold || isEdificar) ? "800" : "500",
        fontStyle: post.is_italic ? "italic" : "normal",
        fontFamily: post.font_family === "Serif" ? "serif" : "inherit"
      }}>
        {post.content}
      </p>

      {post.image_url && post.media_type === 'image' && (
        <img src={post.image_url} style={{ width: "100%", borderRadius: 20, marginTop: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
      )}

      {post.image_url && post.media_type === 'video' && (
        <video src={post.image_url} controls style={{ width: "100%", borderRadius: 20, marginTop: 12, background: "black", maxHeight: 400 }} />
      )}

      {post.image_url && post.media_type === 'audio' && (
        <div style={{ marginTop: 12, background: "rgba(0,0,0,0.05)", padding: "12px 16px", borderRadius: 16, display: "flex", alignItems: "center", gap: 12 }}>
           <Volume2 size={20} className="muted" />
           <audio src={post.image_url} controls style={{ flex: 1, height: 32 }} />
        </div>
      )}

      {isOracao && !post.metadata?.war_room_id && (
        <button style={{ 
          marginTop: 24, background: "linear-gradient(135deg, #10b981, #065f46)", border: 0, 
          borderRadius: 100, padding: "12px 32px", color: "white", fontWeight: 900, fontSize: 14,
          boxShadow: "0 10px 20px rgba(6, 95, 70, 0.2)"
        }}>
          🙏 ORAR POR MIM
        </button>
      )}

      {post.metadata?.war_room_id && (
        <Link href={`/war-room/${post.metadata.war_room_id}`} style={{ 
          display: "inline-block", marginTop: 24, background: "white", color: "#065f46", border: 0, 
          borderRadius: 100, padding: "12px 32px", fontWeight: 900, fontSize: 14,
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)", textDecoration: "none"
        }}>
          🛡️ ENTRAR NA SALA DE GUERRA
        </Link>
      )}
    </div>
  );
}

function PostInteractions({ post }: { post: any }) {
  const isOracao = post.post_type === "oracao";
  
  return (
    <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", background: "white" }}>
        <div style={{ display: "flex", gap: 20 }}>
          <button style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              <Heart size={18} className={post.user_liked?.[0]?.count > 0 ? "danger" : ""} fill={post.user_liked?.[0]?.count > 0 ? "#ef4444" : "none"} color={post.user_liked?.[0]?.count > 0 ? "#ef4444" : "var(--muted)"} /> 
              <span style={{ color: post.user_liked?.[0]?.count > 0 ? "#ef4444" : "inherit" }}>{post.like_count?.[0]?.count || 0}</span>
          </button>
          <button style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              <MessageSquare size={18} /> {post.comment_count?.[0]?.count || 0}
          </button>
          {isOracao && (
            <button style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>
                🙏 <span style={{ textDecoration: "underline" }}>{post.prayer_count ? `${post.prayer_count[0]?.count} orando` : "0 orando"}</span>
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--line)", border: 0, display: "grid", placeItems: "center" }}><Share2 size={16} className="muted" /></button>
        </div>
    </div>
  );
}

function LoaderPlaceholder() {
  return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Sparkles size={24} className="spin muted" /></div>;
}
