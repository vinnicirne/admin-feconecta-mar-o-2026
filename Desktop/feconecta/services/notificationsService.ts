import { supabase } from './supabase';
import { Profile } from './authService';

export interface Notification {
  id: string;
  user_id: string;
  type: 'follow' | 'faith' | 'comment' | 'mention' | 'story_view' | 'community_invite';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  actor_profile?: Profile;
}

export const notificationsService = {
  // Obter notificações do usuário
  async getUserNotifications(limit = 50, offset = 0): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor_profile:profiles!notifications_actor_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        // Se tabela não existe, retorna array vazio ao invés de erro
        if (error.message?.includes('Could not find the table')) {
          console.log('Tabela notifications não existe - retornando array vazio');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Erro no notificationsService.getUserNotifications:', error);
      return [];
    }
  },

  // Criar notificação
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === userId) return; // Não notificar a si mesmo

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          actor_id: user.id,
          type,
          title,
          message,
          data,
        });

      if (error) {
        // Se tabela não existe, apenas log ao invés de erro
        if (error.message?.includes('Could not find the table')) {
          console.log('Tabela notifications não existe - pulando criação de notificação');
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro no notificationsService.createNotification:', error);
    }
  },

  // Marcar notificação como lida
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error && !error.message?.includes('Could not find the table')) {
        throw error;
      }
    } catch (error) {
      console.error('Erro no notificationsService.markAsRead:', error);
    }
  },

  // Marcar todas como lidas
  async markAllAsRead(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error && !error.message?.includes('Could not find the table')) {
        throw error;
      }
    } catch (error) {
      console.error('Erro no notificationsService.markAllAsRead:', error);
    }
  },

  // Obter contador de não lidas
  async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return 0;
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        // Se tabela não existe, retorna 0 ao invés de erro
        if (error.message?.includes('Could not find the table')) {
          console.log('Tabela notifications não existe - contador zerado');
          return 0;
        }
        throw error;
      }
      return count || 0;
    } catch (error) {
      console.error('Erro no notificationsService.getUnreadCount:', error);
      return 0;
    }
  },

  // Escutar novas notificações em tempo real
  subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
    try {
      return supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            try {
              // Buscar dados completos da notificação
              const { data } = await supabase
                .from('notifications')
                .select(`
                  *,
                  actor_profile:profiles!notifications_actor_id_fkey(*)
                `)
                .eq('id', payload.new.id)
                .single();

              if (data) {
                onNotification(data);
              }
            } catch (error) {
              console.error('Erro ao processar nova notificação:', error);
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Erro ao criar subscription de notificações:', error);
      // Retorna um objeto mock para não quebrar
      return {
        unsubscribe: () => console.log('Mock unsubscribe')
      };
    }
  },

  // Deletar notificação
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error && !error.message?.includes('Could not find the table')) {
        throw error;
      }
    } catch (error) {
      console.error('Erro no notificationsService.deleteNotification:', error);
    }
  },
};