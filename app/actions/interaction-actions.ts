"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// 🙏 REGISTRAR ORAÇÃO (Ato Ministerial)
export async function prayPostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para orar por este irmão 🙏");

    const { error } = await supabase
      .from('post_prayers')
      .upsert([{ post_id: postId, profile_id: user.id }], { onConflict: 'post_id, profile_id' });

    if (error) throw error;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para reagir 🙏");

    const { error } = await supabase
      .from('post_likes')
      .upsert([{ post_id: postId, profile_id: user.id }], { onConflict: 'post_id, profile_id' });

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 💬 REGISTRAR COMENTÁRIO (Comunhão Ministerial)
export async function commentPostAction(postId: string, content: string) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para comentar 🙏");

    const { error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, profile_id: user.id, content }]);

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
