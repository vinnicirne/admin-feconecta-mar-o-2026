"use client";

import { X, Mic2, Globe } from "lucide-react";
import { PostCreatorClean as PostCreator } from "@/components/app/feed/post-creator-clean";

interface FaithActionsModalProps {
  onClose: () => void;
}

export function FaithActionsModal({ onClose }: FaithActionsModalProps) {
  return (
    <div style={{ 
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", zIndex: 2000,
      display: "flex", alignItems: "flex-end"
    }}>
        <div style={{ 
           width: "100%", background: "white", borderTopLeftRadius: 32, borderTopRightRadius: 32,
           padding: "24px", maxHeight: "90vh", overflowY: "auto", position: "relative"
        }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Ações de Fé</h2>
              <button onClick={onClose} style={{ background: "#f1f5f9", border: 0, width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center" }}>
                 <X size={24} />
              </button>
           </div>
           
           <div className="grid" style={{ gap: 16 }}>
             {/* OPÇÃO 1: POST PADRÃO */}
             <div style={{ background: "white", padding: "16px", borderRadius: 24, border: "1px solid var(--line)", display: "flex", gap: 16 }}>
              <PostCreator onSuccess={onClose} />
             </div>

             <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, display: "grid" }}>
                {/* OPÇÃO 2: SALA DE GUERRA */}
                <button 
                  onClick={() => window.location.href = '/war-room/new'}
                  style={{ background: "var(--primary-soft)", padding: "20px 16px", borderRadius: 24, border: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", cursor: "pointer" }}
                >
                  <Mic2 size={24} color="var(--primary)" />
                  <strong style={{ fontSize: 13, color: "var(--primary)" }}>Sala de Guerra</strong>
                </button>

                {/* OPÇÃO 3: COMUNIDADE */}
                <button 
                  onClick={() => window.location.href = '/communities/new'}
                  style={{ background: "rgba(217, 119, 6, 0.1)", padding: "20px 16px", borderRadius: 24, border: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", cursor: "pointer" }}
                >
                  <Globe size={24} color="var(--accent)" />
                  <strong style={{ fontSize: 13, color: "var(--accent)" }}>Criar Igreja</strong>
                </button>
             </div>
           </div>
        </div>
    </div>
  );
}
