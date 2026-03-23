"use server";

import { createSupabaseServer } from "@/lib/supabase-server";

// 🛡️ AÇÃO MINISTERIAL PROTEGIDA (SERVER SIDE ONLY)
export async function createPostAction(postData: any) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado no servidor.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado no Refúgio.");

    const { data, error } = await supabase
      .from('posts')
      .insert([{ ...postData, profile_id: user.id }])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("ERRO PROTEGIDO NO SERVIDOR:", err.message);
    return { success: false, error: err.message };
  }
}

export async function getPostsAction() {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    
    // Filtro para interações do usuário atual
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const { data: rawData, error } = await supabase
      .from('posts')
      .select(`
        *, 
        profiles!profile_id(
          full_name, 
          username, 
          avatar_url
        ), 
        like_count:post_likes(count), 
        comment_count:comments(count), 
        prayer_count:post_prayers(count),
        repost_count:post_reposts(count),
        share_count:post_shares(count),
        user_liked:post_likes(profile_id),
        user_prayed:post_prayers(profile_id),
        user_reposted:post_reposts(profile_id),
        comments(
          id, 
          content, 
          created_at, 
          profile_id, 
          parent_id,
          profiles:profile_id(full_name, username, avatar_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 🛡️ RECONSTRUÇÃO DE ESTADO: Identifica interações do usuário sem filtrar o feed
    const data = (rawData as any[])?.map((post: any) => ({
      ...post,
      user_liked: { count: post.user_liked?.some((l: any) => l.profile_id === userId) ? 1 : 0 },
      user_prayed: { count: post.user_prayed?.some((p: any) => p.profile_id === userId) ? 1 : 0 },
      user_reposted: { count: post.user_reposted?.some((r: any) => r.profile_id === userId) ? 1 : 0 },
    })) || [];

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getCommunityPostsAction(communityId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    
    // Filtro para interações do usuário atual
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const { data: rawData, error } = await supabase
      .from('posts')
      .select(`
        *, 
        profiles!profile_id(
          full_name, 
          username, 
          avatar_url
        ), 
        like_count:post_likes(count), 
        comment_count:comments(count), 
        prayer_count:post_prayers(count),
        repost_count:post_reposts(count),
        share_count:post_shares(count),
        user_liked:post_likes(profile_id),
        user_prayed:post_prayers(profile_id),
        user_reposted:post_reposts(profile_id),
        comments(
          id, 
          content, 
          created_at, 
          profile_id, 
          parent_id,
          profiles:profile_id(full_name, username, avatar_url)
        )
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 🛡️ RECONSTRUÇÃO DE ESTADO
    const data = (rawData as any[])?.map((post: any) => ({
      ...post,
      user_liked: { count: post.user_liked?.some((l: any) => l.profile_id === userId) ? 1 : 0 },
      user_prayed: { count: post.user_prayed?.some((p: any) => p.profile_id === userId) ? 1 : 0 },
      user_reposted: { count: post.user_reposted?.some((r: any) => r.profile_id === userId) ? 1 : 0 },
    })) || [];

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


