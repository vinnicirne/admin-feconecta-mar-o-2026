"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { ManagedCommunity } from "@/types";

type CommunityManagementPanelProps = {
  communities: ManagedCommunity[];
};

export function CommunityManagementPanel({ communities }: CommunityManagementPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(communities[0]?.id ?? "");

  const filteredCommunities = useMemo(() => {
    return communities.filter((community) => {
      return [community.name, community.category, community.leader]
        .some((value) => value.toLowerCase().includes(query.toLowerCase()));
    });
  }, [communities, query]);

  const selectedCommunity =
    filteredCommunities.find((community) => community.id === selectedId) ??
    filteredCommunities[0] ??
    communities[0];

  return (
    <section className="grid" style={{ gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.95fr)" }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="pill" style={{ background: "rgba(15, 118, 110, 0.1)", color: "var(--primary)" }}>Igrejas & Grupos</span>
            <h2 style={{ marginTop: 12, marginBottom: 4, fontSize: "1.8rem", fontWeight: 800 }}>Gestão de Comunidades</h2>
            <p className="muted" style={{ margin: 0 }}>Funde novas igrejas, monitore o crescimento e aplique governança ministerial.</p>
          </div>
          <button className="button" style={{ height: 44, padding: "0 20px", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
             <Plus size={18} /> Nova Comunidade
          </button>
        </div>

        <label style={{ display: "block", marginTop: 20 }}>
          <span>Buscar comunidade</span>
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, categoria ou lider"
          />
        </label>

        <div className="grid" style={{ marginTop: 20 }}>
          {filteredCommunities.map((community) => (
            <article
              key={community.id}
              style={{
                borderRadius: 20,
                border: "1px solid var(--line)",
                padding: 18,
                background: "rgba(255,255,255,0.58)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <div>
                  <strong>{community.name}</strong>
                  <p className="muted" style={{ margin: "6px 0" }}>
                    {community.category} • Lider: {community.leader}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "end" }}>
                  {community.verified ? <span className="pill">Selo azul</span> : null}
                  {community.featured ? <span className="pill">Destaque</span> : null}
                  <span className="pill">{community.status}</span>
                </div>
              </div>
              <p className="muted">{community.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <span>
                  <strong>{community.members.toLocaleString("pt-BR")}</strong> membros • {community.growth}
                </span>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setSelectedId(community.id)}
                  style={{ padding: "8px 12px" }}
                >
                  Abrir
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedCommunity ? (
        <aside className="card" style={{ padding: 24 }}>
          <span className="pill">Visao da comunidade</span>
          <h2 style={{ marginBottom: 6 }}>{selectedCommunity.name}</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {selectedCommunity.category} • Lider: {selectedCommunity.leader}
          </p>

          <div className="grid" style={{ gap: 12 }}>
            <div>
              <strong>Membros</strong>
              <p className="muted">{selectedCommunity.members.toLocaleString("pt-BR")}</p>
            </div>
            <div>
              <strong>Crescimento</strong>
              <p className="muted">{selectedCommunity.growth}</p>
            </div>
            <div>
              <strong>Posts internos</strong>
              <p className="muted">{selectedCommunity.internalPosts}</p>
            </div>
            <div>
              <strong>Status</strong>
              <p className="muted">{selectedCommunity.status}</p>
            </div>
            <div>
              <strong>Descricao</strong>
              <p className="muted">{selectedCommunity.description}</p>
            </div>
            <div>
              <strong>Posts recentes</strong>
              <div className="grid" style={{ gap: 10 }}>
                {selectedCommunity.recentPosts.map((post, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 16,
                      padding: 12,
                      background: "rgba(255,255,255,0.54)"
                    }}
                  >
                    {post}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: 20 }}>
            <button className="button secondary" type="button" onClick={() => alert("Exibindo lista de membros da comunidade...")}>Ver membros</button>
            <button className="button secondary" type="button" onClick={() => alert("Abrindo painel do Mural (Posts)...")}>Mural da Comunidade</button>
            <button className="button secondary" type="button" onClick={() => alert("Gestão de grupos/ministérios aberta!")}>Gerir Ministérios</button>
            <button className="button secondary" type="button" onClick={() => alert("Derrubando conexões de sala de guerra...")}>Encerrar Salas Ativas</button>
            <button className="button secondary" type="button">Editar infos</button>
            <button className="button" type="button" style={{ background: "var(--danger)", color: "white", fontWeight: 700 }}>
              Suspender comunidade
            </button>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
