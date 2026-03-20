import type { AdminUser } from "@/types";

export function AdminUserTable({ users }: { users: AdminUser[] }) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 6 }}>Equipe administrativa</h2>
          <p className="muted" style={{ margin: 0 }}>
            Perfis, ultima atividade e prontidao para incidentes.
          </p>
        </div>
        <button className="button secondary" type="button">Convidar admin</button>
      </div>
      <div style={{ overflowX: "auto", marginTop: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)" }}>
              <th style={{ paddingBottom: 12 }}>Nome</th>
              <th style={{ paddingBottom: 12 }}>Papel</th>
              <th style={{ paddingBottom: 12 }}>Status</th>
              <th style={{ paddingBottom: 12 }}>Ultimo acesso</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "14px 0" }}>
                  <div>
                    <strong>{user.name}</strong>
                    <div className="muted">{user.email}</div>
                  </div>
                </td>
                <td style={{ textTransform: "capitalize" }}>{user.role.replace("_", " ")}</td>
                <td>{user.status}</td>
                <td>{user.lastAccess}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

