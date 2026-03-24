"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Highlighter,
  StickyNote,
  PlusCircle,
  Share2,
  ChevronDown,
  BookOpen,
  X,
  Star,
  MessageSquare,
} from "lucide-react";

// ─────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────

interface TextSegment { text: string; isJesus: boolean; }
interface ParsedVerse  { type: "verse" | "heading" | "other"; number?: number; segments: TextSegment[]; }

interface WordResult {
  bookId:    string;
  bookName:  string;
  chapter:   number;
  verse:     number;
  text:      string;
  isNewTestament: boolean;
}

// ─────────────────────────────────────────────────────
// HELPERS DE TEXTO / API
// ─────────────────────────────────────────────────────

function extractRawText(content: any): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((seg: any) => {
      if (typeof seg === "string") return seg;
      if (seg.noteId !== undefined) return "";
      if (seg.text) return seg.text;
      if (Array.isArray(seg.content)) return seg.content.join("");
      if (typeof seg.content === "string") return seg.content;
      return "";
    })
    .join("");
}

function buildJesusVerseSet(kjvContent: any[]): Set<number> {
  const set = new Set<number>();
  for (const item of kjvContent) {
    if (item.type !== "verse" || !Array.isArray(item.content)) continue;
    if (item.content.some((s: any) => s.wordsOfJesus === true || s.type === "wordsOfJesus"))
      set.add(item.number);
  }
  return set;
}

const OPEN_QUOTES  = ["\u201c", "\u00ab", "\u2018"];
const CLOSE_QUOTES = ["\u201d", "\u00bb", "\u2019"];

function splitVerseByQuotes(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let buf = ""; let inQuote = false;
  for (const ch of text) {
    if (!inQuote && OPEN_QUOTES.includes(ch))  { if (buf) segments.push({ text: buf, isJesus: false }); buf = ch; inQuote = true; }
    else if (inQuote && CLOSE_QUOTES.includes(ch)) { buf += ch; segments.push({ text: buf, isJesus: true }); buf = ""; inQuote = false; }
    else buf += ch;
  }
  if (buf) segments.push({ text: buf, isJesus: inQuote });
  if (!segments.some((s) => s.isJesus)) return [{ text, isJesus: true }];
  return segments;
}

function processVerses(rawVerses: any[], jesusVerseNumbers: Set<number>): ParsedVerse[] {
  return rawVerses.map((item) => {
    if (item.type === "heading") return { type: "heading", segments: [{ text: extractRawText(item.content), isJesus: false }] };
    if (item.type !== "verse")   return { type: "other", number: item.number, segments: [] };

    if (Array.isArray(item.content)) {
      const hasApiMarkers = item.content.some((s: any) => s.wordsOfJesus === true || s.type === "wordsOfJesus");
      if (hasApiMarkers) {
        const segs: TextSegment[] = item.content.filter((s: any) => s.noteId === undefined).map((s: any): TextSegment => {
          if (typeof s === "string") return { text: s, isJesus: false };
          if (s.wordsOfJesus === true) return { text: s.text ?? "", isJesus: true };
          if (s.type === "wordsOfJesus") return { text: Array.isArray(s.content) ? s.content.join("") : s.content ?? "", isJesus: true };
          return { text: s.text ?? (Array.isArray(s.content) ? s.content.join("") : s.content ?? ""), isJesus: false };
        });
        return { type: "verse", number: item.number, segments: segs };
      }
    }

    const rawText = extractRawText(item.content);
    if (jesusVerseNumbers.has(item.number)) return { type: "verse", number: item.number, segments: splitVerseByQuotes(rawText) };
    return { type: "verse", number: item.number, segments: [{ text: rawText, isJesus: false }] };
  });
}

// ─────────────────────────────────────────────────────
// BUSCA DE PALAVRAS NA BÍBLIA COMPLETA
// ─────────────────────────────────────────────────────

async function searchWordInBible(
  word: string,
  translationId: string,
  allBooks: any[],
  cacheRef: React.MutableRefObject<any>
): Promise<{ results: WordResult[]; totalAT: number; totalNT: number }> {

  if (!cacheRef.current[translationId]) {
    const res  = await fetch(`https://bible.helloao.org/api/${translationId}/complete.json`);
    if (!res.ok) throw new Error(`Complete JSON not available (${res.status})`);
    const data = await res.json();
    cacheRef.current[translationId] = data;
  }

  const fullData = cacheRef.current[translationId];
  const results: WordResult[] = [];
  const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

  // Estrutura real do complete.json:
  // books[].id, books[].chapters[].chapter.number, books[].chapters[].chapter.content
  const booksList: any[] = fullData.books ?? [];

  for (const bookEntry of booksList) {
    const bookId   = bookEntry.id ?? bookEntry.book?.id;   // top-level id
    const bookMeta = allBooks.find((b) => b.id === bookId);
    const bookName = bookMeta?.name ?? bookEntry.name ?? bookId;
    const isNT     = (bookMeta?.order ?? bookEntry.order ?? 0) > 39;

    const chapters: any[] = bookEntry.chapters ?? [];
    for (const chapEntry of chapters) {
      // O capítulo está aninhado em chapEntry.chapter
      const chapObj = chapEntry.chapter ?? chapEntry;
      const chapNum = chapObj.number ?? chapEntry.number ?? 0;
      const content: any[] = chapObj.content ?? [];

      for (const item of content) {
        if (item.type !== "verse") continue;
        const text = extractRawText(item.content);
        regex.lastIndex = 0;
        if (regex.test(text)) {
          results.push({ bookId, bookName, chapter: chapNum, verse: item.number, text, isNewTestament: isNT });
        }
      }
    }
  }

  const totalAT = results.filter((r) => !r.isNewTestament).length;
  const totalNT = results.filter((r) =>  r.isNewTestament).length;
  return { results, totalAT, totalNT };
}

