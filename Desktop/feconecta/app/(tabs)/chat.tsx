import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useChat } from '../../hooks/useChat';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

export default function ChatScreen() {
  const { chats, loading, unreadCount, openChat } = useChat();
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    
    // Se for hoje
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Se foi ontem
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    
    // Data completa
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleChatPress = async (chat: any) => {
    try {
      await openChat(chat.other_user.id);
      showAlert('Chat', 'Interface de chat individual em desenvolvimento');
    } catch (error: any) {
      showAlert('Erro', error.message);
    }
  };

  const getUnreadCount = (chat: any) => {
    // Determinar qual contador usar baseado no usuário atual
    // Por simplicidade, vamos usar user1 como referência
    return chat.unread_count_user1 || 0;
  };

  const renderChat = ({ item }: { item: any }) => {
    const unreadMessages = getUnreadCount(item);
    
    return (
      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => handleChatPress(item)}
      >
        <Image 
          source={{ 
            uri: item.other_user?.profile_image || 
                 `https://ui-avatars.com/api/?name=${encodeURIComponent(item.other_user?.display_name || 'User')}&background=1E40AF&color=fff&size=100`
          }} 
          style={styles.chatAvatar}
          contentFit="cover"
        />
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{item.other_user?.display_name}</Text>
            <Text style={styles.chatTime}>{formatTime(item.last_message_at)}</Text>
          </View>
          
          <View style={styles.chatPreview}>
            <Text 
              style={[
                styles.lastMessage,
                unreadMessages > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {item.last_message || 'Conversa iniciada'}
            </Text>
            
            {unreadMessages > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && chats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversas</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando conversas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        {unreadCount > 0 && (
          <View style={styles.totalUnreadBadge}>
            <Text style={styles.totalUnreadText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat-bubble-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma Conversa</Text>
            <Text style={styles.emptyText}>
              Suas conversas privadas aparecerão aqui. Toque no botão "Conversar" no perfil de alguém para iniciar!
            </Text>
            
            <TouchableOpacity 
              style={styles.startChatButton}
              onPress={() => showAlert('Iniciar Chat', 'Navegue para o perfil de um usuário e toque em "Conversar"')}
            >
              <MaterialIcons name="add-comment" size={24} color={Colors.primary} />
              <Text style={styles.startChatText}>Como Iniciar uma Conversa</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => showAlert('Nova Conversa', 'Busca de usuários para chat em desenvolvimento')}
      >
        <MaterialIcons name="edit" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Alert Modal */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  totalUnreadBadge: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  totalUnreadText: {
    color: '#FFF',
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  listContent: {
    paddingBottom: 100,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  chatTime: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  chatPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  startChatText: {
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertModal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    marginBottom: 12,
    color: Colors.text,
  },
  alertMessage: {
    fontSize: Fonts.sizes.md,
    marginBottom: 24,
    color: Colors.text,
    lineHeight: 22,
  },
  alertButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: 'white',
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.md,
  },
});