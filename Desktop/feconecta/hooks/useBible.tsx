import { useState, useEffect, useCallback } from 'react';
import { bibleService, BibleBook, BibleVerse, BibleVersion, BookmarkVerse } from '../services/bibleService';

export function useBible() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState('ACF');
  const [bookmarks, setBookmarks] = useState<BookmarkVerse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBooks = useCallback(async () => {
    try {
      const bibleBooks = await bibleService.getBibleBooks();
      setBooks(bibleBooks);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    }
  }, []);

  const loadVersions = useCallback(async () => {
    try {
      const bibleVersions = await bibleService.getBibleVersions();
      setVersions(bibleVersions);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
    }
  }, []);

  const loadBookmarks = useCallback(async () => {
    try {
      const userBookmarks = await bibleService.getUserBookmarks();
      setBookmarks(userBookmarks);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }, []);

  const getChapterVerses = useCallback(async (bookId: string, chapter: number) => {
    setLoading(true);
    try {
      const verses = await bibleService.getChapterVerses(bookId, chapter, currentVersion);
      return verses;
    } catch (error) {
      console.error('Erro ao carregar versículos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentVersion]);

  const searchVerses = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    
    setLoading(true);
    try {
      const results = await bibleService.searchVerses(query, currentVersion);
      return results;
    } catch (error) {
      console.error('Erro ao buscar versículos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentVersion]);

  const bookmarkVerse = useCallback(async (verseId: string, color: string, note?: string) => {
    try {
      const bookmark = await bibleService.bookmarkVerse(verseId, color, note);
      setBookmarks(prev => {
        const existing = prev.find(b => b.verse_id === verseId);
        if (existing) {
          return prev.map(b => b.verse_id === verseId ? bookmark : b);
        }
        return [bookmark, ...prev];
      });
      return bookmark;
    } catch (error) {
      console.error('Erro ao marcar versículo:', error);
      throw error;
    }
  }, []);

  const removeBookmark = useCallback(async (verseId: string) => {
    try {
      await bibleService.removeBookmark(verseId);
      setBookmarks(prev => prev.filter(b => b.verse_id !== verseId));
    } catch (error) {
      console.error('Erro ao remover marcação:', error);
      throw error;
    }
  }, []);

  const getVerseOfTheDay = useCallback(async () => {
    try {
      return await bibleService.getVerseOfTheDay();
    } catch (error) {
      console.error('Erro ao carregar versículo do dia:', error);
      return null;
    }
  }, []);

  const isBookmarked = useCallback((verseId: string) => {
    return bookmarks.some(b => b.verse_id === verseId);
  }, [bookmarks]);

  const getBookmarkColor = useCallback((verseId: string) => {
    const bookmark = bookmarks.find(b => b.verse_id === verseId);
    return bookmark?.color;
  }, [bookmarks]);

  useEffect(() => {
    loadBooks();
    loadVersions();
    loadBookmarks();
  }, [loadBooks, loadVersions, loadBookmarks]);

  return {
    books,
    versions,
    currentVersion,
    bookmarks,
    loading,
    setCurrentVersion,
    getChapterVerses,
    searchVerses,
    bookmarkVerse,
    removeBookmark,
    getVerseOfTheDay,
    isBookmarked,
    getBookmarkColor,
    loadBookmarks,
  };
}