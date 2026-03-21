import { PostManagementPanel } from "@/components/dashboard/post-management-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { managedPosts as mockPosts } from "@/lib/data/dashboard";
import type { ManagedPost } from "@/types";

export default async function PostsPage() {
  const supabase = await createServerSupabaseClient();
  
  // Buscar posts reais do banco com contadores de engajamento (like_count, comment_count)
  const { data: realPosts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (full_name, username),
      like_count:post_likes(count),
      comment_count:comments(count)
    `)
    .order('created_at', { ascending: false });

  const posts: ManagedPost[] = (realPosts && realPosts.length > 0) ? realPosts.map((p: any) => ({
    id: p.id,
    title: (p.content || "Sem título").substring(0, 40) + (p.content?.length > 40 ? "..." : ""),
    excerpt: p.content || "Nenhum conteúdo descritivo.",
    authorName: p.profiles?.full_name || "Membro FéConecta",
    authorUsername: p.profiles?.username || "membro",
    type: p.post_type || "text",
    createdAt: new Date(p.created_at).toLocaleDateString('pt-BR'),
    engagement: p.like_count?.[0]?.count || 0,
    engagementValue: p.like_count?.[0]?.count || 0,
    reports: p.is_flagged ? 1 : 0, 
    commentsCount: p.comment_count?.[0]?.count || 0,
    interactionsSummary: `${p.like_count?.[0]?.count || 0} curtidas`,
    sensitive: p.is_flagged || false,
    hidden: p.status === 'hidden',
    status: p.status || 'published'
  })) : mockPosts;

  return (
    <div className="grid">
      <PostManagementPanel initialPosts={posts} />
    </div>
  );
}
