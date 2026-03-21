"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  Maximize2,
  User,
  Sparkles,
  Volume2,
  X,
  MoreVertical,
  Edit2,
  Trash2,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Mic2
} from "lucide-react";
import Link from "next/link";
import { PostCreator } from "@/components/app/feed/post-creator";
import { getPostsAction, deletePostAction, updatePostAction } from "@/app/actions/post-actions";
import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/client";
import {
  likePostAction,
  prayPostAction,
  commentPostAction,
  deleteCommentAction,
  updateCommentAction,
  followUserAction
} from "@/app/actions/interaction-actions";

// 🕒 FORMATADOR DE TEMPO RELATIVO
function formatRelativeTime(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);

  if (diffInMins < 1) return "agora";
  if (diffInMins < 60) return `${diffInMins}min`;

  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return past.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function FollowButton({ isFollowing, targetId, authUser }: { isFollowing: boolean, targetId: string, authUser: any }) {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authUser) {
      alert("Faça login para seguir nossos irmãos 🙏");
      return;
    }
    setLoading(true);
    const res = await followUserAction(targetId);
    if (res.success && res.isFollowing !== undefined) {
      setFollowing(res.isFollowing);
    } else if (!res.success) {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      style={{
        padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 900,
        background: following ? "white" : "var(--primary)",
        color: following ? "var(--muted)" : "white",
        border: following ? "1px solid var(--line)" : "0",
        cursor: "pointer", transition: "0.2s",
        boxShadow: following ? "none" : "0 4px 10px rgba(15, 118, 110, 0.15)"
      }}
    >
      {following ? "Seguindo" : "Seguir"}
    </button>
  );
}

