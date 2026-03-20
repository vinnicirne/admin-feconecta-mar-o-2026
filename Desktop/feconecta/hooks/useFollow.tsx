import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export function useFollow() {
  const [loading, setLoading] = useState(false);

  const followUser = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (user.id === userId) {
        throw new Error('Não é possível seguir a si mesmo');
      }

      // Verificar se já segue
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (existing) {
        throw new Error('Você já segue este usuário');
      }

      // Criar follow
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (error) throw error;

      // Atualizar contadores
      await Promise.all([
        supabase.rpc('increment_following_count', { user_id: user.id }),
        supabase.rpc('increment_followers_count', { user_id: userId }),
      ]);

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao seguir usuário');
    } finally {
      setLoading(false);
    }
  }, []);

  const unfollowUser = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      // Atualizar contadores
      await Promise.all([
        supabase.rpc('decrement_following_count', { user_id: user.id }),
        supabase.rpc('decrement_followers_count', { user_id: userId }),
      ]);

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao deixar de seguir usuário');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIsFollowing = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    loading,
    followUser,
    unfollowUser,
    checkIsFollowing,
  };
}