"use client";

import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight,
  Target,
  Globe,
  PlusCircle,
  Clock
} from "lucide-react";

export default function MetricsPage() {
  return (
    <div style={{ padding: 40 }}>
      {/* 🔴 HEADER */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TrendingUp className="primary" size={24} />
          <span style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, fontSize: 13, color: "var(--muted)" }}>BI Ministerial</span>
        </div>
        <h1 style={{ fontSize: "2.8rem", fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>Métricas de Expansão</h1>
      </div>

      {/* 🔴 METRIC GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 40 }}>
        <div className="card" style={{ padding: 32, borderRadius: 24, background: "white" }}>
          <div style={{ padding: 12, borderRadius: 12, background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", width: "fit-content", marginBottom: 20 }}>
            <Users size={20} />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 4px" }}>1,248</h2>
          <p className="muted" style={{ fontWeight: 700, margin: 0 }}>Membros Ativos</p>
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#10b981", display: "flex", gap: 6 }}>
            <ArrowUpRight size={14} /> +12% este mês
          </div>
        </div>

        <div className="card" style={{ padding: 32, borderRadius: 24, background: "white" }}>
          <div style={{ padding: 12, borderRadius: 12, background: "rgba(16, 185, 129, 0.1)", color: "#10b981", width: "fit-content", marginBottom: 20 }}>
            <Target size={20} />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 4px" }}>89.2%</h2>
          <p className="muted" style={{ fontWeight: 700, margin: 0 }}>Retenção Ministerial</p>
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#10b981", display: "flex", gap: 6 }}>
            <ArrowUpRight size={14} /> +2.4% vs LTM
          </div>
        </div>

        <div className="card" style={{ padding: 32, borderRadius: 24, background: "white" }}>
          <div style={{ padding: 12, borderRadius: 12, background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", width: "fit-content", marginBottom: 20 }}>
            <BarChart size={20} />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 4px" }}>452</h2>
          <p className="muted" style={{ fontWeight: 700, margin: 0 }}>Mensagens / Dia</p>
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#f59e0b", display: "flex", gap: 6 }}>
            <Clock size={14} /> Estável
          </div>
        </div>

        <div className="card" style={{ padding: 32, borderRadius: 24, background: "white" }}>
          <div style={{ padding: 12, borderRadius: 12, background: "rgba(236, 72, 153, 0.1)", color: "#ec4899", width: "fit-content", marginBottom: 20 }}>
            <Globe size={20} />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 4px" }}>14</h2>
          <p className="muted" style={{ fontWeight: 700, margin: 0 }}>Cidades Alcançadas</p>
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#10b981", display: "flex", gap: 6 }}>
             Novo Pólo: Curitiba
          </div>
        </div>
      </div>

      {/* 🔴 GRAFICOS EM BREVE */}
      <div className="card" style={{ padding: 64, borderRadius: 32, textAlign: "center", border: "2px dashed var(--line)", background: "rgba(0,0,0,0.01)" }}>
         <PlusCircle size={48} className="muted" style={{ marginBottom: 20, opacity: 0.2 }} />
         <h2 className="muted" style={{ fontWeight: 800 }}>Infraestrutura de Dados em Processamento</h2>
         <p className="muted" style={{ maxWidth: 500, margin: "10px auto 32px" }}>O motor de análise ministerial está sendo calibrado. Em breve você terá visão profunda de cada interação.</p>
         <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "8px 16px", borderRadius: 20, background: "var(--line)" }}>RETENÇÃO</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "8px 16px", borderRadius: 20, background: "var(--line)" }}>ENGAJAMENTO</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "8px 16px", borderRadius: 20, background: "var(--line)" }}>FIDELIDADE</span>
         </div>
      </div>
    </div>
  );
}
