import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { communitiesService, Community } from '../../services/communitiesService';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

export default function CommunitiesScreen() {
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const [myComms, allComms] = await Promise.all([
        communitiesService.getUserCommunities(),
        communitiesService.getAllCommunities(10, 0),
      ]);
      
      setMyCommunities(myComms);
      setAllCommunities(allComms);
    } catch (error) {
      console.error('Erro ao carregar comunidades:', error);
      showAlert('Erro', 'Erro ao carregar comunidades');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    setActionLoading(communityId);
    try {
      await communitiesService.joinCommunity(communityId);
      showAlert('Sucesso', 'Você entrou na comunidade!');
      loadCommunities(); // Recarregar dados
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao entrar na comunidade');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    setActionLoading(communityId);
    try {
      await communitiesService.leaveCommunity(communityId);
      showAlert('Sucesso', 'Você saiu da comunidade');
      loadCommunities(); // Recarregar dados
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao sair da comunidade');
    } finally {
      setActionLoading(null);
    }
  };

  const renderCommunityCard = (community: Community, showAction = true) => (
    <TouchableOpacity key={community.id} style={styles.communityCard}>
      <Image 
        source={{ 
          uri: community.image_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200&h=200&fit=crop'
        }} 
        style={styles.communityImage}
        contentFit="cover"
      />
      <View style={styles.communityInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.communityName}>{community.name}</Text>
          {community.is_verified && (
            <MaterialIcons name="verified" size={16} color={Colors.primary} />
          )}
          {community.is_private && (
            <MaterialIcons name="lock" size={16} color={Colors.textLight} />
          )}
        </View>
        {community.description && (
          <Text style={styles.communityDescription} numberOfLines={2}>
            {community.description}
          </Text>
        )}
        <View style={styles.membersRow}>
          <Ionicons name="people" size={16} color={Colors.textLight} />
          <Text style={styles.membersCount}>{community.members_count} membros</Text>
          {community.member_role && (
            <View style={styles.roleTag}>
              <Text style={styles.roleText}>
                {community.member_role === 'admin' ? 'Admin' : 
                 community.member_role === 'moderator' ? 'Mod' : 'Membro'}
              </Text>
            </View>
          )}
        </View>
      </View>
      {showAction && (
        <View style={styles.actionContainer}>
          {actionLoading === community.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <TouchableOpacity 
              style={[
                styles.actionButton,
                community.is_member ? styles.leaveButton : styles.joinButton
              ]}
              onPress={() => 
                community.is_member 
                  ? handleLeaveCommunity(community.id)
                  : handleJoinCommunity(community.id)
              }
            >
              <Text style={[
                styles.actionButtonText,
                community.is_member ? styles.leaveButtonText : styles.joinButtonText
              ]}>
                {community.is_member ? 'Sair' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comunidades</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando comunidades...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunidades</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => showAlert('Em Breve', 'Criação de comunidades em desenvolvimento!')}
        >
          <MaterialIcons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Minhas Comunidades */}
        {myCommunities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minhas Comunidades</Text>
            {myCommunities.map(community => renderCommunityCard(community, false))}
          </View>
        )}

        {/* Descobrir Comunidades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {myCommunities.length > 0 ? 'Descobrir Comunidades' : 'Comunidades Disponíveis'}
          </Text>
          {allCommunities
            .filter(comm => !myCommunities.some(my => my.id === comm.id))
            .map(community => renderCommunityCard(community, true))
          }
        </View>

        {/* Funcionalidades Futuras */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          
          <View style={styles.featureCard}>
            <MaterialIcons name="event" size={32} color={Colors.primary} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Eventos</Text>
              <Text style={styles.featureDescription}>
                Crie e participe de eventos da comunidade
              </Text>
            </View>
            <Text style={styles.comingSoon}>Em Breve</Text>
          </View>

          <View style={styles.featureCard}>
            <MaterialIcons name="live-tv" size={32} color={Colors.primary} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Transmissões ao Vivo</Text>
              <Text style={styles.featureDescription}>
                Assista cultos e eventos online
              </Text>
            </View>
            <Text style={styles.comingSoon}>Em Breve</Text>
          </View>

          <View style={styles.featureCard}>
            <MaterialIcons name="volunteer-activism" size={32} color={Colors.primary} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Doações</Text>
              <Text style={styles.featureDescription}>
                Apoie comunidades verificadas
              </Text>
            </View>
            <Text style={styles.comingSoon}>Em Breve</Text>
          </View>
        </View>

        {allCommunities.length === 0 && myCommunities.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="groups" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma Comunidade Encontrada</Text>
            <Text style={styles.emptyText}>
              Seja o primeiro a criar uma comunidade de fé!
            </Text>
          </View>
        )}
      </ScrollView>

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
  createButton: {
    padding: 8,
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  communityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  communityInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  communityName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  communityDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 8,
    lineHeight: 18,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginLeft: 4,
  },
  roleTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  roleText: {
    fontSize: Fonts.sizes.xs,
    color: '#FFF',
    fontWeight: Fonts.weights.semibold,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: Colors.primary,
  },
  leaveButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  actionButtonText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
  },
  joinButtonText: {
    color: '#FFF',
  },
  leaveButtonText: {
    color: Colors.error,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  featureInfo: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  featureDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: 4,
  },
  comingSoon: {
    fontSize: Fonts.sizes.xs,
    color: Colors.secondary,
    fontWeight: Fonts.weights.semibold,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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