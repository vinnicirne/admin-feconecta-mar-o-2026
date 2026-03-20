"use client";

import { useState, useEffect } from "react";
import { 
  Book as BookIcon, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Search,
  Sparkles,
  Highlighter,
  StickyNote,
  PlusCircle,
  Share2
} from "lucide-react";

// --- DADOS BÍBLICOS COMPLETOS (IDs COMPATÍVEIS COM HELLOAO API) ---
const OLD_TESTAMENT = [
  { id: "GEN", name: "Gênesis" }, { id: "EXO", name: "Êxodo" }, { id: "LEV", name: "Levítico" },
  { id: "NUM", name: "Números" }, { id: "DEU", name: "Deuteronômio" }, { id: "JOS", name: "Josué" },
  { id: "JDG", name: "Juízes" }, { id: "RUT", name: "Rute" }, { id: "1SA", name: "1 Samuel" },
  { id: "2SA", name: "2 Samuel" }, { id: "1KI", name: "1 Reis" }, { id: "2KI", name: "2 Reis" },
  { id: "1CH", name: "1 Crônicas" }, { id: "2CH", name: "2 Crônicas" }, { id: "EZR", name: "Esdras" },
  { id: "NEH", name: "Neemias" }, { id: "EST", name: "Ester" }, { id: "JOB", name: "Jó" },
  { id: "PSA", name: "Salmos" }, { id: "PRO", name: "Provérbios" }, { id: "ECC", name: "Eclesiastes" },
  { id: "SNG", name: "Cantares" }, { id: "ISA", name: "Isaías" }, { id: "JER", name: "Jeremias" },
  { id: "LAM", name: "Lamentações" }, { id: "EZK", name: "Ezequiel" }, { id: "DAN", name: "Daniel" },
  { id: "HOS", name: "Oseias" }, { id: "JOL", name: "Joel" }, { id: "AMO", name: "Amós" },
  { id: "OBA", name: "Obadias" }, { id: "JON", name: "Jonas" }, { id: "MIC", name: "Miqueias" },
  { id: "NAM", name: "Naum" }, { id: "HAB", name: "Habacuque" }, { id: "ZEP", name: "Sofonias" },
  { id: "HAG", name: "Ageu" }, { id: "ZEC", name: "Zacarias" }, { id: "MAL", name: "Malaquias" }
];

const NEW_TESTAMENT = [
  { id: "MAT", name: "Mateus" }, { id: "MRK", name: "Marcos" }, { id: "LUK", name: "Lucas" },
  { id: "JHN", name: "João" }, { id: "ACT", name: "Atos" }, { id: "ROM", name: "Romanos" },
  { id: "1CO", name: "1 Coríntios" }, { id: "2CO", name: "2 Coríntios" }, { id: "GAL", name: "Gálatas" },
  { id: "EPH", name: "Efésios" }, { id: "PHP", name: "Filipenses" }, { id: "COL", name: "Colossenses" },
  { id: "1TH", name: "1 Tessalonicenses" }, { id: "2TH", name: "2 Tessalonicenses" },
  { id: "1TI", name: "1 Timóteo" }, { id: "2TI", name: "2 Timóteo" }, { id: "TIT", name: "Tito" },
  { id: "PHM", name: "Filemon" }, { id: "HEB", name: "Hebreus" }, { id: "JAS", name: "Tiago" },
  { id: "1PE", name: "1 Pedro" }, { id: "2PE", name: "2 Pedro" }, { id: "1JN", name: "1 João" },
  { id: "2JN", name: "2 João" }, { id: "3JN", name: "3 João" }, { id: "JUD", name: "Judas" },
  { id: "REV", name: "Apocalipse" }
];

export default function BiblePage() {
  const [view, setView] = useState<"books" | "chapters" | "reading">("books");
  const [testament, setTestament] = useState<"old" | "new">("old");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  const primaryColor = "var(--primary)";

  // Buscar detalhes do livro ao selecionar
  useEffect(() => {
    if (selectedBook && view === "chapters") {
      fetchBookDetails();
    }
  }, [selectedBook, view]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const url = `https://bible.helloao.org/api/v1/translations/nvi/books/${selectedBook.id}.json`;
      const res = await fetch(url);
      const data = await res.json();
      setBookDetails(data.book);
    } catch (err) {
      console.error("ERRO BOOK:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar versículos ao navegar para leitura
  useEffect(() => {
    if (view === "reading" && selectedBook) {
      fetchBibleChapter();
    }
  }, [view, selectedBook, chapter]);

  const fetchBibleChapter = async () => {
    try {
      setLoading(true);
      const url = `https://bible.helloao.org/api/v1/translations/nvi/books/${selectedBook.id}/chapters/${chapter}.json`;
      const res = await fetch(url);
      const data = await res.json();
      setVerses(data.chapter?.verses || []);
    } catch (err) {
      console.error("ERRO VERSES:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentBooks = testament === "old" ? OLD_TESTAMENT : NEW_TESTAMENT;
  const filteredBooks = currentBooks.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
        {view === "books" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
            {filteredBooks.map(book => (
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
            <h2 style={{ marginBottom: 32, fontSize: "20px" }}>{selectedBook.name}</h2>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}><Sparkles className="spin" color={primaryColor} /></div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                {bookDetails?.chapters.map((ch: any) => (
                  <button 
                    key={ch.number} 
                    onClick={() => { setChapter(ch.number); setView("reading"); }}
                    style={{ 
                      padding: "16px 0", borderRadius: "12px", border: "1px solid #e5e7eb", 
                      background: "white", fontWeight: 800, fontSize: "14px"
                    }}
                  >
                    {ch.number}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "reading" && selectedBook && (
          <article style={{ lineHeight: 2, fontSize: "1.2rem", fontFamily: "serif" }}>
             <h3 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "28px", marginBottom: 32 }}>{selectedBook.name} {chapter}</h3>
             
             {loading ? (
                <div style={{ textAlign: "center", padding: 60 }}><Sparkles className="spin" color={primaryColor} /></div>
             ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 8px" }}>
                  {verses.map(v => (
                    <span 
                      key={v.number} 
                      onClick={() => setSelectedVerses(prev => prev.includes(v.number) ? prev.filter(x => x !== v.number) : [...prev, v.number])}
                      style={{ 
                        padding: "2px 4px", borderRadius: "6px",
                        background: selectedVerses.includes(v.number) ? "var(--primary-soft)" : "transparent"
                      }}
                    >
                      <sup style={{ color: primaryColor, fontWeight: 900, marginRight: 5 }}>{v.number}</sup> {v.content}
                    </span>
                  ))}
                </div>
             )}
          </article>
        )}
      </div>

       {/* Ações Rápidas ao selecionar */}
       {selectedVerses.length > 0 && (
        <div style={{ 
          position: "fixed", bottom: 120, left: "50%", transform: "translateX(-50%)", width: "90%", 
          background: "black", padding: "16px 24px", borderRadius: "24px", display: "flex", 
          justifyContent: "space-between", alignItems: "center", zIndex: 1000 
        }}>
           <span style={{ color: "white", fontWeight: 700, fontSize: "13px" }}>{selectedVerses.length} versículos</span>
           <div style={{ display: "flex", gap: 12 }}>
              <ActionButton icon={Highlighter} color="#facc15" />
              <ActionButton icon={StickyNote} color="#10b981" />
              <ActionButton icon={PlusCircle} color={primaryColor} />
              <ActionButton icon={Share2} color="white" />
           </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, color }: any) {
  return (
    <button style={{ background: "none", border: 0, padding: 4 }}>
      <Icon size={20} color={color} />
    </button>
  );
}
