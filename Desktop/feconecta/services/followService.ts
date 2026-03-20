import { supabase } from './supabase';

export const followService = {
  // Seguir usuário
  async followUser(followingId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    if (user.id === followingId) {
      throw new Error('Não é possível seguir a si mesmo');
    }

    // Verificar se já segue
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      throw new Error('Você já segue este usuário');
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: followingId,
      });

    if (error) throw error;

    // Atualizar contadores
    await Promise.all([
      supabase.rpc('increment_following_count', { user_id: user.id }),
      supabase.rpc('increment_followers_count', { user_id: followingId }),
    ]);
  },

  // Deixar de seguir usuário
  async unfollowUser(followingId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) throw error;

    // Atualizar contadores
    await Promise.all([
      supabase.rpc('decrement_following_count', { user_id: user.id }),
      supabase.rpc('decrement_followers_count', { user_id: followingId }),
    ]);
  },

  // Verificar se está seguindo
  async isFollowing(followingId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single();

    return !error && !!data;
  },

  // Obter seguidores
  async getFollowers(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        created_at,
        follower:profiles!follows_follower_id_fkey(*)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data?.map(item => item.follower).filter(Boolean) || [];
  },

  // Obter seguindo
  async getFollowing(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        created_at,
        following:profiles!follows_following_id_fkey(*)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data?.map(item => item.following).filter(Boolean) || [];
  },
};