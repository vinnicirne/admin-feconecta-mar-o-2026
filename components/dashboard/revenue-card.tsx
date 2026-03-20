import type { RevenueSnapshot } from "@/types";

export function RevenueCard({ revenue }: { revenue: RevenueSnapshot }) {
  return (
    <section className="card" style={{ padding: 24 }}>
      <p className="pill">Monetizacao ativa</p>
      <h2>Receita e sustentabilidade</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginTop: 16 }}>
        <div>
          <p className="muted">MRR</p>
          <strong style={{ fontSize: 28 }}>{revenue.mrr}</strong>
        </div>
        <div>
          <p className="muted">Doacoes</p>
          <strong style={{ fontSize: 28 }}>{revenue.donations}</strong>
        </div>
        <div>
          <p className="muted">Ticket medio</p>
          <strong style={{ fontSize: 28 }}>{revenue.averageTicket}</strong>
        </div>
      </div>
      <p style={{ marginBottom: 0, marginTop: 18, color: "var(--primary)", fontWeight: 700 }}>{revenue.delta}</p>
    </section>
  );
}
