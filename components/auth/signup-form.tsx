"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [church, setChurch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    // 🛡️ Registrar no Supabase Auth com MetaData (será usado para o perfil)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          username: username.toLowerCase().replace(/\s/g, ""),
          birth_date: birthDate,
          gender: gender,
          church: church,
          display_name: `${firstName} ${lastName}`.trim(),
          role: 'member', // Exclusivo para usuários comuns
        }
      }
    });

    if (signUpError) {
      setMessage({ type: "error", text: signUpError.message });
      setLoading(false);
    } else {
      setMessage({ type: "success", text: "Bem-vindo ao Refúgio! Sua conta foi criada com sucesso." });
      setLoading(false);
      // Redireciona para o Feed Principal
      setTimeout(() => router.push("/"), 2500);
    }
  };

  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 };
  const inputStyle: React.CSSProperties = { padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)", outline: "none", width: "100%", fontSize: 14 };

  return (
    <form
      className="card"
      onSubmit={handleSignUp}
      suppressHydrationWarning
      style={{ padding: 32, width: "min(480px, 100%)", borderRadius: 32, background: "white", boxShadow: "0 25px 50px rgba(0,0,0,0.1)" }}
    >
      <p className="pill" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>Novo Membro</p>
      <h1 style={{ marginBottom: 24, fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>Criar Conta</h1>

      {message && (
        <div style={{
          background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
          color: message.type === "error" ? "rgb(239, 68, 68)" : "rgb(34, 197, 94)",
          padding: 16, borderRadius: 16, marginBottom: 24, fontSize: 14, fontWeight: 700
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* NOME E SOBRENOME */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            <span style={labelStyle}>Nome</span>
            <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="João" />
          </label>
          <label>
            <span style={labelStyle}>Sobrenome</span>
            <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Silva" />
          </label>
        </div>

        {/* USUÁRIO */}
        <label>
          <span style={labelStyle}>Nome de Usuário</span>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 16, top: 12, color: "var(--muted)" }}>@</span>
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={username} onChange={e => setUsername(e.target.value)} required placeholder="usuarioselecionado" />
          </div>
        </label>

        {/* DATA E GÊNERO */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            <span style={labelStyle}>Data de Nascimento</span>
            <input style={inputStyle} type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
          </label>
          <label>
            <span style={labelStyle}>Gênero</span>
            <select style={inputStyle} value={gender} onChange={e => setGender(e.target.value)} required>
              <option value="">Selecione...</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="não_informar">Não informar</option>
            </select>
          </label>
        </div>

        {/* IGREJA */}
        <label>
          <span style={labelStyle}>Sua Igreja / Comunidade</span>
          <input style={inputStyle} value={church} onChange={e => setChurch(e.target.value)} required placeholder="Igreja Batista de Fé" />
        </label>

        {/* EMAIL */}
        <label>
          <span style={labelStyle}>Email</span>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="exemplo@igreja.com" />
        </label>

        {/* SENHA */}
        <label>
          <span style={labelStyle}>Senha Ministerial</span>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" />
        </label>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }} suppressHydrationWarning>
        <button
          className="button"
          type="submit"
          disabled={loading}
          style={{ width: "100%", height: 52, borderRadius: 16, background: "var(--primary)", border: 0, color: "white", fontWeight: 900, fontSize: 15, cursor: loading ? "wait" : "pointer", boxShadow: "0 10px 20px var(--primary-soft)" }}
        >
          {loading ? "Preparando Refúgio..." : "Criar Minha Conta"}
        </button>
        <div style={{ textAlign: "center" }}>
          <a href="/login" style={{ color: "var(--primary)", fontSize: 13, textDecoration: "none", fontWeight: 800 }}>
            Já sou membro? <span style={{ textDecoration: "underline" }}>Entrar agora</span>
          </a>
        </div>
      </div>
    </form>
  );
}
