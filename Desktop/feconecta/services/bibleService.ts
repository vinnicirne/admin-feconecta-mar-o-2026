import { supabase } from './supabase';

export interface BibleBook {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
  abbrev: string;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

// API pública da Bíblia brasileira
const BIBLE_API_BASE = 'https://www.abibliadigital.com.br/api';

export const bibleService = {
  // Obter livros da Bíblia
  async getBibleBooks(): Promise<BibleBook[]> {
    try {
      const response = await fetch(`${BIBLE_API_BASE}/books`);
      const data = await response.json();
      
      return data.map((book: any) => ({
        id: book.abbrev.pt,
        name: book.name,
        testament: book.testament === 'VT' ? 'old' : 'new',
        chapters: book.chapters,
        abbrev: book.abbrev.pt,
      }));
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      return [];
    }
  },

  // Obter capítulo específico
  async getChapter(bookAbbrev: string, chapter: number): Promise<BibleChapter | null> {
    try {
      const response = await fetch(`${BIBLE_API_BASE}/verses/acf/${bookAbbrev}/${chapter}`);
      const data = await response.json();
      
      if (!data.verses) return null;

      return {
        book: data.book.name,
        chapter: data.chapter.number,
        verses: data.verses.map((verse: any) => ({
          book: data.book.name,
          chapter: data.chapter.number,
          verse: verse.number,
          text: verse.text,
        })),
      };
    } catch (error) {
      console.error('Erro ao carregar capítulo:', error);
      return null;
    }
  },

  // Buscar versículos
  async searchVerses(query: string): Promise<BibleVerse[]> {
    try {
      const response = await fetch(`${BIBLE_API_BASE}/verses/acf/search/${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!data.verses) return [];

      return data.verses.slice(0, 20).map((verse: any) => ({
        book: verse.book.name,
        chapter: verse.chapter,
        verse: verse.number,
        text: verse.text,
      }));
    } catch (error) {
      console.error('Erro na busca:', error);
      return [];
    }
  },

  // Versículo do dia
  async getVerseOfTheDay(): Promise<BibleVerse | null> {
    try {
      const response = await fetch(`${BIBLE_API_BASE}/verses/acf/random`);
      const data = await response.json();
      
      if (!data) return null;

      return {
        book: data.book.name,
        chapter: data.chapter,
        verse: data.number,
        text: data.text,
      };
    } catch (error) {
      console.error('Erro ao carregar versículo do dia:', error);
      return null;
    }
  },

  // Salvar versículo favorito
  async saveBookmark(verse: BibleVerse, note?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('bible_bookmarks')
      .insert({
        user_id: user.id,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        note: note || null,
      });

    if (error) throw error;
  },

  // Obter favoritos do usuário
  async getUserBookmarks(): Promise<BibleVerse[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('bible_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return [];

    return data?.map(bookmark => ({
      book: bookmark.book,
      chapter: bookmark.chapter,
      verse: bookmark.verse,
      text: bookmark.text,
    })) || [];
  },
};