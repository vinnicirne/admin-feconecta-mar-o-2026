"use client";

import { useMemo, useState } from "react";
import type { ModerationReport, ReportCategory } from "@/types";

type ReportManagementPanelProps = {
  reports: ModerationReport[];
};

const categoryLabels: Record<ReportCategory, string> = {
  inappropriate_content: "Conteudo improprio",
  hate_speech: "Discurso de odio",
  spam: "Spam",
  fake_news: "Fake news",
  other: "Outros"
};

const queueLabels: Record<ModerationReport["queue"], string> = {
  high: "Alta prioridade",
  normal: "Fila normal",
  review: "Revisao"
};

export function ReportManagementPanel({ reports }: ReportManagementPanelProps) {
  const [category, setCategory] = useState<"all" | ReportCategory>("all");
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => category === "all" || report.category === category);
  }, [category, reports]);

  const selectedReport =
    filteredReports.find((report) => report.id === selectedId) ?? filteredReports[0] ?? reports[0];

  return (
    <section className="grid" style={{ gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.95fr)" }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <span className="pill">Moderacao em tempo real</span>
            <h2>Sistema de denuncias</h2>
            <p className="muted" style={{ margin: 0 }}>
              Painel vivo de denuncias, fila de moderacao e historico de decisoes para preservar a saude da comunidade.
            </p>
          </div>
          <label style={{ minWidth: 240 }}>
            <span>Categoria</span>
            <select
              className="input"
              value={category}
              onChange={(event) => setCategory(event.target.value as "all" | ReportCategory)}
            >
              <option value="all">Todas</option>
              <option value="inappropriate_content">Conteudo improprio</option>
              <option value="hate_speech">Discurso de odio</option>
              <option value="spam">Spam</option>
              <option value="fake_news">Fake news</option>
              <option value="other">Outros</option>
            </select>
          </label>
        </div>

        <div className="grid" style={{ marginTop: 20 }}>
          {filteredReports.map((report) => (
            <article
              key={report.id}
              style={{
                borderRadius: 20,
                border: "1px solid var(--line)",
                padding: 18,
                background: "rgba(255,255,255,0.58)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <div>
                  <strong>{categoryLabels[report.category]}</strong>
                  <p className="muted" style={{ margin: "6px 0" }}>
                    {report.targetType} • {report.targetLabel}
                  </p>
                </div>
                <span className="pill">{queueLabels[report.queue]}</span>
              </div>
              <p>{report.summary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span className="muted">
                  Reportado por {report.reporter} • {report.createdAt}
                </span>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setSelectedId(report.id)}
                  style={{ padding: "8px 12px" }}
                >
                  Abrir caso
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedReport ? (
        <aside className="card" style={{ padding: 24 }}>
          <span className="pill">Fila de moderacao</span>
          <h2 style={{ marginBottom: 6 }}>{selectedReport.targetLabel}</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {categoryLabels[selectedReport.category]} • {queueLabels[selectedReport.queue]}
          </p>

          <div className="grid" style={{ gap: 12 }}>
            <div>
              <strong>Resumo do caso</strong>
              <p className="muted">{selectedReport.summary}</p>
            </div>
            <div>
              <strong>Acao recomendada</strong>
              <p className="muted">{selectedReport.userActionHint}</p>
            </div>
            <div>
              <strong>Historico de decisoes</strong>
              <div className="grid" style={{ gap: 10 }}>
                {selectedReport.decisionHistory.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 16,
                      padding: 12,
                      background: "rgba(255,255,255,0.54)"
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr", marginTop: 20 }}>
            <button className="button secondary" type="button">Ignorar</button>
            <button className="button secondary" type="button">Remover conteudo</button>
            <button className="button" type="button" style={{ background: "var(--danger)" }}>
              Punir usuario
            </button>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
