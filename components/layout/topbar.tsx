"use client";

import Link from "next/link";
import { Sparkles, Search, LayoutDashboard, User as UserIcon } from "lucide-react";
import { MenuItem } from "@/components/ui/menu-item";

interface TopbarProps {
  user: any;
  menuItems: any[];
}

export function Topbar({ user, menuItems }: TopbarProps) {
  return (
    <nav className="web-nav" style={{ 
      position: "fixed", top: 0, width: "100%", height: 72, background: "white", 
      borderBottom: "1px solid var(--line)", zIndex: 1100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px"
    }}>
       <div style={{ padding: "0 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
             <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--primary)", display: "grid", placeItems: "center", color: "white" }}>
                <Sparkles size={18} />
             </div>
             <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.5px" }}>FéConecta</span>
          </Link>
       </div>

       <div style={{ display: "flex", gap: 4, padding: "0 20px" }}>
          {menuItems.filter(i => !i.isFloating).map((item) => (
            <MenuItem 
              key={item.id}
              icon={item.icon}
              label={item.label}
              href={item.href}
              className="top-nav-item"
              style={{ width: "auto", padding: "8px 16px" }}
            />
          ))}
       </div>

       <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "flex-end", padding: "0 24px" }}>
          <div style={{ position: "relative" }}>
             <Search size={16} className="muted" style={{ position: "absolute", left: 12, top: 10 }} />
             <input placeholder="Busca rápida..." className="input" style={{ width: 140, padding: "8px 16px 8px 36px", fontSize: 13, background: "var(--line)", border: 0 }} />
          </div>

          {user ? (
            <>
              <Link href="/dashboard" style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid var(--line)", textDecoration: "none", fontSize: 13, fontWeight: 700, color: "black", display: "flex", alignItems: "center", gap: 8 }}>
                 <LayoutDashboard size={16} /> Painel ADM
              </Link>
              <Link href="/profile/me" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary-soft)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                  <UserIcon size={20} className="primary" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: "10px 20px", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>
                 Entrar
              </Link>
              <Link href="/signup" style={{ padding: "10px 24px", borderRadius: 12, background: "var(--primary)", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 800, boxShadow: "var(--shadow-md)" }}>
                 Criar Conta
              </Link>
            </>
          )}
       </div>
    </nav>
  );
}
