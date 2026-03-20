import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

export default function LoginScreen() {
  const { login, register, resetPassword, loading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      showWebAlert('Erro', 'Por favor, insira seu e-mail');
      return false;
    }

    if (!formData.email.includes('@')) {
      showWebAlert('Erro', 'Por favor, insira um e-mail válido');
      return false;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      showWebAlert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (isRegisterMode) {
      if (!formData.username.trim()) {
        showWebAlert('Erro', 'Por favor, insira um nome de usuário');
        return false;
      }

      if (!formData.displayName.trim()) {
        showWebAlert('Erro', 'Por favor, insira seu nome completo');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        showWebAlert('Erro', 'As senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || loading) return;

    try {
      if (isRegisterMode) {
        await register(
          formData.email.trim(),
          formData.password,
          formData.username.trim(),
          formData.displayName.trim()
        );
        showWebAlert('Sucesso', 'Conta criada com sucesso! Bem-vindo ao FeConecta!', () => {
          router.replace('/(tabs)');
        });
      } else {
        await login(formData.email.trim(), formData.password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      showWebAlert('Erro', error.message || 'Erro ao processar solicitação');
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      showWebAlert('Erro', 'Por favor, insira seu e-mail primeiro');
      return;
    }

    try {
      await resetPassword(formData.email.trim());
      showWebAlert('Sucesso', 'Link de recuperação enviado para seu e-mail');
    } catch (error: any) {
      showWebAlert('Erro', error.message || 'Erro ao enviar link de recuperação');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>FeConecta</Text>
            <Text style={styles.subtitle}>
              {isRegisterMode 
                ? 'Junte-se à nossa comunidade de fé' 
                : 'Conectando corações em fé'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <MaterialIcons name="email" size={24} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={Colors.textLight}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {isRegisterMode && (
              <>
                <View style={styles.inputGroup}>
                  <MaterialIcons name="alternate-email" size={24} color={Colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome de usuário"
                    placeholderTextColor={Colors.textLight}
                    value={formData.username}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <MaterialIcons name="person" size={24} color={Colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor={Colors.textLight}
                    value={formData.displayName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <MaterialIcons name="lock" size={24} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={Colors.textLight}
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons 
                  name={showPassword ? 'visibility' : 'visibility-off'} 
                  size={24} 
                  color={Colors.textLight} 
                />
              </TouchableOpacity>
            </View>

            {isRegisterMode && (
              <View style={styles.inputGroup}>
                <MaterialIcons name="lock-outline" size={24} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar senha"
                  placeholderTextColor={Colors.textLight}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry={!showPassword}
                />
              </View>
            )}

            {!isRegisterMode && (
              <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>
                  {isRegisterMode ? 'Criar Conta' : 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsRegisterMode(!isRegisterMode)}
            >
              <Text style={styles.switchText}>
                {isRegisterMode 
                  ? 'Já tem uma conta? Faça login' 
                  : 'Não tem conta? Cadastre-se'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Web Alert Modal */}
        {Platform.OS === 'web' && (
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFF',
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
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