import { supabase } from './supabase';
import { Profile } from './authService';

export interface SearchUser extends Profile {
  is_following?: boolean;
}

export const userService = {
  // Buscar usuários
  async searchUsers(query: string, limit = 20): Promise<SearchUser[]> {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Erro na busca de usuários:', error);
        return [];
      }

      // Verificar quais usuários o usuário atual segue
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && data) {
        const userIds = data.map(profile => profile.id);
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds);

        const followingIds = new Set(follows?.map(f => f.following_id) || []);

        return data.map(profile => ({
          ...profile,
          is_following: followingIds.has(profile.id),
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Erro no userService.searchUsers:', error);
      return [];
    }
  },

  // Obter usuários sugeridos
  async getSuggestedUsers(limit = 10): Promise<Profile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Retornar array vazio ao invés de erro quando não autenticado
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao carregar sugestões:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Erro no userService.getSuggestedUsers:', error);
      return [];
    }
  },

  // Obter perfil por username
  async getProfileByUsername(username: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('Erro no userService.getProfileByUsername:', error);
      return null;
    }
  },

  // Obter posts do usuário
  async getUserPosts(userId: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erro ao carregar posts do usuário:', error);
        return [];
      }

      // Verificar curtidas do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && data) {
        const postIds = data.map(post => post.id);
        const { data: faiths } = await supabase
          .from('post_faiths')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const faithedPostIds = new Set(faiths?.map(f => f.post_id) || []);

        return data.map(post => ({
          ...post,
          has_faithed: faithedPostIds.has(post.id),
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Erro no userService.getUserPosts:', error);
      return [];
    }
  },
};