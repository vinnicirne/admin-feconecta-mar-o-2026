import type { AccessLog } from "@/types";

export function AccessLogList({ logs }: { logs: AccessLog[] }) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Acesso e auditoria</h2>
      <div className="grid">
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: "16px 18px",
              borderRadius: 18,
              border: "1px solid var(--line)",
              background: "rgba(255,255,255,0.54)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>{log.actor}</strong>
              <span className="muted">{log.createdAt}</span>
            </div>
            <p style={{ marginBottom: 6 }}>{log.action}</p>
            <p className="muted" style={{ margin: 0 }}>
              {log.location} • {log.device}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

