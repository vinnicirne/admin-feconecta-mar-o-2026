"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette, X, Type, Bold, Italic } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const BACKGROUNDS = [
  "transparent",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #059669 0%, #064e3b 100%)", // Edificar
  "#1a1a2e",
  "#2d3436"
];

const FONTS = [
  { name: "Serif", family: "Georgia, serif" },
  { name: "Sans", family: "'Inter', sans-serif" },
  { name: "Mono", family: "monospace" },
  { name: "Script", family: "cursive" }
];

interface TextEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string; background_style: string; font_family: string; media_type: "text" }) => void;
  initialContent?: string;
  initialBackground?: string;
}

export default function TextEditorModal({ open, onClose, onSubmit, initialContent = "", initialBackground = "transparent" }: TextEditorModalProps) {
  const [content, setContent] = useState(initialContent);
  const [bg, setBg] = useState(initialBackground);
  const [font, setFont] = useState(FONTS[1].family);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setBg(initialBackground);
    }
  }, [open, initialContent, initialBackground]);

  const handleSubmit = async () => {
    if (!content || content.trim() === "<p><br></p>") return;
    
    setIsPublishing(true);
    try {
      await onSubmit({ 
        content, 
        background_style: bg, 
        font_family: font,
        media_type: "text" 
      });
      setContent("");
      setBg("transparent");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"]
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 600, borderRadius: 32, padding: "32px 24px" }}>
        <DialogHeader>
          <DialogTitle style={{ textAlign: "center", width: "100%" }}>✍️ Edificar com Palavras</DialogTitle>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Background Picker */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "block" }}>
               <Palette size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Estilo de Fundo
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BACKGROUNDS.map((b, i) => (
                <button
                  key={i}
                  onClick={() => setBg(b)}
                  style={{
                    width: 36, height: 36, borderRadius: 10, background: b === "transparent" ? "#f1f5f9" : b,
                    border: bg === b ? "3px solid var(--primary)" : "2px solid transparent",
                    cursor: "pointer", transition: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: bg === b ? "scale(1.1)" : "scale(1)",
                    boxShadow: bg === b ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
                  }}
                  title={b === "transparent" ? "Padrão" : "Colorido"}
                >
                  {b === "transparent" && <X size={14} color="#94a3b8" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Picker */}
          <div>
             <span style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "block" }}>
                <Type size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Fonte Ministerial
             </span>
             <div style={{ display: "flex", gap: 8 }}>
                {FONTS.map(f => (
                  <button 
                    key={f.name} 
                    onClick={() => setFont(f.family)}
                    style={{ 
                      flex: 1, padding: "8px", borderRadius: 10, border: font === f.family ? "2px solid var(--primary)" : "1px solid var(--line)",
                      background: font === f.family ? "var(--primary-soft)" : "white", color: font === f.family ? "var(--primary)" : "var(--muted)",
                      fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: f.family
                    }}
                  >
                    {f.name}
                  </button>
                ))}
             </div>
          </div>

          {/* Editor Container */}
          <div 
            style={{ 
              borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)", minHeight: 180, 
              background: bg === "transparent" ? "white" : bg,
              transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Semeie uma palavra..."
              style={{ 
                minHeight: 180, border: 0, 
                color: bg === "transparent" ? "inherit" : "white",
                fontFamily: font
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="outline" style={{ flex: 1, height: 50, borderRadius: 16 }} onClick={onClose}>Cancelar</Button>
            <Button variant="primary" loading={isPublishing} style={{ flex: 2, height: 50, borderRadius: 16 }} onClick={handleSubmit}>
              Publicar Mensagem
            </Button>
          </div>

        </div>

        <style>{`
          .quill .ql-toolbar { border: 0 !important; border-bottom: 1px solid var(--line) !important; padding: 12px !important; background: white !important; }
          .quill .ql-container { border: 0 !important; font-size: 16px !important; }
          .quill .ql-editor { padding: 20px !important; min-height: 150px !important; }
          .quill .ql-editor.ql-blank::before { color: ${bg === "transparent" ? "#94a3b8" : "rgba(255,255,255,0.6)"} !important; }
          .quill .ql-snow.ql-toolbar button { height: 28px !important; width: 32px !important; }
          .quill .ql-stroke { stroke: var(--muted) !important; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
