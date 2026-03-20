import type { DashboardMetric } from "@/types";

export function StatCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article className="card" style={{ padding: 24 }}>
      <p className="muted" style={{ marginTop: 0 }}>{metric.label}</p>
      <h3 style={{ fontSize: 34, margin: "6px 0 10px" }}>{metric.value}</h3>
      <p style={{ marginBottom: 0, color: "var(--primary)", fontWeight: 700 }}>{metric.delta}</p>
    </article>
  );
}

