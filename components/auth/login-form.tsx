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

    try {
      const supabase = createClient();
      const { error: authError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Erro de Autenticação Supabase:", authError);
        setError(authError.message === "Invalid login credentials" ? "Credenciais inválidas" : authError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Redirecionamento seguro: Membros comuns sempre vão para o Feed (/)
        // Apenas administradores explícitos acessam o dashboard
        const isAdmin = data.user?.app_metadata?.role === 'admin' || data.user?.user_metadata?.role === 'admin';
        
        console.log("Login realizado com sucesso. Redirecionando...", { isAdmin });

        if (isAdmin) {
          router.push("/dashboard");
        } else {
          // Em mobile, às vezes o router.push("/") não recarrega o estado adequadamente se já estivermos na home
          // Forçamos o refresh ou usamos window.location se necessário
          router.push("/");
          router.refresh();
          
          // Fallback para garantir que o modal feche ou a página recarregue se o router falhar
          setTimeout(() => {
            if (window.location.pathname === "/") {
               window.location.reload();
            }
          }, 1000);
        }
      }
    } catch (err: any) {
      console.error("Erro Inesperado no Login:", err);
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  const isFeed = typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard');

  return (
    <form
      className="card"
      onSubmit={handleSubmit}
      suppressHydrationWarning
      style={{ padding: 42, width: "min(420px, 100%)", borderRadius: 24, background: "white" }}
    >
      <p className="pill" style={{ background: isFeed ? "var(--primary-soft)" : "rgba(0,0,0,0.05)", color: isFeed ? "var(--primary)" : "inherit" }}>
        {isFeed ? "🛡️ Espaço Seguro" : "Acesso Administrativo"}
      </p>
      <h1 style={{ marginBottom: 16, fontSize: 24, fontWeight: 900 }}>Entrar</h1>
      
      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
          {error}
        </div>
      )}

      <div className="grid" style={{ gap: 16 }} suppressHydrationWarning>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Email</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="exemplo@email.com"
            style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)", outline: "none" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Senha</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)", outline: "none" }}
          />
        </label>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }} suppressHydrationWarning>
        <button
          className="button"
          type="submit"
          disabled={loading}
          style={{ width: "100%", opacity: loading ? 0.7 : 1, background: "var(--primary)", border: 0, color: "white", padding: "14px", borderRadius: 14, fontWeight: 900, cursor: "pointer" }}
        >
          {loading ? "Autenticando..." : "Entrar no Refúgio"}
        </button>
        <div style={{ textAlign: "center" }}>
          <Link href="/signup" style={{ color: "var(--primary)", fontSize: 14, textDecoration: "none", fontWeight: 700 }}>
            {isFeed ? "Não sou membro? Criar conta" : "Criar conta de administrador"}
          </Link>
        </div>
      </div>
    </form>
  );
}
