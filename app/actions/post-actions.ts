"use server";

import { supabaseServer } from "@/lib/supabase-server";

// 🛡️ AÇÃO MINISTERIAL PROTEGIDA (SERVER SIDE ONLY)
// Estas funções rodam exclusivamente no servidor da Vercel.
// Nenhuma URL ou Chave do Supabase escapa para o navegador aqui.

export async function createPostAction(postData: any) {
  try {
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado no Refúgio.");

    const { data, error } = await supabaseServer
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
    const { data, error } = await supabaseServer
      .from('posts')
      .select('*, profiles!profile_id(full_name, username)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