// ─────────────────────────────────────────────────────
// TRADUÇÕES
// ─────────────────────────────────────────────────────

const TRANSLATIONS = [
  { id: "por_onbv", label: "NBV (PT)" },
  { id: "eng_kjv",  label: "KJV (EN)" },
];

// Tradução usada para busca por palavra — sempre português
const SEARCH_TRANSLATION_ID = "por_onbv";

// ─────────────────────────────────────────────────────
// COMPONENT PRINCIPAL
// ─────────────────────────────────────────────────────

export default function BiblePage() {
  const router = useRouter();

  const [view, setView]         = useState<"books" | "reading">("books");
  const [testament, setTestament] = useState<"old" | "new">("old");
  const [searchQuery, setSearchQuery] = useState("");

  const [translationId, setTranslationId] = useState("por_onbv");
  const [allBooks, setAllBooks]   = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [chapter, setChapter]     = useState(1);
  const [processedVerses, setProcessedVerses] = useState<ParsedVerse[]>([]);
  const [loading, setLoading]     = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  // Livros PT separados para metadados da busca de palavras
  const [ptBooks, setPtBooks] = useState<any[]>([]);

  // ── Highlights & Favoritos ──────────────────────────
  const [highlights, setHighlights] = useState<Record<number, string>>({});
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Set<number>>(new Set());
  const [notesData, setNotesData] = useState<any[]>([]);
  const [verseToScroll, setVerseToScroll] = useState("");
  const [previewNote, setPreviewNote] = useState<any | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareImageData, setShareImageData] = useState<string | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [verseComments, setVerseComments] = useState<Set<number>>(new Set());
  const [commentsData, setCommentsData] = useState<any[]>([]);
  const [previewComments, setPreviewComments] = useState<any[]>([]);
  const [showingThreadFor, setShowingThreadFor] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState<{ id: string, content: string } | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);
  const HIGHLIGHT_COLORS = [
    { hex: "#fef08a", name: "Amarelo"  },
    { hex: "#86efac", name: "Verde"    },
    { hex: "#93c5fd", name: "Azul"     },
    { hex: "#f9a8d4", name: "Rosa"     },
    { hex: "#fcd34d", name: "Laranja"  },
  ];

  const [wordSearchActive, setWordSearchActive] = useState(false);
  const [wordResults, setWordResults]       = useState<WordResult[] | null>(null);
  const [wordSearchLoading, setWordSearchLoading] = useState(false);
  const [wordSearchStats, setWordSearchStats]   = useState<{ total: number; at: number; nt: number } | null>(null);
  const fullBibleCache = useRef<Record<string, any>>({});

  const primaryColor = "var(--primary)";
  const jesusColor   = "#16a34a";

  // ── Livros de leitura (tradução selecionada) ─────────────────
  useEffect(() => { fetchBooks(); }, [translationId]);
  // ── Livros PT para metadados da busca (carregado uma vez) ────
  useEffect(() => {
    if (SEARCH_TRANSLATION_ID === translationId) return; // já carregado em allBooks
    fetch(`https://bible.helloao.org/api/${SEARCH_TRANSLATION_ID}/books.json`)
      .then(r => r.json()).then(d => setPtBooks(d.books || [])).catch(() => {});
  }, []);
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`https://bible.helloao.org/api/${translationId}/books.json`);
      const data = await res.json();
      setAllBooks(data.books || []);
    } catch (err: any) { console.error("ERRO BOOKS:", err); }
    finally { setLoading(false); }
  };

  // ── Capítulo ─────────────────────────────────────────
  useEffect(() => {
    if (view === "reading" && selectedBook) {
      fetchChapter();
      fetchHighlights();
      fetchFavorites();
      fetchVerseNotes();
    }
  }, [view, selectedBook, chapter, translationId]);
  const fetchChapter = async () => {
    try {
      setLoading(true);
      const mainUrl = `https://bible.helloao.org/api/${translationId}/${selectedBook.id}/${chapter}.json`;
      const isKjv   = translationId === "eng_kjv";
      let rawVerses: any[] = []; let jesusVerseNumbers = new Set<number>();

      if (isKjv) {
        const res = await fetch(mainUrl); const data = await res.json();
        rawVerses = data?.chapter?.content ?? [];
        jesusVerseNumbers = buildJesusVerseSet(rawVerses);
      } else {
        const [mainRes, kjvRes] = await Promise.allSettled([
          fetch(mainUrl),
          fetch(`https://bible.helloao.org/api/eng_kjv/${selectedBook.id}/${chapter}.json`),
        ]);
        if (mainRes.status === "fulfilled") { const d = await mainRes.value.json(); rawVerses = d?.chapter?.content ?? []; }
        if (kjvRes.status === "fulfilled")  { try { const d = await kjvRes.value.json(); jesusVerseNumbers = buildJesusVerseSet(d?.chapter?.content ?? []); } catch {} }
      }

      setProcessedVerses(processVerses(rawVerses, jesusVerseNumbers));
      setSelectedVerses([]);
      setShowColorPicker(false);
      window.scrollTo(0, 0);
    } catch (err) { console.error("ERRO CHAPTER:", err); }
    finally { setLoading(false); }
  };

  // ── Carregar highlights do banco para este capítulo ───
  const fetchHighlights = async () => {
    if (!selectedBook) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("bible_highlights")
        .select("verse, color")
        .eq("profile_id", user.id)
        .eq("book_id", selectedBook.id)
        .eq("chapter", chapter);
      if (data) {
        const map: Record<number, string> = {};
        data.forEach((h: any) => { map[h.verse] = h.color; });
        setHighlights(map);
      }
    } catch (err) { console.error("ERRO HIGHLIGHTS:", err); }
  };

  const fetchFavorites = async () => {
    if (!selectedBook) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("bible_favorites")
        .select("verse")
        .eq("profile_id", user.id)
        .eq("book_id", selectedBook.id)
        .eq("chapter", chapter);
      if (data) setFavorites(new Set(data.map((f: any) => f.verse)));
    } catch (err: any) { console.error("ERRO FAVORITOS:", err); }
  };

  const fetchVerseNotes = async () => {
    if (!selectedBook) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_notes")
        .select("verses")
        .eq("profile_id", user.id)
        .eq("book_id", selectedBook.id)
        .eq("chapter", chapter);
      
      const notedSet = new Set<number>();
      data?.forEach((n: any) => {
        if (Array.isArray(n.verses)) n.verses.forEach((v: number) => notedSet.add(v));
      });
      setVerseNotes(notedSet);
      setNotesData(data || []);

      // BUSCAR COMENTÁRIOS (Feature Separada)
      const { data: comments } = await supabase
        .from("bible_comments")
        .select("*")
        .eq("profile_id", user.id)
        .eq("book_id", selectedBook.id)
        .eq("chapter", chapter);
      
      const commentedSet = new Set<number>();
      comments?.forEach((c: any) => {
        if (Array.isArray(c.verses)) c.verses.forEach((v: number) => commentedSet.add(v));
      });
      setVerseComments(commentedSet);
      setCommentsData(comments || []);
    } catch (err: any) { console.error("ERRO FETCH INDICATOR:", err); }
  };

  const scrollToVerse = (vNum?: number) => {
    const num = vNum || parseInt(verseToScroll);
    if (!num) return;
    const el = document.getElementById(`verse-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setVerseToScroll("");
    }
  };

  // ── Salvar / remover highlight ────────────────────────
  const applyHighlight = async (color: string) => {
    if (!selectedBook || selectedVerses.length === 0) return;
    
    // 1. Atualização Otimista (Pintar imediatamente)
    const versesToMark = [...selectedVerses];
    setHighlights((prev) => {
      const next = { ...prev };
      versesToMark.forEach((v) => { next[v] = color; });
      return next;
    });
    setSelectedVerses([]);
    setShowColorPicker(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { console.warn("Membro não autenticado."); return; }

      // 🛑 AUTOCURA: Garantir que o perfil existe para evitar erro de FK
      await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });

      const rows = versesToMark.map((v) => ({
        profile_id: user.id,
        book_id: selectedBook.id,
        chapter,
        verse: v,
        color,
      }));

      const { data, error } = await supabase.from("bible_highlights").upsert(rows, { onConflict: "profile_id,book_id,chapter,verse" });
      if (error) throw error;
      console.log(`✅ ${versesToMark.length} versículos destacados com sucesso ministerial!`);
    } catch (err: any) { 
      console.error("ERRO CRUCIAL AO SALVAR DESTAQUE:", err.message);
      // Reverter se houver erro (opcional, mas bom para debug)
    }
  };

  const toggleFavorite = async () => {
    if (!selectedBook || selectedVerses.length === 0) return;
    
    const versesToToggle = [...selectedVerses];
    const isAdding = !versesToToggle.every(v => favorites.has(v));
    
    // Otimista
    setFavorites(prev => {
      const next = new Set(prev);
      versesToToggle.forEach(v => isAdding ? next.add(v) : next.delete(v));
      return next;
    });
    setSelectedVerses([]);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 🛑 AUTOCURA: Garantir que o perfil existe
      await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });

      if (isAdding) {
        const rows = versesToToggle.map(v => ({
          profile_id: user.id,
          book_id: selectedBook.id,
          chapter,
          verse: v
        }));
        const { error } = await supabase.from("bible_favorites").upsert(rows, { onConflict: "profile_id,book_id,chapter,verse" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bible_favorites").delete()
          .eq("profile_id", user.id)
          .eq("book_id", selectedBook.id)
          .eq("chapter", chapter)
          .in("verse", versesToToggle);
        if (error) throw error;
      }
      console.log("✅ Versículos favoritados salvos com sucesso!");
    } catch (err: any) {
      console.error("ERRO CRUCIAL FAVORITO:", err.message);
    }
  };

  const removeHighlight = async () => {
    if (!selectedBook || selectedVerses.length === 0) return;
    setShowColorPicker(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      for (const v of selectedVerses) {
        await supabase.from("bible_highlights").delete()
          .eq("profile_id", user.id).eq("book_id", selectedBook.id)
          .eq("chapter", chapter).eq("verse", v);
      }
      setHighlights((prev) => {
        const next = { ...prev };
        selectedVerses.forEach((v) => { delete next[v]; });
        return next;
      });
      setSelectedVerses([]);
    } catch (err: any) { console.error("ERRO REMOVER HIGHLIGHT:", err); }
  };

  // ── Busca de palavras ────────────────────────────────
  const handleWordSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    setWordSearchActive(true);
    setWordSearchLoading(true);
    setWordResults(null);
    setWordSearchStats(null);
    try {
      // Busca SEMPRE em português (por_onbv) — o app é para usuários brasileiros
      const booksForSearch = ptBooks.length > 0 ? ptBooks : allBooks;
      const { results, totalAT, totalNT } = await searchWordInBible(searchQuery, SEARCH_TRANSLATION_ID, booksForSearch, fullBibleCache);
      setWordResults(results);
      setWordSearchStats({ total: results.length, at: totalAT, nt: totalNT });
    } catch (err) { console.error("ERRO BUSCA:", err); }
    finally { setWordSearchLoading(false); }
  };

  const clearWordSearch = () => { setWordSearchActive(false); setWordResults(null); setWordSearchStats(null); };

  // ── Barra de ação — funções ───────────────────────────
  const getFormattedReference = () => {
    if (selectedVerses.length === 0) return "";
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = sorted[i];
        end = sorted[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return `${selectedBook?.name} ${chapter}:${ranges.join(",")}`;
  };

  const getSelectedVersesText = () => {
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const lines = processedVerses
      .filter((v) => v.type === "verse" && sorted.includes(v.number!))
      .map((v) => `${v.number} ${v.segments.map((s) => s.text).join("")}`);
    return lines.join(" ");
  };

  const openCreateNote = () => {
    const ref  = `${selectedBook?.id ?? "GEN"} ${chapter}:${selectedVerses.join(",")}`;
    const text = encodeURIComponent(getSelectedVersesText());
    router.push(`/notes?mode=new&ref=${encodeURIComponent(ref)}&text=${text}`);
  };

  const openCreatePost = () => {
    const text = getSelectedVersesText();
    const ref = getFormattedReference();
    const comment = commentContent.trim() ? `\n\n🕊️ Minha Reflexão:\n"${commentContent}"` : "";
    const citation = `📖 ${ref}\n\n"${text}"${comment}\n\n#EstudoBiblico #FeConecta`;
    router.push(`/feed/create?citation=${encodeURIComponent(citation)}`);
  };

  const shareSpecificComment = (comText: string, vNum: number) => {
    const text = filteredVerses.find(v => parseInt(v.number) === vNum)?.segments.map(s => s.text).join("") || "";
    const ref = `${selectedBook?.name} ${chapter}:${vNum}`;
    const citation = `📖 ${ref}\n\n"${text}"\n\n🕊️ Reflexão:\n"${comText}"`;
    router.push(`/feed/create?citation=${encodeURIComponent(citation)}`);
  };

  const handleShare = async () => {
    if (selectedVerses.length === 0) return;
    
    // 1. Preparar texto e ref
    const verseText = getSelectedVersesText();
    const reference = `${selectedBook?.name} ${chapter}:${selectedVerses.join(",")}`;
    
    // 2. Gerar Imagem no Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fundo Gradiente Deep Emerald
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, "#064e3b");
    grad.addColorStop(1, "#022c22");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Borda Dourada
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 20;
    ctx.strokeRect(60, 60, 960, 960);

    // Aspas decorativas
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.font = "bold 200px serif";
    ctx.fillText("“", 120, 240);

    // LOGO / Branding
    ctx.fillStyle = "#fbbf24";
    ctx.font = "800 32px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("FÉCONECTA", 540, 140);
    
    // Texto do Versículo
    ctx.fillStyle = "white";
    ctx.font = "italic 44px serif";
    const words = verseText.split(" ");
    let line = "";
    let y = 400;
    const maxWidth = 800;
    const lineHeight = 64;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 540, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    // Referência
    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 36px system-ui";
    ctx.fillText(reference, 540, y + 100);

    setShareImageData(canvas.toDataURL("image/png"));
    setIsShareModalOpen(true);
  };

  const finalNativeShare = async () => {
    try {
      if (!shareImageData) return;
      const res = await fetch(shareImageData);
      const blob = await res.blob();
      const file = new File([blob], 'versiculo.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Versículo do Dia — FéConecta',
          text: `"${selectedBook?.name} ${chapter}"`,
        });
      } else {
        const link = document.createElement('a');
        link.download = 'versiculo-feconecta.png';
        link.href = shareImageData;
        link.click();
      }
    } catch (err) { console.error(err); }
  };

  const saveComment = async () => {
    if (!commentContent.trim() || !selectedBook) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Autocura de perfil
      await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });

      const { error } = await supabase.from("bible_comments").insert([{
        profile_id: user.id,
        book_id: selectedBook.id,
        chapter,
        verses: selectedVerses,
        content: commentContent
      }]);

      if (error) throw error;
      setCommentContent("");
      setIsCommentModalOpen(false);
      setSelectedVerses([]);
      fetchVerseNotes(); // Atualizar ícones
    } catch (err) { console.error("ERRO SALVAR COMENTARIO:", err); }
  };

  const saveReply = async () => {
    if (!replyText.trim() || !selectedBook || showingThreadFor === null) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from("bible_comments").insert([{
        profile_id: user.id,
        book_id: selectedBook.id,
        chapter,
        verses: [showingThreadFor],
        content: replyText
      }]).select();

      if (error) throw error;
      
      setReplyText("");
      // Atualização local imediata da thread
      if (data) {
        setPreviewComments(prev => [...prev, data[0]]);
        setCommentsData(prev => [...prev, data[0]]);
      }
      fetchVerseNotes();
    } catch (err) { console.error("ERRO AO RESPONDER:", err); }
  };

  const updateBibleComment = async () => {
    if (!editingComment || !editingComment.content.trim()) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("bible_comments")
        .update({ content: editingComment.content })
        .eq("id", editingComment.id)
        .eq("profile_id", user.id);

      if (error) throw error;

      setPreviewComments(prev => prev.map(c => c.id === editingComment.id ? { ...c, content: editingComment.content } : c));
      setCommentsData(prev => prev.map(c => c.id === editingComment.id ? { ...c, content: editingComment.content } : c));
      setEditingComment(null);
    } catch (err) { console.error("ERRO AO EDITAR COMENTARIO:", err); }
  };

  const deleteBibleComment = async (id: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("bible_comments")
        .delete()
        .eq("id", id)
        .eq("profile_id", user.id);

      if (error) throw error;

      const updatedPreview = previewComments.filter(c => c.id !== id);
      setPreviewComments(updatedPreview);
      setCommentsData(prev => prev.filter(c => c.id !== id));
      
      if (updatedPreview.length === 0) {
         setShowingThreadFor(null);
      }
      fetchVerseNotes();
    } catch (err) { console.error("ERRO AO EXCLUIR COMENTARIO:", err); }
    finally { setIsDeletingComment(null); }
  };

  // ── Filtros ─────────────────────────────────────────
  const currentBooks = allBooks.filter((b) => {
    const isNew = b.order > 39;
    return (testament === "old" ? !isNew : isNew) && b.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const chapterCount = selectedBook?.numberOfChapters ?? 1;

  // ── Render ───────────────────────────────────────────
  return (
    <>
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 140px" }}>

      {/* HEADER */}
      <header style={{ padding: "32px 0 10px", background: "white", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: view === "reading" ? 10 : 16 }}>
          {view === "reading" && (
            <button onClick={() => setView("books")} style={{ background: "none", border: 0, cursor: "pointer" }}>
              <ChevronLeft size={24} color="#1f2937" />
            </button>
          )}
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1f2937", flex: 1 }}>Bíblia Sagrada</h1>
          <div style={{ position: "relative" }}>
            <select value={translationId} onChange={(e) => { setTranslationId(e.target.value); clearWordSearch(); }}
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 28px 6px 10px", fontSize: "13px", fontWeight: 700, color: primaryColor, background: "white", cursor: "pointer", outline: "none", appearance: "none" }}>
              {TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <ChevronDown size={14} color={primaryColor} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* NAV RÁPIDA — modo leitura */}
        {view === "reading" && selectedBook && (
          <div style={{ display: "flex", gap: 8, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <select value={selectedBook?.id ?? ""} onChange={(e) => { const b = allBooks.find((b) => b.id === e.target.value); if (b) { setSelectedBook(b); setChapter(1); } }}
                style={{ width: "100%", appearance: "none", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 36px 10px 14px", fontSize: "14px", fontWeight: 700, color: "#1f2937", background: "#f9fafb", cursor: "pointer", outline: "none" }}>
                {allBooks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <ChevronDown size={16} color="#9ca3af" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative", width: 110 }}>
              <select value={chapter} onChange={(e) => setChapter(Number(e.target.value))}
                style={{ width: "100%", appearance: "none", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 36px 10px 14px", fontSize: "14px", fontWeight: 700, color: "#1f2937", background: "#f9fafb", cursor: "pointer", outline: "none" }}>
                {Array.from({ length: chapterCount }, (_, i) => i + 1).map((n) => <option key={n} value={n}>Cap. {n}</option>)}
              </select>
              <ChevronDown size={16} color="#9ca3af" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative", width: 70 }}>
              <input 
                type="number" 
                placeholder="V." 
                value={verseToScroll}
                onChange={(e) => setVerseToScroll(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && scrollToVerse()}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 8px", fontSize: "14px", fontWeight: 700, color: "#1f2937", background: "white", textAlign: "center", outline: "none" }}
              />
            </div>
          </div>
        )}

        {/* BUSCA + ABAS — modo livros */}
        {view === "books" && (
          <>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input type="text" placeholder="Buscar livro ou palavra (ex: amor)..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (wordSearchActive) clearWordSearch(); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleWordSearch(); }}
                style={{ width: "100%", padding: "16px 110px 16px 24px", borderRadius: "32px", border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: "15px", outline: "none" }} />
              <div style={{ position: "absolute", right: 6, top: 6, display: "flex", gap: 4 }}>
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); clearWordSearch(); }}
                    style={{ width: 44, height: 44, borderRadius: "50%", background: "#f3f4f6", border: 0, display: "grid", placeItems: "center", cursor: "pointer" }}>
                    <X size={18} color="#6b7280" />
                  </button>
                )}
                <button onClick={handleWordSearch}
                  style={{ width: 44, height: 44, borderRadius: "50%", background: primaryColor, border: 0, display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <Search size={22} color="white" />
                </button>
              </div>
            </div>

            {/* Hint de busca por palavra */}
            {searchQuery.length >= 2 && !wordSearchActive && currentBooks.length === 0 && (
              <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                  Nenhum livro encontrado. Buscar &ldquo;{searchQuery}&rdquo; na Bíblia toda?
                </span>
                <button onClick={handleWordSearch} style={{ background: "#16a34a", color: "white", border: 0, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Buscar
                </button>
              </div>
            )}

            {!wordSearchActive && (
              <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                {(["old", "new"] as const).map((t) => (
                  <button key={t} onClick={() => setTestament(t)}
                    style={{ flex: 1, padding: "14px", background: "none", border: 0, borderBottom: testament === t ? `3px solid ${primaryColor}` : "0", color: testament === t ? primaryColor : "#9ca3af", fontWeight: 700, fontSize: "15px", transition: "0.2s" }}>
                    {t === "old" ? "Antigo Testamento" : "Novo Testamento"}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </header>

      {/* CONTEÚDO */}
      <div style={{ marginTop: 24 }}>

        {/* ── RESULTADO DE BUSCA POR PALAVRA ── */}
        {view === "books" && wordSearchActive && (
          <div>
            {wordSearchLoading && (
              <div style={{ textAlign: "center", padding: 60 }}>
                <Sparkles className="spin" color={primaryColor} style={{ display: "inline-block" }} />
                <p style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}>Buscando em toda a Bíblia…</p>
              </div>
            )}

            {!wordSearchLoading && wordSearchStats && (
              <>
                {/* Card de estatísticas */}
                <div style={{ background: "var(--primary)", borderRadius: 20, padding: 24, marginBottom: 24, color: "white" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, opacity: 0.85, fontFamily: "sans-serif" }}>
                    Resultados para &ldquo;<strong>{searchQuery}</strong>&rdquo; &middot; NBV (PT)
                  </p>
                  <p style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 900, fontFamily: "sans-serif" }}>
                    {wordSearchStats.total} {wordSearchStats.total === 1 ? "ocorrência" : "ocorrências"}
                  </p>
                  {wordSearchStats.total === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.9, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px" }}>
                      Nenhum resultado. A tradução <strong>{TRANSLATIONS.find(t => t.id === translationId)?.label}</strong> está em {translationId === "eng_kjv" ? "inglês" : "português"}. Troque a versão no seletor acima e busque novamente.
                    </p>
                  ) : (
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 700 }}>ANTIGO TESTAMENTO</div>
                        <div style={{ fontSize: 22, fontWeight: 900 }}>{wordSearchStats.at}</div>
                      </div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 700 }}>NOVO TESTAMENTO</div>
                        <div style={{ fontSize: 22, fontWeight: 900 }}>{wordSearchStats.nt}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de versículos */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {wordResults?.slice(0, 100).map((r, idx) => {
                    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
                    const parts = r.text.split(regex);
                    return (
                      <div key={idx}
                        onClick={() => {
                          const book = allBooks.find((b) => b.id === r.bookId);
                          if (book) { setSelectedBook(book); setChapter(r.chapter); setView("reading"); clearWordSearch(); setSearchQuery(""); }
                        }}
                        style={{ padding: "16px 20px", borderRadius: 16, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: primaryColor, background: "var(--primary-soft, #eff6ff)", padding: "3px 10px", borderRadius: 6 }}>
                            {r.bookName} {r.chapter}:{r.verse}
                          </span>
                          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
                            {r.isNewTestament ? "NT" : "AT"}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#374151", fontFamily: "Georgia, serif" }}>
                          {parts.map((part, pIdx) =>
                            regex.test(part) ? (
                              <mark key={pIdx} style={{ background: "#fef08a", padding: "0 2px", borderRadius: 3 }}>{part}</mark>
                            ) : (
                              <span key={pIdx}>{part}</span>
                            )
                          )}
                        </p>
                      </div>
                    );
                  })}
                  {(wordResults?.length ?? 0) > 100 && (
                    <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: 16 }}>
                      Mostrando 100 de {wordResults?.length} resultados. Refine sua busca para ver mais.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LISTA DE LIVROS ── */}
        {view === "books" && !wordSearchActive && (
          <>
            {loading && <div style={{ textAlign: "center", padding: 40 }}><Sparkles className="spin" color={primaryColor} /></div>}
            {!loading && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
                {currentBooks.map((book) => (
                  <button key={book.id} onClick={() => { setSelectedBook(book); setChapter(1); setView("reading"); }}
                    style={{ padding: "18px 0", background: "none", border: 0, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}>
                    <span style={{ fontWeight: 600, fontSize: "16px", color: "#374151" }}>{book.name}</span>
                    <span style={{ fontSize: "13px", color: "#9ca3af" }}>{book.numberOfChapters} cap.</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── LEITURA ── */}
        {view === "reading" && selectedBook && (
          <>
            {loading && <div style={{ textAlign: "center", padding: 60 }}><Sparkles className="spin" color={primaryColor} /></div>}
            {!loading && (
              <article style={{ lineHeight: 1.9, fontSize: "1.1rem", fontFamily: "Georgia, serif", color: "#1f2937" }}>
                <h3 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "26px", marginBottom: 20, color: "#111827" }}>
                  {selectedBook.name} {chapter}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "8px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: jesusColor, flexShrink: 0, display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "#15803d", fontFamily: "sans-serif", fontWeight: 600 }}>Falas de Jesus destacadas em verde</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {processedVerses.map((item, idx) => {
                    if (item.type === "heading") return <h4 key={idx} style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: "1rem", marginTop: 20, marginBottom: 4, color: "#4b5563" }}>{item.segments[0]?.text}</h4>;
                    if (item.type !== "verse") return null;
                    const isSelected = selectedVerses.includes(item.number!);
                    const hlColor    = highlights[item.number!];
                    const isFav      = favorites.has(item.number!);
                    return (
                      <div key={idx} onClick={() => setSelectedVerses((prev) => isSelected ? prev.filter((x) => x !== item.number) : [...prev, item.number!])}
                        style={{
                          padding: "6px 12px", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
                          background: isSelected ? "rgba(15, 118, 110, 0.15)" : hlColor ? hlColor + "CC" : "transparent",
                          borderLeft: hlColor && !isSelected ? `5px solid ${hlColor}` : isSelected ? `5px solid var(--primary)` : "5px solid transparent",
                          display: "block",
                          marginBottom: 4,
                          position: "relative"
                        }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                           <div style={{ flex: 1 }}>
                              <sup style={{ color: primaryColor, fontWeight: 900, marginRight: 8, fontSize: "0.75rem" }}>{item.number}</sup>
                              {item.segments.map((seg, sIdx) =>
                                seg.isJesus
                                  ? <span key={sIdx} style={{ color: jesusColor, fontWeight: 600 }}>{seg.text}</span>
                                  : <span key={sIdx}>{seg.text}</span>
                              )}
                           </div>
                            {isFav && <Star size={12} fill="#fbbf24" color="#fbbf24" style={{ marginTop: 4, marginLeft: 8 }} />}
                            {verseNotes.has(item.number!) && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const note = notesData.find(n => n.verses?.includes(item.number));
                                    if (note) setPreviewNote(note);
                                  }}
                                  style={{ border: 0, background: "none", cursor: "pointer", display: "inline-flex", verticalAlign: "middle", marginLeft: 8 }}
                                >
                                  <StickyNote size={14} color={primaryColor} />
                                </button>
                             )}
                             {verseComments.has(item.number!) && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const comms = commentsData.filter(c => c.verses?.includes(item.number));
                                    if (comms.length > 0) {
                                       setPreviewComments(comms);
                                       setShowingThreadFor(item.number!);
                                    }
                                  }}
                                  style={{ border: 0, background: "none", cursor: "pointer", display: "inline-flex", verticalAlign: "middle", marginLeft: 4 }}
                                >
                                  <MessageSquare size={14} color="#16a34a" />
                                </button>
                             )}
                         </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
                  <button disabled={chapter <= 1} onClick={() => setChapter((c) => c - 1)}
                    style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid #e5e7eb", background: chapter <= 1 ? "#f9fafb" : "white", color: chapter <= 1 ? "#9ca3af" : "#1f2937", fontWeight: 700, cursor: chapter <= 1 ? "not-allowed" : "pointer", fontSize: "14px" }}>
                    ← Cap. {chapter - 1}
                  </button>
                  <button disabled={chapter >= chapterCount} onClick={() => setChapter((c) => c + 1)}
                    style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid #e5e7eb", background: chapter >= chapterCount ? "#f9fafb" : "white", color: chapter >= chapterCount ? "#9ca3af" : "#1f2937", fontWeight: 700, cursor: chapter >= chapterCount ? "not-allowed" : "pointer", fontSize: "14px" }}>
                    Cap. {chapter + 1} →
                  </button>
                </div>
              </article>
            )}
          </>
        )}
      </div>

      {/* BARRA DE AÇÃO */}
      {selectedVerses.length > 0 && (
        <>
          {/* Color Picker Popup */}
          {showColorPicker && (
            <div style={{ position: "fixed", bottom: 204, left: "50%", transform: "translateX(-50%)", background: "#064e3b", borderRadius: 20, padding: "16px 20px", zIndex: 1001, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: 12, width: 260 }}>
              <span style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Escolha uma cor</span>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                {HIGHLIGHT_COLORS.map((c) => (
                  <button key={c.hex} onClick={() => applyHighlight(c.hex)} title={c.name}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: c.hex, border: "3px solid transparent", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", transition: "transform 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                ))}
              </div>
              <button onClick={removeHighlight} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#f87171", fontSize: 12, fontWeight: 700, padding: "8px 0", cursor: "pointer" }}>
                ✕ Remover destaque
              </button>
            </div>
          )}

          {/* Barra principal */}
          <div style={{ position: "fixed", bottom: 120, left: "50%", transform: "translateX(-50%)", width: "92%", background: "#022c22", padding: "16px 24px", borderRadius: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1000, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: "13px" }}>{selectedVerses.length} versículo{selectedVerses.length > 1 ? "s" : ""}</span>
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => setShowColorPicker((p) => !p)} title="Destacar"
                style={{ background: showColorPicker ? "rgba(255,255,255,0.1)" : "none", border: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRadius: 10, padding: "4px 8px" }}>
                <Highlighter size={18} color="#fbbf24" />
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>MARCAR</span>
              </button>
              <button onClick={toggleFavorite} title="Favoritar" style={{ background: "none", border: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Star size={18} fill={selectedVerses.every(v => favorites.has(v)) ? "#fbbf24" : "none"} color="#fbbf24" />
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>AMAR</span>
              </button>
               <button onClick={openCreateNote} title="Criar Nota" style={{ background: "none", border: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <StickyNote size={18} color="white" />
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>NOTA</span>
              </button>
              <button onClick={() => setIsCommentModalOpen(true)} title="Comentar Versículo" style={{ background: "none", border: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <MessageSquare size={18} color="white" />
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>COMENTAR</span>
              </button>
              <button onClick={openCreatePost} title="Criar Publicação" style={{ background: "none", border: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <PlusCircle size={18} color="white" />
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>POST</span>
              </button>
              <button onClick={handleShare} title="Compartilhar" style={{ background: "none", border: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Share2 size={18} color="white" />
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>SHARE</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>

    {/* MODAL DE COMPARTILHAMENTO ESTILIZADO */}
    {isShareModalOpen && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 3000, display: "grid", placeItems: "center", padding: 20 }}>
         <div className="card animate-in" style={{ width: "100%", maxWidth: 400, padding: 24, borderRadius: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
               <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Compartilhar Luz</h2>
               <button onClick={() => setIsShareModalOpen(false)} style={{ background: "none", border: 0 }}><X size={20}/></button>
            </div>
            
            <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
               <img src={shareImageData!} alt="Preview" style={{ width: "100%", display: "block" }} />
            </div>

            <div style={{ display: "grid", gap: 12 }}>
               <button onClick={finalNativeShare} className="button" style={{ width: "100%", padding: 16, borderRadius: 16, background: "var(--primary)", color: "white", fontWeight: 700, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <Share2 size={18} /> Enviar para WhatsApp / Insta
               </button>
               <button onClick={() => {
                 const a = document.createElement('a'); a.download = 'versiculo.png'; a.href = shareImageData!; a.click();
               }} style={{ width: "100%", padding: 12, borderRadius: 16, background: "var(--line)", border: 0, color: "var(--muted)", fontWeight: 700 }}>
                  Baixar Imagem
               </button>
            </div>
         </div>
      </div>
    )}

    {/* MODAL DE PREVIEW DA NOTA / COMENTÁRIO */}
    {previewNote && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 3000, display: "grid", placeItems: "center", padding: 20 }}>
         <div className="card animate-in-up" style={{ width: "100%", maxWidth: 450, padding: 24, borderRadius: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary-soft)", display: "grid", placeItems: "center" }}>
                     <StickyNote size={20} color="var(--primary)" />
                  </div>
                  <div>
                     <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Sua Reflexão</h3>
                     <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>{selectedBook?.name} {chapter}:{previewNote.verses?.join(",")}</span>
                  </div>
               </div>
               <button onClick={() => setPreviewNote(null)} style={{ background: "none", border: 0 }}><X size={20}/></button>
            </div>
            
            <div style={{ background: "#f8fafc", padding: 20, borderRadius: 20, marginBottom: 24, border: "1px solid #f1f5f9" }}>
               <h4 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800 }}>{previewNote.title || "Sem título"}</h4>
               <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{previewNote.content}</p>
            </div>

            <button onClick={() => { router.push(`/notes?mode=edit&id=${previewNote.id}`); setPreviewNote(null); }} style={{ width: "100%", padding: 14, borderRadius: 16, background: "var(--primary)", color: "white", fontWeight: 700, border: 0 }}>
               Editar Reflexão Completa
            </button>
         </div>
      </div>
    )}
     {/* MODAL DE COMENTÁRIO (DIRETO) */}
    {isCommentModalOpen && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 3000, display: "grid", placeItems: "center", padding: 20 }}>
         <div className="card animate-in" style={{ width: "100%", maxWidth: 450, padding: 24, borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
               <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Comentar Versículo</h2>
               <button onClick={() => setIsCommentModalOpen(false)} style={{ background: "none", border: 0 }}><X size={20}/></button>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, fontWeight: 700 }}>
               {getFormattedReference()}
            </p>
            <textarea 
               autoFocus
               placeholder="Ex: Culto de domingo, PR Leandro Silva... ou sua reflexão devocional."
               value={commentContent}
               onChange={(e) => setCommentContent(e.target.value)}
               style={{ width: "100%", height: 120, borderRadius: 16, border: "1px solid var(--line)", padding: 12, fontSize: 14, outline: "none", background: "#f8fafc", marginBottom: 20, resize: "none" }}
            ></textarea>
            <button onClick={saveComment} className="button" style={{ width: "100%", padding: 14, borderRadius: 16, background: "var(--primary)", color: "white", fontWeight: 700 }}>
               Salvar Comentário
            </button>
         </div>
      </div>
    )}
    {/* MODAL DE THREAD DE COMENTÁRIOS (ESTILO EXCEL/SHEETS) */}
    {showingThreadFor !== null && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 3000, display: "grid", placeItems: "center", padding: 20 }}>
         <div className="card animate-in-up" style={{ width: "100%", maxWidth: 450, borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh", border: "2px solid #9333ea" }}>
            <div style={{ padding: "16px 20px", background: "white", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Comentários: {selectedBook?.name} {chapter}:{showingThreadFor}</h3>
               <button onClick={() => setShowingThreadFor(null)} style={{ background: "none", border: 0 }}><X size={20}/></button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#f8fafc", display: "flex", flexDirection: "column", gap: 16 }}>
               {previewComments.map((com) => (
                  <div key={com.id} style={{ background: "white", padding: 16, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#9333ea" }}>Você (Ministério)</span>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                           <button onClick={() => shareSpecificComment(com.content, showingThreadFor!)} style={{ background: "none", border: 0, color: "var(--primary)", cursor: "pointer" }} title="Compartilhar Estudo"><PlusCircle size={14}/></button>
                           <button onClick={() => setEditingComment({ id: com.id, content: com.content })} style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer" }}><Highlighter size={12}/></button>
                           <button onClick={() => setIsDeletingComment(com.id)} style={{ background: "none", border: 0, color: "#ef4444", cursor: "pointer" }}><X size={12}/></button>
                           <span style={{ fontSize: 10, color: "var(--muted)" }}>{new Date(com.created_at).toLocaleDateString()}</span>
                        </div>
                     </div>
                     {editingComment && editingComment.id === com.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                           <textarea 
                             autoFocus
                             value={editingComment.content} 
                             onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                             style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--primary)", fontSize: 14, outline: "none", resize: "none" }}
                           />
                           <div style={{ display: "flex", gap: 8 }}>
                              <Button variant="primary" size="sm" onClick={updateBibleComment} style={{ flex: 1 }}>Salvar</Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingComment(null)} style={{ flex: 1 }}>Cancelar</Button>
                           </div>
                        </div>
                     ) : (
                        <p style={{ margin: 0, fontSize: 14, color: "#1e293b", lineHeight: 1.5 }}>{com.content}</p>
                     )}
                  </div>
               ))}
            </div>

            <div style={{ padding: 16, background: "white", borderTop: "1px solid #f1f5f9" }}>
               <div style={{ display: "flex", gap: 10 }}>
                  <input 
                    type="text" 
                    placeholder="Responder..." 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveReply()}
                    style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "1px solid var(--line)", background: "#f8fafc", fontSize: 13, outline: "none" }}
                  />
                  <button onClick={saveReply} style={{ width: 40, height: 40, borderRadius: 10, background: "#9333ea", color: "white", border: 0, display: "grid", placeItems: "center" }}>
                     <ChevronRight size={20} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    )}

    {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE COMENTÁRIO */}
    {isDeletingComment && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 4000, display: "grid", placeItems: "center", padding: 20 }}>
         <div className="card animate-in-up" style={{ width: "100%", maxWidth: 350, padding: 24, borderRadius: 24, textAlign: "center" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 900 }}>Excluir Comentário?</h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>Esta ação não pode ser desfeita. Deseja remover sua reflexão ministerial?</p>
            <div style={{ display: "flex", gap: 12 }}>
               <Button variant="ghost" style={{ flex: 1 }} onClick={() => setIsDeletingComment(null)}>Cancelar</Button>
               <Button variant="danger" style={{ flex: 1 }} onClick={() => deleteBibleComment(isDeletingComment)}>Excluir</Button>
            </div>
         </div>
      </div>
    )}
    </>
  );
}
