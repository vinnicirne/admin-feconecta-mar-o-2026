"use client";

import { usePathname, useRouter } from "next/navigation";
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
  LogIn,
  Mic2,
  Globe,
  Menu
} from "lucide-react";
import Link from "next/link";
import { PostCreator } from "@/components/app/feed/post-creator";
import { createClient } from "@/lib/supabase/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFeatures, setActiveFeatures] = useState<Set<string>>(new Set());
  const router = useRouter();
  
  const isAuthPage = pathname.includes("/login") || pathname.includes("/signup");

  useEffect(() => { 
    setMounted(true); 
    if (!supabase) return;

    // O onAuthStateChange do Supabase v2 dispara imediatamente com a sessão atual
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      const authUser = session?.user || null;
      setUser(authUser);
      
      // 🛡️ GUARDA DE NAVEGAÇÃO
      if (!isAuthPage && !authUser) {
        router.push("/login");
      } else if (isAuthPage && authUser) {
        router.push("/");
      }
      
      setLoading(false);
      fetchFeatures();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, pathname]);

  const fetchFeatures = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('app_features').select('name, is_enabled');
    if (data) {
      const enabled = new Set<string>(data.filter((f: any) => f.is_enabled).map((f: any) => f.name));
      setActiveFeatures(enabled);
    }
  };

  const checkUser = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  // 💡 NAVEGAÇÃO SEGURA (Prevenir Hydration Mismatch)
  const menuItems = useMemo(() => {
    const baseItems = [
      { id: 'feed', label: "Feed", icon: Home, href: "/" },
      { id: 'bible', label: "Bíblia", icon: BookOpen, href: "/bible" },
      { id: 'post', label: "POST", icon: Plus, onClick: () => setIsCreateModalOpen(true), isFloating: true }, 
      { id: 'notes', label: "Notas", icon: StickyNote, href: "/notes" },
      { id: 'plans', label: "Planos", icon: Sparkles, href: "/plans" },
    ];

    // No SSR ou antes de montar, assumimos todos habilitados
    if (!mounted || activeFeatures.size === 0) return baseItems;
    
    return baseItems.filter(item => activeFeatures.has(item.id));
  }, [activeFeatures, mounted]);

  if (!mounted || loading) {
    if (isAuthPage) return <>{children}</>;
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", gap: 16 }}>
        <Sparkles size={32} className="spin primary" />
        <p style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Sincronizando Fé...</p>
      </div>
    );
  }

  if (isAuthPage) return <>{children}</>;


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
         {/* 🍔 BOTÃO HAMBURGUER */}
         <button 
           onClick={() => setIsMobileMenuOpen(true)}
           style={{ width: 38, height: 38, borderRadius: 12, border: 0, background: "var(--line)", display: "grid", placeItems: "center", cursor: "pointer" }}
         >
           <Menu size={20} style={{ color: "var(--primary)" }} />
         </button>

         <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800, fontSize: 17 }}>FéConecta</Link>

         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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

      {/* 🍔 DRAWER MOBILE MENU */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1998 }}
          />
          {/* Drawer */}
          <div style={{
            position: "fixed", top: 0, left: 0, width: 280, height: "100vh",
            background: "white", zIndex: 1999, padding: "24px 20px",
            display: "flex", flexDirection: "column", gap: 8,
            boxShadow: "4px 0 30px rgba(0,0,0,0.12)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontWeight: 900, fontSize: 18 }}>FéConecta</span>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ width: 36, height: 36, borderRadius: 10, border: 0, background: "var(--line)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 10, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 4px" }}>Ações de Fé</p>

            <Link href="/war-room/new" onClick={() => setIsMobileMenuOpen(false)} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
              borderRadius: 16, textDecoration: "none", color: "var(--foreground)",
              background: "var(--primary-soft)", fontWeight: 700, fontSize: 15
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(15, 118, 110, 0.15)", display: "grid", placeItems: "center", color: "var(--primary)" }}>
                <Mic2 size={20} />
              </div>
              <div>
                <strong style={{ display: "block" }}>Sala de Guerra</strong>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Iniciar oração ao vivo</span>
              </div>
            </Link>

            <Link href="/communities/new" onClick={() => setIsMobileMenuOpen(false)} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
              borderRadius: 16, textDecoration: "none", color: "var(--foreground)",
              background: "rgba(217, 119, 6, 0.08)", fontWeight: 700, fontSize: 15
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(217, 119, 6, 0.15)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
                <Globe size={20} />
              </div>
              <div>
                <strong style={{ display: "block" }}>Comunidade</strong>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Fundar nova igreja</span>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* 🔴 MAIN CONTENT COM SIDEBAR ESQUERDA (DESKTOP) */}
      <div className="app-body" style={{ display: "flex", position: "relative" }}>

        {/* SIDEBAR ESQUERDA DE FÉ (DESKTOP ONLY) */}
        <aside className="faith-sidebar" style={{
          position: "fixed", top: 92, left: 0, width: 240, height: "calc(100vh - 92px)",
          padding: "24px 16px", overflowY: "auto", display: "none",
          flexDirection: "column", gap: 8, borderRight: "1px solid var(--line)",
          background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)"
        }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 8px" }}>
            Ações de Fé
          </p>

          <Link href="/war-room/new" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            borderRadius: 14, textDecoration: "none", color: "var(--foreground)",
            background: pathname === "/war-room/new" ? "var(--primary-soft)" : "transparent",
            fontWeight: 700, fontSize: 14, transition: "0.2s"
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(15, 118, 110, 0.1)", display: "grid", placeItems: "center", color: "var(--primary)" }}>
              <Mic2 size={18} />
            </div>
            <div>
              <strong style={{ display: "block", fontSize: 13 }}>Sala de Guerra</strong>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>Oração ao vivo</span>
            </div>
          </Link>

          <Link href="/communities/new" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            borderRadius: 14, textDecoration: "none", color: "var(--foreground)",
            background: pathname === "/communities/new" ? "var(--primary-soft)" : "transparent",
            fontWeight: 700, fontSize: 14, transition: "0.2s"
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(217, 119, 6, 0.1)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
              <Globe size={18} />
            </div>
            <div>
              <strong style={{ display: "block", fontSize: 13 }}>Comunidade</strong>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>Fundar igreja</span>
            </div>
          </Link>
        </aside>

        <main className="app-main">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .faith-sidebar { display: none !important; }
        @media (min-width: 1024px) {
          .faith-sidebar { display: flex !important; }
          .app-main { margin-left: 240px; }
        }
      `}</style>

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
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Ações de Fé</h2>
                  <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "#f1f5f9", border: 0, width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center" }}>
                     <X size={24} />
                  </button>
               </div>
               
               <div className="grid" style={{ gap: 16 }}>
                 {/* OPÇÃO 1: POST PADRÃO */}
                 <div style={{ background: "white", padding: "16px", borderRadius: 24, border: "1px solid var(--line)", display: "flex", gap: 16 }}>
                    <PostCreator forceExpanded onSuccess={() => setIsCreateModalOpen(false)} />
                 </div>

                 <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {/* OPÇÃO 2: SALA DE GUERRA */}
                    <button 
                      onClick={() => window.location.href = '/war-room/new'}
                      style={{ background: "var(--primary-soft)", padding: "20px 16px", borderRadius: 24, border: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
                    >
                      <Mic2 size={24} color="var(--primary)" />
                      <strong style={{ fontSize: 13, color: "var(--primary)" }}>Sala de Guerra</strong>
                    </button>

                    {/* OPÇÃO 3: COMUNIDADE */}
                    <button 
                      onClick={() => window.location.href = '/communities/new'}
                      style={{ background: "rgba(217, 119, 6, 0.1)", padding: "20px 16px", borderRadius: 24, border: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
                    >
                      <Globe size={24} color="var(--accent)" />
                      <strong style={{ fontSize: 13, color: "var(--accent)" }}>Criar Igreja</strong>
                    </button>
                 </div>
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