export default function FeedPage() {
  const supabase = useMemo(() => createClient(), []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    checkUser();

    if (!supabase) {
      console.warn("Supabase client não disponível (Build Time?)");
      return;
    }

    // 🔄 REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', table: 'post_likes', schema: 'public' }, () => fetchPosts(false))
      .on('postgres_changes', { event: '*', table: 'comments', schema: 'public' }, () => fetchPosts(false))
      .on('postgres_changes', { event: '*', table: 'post_prayers', schema: 'public' }, () => fetchPosts(false))
      .on('postgres_changes', { event: '*', table: 'posts', schema: 'public' }, () => fetchPosts(false))
      .subscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session) {
        setUser(session.user);
        setAuthMode(null);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const checkUser = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const fetchPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await getPostsAction();
      if (res.success) {
        setPosts(res.data || []);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      console.error("ERRO AO BUSCAR FEED:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 120px" }} suppressHydrationWarning>

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
        {user && (
          <PostCreator />
        )}
      </div>

      {/* 🔴 MODAIS DE AUTH */}
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

      {/* 🔴 FEED REAL */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 32 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><LoaderPlaceholder /></div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, border: "2px dashed var(--line)", borderRadius: 32 }}>
            <p className="muted">Seja o primeiro a compartilhar no refúgio!</p>
          </div>
        ) : posts.map((post) => (
          <div key={post.id} className="card" style={{ padding: "0", borderRadius: 32, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ padding: "20px 24px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}><User size={20} className="muted" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <strong style={{ fontSize: 15, fontWeight: 800, display: "block", marginBottom: 2 }}>{post.profiles?.full_name || "Membro FéConecta"}</strong>
                    <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>
                      {formatRelativeTime(post.created_at)} • @{post.profiles?.username || "usuario"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {user?.id !== post.profile_id && (
                      <FollowButton
                        isFollowing={post.profiles?.is_following?.[0]?.count > 0}
                        targetId={post.profile_id}
                        authUser={user}
                      />
                    )}
                    {user?.id === post.profile_id && (
                      <PostOptionsMenu post={post} onRefresh={fetchPosts} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <PostContent post={post} onRefresh={() => fetchPosts(false)} />
            <PostInteractions post={post} onRefresh={() => fetchPosts(false)} />
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-only-creator { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function PostContent({ post, onRefresh }: { post: any, onRefresh: () => void }) {
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
        <img src={post.image_url} alt="" style={{ width: "100%", borderRadius: 20, marginTop: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
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
        <button
          onClick={async () => {
            const res = await prayPostAction(post.id);
            if (res.success) onRefresh();
            else alert(res.error);
          }}
          style={{
            marginTop: 24, background: post.user_prayed?.[0]?.count > 0 ? "white" : "linear-gradient(135deg, #10b981, #065f46)",
            border: post.user_prayed?.[0]?.count > 0 ? "2px solid #10b981" : "0",
            borderRadius: 100, padding: "12px 32px", color: post.user_prayed?.[0]?.count > 0 ? "#10b981" : "white",
            fontWeight: 900, fontSize: 14,
            boxShadow: post.user_prayed?.[0]?.count > 0 ? "none" : "0 10px 20px rgba(6, 95, 70, 0.2)", cursor: "pointer"
          }}
        >
          {post.user_prayed?.[0]?.count > 0 ? "🙏 REMOVER" : "🙏 ORAR"}
        </button>
      )}

      {post.metadata?.war_room_id && (
        <Link href={`/war-room/${post.metadata.war_room_id}`} style={{ 
          display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, 
          background: "white", color: "#0f766e", border: 0, 
          borderRadius: 100, padding: "12px 32px", fontWeight: 900, fontSize: 14,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)", textDecoration: "none",
          transition: "0.2s"
        }}>
          <Mic2 size={18} /> ENTRAR NA SALA AGORA
        </Link>
      )}
    </div>
  );
}

function PostInteractions({ post, onRefresh }: { post: any, onRefresh: () => void }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    const res = await likePostAction(post.id);
    if (!res.success) alert(res.error);
  };

  const handlePray = async () => {
    const res = await prayPostAction(post.id);
    if (res.success) onRefresh();
    else alert(res.error);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await commentPostAction(post.id, commentText);
    if (res.success) {
      setCommentText("");
      onRefresh();
    } else {
      alert(res.error);
    }
  };

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Refúgio FéConecta',
          text: post.content,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiado! 🙏");
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copiado! 🙏");
      }
    }
  };

  return (
    <div style={{ borderTop: "1px solid var(--line)", background: "white" }}>
      <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 20 }}>
          <button
            onClick={handleLike}
            style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700, color: "var(--muted)", cursor: "pointer" }}
          >
            <Heart size={18} fill={post.user_liked?.[0]?.count > 0 ? "#ef4444" : "none"} color={post.user_liked?.[0]?.count > 0 ? "#ef4444" : "var(--muted)"} /> <span style={{ color: post.user_liked?.[0]?.count > 0 ? "#ef4444" : "inherit" }}>{post.like_count?.[0]?.count || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700, color: "var(--muted)", cursor: "pointer" }}
          >
            <MessageSquare size={18} color={showComments ? "var(--primary)" : "currentColor"} /> {post.comment_count?.[0]?.count || 0}
          </button>
          {post.post_type === "oracao" && (
            <button onClick={handlePray} style={{ background: "none", border: 0, display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 800, color: "var(--primary)", cursor: "pointer" }}>
              🙏 <span style={{ textDecoration: "underline" }}>{post.prayer_count?.[0]?.count || 0} orando</span>
            </button>
          )}
        </div>
        <button onClick={handleShare} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--line)", border: 0, display: "grid", placeItems: "center", cursor: "pointer" }}><Share2 size={16} className="muted" /></button>
      </div>

      {showComments && (
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          {/* 🔴 LISTA DE COMENTÁRIOS */}
          <CommentsList post={post} onRefresh={onRefresh} />

          <form onSubmit={handleComment} style={{ display: "flex", gap: 10, padding: "0 24px 20px" }}>
            <input
              type="text"
              placeholder="Sua palavra de fé..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "1px solid var(--line)", outline: "none", fontSize: 13 }}
              autoFocus
            />
            <button type="submit" style={{ background: "var(--primary)", color: "white", border: 0, padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}

function PostOptionsMenu({ post, onRefresh }: { post: any, onRefresh: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("Deseja realmente excluir este post ministerial?")) {
      const res = await deletePostAction(post.id);
      if (res.success) onRefresh();
    }
  };

  const handleUpdate = async () => {
    const newContent = prompt("Edite sua mensagem:", post.content);
    if (newContent && newContent !== post.content) {
      const res = await updatePostAction(post.id, newContent);
      if (res.success) onRefresh();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: "none", border: 0, cursor: "pointer", color: "var(--muted)" }}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div style={{ position: "absolute", top: 24, right: 0, background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", borderRadius: 12, padding: 8, zIndex: 10, minWidth: 120 }}>
          <button onClick={handleUpdate} style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", padding: "8px 12px", background: "none", border: 0, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            <Edit2 size={14} /> Editar
          </button>
          <button onClick={handleDelete} style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", padding: "8px 12px", background: "none", border: 0, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#ef4444" }}>
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}

function CommentsList({ post, onRefresh }: { post: any, onRefresh: () => void }) {
  const [showAll, setShowAll] = useState(false);

  const comments = useMemo(() => {
    if (!post.comments) return [];
    // Organizar em árvore (apenas 1 nível de profundidade para simplicidade UX)
    const roots = post.comments.filter((c: any) => !c.parent_id);
    const replies = post.comments.filter((c: any) => c.parent_id);

    return roots.map((root: any) => ({
      ...root,
      children: replies.filter((reply: any) => reply.parent_id === root.id)
    }));
  }, [post.comments]);

  if (comments.length === 0) return null;

  const visibleComments = showAll ? comments : comments.slice(0, 2);

  return (
    <div style={{ padding: "0 24px 16px", borderTop: "0px solid var(--line)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {visibleComments.map((comment: any) => (
          <CommentItem key={comment.id} comment={comment} post={post} onRefresh={onRefresh} />
        ))}
      </div>

      {comments.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{ background: "none", border: 0, color: "var(--primary)", fontWeight: 800, fontSize: 12, marginTop: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
        >
          {showAll ? <><ChevronUp size={14} /> Ver menos</> : <><ChevronDown size={14} /> Ver todos os {comments.length} comentários</>}
        </button>
      )}
    </div>
  );
}

function CommentItem({ comment, post, onRefresh, isReply = false }: { comment: any, post: any, onRefresh: () => void, isReply?: boolean }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  // Perfil do autor do comentário para o @mention
  const authorUsername = comment.profiles?.username || "usuario";

  // Use state to track the current user for options
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data }: any) => setCurrentUser(data.user));
    }
  }, [supabase]);

  const handleReplyBtnClick = () => {
    setShowReplyInput(!showReplyInput);
    if (!showReplyInput) {
      setReplyText(`@${authorUsername} `);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const res = await commentPostAction(post.id, replyText, comment.id);
    if (res.success) {
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);
      onRefresh();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Deseja excluir seu comentário?")) {
      const res = await deleteCommentAction(comment.id);
      if (res.success) onRefresh();
    }
  };

  const handleUpdate = async () => {
    const newContent = prompt("Edite seu comentário:", comment.content);
    if (newContent && newContent !== comment.content) {
      const res = await updateCommentAction(comment.id, newContent);
      if (res.success) onRefresh();
    }
  };

  // Função para formatar o texto com @menções em negrito/cor
  const formatCommentText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith('@') ? (
        <span key={i} style={{ color: "var(--primary)", fontWeight: 800 }}>{part}</span>
      ) : part
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 10 }}>
        {isReply && <CornerDownRight size={14} className="muted" style={{ marginTop: 4, opacity: 0.5 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ background: "var(--bg)", padding: "10px 14px", borderRadius: 18, border: isReply ? "1px solid var(--line)" : "none", display: "inline-block", maxWidth: "100%", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <strong style={{ fontSize: 12, fontWeight: 800 }}>{comment.profiles?.full_name || "Membro"}</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, opacity: 0.5 }}>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {currentUser?.id === comment.profile_id && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={handleUpdate} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "var(--muted)" }} title="Editar"><Edit2 size={10} /></button>
                    <button onClick={handleDelete} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "#ef4444" }} title="Excluir"><Trash2 size={10} /></button>
                  </div>
                )}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{formatCommentText(comment.content)}</p>
          </div>

          {!isReply && (
            <div style={{ display: "flex", gap: 16, marginTop: 4, marginLeft: 14 }}>
              <button
                onClick={handleReplyBtnClick}
                style={{ background: "none", border: 0, padding: 0, fontSize: 11, fontWeight: 800, color: "var(--muted)", cursor: "pointer" }}
              >
                {showReplyInput ? "Cancelar" : "Responder"}
              </button>
              {comment.children?.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  style={{ background: "none", border: 0, padding: 0, fontSize: 11, fontWeight: 800, color: "var(--primary)", cursor: "pointer" }}
                >
                  {showReplies ? "Ocultar respostas" : `Ver ${comment.children.length} respostas`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showReplyInput && (
        <form onSubmit={handleReply} style={{ display: "flex", gap: 8, marginTop: 10, marginLeft: 24, padding: "8px", background: "rgba(0,0,0,0.02)", borderRadius: 12 }}>
          <input
            type="text"
            placeholder={`Respondendo a @${authorUsername}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", outline: "none", fontSize: 12 }}
            autoFocus
          />
          <button type="submit" style={{ background: "var(--primary)", color: "white", border: 0, padding: "4px 16px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Enviar</button>
        </form>
      )}

      {showReplies && comment.children?.length > 0 && (
        <div style={{ marginLeft: 28, marginTop: 12, display: "flex", flexDirection: "column", gap: 12, borderLeft: "2px solid var(--line)", paddingLeft: 16 }}>
          {comment.children.map((child: any) => (
            <CommentItem key={child.id} comment={child} post={post} onRefresh={onRefresh} isReply />
          ))}
        </div>
      )}
    </div>
  );
}

function LoaderPlaceholder() {
  return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Sparkles size={24} className="spin muted" /></div>;
}
