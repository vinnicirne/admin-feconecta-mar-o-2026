import { supabase } from './supabase';
import { Profile } from './authService';

export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at?: string;
  last_message_by?: string;
  unread_count_user1: number;
  unread_count_user2: number;
  created_at: string;
  updated_at: string;
  other_user?: Profile;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'audio' | 'image';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: Profile;
}

export const chatService = {
  // Obter ou criar chat entre dois usuários
  async getOrCreateChat(otherUserId: string): Promise<Chat> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Verificar se já existe chat
      const { data: existingChat } = await supabase
        .from('chats')
        .select(`
          *,
          user1_profile:profiles!chats_user1_id_fkey(*),
          user2_profile:profiles!chats_user2_id_fkey(*)
        `)
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (existingChat) {
        return {
          ...existingChat,
          other_user: existingChat.user1_id === user.id 
            ? existingChat.user2_profile 
            : existingChat.user1_profile,
        };
      }

      // Criar novo chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          user1_id: user.id,
          user2_id: otherUserId,
        })
        .select(`
          *,
          user1_profile:profiles!chats_user1_id_fkey(*),
          user2_profile:profiles!chats_user2_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      return {
        ...newChat,
        other_user: newChat.user2_profile,
      };
    } catch (error) {
      console.error('Erro no chatService.getOrCreateChat:', error);
      throw error;
    }
  },

  // Obter lista de chats do usuário
  async getUserChats(): Promise<Chat[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Retornar array vazio ao invés de erro quando não autenticado
        return [];
      }

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          user1_profile:profiles!chats_user1_id_fkey(*),
          user2_profile:profiles!chats_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar chats:', error);
        return [];
      }

      return data?.map(chat => ({
        ...chat,
        other_user: chat.user1_id === user.id 
          ? chat.user2_profile 
          : chat.user1_profile,
      })) || [];
    } catch (error) {
      console.error('Erro no chatService.getUserChats:', error);
      return [];
    }
  },

  // Enviar mensagem
  async sendMessage(chatId: string, content: string, messageType: 'text' | 'audio' | 'image' = 'text', mediaUrl?: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content,
          message_type: messageType,
          media_url: mediaUrl,
        })
        .select(`
          *,
          sender_profile:profiles(*)
        `)
        .single();

      if (error) throw error;

      // Atualizar último message do chat
      await supabase
        .from('chats')
        .update({
          last_message: messageType === 'text' ? content : `[${messageType}]`,
          last_message_at: new Date().toISOString(),
          last_message_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId);

      return data;
    } catch (error) {
      console.error('Erro no chatService.sendMessage:', error);
      throw error;
    }
  },

  // Obter mensagens de um chat
  async getChatMessages(chatId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles(*)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return [];
      }
      return data?.reverse() || [];
    } catch (error) {
      console.error('Erro no chatService.getChatMessages:', error);
      return [];
    }
  },

  // Marcar mensagens como lidas
  async markMessagesAsRead(chatId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Marcar mensagens como lidas
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id);
    } catch (error) {
      console.error('Erro no chatService.markMessagesAsRead:', error);
    }
  },

  // Escutar novas mensagens em tempo real
  subscribeToChat(chatId: string, onMessage: (message: Message) => void) {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          try {
            // Buscar dados completos da mensagem
            const { data } = await supabase
              .from('messages')
              .select(`
                *,
                sender_profile:profiles(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              onMessage(data);
            }
          } catch (error) {
            console.error('Erro ao processar nova mensagem:', error);
          }
        }
      )
      .subscribe();
  },

  // Obter total de mensagens não lidas
  async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Retornar 0 ao invés de erro quando não autenticado
        return 0;
      }

      const { data, error } = await supabase
        .from('chats')
        .select('unread_count_user1, unread_count_user2, user1_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) {
        console.error('Erro ao carregar contador de não lidas:', error);
        return 0;
      }

      return data?.reduce((total, chat) => {
        const unreadCount = chat.user1_id === user.id 
          ? chat.unread_count_user1 
          : chat.unread_count_user2;
        return total + unreadCount;
      }, 0) || 0;
    } catch (error) {
      console.error('Erro no chatService.getUnreadCount:', error);
      return 0;
    }
  },
};