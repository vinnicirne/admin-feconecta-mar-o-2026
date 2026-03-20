"use client";

import { use, useState } from "react";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  User, 
  Settings, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Instagram, 
  Phone, 
  MessageCircle, 
  MoreVertical,
  ChevronLeft,
  Lock,
  Globe,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const [isFollowing, setIsFollowing] = useState(false);
  const userUsername = resolvedParams.username || "marcos_silva";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 0 120px", background: "white" }}>
      
      {/* 🔴 HEADER DE NAVEGAÇÃO */}
      <header style={{ 
        padding: "16px 20px", 
        display: "flex", 
        alignItems: "center", 
        gap: 20, 
        position: "sticky", 
        top: 0, 
        background: "rgba(255,255,255,0.8)", 
        backdropFilter: "blur(12px)", 
        zIndex: 10 
      }}>
        <Link href="/feed" style={{ color: "black" }}><ChevronLeft size={24} /></Link>
        <div>
           <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Membro FéConecta</h2>
           <p className="muted" style={{ margin: 0, fontSize: 11 }}>142 publicações</p>
        </div>
        <button style={{ marginLeft: "auto", background: "none", border: 0 }}><Settings size={20} className="muted" /></button>
      </header>

      {/* 🔴 CAPA E PERFIL */}
      <div style={{ position: "relative" }}>
        <div style={{ 
          height: 180, 
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: "0 0 32px 32px",
          position: "relative",
          overflow: "hidden"
        }}>
           <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1, background: "url('https://www.transparenttextures.com/patterns/church.png')" }}></div>
        </div>
        
        <div style={{ padding: "0 24px" }}>
          <div style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 32, 
            background: "white", 
            border: "6px solid white", 
            marginTop: -50, 
            position: "relative",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            display: "grid",
            placeItems: "center",
            overflow: "hidden"
          }}>
             <div style={{ width: "100%", height: "100%", background: "var(--line)", display: "grid", placeItems: "center" }}>
                <User size={48} className="muted" />
             </div>
          </div>
        </div>
      </div>

      {/* 🔴 INFOS DO PERFIL */}
      <div style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Marcos Silva</h1>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.95rem" }}>@{userUsername}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
             <button 
               onClick={() => setIsFollowing(!isFollowing)}
               className={isFollowing ? "button secondary" : "button"} 
               style={{ 
                 padding: "10px 24px", 
                 borderRadius: 14, 
                 height: "auto", 
                 fontSize: 14, 
                 fontWeight: 800,
                 background: isFollowing ? "var(--line)" : "var(--primary)",
                 color: isFollowing ? "var(--foreground)" : "white"
               }}
             >
               {isFollowing ? "Seguindo" : "Seguir"}
             </button>
             <button className="button secondary" style={{ padding: 12, borderRadius: 14, height: "auto" }}><MessageCircle size={20} /></button>
          </div>
        </div>

        <p style={{ margin: "0 0 20px 0", fontSize: "0.95rem", lineHeight: 1.6, color: "#333" }}>
          Pregador, apaixonado por teologia e pela missão de conectar pessoas através da Palavra. Buscando ser um refúgio de fé em meio ao barulho. 🙏📖
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <MapPin size={14} /> São Paulo, Brasil
          </div>
          <div className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Globe size={14} /> feconecta.com/marcos
          </div>
          <div className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Calendar size={14} /> Membro desde 2024
          </div>
        </div>

        {/* 🔴 CONTADORES DE FÉ */}
        <div style={{ display: "flex", gap: 32, marginBottom: 24, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "16px 0" }}>
           <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800 }}>1.2k</span>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Seguidores</span>
           </div>
           <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800 }}>452</span>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Seguindo</span>
           </div>
           <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800 }}>890</span>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Impactos</span>
           </div>
        </div>

        {/* 🔴 LINKS SOCIAIS MINISTERIAL */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
           {[
             { icon: Instagram, color: "#e1306c", label: "Instagram" },
             { icon: Phone, color: "#25d366", label: "WhatsApp" },
             { icon: Globe, color: "#0077b5", label: "LinkedIn" },
           ].map((social, idx) => (
             <button key={idx} style={{ 
               flex: 1, 
               display: "flex", 
               alignItems: "center", 
               justifyContent: "center", 
               gap: 8, 
               padding: "10px", 
               borderRadius: 12, 
               background: "var(--line)", 
               border: 0,
               fontSize: 12,
               fontWeight: 700,
               cursor: "pointer"
             }}>
               <social.icon size={16} /> {social.label}
             </button>
           ))}
        </div>

        {/* 🔴 FEED PESSOAL */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 20 }}>
           <button style={{ flex: 1, padding: "12px 0", border: 0, background: "none", borderBottom: "3px solid var(--primary)", fontWeight: 800, fontSize: 14 }}>Publicações</button>
           <button style={{ flex: 1, padding: "12px 0", border: 0, background: "none", color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>Devocionais</button>
           <button style={{ flex: 1, padding: "12px 0", border: 0, background: "none", color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>Oração</button>
        </div>

        <div className="grid" style={{ gap: 20 }}>
           {[1, 2].map(post => (
             <div key={post} className="card" style={{ padding: 16, borderRadius: 20 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                  Hoje a palavra foi sobre Romanos 12:2. Não vos conformeis com este mundo, mas transformai-vos pela renovação da vossa mente. 🕊️
                </p>
                <div style={{ display: "flex", gap: 16, marginTop: 12, opacity: 0.6 }}>
                  <span style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}><Heart size={14} /> 42</span>
                  <span style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}><MessageSquare size={14} /> 8</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
