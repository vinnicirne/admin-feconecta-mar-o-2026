import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LayoutShell } from "@/components/layout/layout-shell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let authUser = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    authUser = data?.user;
  } catch (error) {
    console.warn("Supabase Auth failure at layout (ignoring for build/preview):", error);
  }
  
  // 🛡️ PROTEÇÃO DE ROTA: Apenas Administradores logados entram aqui
  if (!authUser) {
    redirect("/admin-login"); // Nova rota exclusiva administrativa
  }

  const isAdmin = authUser?.app_metadata?.role === 'admin' || authUser?.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    redirect("/"); // Membros comuns sem papel de admin voltam para o feed
  }

  const user = { 
    id: authUser.id, 
    name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "Admin", 
    email: authUser.email!, 
    role: (authUser.user_metadata?.role || "admin") as any, 
    mfaEnabled: true 
  };

  return (
    <SidebarProvider>
      <LayoutShell user={user}>
        {children}
      </LayoutShell>
    </SidebarProvider>
  );
}
