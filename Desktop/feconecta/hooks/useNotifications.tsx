import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsService, Notification } from '../services/notificationsService';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }
    
    setLoading(true);
    try {
      const userNotifications = await notificationsService.getUserNotifications();
      setNotifications(userNotifications);
    } catch (error: any) {
      // Se tabela não existe, apenas log e continua com array vazio
      if (error.message?.includes('Could not find the table')) {
        console.log('Tabela notifications não existe ainda - usando fallback');
        setNotifications([]);
      } else {
        console.error('Erro ao carregar notificações:', error);
        setNotifications([]);
      }
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
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (error: any) {
      // Se tabela não existe, apenas log e continua com 0
      if (error.message?.includes('Could not find the table')) {
        console.log('Tabela notifications não existe ainda - contador zerado');
        setUnreadCount(0);
      } else {
        console.error('Erro ao carregar contador:', error);
        setUnreadCount(0);
      }
    }
  }, [user, isAuthenticated]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAuthenticated || !user) return;
    
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      loadUnreadCount();
    } catch (error: any) {
      if (!error.message?.includes('Could not find the table')) {
        console.error('Erro ao marcar como lida:', error);
      }
    }
  }, [user, isAuthenticated, loadUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      if (!error.message?.includes('Could not find the table')) {
        console.error('Erro ao marcar todas como lidas:', error);
      }
    }
  }, [user, isAuthenticated]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!isAuthenticated || !user) return;
    
    try {
      await notificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadUnreadCount();
    } catch (error: any) {
      if (!error.message?.includes('Could not find the table')) {
        console.error('Erro ao deletar notificação:', error);
      }
    }
  }, [user, isAuthenticated, loadUnreadCount]);

  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current && isSubscribedRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (error) {
        console.log('Cleanup notification subscription');
      }
      subscriptionRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  const createSubscription = useCallback(() => {
    if (!isAuthenticated || !user || isSubscribedRef.current) return;

    try {
      subscriptionRef.current = notificationsService.subscribeToNotifications(user.id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
      isSubscribedRef.current = true;
    } catch (error: any) {
      if (!error.message?.includes('Could not find the table')) {
        console.error('Erro ao criar subscription de notificações:', error);
      }
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      loadUnreadCount();
      
      // Cleanup subscription anterior se existir
      cleanupSubscription();
      
      // Criar nova subscription apenas se tabela existir
      const timer = setTimeout(() => {
        createSubscription();
      }, 1000); // Delay para evitar erro imediato
      
      return () => {
        clearTimeout(timer);
        cleanupSubscription();
      };
    } else {
      // Reset state when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      
      // Cleanup subscription
      cleanupSubscription();
    }
  }, [isAuthenticated, user?.id]);

  return {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}