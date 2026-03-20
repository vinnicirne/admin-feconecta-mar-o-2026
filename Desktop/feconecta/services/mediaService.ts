import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface MediaUploadResult {
  url: string;
  type: 'image' | 'video' | 'audio';
}

export class MediaService {
  static async requestPermissions() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permissão para acessar a galeria é necessária');
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      throw new Error('Permissão para acessar a câmera é necessária');
    }
  }

  static async captureImage(): Promise<MediaUploadResult | null> {
    await this.requestPermissions();

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // 1:1 ratio para Instagram-like
      quality: 0.8,
    });

    if (result.canceled) return null;

    return await this.uploadMedia(result.assets[0].uri, 'image');
  }

  static async captureVideo(): Promise<MediaUploadResult | null> {
    await this.requestPermissions();

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 60, // 1 minuto
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (result.canceled) return null;

    return await this.uploadMedia(result.assets[0].uri, 'video');
  }

  static async pickFromGallery(): Promise<MediaUploadResult | null> {
    await this.requestPermissions();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    const type = asset.type === 'video' ? 'video' : 'image';
    
    return await this.uploadMedia(asset.uri, type);
  }

  static async processImage(uri: string): Promise<string> {
    try {
      // Redimensionar para 1080x1080
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080, height: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return uri;
    }
  }

  static async uploadMedia(uri: string, type: 'image' | 'video' | 'audio'): Promise<MediaUploadResult> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    try {
      let processedUri = uri;
      
      // Processar imagem para tamanho padrão
      if (type === 'image') {
        processedUri = await this.processImage(uri);
      }

      const timestamp = Date.now();
      const extension = type === 'video' ? 'mp4' : type === 'audio' ? 'm4a' : 'jpg';
      const fileName = `${user.id}/${timestamp}.${extension}`;

      let fileData: ArrayBuffer;

      if (Platform.OS === 'web') {
        const response = await fetch(processedUri);
        fileData = await response.arrayBuffer();
      } else {
        // Para mobile, converter para blob primeiro
        const response = await fetch(processedUri);
        const blob = await response.blob();
        fileData = await blob.arrayBuffer();
      }

      const { data, error } = await supabase.storage
        .from('posts')
        .upload(fileName, fileData, {
          contentType: type === 'video' ? 'video/mp4' : type === 'audio' ? 'audio/m4a' : 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        type,
      };
    } catch (error: any) {
      throw new Error(`Erro no upload: ${error.message}`);
    }
  }
}