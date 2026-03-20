"use client";

import { useState } from "react";
import type { ManagedLive } from "@/types";

type LiveControlPanelProps = {
  lives: ManagedLive[];
};

const statusLabels: Record<ManagedLive["status"], string> = {
  live: "Ao vivo",
  scheduled: "Agendada",
  ended: "Encerrada",
  interrupted: "Interrompida"
};

export function LiveControlPanel({ lives }: LiveControlPanelProps) {
  const [selectedId, setSelectedId] = useState(lives[0]?.id ?? "");
  const selectedLive = lives.find((live) => live.id === selectedId) ?? lives[0];

  return (
    <section className="grid" style={{ gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.95fr)" }}>
      <div className="card" style={{ padding: 24 }}>
        <span className="pill">Lives</span>
        <h2>Controle de transmissões ao vivo</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Monitore audiencia, acompanhe transmissões críticas e aja rapidamente em caso de violação.
        </p>

        <div className="grid" style={{ marginTop: 20 }}>
          {lives.map((live) => (
            <article
              key={live.id}
              style={{
                borderRadius: 20,
                border: "1px solid var(--line)",
                padding: 18,
                background: "rgba(255,255,255,0.58)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <div>
                  <strong>{live.title}</strong>
                  <p className="muted" style={{ margin: "6px 0" }}>
                    {live.host} • {live.category}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "end" }}>
                  <span className="pill">{statusLabels[live.status]}</span>
                  {live.flagged ? <span className="pill">Sinalizada</span> : null}
                </div>
              </div>
              <p style={{ margin: "8px 0" }}>
                <strong>{live.viewers.toLocaleString("pt-BR")}</strong> espectadores agora • pico de{" "}
                {live.peakViewers.toLocaleString("pt-BR")}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span className="muted">{live.startedAt}</span>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setSelectedId(live.id)}
                  style={{ padding: "8px 12px" }}
                >
                  Monitorar
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedLive ? (
        <aside className="card" style={{ padding: 24 }}>
          <span className="pill">Painel operacional</span>
          <h2 style={{ marginBottom: 6 }}>{selectedLive.title}</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {selectedLive.host} • {statusLabels[selectedLive.status]}
          </p>

          <div className="grid" style={{ gap: 12 }}>
            <div>
              <strong>Espectadores</strong>
              <p className="muted">{selectedLive.viewers.toLocaleString("pt-BR")} agora</p>
            </div>
            <div>
              <strong>Pico de audiencia</strong>
              <p className="muted">{selectedLive.peakViewers.toLocaleString("pt-BR")}</p>
            </div>
            <div>
              <strong>Historico da transmissao</strong>
              <div className="grid" style={{ gap: 10 }}>
                {selectedLive.history.map((item, index) => (
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
            <button className="button secondary" type="button">Ver historico completo</button>
            <button className="button" type="button" style={{ background: "var(--danger)" }}>
              Derrubar live
            </button>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
