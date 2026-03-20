import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '../../hooks/useNotifications';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

export default function NotificationsScreen() {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return 'person-add';
      case 'faith': return 'favorite';
      case 'comment': return 'comment';
      case 'mention': return 'alternate-email';
      case 'story_view': return 'visibility';
      case 'community_invite': return 'group-add';
      default: return 'notifications';
    }
  };

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navegar baseado no tipo de notificação
    switch (notification.type) {
      case 'follow':
        showAlert('Perfil', 'Navegação para perfil em desenvolvimento');
        break;
      case 'faith':
      case 'comment':
        showAlert('Post', 'Navegação para post em desenvolvimento');
        break;
      case 'story_view':
        showAlert('Story', 'Visualização de story em desenvolvimento');
        break;
      case 'community_invite':
        showAlert('Comunidade', 'Navegação para comunidade em desenvolvimento');
        break;
      default:
        showAlert('Notificação', notification.message);
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.notificationCard,
        !item.is_read && styles.unreadCard
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <Image 
          source={{ 
            uri: item.actor_profile?.profile_image || 
                 `https://ui-avatars.com/api/?name=${encodeURIComponent(item.actor_profile?.display_name || 'User')}&background=1E40AF&color=fff&size=100`
          }} 
          style={styles.notificationAvatar}
          contentFit="cover"
        />
        
        <View style={styles.notificationInfo}>
          <View style={styles.notificationHeader}>
            <MaterialIcons 
              name={getNotificationIcon(item.type)} 
              size={16} 
              color={Colors.primary} 
            />
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>{formatTime(item.created_at)}</Text>
          </View>
          
          <Text style={styles.notificationMessage}>{item.message}</Text>
          
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <MaterialIcons name="close" size={16} color={Colors.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificações</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando notificações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <MaterialIcons name="circle" size={8} color={Colors.primary} />
          <Text style={styles.unreadText}>
            {unreadCount} notificação{unreadCount > 1 ? 'ões' : ''} não lida{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma Notificação</Text>
            <Text style={styles.emptyText}>
              Você receberá notificações sobre curtidas, comentários, novos seguidores e muito mais!
            </Text>
          </View>
        }
      />

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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  markAllText: {
    fontSize: Fonts.sizes.sm,
    color: '#FFF',
    fontWeight: Fonts.weights.medium,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primaryLight + '20',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unreadText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
    marginLeft: 8,
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
    paddingBottom: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unreadCard: {
    backgroundColor: Colors.primaryLight + '10',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginLeft: 6,
    flex: 1,
  },
  notificationTime: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  notificationMessage: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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