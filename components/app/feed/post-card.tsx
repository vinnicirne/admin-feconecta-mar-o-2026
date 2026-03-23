"use client";

import { AppPost } from "@/types";
import { Users, Flame, MessageSquare, Share2, Repeat2, Loader2, Send, Pencil, Trash2, Reply, Volume2, Heart, Mic2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ShareModal } from "@/components/ui/share-modal";
import React, { useState } from "react";
import { 
  prayPostAction, 
  commentPostAction, 
  sharePostAction, 
  repostPostAction,
  updateCommentAction,
  deleteCommentAction,
  getWarRoomStatusAction,
  updatePostAction,
  deletePostAction
} from "@/app/actions/interaction-actions";
import TextEditorModal from "./text-editor-modal";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useFeatures } from "@/hooks/use-features";
import { useRouter } from "next/navigation";

const getCount = (field: any) => {
  if (typeof field === 'number') return field;
  if (Array.isArray(field)) return field[0]?.count || 0;
  if (typeof field === 'object' && field !== null) return field.count || 0;
  return 0;
};

interface PostCardProps {
  post: any;
  onRefresh?: () => void;
}

export const PostCard = React.memo(({ post, onRefresh }: PostCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const { isEnabled, features } = useFeatures();
  const [loading, setLoading] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Estados para edição e resposta
  const [editingComment, setEditingComment] = useState<{ id: string, content: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);

  // Estados para Modal de Confirmação (RADIX)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  
  // Edição de Post
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const handleAction = async (type: "pray" | "share" | "repost" | "delete") => {
    setLoading(type);
    try {
      let res;
      if (type === "pray") {
        res = await prayPostAction(post.id);
      }
      
      if (type === "share") {
        await sharePostAction(post.id);
        const url = `${window.location.origin}/post/${post.id}`;
        setShareUrl(url);
        
        if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          try {
            await navigator.share({ title: "FéConecta 🕊️", text: post.content, url });
          } catch (e) {
            setIsShareModalOpen(true);
          }
        } else {
          setIsShareModalOpen(true);
        }
        if (onRefresh) onRefresh();
        return;
      }

      if (type === "repost") {
        res = await repostPostAction(post.id);
      }

      if (type === "delete") {
        res = await deletePostAction(post.id);
      }

      if (res?.success) {
        if (onRefresh) onRefresh();
      } else if (res?.error) {
        toast("Ops", res.error, "error");
      }
    } catch (err: any) {
      toast("Erro", "Falha na conexão ministerial.", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    setLoading("comment");
    try {
      let res;
      if (editingComment) {
        res = await updateCommentAction(editingComment.id, commentText);
      } else {
        res = await commentPostAction(post.id, commentText, replyingTo?.id);
      }

      if (res.success) {
        setCommentText("");
        setEditingComment(null);
        setReplyingTo(null);
        if (onRefresh) onRefresh();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast("Erro", err.message, "error");
    } finally {
      setLoading(null);
    }
  };

  const executeDeleteComment = async () => {
    if (!commentToDelete) return;
    setLoading(`delete-${commentToDelete}`);
    try {
      const res = await deleteCommentAction(commentToDelete);
      if (res.success) {
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      toast("Erro", "Não foi possível remover.", "error");
    } finally {
      setLoading(null);
      setCommentToDelete(null);
    }
  };

  const hasPrayed = getCount(post.user_prayed) > 0;
  const hasReposted = getCount(post.user_reposted) > 0;
  const comments = post.comments || [];
  const topLevelComments = comments.filter((c: any) => !c.parent_id);
  
  const isEdificar = post.post_type === "edificar" || post.post_type === "testemunho" || post.post_type === "vitoria";
  const isAwardRoom = post.metadata?.war_room_id; // Identifica se é convite pra sala
  const showJoinButton = isAwardRoom; 

  const handleJoinRoom = async () => {
    if (!post.metadata?.war_room_id) return;
    
    // Controle via Dashboard: Ativo por padrão se não existir no banco (Segurança do Altar)
    const isValidationActive = !features.has('war_room_status_validation') || isEnabled('war_room_status_validation');
    
    if (isValidationActive) {
      setLoading('joining');
      const { status } = await getWarRoomStatusAction(post.metadata.war_room_id);
      setLoading(null);

      if (status !== 'live' && status !== 'scheduled') {
        toast("Sala Encerrada", "Esta Sala de Guerra já foi concluída no altar. 🙏", "error");
        onRefresh?.();
        return;
      }
    }

    router.push(`/war-room/${post.metadata.war_room_id}`);
  };

  return (
    <Card variant="elevated" padding={20} style={{ marginBottom: 16 }}>
      
      {post.metadata?.is_repost && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, color: "var(--primary)", fontSize: 11, fontWeight: 800 }}>
          <Repeat2 size={14} />
          <span>REPOSTADO POR {post.profiles?.full_name?.toUpperCase()}</span>
        </div>
      )}

      {/* HEADER DO POST */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--primary-soft)", display: "grid", placeItems: "center", overflow: "hidden" }}>
          {post.profiles?.avatar_url || post.author?.avatar_url ? (
             <img src={post.profiles?.avatar_url || post.author?.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
             <Users size={20} className="primary" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ display: "block", fontSize: 15, fontWeight: 800, color: "inherit" }}>{post.profiles?.full_name || post.author?.full_name}</strong>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            @{post.profiles?.username || post.author?.username || "membro"} • {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        {user?.id === post.profile_id && (
          <div style={{ display: "flex", gap: 4 }}>
             <button onClick={() => setIsEditingPost(true)} style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", padding: 4 }}><Pencil size={16} /></button>
             <button onClick={() => setIsDeletingPost(true)} style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", padding: 4 }}><Trash2 size={16} /></button>
          </div>
        )}
      </div>
      
      <div style={{ 
        background: post.media_type === "text" && post.background_style !== "transparent" ? post.background_style : isEdificar ? "rgba(16, 185, 129, 0.05)" : "transparent",
        padding: post.media_type === "text" && post.background_style !== "transparent" ? "48px 32px" : isEdificar ? "24px" : "0",
        borderRadius: "28px",
        border: isEdificar ? "1px dashed rgba(16, 185, 129, 0.2)" : "none",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: post.media_type === "text" && post.background_style !== "transparent" ? "center" : "flex-start",
        textAlign: post.media_type === "text" && post.background_style !== "transparent" ? "center" : "left",
        minHeight: post.media_type === "text" && post.background_style !== "transparent" ? 200 : "auto",
        justifyContent: "center",
        boxShadow: post.media_type === "text" && post.background_style !== "transparent" ? "0 20px 50px rgba(0,0,0,0.15)" : "none",
        color: post.media_type === "text" && post.background_style !== "transparent" ? "white" : "#334155"
      }}>
        {post.media_type === "text" ? (
           <div 
             style={{ 
               fontSize: post.background_style !== "transparent" ? "1.4rem" : "1rem", 
               fontWeight: post.background_style !== "transparent" ? 900 : 500,
               lineHeight: 1.5,
               fontFamily: post.font_family || "inherit"
             }}
             dangerouslySetInnerHTML={{ __html: post.content }}
           />
        ) : (
           <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "inherit", fontWeight: 500 }}>{post.content}</p>
        )}

        {showJoinButton && (
          <div style={{ marginTop: 20 }}>
            <button 
              onClick={handleJoinRoom}
              disabled={loading === 'joining'}
              style={{ 
                width: "100%", padding: "16px", borderRadius: "16px", border: 0, 
                background: "var(--primary)", color: "white", fontWeight: 900, 
                fontSize: 14, cursor: "pointer", transition: "0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 10px 30px rgba(15, 118, 110, 0.2)",
                opacity: loading === 'joining' ? 0.7 : 1
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading === 'joining' ? <Loader2 className="spin" size={18} /> : <Mic2 size={18} />}
              {loading === 'joining' ? 'VERIFICANDO ALTAR...' : 'ENTRAR NA SALA DE GUERRA 🙌'}
            </button>
          </div>
        )}

        {(post.image_url || post.media_url) && (post.media_type === 'image' || post.post_type === 'image') && (
          <div style={{ position: "relative", marginTop: 16 }}>
            <img src={post.image_url || post.media_url} style={{ width: "100%", borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", objectFit: "cover", maxHeight: 500 }} />
            {post.metadata?.overlay_text && (
               <div style={{ position: "absolute", top: "40%", left: "10%", right: "10%", textAlign: "center", color: "white", fontSize: "1.2rem", fontWeight: 900, textShadow: "0 2px 10px rgba(0,0,0,0.5)", background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: 12 }}>{post.metadata.overlay_text}</div>
            )}
          </div>
        )}

        {(post.image_url || post.media_url) && (post.media_type === 'video' || post.post_type === 'video') && (
          <div style={{ position: "relative", marginTop: 16 }}>
            <video src={post.image_url || post.media_url} controls playsInline style={{ width: "100%", borderRadius: 20, background: "black", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }} />
            {post.metadata?.overlay_text && (
               <div style={{ position: "absolute", top: "40%", left: "10%", right: "10%", textAlign: "center", color: "white", fontSize: "1.2rem", fontWeight: 900, textShadow: "0 2px 10px rgba(0,0,0,0.5)", pointerEvents: "none", background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: 12 }}>{post.metadata.overlay_text}</div>
            )}
          </div>
        )}

        {(post.image_url || post.media_url) && (post.media_type === 'audio' || post.post_type === 'audio') && (
          <div style={{ marginTop: 16, background: "var(--line)", padding: "16px", borderRadius: 16, display: "flex", alignItems: "center", gap: 12 }}>
             <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary)", display: "grid", placeItems: "center", color: "white" }}><Volume2 size={20} /></div>
             <audio src={post.image_url || post.media_url} controls style={{ flex: 1, height: 32 }} />
          </div>
        )}
      </div>
      
      {/* BOTÕES DE AÇÃO PRINCIPAIS */}
      <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "space-between" }}>
        <Button variant="ghost" size="sm" onClick={() => handleAction("pray")} disabled={loading === "pray"} style={{ fontWeight: 800, gap: 6, padding: "8px 12px" }}>
           {loading === "pray" ? <Loader2 size={16} className="spin" /> : <Flame size={20} style={{ color: hasPrayed ? "#f97316" : "var(--muted)", fill: hasPrayed ? "#ef4444" : "none" }} />} 
           <span style={{ fontSize: 14, color: hasPrayed ? "#ef4444" : "inherit" }}>{getCount(post.prayer_count)}</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={() => handleAction("repost")} disabled={loading === "repost"} style={{ fontWeight: 800, gap: 6, padding: "8px 12px" }}>
           {loading === "repost" ? <Loader2 size={16} className="spin" /> : <Repeat2 size={20} style={{ color: hasReposted ? "var(--primary)" : "var(--muted)" }} />} 
           <span style={{ fontSize: 14, color: hasReposted ? "var(--primary)" : "inherit" }}>{getCount(post.repost_count)}</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} style={{ fontWeight: 800, gap: 6, padding: "8px 12px", color: showComments ? "var(--primary)" : "inherit" }}>
           <MessageSquare size={20} className={showComments ? "primary" : "muted"} /> 
           <span style={{ fontSize: 14 }}>{getCount(post.comment_count)}</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={() => handleAction("share")} disabled={loading === "share"} style={{ fontWeight: 800, gap: 6, padding: "8px 12px" }}>
           {loading === "share" ? <Loader2 size={16} className="spin" /> : <Share2 size={20} className="muted" />} 
           <span style={{ fontSize: 14 }}>{getCount(post.share_count)}</span>
        </Button>
      </div>

      {/* SEÇÃO DE COMENTÁRIOS EXPANSÍVEL */}
      {showComments && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
           
           <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
             {topLevelComments.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", margin: "8px 0" }}>Nenhum comentário ainda. 🙏</p>
             ) : topLevelComments.map((comment: any) => {
                const replies = comments.filter((r: any) => r.parent_id === comment.id);
                return (
                  <div key={comment.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--line)", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
                          {comment.profiles?.avatar_url ? <img src={comment.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Users size={14} className="muted" />}
                      </div>
                      <div style={{ flex: 1 }}>
                          <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "0 12px 12px 12px" }}>
                            <strong style={{ fontSize: 12, display: "block", marginBottom: 2 }}>{comment.profiles?.full_name}</strong>
                            <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.4 }}>{comment.content}</p>
                          </div>
                          
                          <div style={{ display: "flex", gap: 12, marginTop: 4, marginLeft: 4 }}>
                            <button onClick={() => setReplyingTo({ id: comment.id, name: comment.profiles?.full_name })} style={{ border: "none", background: "none", fontSize: 11, fontWeight: 700, color: "var(--muted)", cursor: "pointer" }}>Responder</button>
                            {user?.id === comment.profile_id && (
                              <>
                                <button onClick={() => { setEditingComment({ id: comment.id, content: comment.content }); setCommentText(comment.content); }} style={{ border: "none", background: "none", fontSize: 11, fontWeight: 700, color: "var(--muted)", cursor: "pointer" }}>Editar</button>
                                <button onClick={() => { setCommentToDelete(comment.id); setIsDeleteModalOpen(true); }} style={{ border: "none", background: "none", fontSize: 11, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Excluir</button>
                              </>
                            )}
                          </div>
                      </div>
                    </div>

                    {/* RESPOSTAS INDENTADAS */}
                    {replies.map((reply: any) => (
                      <div key={reply.id} style={{ display: "flex", gap: 8, marginLeft: 38, marginTop: -4 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--line)", overflow: "hidden", flexShrink: 0 }}>
                            <img src={reply.profiles?.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, background: "#f8fafc", padding: "6px 10px", borderRadius: "0 10px 10px 10px", border: "1px solid #e2e8f0" }}>
                            <strong style={{ fontSize: 11, display: "block" }}>{reply.profiles?.full_name}</strong>
                            <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>{reply.content}</p>
                            {user?.id === reply.profile_id && (
                                <button onClick={() => { setCommentToDelete(reply.id); setIsDeleteModalOpen(true); }} style={{ border: "none", background: "none", fontSize: 10, fontWeight: 700, color: "#ef4444", cursor: "pointer", marginTop: 4 }}>Excluir</button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
             })}
           </div>

           {/* INPUT DE COMENTÁRIO DINÂMICO */}
           <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", background: "#f8fafc" }}>
             {(editingComment || replyingTo) && (
               <div style={{ padding: "4px 12px", background: "var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <span style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)" }}>
                   {editingComment ? "EDITANDO PALAVRA" : `RESPONDENDO A ${replyingTo?.name?.toUpperCase()}`}
                 </span>
                 <button onClick={() => { setEditingComment(null); setReplyingTo(null); setCommentText(""); }} style={{ border: "none", background: "none", fontSize: 10, fontWeight: 900, cursor: "pointer" }}>CANCELAR</button>
               </div>
             )}
             <div style={{ display: "flex", gap: 8, padding: 8 }}>
               <input autoFocus value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={replyingTo ? "Sua resposta..." : "Amém..."} style={{ flex: 1, padding: "8px 12px", border: "none", background: "transparent", fontSize: 13, outline: "none" }} onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit(); }} />
               <Button variant="primary" size="sm" onClick={handleCommentSubmit} disabled={loading === "comment" || !commentText.trim()} style={{ height: 34, width: 34, padding: 0 }}>
                  {loading === "comment" ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
               </Button>
             </div>
           </div>
        </div>
      )}

      {/* 🛡️ MODAL DE CONFIRMAÇÃO (RADIX) */}
      <ConfirmModal 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen}
        title="Remover Comentário?"
        description="Esta ação não pode ser desfeita. Deseja realmente remover esta palavra de edificação?"
        onConfirm={executeDeleteComment}
        loading={loading?.startsWith("delete-")}
      />

      <ShareModal 
        open={isShareModalOpen} 
        onOpenChange={setIsShareModalOpen} 
        postUrl={shareUrl} 
        postContent={post.content || ""} 
      />

      <ConfirmModal 
        open={isDeletingPost} 
        onOpenChange={setIsDeletingPost}
        title="Remover Edificação?"
        description="Esta ação removerá permanentemente esta semente do feed. Deseja continuar?"
        onConfirm={() => handleAction("delete")}
        loading={loading === "delete"}
      />

      <TextEditorModal 
        open={isEditingPost}
        onClose={() => setIsEditingPost(false)}
        initialContent={post.content}
        initialBackground={post.background_style}
        onSubmit={async (data) => {
          const res = await updatePostAction(post.id, data.content, { 
            background_style: data.background_style,
            font_family: data.font_family 
          });
          if (res.success) {
            onRefresh?.();
            setIsEditingPost(false);
          } else {
             toast("Erro", res.error, "error");
          }
        }}
      />
    </Card>
  );
}, (prev, next) => (
  JSON.stringify(prev.post) === JSON.stringify(next.post)
));
