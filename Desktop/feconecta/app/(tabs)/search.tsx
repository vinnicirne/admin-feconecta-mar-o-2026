import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSearch } from '../../hooks/useSearch';
import { useFollow } from '../../hooks/useFollow';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

export default function SearchScreen() {
  const { users, communities, loading, searchAll, getSuggestedUsers, clearResults } = useSearch();
  const { followUser, unfollowUser, loading: followLoading } = useFollow();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'communities'>('all');
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message });
    } else {
      // No mobile, usar alert nativo seria melhor
      setAlertConfig({ visible: true, title, message });
    }
  };

  useEffect(() => {
    // Carregar usuários sugeridos inicialmente
    getSuggestedUsers();
  }, []);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAll(searchQuery);
      } else {
        getSuggestedUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    // Inicializar estados de seguir
    const states: Record<string, boolean> = {};
    users.forEach(user => {
      states[user.id] = user.is_following || false;
    });
    setFollowingStates(states);
  }, [users]);

  const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: false }));
        showAlert('Sucesso', 'Você deixou de seguir este usuário');
      } else {
        await followUser(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: true }));
        showAlert('Sucesso', 'Você agora está seguindo este usuário');
      }
    } catch (error: any) {
      showAlert('Erro', error.message);
    }
  };

  const handleCommunityAction = (communityId: string, isJoined: boolean) => {
    if (isJoined) {
      showAlert('Comunidade', 'Você já é membro desta comunidade!');
    } else {
      showAlert('Comunidade', 'Funcionalidade de entrar em comunidades em desenvolvimento!');
    }
  };

  const renderUser = ({ item }: { item: any }) => {
    const isFollowing = followingStates[item.id] || false;
    
    return (
      <TouchableOpacity style={styles.userCard}>
        <Image 
          source={{ 
            uri: item.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.display_name)}&background=1E40AF&color=fff&size=150`
          }} 
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.display_name}</Text>
            {item.is_verified && (
              <MaterialIcons name="verified" size={16} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.username}>@{item.username}</Text>
          {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
          <Text style={styles.stats}>
            {item.followers_count} seguidores • {item.posts_count} publicações
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={() => handleFollowToggle(item.id, isFollowing)}
          disabled={followLoading}
        >
          {followLoading ? (
            <ActivityIndicator size="small" color={isFollowing ? Colors.primary : '#FFF'} />
          ) : (
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderCommunity = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.communityCard}>
      <Image 
        source={{ 
          uri: item.image_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200&h=200&fit=crop'
        }} 
        style={styles.communityImage}
        contentFit="cover"
      />
      <View style={styles.communityInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.communityName}>{item.name}</Text>
          {item.is_verified && (
            <MaterialIcons name="verified" size={16} color={Colors.primary} />
          )}
        </View>
        {item.description && (
          <Text style={styles.communityDescription}>{item.description}</Text>
        )}
        <Text style={styles.communityStats}>
          {item.members_count} membros
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.joinButton, item.is_member && styles.joinedButton]}
        onPress={() => handleCommunityAction(item.id, item.is_member)}
      >
        <Text style={[styles.joinButtonText, item.is_member && styles.joinedButtonText]}>
          {item.is_member ? 'Membro' : 'Entrar'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const getFilteredData = () => {
    switch (activeTab) {
      case 'users':
        return users;
      case 'communities':
        return communities;
      default:
        return [...users, ...communities];
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.username) {
      return renderUser({ item });
    } else {
      return renderCommunity({ item });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscar</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pessoas e comunidades..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Pessoas ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'communities' && styles.activeTab]}
          onPress={() => setActiveTab('communities')}
        >
          <Text style={[styles.tabText, activeTab === 'communities' && styles.activeTabText]}>
            Comunidades ({communities.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredData()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search" size={64} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Nenhum resultado encontrado' : 'Pessoas Sugeridas'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'Tente buscar por outros termos'
                  : 'Conecte-se com pessoas de fé'
                }
              </Text>
            </View>
          }
        />
      )}

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: Fonts.weights.medium,
  },
  activeTabText: {
    color: '#FFF',
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
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  username: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  bio: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginTop: 4,
    lineHeight: 18,
  },
  stats: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 6,
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
  },
  followingButtonText: {
    color: Colors.primary,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  communityDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginTop: 4,
    lineHeight: 18,
  },
  communityStats: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 6,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
  },
  joinedButtonText: {
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
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