import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout, login, register, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState<'profile' | 'banner' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    confirmPassword: '',
  });
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    setAlertConfig({ visible: true, title, message, onOk });
  };

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      showAlert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      await login(formData.email.trim(), formData.password);
      setShowLogin(false);
      setFormData({ email: '', password: '', username: '', displayName: '', confirmPassword: '' });
      showAlert('Sucesso', 'Login realizado com sucesso!');
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao fazer login');
    }
  };

  const handleRegister = async () => {
    if (!formData.email.trim() || !formData.password.trim() || 
        !formData.username.trim() || !formData.displayName.trim()) {
      showAlert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      await register(formData.email.trim(), formData.password, 
                    formData.username.trim(), formData.displayName.trim());
      setShowLogin(false);
      setFormData({ email: '', password: '', username: '', displayName: '', confirmPassword: '' });
      showAlert('Sucesso', 'Conta criada com sucesso! Bem-vindo ao FeConecta!');
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao criar conta');
    }
  };

  const handleImagePicker = (type: 'profile' | 'banner') => {
    setShowImagePicker(type);
    showAlert('Em Breve', 'Funcionalidade de edição de imagem com crop em desenvolvimento!');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header com gradiente */}
        <LinearGradient
          colors={['#8B5CF6', '#A855F7']}
          style={styles.loginHeader}
        >
          <View style={styles.logoContainer}>
            <MaterialIcons name="add" size={32} color="#FFF" style={styles.crossIcon} />
          </View>
          <Text style={styles.loginHeaderTitle}>FeConecta</Text>
          <Text style={styles.loginHeaderSubtitle}>Conectando corações em fé</Text>
        </LinearGradient>

        {/* Login Content */}
        <ScrollView contentContainerStyle={styles.loginContent}>
          <View style={styles.loginCard}>
            <MaterialIcons name="favorite" size={64} color={Colors.primary} />
            <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
            <Text style={styles.welcomeText}>
              Conecte-se com uma comunidade de fé e cresça espiritualmente
            </Text>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => {
                console.log('Botão pressionado - abrindo modal');
                setShowLogin(true);
              }}
            >
              <Text style={styles.loginButtonText}>Entrar / Cadastrar</Text>
            </TouchableOpacity>

            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>O que você pode fazer:</Text>
              
              <View style={styles.featureItem}>
                <MaterialIcons name="people" size={24} color={Colors.primary} />
                <Text style={styles.featureText}>Conectar com pessoas de fé</Text>
              </View>
              
              <View style={styles.featureItem}>
                <MaterialIcons name="menu-book" size={24} color={Colors.primary} />
                <Text style={styles.featureText}>Estudar a Bíblia e fazer anotações</Text>
              </View>
              
              <View style={styles.featureItem}>
                <MaterialIcons name="group" size={24} color={Colors.primary} />
                <Text style={styles.featureText}>Participar de comunidades</Text>
              </View>

              <View style={styles.featureItem}>
                <MaterialIcons name="chat" size={24} color={Colors.primary} />
                <Text style={styles.featureText}>Conversar e compartilhar fé</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modal de Login/Cadastro */}
        <Modal 
          visible={showLogin} 
          animationType="slide" 
          presentationStyle="pageSheet"
          onRequestClose={() => setShowLogin(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowLogin(false)}>
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {isRegisterMode ? 'Criar Conta' : 'Entrar'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={Colors.textLight}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {isRegisterMode && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome de usuário"
                    placeholderTextColor={Colors.textLight}
                    value={formData.username}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor={Colors.textLight}
                    value={formData.displayName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                  />
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={Colors.textLight}
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                secureTextEntry
              />

              {isRegisterMode && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar senha"
                  placeholderTextColor={Colors.textLight}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry
                />
              )}

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={isRegisterMode ? handleRegister : handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isRegisterMode ? 'Criar Conta' : 'Entrar'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.switchModeButton}
                onPress={() => setIsRegisterMode(!isRegisterMode)}
              >
                <Text style={styles.switchModeText}>
                  {isRegisterMode 
                    ? 'Já tem conta? Faça login'
                    : 'Não tem conta? Cadastre-se'
                  }
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Alert Modal */}
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.alertModal}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={styles.alertButton}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const profile = user.profile;
  const displayName = profile?.display_name || 'Usuário';
  const username = profile?.username || 'usuario';
  const bio = profile?.bio || 'Seguidor de Cristo 🙏';

  const getProfileImageUrl = () => {
    if (profile?.profile_image) {
      return profile.profile_image;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8B5CF6&color=fff&size=200`;
  };

  const getCoverImageUrl = () => {
    if (profile?.cover_image) {
      return profile.cover_image;
    }
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=150&fit=crop';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover e Avatar */}
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: getCoverImageUrl() }} 
            style={styles.coverImage}
            contentFit="cover"
          />
          
          {/* Botão de editar capa */}
          <TouchableOpacity 
            style={styles.editCoverButton}
            onPress={() => handleImagePicker('banner')}
          >
            <MaterialIcons name="camera-alt" size={20} color="#FFF" />
          </TouchableOpacity>
          
          {/* Avatar Container */}
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: getProfileImageUrl() }} 
              style={styles.avatar}
              contentFit="cover"
            />
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => handleImagePicker('profile')}
            >
              <MaterialIcons name="camera-alt" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações do Perfil */}
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{displayName}</Text>
            {profile?.is_verified && (
              <MaterialIcons name="verified" size={20} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.username}>@{username}</Text>
          
          <Text style={styles.bio}>{bio}</Text>

          {/* Links Sociais */}
          <View style={styles.socialLinks}>
            <View style={styles.socialLinkItem}>
              <MaterialIcons name="person" size={16} color={Colors.textLight} />
              <Text style={styles.socialLinkText}>Izabelle Cirne</Text>
            </View>
            <View style={styles.socialLinkItem}>
              <MaterialIcons name="group" size={16} color={Colors.textLight} />
              <Text style={styles.socialLinkText}>Emily Angell | Rebeca Cirne</Text>
            </View>
            <View style={styles.socialLinkItem}>
              <MaterialIcons name="tag-faces" size={16} color={Colors.textLight} />
              <Text style={styles.socialLinkText}>IRRITANTEMENTE FELIZ!</Text>
            </View>
            <View style={styles.socialLinkItem}>
              <MaterialIcons name="menu-book" size={16} color={Colors.textLight} />
              <Text style={styles.socialLinkText}>Lucas 1:37 - Porque para Deus nada é impossível.</Text>
            </View>
          </View>

          {/* Hashtags */}
          <View style={styles.hashtagsRow}>
            <Text style={styles.hashtag}>#jesus</Text>
            <Text style={styles.hashtag}>#god</Text>
            <Text style={styles.hashtag}>#biblia</Text>
          </View>

          {/* Links Sociais */}
          <View style={styles.externalLinks}>
            <TouchableOpacity style={styles.externalLink}>
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.externalLink}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </TouchableOpacity>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{profile?.posts_count || 16}</Text>
              <Text style={styles.statLabel}>Publicações</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{profile?.followers_count || 1}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{profile?.following_count || 0}</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={20} color={Colors.primary} />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <MaterialIcons name="share" size={20} color={Colors.textLight} />
              <Text style={styles.shareButtonText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>

          {/* Seção Minhas Anotações */}
          <TouchableOpacity style={styles.notesSection}>
            <MaterialIcons name="note" size={24} color={Colors.primary} />
            <Text style={styles.notesSectionText}>Minhas Anotações</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs de Conteúdo */}
        <View style={styles.contentTabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <MaterialIcons name="grid-on" size={24} color={Colors.primary} />
            <Text style={styles.activeTabText}>Publicações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <MaterialIcons name="link" size={24} color={Colors.textLight} />
            <Text style={styles.tabText}>Links</Text>
          </TouchableOpacity>
        </View>

        {/* Ações do Perfil */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="bookmark" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Posts Salvos</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="menu-book" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Minhas Notas</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/admin')}
          >
            <MaterialIcons name="admin-panel-settings" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Painel Admin</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="settings" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Configurações</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={logout}>
            <MaterialIcons name="logout" size={24} color={Colors.error} />
            <Text style={[styles.actionText, styles.logoutText]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alert Modal */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => {
                alertConfig.onOk?.();
                setAlertConfig(prev => ({ ...prev, visible: false }));
              }}
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
  content: {
    paddingBottom: 32,
  },
  
  // Login Styles
  loginHeader: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  crossIcon: {
    transform: [{ rotate: '45deg' }],
  },
  loginHeaderTitle: {
    fontSize: 32,
    fontWeight: Fonts.weights.bold,
    color: '#FFF',
    marginBottom: 8,
  },
  loginHeaderSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loginContent: {
    padding: 20,
  },
  loginCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
  },
  featuresSection: {
    width: '100%',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  
  // Profile Styles
  coverContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  editCoverButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 4,
  },
  profileInfo: {
    padding: 20,
    paddingTop: 50,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  username: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
    marginBottom: 16,
  },
  bio: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  socialLinks: {
    marginBottom: 16,
  },
  socialLinkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  socialLinkText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  hashtag: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
  },
  externalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  externalLink: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
    color: '#FFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: Fonts.weights.medium,
    color: Colors.textLight,
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  notesSectionText: {
    fontSize: 16,
    fontWeight: Fonts.weights.medium,
    color: Colors.text,
  },
  contentTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  activeTabText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: Fonts.weights.semibold,
  },
  actionsSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: Colors.error,
  },
  
  // Modal Styles
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
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchModeText: {
    fontSize: 16,
    color: Colors.primary,
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
    fontSize: 18,
    fontWeight: Fonts.weights.bold,
    marginBottom: 12,
    color: Colors.text,
  },
  alertMessage: {
    fontSize: 16,
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
    fontSize: 16,
  },
});