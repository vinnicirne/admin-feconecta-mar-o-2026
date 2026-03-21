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
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!profile_id(full_name, username), like_count:post_likes(count), comment_count:comments(count), prayer_count:post_prayers(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
