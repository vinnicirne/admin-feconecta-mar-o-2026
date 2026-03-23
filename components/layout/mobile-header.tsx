"use client";

import Link from "next/link";
import { Menu, User as UserIcon, LogIn } from "lucide-react";

interface MobileHeaderProps {
  user: any;
  onOpenMenu: () => void;
}

export function MobileHeader({ user, onOpenMenu }: MobileHeaderProps) {
  return (
    <header className="mobile-only-header" style={{ 
      position: "sticky", top: 0, width: "100%", height: 62, background: "white", 
      borderBottom: "1px solid var(--line)", zIndex: 1050, display: "flex", alignItems: "center", 
      justifyContent: "space-between", padding: "0 20px"
    }}>
       <button 
         onClick={onOpenMenu}
         style={{ width: 38, height: 38, borderRadius: 12, border: 0, background: "var(--line)", display: "grid", placeItems: "center", cursor: "pointer" }}
       >
         <Menu size={20} style={{ color: "var(--primary)" }} />
       </button>

       <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800, fontSize: 17 }}>FéConecta</Link>

       <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
             <Link 
               href={`/profile/${user.user_metadata?.username || (user.email ? user.email.split('@')[0] : 'me')}`} 
               style={{ width: 38, height: 38, borderRadius: 12, background: "var(--primary-soft)", display: "grid", placeItems: "center", overflow: "hidden" }}
             >
                 <UserIcon size={20} className="primary" />
             </Link>
          ) : (
             <Link href="/login" style={{ width: 38, height: 38, borderRadius: 12, background: "var(--primary-soft)", display: "grid", placeItems: "center" }}>
                 <LogIn size={20} className="primary" />
             </Link>
          )}
       </div>
    </header>
  );
}
