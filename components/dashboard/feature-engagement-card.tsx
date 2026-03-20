import type { FeatureEngagement } from "@/types";

export function FeatureEngagementCard({ items }: { items: FeatureEngagement[] }) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Engajamento por funcionalidade</h2>
      <div className="grid" style={{ marginTop: 16 }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>{item.label}</strong>
              <span className="muted">{item.value}</span>
            </div>
            <div
              style={{
                width: "100%",
                height: 12,
                borderRadius: 999,
                overflow: "hidden",
                background: "rgba(31,41,55,0.08)"
              }}
            >
              <div
                style={{
                  width: `${item.percentage}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, var(--primary), var(--accent))"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

