"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Settings, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  MessageSquare, 
  Flag,
  Globe,
  Bell,
  ShieldAlert,
  History,
  Info,
  LifeBuoy,
  Zap,
  Mic2,
  Lock
} from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const { isCollapsed, isMobileMenuOpen, toggleSidebar, closeMobileMenu } = useSidebar();

  const menuSections = [
    {
      label: "Estratégico",
      items: [
        { name: "Painel Global", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Métricas", icon: BarChart3, path: "/metrics" },
      ]
    },
    {
      label: "Governança",
      items: [
        { name: "SALA DE GUERRA", icon: Mic2, path: "/war-room" },
        { name: "Comunidades", icon: Globe, path: "/communities" },
        { name: "Membros", icon: Users, path: "/users" },
        { name: "Publicações", icon: MessageSquare, path: "/posts" },
      ]
    },
    {
      label: "Segurança",
      items: [
        { name: "Denúncias", icon: ShieldAlert, path: "/reports" },
        { name: "Auditória", icon: Flag, path: "/audit" },
        { name: "Logs de Sistema", icon: History, path: "/logs" },
      ]
    },
    {
      label: "Plataforma",
      items: [
        { name: "Notificações", icon: Bell, path: "/notifications" },
        { name: "Suporte", icon: LifeBuoy, path: "/support" },
        { name: "Configurações", icon: Settings, path: "/settings" },
      ]
    }
  ];

  return (
    <>
      {/* 🔴 OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div 
          onClick={closeMobileMenu}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 998 }}
          className="mobile-overlay"
        />
      )}

      <aside 
        className="card sidebar" 
        style={{ 
          height: "calc(100vh - 40px)",
          width: isCollapsed ? 80 : 280,
          margin: 20,
          padding: isCollapsed ? "20px 10px" : "24px 16px",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "fixed",
          left: 0,
          zIndex: 1000, // Acima do overlay
          overflowY: "auto",
          overflowX: "hidden",
          border: "1px solid var(--line)",
          scrollbarWidth: "none",
          transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-150%)"
        }}
      >
        {/* Adicionar CSS Mobile First para Sidebar */}
        <style jsx>{`
          @media (min-width: 1024px) {
            .sidebar { transform: translateX(0) !important; }
            .mobile-overlay { display: none !important; }
          }
          @media (max-width: 1024px) {
            .sidebar { margin: 20px 0 20px 20px !important; }
          }
        `}</style>
      {/* Botão de Toggle - Topo */}
      <button
        onClick={toggleSidebar}
        style={{
          position: "sticky",
          top: 0,
          alignSelf: "flex-end",
          width: 28,
          height: 28,
          marginBottom: 10,
          borderRadius: "8px",
          background: "var(--line)",
          border: "1px solid rgba(0,0,0,0.05)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          transition: "all 0.3s ease"
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Profile Section */}
      <div style={{ 
        marginBottom: 32, 
        display: "flex", 
        flexDirection: isCollapsed ? "column" : "row",
        alignItems: "center", 
        gap: 12,
        padding: "0 8px"
      }}>
        <div style={{ 
          width: 44, 
          height: 44, 
          borderRadius: 12, 
          background: "var(--primary)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "white",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(15,118,110,0.25)"
        }}>
          <ShieldCheck size={22} />
        </div>
        {!isCollapsed && (
          <div style={{ overflow: "hidden" }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "var(--foreground)", letterSpacing: "-0.01em" }}>Super Admin</p>
            <p className="muted" style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>{user?.full_name?.split(' ')[0] || "Administrador"}</p>
          </div>
        )}
      </div>

      {/* Navegação por Seções */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
        {menuSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!isCollapsed && (
              <p style={{ 
                fontSize: 10, 
                fontWeight: 800, 
                textTransform: "uppercase", 
                color: "var(--muted)", 
                marginBottom: 12, 
                paddingLeft: 12,
                letterSpacing: "0.08em"
              }}>
                {section.label}
              </p>
            )}
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      textDecoration: "none",
                      color: isActive ? "var(--primary)" : "var(--muted)",
                      background: isActive ? "rgba(15,118,110,0.08)" : "transparent",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      transition: "all 0.2s ease"
                    }}
                    title={isCollapsed ? item.name : ""}
                  >
                    <item.icon size={18} style={{ flexShrink: 0, strokeWidth: isActive ? 2.5 : 2 }} />
                    {!isCollapsed && <span>{item.name}</span>}
                    {isActive && !isCollapsed && (
                      <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "var(--primary)" }}></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Status da Plataforma */}
      <div style={{ 
        marginTop: 32, 
        paddingTop: 16, 
        borderTop: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        {!isCollapsed ? (
          <div style={{ 
            background: "rgba(16,185,129,0.06)", 
            padding: "8px 12px", 
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
             <Zap size={14} style={{ color: "#10b981" }} />
             <span style={{ fontSize: 10, fontWeight: 800, color: "#065f46" }}>SISTEMA OPERACIONAL</span>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}><Zap size={16} style={{ color: "#10b981" }} /></div>
        )}
      </div>
    </aside>
    </>
  );
}
