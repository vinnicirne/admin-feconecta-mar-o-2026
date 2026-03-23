"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Flame, 
  Music, 
  Users, 
  Heart, 
  Radio,
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Volume2,
  LayoutGrid,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// UI Components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostCreatorClean as PostCreator } from "@/components/app/feed/post-creator-clean";
import { PostCard } from "@/components/app/feed/post-card";
import { DailyDevotional } from "@/components/app/feed/daily-devotional";
import { getPostsAction } from "@/app/actions/post-actions";
import { useAuth } from "@/hooks/use-auth";

export default function DeepSpiritualDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  
  const [isMounted, setIsMounted] = useState(false);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    fetchRooms();
    fetchPosts();
  }, [supabase]);

  const fetchRooms = async () => {
    const { data } = await supabase.from('prayer_rooms').select('*, host:profiles!host_id(full_name)').eq('status', 'live').limit(3);
    if (data) setActiveRooms(data);
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await getPostsAction() as any;
      if (res && res.data) setPosts(res.data);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  if (!isMounted) return <div style={{ minHeight: "100vh", background: "#f8fafc" }} />;

  return (
    <div className="feed-root" style={{
      minHeight: "100vh",
      background: "#f8fafc",
      color: "var(--foreground)",
      padding: "16px 16px 100px",
      fontFamily: "'Inter', sans-serif",
      overflowX: "hidden"
    }}>
      
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        

        {/* 🎧 FEED & CRIADOR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
           <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <TrendingUp size={18} className="primary" />
              <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", color: "var(--muted)", letterSpacing: 1.5 }}>Timeline Ministerial</h3>
           </div>
           
           <PostCreator onSuccess={fetchPosts} />
           
           <DailyDevotional />

           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             {postsLoading && posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                   <Loader2 size={32} className="spin primary" style={{ margin: "0 auto" }} />
                   <p style={{ marginTop: 16, fontWeight: 800, color: "var(--muted)", fontSize: 12 }}>SINCRONIZANDO ALTAR...</p>
                </div>
             ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: 40, border: "2px dashed var(--line)" }}>
                   <Sparkles size={32} className="muted" style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                   <p className="muted" style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Nenhuma edificação no momento 🙏</p>
                   <p className="muted" style={{ fontSize: 14 }}>Seja o primeiro a semear uma palavra hoje!</p>
                </div>
             ) : (
               posts.map(post => (
                 <PostCard key={post.id} post={post} onRefresh={fetchPosts} />
               ))
             )}
           </div>
        </div>

      </div>

      <style jsx global>{`
        .feed-root { 
          padding: 12px 12px 100px !important; 
        }
        @media (min-width: 768px) {
          .feed-root { padding: 32px 24px 100px !important; }
        }
        .btn-altar-light {
          padding: 20px 48px;
          border-radius: 20px;
          background: #F5C76B;
          color: #1e1b4b;
          font-weight: 900;
          font-size: 16px;
          border: 0;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(245, 199, 107, 0.4);
          transition: 0.3s;
        }
        .btn-altar-light:hover { transform: scale(1.05); }
        .muted { color: var(--muted); }
        .primary { color: var(--primary); }
      `}</style>
    </div>
  );
}
