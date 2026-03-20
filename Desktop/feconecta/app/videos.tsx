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
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { postsService } from '../services/postsService';

const { width, height } = Dimensions.get('window');

interface VideoPost {
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  faith_count: number;
  comments_count: number;
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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      // Simulando dados de vídeo - você pode integrar com seu serviço real
      const mockVideos: VideoPost[] = [
        {
          id: '1',
          user_id: 'user1',
          content: 'Testemunho incrível sobre fé e perseverança! 🙏 #fe #testemunho',
          media_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          faith_count: 142,
          comments_count: 23,
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
          media_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          faith_count: 89,
          comments_count: 15,
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
          media_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
          faith_count: 267,
          comments_count: 45,
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

  const getProfileImageUrl = (profile?: VideoPost['profile']) => {
    if (profile?.profile_image) {
      return profile.profile_image;
    }
    const name = profile?.display_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff&size=150`;
  };

  const renderVideoItem = ({ item, index }: { item: VideoPost; index: number }) => (
    <View style={styles.videoContainer}>
      {/* Video Player Area */}
      <View style={styles.videoPlayer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=600&fit=crop' }}
          style={styles.videoThumbnail}
          contentFit="cover"
        />
        
        {/* Play Button */}
        <TouchableOpacity style={styles.playButton}>
          <MaterialIcons name="play-arrow" size={60} color="#FFF" />
        </TouchableOpacity>

        {/* Video Info Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.videoOverlay}
        >
          {/* Profile Info */}
          <View style={styles.profileSection}>
            <Image
              source={{ uri: getProfileImageUrl(item.profile) }}
              style={styles.profileAvatar}
              contentFit="cover"
            />
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{item.profile?.display_name}</Text>
                {item.profile?.is_verified && (
                  <MaterialIcons name="verified" size={16} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.profileUsername}>@{item.profile?.username}</Text>
            </View>
            <Text style={styles.videoTime}>{formatTime(item.created_at)}</Text>
          </View>

          {/* Video Content */}
          <Text style={styles.videoContent}>{item.content}</Text>
        </LinearGradient>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="favorite-border" size={28} color="#FFF" />
          <Text style={styles.actionCount}>{item.faith_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="chat-bubble-outline" size={28} color="#FFF" />
          <Text style={styles.actionCount}>{item.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={28} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="bookmark-border" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vídeos</Text>
          <View style={{ width: 24 }} />
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
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vídeos</Text>
        <TouchableOpacity>
          <MaterialIcons name="videocam" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToInterval={height - 140} // Adjust for header height
        snapToAlignment="start"
        decelerationRate="fast"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / (height - 140));
          setCurrentVideoIndex(index);
        }}
      />

      {/* Video Progress Indicator */}
      <View style={styles.progressIndicator}>
        {videos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentVideoIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  videoContainer: {
    width,
    height: height - 140, // Account for header and tab bar
    position: 'relative',
  },
  videoPlayer: {
    flex: 1,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80, // Space for action buttons
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: '#FFF',
  },
  profileUsername: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  videoTime: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  videoContent: {
    fontSize: Fonts.sizes.md,
    color: '#FFF',
    lineHeight: 22,
  },
  actionButtons: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 8,
  },
  actionCount: {
    color: '#FFF',
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
    marginTop: 4,
  },
  progressIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -50 }],
    alignItems: 'center',
  },
  progressDot: {
    width: 4,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 2,
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: '#FFF',
  },
});