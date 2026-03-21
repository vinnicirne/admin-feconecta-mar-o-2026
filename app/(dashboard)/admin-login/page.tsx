"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div style={{ 
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", 
      padding: 20, background: "#0f172a" 
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
           <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(30, 64, 175, 0.2)", color: "#3b82f6", display: "grid", placeItems: "center", margin: "0 auto 16px", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
              <Shield size={32} />
           </div>
           <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "white" }}>Painel de Gestão</h2>
           <p style={{ marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Acesso restrito a administradores do Refúgio.</p>
        </div>
        
        {/* Passamos uma flag visual ou usamos o mesmo componente */}
        <LoginForm />
        
        <div style={{ textAlign: "center", marginTop: 32 }}>
           <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
             © 2026 FéConecta • Controle Ministerial
           </p>
        </div>
      </div>
    </div>
  );
}
