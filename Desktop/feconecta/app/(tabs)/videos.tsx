import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

const { width, height } = Dimensions.get('window');
const VIDEO_HEIGHT = 200; // Altura padrão para vídeos

interface VideoPost {
  id: string;
  user_id: string;
  content: string;
  thumbnail_url: string;
  video_url: string;
  faith_count: number;
  comments_count: number;
  views_count: number;
  duration: string;
  created_at: string;
  profile?: {
    display_name: string;
    username: string;
    profile_image?: string;
    is_verified: boolean;
  };
}

export default function VideosScreen() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      // TODO: Carregar vídeos reais do Supabase
      const mockVideos: VideoPost[] = [
        {
          id: '1',
          user_id: 'user1',
          content: 'Testemunho incrível sobre fé e perseverança! 🙏 #fe #testemunho',
          thumbnail_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop',
          video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
          faith_count: 142,
          comments_count: 23,
          views_count: 1532,
          duration: '2:35',
          created_at: new Date().toISOString(),
          profile: {
            display_name: 'Maria Santos',
            username: 'mariasantos',
            is_verified: true,
          }
        },
        {
          id: '2',
          user_id: 'user2',
          content: 'Louvando ao Senhor nesta manhã abençoada! ✨ #louvor #manha',
          thumbnail_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=200&fit=crop',
          video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4',
          faith_count: 89,
          comments_count: 15,
          views_count: 892,
          duration: '1:45',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          profile: {
            display_name: 'João Silva',
            username: 'joaosilva',
            is_verified: false,
          }
        },
        {
          id: '3',
          user_id: 'user3',
          content: 'Palavra do dia: Salmo 23 💙 Reflexão sobre o cuidado do Senhor',
          thumbnail_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=200&fit=crop',
          video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_5mb.mp4',
          faith_count: 267,
          comments_count: 45,
          views_count: 2145,
          duration: '5:12',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          profile: {
            display_name: 'Pastor Carlos',
            username: 'pastorcarlos',
            is_verified: true,
          }
        },
      ];
      
      setVideos(mockVideos);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      showAlert('Erro', 'Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const formatViews = (views: number) => {
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
    return `${(views / 1000000).toFixed(1)}M`;
  };

  const getProfileImageUrl = (profile?: VideoPost['profile']) => {
    if (profile?.profile_image) {
      return profile.profile_image;
    }
    const name = profile?.display_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff&size=150`;
  };

  const renderVideoItem = ({ item }: { item: VideoPost }) => (
    <View style={styles.videoContainer}>
      {/* Thumbnail do Vídeo */}
      <TouchableOpacity 
        style={styles.videoPlayer}
        onPress={() => showAlert('Player', 'Reproduzindo vídeo...')}
      >
        <Image
          source={{ uri: item.thumbnail_url }}
          style={styles.videoThumbnail}
          contentFit="cover"
        />
        
        {/* Play Button */}
        <View style={styles.playButton}>
          <MaterialIcons name="play-arrow" size={40} color="#FFF" />
        </View>

        {/* Duração */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>

        {/* Views */}
        <View style={styles.viewsBadge}>
          <MaterialIcons name="visibility" size={14} color="#FFF" />
          <Text style={styles.viewsText}>{formatViews(item.views_count)}</Text>
        </View>
      </TouchableOpacity>

      {/* Informações do Vídeo */}
      <View style={styles.videoInfo}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: getProfileImageUrl(item.profile) }}
            style={styles.profileAvatar}
            contentFit="cover"
          />
          <View style={styles.profileDetails}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{item.profile?.display_name}</Text>
              {item.profile?.is_verified && (
                <MaterialIcons name="verified" size={14} color={Colors.primary} />
              )}
            </View>
            <Text style={styles.profileUsername}>@{item.profile?.username}</Text>
            <Text style={styles.videoTime}>{formatTime(item.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.videoContent} numberOfLines={2}>
          {item.content}
        </Text>

        {/* Actions */}
        <View style={styles.videoActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showAlert('Fé', 'Curtiu com fé!')}
          >
            <MaterialIcons name="favorite-border" size={20} color={Colors.textLight} />
            <Text style={styles.actionCount}>{item.faith_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showAlert('Comentários', 'Abrindo comentários...')}
          >
            <MaterialIcons name="chat-bubble-outline" size={20} color={Colors.textLight} />
            <Text style={styles.actionCount}>{item.comments_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showAlert('Compartilhar', 'Vídeo compartilhado!')}
          >
            <MaterialIcons name="share" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showAlert('Salvar', 'Vídeo salvo!')}
          >
            <MaterialIcons name="bookmark-border" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vídeos</Text>
          <TouchableOpacity 
            onPress={() => showAlert('Criar Vídeo', 'Gravação de vídeo em desenvolvimento')}
          >
            <MaterialIcons name="videocam" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando vídeos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vídeos</Text>
        <TouchableOpacity 
          onPress={() => showAlert('Criar Vídeo', 'Gravação de vídeo em desenvolvimento')}
        >
          <MaterialIcons name="videocam" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
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
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
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
  videoContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoPlayer: {
    position: 'relative',
    height: VIDEO_HEIGHT,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
  },
  viewsBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  viewsText: {
    color: '#FFF',
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
  },
  videoInfo: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileDetails: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  profileName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  profileUsername: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 2,
  },
  videoTime: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  videoContent: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: Fonts.weights.medium,
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