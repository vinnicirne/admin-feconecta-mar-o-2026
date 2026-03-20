"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setMessage({ type: "error", text: signUpError.message });
      setLoading(false);
    } else {
      setMessage({ type: "success", text: "Conta criada! Tente fazer o login agora." });
      setLoading(false);
      // Redireciona após 2 segundos para o login
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <form
      className="card"
      onSubmit={handleSignUp}
      suppressHydrationWarning
      style={{ padding: 42, width: "min(420px, 100%)", borderRadius: 24 }}
    >
      <p className="pill">Novo Administrador</p>
      <h1 style={{ marginBottom: 16 }}>Criar Conta</h1>
      
      {message && (
        <div style={{ 
          background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", 
          color: message.type === "error" ? "rgb(239, 68, 68)" : "rgb(34, 197, 94)", 
          padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 14 
        }}>
          {message.text}
        </div>
      )}

      <div className="grid" style={{ gap: 16 }} suppressHydrationWarning>
        <label>
          <span>Email de acesso</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@feconecta.com"
          />
        </label>
        <label>
          <span>Senha</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mínimo 6 caracteres"
          />
        </label>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }} suppressHydrationWarning>
        <button
          className="button"
          type="submit"
          disabled={loading}
          style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Criando..." : "Registrar Acesso"}
        </button>
        <div style={{ textAlign: "center" }}>
          <a href="/login" style={{ color: "var(--primary)", fontSize: 14, textDecoration: "none", opacity: 0.8 }}>
            Já tenho uma conta
          </a>
        </div>
      </div>
    </form>
  );
}
