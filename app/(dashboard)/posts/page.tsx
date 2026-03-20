import { PostManagementPanel } from "@/components/dashboard/post-management-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { managedPosts as mockPosts } from "@/lib/data/dashboard";
import type { ManagedPost } from "@/types";

export default async function PostsPage() {
  const supabase = await createServerSupabaseClient();
  
  // Buscar posts reais do banco (Tabela public.posts)
  const { data: realPosts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (full_name, username)
    `)
    .order('created_at', { ascending: false });

  // Mapear dados do banco para o tipo ManagedPost esperado pela UI
  // Se estiver vazio, usamos o mock como fallback seguro
  const posts: ManagedPost[] = (realPosts && realPosts.length > 0) ? realPosts.map((p: any) => ({
    id: p.id,
    title: p.content?.substring(0, 40) + "..." || "Póst sem título",
    excerpt: p.content || "Sem conteúdo descritivo.",
    authorName: p.profiles?.full_name || "Membro FéConecta",
    authorUsername: p.profiles?.username || "@membro",
    type: p.post_type || "text",
    createdAt: new Date(p.created_at).toISOString().split('T')[0],
    engagement: p.likes_count || 0,
    engagementValue: p.likes_count || 0,
    reports: p.is_flagged ? 1 : 0, 
    commentsCount: p.comments_count || 0,
    interactionsSummary: `${p.likes_count || 0} curtidas`,
    sensitive: p.is_flagged || false,
    hidden: p.status === 'hidden',
    status: p.status || 'published'
  })) : mockPosts;

  return (
    <div className="grid">
      <PostManagementPanel posts={posts} />
    </div>
  );
}
