import { createSupabaseServer } from "@/lib/supabase-server";

export async function addFeatureAction() {
  const supabase = await createSupabaseServer();
  if (!supabase) return;
  
  await supabase.from('app_features').upsert([
    { 
      name: 'war_room_join_button', 
      label: 'Botão "Entrar na Sala" no Feed (Posts)', 
      is_enabled: true 
    },
    {
      name: 'war_room_status_validation',
      label: 'Validar status da sala ao clicar no feed',
      is_enabled: true
    },
    {
      name: 'profile_interactions',
      label: 'Sistema de Conexões (Seguir) no Perfil',
      is_enabled: true
    },
    {
      name: 'profile_private_mode',
      label: 'Privacidade de Perfil (Controle de Altar)',
      is_enabled: true
    },
    {
      name: 'profile_social_links',
      label: 'Links de Redes Sociais no Perfil',
      is_enabled: true
    },
    {
      name: 'profile_chat_button',
      label: 'Botão de Conversa Privada no Perfil',
      is_enabled: true
    },
    {
      name: 'profile_edit_button',
      label: 'Botão de Edição de Perfil',
      is_enabled: true
    },
    {
      name: 'profile_advanced_edit',
      label: 'Módulo de Edição Completo (Avatar, Igreja, Social)',
      is_enabled: true
    }
  ], { onConflict: 'name' });
}
