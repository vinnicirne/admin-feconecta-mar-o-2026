"use client";

import { Plus } from "lucide-react";
import { MenuItem } from "@/components/ui/menu-item";

interface BottomNavProps {
  menuItems: any[];
}

export function MobileBottomNav({ menuItems }: BottomNavProps) {
  return (
    <nav className="mobile-bottom-nav" style={{ 
      position: "fixed", bottom: 0, left: 0, width: "100%", height: 64, 
      background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)",
      boxShadow: "0 -1px 0 rgba(0,0,0,0.05)", zIndex: 1050,
      display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 8px",
      borderTop: "1px solid var(--line)"
    }}>
      {menuItems.map((item) => {
        if (item.id === "post") {
           return (
             <div key={item.id} onClick={item.onClick} style={{ 
                marginTop: -40, width: 50, height: 50, borderRadius: "50%", background: "var(--primary)",
                display: "grid", placeItems: "center", color: "white", border: "4px solid white",
                boxShadow: `0 8px 16px rgba(15, 118, 110, 0.3)`, cursor: "pointer"
             }}>
                <Plus size={24} strokeWidth={3} />
             </div>
           )
        }
        return (
          <MenuItem 
            key={item.id}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isMobile
          />
        );
      })}
    </nav>
  );
}
