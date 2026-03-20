import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMockSession } from "@/lib/auth/session";
import { LayoutShell } from "@/components/layout/layout-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let authUser = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    authUser = data?.user;
  } catch (error) {
    console.warn("Supabase Auth failure at layout (ignoring for build/preview):", error);
  }
  
  const user = authUser ? { 
    id: authUser.id, 
    name: authUser.email?.split('@')[0] || "Admin", 
    email: authUser.email!, 
    role: "super_admin" as const, 
    mfaEnabled: true 
  } : await getMockSession();

  return (
    <SidebarProvider>
      <LayoutShell user={user}>
        {children}
      </LayoutShell>
    </SidebarProvider>
  );
}
