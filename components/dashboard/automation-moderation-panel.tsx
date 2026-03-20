"use client";

import { useState } from "react";
import type { ModerationAction, ModerationDetector } from "@/types";

type AutomationModerationPanelProps = {
  words: string[];
  detectors: ModerationDetector[];
};

const actionLabels: Record<ModerationAction, string> = {
  alert: "Alerta",
  hide: "Ocultar",
  ban: "Banir"
};

export function AutomationModerationPanel({ words, detectors }: AutomationModerationPanelProps) {
  const [customWord, setCustomWord] = useState("");
  const [wordList, setWordList] = useState(words);

  return (
    <section className="grid" style={{ gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.95fr)" }}>
      <div className="card" style={{ padding: 24 }}>
        <span className="pill">Moderacao automatica</span>
        <h2>IA, palavras proibidas e resposta automatica</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Base preparada para conectar modelos, regras e automacoes progressivas sem prender a operacao a revisao manual.
        </p>

        <div className="grid" style={{ marginTop: 20 }}>
          {detectors.map((detector) => (
            <article
              key={detector.id}
              style={{
                borderRadius: 18,
                border: "1px solid var(--line)",
                padding: 18,
                background: "rgba(255,255,255,0.58)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <div>
                  <strong>{detector.label}</strong>
                  <p className="muted" style={{ marginBottom: 0 }}>{detector.description}</p>
                </div>
                <span className="pill">{detector.enabled ? "Ativo" : "Desligado"}</span>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                <span className="pill">Sensibilidade: {detector.sensitivity}</span>
                <span className="pill">Acao: {actionLabels[detector.action]}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="card" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Configuracoes</h2>
        <div className="grid" style={{ gap: 16 }}>
          <div>
            <strong>Lista de palavras customizadas</strong>
            <div className="grid" style={{ marginTop: 12 }}>
              {wordList.map((word, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 16,
                    padding: 12,
                    background: "rgba(255,255,255,0.54)"
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <input
                className="input"
                value={customWord}
                onChange={(event) => setCustomWord(event.target.value)}
                placeholder="Nova palavra ou expressao"
              />
              <button
                className="button"
                type="button"
                onClick={() => {
                  if (!customWord.trim()) return;
                  setWordList((current) => [...current, customWord.trim()]);
                  setCustomWord("");
                }}
              >
                Adicionar
              </button>
            </div>
          </div>

          <div>
            <strong>Niveis de sensibilidade</strong>
            <p className="muted">
              Baixo para sinalizacao, medio para ocultacao cautelosa e alto para travas preventivas em picos de risco.
            </p>
          </div>

          <div>
            <strong>Acoes automaticas</strong>
            <div className="grid" style={{ gap: 10, marginTop: 10 }}>
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>Alerta para moderacao</div>
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>Ocultar conteudo automaticamente</div>
              <div style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>Banimento preventivo em risco alto</div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
