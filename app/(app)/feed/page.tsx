"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Search,
  Loader2,
  Bell,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// UI Components
import { PostCreatorClean as PostCreator } from "@/components/app/feed/post-creator-clean";
import { PostCard } from "@/components/app/feed/post-card";
import { getPostsAction } from "@/app/actions/post-actions";
import { useAuth } from "@/hooks/use-auth";

export default function FeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchPosts();
  }, [supabase]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getPostsAction() as any;
      if (res && res.data) setPosts(res.data);
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px 100px" }}>
      
      {/* 🔴 HEADER DO FEED */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "24px 0 32px" 
      }}>
        <div>
           <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }}></div>
              <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--muted)" }}>Timeline Ministerial</span>
           </div>
           <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Caminho de Paz</h1>
        </div>
        
        <div style={{ display: "flex", gap: 12 }}>
           <button 
             onClick={fetchPosts}
             style={{ width: 44, height: 44, borderRadius: 14, background: "white", border: "1px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer" }}
           >
             {loading ? <Loader2 size={18} className="spin primary" /> : <Sparkles size={18} className="primary" />}
           </button>
        </div>
      </header>

      {/* 🔴 CRIADOR DE CONTEÚDO */}
      <PostCreator onSuccess={fetchPosts} />

      {/* 🔴 LISTA DE PUBLICAÇÕES (UNIFICADA) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 40 }}>
        {loading && posts.length === 0 ? (
           <div style={{ textAlign: "center", padding: 60 }}>
              <Loader2 size={32} className="spin primary" style={{ margin: "0 auto" }} />
              <p className="muted" style={{ marginTop: 16, fontWeight: 600 }}>Sincronizando altar...</p>
           </div>
        ) : posts.length === 0 ? (
           <div style={{ textAlign: "center", padding: 80, border: "2px dashed var(--line)", borderRadius: 40 }}>
              <p className="muted" style={{ fontWeight: 600 }}>Seja o primeiro a edificar hoje! 🙏</p>
           </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onRefresh={fetchPosts} />
          ))
        )}
      </div>

      <style jsx global>{`
        body { background: #fbfbfc !important; }
      `}</style>
    </div>
  );
}
