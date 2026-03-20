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
  Volume2
} from "lucide-react";
import { PostCreator } from "@/components/app/feed/post-creator";
import { getPostsAction } from "@/app/actions/post-actions";

export default function FeedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
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

      {/* 🔴 ÁREA DE CRIAÇÃO (DYNAMIC - ESCONDIDA NO MOBILE) */}
      <div className="desktop-only-creator">
        <PostCreator />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-only-creator { display: none !important; }
        }
      `}</style>

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
            
            {/* Conteúdo de Texto c/ Suporte a Estilos */}
            <div style={{ 
              background: post.background_style || "transparent", 
              padding: post.background_style !== "transparent" ? "40px 24px" : "0 24px 20px",
              color: post.background_style?.includes("gradient") ? "white" : "inherit"
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: post.background_style !== "transparent" ? "1.4rem" : "1.05rem", 
                lineHeight: 1.6, 
                fontWeight: post.is_bold ? "800" : "500",
                fontStyle: post.is_italic ? "italic" : "normal",
                fontFamily: post.font_family === "Serif" ? "serif" : "inherit",
                textAlign: post.background_style !== "transparent" ? "center" : "left"
              }}>
                {post.content}
              </p>
            </div>

            {/* 🔴 RENDERIZAÇÃO DE MÍDIA (NEW) */}
            {post.image_url && (
              <div style={{ padding: "0 12px 12px" }}>
                {post.media_type === 'image' && (
                  <img src={post.image_url} style={{ width: "100%", borderRadius: 24, maxHeight: 500, objectFit: "cover" }} />
                )}
                {post.media_type === 'video' && (
                  <video src={post.image_url} controls style={{ width: "100%", borderRadius: 24, maxHeight: 500 }} />
                )}
                {post.media_type === 'audio' && (
                  <div style={{ 
                    background: "rgba(15, 118, 110, 0.05)", 
                    padding: "20px", 
                    borderRadius: 20, 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 16,
                    border: "1px solid rgba(15, 118, 110, 0.1)" 
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--primary)", color: "white", display: "grid", placeItems: "center" }}>
                       <Volume2 size={24} />
                    </div>
                    <audio src={post.image_url} controls style={{ flex: 1, height: 32 }} />
                  </div>
                )}
              </div>
            )}

            {/* Footer de Interações */}
            <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)" }}>
               <div style={{ display: "flex", gap: 16 }}>
                  <button style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>
                     <Heart size={20} className="danger" /> Fé
                  </button>
                  <button style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>
                     <MessageSquare size={20} /> Comentar
                  </button>
               </div>
               <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--line)", border: 0 }}><Repeat size={18} className="muted" /></button>
                  <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--line)", border: 0 }}><Copy size={18} className="muted" /></button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoaderPlaceholder() {
  return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Sparkles size={24} className="spin muted" /></div>;
}
