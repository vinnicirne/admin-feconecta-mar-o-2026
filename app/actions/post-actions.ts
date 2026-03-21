"use server";

import { createSupabaseServer } from "@/lib/supabase-server";

// 🛡️ AÇÃO MINISTERIAL PROTEGIDA (SERVER SIDE ONLY)
export async function createPostAction(postData: any) {
  try {
    const supabase = await createSupabaseServer();
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
    const { data: { user } } = await supabase.auth.getUser();
    
    // Filtro para interações do usuário atual
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *, 
        profiles!profile_id(
          full_name, 
          username, 
          avatar_url,
          is_following:follows!following_id(count)
        ), 
        like_count:post_likes(count), 
        comment_count:comments(count), 
        prayer_count:post_prayers(count),
        user_liked:post_likes(count),
        user_prayed:post_prayers(count),
        comments(
          id, 
          content, 
          created_at, 
          profile_id, 
          parent_id,
          profiles:profile_id(full_name, username, avatar_url)
        )
      `)
      .eq('user_liked.profile_id', userId)
      .eq('user_prayed.profile_id', userId)
      .eq('profiles.is_following.follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updatePostAction(postId: string, content: string) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado.");

    const { error } = await supabase
      .from('posts')
      .update({ content })
      .eq('id', postId)
      .eq('profile_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deletePostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado.");

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('profile_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
