"use client";

import { PostCreator } from "@/components/app/feed/post-creator";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 120px" }}>
      
      {/* Header de Voltar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
         <button 
           onClick={() => router.back()}
           style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid var(--line)", background: "white", display: "grid", placeItems: "center" }}
         >
            <ArrowLeft size={20} />
         </button>
         <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>Nova Publicação</h1>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>Compartilhe sua fé com o refúgio</p>
         </div>
      </div>

      {/* Editor Ministerial */}
      <div style={{ padding: "0 4px" }}>
        <PostCreator />
      </div>

      {/* Dica do Dia */}
      <div style={{ marginTop: 40, padding: 24, borderRadius: 24, background: "var(--primary-soft)", display: "flex", gap: 16, alignItems: "start" }}>
         <div style={{ width: 40, height: 40, borderRadius: 12, background: "white", display: "grid", placeItems: "center", color: "var(--primary)" }}>
            <Sparkles size={20} />
         </div>
         <div>
            <strong style={{ fontSize: 14, color: "var(--primary)" }}>Dica Ministerial</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>Use fundos coloridos para destacar versículos ou palavras de encorajamento rápidas.</p>
         </div>
      </div>

    </div>
  );
}
