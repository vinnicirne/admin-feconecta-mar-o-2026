import { supabase } from './supabase';
import { Profile } from './authService';

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: string;
  version: string;
  text: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'bible_verse';
  media_url?: string;
  bible_verse?: BibleVerse;
  faith_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  has_faithed?: boolean;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  faith_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface DailyMessage {
  id: string;
  title: string;
  content: string;
  bible_reference: string;
  background_image?: string;
  faith_count: number;
  comments_count: number;
  is_active: boolean;
  created_at: string;
}

export const postsService = {
  // Obter feed de posts
  async getFeedPosts(limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Verificar se o usuário curtiu cada post
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
  },

  // Criar post
  async createPost(content: string, type: Post['type'] = 'text', mediaUrl?: string, bibleVerse?: BibleVerse): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        type,
        media_url: mediaUrl,
        bible_verse: bibleVerse,
      })
      .select(`
        *,
        profile:profiles(*)
      `)
      .single();

    if (error) throw error;

    // Atualizar contador de posts do usuário
    await supabase.rpc('increment_posts_count', { user_id: user.id });

    return { ...data, has_faithed: false };
  },

  // Curtir/descurtir post
  async toggleFaith(postId: string): Promise<{ faithed: boolean; count: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se já curtiu
    const { data: existing } = await supabase
      .from('post_faiths')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (existing) {
      // Descurtir
      const { error } = await supabase
        .from('post_faiths')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;

      // Obter contagem atualizada
      const { data: post } = await supabase
        .from('posts')
        .select('faith_count')
        .eq('id', postId)
        .single();

      return { faithed: false, count: post?.faith_count || 0 };
    } else {
      // Curtir
      const { error } = await supabase
        .from('post_faiths')
        .insert({
          user_id: user.id,
          post_id: postId,
        });

      if (error) throw error;

      // Obter contagem atualizada
      const { data: post } = await supabase
        .from('posts')
        .select('faith_count')
        .eq('id', postId)
        .single();

      return { faithed: true, count: post?.faith_count || 0 };
    }
  },

  // Obter comentários de um post
  async getPostComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Adicionar comentário
  async addComment(postId: string, content: string): Promise<Comment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        post_id: postId,
        content,
      })
      .select(`
        *,
        profile:profiles(*)
      `)
      .single();

    if (error) throw error;

    // Atualizar contador de comentários do post
    await supabase.rpc('increment_comments_count', { post_id: postId });

    return data;
  },

  // Obter mensagem do dia ativa
  async getDailyMessage(): Promise<DailyMessage | null> {
    const { data, error } = await supabase
      .from('daily_messages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  },

  // Deletar post
  async deletePost(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Decrementar contador de posts do usuário
    await supabase.rpc('decrement_posts_count', { user_id: user.id });
  },

  // Buscar posts de um usuário
  async getUserPosts(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },
};