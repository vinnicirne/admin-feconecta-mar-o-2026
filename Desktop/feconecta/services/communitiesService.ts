import { supabase } from './supabase';
import { Profile } from './authService';

export interface Community {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  cover_url?: string;
  created_by: string;
  is_verified: boolean;
  members_count: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  creator_profile?: Profile;
  is_member?: boolean;
  member_role?: 'admin' | 'moderator' | 'member';
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  profile?: Profile;
}

export const communitiesService = {
  // Obter todas as comunidades
  async getAllCommunities(limit = 20, offset = 0): Promise<Community[]> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          creator_profile:profiles!communities_created_by_fkey(*)
        `)
        .order('members_count', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erro ao carregar todas as comunidades:', error);
        return [];
      }

      // Verificar se o usuário é membro de cada comunidade
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && data) {
        const communityIds = data.map(community => community.id);
        const { data: members } = await supabase
          .from('community_members')
          .select('community_id, role')
          .eq('user_id', user.id)
          .in('community_id', communityIds);

        const membershipMap = new Map(
          members?.map(m => [m.community_id, m.role]) || []
        );

        return data.map(community => ({
          ...community,
          is_member: membershipMap.has(community.id),
          member_role: membershipMap.get(community.id),
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Erro no communitiesService.getAllCommunities:', error);
      return [];
    }
  },

  // Criar nova comunidade
  async createCommunity(communityData: {
    name: string;
    description?: string;
    image_url?: string;
    cover_url?: string;
    is_private?: boolean;
  }): Promise<Community> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('communities')
      .insert({
        name: communityData.name.trim(),
        description: communityData.description?.trim() || null,
        image_url: communityData.image_url || null,
        cover_url: communityData.cover_url || null,
        created_by: user.id,
        is_private: communityData.is_private || false,
      })
      .select(`
        *,
        creator_profile:profiles!communities_created_by_fkey(*)
      `)
      .single();

    if (error) throw error;

    // Adicionar o criador como admin da comunidade
    await supabase
      .from('community_members')
      .insert({
        community_id: data.id,
        user_id: user.id,
        role: 'admin',
      });

    // Incrementar contador de membros
    await supabase.rpc('increment_community_members', { community_id: data.id });

    return { ...data, is_member: true, member_role: 'admin' };
  },

  // Entrar na comunidade
  async joinCommunity(communityId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se já é membro
    const { data: existing } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      throw new Error('Você já é membro desta comunidade');
    }

    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member',
      });

    if (error) throw error;

    // Incrementar contador de membros
    await supabase.rpc('increment_community_members', { community_id: communityId });
  },

  // Sair da comunidade
  async leaveCommunity(communityId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Decrementar contador de membros
    await supabase.rpc('decrement_community_members', { community_id: communityId });
  },

  // Obter membros da comunidade
  async getCommunityMembers(communityId: string, limit = 50, offset = 0): Promise<CommunityMember[]> {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erro ao carregar membros da comunidade:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Erro no communitiesService.getCommunityMembers:', error);
      return [];
    }
  },

  // Buscar comunidades
  async searchCommunities(query: string, limit = 20): Promise<Community[]> {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          creator_profile:profiles!communities_created_by_fkey(*)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Erro na busca de comunidades:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Erro no communitiesService.searchCommunities:', error);
      return [];
    }
  },

  // Obter comunidades do usuário
  async getUserCommunities(userId?: string): Promise<Community[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      // Retornar array vazio se não há usuário (ao invés de erro)
      if (!targetUserId) {
        console.log('getUserCommunities: Nenhum usuário especificado, retornando array vazio');
        return [];
      }

      const { data, error } = await supabase
        .from('community_members')
        .select(`
          role,
          joined_at,
          community:communities(
            *,
            creator_profile:profiles!communities_created_by_fkey(*)
          )
        `)
        .eq('user_id', targetUserId)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar comunidades do usuário:', error);
        return [];
      }

      return data?.map(item => ({
        ...item.community,
        is_member: true,
        member_role: item.role,
      })) || [];
    } catch (error) {
      console.error('Erro no communitiesService.getUserCommunities:', error);
      return [];
    }
  },

  // Atualizar comunidade
  async updateCommunity(communityId: string, updates: Partial<Community>): Promise<Community> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se é admin da comunidade
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single();

    if (!member || member.role !== 'admin') {
      throw new Error('Você não tem permissão para editar esta comunidade');
    }

    const { data, error } = await supabase
      .from('communities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', communityId)
      .select(`
        *,
        creator_profile:profiles!communities_created_by_fkey(*)
      `)
      .single();

    if (error) throw error;
    return { ...data, is_member: true, member_role: 'admin' };
  },
};