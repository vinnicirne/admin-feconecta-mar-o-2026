export default function MonetizationPage() {
  return (
    <section className="card" style={{ padding: 24 }}>
      <span className="pill">Receita e sustentabilidade</span>
      <h2>Monetizacao da plataforma</h2>
      <p className="muted">
        Painel preparado para assinaturas, doacoes, comissoes e conciliacao financeira com evolucao por servicos.
      </p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 18 }}>
        <article style={{ padding: 18, borderRadius: 18, border: "1px solid var(--line)" }}>
          <strong>Assinaturas premium</strong>
          <p className="muted">Planos, churn, upgrades e cohort analysis.</p>
        </article>
        <article style={{ padding: 18, borderRadius: 18, border: "1px solid var(--line)" }}>
          <strong>Marketplace futuro</strong>
          <p className="muted">Separado da UI principal para permitir evolucao sem acoplamento.</p>
        </article>
        <article style={{ padding: 18, borderRadius: 18, border: "1px solid var(--line)" }}>
          <strong>Repasses e auditoria</strong>
          <p className="muted">Eventos financeiros com trilha auditavel e conciliacao posterior por worker.</p>
        </article>
      </div>
    </section>
  );
}

