"use client";

import { useState, Suspense } from "react";
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
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";

type PostType = "compartilhar" | "edificar" | "oracao";

const colors = {
  primary: "#059669",
  primaryDark: "#065f46",
  primaryLight: "#10b981",
  bg: "#ecfdf5",
  text: "#064e3b",
};

function CreatePostContent() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>("oracao");
  const [text, setText] = useState("");

  const greenGradient = `
    radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent),
    radial-gradient(circle at bottom left, #064e3b, #022c22)
  `;

  const handlePublish = () => {
    if (!text.trim()) {
      alert("Escreva algo antes de publicar 🙏");
      return;
    }
    router.push("/feed");
  };

  return (
    <div style={{ background: colors.bg, minHeight: "100vh", paddingBottom: 120 }}>
      
      {/* HEADER */}
      <header
        style={{
          background: "white",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid #d1fae5",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <button onClick={() => router.back()} style={btnGhost}>
          <ChevronLeft size={18} /> Voltar
        </button>

        <h1 style={{ fontWeight: 800, color: colors.text, fontSize: 16 }}>
          Novo Post
        </h1>

        <button
          onClick={handlePublish}
          style={{
            background: colors.primary,
            color: "white",
            border: 0,
            borderRadius: 10,
            padding: "8px 16px",
            fontWeight: 700,
          }}
        >
          Publicar
        </button>
      </header>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
        
        {/* TYPE SELECTOR */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <TypeBtn label="🙏 Compartilhar" active={postType === "compartilhar"} onClick={() => setPostType("compartilhar")} />
          <TypeBtn label="📖 Edificar" active={postType === "edificar"} onClick={() => setPostType("edificar")} />
          <TypeBtn label="🤝 Oração" active={postType === "oracao"} onClick={() => setPostType("oracao")} />
        </div>

        {/* INPUT */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <textarea
            placeholder="O que Deus colocou no seu coração hoje?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              height: 140,
              border: 0,
              outline: "none",
              resize: "none",
              fontSize: 15,
              color: colors.text,
            }}
          />

          {/* TOOLBAR */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 12,
              borderTop: "1px solid #ecfdf5",
              paddingTop: 12,
            }}
          >
            <IconBtn label="Aa" />
            <IconBtn><ImageIcon size={20} color={colors.primary} /></IconBtn>
            <IconBtn><Video size={20} color={colors.primary} /></IconBtn>
            <IconBtn><Mic size={20} color={colors.primary} /></IconBtn>
            <IconBtn><Sparkles size={20} color="#f59e0b" /></IconBtn>
          </div>
        </div>

        {/* AUDIO MOCK */}
        <div style={audioBox}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12 }}>▶</span>
            <div style={wave} />
            <button style={btnGold}>Gerar Legenda</button>
          </div>
          <div style={time}>00:12 / 02:00</div>
        </div>

        {/* PREVIEW */}
        <div style={{ marginTop: 24 }}>
          <span style={label}>Preview</span>

          <div
            style={{
              marginTop: 10,
              padding: 24,
              borderRadius: 24,
              background: greenGradient,
              color: "white",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 800, fontStyle: "italic" }}>
              {postType === "oracao" ? "Preciso de oração agora..." : postType === "edificar" ? "Uma palavra para você..." : "Testemunho de Fé"}
            </h2>

            <div style={divider} />

            <p style={{ opacity: 0.9, fontSize: 15, lineHeight: 1.5 }}>
              {text || "Ore pela minha família, estamos passando por um momento difícil."}
            </p>

            <button style={prayBtn}>
              {postType === "oracao" ? "🙏 Orar por Mim" : postType === "edificar" ? "📖 Amém" : "🙏 Glória a Deus"}
            </button>

            <div style={stats}>
              <Stat icon={<Heart size={14} color="#ef4444" />} value="128" />
              <Stat icon={<MessageCircle size={14} />} value="34" />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={footer}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Eye size={16} /> Público</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Settings size={16} /> Opções</div>
        </div>

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
        padding: "10px",
        borderRadius: 12,
        fontWeight: 700,
        fontSize: 11,
        border: active ? 0 : "1px solid #d1fae5",
        background: active
          ? "linear-gradient(135deg, #10b981, #065f46)"
          : "white",
        color: active ? "white" : "#065f46",
        whiteSpace: "nowrap"
      }}
    >
      {label}
    </button>
  );
}

function IconBtn({ children, label }: any) {
  return (
    <button style={{ border: 0, background: "none", color: "#065f46", fontWeight: 700, cursor: "pointer" }}>
      {label || children}
    </button>
  );
}

function Stat({ icon, value }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {icon} {value}
    </div>
  );
}

const btnGhost = {
  background: "none",
  border: 0,
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#065f46",
  fontWeight: 700,
  cursor: "pointer"
};

const audioBox = {
  marginTop: 12,
  background: "white",
  padding: 14,
  borderRadius: 16,
};

const wave = {
  flex: 1,
  height: 10,
  background: "linear-gradient(90deg, #10b981, #065f46)",
  opacity: 0.5,
  borderRadius: 6,
};

const btnGold = {
  background: "#f59e0b",
  color: "white",
  border: 0,
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 700,
};

const time = {
  fontSize: 10,
  textAlign: "center" as const,
  marginTop: 4,
  color: "#6b7280",
};

const label = {
  fontSize: 11,
  fontWeight: 800,
  color: "#065f46",
};

const divider = {
  height: 1,
  background: "rgba(255,255,255,0.2)",
  margin: "12px auto",
  width: 80,
};

const prayBtn = {
  marginTop: 16,
  background: "linear-gradient(135deg, #10b981, #047857)",
  border: 0,
  borderRadius: 100,
  padding: "10px 20px",
  fontWeight: 800,
  color: "white",
  cursor: "pointer"
};

const stats = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 12,
  fontSize: 12,
  opacity: 0.9,
};

const footer = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 24,
  fontWeight: 700,
  color: "#065f46",
};

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>...</div>}>
      <CreatePostContent />
    </Suspense>
  );
}
