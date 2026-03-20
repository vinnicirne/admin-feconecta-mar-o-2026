import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface FaithButtonProps {
  count: number;
  hasFaithed: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
}

export default function FaithButton({ count, hasFaithed, onPress, size = 'md' }: FaithButtonProps) {
  const iconSize = size === 'sm' ? 18 : 22;
  const textSize = size === 'sm' ? 12 : 14;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name="favorite" 
          size={iconSize} 
          color={hasFaithed ? Colors.faith : Colors.textLight} 
        />
        <Text style={[
          styles.count, 
          { fontSize: textSize },
          hasFaithed && styles.faithedText
        ]}>
          {count}
        </Text>
      </View>
      <Text style={[styles.label, { fontSize: textSize - 1 }]}>
        {hasFaithed ? 'Com Fé' : 'Fé'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  count: {
    marginLeft: 4,
    fontWeight: '600',
    color: Colors.text,
  },
  label: {
    color: Colors.textLight,
    fontWeight: '500',
  },
  faithedText: {
    color: Colors.faith,
  },
});