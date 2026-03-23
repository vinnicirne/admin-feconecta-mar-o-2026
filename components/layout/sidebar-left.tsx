"use client";

import { User as UserIcon, Mic2, Globe, BookOpen } from "lucide-react";
import { MenuItem } from "@/components/ui/menu-item";

interface GlobalSidebarLeftProps {
  user: any;
  communities: any[];
}

export function GlobalSidebarLeft({ user, communities }: GlobalSidebarLeftProps) {
  return (
    <aside className="faith-sidebar-left" style={{
      position: "sticky", top: 72, height: "calc(100vh - 72px)",
      padding: "24px 16px 24px 24px", overflowY: "auto",
      flexDirection: "column", gap: 4, background: "white", zIndex: 10
    }}>
      <MenuItem 
        icon={UserIcon} 
        label={user?.user_metadata?.username || user?.user_metadata?.full_name || "Meu Perfil"} 
        href="/profile/me" 
        iconColor="#3b82f6"
      />

      <MenuItem 
        icon={Mic2} 
        label="Sala de Guerra" 
        href="/war-room/new" 
        iconColor="#ef4444"
      />

      <MenuItem 
        icon={Globe} 
        label="Comunidades" 
        href="/communities/explore" 
        iconColor="#10b981"
      />

      <MenuItem 
        icon={BookOpen} 
        label="Bíblia Sagrada" 
        href="/bible" 
        iconColor="#f59e0b"
      />

      <div style={{ margin: "16px 0 8px", borderTop: "1px solid var(--line)" }} />
      <h4 style={{ fontSize: 13, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px 12px" }}>Suas Comunidades</h4>
      
      {communities.map(c => (
        <MenuItem 
          key={c.id}
          icon={Globe}
          label={c.name}
          href={`/communities/${c.id}`}
          iconColor="#10b981"
        />
      ))}
      
      {communities.length > 0 && (
         <MenuItem 
           icon={Globe} 
           label="+ Ver todas as igrejas" 
           href="/communities/explore" 
           className="primary"
         />
      )}
    </aside>
  );
}
