import { supabase } from './supabase';

export interface Note {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  bible_reference?: {
    book: string;
    chapter: number;
    verse?: string;
    version: string;
  };
  tags?: string[];
  is_favorite: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export const notesService = {
  // Obter todas as notas do usuário
  async getUserNotes(limit = 50, offset = 0): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Criar nova nota
  async createNote(noteData: {
    title?: string;
    content: string;
    bible_reference?: Note['bible_reference'];
    tags?: string[];
    is_favorite?: boolean;
    is_private?: boolean;
  }): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: noteData.title?.trim() || null,
        content: noteData.content.trim(),
        bible_reference: noteData.bible_reference || null,
        tags: noteData.tags || [],
        is_favorite: noteData.is_favorite || false,
        is_private: noteData.is_private !== false, // Padrão é privado
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar nota
  async updateNote(noteId: string, updates: Partial<Note>): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar nota
  async deleteNote(noteId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Buscar notas por tag
  async getNotesByTag(tag: string): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .contains('tags', [tag])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Buscar notas por referência bíblica
  async getNotesByBibleReference(book: string, chapter?: number): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .not('bible_reference', 'is', null);

    // Filtrar por livro da Bíblia
    if (book) {
      query = query.contains('bible_reference', { book });
    }

    // Filtrar por capítulo se especificado
    if (chapter) {
      query = query.contains('bible_reference', { chapter });
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obter notas favoritas
  async getFavoriteNotes(): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_favorite', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Converter nota em post
  async convertNoteToPost(noteId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Obter a nota
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single();

    if (noteError || !note) throw new Error('Nota não encontrada');

    // Criar o post
    const postContent = note.title ? `${note.title}\n\n${note.content}` : note.content;
    
    const { error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: postContent,
        type: note.bible_reference ? 'bible_verse' : 'text',
        bible_verse: note.bible_reference ? {
          book: note.bible_reference.book,
          chapter: note.bible_reference.chapter,
          verse: note.bible_reference.verse || '1',
          version: note.bible_reference.version,
          text: '', // Seria preenchido com o texto real do versículo
        } : null,
      });

    if (postError) throw postError;
  },
};