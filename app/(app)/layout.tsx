"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { 
  Home, 
  BookOpen, 
  StickyNote, 
  Sparkles,
  Plus,
  X,
  Mic2,
  Globe
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// hooks
import { useAuth } from "@/hooks/use-auth";
import { useFeatures } from "@/hooks/use-features";

// components
import { Topbar } from "@/components/layout/topbar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { GlobalSidebarLeft } from "@/components/layout/sidebar-left";
import { GlobalSidebarRight } from "@/components/layout/sidebar-right";
import { MobileBottomNav } from "@/components/layout/bottom-nav";
import { FaithActionsModal } from "@/components/layout/faith-actions-modal";
import { MenuItem } from "@/components/ui/menu-item";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [navCommunities, setNavCommunities] = useState<any[]>([]);

  const { user, loading: authLoading } = useAuth();
  const { isEnabled, features } = useFeatures();

  const isAuthPage = pathname.includes("/login") || pathname.includes("/signup");

  useEffect(() => { 
    setMounted(true); 
    if (mounted && !authLoading) {
       fetchNav();
       // 🛡️ TRAVA DE SEGURANÇA: Se não estiver logado e não for página de auth, volta pro login
       if (!user && !isAuthPage) {
         router.replace("/login");
       }
    }
  }, [mounted, authLoading, user, isAuthPage, router]);

  const fetchNav = async () => {
    const { data } = await supabase.from('communities').select('id, name').limit(5);
    if (data) setNavCommunities(data);
  };

  const menuItems = useMemo(() => {
    const baseItems = [
      { id: 'feed', label: "Feed", icon: Home, href: "/" },
      { id: 'bible', label: "Bíblia", icon: BookOpen, href: "/bible" },
      { id: 'post', label: "POST", icon: Plus, onClick: () => setIsCreateModalOpen(true), isFloating: true }, 
      { id: 'notes', label: "Notas", icon: StickyNote, href: "/notes" },
      { id: 'plans', label: "Planos", icon: Sparkles, href: "/plans" },
    ];
    if (!mounted || features.size === 0) return baseItems;
    return baseItems.filter(item => isEnabled(item.id));
  }, [features, isEnabled, mounted]);

  if (!mounted || authLoading) {
    if (isAuthPage) return <>{children}</>;
    return (
      <div suppressHydrationWarning style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", gap: 16 }}>
        <Sparkles size={32} className="spin primary" />
        <p style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Sincronizando Fé...</p>
      </div>
    );
  }

  if (isAuthPage) return <>{children}</>;

  // 🛡️ SEGUNDA CAMADA DE PROTEÇÃO: Não renderiza nada se estiver redirecionando ou sem user
  if (!user) return null;

  return (
      <div className="app-container" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      
      <Topbar user={user} menuItems={menuItems} />
      <MobileHeader user={user} onOpenMenu={() => setIsMobileMenuOpen(true)} />

      {isMobileMenuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000 }}>
            <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} />
            <div style={{ 
              position: "absolute", top: 0, left: 0, width: 280, height: "100vh", 
              background: "white", padding: "24px 20px", display: "flex", 
              flexDirection: "column", gap: 8, boxShadow: "10px 0 40px rgba(0,0,0,0.1)" 
            }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                     <strong style={{ fontSize: 20, fontWeight: 900 }}>FéConecta</strong>
                     <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: "var(--line)", border: 0, width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center" }}>
                        <X size={18} />
                     </button>
                 </div>
                 <p style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px 12px" }}>Ações de Fé</p>
                 <MenuItem icon={Mic2} label="Sala de Guerra" href="/war-room/new" onClick={() => setIsMobileMenuOpen(false)} />
                 <MenuItem icon={Globe} label="Fundar Igreja" href="/communities/new" onClick={() => setIsMobileMenuOpen(false)} />
                 <div style={{ margin: "16px 0", borderTop: "1px solid var(--line)" }} />
                 {menuItems.filter(i => !i.isFloating).map(item => (
                    <MenuItem key={item.id} icon={item.icon} label={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} />
                 ))}
            </div>
        </div>
      )}

      <div className={`app-body ${pathname.includes('/communities/') ? 'is-community-route' : pathname.includes('/war-room/') ? 'is-war-room-route' : (pathname === '/home') ? 'has-right-sidebar' : 'no-right-sidebar'}`}>
        <GlobalSidebarLeft user={user} communities={navCommunities} />
        <main className="app-main" style={{ minWidth: 0, position: "relative" }}>
          {children}
        </main>
        {!pathname.includes('/communities/') && !pathname.includes('/war-room/') && pathname !== '/' && (
          <GlobalSidebarRight />
        )}
      </div>

      <MobileBottomNav menuItems={menuItems} />
      {isCreateModalOpen && <FaithActionsModal onClose={() => setIsCreateModalOpen(false)} />}

      <style jsx global>{`
        body { margin: 0; background: #f5f6f7; }
        .app-body { display: grid; grid-template-columns: 1fr; width: 100%; min-height: 100vh; padding-top: 62px; }
        .app-main { min-width: 0; flex: 1; display: flex; flex-direction: column; }
        .faith-sidebar-left, .faith-sidebar-right { display: none !important; }
        @media (min-width: 1024px) {
          .app-body { padding-top: 72px; }
          .app-body:not(.is-community-route) { grid-template-columns: 260px 1fr; }
          .app-body:not(.is-community-route) .faith-sidebar-left { display: flex !important; border-right: 1px solid var(--line); }
          .app-body.is-war-room-route { grid-template-columns: 260px 1fr; }
        }
        @media (min-width: 1280px) {
          .app-body.has-right-sidebar { grid-template-columns: 260px 1fr 320px !important; }
          .app-body.has-right-sidebar .faith-sidebar-right { display: flex !important; border-left: 1px solid var(--line); }
        }
        .web-nav { display: none !important; }
        .mobile-only-header { display: flex !important; }
        .mobile-bottom-nav { display: flex !important; }
        @media (min-width: 768px) { .web-nav { display: flex !important; } .mobile-only-header { display: none !important; } .mobile-bottom-nav { display: none !important; } }
      `}</style>
      
    </div>
  );
}
