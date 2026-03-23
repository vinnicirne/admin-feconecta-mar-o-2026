"use server";

import { createSupabaseServer } from "@/lib/supabase-server";

// 🏆 CONTROLE DO LOUVOR (DJ MINISTERIAL)
export async function updatePraiseTrack(trackId: string, title: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase indisponível.");
    
    // Atualiza a "Verdade Única" do louvor global
    const { data, error } = await supabase
      .from('praise_session')
      .update({ 
        track_id: trackId, 
        track_title: title, 
        started_at: new Date().toISOString(), // Reinicia o relógio
        is_playing: true 
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Garante que atualiza o registro existente

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getPraiseState() {
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.from('praise_session').select('*').limit(1).single();
  return data;
}
