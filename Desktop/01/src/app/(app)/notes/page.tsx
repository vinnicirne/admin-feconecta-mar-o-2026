"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Tag, 
  Calendar, 
  BookOpen, 
  Star, 
  MoreVertical, 
  Lock, 
  Globe,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Check,
  Save,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NotesPage() {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Editor
  const [currentNote, setCurrentNote] = useState({ title: "", content: "", tags: [] as string[], is_private: true });

  useEffect(() => {
    if (view === 'list') fetchNotes();
  }, [view]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data: profile, error: pError } = await supabase.from('profiles').select('id').limit(1).single();
      
      if (pError || !profile) {
        console.warn("PERFIL NÃO ENCONTRADO: Carregando notas vazias ministeriais.");
        setNotes([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error("ERRO NAS NOTAS:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!currentNote.content) return;
    try {
      // 1. Verificar quem está logado de verdade (Zelo Ministerial)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
         alert("É necessário comunhão ativa (Login) para salvar notas pessoais.");
         return;
      }

      const { error } = await supabase.from('user_notes').insert([{
        ...currentNote,
        profile_id: user.id, // Conectado à alma e identidade real do usuário
        book_id: 'GEN', 
        chapter: 1
      }]);
      
      if (error) throw error;
      setView('list');
      setCurrentNote({ title: "", content: "", tags: [], is_private: true });
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar nota ministerial. Verifique sua conexão e perfil.");
    }
  };

  if (view === 'editor') {
    return (
      <div style={{ padding: "20px 24px 100px", maxWidth: 640, margin: "0 auto" }}>
        {/* Editor Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
           <button onClick={() => setView('list')} style={{ background: "none", border: 0, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <ArrowLeft size={18} /> Voltar
           </button>
           <button onClick={saveNote} className="button" style={{ padding: "10px 24px", borderRadius: 12, fontSize: 13, background: "var(--primary)", color: "white" }}>
              <Save size={16} style={{ marginRight: 8 }} /> Salvar Nota
           </button>
        </div>

        <input 
          type="text" 
          placeholder="Título da sua reflexão..." 
          value={currentNote.title}
          onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
          style={{ width: "100%", fontSize: "1.8rem", fontWeight: 900, border: 0, outline: "none", marginBottom: 20, background: "none" }}
        />

        <div style={{ display: "flex", gap: 12, marginBottom: 24, padding: "12px", background: "var(--line)", borderRadius: 12 }}>
           <button onClick={() => setCurrentNote({...currentNote, is_private: !currentNote.is_private})} style={{ border: 0, background: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800 }}>
              {currentNote.is_private ? <Lock size={14} /> : <Globe size={14} />} 
              {currentNote.is_private ? "PRIVADA" : "PÚBLICA (APP)"}
           </button>
           <div style={{ width: 1, background: "rgba(0,0,0,0.1)" }}></div>
           <button style={{ border: 0, background: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800 }}>
              <Tag size={14} /> ADICIONAR TAG
           </button>
        </div>

        <textarea 
          placeholder="Escreva o que Deus falou com você hoje..." 
          value={currentNote.content}
          onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
          style={{ width: "100%", height: 400, border: 0, outline: "none", fontSize: "1.1rem", lineHeight: 1.6, resize: "none", background: "none" }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px 120px" }}>
      
      {/* 🔴 HEADER DAS NOTAS (UNISSEX) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
         <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Minhas Notas</h1>
         <button onClick={() => setView('editor')} className="button" style={{ width: 44, height: 44, borderRadius: "12px", background: "var(--primary)", border: 0, color: "white", display: "grid", placeItems: "center" }}>
            <Plus size={24} />
         </button>
      </div>

      {/* 🔴 FILTROS RÁPIDOS */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 20 }} className="hide-scroll">
         <FilterTab icon={Calendar} label="Recentes" active />
         <FilterTab icon={Tag} label="Temas" />
         <FilterTab icon={BookOpen} label="Pela Bíblia" />
         <FilterTab icon={Star} label="Favoritos" />
      </div>

      {/* 🔴 LISTA DE NOTAS MINISTERIAIS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
           <div style={{ textAlign: "center", padding: 40 }}><Sparkles size={24} className="spin muted" /></div>
        ) : notes.length === 0 ? (
           <div style={{ textAlign: "center", padding: 60, border: "2px dashed var(--line)", borderRadius: 32 }}>
              <StickyNoteIcon size={32} className="muted" />
              <p className="muted" style={{ marginTop: 12 }}>Nenhuma nota ministerial ainda.<br/>Que tal começar um devocional hoje?</p>
           </div>
        ) : notes.map(note => (
          <div key={note.id} className="card" style={{ padding: 20, borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                   <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 10px", background: "var(--primary-soft)", color: "var(--primary)", borderRadius: 6 }}>
                      {note.book_id} {note.chapter}
                   </span>
                   <span className="muted" style={{ fontSize: 11 }}>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>{note.title || "Reflexão Ministerial"}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 13, lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {note.content}
                </p>
             </div>
             <ChevronRight size={20} className="muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Auxiliares
function FilterTab({ icon: Icon, label, active }: any) {
  return (
    <div style={{ 
      padding: "10px 20px", borderRadius: 14, background: active ? "var(--primary)" : "var(--line)", 
      color: active ? "white" : "var(--muted)", fontWeight: 800, fontSize: 12,
      display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", cursor: "pointer"
    }}>
       <Icon size={16} /> {label}
    </div>
  );
}

function StickyNoteIcon({ size, className }: any) { return <BookOpen size={size} className={className} />; }
function XIcon({ size }: any) { return <Search size={size} />; }
