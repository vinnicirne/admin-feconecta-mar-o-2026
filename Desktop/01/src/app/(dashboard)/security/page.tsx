export default function SecurityPage() {
  return (
    <section className="card" style={{ padding: 24 }}>
      <span className="pill">Seguranca e conformidade</span>
      <h2>Centro de defesa administrativa</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 18 }}>
        <article style={{ padding: 18, borderRadius: 18, border: "1px solid var(--line)" }}>
          <strong>MFA obrigatorio</strong>
          <p className="muted">TOTP via Supabase Auth para perfis com privilegio alto.</p>
        </article>
        <article style={{ padding: 18, borderRadius: 18, border: "1px solid var(--line)" }}>
          <strong>Logs de acesso</strong>
          <p className="muted">IP, device, geolocalizacao aproximada e score de risco persistidos no Postgres.</p>
        </article>
        <article style={{ padding: 18, borderRadius: 18, border: "1px solid var(--line)" }}>
          <strong>Escala futura</strong>
          <p className="muted">Antifraude, jobs e alertas assincronos saem para workers sem quebrar a UI.</p>
        </article>
      </div>
    </section>
  );
}

