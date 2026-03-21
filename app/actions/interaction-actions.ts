"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// 🙏 REGISTRAR ORAÇÃO (Ato Ministerial)
export async function prayPostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para orar por este irmão 🙏");

    const { data: existing } = await supabase
      .from('post_prayers')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .single();

    if (existing) {
      await supabase.from('post_prayers').delete().eq('id', existing.id);
    } else {
      await supabase.from('post_prayers').insert([{ post_id: postId, profile_id: user.id }]);
    }
    
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ❤️ REGISTRAR CURTIDA (Impacto de Fé)
export async function likePostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para reagir 🙏");

    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .single();

    if (existing) {
      await supabase.from('post_likes').delete().eq('id', existing.id);
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, profile_id: user.id }]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 💬 REGISTRAR COMENTÁRIO (Comunhão Ministerial)
export async function commentPostAction(postId: string, content: string, parentId?: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para comentar 🙏");

    const { error } = await supabase
      .from('comments')
      .insert([{ 
        post_id: postId, 
        profile_id: user.id, 
        content,
        parent_id: parentId || null
      }]);

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
export async function updateCommentAction(commentId: string, content: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado.");

    const { error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .eq('profile_id', user.id);

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCommentAction(commentId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado.");

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('profile_id', user.id);

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function followUserAction(targetProfileId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para seguir pessoas 🙏");
    if (user.id === targetProfileId) return { success: true }; // Silently ignore self-follow

    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetProfileId)
      .single();

    if (existing) {
      await supabase.from('follows').delete().eq('id', existing.id);
    } else {
      await supabase.from('follows').insert([{ follower_id: user.id, following_id: targetProfileId }]);
    }
    
    revalidatePath("/");
    return { success: true, isFollowing: !existing };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
