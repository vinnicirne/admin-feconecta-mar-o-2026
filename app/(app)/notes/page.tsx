"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { 
  Plus, Search, Tag, Calendar, BookOpen, Star, ChevronRight, ArrowLeft, Save, Sparkles, Lock, Globe, Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function NotesContent() {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'recent' | 'themes' | 'bible' | 'favorites'>('recent');
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  
  const supabase = useMemo(() => createClient(), []);

  // Estados do Editor
  const [currentNote, setCurrentNote] = useState({ 
    title: "", 
    content: "", 
    tags: [] as string[], 
    is_private: true,
    book_id: "GEN",
    chapter: 1,
    verses: [] as number[]
  });

  // Carregar nota vinda da Bíblia (via SearchParams)
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'new') {
      const ref  = searchParams.get('ref') || "";
      const text = searchParams.get('text') || "";
      
      const match = ref.match(/([A-Z0-9]{3})\s+(\d+):?([\d,]*)/);
      const book_id = match?.[1] || "GEN";
      const chapter = parseInt(match?.[2] || "1");
      const verses  = (match?.[3] || "").split(',').map(n => parseInt(n)).filter(n => !isNaN(n));
      
      setCurrentNote({
        title: ref ? `Reflexão: ${ref}` : "",
        content: text ? `"${text}"\n\n` : "",
        tags: [],
        is_private: true,
        book_id,
        chapter,
        verses
      });
      setEditingId(null);
      setView('editor');
    }
  }, [searchParams]);

  useEffect(() => {
    if (view === 'list') fetchNotes();
  }, [view]);

  const fetchNotes = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setNotes([]); return; }

      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error("ERRO NAS NOTAS:", err);
    } finally {
      setLoading(false);
    }
  };

  const openNote = (note: any) => {
    setCurrentNote({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      is_private: note.is_private,
      book_id: note.book_id,
      chapter: note.chapter,
      verses: note.verses || []
    });
    setEditingId(note.id);
    setView('editor');
  };

  const saveNote = async () => {
    if (!currentNote.content || !supabase) return;
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("É necessário estar logado."); return; }

      // 🛑 AUTOCURA: Perfil
      await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });

      const payload = {
        profile_id: user.id,
        title: currentNote.title,
        content: currentNote.content,
        book_id: currentNote.book_id,
        chapter: currentNote.chapter,
        verses: currentNote.verses,
        is_private: currentNote.is_private,
        tags: currentNote.tags
      };

      if (editingId) {
        const { error } = await supabase.from('user_notes').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_notes').insert([payload]);
        if (error) throw error;
      }
      
      setView('list');
      resetEditor();
    } catch (err) {
      console.error(err);
      alert("Erro ministerial ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!editingId || !supabase) return;
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;
    try {
      const { error } = await supabase.from('user_notes').delete().eq('id', editingId);
      if (error) throw error;
      setView('list');
      resetEditor();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir nota.");
    }
  };

  const toggleNoteFavorite = async (e: React.MouseEvent, note: any) => {
    e.stopPropagation();
    if (!supabase) return;
    try {
      const nextFav = !note.is_favorite;
      const { error } = await supabase.from('user_notes').update({ is_favorite: nextFav }).eq('id', note.id);
      if (error) throw error;
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_favorite: nextFav } : n));
    } catch (err) { console.error(err); }
  };

  const filteredNotes = notes.filter(n => {
    if (filter === 'favorites') return n.is_favorite;
    if (filter === 'themes') return n.tags && n.tags.length > 0;
    if (filter === 'bible') return n.book_id && n.chapter;
    return true; // recent (default)
  });

  const resetEditor = () => {
    setCurrentNote({ title: "", content: "", tags: [], is_private: true, book_id: "GEN", chapter: 1, verses: [] });
    setEditingId(null);
  };

  if (view === 'editor') {
    return (
      <div style={{ padding: "20px 24px 100px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
           <button onClick={() => setView('list')} style={{ background: "none", border: 0, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <ArrowLeft size={18} /> Voltar
           </button>
           <div style={{ display: "flex", gap: 12 }}>
              {editingId && (
                <button onClick={deleteNote} style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", display: "grid", placeItems: "center" }}>
                   <Trash2 size={18} />
                </button>
              )}
              <button onClick={saveNote} disabled={isSaving} className="button" style={{ padding: "10px 24px", borderRadius: 12, fontSize: 13, background: "var(--primary)", color: "white", opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? <Sparkles size={16} className="spin" /> : <Save size={16} style={{ marginRight: 8 }} />} 
                  {isSaving ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
               </button>
           </div>
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
              <Tag size={14} /> {currentNote.book_id} {currentNote.chapter}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
         <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Minhas Notas</h1>
         <button onClick={() => { resetEditor(); setView('editor'); }} className="button" style={{ width: 44, height: 44, borderRadius: "12px", background: "var(--primary)", border: 0, color: "white", display: "grid", placeItems: "center" }}>
            <Plus size={24} />
         </button>
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 20 }} className="hide-scroll">
         <FilterTab icon={Calendar} label="Recentes" active={filter === 'recent'} onClick={() => setFilter('recent')} />
         <FilterTab icon={Tag} label="Temas" active={filter === 'themes'} onClick={() => setFilter('themes')} />
         <FilterTab icon={BookOpen} label="Pela Bíblia" active={filter === 'bible'} onClick={() => setFilter('bible')} />
         <FilterTab icon={Star} label="Favoritos" active={filter === 'favorites'} onClick={() => setFilter('favorites')} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
           <div style={{ textAlign: "center", padding: 40 }}><Sparkles size={24} className="spin muted" /></div>
        ) : filteredNotes.length === 0 ? (
           <div style={{ textAlign: "center", padding: 60, border: "2px dashed var(--line)", borderRadius: 32 }}>
              <BookOpen size={32} className="muted" />
              <p className="muted" style={{ marginTop: 12 }}>Nenhuma nota ministerial nesta categoria.</p>
           </div>
        ) : filteredNotes.map(note => (
          <div key={note.id} onClick={() => openNote(note)} className="card" style={{ padding: 20, borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
             <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                   <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 10px", background: "var(--primary-soft)", color: "var(--primary)", borderRadius: 6 }}>
                      {note.book_id ? `${note.book_id} ${note.chapter}` : "Nota Geral"}
                   </span>
                   <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{note.title || "Sem título"}</h3>
                <p className="muted" style={{ margin: "4px 0 0", fontSize: 13, lineClamp: 1, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{note.content}</p>
             </div>
             <button onClick={(e) => toggleNoteFavorite(e, note)} style={{ background: "none", border: 0, padding: 8 }}>
                <Star size={20} fill={note.is_favorite ? "#fbbf24" : "none"} color={note.is_favorite ? "#fbbf24" : "var(--muted)"} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}><Sparkles size={24} className="spin muted" /></div>}>
      <NotesContent />
    </Suspense>
  );
}

function FilterTab({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ 
      display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: 0, 
      background: active ? "var(--primary)" : "white", color: active ? "white" : "#64748b",
      fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer",
      boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
    }}>
       <Icon size={16} /> {label}
    </button>
  );
}
