import type { LiveSignal } from "@/types";

const statusColor = {
  healthy: "#0f766e",
  warning: "#d97706",
  critical: "#b91c1c"
} as const;

export function LiveSignals({ signals }: { signals: LiveSignal[] }) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <p className="pill">Tempo real</p>
      <h2>Saude operacional da comunidade</h2>
      <div className="grid">
        {signals.map((signal) => (
          <article
            key={signal.id}
            style={{
              borderRadius: 18,
              border: "1px solid var(--line)",
              padding: 18,
              background: "rgba(255,255,255,0.58)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{signal.title}</h3>
              <span
                className="pill"
                style={{ background: `${statusColor[signal.status]}14`, color: statusColor[signal.status] }}
              >
                {signal.status}
              </span>
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>{signal.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

