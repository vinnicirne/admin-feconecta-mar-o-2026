import { supabase } from './supabase';
import { Profile } from './authService';

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  text_overlay?: string;
  text_color?: string;
  text_position?: 'top' | 'center' | 'bottom';
  mentions?: string[];
  views_count: number;
  created_at: string;
  expires_at: string;
  profile?: Profile;
  has_viewed?: boolean;
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
  profile?: Profile;
}

export const storiesService = {
  // Obter stories do feed (últimas 24h)
  async getFeedStories(): Promise<Story[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Stories de usuários que sigo + meus próprios stories
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profile:profiles(*)
      `)
      .gt('expires_at', new Date().toISOString())
      .or(`user_id.eq.${user.id},user_id.in.(SELECT following_id FROM follows WHERE follower_id = '${user.id}')`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Verificar quais stories já foram visualizados
    if (data && data.length > 0) {
      const storyIds = data.map(story => story.id);
      const { data: views } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', user.id)
        .in('story_id', storyIds);

      const viewedStoryIds = new Set(views?.map(v => v.story_id) || []);

      return data.map(story => ({
        ...story,
        has_viewed: viewedStoryIds.has(story.id),
      }));
    }

    return data || [];
  },

  // Criar novo story
  async createStory(storyData: {
    media_url: string;
    media_type: 'image' | 'video';
    text_overlay?: string;
    text_color?: string;
    text_position?: 'top' | 'center' | 'bottom';
    mentions?: string[];
  }): Promise<Story> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        media_url: storyData.media_url,
        media_type: storyData.media_type,
        text_overlay: storyData.text_overlay,
        text_color: storyData.text_color,
        text_position: storyData.text_position,
        mentions: storyData.mentions || [],
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        *,
        profile:profiles(*)
      `)
      .single();

    if (error) throw error;
    return { ...data, has_viewed: false };
  },

  // Visualizar story
  async viewStory(storyId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se já visualizou
    const { data: existing } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('viewer_id', user.id)
      .single();

    if (!existing) {
      const { error } = await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          viewer_id: user.id,
        });

      if (error) throw error;

      // Incrementar contador de visualizações
      await supabase.rpc('increment_story_views', { story_id: storyId });
    }
  },

  // Obter visualizações de um story
  async getStoryViews(storyId: string): Promise<StoryView[]> {
    const { data, error } = await supabase
      .from('story_views')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obter stories de um usuário específico
  async getUserStories(userId: string): Promise<Story[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Verificar visualizações se for usuário logado
    if (user && data && data.length > 0) {
      const storyIds = data.map(story => story.id);
      const { data: views } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', user.id)
        .in('story_id', storyIds);

      const viewedStoryIds = new Set(views?.map(v => v.story_id) || []);

      return data.map(story => ({
        ...story,
        has_viewed: viewedStoryIds.has(story.id),
      }));
    }

    return data || [];
  },

  // Deletar story
  async deleteStory(storyId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Limpar stories expirados (função utilitária)
  async cleanExpiredStories(): Promise<void> {
    const { error } = await supabase
      .from('stories')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  },
};