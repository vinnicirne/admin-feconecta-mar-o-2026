"use client";

import { useSidebar } from "./sidebar-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function LayoutShell({ user, children }: { user: any; children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  // Cálculo preciso: Largura do menu + Margem fixa (20) + Espaçamento entre menu e conteúdo (20)
  const expandedOffset = 280 + 40; // 320px
  const collapsedOffset = 80 + 40;  // 120px

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", overflow: "hidden" }}>
      {/* 🔴 SIDEBAR (FIXA) */}
      <Sidebar user={user} />

      {/* 🔴 MAIN CONTENT AREA */}
      <main 
        style={{ 
          flex: 1, 
          height: "100vh",
          marginLeft: isCollapsed ? collapsedOffset : expandedOffset,
          padding: "20px 20px 20px 0", // Gap lateral direito e inferior
          display: "flex", 
          flexDirection: "column",
          transition: "margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        <Topbar user={user} />
        
        {/* CONTEÚDO DINÂMICO (DASHBOARD / USERS / POSTS) */}
        <div style={{ marginTop: 24, flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
