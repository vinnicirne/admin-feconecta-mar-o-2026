import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalCommunities: number;
  activeUsers: number;
  reportsCount: number;
}

interface ReportedContent {
  id: string;
  type: 'post' | 'user' | 'comment';
  content: string;
  reporter: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalCommunities: 0,
    activeUsers: 0,
    reportsCount: 0,
  });
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'users' | 'posts' | 'communities' | 'reports'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace('/(tabs)/profile');
      return;
    }
    
    // Verificar se é admin (por enquanto, qualquer usuário logado é admin para demo)
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Simular dados de admin
      setStats({
        totalUsers: 1247,
        totalPosts: 3891,
        totalCommunities: 89,
        activeUsers: 342,
        reportsCount: 12,
      });

      setReports([
        {
          id: '1',
          type: 'post',
          content: 'Conteúdo inapropriado reportado...',
          reporter: 'João Silva',
          reason: 'Conteúdo ofensivo',
          status: 'pending',
          createdAt: '2025-01-10T10:30:00Z',
        },
        {
          id: '2',
          type: 'user',
          content: 'Usuário com comportamento suspeito',
          reporter: 'Maria Santos',
          reason: 'Spam',
          status: 'pending',
          createdAt: '2025-01-10T09:15:00Z',
        },
      ]);
    } catch (error) {
      showAlert('Erro', 'Erro ao carregar dados administrativos');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = (reportId: string, action: 'approve' | 'reject') => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'approve' ? 'resolved' : 'reviewed' }
          : report
      )
    );
    showAlert('Sucesso', `Denúncia ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`);
  };

  const renderDashboard = () => (
    <View style={styles.dashboardContainer}>
      <Text style={styles.sectionTitle}>Visão Geral da Plataforma</Text>
      
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
          <MaterialIcons name="people" size={32} color="#FFF" />
          <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Usuários Totais</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: Colors.secondary }]}>
          <MaterialIcons name="article" size={32} color="#FFF" />
          <Text style={styles.statNumber}>{stats.totalPosts.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Publicações</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
          <MaterialIcons name="groups" size={32} color="#FFF" />
          <Text style={styles.statNumber}>{stats.totalCommunities}</Text>
          <Text style={styles.statLabel}>Comunidades</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: Colors.faith }]}>
          <MaterialIcons name="person-pin" size={32} color="#FFF" />
          <Text style={styles.statNumber}>{stats.activeUsers}</Text>
          <Text style={styles.statLabel}>Usuários Ativos</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Ações Rápidas</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="verified" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Verificar Comunidades</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="campaign" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Enviar Anúncio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="analytics" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Relatórios</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReports = () => (
    <View style={styles.reportsContainer}>
      <Text style={styles.sectionTitle}>Denúncias e Moderação</Text>
      
      {reports.map(report => (
        <View key={report.id} style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View style={styles.reportType}>
              <MaterialIcons 
                name={report.type === 'post' ? 'article' : report.type === 'user' ? 'person' : 'comment'} 
                size={20} 
                color={Colors.primary} 
              />
              <Text style={styles.reportTypeText}>{report.type.toUpperCase()}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: report.status === 'pending' ? Colors.error : Colors.success }
            ]}>
              <Text style={styles.statusText}>{report.status}</Text>
            </View>
          </View>
          
          <Text style={styles.reportContent}>{report.content}</Text>
          <Text style={styles.reportReason}>Motivo: {report.reason}</Text>
          <Text style={styles.reportMeta}>Por: {report.reporter} • {new Date(report.createdAt).toLocaleDateString()}</Text>
          
          {report.status === 'pending' && (
            <View style={styles.reportActions}>
              <TouchableOpacity 
                style={[styles.reportActionBtn, { backgroundColor: Colors.success }]}
                onPress={() => handleReportAction(report.id, 'approve')}
              >
                <Text style={styles.reportActionText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.reportActionBtn, { backgroundColor: Colors.error }]}
                onPress={() => handleReportAction(report.id, 'reject')}
              >
                <Text style={styles.reportActionText}>Rejeitar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return renderDashboard();
      case 'reports':
        return renderReports();
      case 'users':
        return (
          <View style={styles.centered}>
            <MaterialIcons name="people" size={64} color={Colors.textLight} />
            <Text style={styles.comingSoonTitle}>Gerenciamento de Usuários</Text>
            <Text style={styles.comingSoonText}>Em desenvolvimento</Text>
          </View>
        );
      case 'posts':
        return (
          <View style={styles.centered}>
            <MaterialIcons name="article" size={64} color={Colors.textLight} />
            <Text style={styles.comingSoonTitle}>Gerenciamento de Posts</Text>
            <Text style={styles.comingSoonText}>Em desenvolvimento</Text>
          </View>
        );
      case 'communities':
        return (
          <View style={styles.centered}>
            <MaterialIcons name="groups" size={64} color={Colors.textLight} />
            <Text style={styles.comingSoonTitle}>Gerenciamento de Comunidades</Text>
            <Text style={styles.comingSoonText}>Em desenvolvimento</Text>
          </View>
        );
      default:
        return renderDashboard();
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Acesso Negado</Text>
          <Text style={styles.errorText}>Você precisa estar logado como administrador</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <TouchableOpacity>
          <MaterialIcons name="settings" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { key: 'users', label: 'Usuários', icon: 'people' },
          { key: 'posts', label: 'Posts', icon: 'article' },
          { key: 'communities', label: 'Comunidades', icon: 'groups' },
          { key: 'reports', label: `Denúncias (${stats.reportsCount})`, icon: 'report' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.activeTab
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <MaterialIcons 
              name={tab.icon as any} 
              size={20} 
              color={selectedTab === tab.key ? Colors.primary : Colors.textLight} 
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderContent()}
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: '#FFF',
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    whiteSpace: 'nowrap',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: Fonts.weights.semibold,
  },
  content: {
    flex: 1,
  },
  
  // Dashboard
  dashboardContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: isWeb ? 200 : 150,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: Fonts.weights.medium,
    color: Colors.text,
  },
  
  // Reports
  reportsContainer: {
    padding: 20,
  },
  reportCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportTypeText: {
    fontSize: 12,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: Fonts.weights.semibold,
    color: '#FFF',
  },
  reportContent: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  reportReason: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 16,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  reportActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportActionText: {
    color: '#FFF',
    fontWeight: Fonts.weights.semibold,
  },
  
  // Common
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: Colors.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  
  // Modal
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