"use client";

import { 
  BarChart3, 
  Search, 
  Bell, 
  User, 
  Command,
  Monitor,
  ArrowUpRight,
  Sparkles,
  RefreshCcw,
  ExternalLink,
  Pocket
} from "lucide-react";
import Link from 'next/link';

export function Topbar() {
  return (
    <header 
      className="card topbar" 
      style={{ 
        height: 72,
        margin: "20px 20px 0 20px",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--line)",
        borderRadius: 20,
        position: "sticky",
        top: 20,
        zIndex: 90
      }}
    >
      {/* 🔴 BUSCA GLOBAL INTEGRADA */}
      <div style={{ position: "relative", width: 400 }}>
        <Search 
          size={18} 
          style={{ 
            position: "absolute", 
            left: 14, 
            top: "50%", 
            transform: "translateY(-50%)", 
            opacity: 0.4 
          }} 
        />
        <input 
          type="text" 
          placeholder="Busca Ministerial (Membros, Posts, Canais...)" 
          className="input"
          style={{ 
            width: "100%",
            background: "var(--line)",
            border: "1px solid rgba(0,0,0,0.02)",
            paddingLeft: 44,
            height: 44,
            borderRadius: 14,
            fontSize: 14
          }}
        />
        <div style={{ 
          position: "absolute", 
          right: 12, 
          top: "50%", 
          transform: "translateY(-50%)",
          display: "flex",
          gap: 4,
          alignItems: "center",
          background: "white",
          padding: "4px 8px",
          borderRadius: 8,
          border: "1px solid var(--line)",
          fontSize: 10,
          fontWeight: 800,
          opacity: 0.6
        }}>
           <Command size={10} /> K
        </div>
      </div>

      {/* 🔴 AÇÕES RÁPIDAS (VER APP / NOTIFICAÇÕES) */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        
        {/* BOTÃO ESTRATÉGICO: IR PARA O APP */}
        <Link href="/feed" style={{ textDecoration: "none" }}>
          <button className="button" style={{ 
            height: 44, 
            padding: "0 20px", 
            borderRadius: 14, 
            fontSize: 13, 
            fontWeight: 800,
            display: "flex", 
            alignItems: "center", 
            gap: 10,
            background: "rgba(15,118,110,0.1)",
            color: "var(--primary)",
            border: "1px solid rgba(15,118,110,0.1)"
          }}>
             <ExternalLink size={16} /> Ver Refúgio (App)
          </button>
        </Link>

        {/* Notificações / Monitoramento */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 14, 
            background: "white", 
            border: "1px solid var(--line)", 
            display: "grid", 
            placeItems: "center", 
            position: "relative" 
          }}>
            <Bell size={20} className="muted" />
            <div style={{ 
              position: "absolute", 
              top: 12, 
              right: 12, 
              width: 8, 
              height: 8, 
              borderRadius: "50%", 
              background: "#ef4444", 
              border: "2px solid white" 
            }}></div>
          </button>
          
          <button style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 14, 
            background: "white", 
            border: "1px solid var(--line)", 
            display: "grid", 
            placeItems: "center" 
          }}>
            <RefreshCcw size={20} className="muted" />
          </button>
        </div>

        {/* Perfil Rápido Admin */}
        <div style={{ 
          marginLeft: 8, 
          padding: "4px 16px 4px 6px", 
          background: "var(--line)", 
          borderRadius: 12, 
          display: "flex", 
          alignItems: "center", 
          gap: 10,
          cursor: "pointer"
        }}>
           <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--primary)", color: "white", display: "grid", placeItems: "center" }}>
              <User size={18} />
           </div>
           <span style={{ fontSize: 13, fontWeight: 700 }}>Marcos S.</span>
        </div>
      </div>
    </header>
  );
}
