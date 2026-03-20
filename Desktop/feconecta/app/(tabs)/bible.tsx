import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

export default function BibleScreen() {
  const bibleBooks = [
    'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio',
    'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel',
    'Mateus', 'Marcos', 'Lucas', 'João', 'Atos'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bíblia Sagrada</Text>
        <TouchableOpacity style={styles.versionButton}>
          <Text style={styles.versionText}>NVI</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.featuredSection}>
          <View style={styles.verseOfDay}>
            <MaterialIcons name="auto-awesome" size={24} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Versículo do Dia</Text>
          </View>
          <View style={styles.verseCard}>
            <Text style={styles.verseText}>
              "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; 
              pensamentos de paz e não de mal, para vos dar o fim que esperais."
            </Text>
            <Text style={styles.verseReference}>Jeremias 29:11</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <MaterialIcons name="bookmark" size={32} color={Colors.primary} />
            <Text style={styles.actionTitle}>Favoritos</Text>
            <Text style={styles.actionSubtitle}>Seus versículos salvos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <MaterialIcons name="history" size={32} color={Colors.primary} />
            <Text style={styles.actionTitle}>Histórico</Text>
            <Text style={styles.actionSubtitle}>Leituras recentes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.booksSection}>
          <Text style={styles.sectionTitle}>Livros da Bíblia</Text>
          <View style={styles.booksGrid}>
            {bibleBooks.map((book, index) => (
              <TouchableOpacity key={index} style={styles.bookItem}>
                <Text style={styles.bookName}>{book}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.comingSoon}>
          <MaterialIcons name="construction" size={48} color={Colors.textLight} />
          <Text style={styles.comingSoonTitle}>Funcionalidade Completa em Breve</Text>
          <Text style={styles.comingSoonText}>
            Em desenvolvimento: texto completo da Bíblia, marcação de versículos, 
            notas pessoais e planos de leitura.
          </Text>
        </View>
      </ScrollView>
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
  versionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  versionText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
    marginRight: 4,
  },
  content: {
    padding: 16,
  },
  featuredSection: {
    marginBottom: 24,
  },
  verseOfDay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginLeft: 8,
  },
  verseCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  verseText: {
    fontSize: Fonts.sizes.md,
    lineHeight: 24,
    color: Colors.text,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  verseReference: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
    textAlign: 'right',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '48%',
  },
  actionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: 4,
  },
  booksSection: {
    marginBottom: 32,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bookItem: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 8,
    marginBottom: 8,
  },
  bookName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.text,
  },
  comingSoon: {
    alignItems: 'center',
    padding: 32,
  },
  comingSoonTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textLight,
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
});