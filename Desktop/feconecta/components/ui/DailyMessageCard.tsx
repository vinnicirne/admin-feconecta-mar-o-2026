import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { DailyMessage } from '../../services/postsService';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

interface DailyMessageCardProps {
  message: DailyMessage;
  onPress: () => void;
}

const { width } = Dimensions.get('window');

export default function DailyMessageCard({ message, onPress }: DailyMessageCardProps) {
  const backgroundImage = message.background_image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: backgroundImage }} 
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      >
        <View style={styles.header}>
          <MaterialIcons name="auto-awesome" size={24} color="#FFD700" />
          <Text style={styles.title}>{message.title}</Text>
        </View>
        
        <Text style={styles.content}>{message.content}</Text>
        <Text style={styles.reference}>- {message.bible_reference}</Text>
        
        <View style={styles.actions}>
          <View style={styles.actionItem}>
            <MaterialIcons 
              name="favorite" 
              size={20} 
              color={Colors.faith} 
            />
            <Text style={styles.actionText}>{message.faith_count}</Text>
          </View>
          <View style={styles.actionItem}>
            <MaterialIcons name="comment" size={20} color="#FFF" />
            <Text style={styles.actionText}>{message.comments_count}</Text>
          </View>
          <View style={styles.actionItem}>
            <MaterialIcons name="share" size={20} color="#FFF" />
            <Text style={styles.actionText}>Compartilhar</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: '#FFF',
    marginLeft: 8,
  },
  content: {
    fontSize: Fonts.sizes.md,
    color: '#FFF',
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
    flex: 1,
    textAlignVertical: 'center',
  },
  reference: {
    fontSize: Fonts.sizes.sm,
    color: '#FFD700',
    textAlign: 'right',
    fontWeight: Fonts.weights.semibold,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
  },
});