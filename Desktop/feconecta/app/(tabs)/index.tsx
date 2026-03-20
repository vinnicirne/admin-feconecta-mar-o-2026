import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  RefreshControl,
  Platform,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import PostCard from '../../components/ui/PostCard';
import DailyMessageCard from '../../components/ui/DailyMessageCard';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const { posts, dailyMessage, loading, toggleFaith, refreshFeed, loadMorePosts, hasMorePosts } = usePosts();
  const { user } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [showDevocional, setShowDevocional] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBible, setShowBible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  };

  const handleDailyMessagePress = () => {
    console.log('Mensagem do dia clicada');
  };

  const renderHeader = () => (
    <View>
      {/* Header com 4 opções */}
      <View style={styles.headerContainer}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            {/* Logo */}
            <TouchableOpacity style={styles.logoSection}>
              <MaterialIcons name="add" size={20} color={Colors.primary} style={styles.crossIcon} />
              <Text style={styles.headerTitle}>FeConecta</Text>
            </TouchableOpacity>

            {/* Botões do topo */}
            <View style={styles.headerButtons}>
              {/* Devocional */}
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowDevocional(true)}
              >
                <MaterialIcons name="auto-awesome" size={18} color={Colors.secondary} />
                <Text style={styles.headerButtonText}>Devocional</Text>
              </TouchableOpacity>

              {/* Bíblia */}
              <TouchableOpacity 
                style={[styles.headerButton, styles.bibleButton]}
                onPress={() => setShowBible(true)}
              >
                <MaterialIcons name="menu-book" size={18} color={Colors.primary} />
                <Text style={[styles.headerButtonText, styles.bibleButtonText]}>Bíblia</Text>
              </TouchableOpacity>

              {/* Notificações */}
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => setShowNotifications(true)}
              >
                <MaterialIcons name="notifications" size={22} color={Colors.text} />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Mensagem do Dia */}
      {dailyMessage && (
        <DailyMessageCard message={dailyMessage} onPress={handleDailyMessagePress} />
      )}
    </View>
  );

  const renderPost = ({ item }: { item: any }) => (
    <PostCard 
      post={item}
      onFaithPress={() => toggleFaith(item.id)}
      onCommentPress={() => {}}
      onSharePress={() => {}}
    />
  );

  if (!user) {
    return (
      <View style={styles.loginPrompt}>
        <View style={styles.loginContent}>
          <MaterialIcons name="favorite" size={64} color={Colors.primary} />
          <Text style={styles.loginTitle}>Bem-vindo ao FeConecta</Text>
          <Text style={styles.loginText}>Faça login para conectar sua fé com a comunidade</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
      />

      {/* Modal Devocional */}
      <Modal
        visible={showDevocional}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDevocional(false)}>
              <MaterialIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Devocional</Text>
            <TouchableOpacity onPress={() => {
              setShowDevocional(false);
              router.push('/(tabs)/notes');
            }}>
              <MaterialIcons name="note-add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.devocionalContent}>
            <Text style={styles.devocionalTitle}>Devocional de Hoje</Text>
            <Text style={styles.devocionalSubtitle}>Uma palavra para seu coração</Text>
            
            <View style={styles.devocionalCard}>
              <Text style={styles.devocionalVerse}>
                "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça."
              </Text>
              <Text style={styles.devocionalReference}>Isaías 41:10</Text>
            </View>

            <Text style={styles.devocionalMessage}>
              Deus tem planos maravilhosos para sua vida! Mesmo quando as circunstâncias parecem 
              difíceis, confie que Ele está trabalhando em seu favor.
            </Text>

            <TouchableOpacity 
              style={styles.createNoteButton}
              onPress={() => {
                setShowDevocional(false);
                router.push('/(tabs)/notes');
              }}
            >
              <MaterialIcons name="note-add" size={20} color="#FFF" />
              <Text style={styles.createNoteButtonText}>Criar Nota do Devocional</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal Bíblia */}
      <Modal
        visible={showBible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBible(false)}>
              <MaterialIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bíblia Sagrada</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.bibleContent}>
            <Text style={styles.comingSoonTitle}>Bíblia Digital</Text>
            <Text style={styles.comingSoonText}>
              Leitura completa da Bíblia em desenvolvimento. Em breve você poderá:
            </Text>
            
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>📖 Ler todos os livros da Bíblia</Text>
              <Text style={styles.featureItem}>🔍 Buscar versículos</Text>
              <Text style={styles.featureItem}>⭐ Marcar versículos favoritos</Text>
              <Text style={styles.featureItem}>📝 Fazer anotações pessoais</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal Notificações */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <MaterialIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notificações</Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <MaterialIcons name="done-all" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.notificationItem}>
                <MaterialIcons 
                  name={item.type === 'follow' ? 'person-add' : 'favorite'} 
                  size={24} 
                  color={Colors.primary} 
                />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyNotifications}>
                <MaterialIcons name="notifications-none" size={64} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>Nenhuma Notificação</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossIcon: {
    transform: [{ rotate: '45deg' }],
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  bibleButton: {
    backgroundColor: Colors.primary + '15',
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: Fonts.weights.semibold,
    color: Colors.secondary,
  },
  bibleButtonText: {
    color: Colors.primary,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: Fonts.weights.bold,
  },
  listContent: {
    paddingBottom: 100,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginContent: {
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  loginText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  devocionalContent: {
    flex: 1,
    padding: 20,
  },
  devocionalTitle: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  devocionalSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
  },
  devocionalCard: {
    backgroundColor: Colors.primary + '10',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 24,
  },
  devocionalVerse: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.text,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  devocionalReference: {
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
    textAlign: 'right',
  },
  devocionalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: 32,
  },
  createNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createNoteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
  },
  bibleContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textLight,
    marginTop: 16,
  },
});