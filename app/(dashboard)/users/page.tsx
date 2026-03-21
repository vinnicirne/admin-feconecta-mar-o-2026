import { UserManagementPanel } from "@/components/dashboard/user-management-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { managedUsers as mockManagedUsers } from "@/lib/data/dashboard";
import type { ManagedUser } from "@/types";

export default async function UsersPage() {
  const supabase = await createServerSupabaseClient();
  
  // Buscar perfis reais da tabela public.profiles (que criamos no SQL)
  const { data: realProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Mapear dados do banco para o tipo ManagedUser esperado pelo componente
  // Se não houver dados reais, usamos o mock como segurança (fallback)
  const managedUsers: ManagedUser[] = (realProfiles && realProfiles.length > 0) ? realProfiles.map((p: any) => ({
    id: p.id,
    name: p.full_name || "Membro FéConecta",
    username: p.username || "@membro",
    email: p.email || "membro@email.com",
    status: p.status || "active",
    joinedAt: new Date(p.created_at).toISOString().split('T')[0],
    role: p.role || "member",
    reportsReceived: 0,
    activityScore: p.points > 100 ? "Alta" : "Media",
    bio: p.bio || "Sem biografia ministerial.",
    church: p.church || "Igreja Local",
    birthDate: p.birth_date || "",
    lastSeen: "Recentemente",
    activityHistory: [
      "Perfil sincronizado no sistema",
      "Primeiro acesso registrado no Refúgio"
    ]
  })) : mockManagedUsers;

  return (
    <div className="grid" style={{ gap: 24 }}>
      <UserManagementPanel users={managedUsers} />
    </div>
  );
}
