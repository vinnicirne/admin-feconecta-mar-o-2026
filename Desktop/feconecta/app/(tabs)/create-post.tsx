import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { usePosts } from '../../hooks/usePosts';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

const { width, height } = Dimensions.get('window');

export default function CreatePostScreen() {
  const [postContent, setPostContent] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const { addPost } = usePosts();

  // Voltar para feed automaticamente
  React.useEffect(() => {
    router.replace('/(tabs)');
  }, []);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Erro', 'Precisamos de permissão para acessar a câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
      setShowPostModal(true);
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Erro', 'Precisamos de permissão para acessar a galeria');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
      setShowPostModal(true);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Erro', 'Precisamos de permissão para acessar o microfone');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      showAlert('Erro', 'Não foi possível iniciar a gravação');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        setMediaUri(uri);
        setMediaType('audio');
        setShowPostModal(true);
      }
      setRecording(null);
    } catch (err) {
      console.error('Erro ao parar gravação:', err);
    }
  };

  const handlePublish = async () => {
    if (!postContent.trim() && !mediaUri) {
      showAlert('Erro', 'Adicione texto ou mídia ao seu post');
      return;
    }

    setIsUploading(true);
    try {
      const finalMediaType = mediaType || 'text';
      await addPost(postContent.trim(), finalMediaType as any, mediaUri || undefined);
      
      showAlert('Sucesso', 'Post criado com sucesso!');
      
      // Reset form
      setPostContent('');
      setMediaUri(null);
      setMediaType(null);
      setShowPostModal(false);
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao criar post');
    } finally {
      setIsUploading(false);
    }
  };

  // Tela de opções principais
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.optionsContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <MaterialIcons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Publicação</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.optionsGrid}>
          <TouchableOpacity style={styles.optionCard} onPress={handleCamera}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.primary }]}>
              <MaterialIcons name="camera-alt" size={32} color="#FFF" />
            </View>
            <Text style={styles.optionTitle}>Câmera</Text>
            <Text style={styles.optionSubtitle}>Foto ou vídeo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard} onPress={handleGallery}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.secondary }]}>
              <MaterialIcons name="photo-library" size={32} color="#FFF" />
            </View>
            <Text style={styles.optionTitle}>Galeria</Text>
            <Text style={styles.optionSubtitle}>Suas fotos e vídeos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard} onPress={() => setShowPostModal(true)}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.success }]}>
              <MaterialIcons name="text-fields" size={32} color="#FFF" />
            </View>
            <Text style={styles.optionTitle}>Texto</Text>
            <Text style={styles.optionSubtitle}>Escreva suas palavras</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, isRecording && styles.recordingCard]} 
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={[styles.optionIcon, { backgroundColor: isRecording ? Colors.error : Colors.faith }]}>
              <MaterialIcons 
                name={isRecording ? "stop" : "mic"}
                size={32} 
                color="#FFF" 
              />
            </View>
            <Text style={styles.optionTitle}>
              {isRecording ? 'Parar Gravação' : 'Áudio'}
            </Text>
            <Text style={styles.optionSubtitle}>
              {isRecording ? 'Gravando...' : 'Grave sua mensagem'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Publicação Compacto */}
      <Modal 
        visible={showPostModal} 
        animationType="slide" 
        presentationStyle="formSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <MaterialIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nova Publicação</Text>
            <TouchableOpacity 
              onPress={handlePublish}
              disabled={isUploading || (!postContent.trim() && !mediaUri)}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={[
                  styles.publishButton,
                  (!postContent.trim() && !mediaUri) && styles.publishButtonDisabled
                ]}>
                  Publicar
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Preview de mídia */}
            {mediaUri && (
              <View style={styles.mediaPreview}>
                {mediaType === 'image' && (
                  <Image source={{ uri: mediaUri }} style={styles.previewImage} />
                )}
                {mediaType === 'video' && (
                  <View style={styles.videoPreview}>
                    <MaterialIcons name="play-circle-outline" size={64} color="#FFF" />
                    <Text style={styles.videoText}>Vídeo Selecionado</Text>
                  </View>
                )}
                {mediaType === 'audio' && (
                  <View style={styles.audioPreview}>
                    <MaterialIcons name="audiotrack" size={32} color={Colors.primary} />
                    <Text style={styles.audioText}>Áudio Gravado</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeMedia}
                  onPress={() => {
                    setMediaUri(null);
                    setMediaType(null);
                  }}
                >
                  <MaterialIcons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* Input de texto */}
            <TextInput
              style={styles.textInput}
              placeholder="O que você gostaria de compartilhar?"
              placeholderTextColor={Colors.textLight}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              autoFocus={!mediaUri}
            />

            {/* Opções adicionais */}
            <View style={styles.additionalOptions}>
              <TouchableOpacity 
                style={styles.additionalOption}
                onPress={() => setShowTextEditor(true)}
              >
                <MaterialIcons name="format-color-text" size={20} color={Colors.primary} />
                <Text style={styles.additionalOptionText}>Formatação</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.additionalOption}>
                <MaterialIcons name="menu-book" size={20} color={Colors.primary} />
                <Text style={styles.additionalOptionText}>Versículo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.additionalOption}>
                <MaterialIcons name="location-on" size={20} color={Colors.primary} />
                <Text style={styles.additionalOptionText}>Localização</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal do Editor de Texto */}
      <Modal 
        visible={showTextEditor} 
        animationType="slide" 
        presentationStyle="formSheet"
      >
        <SafeAreaView style={styles.editorContainer}>
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={() => setShowTextEditor(false)}>
              <Text style={styles.editorCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.editorTitle}>Editor de Texto</Text>
            <TouchableOpacity onPress={() => setShowTextEditor(false)}>
              <Text style={styles.editorDone}>Pronto</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formatOptions}>
            <TouchableOpacity style={styles.formatButton}>
              <MaterialIcons name="format-bold" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.formatButton}>
              <MaterialIcons name="format-italic" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.formatButton}>
              <MaterialIcons name="format-underlined" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.editorInput}
            value={postContent}
            onChangeText={setPostContent}
            multiline
            placeholder="Digite seu texto aqui..."
            placeholderTextColor={Colors.textLight}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  optionsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  optionsGrid: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingCard: {
    backgroundColor: Colors.error + '20',
    borderWidth: 2,
    borderColor: Colors.error,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },
  // Modal styles - mais compacto
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    maxHeight: height * 0.75, // 75% da tela
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
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  publishButton: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
  },
  publishButtonDisabled: {
    color: Colors.textLight,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  mediaPreview: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  videoText: {
    color: '#FFF',
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    marginTop: 8,
  },
  audioPreview: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  audioText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    marginTop: 8,
  },
  removeMedia: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
  },
  additionalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  additionalOption: {
    alignItems: 'center',
    padding: 12,
    gap: 4,
  },
  additionalOptionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
  },
  // Editor styles
  editorContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  editorCancel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  editorTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  editorDone: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
  },
  formatOptions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  formatButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  editorInput: {
    flex: 1,
    padding: 16,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    textAlignVertical: 'top',
  },
});