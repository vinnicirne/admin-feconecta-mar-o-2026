"use client";

import { useState, useEffect } from "react";
import { 
  Book as BookIcon, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Type, 
  Highlighter, 
  StickyNote, 
  Share2, 
  PlusCircle,
  MoreVertical,
  ArrowRight,
  Bookmark,
  Sparkles,
  Search,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

// --- CONFIGURAÇÃO DA BÍBLIA (HELLO AO API) ---
const TRANSLATIONS = [
  { id: "nvi", label: "Nova Versão Internacional (NVI)" },
  { id: "acf", label: "Almeida Corrigida Fiel (ACF)" },
  { id: "ara", label: "Almeida Revista e Atualizada (ARA)" }
];

export default function BiblePage() {
  const [translation, setTranslation] = useState("nvi");
  const [book, setBook] = useState("GEN"); // Gênesis padrão
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado de Seleção
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // --- BUSCAR CAPÍTULO DA BÍBLIA ---
  useEffect(() => {
    fetchBibleChapter();
  }, [translation, book, chapter]);

  const fetchBibleChapter = async () => {
    try {
      setLoading(true);
      const url = `https://bible.helloao.org/api/v1/translations/${translation}/books/${book}/chapters/${chapter}.json`;
      const res = await fetch(url);
      const data = await res.json();
      setVerses(data.chapter?.verses || []);
      setSelectedVerses([]); // Resetar seleção ao mudar capítulo
    } catch (err) {
      console.error("ERRO AO CARREGAR BÍBLIA:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerseSelection = (num: number) => {
    if (selectedVerses.includes(num)) {
      setSelectedVerses(selectedVerses.filter(v => v !== num));
    } else {
      setSelectedVerses([...selectedVerses, num]);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 120px" }}>
      
      {/* 🔴 HEADER DE NAVEGAÇÃO BÍBLICA */}
      <header style={{ 
        padding: "20px 0", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        zIndex: 110,
        borderBottom: "1px solid var(--line)"
      }}>
        <div 
          onClick={() => setIsSelectorOpen(true)}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            cursor: "pointer",
            padding: "8px 16px",
            background: "var(--line)",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 16
          }}
        >
           <BookIcon size={18} className="primary" /> {book} {chapter} <ChevronRight size={16} className="muted" />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
           <button style={{ width: 44, height: 44, borderRadius: 12, border: 0, background: "var(--line)", display: "grid", placeItems: "center" }}><Search size={20} /></button>
           <button style={{ width: 44, height: 44, borderRadius: 12, border: 0, background: "var(--line)", display: "grid", placeItems: "center" }}><Settings size={20} /></button>
        </div>
      </header>

      {/* 🔴 ÁREA DE LEITURA (TIER 1 TYPOGRAPHY) */}
      <div style={{ paddingTop: 40 }}>
        {loading ? (
           <div style={{ textAlign: "center", padding: 80 }}><Sparkles size={32} className="spin primary" /></div>
        ) : (
          <article style={{ lineHeight: 2, fontSize: "1.2rem", color: "#2d3748", fontFamily: "serif" }}>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 900, marginBottom: 44, fontFamily: "var(--font-inter)", color: "black", borderLeft: "6px solid var(--primary)", paddingLeft: 24 }}>Capítulo {chapter}</h1>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0 8px" }}>
              {verses.map((v: any, idx: number) => (
                <span 
                  key={idx} 
                  onClick={() => toggleVerseSelection(v.number)}
                  style={{ 
                    cursor: "pointer", 
                    padding: "4px 4px", 
                    borderRadius: 6,
                    background: selectedVerses.includes(v.number) ? "var(--primary-soft)" : "transparent",
                    transition: "all 0.2s ease"
                  }}
                >
                  <sup style={{ fontSize: 11, fontWeight: 900, marginRight: 6, color: "var(--primary)", opacity: 0.8 }}>{v.number}</sup>
                  {v.content}
                </span>
              ))}
            </div>
          </article>
        )}
      </div>

      {/* 🔴 MENU DE AÇÕES: CONEXÃO DIRETA (FIXO AO SELECIONAR) */}
      {selectedVerses.length > 0 && (
        <div style={{ 
          position: "fixed", 
          bottom: 120, 
          left: "50%", 
          transform: "translateX(-50%)", 
          width: "90%", 
          maxWidth: 480, 
          background: "black", 
          color: "white", 
          padding: "16px 24px", 
          borderRadius: 24, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          zIndex: 150 
        }}>
           <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedVerses.length} versículos</div>
           
           <div style={{ display: "flex", gap: 12 }}>
              <ActionButton icon={Highlighter} color="#facc15" label="Marcar" />
              <ActionButton icon={StickyNote} color="#10b981" label="Criar Nota" />
              <ActionButton icon={PlusCircle} color="#6366f1" label="Criar Post" />
              <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.2)" }}></div>
              <ActionButton icon={Share2} color="white" label="Imagem" />
           </div>
        </div>
      )}

      {/* 🔴 SELETOR DE LIVROS/CAPÍTULOS (ESTILO DRAWER/MODAL) */}
      {isSelectorOpen && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 200,
          display: "grid", placeItems: "center"
        }}>
           <div className="card" style={{ width: "90%", maxWidth: 400, padding: 32, borderRadius: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                 <h3>Selecione o Trecho</h3>
                 <button onClick={() => setIsSelectorOpen(false)} style={{ background: "none", border: 0 }}><XIcon size={20} /></button>
              </div>
              
              <div style={{ maxHeight: 400, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                 {["GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JUI", "RUT"].map(b => (
                   <button 
                     key={b} 
                     onClick={() => { setBook(b); setIsSelectorOpen(false); }}
                     style={{ padding: 12, borderRadius: 12, border: "1px solid var(--line)", background: book === b ? "var(--primary)" : "white", color: book === b ? "white" : "black", fontWeight: 700 }}
                   >
                     {b}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// Auxiliares
function ActionButton({ icon: Icon, color, label }: any) {
  return (
    <button style={{ 
      background: "none", border: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" 
    }}>
       <div style={{ color }}>
          <Icon size={20} strokeWidth={2.5} />
       </div>
       <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>{label}</span>
    </button>
  );
}

function XIcon({ size }: any) { return <ChevronLeft size={size} />; }
function XIcon2({ size }: any) { return <Search size={size} />; }
