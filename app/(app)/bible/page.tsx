"use client";

import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Search,
  Sparkles,
  Highlighter,
  StickyNote,
  PlusCircle,
  Share2
} from "lucide-react";

export default function BiblePage() {
  const [view, setView] = useState<"books" | "chapters" | "reading">("books");
  const [testament, setTestament] = useState<"old" | "new">("old");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dados da API
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  const translationId = "por_onbv"; 
  const primaryColor = "var(--primary)";

  // 1. Carregar lista de livros
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const url = `https://bible.helloao.org/api/${translationId}/books.json`;
      const res = await fetch(url);
      const data = await res.json();
      setAllBooks(data.books || []);
    } catch (err) {
      console.error("ERRO BOOKS:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Carregar conteúdo do capítulo
  useEffect(() => {
    if (view === "reading" && selectedBook) {
      fetchBibleChapter();
    }
  }, [view, selectedBook, chapter]);

  const fetchBibleChapter = async () => {
    try {
      setLoading(true);
      const url = `https://bible.helloao.org/api/${translationId}/${selectedBook.id}/${chapter}.json`;
      const res = await fetch(url);
      const data = await res.json();
      // O conteúdo real fica em data.chapter.content
      setVerses(data.chapter?.content || []);
      setSelectedVerses([]);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("ERRO CHAPTER:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentBooks = allBooks.filter(b => {
    const isNew = b.order > 39;
    const matchesTestament = testament === "old" ? !isNew : isNew;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 140px" }}>
      
      {/* 🔴 HEADER MODELO MOBILE */}
      <header style={{ padding: "32px 0 10px", background: "white", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          {view !== "books" && (
            <button onClick={() => setView(view === "reading" ? "chapters" : "books")} style={{ background: "none", border: 0, cursor: "pointer" }}>
               <ChevronLeft size={24} color="#1f2937" />
            </button>
          )}
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1f2937" }}>Bíblia Sagrada</h1>
        </div>

        {view === "books" && (
          <>
            <div style={{ position: "relative", marginBottom: 32 }}>
              <input 
                type="text" 
                placeholder="Buscar por palavra na Bíblia..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: "100%", padding: "16px 60px 16px 24px", borderRadius: "32px", 
                  border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: "15px", outline: "none" 
                }} 
              />
              <button style={{ 
                position: "absolute", right: 6, top: 6, width: 44, height: 44, 
                borderRadius: "50%", background: primaryColor, border: 0, display: "grid", placeItems: "center" 
              }}>
                <Search size={22} color="white" />
              </button>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
              <button 
                onClick={() => setTestament("old")}
                style={{ 
                  flex: 1, padding: "14px", background: "none", border: 0, borderBottom: testament === "old" ? `3px solid ${primaryColor}` : "0",
                  color: testament === "old" ? primaryColor : "#9ca3af", fontWeight: 700, fontSize: "15px", transition: "0.2s"
                }}
              >
                Antigo Testamento
              </button>
              <button 
                onClick={() => setTestament("new")}
                style={{ 
                  flex: 1, padding: "14px", background: "none", border: 0, borderBottom: testament === "new" ? `3px solid ${primaryColor}` : "0",
                  color: testament === "new" ? primaryColor : "#9ca3af", fontWeight: 700, fontSize: "15px", transition: "0.2s"
                }}
              >
                Novo Testamento
              </button>
            </div>
          </>
        )}
      </header>

      {/* 🔴 GRID DE SELEÇÃO OU ÁREA DE LEITURA */}
      <div style={{ marginTop: 24 }}>
        {loading && view === "books" && <div style={{ textAlign: "center", padding: 40 }}><Sparkles className="spin" color={primaryColor} /></div>}

        {view === "books" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
            {currentBooks.map(book => (
              <button 
                key={book.id} 
                onClick={() => { setSelectedBook(book); setView("chapters"); }}
                style={{ 
                  padding: "18px 0", background: "none", border: 0, display: "flex", justifyContent: "space-between", 
                  alignItems: "center", borderBottom: "1px solid #f3f4f6", cursor: "pointer" 
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "16px", color: "#374151" }}>{book.name}</span>
                <ChevronRight size={18} color="#d1d5db" />
              </button>
            ))}
          </div>
        )}

        {view === "chapters" && selectedBook && (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: 32, fontSize: "20px", fontWeight: 800 }}>{selectedBook.name}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {Array.from({ length: selectedBook.numberOfChapters }, (_, i) => i + 1).map(num => (
                <button 
                  key={num} 
                  onClick={() => { setChapter(num); setView("reading"); }}
                  style={{ 
                    padding: "16px 0", borderRadius: "12px", border: "1px solid #e5e7eb", 
                    background: "white", fontWeight: 800, fontSize: "14px"
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "reading" && selectedBook && (
          <article style={{ lineHeight: 1.8, fontSize: "1.15rem", fontFamily: "serif", color: "#1f2937" }}>
             <h3 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "28px", marginBottom: 32 }}>{selectedBook.name} {chapter}</h3>
             
             {loading ? (
                <div style={{ textAlign: "center", padding: 60 }}><Sparkles className="spin" color={primaryColor} /></div>
             ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {verses.map((item: any, idx) => {
                    const text = Array.isArray(item.content) ? item.content.join("") : item.content;
                    
                    if (item.type === "heading") {
                      return <h4 key={idx} style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: "1.1rem", marginTop: 24, marginBottom: 8, color: "#4b5563" }}>{text}</h4>;
                    }

                    const isSelected = selectedVerses.includes(item.number);

                    return (
                      <span 
                        key={idx} 
                        onClick={() => setSelectedVerses(prev => isSelected ? prev.filter(x => x !== item.number) : [...prev, item.number])}
                        style={{ 
                          padding: "4px 8px", borderRadius: "8px", cursor: "pointer",
                          background: isSelected ? "var(--primary-soft)" : "transparent",
                          transition: "0.2s"
                        }}
                      >
                        <sup style={{ color: primaryColor, fontWeight: 900, marginRight: 8, fontSize: "0.75rem" }}>{item.number}</sup>
                        {text}
                      </span>
                    );
                  })}
                </div>
             )}
          </article>
        )}
      </div>

       {/* Ações Rápidas */}
       {selectedVerses.length > 0 && (
        <div style={{ 
          position: "fixed", bottom: 120, left: "50%", transform: "translateX(-50%)", width: "92%", 
          background: "#111827", padding: "16px 24px", borderRadius: "24px", display: "flex", 
          justifyContent: "space-between", alignItems: "center", zIndex: 1000, boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
        }}>
           <span style={{ color: "white", fontWeight: 700, fontSize: "13px" }}>{selectedVerses.length} selecionados</span>
           <div style={{ display: "flex", gap: 16 }}>
              <button style={{ background: "none", border: 0 }}><Highlighter size={20} color="#facc15" /></button>
              <button style={{ background: "none", border: 0 }}><StickyNote size={20} color="#10b981" /></button>
              <button style={{ background: "none", border: 0 }}><PlusCircle size={20} color={primaryColor} /></button>
              <button style={{ background: "none", border: 0 }}><Share2 size={20} color="white" /></button>
           </div>
        </div>
      )}
    </div>
  );
}
