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

export default function RegisterPage() {
  return (
    <div className="grid" style={{ 
      minHeight: "100vh", 
      background: "radial-gradient(circle at top right, #f0fdf4, #ffffff 60%, #ecfdf5)", 
      placeItems: "center", 
      padding: 24 
    }}>
      {/* 🔴 CARD DE REGISTRO (SIMETRIA PREMIUM) */}
      <div className="card" style={{ 
        width: "100%", 
        maxWidth: 480, 
        padding: "40px", 
        textAlign: "center",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(15, 118, 110, 0.1)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.06)",
        borderRadius: 32
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Link href="/auth/login" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
            <ChevronLeft size={16} /> Voltar ao Login
          </Link>
          <span className="pill" style={{ background: "var(--primary-soft)", color: "var(--primary)", border: 0 }}>FASE 1: CONTA</span>
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Crie seu Refúgio</h1>
        <p className="muted" style={{ fontSize: "0.95rem", marginBottom: 32 }}>Faça parte do maior ecossistema digital de fé do Brasil 🕊️</p>

        <form className="grid" style={{ gap: 20 }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label className="grid" style={{ gap: 8, textAlign: "left" }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", paddingLeft: 4, opacity: 0.7 }}>Nome Ministerial</span>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
                <input type="text" placeholder="Nome Completo" className="input" style={{ paddingLeft: 42, borderRadius: 12, background: "white", border: "1px solid var(--line)", fontSize: 14, height: 44 }} />
              </div>
            </label>
            <label className="grid" style={{ gap: 8, textAlign: "left" }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", paddingLeft: 4, opacity: 0.7 }}>Identificador</span>
              <div style={{ position: "relative" }}>
                <AtSign size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
                <input type="text" placeholder="username" className="input" style={{ paddingLeft: 42, borderRadius: 12, background: "white", border: "1px solid var(--line)", fontSize: 14, height: 44 }} />
              </div>
            </label>
          </div>

          <label className="grid" style={{ gap: 8, textAlign: "left" }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", paddingLeft: 4, opacity: 0.7 }}>E-mail Ministerial</span>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
              <input type="email" placeholder="seu@email.com" className="input" style={{ paddingLeft: 42, borderRadius: 12, background: "white", border: "1px solid var(--line)", fontSize: 14, height: 44 }} />
            </div>
          </label>

          <label className="grid" style={{ gap: 8, textAlign: "left" }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", paddingLeft: 4, opacity: 0.7 }}>Sua Senha</span>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
              <input type="password" placeholder="••••••••" className="input" style={{ paddingLeft: 42, borderRadius: 12, background: "white", border: "1px solid var(--line)", fontSize: 14, height: 44 }} />
            </div>
          </label>

          <div style={{ background: "rgba(15, 118, 110, 0.04)", padding: "16px", borderRadius: 16, textAlign: "left", fontSize: 12, border: "1px dashed rgba(15, 118, 110, 0.2)" }}>
             🚀 <strong>Dica de Fé:</strong> Sua senha deve ter pelo menos 8 caracteres para garantir a segurança ministerial total do seu refúgio digital.
          </div>

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
            Criar Registro Gratuito <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: "var(--muted)" }}>
          Ao registrar, você concorda com nossas políticas de uso e moderação ministerial. ⛪
        </p>
      </div>
    </div>
  );
}
