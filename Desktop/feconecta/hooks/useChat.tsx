import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, Chat, Message } from '../services/chatService';
import { useAuth } from './useAuth';

export function useChat() {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const loadChats = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setChats([]);
      return;
    }
    
    setLoading(true);
    try {
      const userChats = await chatService.getUserChats();
      setChats(userChats);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar contador de não lidas:', error);
      setUnreadCount(0);
    }
  }, [user, isAuthenticated]);

  const openChat = useCallback(async (otherUserId: string) => {
    if (!isAuthenticated || !user) throw new Error('Usuário não autenticado');
    
    try {
      const chat = await chatService.getOrCreateChat(otherUserId);
      setCurrentChat(chat);
      
      const chatMessages = await chatService.getChatMessages(chat.id);
      setMessages(chatMessages);
      
      // Marcar como lidas
      await chatService.markMessagesAsRead(chat.id);
      
      return chat;
    } catch (error) {
      console.error('Erro ao abrir chat:', error);
      throw error;
    }
  }, [user, isAuthenticated]);

  const sendMessage = useCallback(async (
    chatId: string, 
    content: string, 
    messageType: 'text' | 'audio' | 'image' = 'text',
    mediaUrl?: string
  ) => {
    if (!isAuthenticated || !user) throw new Error('Usuário não autenticado');
    
    try {
      const message = await chatService.sendMessage(chatId, content, messageType, mediaUrl);
      setMessages(prev => [...prev, message]);
      
      // Atualizar lista de chats
      loadChats();
      return message;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }, [user, isAuthenticated, loadChats]);

  const markAsRead = useCallback(async (chatId: string) => {
    if (!isAuthenticated || !user) return;
    
    try {
      await chatService.markMessagesAsRead(chatId);
      loadUnreadCount();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }, [user, isAuthenticated, loadUnreadCount]);

  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current && isSubscribedRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (error) {
        console.log('Cleanup chat subscription');
      }
      subscriptionRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadChats();
      loadUnreadCount();
      
      // Cleanup subscription anterior se existir
      cleanupSubscription();
      
      return () => {
        cleanupSubscription();
      };
    } else {
      // Reset state when user logs out
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
      setUnreadCount(0);
      setLoading(false);
      
      // Cleanup subscription
      cleanupSubscription();
    }
  }, [isAuthenticated, user?.id, loadChats, loadUnreadCount]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    unreadCount,
    loadChats,
    openChat,
    sendMessage,
    markAsRead,
    setCurrentChat,
  };
}