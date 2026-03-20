"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Credenciais invalidas");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form
      className="card"
      onSubmit={handleSubmit}
      suppressHydrationWarning
      style={{ padding: 42, width: "min(420px, 100%)", borderRadius: 24 }}
    >
      <p className="pill">Acesso Administrativo</p>
      <h1 style={{ marginBottom: 16 }}>Entrar</h1>
      
      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 14 }}>
          {error}
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
            placeholder="••••••••"
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
          {loading ? "Autenticando..." : "Entrar no Painel"}
        </button>
        <div style={{ textAlign: "center" }}>
          <Link href="/signup" style={{ color: "var(--primary)", fontSize: 14, textDecoration: "none", opacity: 0.8 }}>
            Criar conta de administrador
          </Link>
        </div>
      </div>
    </form>
  );
}
