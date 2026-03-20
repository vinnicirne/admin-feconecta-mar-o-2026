"use client";

import { useState } from "react";
import type { BibleVersion } from "@/types";

type BibleManagementPanelProps = {
  versions: BibleVersion[];
};

export function BibleManagementPanel({ versions }: BibleManagementPanelProps) {
  const [selectedId, setSelectedId] = useState(versions[0]?.id ?? "");
  const selectedVersion = versions.find((version) => version.id === selectedId) ?? versions[0];

  return (
    <section className="grid" style={{ gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.95fr)" }}>
      <div className="card" style={{ padding: 24 }}>
        <span className="pill">Biblia</span>
        <h2>Gerenciamento da Biblia</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Configure versoes disponiveis, ative ou desative acessos e acompanhe a adocao da funcionalidade.
        </p>

        <div className="grid" style={{ marginTop: 20 }}>
          {versions.map((version) => (
            <article
              key={version.id}
              style={{
                borderRadius: 20,
                border: "1px solid var(--line)",
                padding: 18,
                background: "rgba(255,255,255,0.58)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <div>
                  <strong>{version.name}</strong>
                  <p className="muted" style={{ margin: "6px 0" }}>
                    {version.abbreviation} • {version.language}
                  </p>
                </div>
                <span className="pill">{version.status === "active" ? "Ativa" : "Inativa"}</span>
              </div>
              <p style={{ margin: "8px 0" }}>{version.usage}</p>
              <p className="muted" style={{ marginTop: 0 }}>{version.favorites}</p>
              <button
                className="button secondary"
                type="button"
                onClick={() => setSelectedId(version.id)}
                style={{ padding: "8px 12px" }}
              >
                Gerenciar
              </button>
            </article>
          ))}
        </div>
      </div>

      {selectedVersion ? (
        <aside className="card" style={{ padding: 24 }}>
          <span className="pill">Analytics da versao</span>
          <h2 style={{ marginBottom: 6 }}>{selectedVersion.name}</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {selectedVersion.abbreviation} • {selectedVersion.language}
          </p>

          <div className="grid" style={{ gap: 12 }}>
            <div>
              <strong>Status atual</strong>
              <p className="muted">{selectedVersion.status === "active" ? "Ativa" : "Inativa"}</p>
            </div>
            <div>
              <strong>Uso</strong>
              <p className="muted">{selectedVersion.usage}</p>
            </div>
            <div>
              <strong>Favoritos</strong>
              <p className="muted">{selectedVersion.favorites}</p>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr", marginTop: 20 }}>
            <button className="button secondary" type="button">Ativar versao</button>
            <button className="button secondary" type="button">Desativar versao</button>
            <button className="button secondary" type="button">Ver analytics completos</button>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
