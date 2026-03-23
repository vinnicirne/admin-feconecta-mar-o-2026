"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// 🙏 REGISTRAR ORAÇÃO (Ato Ministerial)
export async function prayPostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para orar 🙏");

    const { data: existing, error: fetchError } = await supabase
      .from('post_prayers')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .single();

    if (existing) {
      const { error: delError } = await supabase.from('post_prayers').delete().eq('id', existing.id);
      if (delError) throw delError;
    } else {
      const { error: insError } = await supabase.from('post_prayers').insert([{ post_id: postId, profile_id: user.id }]);
      if (insError) throw insError;
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("Pray action error:", err);
    return { success: false, error: err.message };
  }
}

// ❤️ REGISTRAR CURTIDA (Impacto de Fé)
export async function likePostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para curtir 🙏");

    const { data: existing, error: fetchError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .single();

    if (existing) {
      const { error: delError } = await supabase.from('post_likes').delete().eq('id', existing.id);
      if (delError) throw delError;
    } else {
      const { error: insError } = await supabase.from('post_likes').insert([{ post_id: postId, profile_id: user.id }]);
      if (insError) throw insError;
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("Like action error:", err);
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
    if (user.id === targetProfileId) return { success: true };

    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetProfileId)
      .single();

    if (existing) {
      // Unfollow
      await supabase.from('follows').delete().eq('id', existing.id);

      // Update Counts
      await supabase.rpc('decrement_follower_count', { profile_id: targetProfileId });
      await supabase.rpc('decrement_following_count', { profile_id: user.id });

      // Fallback if RPC doesn't exist (using direct update for standard fields)
      await supabase.from('profiles').update({ follower_count: supabase.rpc('decrement') }).eq('id', targetProfileId);
      await supabase.from('profiles').update({ following_count: supabase.rpc('decrement') }).eq('id', user.id);
    } else {
      // Follow
      await supabase.from('follows').insert([{ follower_id: user.id, following_id: targetProfileId }]);

      // Update Counts (Try RPC first, then direct update)
      try {
        await supabase.from('profiles').update({
          follower_count: (await supabase.from('profiles').select('follower_count').eq('id', targetProfileId).single()).data?.follower_count + 1
        }).eq('id', targetProfileId);

        await supabase.from('profiles').update({
          following_count: (await supabase.from('profiles').select('following_count').eq('id', user.id).single()).data?.following_count + 1
        }).eq('id', user.id);
      } catch (e) {
        console.warn("Direct update failed, counts might be out of sync if RLS blocks updates.");
      }
    }

    revalidatePath("/");
    return { success: true, isFollowing: !existing };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
export async function sharePostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");

    // Registrar impacto de compartilhamento
    await supabase.from('post_shares').insert([{ post_id: postId }]);

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function repostPostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para repostar 🙏");

    const { data: existing } = await supabase
      .from('post_reposts')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', user.id)
      .single();

    if (existing) {
      await supabase.from('post_reposts').delete().eq('id', existing.id);
      // Remove o post espelho da timeline
      await supabase.from('posts').delete().eq('profile_id', user.id).contains('metadata', { repost_of: postId });
    } else {
      const { error: insError } = await supabase.from('post_reposts').insert([{ post_id: postId, profile_id: user.id }]);
      if (insError) throw insError;

      // Busca o post original para espelhar
      const { data: original } = await (supabase.from('posts')
        .select('*, profiles!profile_id(full_name)')
        .eq('id', postId)
        .single() as any);
      
      // Cria o post espelho que aparece no perfil e feed
      await supabase.from('posts').insert([{
        profile_id: user.id,
        content: original?.content,
        media_type: original?.media_type || 'text',
        image_url: original?.image_url,
        post_type: 'compartilhar',
        metadata: { 
          is_repost: true, 
          repost_of: postId,
          original_author_id: original?.profile_id,
          original_author_name: original?.profiles?.full_name || 'Irmão'
        }
      }]);
    }

    revalidatePath("/", "layout");
    revalidatePath("/feed");
    return { success: true, isReposted: !existing };
  } catch (err: any) {
    console.error("Repost action error:", err);
    return { success: false, error: err.message };
  }
}

export async function getWarRoomStatusAction(roomId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    
    const { data, error } = await supabase
      .from('prayer_rooms')
      .select('status')
      .eq('id', roomId)
      .single();

    if (error || !data) return { status: 'not_found' };
    return { status: data.status };
  } catch (err: any) {
    console.error("Check room status error:", err);
    return { status: 'error', error: err.message };
  }
}
export async function updateProfileAction(profileId: string, updates: any) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== profileId) throw new Error("Não autorizado.");

    // Destructuring para tratar campos especiais
    const { email, username, ...profileUpdates } = updates;

    // 1. Atualizar E-mail se mudou (Dashboard check: profile_edit_email)
    if (email && email !== user.email) {
       const { error: emailError } = await supabase.auth.updateUser({ email });
       if (emailError) throw emailError;
    }

    // 2. Tratar campos de Data e Nulos
    if (profileUpdates.birth_date === "") {
       profileUpdates.birth_date = null;
    }
    
    if (profileUpdates.community_id === "") {
       profileUpdates.community_id = null;
    }

    // 2. Trava de 15 dias para Username
    if (username && username !== user.user_metadata?.username) {
        const { data: currentProfile } = await supabase.from('profiles').select('username_updated_at').eq('id', profileId).single();
        
        if (currentProfile?.username_updated_at) {
          const lastUpdate = new Date(currentProfile.username_updated_at).getTime();
          const now = Date.now();
          const deltaDays = (now - lastUpdate) / (1000 * 60 * 60 * 24);
          
          if (deltaDays < 15) {
             throw new Error(`O username só pode ser alterado a cada 15 dias. Faltam ${Math.ceil(15 - deltaDays)} dias.`);
          }
        }
        
        profileUpdates.username = username;
        profileUpdates.username_updated_at = new Date().toISOString();
        
        // Sincronizar com Auth Metadata para garantir consistência
        const { error: authError } = await supabase.auth.updateUser({ 
           data: { ...user.user_metadata, username } 
        });
        if (authError) throw authError;
    }

    // Sanitização final para evitar erros de schema/RLS
    const safeUpdates = { ...profileUpdates };
    // @ts-ignore
    delete safeUpdates.id;
    // @ts-ignore
    delete safeUpdates.created_at;

    console.log("Executando update no Supabase...", { profileId, safeUpdates });

    const { error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', profileId);

    if (error) {
       console.error("Erro no update do Supabase:", error);
       throw error;
    }
    
    // Revalidar path do perfil
    revalidatePath(`/profile/${username || user.user_metadata?.username || user.email?.split('@')[0]}`, "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
export async function updatePostAction(postId: string, content: string, metadata?: any) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado.");

    const updateData: any = { content };
    if (metadata?.background_style) updateData.background_style = metadata.background_style;
    if (metadata?.font_family) updateData.font_family = metadata.font_family;

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .eq('profile_id', user.id);

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deletePostAction(postId: string) {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado.");

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('profile_id', user.id);

    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
