import type { ChartPoint } from "@/types";

type ChartCardProps = {
  title: string;
  description: string;
  points: ChartPoint[];
  suffix?: string;
};

export function ChartCard({ title, description, points, suffix = "" }: ChartCardProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <section className="card" style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="muted">{description}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${points.length || 1}, minmax(0, 1fr))`,
          gap: 14,
          alignItems: "end",
          minHeight: 220,
          marginTop: 18
        }}
      >
        {points.map((point) => (
          <div key={point.label} style={{ display: "grid", gap: 8, justifyItems: "center" }}>
            <div className="muted" style={{ fontSize: 13 }}>
              {point.value}
              {suffix}
            </div>
            <div
              style={{
                width: "100%",
                height: `${Math.max((point.value / maxValue) * 160, 18)}px`,
                borderRadius: 18,
                background: "linear-gradient(180deg, rgba(15,118,110,0.92), rgba(217,119,6,0.72))"
              }}
            />
            <strong>{point.label}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

