"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, use } from "react";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  User, 
  Settings, 
  MapPin, 
  Calendar, 
  Instagram, 
  Phone, 
  MessageCircle, 
  ChevronLeft,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = createClient();
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resolvedParams.username) {
      fetchProfileData();
    }
  }, [resolvedParams.username]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      let targetUsername = resolvedParams.username;

      // 🛡️ REDIRECIONAMENTO INTELIGENTE (ATALHO '/me')
      if (targetUsername === "me") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          targetUsername = user.user_metadata.username || user.email?.split('@')[0];
        } else {
          throw new Error("Usuário não autenticado para '/me'");
        }
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', targetUsername)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('created_at', { ascending: false });
      
      setPosts(postData || []);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 100 }}><Settings className="spin muted" /> Carregando Refúgio...</div>;
  if (!profile) return <div style={{ textAlign: "center", padding: 100 }}>Membro não encontrado no Refúgio. 🙏</div>;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 0 120px", background: "white" }}>
      
      {/* 🔴 HEADER */}
      <header style={{ 
        padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, 
        position: "sticky", top: 0, background: "rgba(255,255,255,0.8)", 
        backdropFilter: "blur(12px)", zIndex: 10 
      }}>
        <Link href="/" style={{ color: "black" }}><ChevronLeft size={24} /></Link>
        <div>
           <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{profile.full_name || "Membro"}</h2>
           <p className="muted" style={{ margin: 0, fontSize: 11 }}>{posts.length} publicações</p>
        </div>
        <button style={{ marginLeft: "auto", background: "none", border: 0 }}><Settings size={20} className="muted" /></button>
      </header>

      {/* 🔴 CAPA */}
      <div style={{ position: "relative" }}>
        <div style={{ 
          height: 180, 
          background: profile.cover_url ? `url(${profile.cover_url}) center/cover` : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: "0 0 32px 32px",
          position: "relative",
          overflow: "hidden"
        }}>
           <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1, background: "url('https://www.transparenttextures.com/patterns/church.png')" }}></div>
        </div>
        
        <div style={{ padding: "0 24px" }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: 32, background: "white", 
            border: "6px solid white", marginTop: -50, position: "relative",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflow: "hidden"
          }}>
             {profile.avatar_url ? (
               <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
             ) : (
               <div style={{ width: "100%", height: "100%", background: "var(--line)", display: "grid", placeItems: "center" }}>
                  <User size={48} className="muted" />
               </div>
             )}
          </div>
        </div>
      </div>

      {/* 🔴 INFOS */}
      <div style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{profile.full_name}</h1>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.95rem" }}>@{profile.username}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
             <button 
               onClick={() => setIsFollowing(!isFollowing)}
               style={{ 
                 padding: "10px 24px", borderRadius: 14, fontSize: 14, fontWeight: 800,
                 background: isFollowing ? "var(--line)" : "var(--primary)",
                 color: isFollowing ? "var(--foreground)" : "white", border: 0, cursor: "pointer"
               }}
             >
               {isFollowing ? "Seguindo" : "Seguir"}
             </button>
             <button style={{ background: "var(--line)", border: 0, padding: 12, borderRadius: 14, cursor: "pointer" }}><MessageCircle size={20} /></button>
          </div>
        </div>

        <p style={{ margin: "0 0 20px 0", fontSize: "0.95rem", lineHeight: 1.6, color: "#333" }}>
          {profile.bio || "Buscando edificar vidas através da fé e da comunhão no Refúgio FéConecta. 🙏📖"}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          {profile.church && (
            <div className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <MapPin size={14} /> {profile.church}
            </div>
          )}
          <div className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Calendar size={14} /> Membro desde {new Date(profile.created_at).getFullYear()}
          </div>
        </div>

        {/* 🔴 CONTADORES */}
        <div style={{ display: "flex", gap: 32, marginBottom: 24, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "16px 0" }}>
           <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800 }}>{profile.follower_count || 0}</span>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Seguidores</span>
           </div>
           <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800 }}>{profile.following_count || 0}</span>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Seguindo</span>
           </div>
           <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800 }}>{posts.length}</span>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Impactos</span>
           </div>
        </div>

        {/* 🔴 LINKS SOCIAIS */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
           {[
             { icon: Instagram, label: "Instagram" },
             { icon: Phone, label: "WhatsApp" },
             { icon: Globe, label: "Website" },
           ].map((social, idx) => (
             <button key={idx} style={{ 
               flex: 1, display: "flex", alignItems: "center", justifyContent: "center", 
               gap: 8, padding: "10px", borderRadius: 12, background: "var(--line)", 
               border: 0, fontSize: 12, fontWeight: 700, cursor: "pointer"
             }}>
               <social.icon size={16} /> {social.label}
             </button>
           ))}
        </div>

        {/* 🔴 FEED PESSOAL REAL */}
        <div style={{ borderBottom: "1px solid var(--line)", marginBottom: 20, display: "flex" }}>
           <button style={{ flex: 1, padding: "12px 0", border: 0, background: "none", borderBottom: "3px solid var(--primary)", fontWeight: 800, fontSize: 14 }}>Publicações</button>
        </div>

        <div className="grid" style={{ gap: 20 }}>
           {posts.length === 0 ? (
             <div style={{ textAlign: "center", padding: 40, border: "2px dashed var(--line)", borderRadius: 32 }}>
                <p className="muted">Nenhuma publicação ministerial ainda. 🙏</p>
             </div>
           ) : posts.map(post => (
             <div key={post.id} className="card" style={{ padding: 20, borderRadius: 24 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{post.content}</p>
                <div style={{ display: "flex", gap: 16, marginTop: 16, opacity: 0.6 }}>
                  <span style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}><Heart size={14} /> 0</span>
                  <span style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}><MessageSquare size={14} /> 0</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
