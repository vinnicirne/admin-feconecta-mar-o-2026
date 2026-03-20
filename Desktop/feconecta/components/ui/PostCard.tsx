import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Platform, 
  Modal, 
  TextInput, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Post } from '../../services/postsService';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useFollow } from '../../hooks/useFollow';

interface PostCardProps {
  post: Post;
  onFaithPress: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
}

const { width } = Dimensions.get('window');
const MEDIA_WIDTH = width - 32;
const MEDIA_HEIGHT = MEDIA_WIDTH; // 1:1 ratio

export default function PostCard({ post, onFaithPress, onCommentPress, onSharePress }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const { followUser, unfollowUser, loading: followLoading } = useFollow();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'hoje';
    if (diffInDays === 1) return 'há 1 d';
    if (diffInDays < 7) return `há ${diffInDays} d`;
    return `há ${Math.floor(diffInDays / 7)} sem`;
  };

  const getProfileImageUrl = () => {
    if (post.profile?.profile_image) {
      return post.profile.profile_image;
    }
    const name = post.profile?.display_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff&size=150`;
  };

  const handleFollow = async () => {
    if (!post.profile?.id) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(post.profile.id);
        setIsFollowing(false);
      } else {
        await followUser(post.profile.id);
        setIsFollowing(true);
      }
    } catch (error: any) {
      console.error('Erro ao seguir/desseguir:', error.message);
    }
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleRepost = () => {
    setShowShareModal(false);
    console.log('Repost funcionalidade em desenvolvimento');
  };

  const renderMedia = () => {
    if (!post.media_url) return null;

    if (post.type === 'image') {
      return (
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: post.media_url }} 
            style={styles.media}
            contentFit="cover"
          />
        </View>
      );
    }

    if (post.type === 'video') {
      return (
        <View style={styles.videoContainer}>
          <Image 
            source={{ uri: post.media_url }}
            style={styles.videoThumbnail}
            contentFit="cover"
          />
          <View style={styles.videoOverlay}>
            <MaterialIcons name="play-circle-filled" size={60} color="rgba(255,255,255,0.9)" />
          </View>
          <View style={styles.videoIndicator}>
            <MaterialIcons name="videocam" size={16} color="#FFF" />
            <Text style={styles.videoText}>Vídeo</Text>
          </View>
        </View>
      );
    }

    if (post.type === 'audio') {
      return (
        <View style={styles.audioContainer}>
          <View style={styles.audioWaveform}>
            <MaterialIcons name="audiotrack" size={32} color={Colors.primary} />
            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>Mensagem de Áudio</Text>
              <Text style={styles.audioDuration}>0:00</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <MaterialIcons name="play-arrow" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header do Post */}
      <View style={styles.header}>
        <Image 
          source={{ uri: getProfileImageUrl() }} 
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{post.profile?.display_name || 'Usuário'}</Text>
            {post.profile?.is_verified && (
              <MaterialIcons name="verified" size={16} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.timeText}>{formatTime(post.created_at)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.followButton}
          onPress={handleFollow}
          disabled={followLoading}
        >
          {followLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.followButtonText}>
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Conteúdo do Post */}
      <View style={styles.contentContainer}>
        {post.content && (
          <Text style={styles.content}>{post.content}</Text>
        )}

        {/* Versículo Bíblico */}
        {post.bible_verse && (
          <View style={styles.bibleVerse}>
            <View style={styles.bibleHeader}>
              <MaterialIcons name="menu-book" size={20} color={Colors.primary} />
              <Text style={styles.bibleReference}>
                {post.bible_verse.book} {post.bible_verse.chapter}:{post.bible_verse.verse}
              </Text>
            </View>
            <Text style={styles.bibleText}>"{post.bible_verse.text}"</Text>
            <Text style={styles.bibleVersion}>- {post.bible_verse.version}</Text>
          </View>
        )}

        {/* Mídia */}
        {renderMedia()}
      </View>

      {/* Ações do Post */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onFaithPress}>
          <MaterialIcons 
            name={post.has_faithed ? "favorite" : "favorite-border"}
            size={20} 
            color={post.has_faithed ? Colors.faith : Colors.textLight} 
          />
          <Text style={[
            styles.actionText,
            post.has_faithed && { color: Colors.faith }
          ]}>
            Fé {post.faith_count}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <MaterialIcons name="chat-bubble-outline" size={20} color={Colors.textLight} />
          <Text style={styles.actionText}>Comentar {post.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <MaterialIcons name="share" size={20} color={Colors.textLight} />
          <Text style={styles.actionText}>Compartilhar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleRepost}>
          <MaterialIcons name="repeat" size={20} color={Colors.textLight} />
          <Text style={styles.actionText}>Repostar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Comentários */}
      <Modal
        visible={showComments}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.commentsModal}>
          <View style={styles.commentsHeader}>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <MaterialIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.commentsTitle}>Comentários</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.commentsContent}>
            <View style={styles.noComments}>
              <MaterialIcons name="chat-bubble-outline" size={48} color={Colors.textLight} />
              <Text style={styles.noCommentsText}>Nenhum comentário ainda</Text>
              <Text style={styles.noCommentsSubtext}>Seja o primeiro a comentar!</Text>
            </View>
          </View>

          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Adicione um comentário..."
              placeholderTextColor={Colors.textLight}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              disabled={!newComment.trim()}
            >
              <MaterialIcons name="send" size={20} color={newComment.trim() ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Compartilhar */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="formSheet"
        transparent
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModal}>
            <View style={styles.shareHeader}>
              <Text style={styles.shareTitle}>Compartilhar Post</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption}>
                <MaterialIcons name="share" size={32} color={Colors.primary} />
                <Text style={styles.shareOptionText}>Compartilhar Externamente</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareOption} onPress={handleRepost}>
                <MaterialIcons name="repeat" size={32} color={Colors.primary} />
                <Text style={styles.shareOptionText}>Repostar no Feed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: width - 32, // Prevent overflow
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    minWidth: 70,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: Fonts.weights.semibold,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 12,
  },
  bibleVerse: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 12,
  },
  bibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bibleReference: {
    fontSize: 14,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
    marginLeft: 6,
  },
  bibleText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  bibleVersion: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'right',
  },
  
  // Media Styles - Fixed sizing
  mediaContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    width: MEDIA_WIDTH,
    height: MEDIA_HEIGHT,
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  videoContainer: {
    position: 'relative',
    width: MEDIA_WIDTH,
    height: MEDIA_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  videoText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: Fonts.weights.semibold,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
  },
  audioDuration: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Actions - Fixed layout
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: Fonts.weights.medium,
  },
  
  // Modal styles
  commentsModal: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  commentsContent: {
    flex: 1,
  },
  noComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  noCommentsText: {
    fontSize: 18,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textLight,
    marginTop: 16,
  },
  noCommentsSubtext: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  
  // Share modal
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.select({ ios: 34, default: 20 }),
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  shareOptions: {
    padding: 20,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  shareOptionText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
  },
});