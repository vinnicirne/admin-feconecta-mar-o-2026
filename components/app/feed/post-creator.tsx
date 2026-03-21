"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ImageIcon,
  Video,
  Mic,
  Sparkles,
  Heart,
  MessageCircle,
  Eye,
  Settings,
  X,
  Play,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createPostAction } from "@/app/actions/post-actions";

type PostType = "compartilhar" | "edificar" | "oracao";

const colors = {
  primary: "#059669",
  primaryDark: "#065f46",
  primaryLight: "#10b981",
  bg: "#ecfdf5",
  text: "#064e3b",
};

export function PostCreator({ forceExpanded, initialCitation }: { forceExpanded?: boolean; initialCitation?: string }) {
  const [isExpanded, setIsExpanded] = useState(forceExpanded || !!initialCitation || false);
  const [postType, setPostType] = useState<PostType>("oracao");
  const [text, setText] = useState(initialCitation ?? "");
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (forceExpanded || initialCitation) setIsExpanded(true);
  }, [forceExpanded, initialCitation]);

  const greenGradient = `
    radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent),
    radial-gradient(circle at bottom left, #064e3b, #022c22)
  `;

  const handlePublish = async () => {
    if (!text.trim()) {
      alert("Escreva algo antes de publicar 🙏");
      return;
    }
    setIsPublishing(true);
    try {
      const res = await createPostAction({
        content: text,
        media_type: 'text',
        background_style: greenGradient,
        status: 'published'
      });

      if (!res.success) throw new Error(res.error);

      setText("");
      setIsExpanded(false);
      router.refresh();
      window.location.reload(); 
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className="card" 
        onClick={() => setIsExpanded(true)}
        style={{ 
          padding: "16px 20px", borderRadius: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
          marginBottom: 24, border: "1px solid #d1fae5", background: "white"
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.primary }}></div>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#6b7280" }}>O que Deus colocou no seu coração hoje?</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
           <ImageIcon size={20} color="#94a3b8" />
           <Mic size={20} color="#94a3b8" />
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-in" style={{ padding: 24, borderRadius: 32, marginBottom: 32, border: `2px solid #d1fae5`, background: "white", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
         <button onClick={() => setIsExpanded(false)} style={{ background: "none", border: 0, cursor: "pointer", color: colors.text }}><X size={20} /></button>
         <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: colors.text }}>Novo Post</h3>
         <button 
           onClick={handlePublish} 
           disabled={isPublishing || !text} 
           style={{ 
             background: colors.primary, color: "white", border: 0, borderRadius: 10, 
             padding: "8px 20px", fontWeight: 700, fontSize: 14,
             opacity: (isPublishing || !text) ? 0.6 : 1
           }}
         >
           {isPublishing ? <Loader2 size={18} className="spin" /> : "Publicar"}
         </button>
      </div>

      {/* TYPE SELECTOR */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <TypeBtn label="🙏 Compartilhar" active={postType === "compartilhar"} onClick={() => setPostType("compartilhar")} />
        <TypeBtn label="📖 Edificar" active={postType === "edificar"} onClick={() => setPostType("edificar")} />
        <TypeBtn label="🤝 Oração" active={postType === "oracao"} onClick={() => setPostType("oracao")} />
      </div>

      {/* INPUT */}
      <div style={{ background: "#f8fafc", borderRadius: 20, padding: 20, border: "1px solid #e2e8f0" }}>
        <textarea 
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Escreva sua mensagem de fé..." 
          style={{ 
            width: "100%", height: 120, background: "none", border: 0, outline: "none", resize: "none",
            fontSize: "1.05rem", color: colors.text, fontWeight: "500"
          }}
        />

        {/* TOOLBAR */}
        <div style={{ display: "flex", gap: 16, marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: colors.text, cursor: "pointer" }}>Aa</span>
            <ImageIcon size={20} color={colors.primary} style={{ cursor: "pointer" }} />
            <Video size={20} color={colors.primary} style={{ cursor: "pointer" }} />
            <Mic size={20} color={colors.primary} style={{ cursor: "pointer" }} />
            <Sparkles size={20} color="#f59e0b" style={{ cursor: "pointer" }} />
        </div>
      </div>

      {/* AUDIO MOCK (PREMIUM LOOK) */}
      <div style={{ marginTop: 12, background: "#f8fafc", padding: 12, borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Play size={16} fill={colors.text} />
          <div style={{ flex: 1, height: 6, background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`, borderRadius: 10, opacity: 0.3 }}></div>
          <button style={{ background: "#f59e0b", color: "white", border: 0, borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 800 }}>MUDAR</button>
        </div>
      </div>

      {/* PREVIEW */}
      <div style={{ marginTop: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: colors.text, textTransform: "uppercase", letterSpacing: 1 }}>Preview Ministerial</span>
        <div style={{ 
          marginTop: 10, padding: 32, borderRadius: 24, background: greenGradient, 
          color: "white", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12
        }}>
           <h2 style={{ fontSize: 20, fontWeight: 900, fontStyle: "italic", margin: 0 }}>
             {postType === "oracao" ? "Preciso de oração agora..." : postType === "edificar" ? "Uma palavra para você..." : "Testemunho de Fé"}
           </h2>
           <div style={{ height: 1, background: "rgba(255,255,255,0.2)", width: 80 }}></div>
           <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.9, margin: 0 }}>
             {text || "Sua mensagem de fé aparecerá aqui para edificar a comunidade..."}
           </p>
           
           <button style={{ 
             marginTop: 12, background: "linear-gradient(135deg, #10b981, #065f46)", border: 0, 
             borderRadius: 100, padding: "10px 24px", fontWeight: 800, color: "white" 
           }}>
             {postType === "oracao" ? "🙏 Orar por Mim" : "Amém"}
           </button>

           <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", gap: 12, marginTop: 12, fontSize: 12, opacity: 0.8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Heart size={14} fill="#ef4444" color="#ef4444" /> 128</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><MessageCircle size={14} /> 34</div>
           </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontWeight: 700, color: colors.text, fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Eye size={16} /> Público</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Settings size={16} /> Opções</div>
      </div>
    </div>
  );
}

function TypeBtn({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 4px",
        borderRadius: 12,
        fontWeight: 800,
        fontSize: 10,
        border: active ? 0 : "1px solid #d1fae5",
        background: active ? "linear-gradient(135deg, #10b981, #065f46)" : "white",
        color: active ? "white" : "#064e3b",
        whiteSpace: "nowrap",
        transition: "0.2s"
      }}
    >
      {label}
    </button>
  );
}
