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
import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

export default function FeedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    checkUser();

    // Listener para fechar modal no login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setAuthMode(null);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

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

      {/* 🔴 ÁREA DE CRIAÇÃO (DYNAMIC) */}
      <div className="desktop-only-creator">
        {user ? (
          <PostCreator />
        ) : (
          <div 
             onClick={() => setAuthMode("login")}
             className="card" 
             style={{ padding: 24, textAlign: "center", cursor: "pointer", background: "white", borderRadius: 32, border: "2px dashed var(--line)" }}
          >
             <h3 style={{ margin: 0, fontWeight: 800 }}>Deseja compartilhar algo com a comunidade? 🙏</h3>
             <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>Faça login para postar testemunhos, edificar irmãos e pedir oração.</p>
             <button style={{ marginTop: 16, background: "var(--primary)", border: 0, color: "white", padding: "10px 24px", borderRadius: 100, fontWeight: 800, fontSize: 13 }}>Entrar agora no Refúgio</button>
          </div>
        )}
      </div>

      {/* 🔴 MODAIS DE AUTH (PREMIUM GLASS) */}
      {authMode && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
           <div style={{ background: "white", width: "100%", maxWidth: 420, borderRadius: 32, padding: 32, position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}>
              <button 
                onClick={() => setAuthMode(null)}
                style={{ position: "absolute", top: 20, right: 20, background: "none", border: 0, cursor: "pointer", color: "var(--muted)" }}
              >
                 <X size={20} />
              </button>
              
              {authMode === "login" ? (
                <>
                  <LoginForm />
                  <p style={{ textAlign: "center", marginTop: 24, fontSize: 13 }} className="muted">
                    Não tem conta? <span onClick={() => setAuthMode("signup")} style={{ color: "var(--primary)", fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}>Criar agora</span>
                  </p>
                </>
              ) : (
                <>
                  <SignUpForm />
                  <p style={{ textAlign: "center", marginTop: 24, fontSize: 13 }} className="muted">
                    Já sou membro? <span onClick={() => setAuthMode("login")} style={{ color: "var(--primary)", fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}>Entrar agora</span>
                  </p>
                </>
              )}
           </div>
        </div>
      )}

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

      {isOracao && (
        <button style={{ 
          marginTop: 24, background: "linear-gradient(135deg, #10b981, #065f46)", border: 0, 
          borderRadius: 100, padding: "12px 32px", color: "white", fontWeight: 900, fontSize: 14,
          boxShadow: "0 10px 20px rgba(6, 95, 70, 0.2)"
        }}>
          🙏 ORAR POR MIM
        </button>
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
              <Heart size={18} className="danger" /> <span style={{ color: "#ef4444" }}>128</span>
          </button>
          <button style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              <MessageSquare size={18} /> 34
          </button>
          {isOracao && (
            <button style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>
                🙏 <span style={{ textDecoration: "underline" }}>12 orando</span>
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
