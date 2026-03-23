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
    <div className="layout-shell" style={{ minHeight: "100vh", background: "var(--background)", display: "flex", overflow: "hidden", width: "100vw" }}>
      <Sidebar user={user} />

      <main 
        className="main-content"
        style={{ 
          flex: 1, 
          height: "100vh",
          display: "flex", 
          flexDirection: "column",
          transition: "margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        <Topbar user={user} menuItems={[]} />
        
        <div style={{ marginTop: 24, flex: 1, padding: "0 20px" }}>
          {children}
        </div>
      </main>

      <style jsx>{`
        .main-content {
          margin-left: 0;
          padding: 10px;
        }
        @media (min-width: 1024px) {
          .main-content {
            margin-left: ${isCollapsed ? collapsedOffset : expandedOffset}px;
            padding: 20px 20px 20px 0;
          }
        }
      `}</style>
    </div>
  );
}
