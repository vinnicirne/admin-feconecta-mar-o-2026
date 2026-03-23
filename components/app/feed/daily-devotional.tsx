"use client";

import { Sparkles } from "lucide-react";

export function DailyDevotional() {
  return (
    <div style={{ 
      padding: "32px", 
      background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)", 
      borderRadius: "40px", 
      color: "white", 
      boxShadow: "0 20px 50px rgba(13, 148, 136, 0.15)",
      position: "relative",
      overflow: "hidden",
      marginBottom: "24px"
    }}>
      {/* 🧬 DECORAÇÃO BACKGROUND */}
      <div style={{ position: "absolute", bottom: -20, right: -20, opacity: 0.1 }}>
         <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <path d="M100 0L120 80L200 100L120 120L100 200L80 120L0 100L80 80L100 0Z" fill="white" />
         </svg>
      </div>

      <div style={{ position: "relative", zIndex: 10 }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div style={{ 
               padding: "8px 16px", 
               borderRadius: "100px", 
               background: "rgba(255,255,255,0.15)", 
               backdropFilter: "blur(4px)",
               fontSize: "10px",
               fontWeight: 900,
               textTransform: "uppercase",
               letterSpacing: "1px",
               border: "1px solid rgba(255,255,255,0.1)"
            }}>
               MENSAGEM DO DIA
            </div>
            <Sparkles size={18} />
         </div>

         <h2 style={{ 
            fontSize: "28px", 
            fontWeight: 900, 
            lineHeight: 1.2, 
            margin: "0 0 16px",
            letterSpacing: "-1px"
         }}>
            "Porque nada é impossível para Deus."
         </h2>

         <p style={{ 
            fontSize: "14px", 
            fontWeight: 700, 
            opacity: 0.9, 
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 8
         }}>
            Lucas 1:37 <span style={{ width: 4, height: 4, background: "white", borderRadius: "50%", opacity: 0.5 }}></span> Refúgio de Hoje
         </p>
      </div>
    </div>
  );
}
