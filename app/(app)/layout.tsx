"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { 
  Home, 
  Search, 
  Bell, 
  User as UserIcon, 
  LayoutDashboard, 
  BookOpen, 
  StickyNote, 
  Sparkles,
  Plus,
  X,
  Lock,
  LogIn
} from "lucide-react";
import Link from "next/link";
import { PostCreator } from "@/components/app/feed/post-creator";
import { createClient } from "@/lib/supabase/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const isAuthPage = pathname.includes("/login") || pathname.includes("/signup");

  useEffect(() => { 
    setMounted(true); 
    if (!supabase) return;
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const checkUser = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  if (!mounted) return <div style={{ background: "#f8fafc", minHeight: "100vh" }}>{children}</div>;
  if (isAuthPage) return <>{children}</>;

  const menuItems = [
    { label: "Feed", icon: Home, href: "/" },
    { label: "Bíblia", icon: BookOpen, href: "/bible" },
    { label: "POST", icon: Plus, onClick: () => setIsCreateModalOpen(true), isFloating: true }, 
    { label: "Notas", icon: StickyNote, href: "/notes" },
    { label: "Planos", icon: Sparkles, href: "/plans" },
  ];

  return (
    <div className="app-container" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      
      {/* 🔴 WEB TOPBAR */}
      <nav className="web-nav" style={{ 
        position: "fixed", top: 0, width: "100%", height: 72, background: "rgba(255,255,255,0.8)", 
        backdropFilter: "blur(20px)", borderBottom: "1px solid var(--line)", zIndex: 1050,
        display: "flex", alignItems: "center", padding: "0 40px"
      }}>
         <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 12, marginRight: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary)", display: "grid", placeItems: "center", color: "white" }}>
               <Sparkles size={20} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.5px" }}>FéConecta</span>
         </Link>

         <div style={{ display: "flex", gap: 8, flex: 1 }}>
            {menuItems.filter(i => !i.isFloating).map((item) => (
              <Link key={item.label} href={item.href!} style={{ 
                padding: "8px 16px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
                textDecoration: "none", color: (pathname === item.href || (item.href === "/" && pathname === "/")) ? "var(--primary)" : "var(--muted)",
                background: (pathname === item.href || (item.href === "/" && pathname === "/")) ? "var(--primary-soft)" : "transparent",
                fontWeight: 700, fontSize: 14, transition: "0.2s"
              }}>
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
         </div>

         <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
               <Search size={18} className="muted" style={{ position: "absolute", left: 12, top: 10 }} />
               <input placeholder="Buscar no refúgio..." style={{ padding: "8px 16px 8px 40px", borderRadius: 10, border: "0", background: "var(--line)", width: 220, fontSize: 13 }} />
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
                <Link href="/signup" style={{ padding: "10px 24px", borderRadius: 12, background: "var(--primary)", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 800, boxShadow: "0 10px 20px var(--primary-soft)" }}>
                   Criar Conta
                </Link>
              </>
            )}
         </div>
      </nav>

      {/* 🔴 MOBILE TOPBAR */}
      <header className="mobile-only-header" style={{ 
        position: "sticky", top: 0, width: "100%", height: 62, background: "white", 
        borderBottom: "1px solid var(--line)", zIndex: 1050, display: "flex", alignItems: "center", 
        justifyContent: "space-between", padding: "0 20px"
      }}>
         <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800, fontSize: 17 }}>FéConecta</Link>
         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ width: 38, height: 38, borderRadius: 12, border: 0, background: "var(--line)", display: "grid", placeItems: "center" }}><Search size={19} className="muted" /></button>
            
            {user ? (
               <Link 
                 href={`/profile/${user.user_metadata.username || (user.email ? user.email.split('@')[0] : 'me')}`} 
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

      {/* 🔴 MAIN CONTENT */}
      <main>
        {children}
      </main>

      {/* 🔴 MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav" style={{ 
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", 
        width: "92%", height: 72, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
        borderRadius: 24, boxShadow: "0 15px 40px rgba(0,0,0,0.08)", zIndex: 1050,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px",
        border: "1px solid rgba(0,0,0,0.05)"
      }}>
        {menuItems.map((item) => {
          if (item.isFloating) {
             return (
               <div key={item.label} onClick={item.onClick} style={{ 
                  marginTop: -40, width: 58, height: 58, borderRadius: "50%", background: "var(--primary)",
                  display: "grid", placeItems: "center", color: "white", border: "5px solid white",
                  boxShadow: `0 10px 20px var(--primary-soft)`, cursor: "pointer"
               }}>
                  <Plus size={28} strokeWidth={3} />
               </div>
             )
          }
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
          return (
            <Link key={item.label} href={item.href!} style={{ 
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2, 
              textDecoration: "none", color: isActive ? "var(--primary)" : "#6b7280"
            }}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: 9, fontWeight: 800 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 🔴 MODAL GLOBAL DE CRIAÇÃO */}
      {isCreateModalOpen && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", zIndex: 2000,
          display: "flex", alignItems: "flex-end"
        }}>
           <div style={{ 
              width: "100%", background: "white", borderTopLeftRadius: 32, borderTopRightRadius: 32,
              padding: "24px", maxHeight: "90vh", overflowY: "auto", position: "relative"
           }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                 <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Nova Mensagem</h2>
                 <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "#f1f5f9", border: 0, width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center" }}>
                    <X size={20} />
                 </button>
              </div>
              
              <div onClick={(e) => e.stopPropagation()}>
                 <PostCreator forceExpanded onSuccess={() => setIsCreateModalOpen(false)} />
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .web-nav { display: none !important; }
        .mobile-only-header { display: flex !important; }
        .mobile-bottom-nav { display: flex !important; }
        
        @media (min-width: 768px) {
          .web-nav { display: flex !important; }
          .mobile-only-header { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
          main { padding-top: 92px !important; }
        }
      `}</style>
    </div>
  );
}
