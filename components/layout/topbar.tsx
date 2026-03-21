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
  Pocket,
  Menu
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import Link from 'next/link';

export function Topbar({ user }: { user?: any }) {
  const { toggleMobileMenu } = useSidebar();

  return (
    <header 
      className="card topbar" 
      style={{ 
        height: 72,
        margin: "20px 20px 0 20px",
        padding: "0 16px",
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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* 🔴 MENU HAMBURGUER MOBILE */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          style={{ background: "none", border: 0, cursor: "pointer", color: "var(--primary)" }}
        >
          <Menu size={24} />
        </button>

        {/* 🔴 BUSCA GLOBAL INTEGRADA (RESPONSIVA) */}
        <div className="search-container" style={{ position: "relative", width: 400 }}>
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
            placeholder="Busca..." 
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
        </div>
      </div>

      {/* 🔴 AÇÕES RÁPIDAS (VER APP / NOTIFICAÇÕES) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        
        {/* BOTÃO ESTRATÉGICO: IR PARA O APP */}
        <Link href="/feed" className="desktop-view-btn">
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
             <ExternalLink size={16} /> Ver App
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
          </button>
          
          <button className="desktop-view-btn" style={{ 
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
          padding: "4px 8px", 
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
           <span className="profile-name" style={{ fontSize: 13, fontWeight: 700 }}>Marcos S.</span>
        </div>
      </div>

      <style jsx>{`
        .mobile-menu-btn { display: block !important; }
        .search-container { width: 140px !important; }
        .profile-name { display: none !important; }
        .desktop-view-btn { display: none !important; }

        @media (min-width: 1024px) {
          .mobile-menu-btn { display: none !important; }
          .search-container { width: 400px !important; }
          .profile-name { display: block !important; }
          .desktop-view-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
