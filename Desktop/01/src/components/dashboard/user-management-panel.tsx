"use client";

import { useMemo, useState } from "react";
import type { ManagedUser, UserStatus } from "@/types";
import { X, Search, Filter, UserRound, Mail, Calendar, MoreVertical, ShieldAlert, Edit, History, CheckCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type UserManagementPanelProps = {
  users: ManagedUser[];
};

const statusLabels: Record<UserStatus, string> = {
  active: "Ativo",
  banned: "Banido",
  suspended: "Suspenso"
};

const roleLabels: Record<ManagedUser["role"], string> = {
  member: "Membro",
  moderator: "Moderador",
  admin: "Admin"
};

export function UserManagementPanel({ users: initialUsers }: UserManagementPanelProps) {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | UserStatus>("all");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleBan = async (id: string, name: string) => {
    if (!confirm(`TEM CERTEZA? O membro ${name} será banido definitivamente.`)) return;
    setLoading(true);
    
    // Simulação para testes visuais com IDs 0000...
    if (id.startsWith('0000')) {
      setTimeout(() => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'banned' as UserStatus } : u));
        alert("SIMULAÇÃO: Membro banido com sucesso.");
        setLoading(false);
      }, 500);
      return;
    }

    const { error } = await supabase.from('profiles').update({ status: 'banned' }).eq('id', id);
    if (!error) {
       setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'banned' as UserStatus } : u));
       alert("Membro banido com sucesso.");
    }
    setLoading(false);
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Deseja REATIVAR a conta do membro ${name}?`)) return;
    setLoading(true);

    // Simulação para testes visuais com IDs 0000...
    if (id.startsWith('0000')) {
      setTimeout(() => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' as UserStatus } : u));
        alert("SIMULAÇÃO: Membro reativado com sucesso.");
        setLoading(false);
      }, 500);
      return;
    }

    const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', id);
    if (!error) {
       setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' as UserStatus } : u));
       alert("Membro reativado e restaurado com sucesso.");
    }
    setLoading(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery =
        !query ||
        [user.name, user.username, user.email].some((value) => value.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = status === "all" || user.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, users]);

  const selectedUser = filteredUsers.find((user) => user.id === selectedId);

  return (
    <section 
      className="grid" 
      style={{ 
        gridTemplateColumns: selectedUser ? "minmax(0, 1fr) 400px" : "1fr", 
        gap: 24,
        transition: "all 0.4s ease-in-out" 
      }}
    >
      {/* 🟢 LISTAGEM DE USUÁRIOS */}
      <div className="card" style={{ padding: 32 }}>
        <div style={{ marginBottom: 32 }}>
          <span className="pill" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>Governança de Membros</span>
          <h2 style={{ marginTop: 12, marginBottom: 8, fontSize: "2rem", fontWeight: 800 }}>Gestão de Usuários</h2>
          <p className="muted" style={{ margin: 0, maxWidth: 600 }}>Administre a base de membros, monitore o engajamento e aplique moderação em tempo real.</p>
        </div>

        {/* Filtros Profissionais */}
        <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: 16, color: "var(--muted)" }} />
            <input
              className="input"
              style={{ paddingLeft: 44 }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, username ou email..."
            />
          </div>
          <div style={{ position: "relative" }}>
            <Filter size={18} style={{ position: "absolute", left: 14, top: 16, color: "var(--muted)" }} />
            <select
              className="input"
              style={{ paddingLeft: 44 }}
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | UserStatus)}
            >
              <option value="all">Todos os Status</option>
              <option value="active">🟢 Apenas Ativos</option>
              <option value="suspended">🟡 Suspensos</option>
              <option value="banned">🔴 Banidos</option>
            </select>
          </div>
        </div>

        {/* Tabela de Nitidez Máxima */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0 16px 12px" }}>Informação do Membro</th>
                <th style={{ padding: "0 16px 12px" }}>Status</th>
                <th style={{ padding: "0 16px 12px" }}>Cadastro</th>
                <th style={{ padding: "0 16px 12px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelected = selectedId === user.id;
                return (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedId(user.id)}
                    className="user-row"
                    style={{ 
                      cursor: "pointer",
                      background: isSelected ? "rgba(15,118,110,0.06)" : "white",
                      transition: "all 0.2s",
                      boxShadow: isSelected ? "0 0 0 2px var(--primary)" : "none",
                      borderRadius: 16
                    }}
                  >
                    <td style={{ padding: 16, borderRadius: "16px 0 0 16px" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary-soft)", display: "grid", placeItems: "center" }}>
                          <UserRound size={20} color="var(--primary)" />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: 16 }}>{user.name}</strong>
                          <span className="muted" style={{ fontSize: 13 }}>{user.username} • {user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span className="pill" style={{ 
                        fontSize: 10, 
                        padding: "4px 10px",
                        background: user.status === 'active' ? "#dcfce7" : "#fee2e2",
                        color: user.status === 'active' ? "#166534" : "#991b1b",
                        border: "1px solid currentColor",
                        opacity: 0.8
                      }}>
                        {statusLabels[user.status]}
                      </span>
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                        <Calendar size={14} className="muted" /> {user.joinedAt}
                      </div>
                    </td>
                    <td style={{ padding: 16, borderRadius: "0 16px 16px 0", textAlign: "right" }}>
                      <button className="button secondary" style={{ padding: "8px 16px", fontSize: 12 }}>
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔴 PAINEL LATERAL DE DETALHES (DESLIZANTE) */}
      {selectedUser && (
        <aside className="card" style={{ padding: 32, alignSelf: "start", position: "sticky", top: 20 }}>
          <button 
            onClick={() => setSelectedId("")}
            style={{ position: "absolute", top: 24, right: 24, width: 36, height: 36, borderRadius: "50%", background: "var(--line)", border: 0, cursor: "pointer", display: "grid", placeItems: "center" }}
          >
            <X size={18} />
          </button>
          
          <span className="pill" style={{ marginBottom: 20 }}>Perfil do Membro</span>
          <h2 style={{ fontSize: "2.4rem", fontWeight: 800, margin: "20px 0 8px", letterSpacing: "-0.03em" }}>{selectedUser.name}</h2>
          <p className="muted" style={{ fontSize: "1.1rem", marginBottom: 32 }}>{selectedUser.username} • {selectedUser.email}</p>

          <div className="grid" style={{ gap: 20 }}>
            {[
              { label: "Status Ministerial", value: statusLabels[selectedUser.status], important: true },
              { label: "Cargo/Papel", value: roleLabels[selectedUser.role] },
              { label: "Membro desde", value: selectedUser.joinedAt },
              { label: "Igreja Local", value: selectedUser.church },
            ].map((info, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontWeight: 500 }}>{info.label}</span>
                <strong style={{ color: info.important ? "var(--primary)" : "inherit" }}>{info.value}</strong>
              </div>
            ))}
            
            <div style={{ marginTop: 10 }}>
              <span className="muted" style={{ fontWeight: 500, display: "block", marginBottom: 8 }}>Biografia Pastoral</span>
              <p style={{ lineHeight: 1.6, fontSize: "1rem" }}>{selectedUser.bio}</p>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 32 }}>
            <button className="button secondary" style={{ padding: 14, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }} onClick={() => alert("Módulo de Edição de Perfil será aberto em breve.")}>
              <Edit size={16} /> Editar Perfil
            </button>
            <button className="button secondary" style={{ padding: 14, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }} onClick={() => alert("Histórico completo de atividades em processamento.")}>
              <History size={16} /> Ver Histórico
            </button>
            <p className="muted" style={{ gridColumn: "1 / -1", margin: "14px 0 2px", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ações Críticas</p>
            {selectedUser.status === 'banned' ? (
              <button 
                className="button" 
                disabled={loading}
                onClick={() => handleReactivate(selectedUser.id, selectedUser.name)}
                style={{ 
                  gridColumn: "1 / -1", 
                  background: loading ? "var(--muted)" : "#10b981", 
                  padding: 16, 
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "center"
                }}
              >
                <CheckCircle size={20} /> {loading ? "Restaurando..." : "Reativar e Restaurar Membro"}
              </button>
            ) : (
              <button 
                className="button" 
                disabled={loading}
                onClick={() => handleBan(selectedUser.id, selectedUser.name)}
                style={{ 
                  gridColumn: "1 / -1", 
                  background: loading ? "var(--muted)" : "var(--danger)", 
                  padding: 16, 
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "center"
                }}
              >
                <ShieldAlert size={20} /> {loading ? "Processando Sentença..." : "Banir Membro Definitivamente"}
              </button>
            )}
          </div>
        </aside>
      )}
    </section>
  );
}
