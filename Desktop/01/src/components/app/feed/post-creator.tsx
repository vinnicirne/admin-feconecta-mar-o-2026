"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ CORREÇÃO: Importação faltante
import { 
  Type, 
  Image as ImageIcon, 
  Camera, 
  Mic, 
  X, 
  Smile, 
  Bold, 
  Italic, 
  Underline, 
  Highlighter, 
  Palette,
  Send,
  Sparkles,
  ChevronDown,
  Trash2,
  Play,
  Square,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export function PostCreator({ forceExpanded }: { forceExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(forceExpanded || false);

  useEffect(() => {
    if (forceExpanded) setIsExpanded(true);
  }, [forceExpanded]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<{ file: File, url: string, type: 'image' | 'video' | 'audio' } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const router = useRouter(); 
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const [activeStyles, setActiveStyles] = useState({ bold: false, italic: false });
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [selectedBg, setSelectedBg] = useState("transparent");

  const backgrounds = ["transparent", "#f0fdf4", "#eff6ff", "#fff7ed", "linear-gradient(135deg, #10b981 0%, #059669 100%)"];

  // --- FUNÇÕES DE HARDWARE ---
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      setMedia({ file, url, type });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const file = new File(chunks, `audio_${Date.now()}.ogg`, { type: 'audio/ogg' });
        setMedia({ file, url: URL.createObjectURL(file), type: 'audio' });
        setIsRecording(false);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Permissão de áudio negada.");
    }
  };

  const stopRecording = () => mediaRecorder.current?.stop();

  // --- LÓGICA DE UPLOAD E POSTAGEM REAL ---
  const handleShare = async () => {
    if (!text && !media) return;
    setIsUploading(true);

    try {
        let mediaUrl = null;

        // 1. UPLOAD DA MÍDIA (STORAGE)
        if (media) {
            const fileExt = media.file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${Date.now()}_${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('posts')
                .upload(filePath, media.file);

            if (uploadError) throw uploadError;

            // Pegar Link Público
            const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(filePath);
            const formData = new FormData();
            formData.append('file', media.file);
            formData.append('type', media.type);

            const response = await fetch('/api/upload-media', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload media');
            }

            const data = await response.json();
            mediaUrl = data.publicUrl;
        }

        // 3. Persistir Post com Segurança Inviolável (Server Action Proxy)
      const res = await createPostAction({
        content: text,
        image_url: mediaUrl,
        media_type: media?.type || 'text',
        background_style: selectedBg,
        font_family: selectedFont,
        is_bold: activeStyles.bold,
        is_italic: activeStyles.italic,
        status: 'published' // Always published from client
      });

      if (!res.success) throw new Error(res.error);

        // Sucesso Ministerial
        setText("");
        setMedia(null);
        setIsExpanded(false);
        router.refresh();
        window.location.reload(); // Forçar atualização visual do feed
    } catch (err: any) {
        console.error("ERRO MINISTERIAL:", err);
        alert(`Erro: ${err.message || 'Verifique se rodou o SQL de storage e de evolução.'}`);
    } finally {
        setIsUploading(false);
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className="card" 
        onClick={() => setIsExpanded(true)}
        style={{ 
          padding: "16px 20px", borderRadius: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
          marginBottom: 24, border: "1px solid var(--line)", background: "white"
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)" }}></div>
        <span className="muted" style={{ fontSize: 15, fontWeight: 500 }}>O que Deus colocou no seu coração hoje?</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
           <ImageIcon size={20} className="muted" />
           <Camera size={20} className="muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 24, borderRadius: 32, marginBottom: 32, border: "2px solid var(--primary-soft)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
      {/* Inputs Ocultos */}
      <input type="file" ref={galleryRef} onChange={handleFile} hidden accept="image/*,video/*" />
      <input type="file" ref={cameraRef} onChange={handleFile} hidden accept="image/*,video/*" capture="environment" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
         <button onClick={() => setIsExpanded(false)} style={{ background: "none", border: 0, cursor: "pointer" }}><X size={20} /></button>
         <button onClick={handleShare} disabled={isUploading} className="button" style={{ padding: "10px 28px", borderRadius: 12, fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
           {isUploading ? <Loader2 size={18} className="spin" /> : null}
           {isUploading ? "Enviando..." : "Compartilhar"}
         </button>
      </div>

      <div style={{ 
        background: selectedBg, minHeight: 160, borderRadius: 20, padding: 24, 
        border: selectedBg === "transparent" ? "1px solid var(--line)" : "0",
        color: selectedBg.includes("linear-gradient") ? "white" : "inherit",
        position: "relative"
      }}>
        <textarea 
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Escreva sua mensagem de fé..." 
          style={{ 
            width: "100%", height: "100%", background: "none", border: 0, outline: "none", resize: "none",
            fontSize: "1.2rem", fontWeight: activeStyles.bold ? "800" : "500",
            fontStyle: activeStyles.italic ? "italic" : "normal",
            fontFamily: selectedFont === "Serif" ? "serif" : "var(--font-inter)", color: "inherit"
          }}
        />

        {media && (
          <div style={{ marginTop: 16, position: "relative" }}>
            {media.type === 'image' && <img src={media.url} style={{ width: "100%", borderRadius: 16, maxHeight: 300, objectFit: "cover" }} />}
            {media.type === 'video' && <video src={media.url} controls style={{ width: "100%", borderRadius: 16, maxHeight: 300 }} />}
            {media.type === 'audio' && (
              <div style={{ background: "rgba(0,0,0,0.05)", padding: 12, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <Play size={16} /> Áudio Devocional Pronto
              </div>
            )}
            <button onClick={() => setMedia(null)} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", color: "white", border: 0, width: 24, height: 24, borderRadius: "50%", cursor: "pointer" }}>
               <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
         <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setActiveStyles({...activeStyles, bold: !activeStyles.bold})} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid var(--line)", background: activeStyles.bold ? "var(--line)" : "white" }}>B</button>
            <button onClick={() => setActiveStyles({...activeStyles, italic: !activeStyles.italic})} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid var(--line)", background: activeStyles.italic ? "var(--line)" : "white" }}>I</button>
            <button onClick={() => setSelectedBg(backgrounds[Math.floor(Math.random()*backgrounds.length)])} style={{ padding: "0 10px", height: 34, borderRadius: 8, border: "1px solid var(--line)", background: "white", fontSize: 11, fontWeight: 700 }}>🎨 Fundo</button>
         </div>
         <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} style={{ height: 34, borderRadius: 8, border: "1px solid var(--line)", fontSize: 11, fontWeight: 700 }}>
            <option value="Inter">Inter</option>
            <option value="Serif">Serif</option>
         </select>
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", gap: 16 }}>
         <button onClick={() => galleryRef.current?.click()} style={{ flex: 1, padding: "12px", borderRadius: 12, border: 0, background: "#f0fdf4", color: "#166534", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <ImageIcon size={18} /> Galeria
         </button>
         <button onClick={() => cameraRef.current?.click()} style={{ flex: 1, padding: "12px", borderRadius: 12, border: 0, background: "#f5f3ff", color: "#5b21b6", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Camera size={18} /> Câmera
         </button>
         <button onClick={isRecording ? stopRecording : startRecording} style={{ flex: 1, padding: "12px", borderRadius: 12, border: 0, background: isRecording ? "#fee2e2" : "#fff1f2", color: "#991b1b", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {isRecording ? <Square size={16} /> : <Mic size={18} />} {isRecording ? "Parar" : "Áudio"}
         </button>
      </div>
    </div>
  );
}
