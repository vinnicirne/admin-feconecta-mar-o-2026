
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { notesService, Note } from '../../services/notesService';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);
  const [showDevocional, setShowDevocional] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ 
    title: '', 
    content: '', 
    is_favorite: false, 
    is_private: true 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    setAlertConfig({ visible: true, title, message, onOk });
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const userNotes = await notesService.getUserNotes();
      setNotes(userNotes);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      showAlert('Erro', 'Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      showAlert('Erro', 'Preencha pelo menos o título ou conteúdo');
      return;
    }

    try {
      const note = await notesService.createNote({
        title: newNote.title.trim() || null,
        content: newNote.content.trim() || 'Nova nota',
        is_favorite: newNote.is_favorite,
        is_private: newNote.is_private,
      });

      setNotes(prev => [note, ...prev]);
      setNewNote({ title: '', content: '', is_favorite: false, is_private: true });
      setShowCreateNote(false);
      showAlert('Sucesso', 'Nota criada com sucesso!');
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao criar nota');
    }
  };

  const updateNote = async () => {
    if (!editingNote) return;

    if (!newNote.title.trim() && !newNote.content.trim()) {
      showAlert('Erro', 'Preencha pelo menos o título ou conteúdo');
      return;
    }

    try {
      const updated = await notesService.updateNote(editingNote.id, {
        title: newNote.title.trim() || null,
        content: newNote.content.trim(),
        is_favorite: newNote.is_favorite,
        is_private: newNote.is_private,
      });

      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? updated : note
      ));
      
      setEditingNote(null);
      setNewNote({ title: '', content: '', is_favorite: false, is_private: true });
      setShowEditNote(false);
      showAlert('Sucesso', 'Nota atualizada com sucesso!');
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao atualizar nota');
    }
  };

  const deleteNote = async (noteId: string) => {
    showAlert(
      'Confirmar Exclusão', 
      'Tem certeza que deseja excluir esta nota?',
      async () => {
        try {
          await notesService.deleteNote(noteId);
          setNotes(prev => prev.filter(note => note.id !== noteId));
          showAlert('Sucesso', 'Nota excluída com sucesso!');
        } catch (error: any) {
          showAlert('Erro', error.message || 'Erro ao excluir nota');
        }
      }
    );
  };

  const toggleFavorite = async (note: Note) => {
    try {
      const updated = await notesService.updateNote(note.id, {
        is_favorite: !note.is_favorite
      });
      
      setNotes(prev => prev.map(n => 
        n.id === note.id ? updated : n
      ));
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao favoritar nota');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title || '',
      content: note.content,
      is_favorite: note.is_favorite,
      is_private: note.is_private,
    });
    setShowEditNote(true);
  };

  const createNoteFromDevocional = () => {
    setNewNote({
      title: 'Devocional - ' + new Date().toLocaleDateString('pt-BR'),
      content: 'Jeremias 29:11 - "Porque eu bem sei os pensamentos que tenho a vosso respeito..."\n\nReflexão: ',
      is_favorite: false,
      is_private: true,
    });
    setShowDevocional(false);
    setShowCreateNote(true);
  };

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (note.title?.toLowerCase().includes(searchLower) || false) ||
           note.content.toLowerCase().includes(searchLower);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => handleEditNote(item)}
    >
      <View style={styles.noteHeader}>
        <View style={styles.noteTitleRow}>
          {item.title && <Text style={styles.noteTitle}>{item.title}</Text>}
          <View style={styles.noteIcons}>
            {item.is_favorite && (
              <MaterialIcons name="star" size={16} color={Colors.secondary} />
            )}
            {/* The line below was redundant, as the next MaterialIcons component covers both private and public */}
            {/* {!item.is_private && (
              <MaterialIcons name="public" size={16} color={Colors.success} />
            )} */}
            <MaterialIcons name={item.is_private ? "lock" : "public"} size={16} color={Colors.textLight} />
          </View>
        </View>
      </View>
      
      <Text style={styles.noteContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>
          {formatDate(item.created_at)}
        </Text>
        <View style={styles.noteActions}>
          <TouchableOpacity onPress={() => toggleFavorite(item)}>
            <MaterialIcons 
              name={item.is_favorite ? "star" : "star-border"} 
              size={20} 
              color={item.is_favorite ? Colors.secondary : Colors.textLight} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteNote(item.id)}>
            <MaterialIcons name="delete" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Notas</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.devocionalButton}
            onPress={() => setShowDevocional(true)}
          >
            <MaterialIcons name="auto-awesome" size={20} color={Colors.secondary} />
            <Text style={styles.devocionalText}>Devocional</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreateNote(true)}>
            <MaterialIcons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar nas notas..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando notas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="note" size={64} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Nenhuma Nota</Text>
              <Text style={styles.emptyText}>
                Crie sua primeira nota ou devocional
              </Text>
            </View>
          }
        />
      )}

      {/* FAB para criar nota */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowCreateNote(true)}
      >
        <MaterialIcons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Modal Devocional */}
      <Modal 
        visible={showDevocional} 
        animationType="slide" 
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDevocional(false)}>
              <MaterialIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Devocional de Hoje</Text>
            <TouchableOpacity onPress={createNoteFromDevocional}>
              <MaterialIcons name="note-add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.devocionalContent}>
            <Text style={styles.devocionalTitle}>Uma Palavra para Seu Coração</Text>
            
            <View style={styles.verseCard}>
              <Text style={styles.verseText}>
                "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça."
              </Text>
              <Text style={styles.verseReference}>Isaías 41:10</Text>
            </View>

            <Text style={styles.devocionalMessage}>
              Deus tem planos maravilhosos para sua vida! Mesmo quando as circunstâncias parecem 
              difíceis, confie que Ele está trabalhando em seu favor. Hoje, lembre-se de que 
              você está nas mãos do Criador do universo.
            </Text>

            <TouchableOpacity 
              style={styles.createNoteButton}
              onPress={createNoteFromDevocional}
            >
              <MaterialIcons name="note-add" size={20} color="#FFF" />
              <Text style={styles.createNoteButtonText}>Criar Nota do Devocional</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Criar/Editar Nota */}
      <Modal 
        visible={showCreateNote || showEditNote} 
        animationType="slide" 
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowCreateNote(false);
              setShowEditNote(false);
              setEditingNote(null);
              setNewNote({ title: '', content: '', is_favorite: false, is_private: true });
            }}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Editar Nota' : 'Nova Nota'}
            </Text>
            <TouchableOpacity onPress={editingNote ? updateNote : createNote}>
              <Text style={styles.saveButton}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Título da nota (opcional)"
              placeholderTextColor={Colors.textLight}
              value={newNote.title}
              onChangeText={(text) => setNewNote(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={styles.contentInput}
              placeholder="Conteúdo da nota..."
              placeholderTextColor={Colors.textLight}
              value={newNote.content}
              onChangeText={(text) => setNewNote(prev => ({ ...prev, content: text }))}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.optionsContainer}>
              <View style={styles.option}>
                <MaterialIcons name="star" size={24} color={newNote.is_favorite ? Colors.secondary : Colors.textLight} />
                <Text style={styles.optionText}>Favoritar</Text>
                <Switch
                  value={newNote.is_favorite}
                  onValueChange={(value) => setNewNote(prev => ({ ...prev, is_favorite: value }))}
                  trackColor={{ false: Colors.border, true: Colors.secondary }}
                  thumbColor={newNote.is_favorite ? '#FFF' : '#FFF'}
                />
              </View>

              <View style={styles.option}>
                <MaterialIcons name={newNote.is_private ? "lock" : "public"} size={24} color={Colors.textLight} />
                <Text style={styles.optionText}>Privada</Text>
                <Switch
                  value={newNote.is_private}
                  onValueChange={(value) => setNewNote(prev => ({ ...prev, is_private: value }))}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={newNote.is_private ? '#FFF' : '#FFF'}
                />
              </View>
            </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  devocionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  devocionalText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.secondary,
    fontWeight: Fonts.weights.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteHeader: {
    marginBottom: 8,
  },
  noteTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    flex: 1,
  },
  noteIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  noteContent: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 16,
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
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
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
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  cancelButton: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  saveButton: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
  },
  devocionalContent: {
    flex: 1,
    padding: 20,
  },
  devocionalTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  verseCard: {
    backgroundColor: Colors.primary + '10',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 24,
  },
  verseText: {
    fontSize: Fonts.sizes.lg,
    lineHeight: 28,
    color: Colors.text,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  verseReference: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
    textAlign: 'right',
  },
  devocionalMessage: {
    fontSize: Fonts.sizes.md,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: 32,
  },
  createNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createNoteButtonText: {
    color: '#FFF',
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    lineHeight: 24,
    minHeight: 200,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
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
