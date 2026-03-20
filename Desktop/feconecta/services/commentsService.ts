import { supabase } from './supabase';
import { Profile } from './authService';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  faith_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  has_faithed?: boolean;
}

export const commentsService = {
  // Obter comentários de um post
  async getPostComments(postId: string, limit = 50, offset = 0): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Verificar curtidas do usuário atual nos comentários
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && data) {
      const commentIds = data.map(comment => comment.id);
      const { data: faiths } = await supabase
        .from('comment_faiths')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      const faithedCommentIds = new Set(faiths?.map(f => f.comment_id) || []);

      return data.map(comment => ({
        ...comment,
        has_faithed: faithedCommentIds.has(comment.id),
      }));
    }

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
        content: content.trim(),
      })
      .select(`
        *,
        profile:profiles(*)
      `)
      .single();

    if (error) throw error;

    // Atualizar contador de comentários do post
    await supabase.rpc('increment_comments_count', { post_id: postId });

    return { ...data, has_faithed: false };
  },

  // Curtir/descurtir comentário
  async toggleCommentFaith(commentId: string): Promise<{ faithed: boolean; count: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se já curtiu
    const { data: existing } = await supabase
      .from('comment_faiths')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .single();

    if (existing) {
      // Descurtir
      const { error } = await supabase
        .from('comment_faiths')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;

      // Obter contagem atualizada
      const { data: comment } = await supabase
        .from('comments')
        .select('faith_count')
        .eq('id', commentId)
        .single();

      return { faithed: false, count: comment?.faith_count || 0 };
    } else {
      // Curtir
      const { error } = await supabase
        .from('comment_faiths')
        .insert({
          user_id: user.id,
          comment_id: commentId,
        });

      if (error) throw error;

      // Obter contagem atualizada
      const { data: comment } = await supabase
        .from('comments')
        .select('faith_count')
        .eq('id', commentId)
        .single();

      return { faithed: true, count: comment?.faith_count || 0 };
    }
  },

  // Deletar comentário
  async deleteComment(commentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Obter o post_id antes de deletar
    const { data: comment } = await supabase
      .from('comments')
      .select('post_id')
      .eq('id', commentId)
      .eq('user_id', user.id)
      .single();

    if (!comment) throw new Error('Comentário não encontrado');

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Decrementar contador de comentários do post
    await supabase.rpc('decrement_comments_count', { post_id: comment.post_id });
  },
};