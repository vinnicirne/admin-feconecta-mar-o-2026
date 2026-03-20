"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  AtSign, 
  ArrowRight, 
  Globe, 
  Sparkles,
  ChevronLeft
} from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid" style={{ 
      minHeight: "100vh", 
      background: "radial-gradient(circle at top right, #f0fdf4, #ffffff 60%, #ecfdf5)", 
      placeItems: "center", 
      padding: 24 
    }}>
      {/* 🔴 CARD DE LOGIN (GLASSMORPHISM) */}
      <div className="card" style={{ 
        width: "100%", 
        maxWidth: 420, 
        padding: "48px 32px", 
        textAlign: "center",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(15, 118, 110, 0.1)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.06)",
        borderRadius: 32
      }}>
        <div style={{ 
          width: 64, 
          height: 64, 
          borderRadius: 20, 
          background: "var(--primary)", 
          margin: "0 auto 24px",
          display: "grid", 
          placeItems: "center",
          color: "white",
          boxShadow: "0 10px 25px rgba(15, 118, 110, 0.3)"
        }}>
          <ShieldCheck size={32} />
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Entrar no Refúgio</h1>
        <p className="muted" style={{ fontSize: "0.95rem", marginBottom: 32 }}>Conecte-se com sua comunidade de fé e continue crescendo.</p>

        <form className="grid" style={{ gap: 16 }}>
          <label className="grid" style={{ gap: 8, textAlign: "left" }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", paddingLeft: 4, opacity: 0.7 }}>E-mail Ministerial</span>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
              <input type="email" placeholder="seu@email.com" className="input" style={{ paddingLeft: 44, borderRadius: 14, background: "white", border: "1px solid var(--line)" }} />
            </div>
          </label>

          <label className="grid" style={{ gap: 8, textAlign: "left" }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", paddingLeft: 4, opacity: 0.7 }}>Sua Senha</span>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
              <input type="password" placeholder="••••••••" className="input" style={{ paddingLeft: 44, borderRadius: 14, background: "white", border: "1px solid var(--line)" }} />
            </div>
          </label>

          <button className="button" style={{ 
            marginTop: 8, 
            padding: "16px", 
            fontSize: "1rem", 
            fontWeight: 700, 
            borderRadius: 14,
            display: "flex", 
            justifyContent: "center", 
            gap: 10 
          }}>
            Acessar Plataforma <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
          <Link href="/auth/register" style={{ color: "var(--primary)", textDecoration: "none" }}>Criar nova conta</Link>
          <Link href="/auth/recover" className="muted" style={{ textDecoration: "none" }}>Esqueceu a senha?</Link>
        </div>
      </div>

      {/* Footer / Vision */}
      <footer style={{ marginTop: 24, textAlign: "center", maxWidth: 300 }}>
         <p className="muted" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}>
           <strong>FéConecta Global</strong> • Seu Espaço Seguro de Fé e Comunhão. 🕊️
         </p>
      </footer>
    </div>
  );
}
