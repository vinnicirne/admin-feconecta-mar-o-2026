"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/app/feed/post-card";
import { Button } from "@/components/ui/button";

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      setLoading(true);
      // Busca específica do post com todos os detalhes
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *, 
          profiles!profile_id(full_name, username, avatar_url), 
          like_count:post_likes(count), 
          comment_count:comments(count), 
          prayer_count:post_prayers(count),
          repost_count:post_reposts(count),
          share_count:post_shares(count),
          user_liked:post_likes(profile_id),
          user_prayed:post_prayers(profile_id),
          user_reposted:post_reposts(profile_id),
          comments(
            id, 
            content, 
            created_at, 
            profile_id, 
            parent_id,
            profiles:profile_id(full_name, username, avatar_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error("Erro post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPost();
  }, [id, supabase]);

  if (loading) return (
     <div style={{ minHeight: "80vh", display: "grid", placeItems: "center" }}>
        <Loader2 size={32} className="spin primary" />
     </div>
  );

  if (!post) return (
     <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ fontWeight: 900 }}>Palavra não encontrada 🙏</h2>
        <p className="muted" style={{ marginBottom: 24 }}>Esta postagem pode ter sido removida ou está aguardando moderação.</p>
        <Button onClick={() => router.push('/')} variant="primary" style={{ borderRadius: 100, padding: "12px 32px" }}>Voltar ao Altar</Button>
     </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 80px" }}>
       
       <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <button onClick={() => router.back()} style={{ width: 44, height: 44, borderRadius: 14, background: "white", border: "1px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer" }}>
             <ChevronLeft size={20} className="muted" />
          </button>
          <div style={{ display: "flex", flexDirection: "column" }}>
             <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--muted)" }}>Luz Ministerial</span>
             <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Palavra de Edificação</h1>
          </div>
       </div>

       <PostCard post={post} onRefresh={fetchPost} />

       <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>FéConecta © 2026 • A Glória é de Deus</p>
       </div>

    </div>
  );
}
