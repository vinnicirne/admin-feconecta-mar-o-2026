"use client";

import { LayoutGrid, Mic2, MessageSquare, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLeftProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  communityName?: string;
}

export function SidebarLeft({ activeTab, onTabChange, communityName }: SidebarLeftProps) {
  return (
    <aside className="church-sidebar-left" style={{
      width: 260, flexShrink: 0, 
      display: "flex", flexDirection: "column", gap: 4, background: "white", 
      padding: "24px 16px", borderRight: "1px solid var(--line)"
    }}>
      <h4 style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px 12px" }}>Navegação Igreja</h4>
      
      <Button 
        variant={activeTab === "timeline" ? "secondary" : "ghost"}
        onClick={() => onTabChange("timeline")}
        style={{ justifyContent: "flex-start", textAlign: "left" }}
      >
         <LayoutGrid size={18} className={activeTab === "timeline" ? "primary" : "muted"} /> Timeline Viva
      </Button>

      <Button 
        variant={activeTab === "war-room" ? "secondary" : "ghost"}
        onClick={() => onTabChange("war-room")}
        style={{ justifyContent: "flex-start", textAlign: "left" }}
      >
         <Mic2 size={18} className={activeTab === "war-room" ? "primary" : "muted"} /> Sala de Guerra
      </Button>

      <Button variant="ghost" disabled style={{ justifyContent: "flex-start", textAlign: "left", opacity: 0.5 }}>
         <MessageSquare size={18} className="muted" /> Mural de Avisos
      </Button>

      <Button 
        variant={activeTab === "ministries" ? "secondary" : "ghost"}
        onClick={() => onTabChange("ministries")}
        style={{ justifyContent: "flex-start", textAlign: "left" }}
      >
         <Users size={18} className={activeTab === "ministries" ? "primary" : "muted"} /> Ministérios
      </Button>

      <Button variant="ghost" disabled style={{ justifyContent: "flex-start", textAlign: "left", opacity: 0.5 }}>
         <Calendar size={18} className="muted" /> Eventos
      </Button>

      <div style={{ margin: "16px 8px", borderTop: "1px solid var(--line)" }} />
      <h4 style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px 12px" }}>Seus Ministérios</h4>
      <p style={{ padding: "0 12px", fontSize: 12, color: "var(--muted)" }}>Poderá gerenciar aqui os ministérios da {communityName || "igreja"}.</p>
    </aside>
  );
}
