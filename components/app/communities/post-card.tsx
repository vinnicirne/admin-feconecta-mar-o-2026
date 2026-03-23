"use client";

import { AppPost } from "@/types";
import { Users, Flame, MessageSquare, Share2, Repeat2, Loader2, Send, Pencil, Trash2, Reply } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { 
  prayPostAction, 
  commentPostAction, 
  sharePostAction, 
  repostPostAction,
  updateCommentAction,
  deleteCommentAction 
} from "@/app/actions/interaction-actions";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

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
  const [loading, setLoading] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  const [editingComment, setEditingComment] = useState<{ id: string, content: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  // ⚡ ESTADOS DE REALTIME & ANIMAÇÃO
  const supabase = useMemo(() => createClient(), []);
  const [localPrayers, setLocalPrayers] = useState(getCount(post.prayer_count));
  const [isImpacted, setIsImpacted] = useState(false);
  const [activePrayersNow, setActivePrayersNow] = useState(0);

  // Sincronizar contador inicial se post mudar
  useEffect(() => {
    setLocalPrayers(getCount(post.prayer_count));
  }, [post.prayer_count]);

  useEffect(() => {
    const channel = supabase.channel(`prayer_impact:${post.id}`)
      .on('broadcast', { event: 'prayer_sent' }, () => {
        setLocalPrayers((prev: number) => prev + 1);
        setIsImpacted(true);
        setActivePrayersNow((prev: number) => prev + 1);
        setTimeout(() => {
          setIsImpacted(false);
          setActivePrayersNow(prev => Math.max(0, prev - 1));
        }, 3000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [post.id, supabase]);

  const handleAction = async (type: "pray" | "share" | "repost") => {
    setLoading(type);
    try {
      let res;
      
      // 🚨 SOLUÇÃO DE COMPARTILHAMENTO EXTERNO
      if (type === "share") {
        res = await sharePostAction(post.id);
        const url = `${window.location.origin}/post/${post.id}`;
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: "FéConecta 🕊️",
              text: post.content,
              url,
            });
          } catch (e) {
            console.warn("Share cancelado.");
          }
        } else {
          await navigator.clipboard.writeText(url);
          toast("Link Copiado 🔗", "Espalhe essa palavra agora! 🙏", "success");
        }
        setLoading(null);
        if (onRefresh) onRefresh();
        return;
      }

      // 🔄 REPOSTAGEM (INTERNA)
      if (type === "repost") {
        res = await repostPostAction(post.id);
        if (res?.success && onRefresh) onRefresh();
        else if (res?.error) toast("Ops", res.error, "error");
      }

      // 🙏 ORAÇÃO
      if (type === "pray") {
        res = await prayPostAction(post.id);
        if (res?.success) {
          // Emite impacto para outros usuários
          await supabase.channel(`prayer_impact:${post.id}`).send({
            type: 'broadcast',
            event: 'prayer_sent',
            payload: { postId: post.id }
          });
          setLocalPrayers((prev: number) => prev + (hasPrayed ? -1 : 1));
          if (onRefresh) onRefresh();
        }
        else if (res?.error) toast("Ops", res.error, "error");
      }

    } catch (err: any) {
      toast("Erro", "Conexão ministerial falhou.", "error");
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

  return (
    <Card variant="elevated" padding={20} style={{ marginBottom: 12 }}>
      {post.metadata?.is_repost && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, opacity: 0.8, color: "var(--primary)" }}>
          <Repeat2 size={14} />
          <span style={{ fontSize: 12, fontWeight: 700 }}>
            {post.author?.full_name || "Membro"} repostou a palavra de {post.metadata.original_author_name}
          </span>
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
        <div>
          <strong style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{post.profiles?.full_name || post.author?.full_name}</strong>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            @{post.profiles?.username || post.author?.username || "membro"} • {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "#334155", fontWeight: 500 }}>{post.content}</p>
      
      {/* 🛡️ BOTÃO DE ENTRADA NA SALA DE GUERRA (POSTERS ESPECIAIS) */}
      {post.metadata?.war_room_id && (
        <div style={{ marginTop: 16 }}>
          <Button 
            variant="primary" 
            style={{ width: "100%", height: 46, borderRadius: 12, fontWeight: 800, gap: 10 }}
            onClick={() => window.location.href = `/war-room/${post.metadata.war_room_id}`}
          >
            <Users size={18} /> ENTRAR NA SALA DE GUERRA AGORA
          </Button>
        </div>
      )}
      
      {/* BOTÕES DE AÇÃO PRINCIPAIS */}
      <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "space-between", position: "relative" }}>
        
        {/* GAMIFICAÇÃO LEVE: PESSOAS ORANDO AGORA */}
        {activePrayersNow > 0 && (
          <div className="prayer-badge-float" style={{ position: "absolute", top: -45, left: 12, background: "var(--primary)", color: "white", padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)", zIndex: 10, animation: "float-up 0.5s ease-out" }}>
            <Flame size={14} className="spin" /> {activePrayersNow + (localPrayers > 5 ? 7 : 1)} pessoas orando por isso agora!
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={() => handleAction("pray")} disabled={loading === "pray"} style={{ fontWeight: 800, gap: 6, padding: "8px 12px", position: "relative" }}>
           {loading === "pray" ? <Loader2 size={16} className="spin" /> : <Flame size={20} style={{ color: hasPrayed ? "#f97316" : "var(--muted)", fill: hasPrayed ? "#ef4444" : "none", transform: isImpacted ? "scale(1.4)" : "scale(1)", transition: "0.2s" }} />} 
           <span style={{ fontSize: 14, color: hasPrayed ? "#ef4444" : "inherit" }}>{localPrayers}</span>
           
           {/* ANIMAÇÃO DE IMPACTO (+1) */}
           {isImpacted && !hasPrayed && (
             <span style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", color: "var(--primary)", fontWeight: 900, animation: "float-up 1s forwards" }}>+1 🙏</span>
           )}
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
           <Share2 size={20} className="muted" /> 
           <span style={{ fontSize: 14 }}>{getCount(post.share_count)}</span>
        </Button>
      </div>

      {/* SEÇÃO DE COMENTÁRIOS EXPANSÍVEL */}
      {showComments && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
           
           <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
             {topLevelComments.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", margin: "8px 0" }}>Nenhum comentário por aqui ainda. 🙏</p>
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
                              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                <button onClick={() => { setEditingComment({ id: reply.id, content: reply.content }); setCommentText(reply.content); }} style={{ border: "none", background: "none", fontSize: 10, fontWeight: 700, color: "var(--muted)", cursor: "pointer" }}>Editar</button>
                                <button onClick={() => { setCommentToDelete(reply.id); setIsDeleteModalOpen(true); }} style={{ border: "none", background: "none", fontSize: 10, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Excluir</button>
                              </div>
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-up {
          0% { transform: translate(-50%, 0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(-50%, -40px); opacity: 0; }
        }
        .prayer-badge-float {
           animation: slide-in 0.3s ease-out;
        }
        @keyframes slide-in {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </Card>
  );
}, (prev: any, next: any) => (
  JSON.stringify(prev.post) === JSON.stringify(next.post)
));
