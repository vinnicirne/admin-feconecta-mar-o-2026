"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  XSquare,
  Sparkles,
  Loader2
} from "lucide-react";

export function FeatureManager() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('app_features').select('*').order('name');
      if (error) throw error;
      setFeatures(data || []);
    } catch (err) {
      console.error("ERRO AO BUSCAR FEATURES:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (id: string, currentState: boolean, name: string) => {
    try {
      setUpdating(id);
      const { error } = await supabase
        .from('app_features')
        .update({ is_enabled: !currentState, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, is_enabled: !currentState } : f));
    } catch (err) {
      alert("Falha ao atualizar funcionalidade ministerial.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
        <Loader2 className="spin" /> Caregando configurações do reino...
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32, borderRadius: 24, background: "white", marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
         <Sparkles size={20} className="primary" />
         <h3 style={{ margin: 0, fontWeight: 800 }}>Gestão de Funcionalidades (App Social)</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {features.map((feature) => (
          <div 
            key={feature.id} 
            style={{ 
              padding: "16px 20px", borderRadius: 16, border: "1px solid var(--line)", 
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: feature.is_enabled ? "white" : "#f1f5f9",
              opacity: feature.is_enabled ? 1 : 0.7,
              transition: "0.2s"
            }}
          >
            <div>
               <div style={{ fontSize: 13, fontWeight: 800, color: feature.is_enabled ? "black" : "var(--muted)" }}>{feature.label}</div>
               <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5 }}>IDENTIFICADOR: {feature.name}</div>
            </div>

            <button 
              onClick={() => toggleFeature(feature.id, feature.is_enabled, feature.name)}
              disabled={updating === feature.id}
              style={{ 
                background: "none", border: 0, cursor: updating === feature.id ? "not-allowed" : "pointer",
                color: feature.is_enabled ? "var(--primary)" : "#94a3b8",
                display: "grid", placeItems: "center"
              }}
            >
               {updating === feature.id ? (
                 <Loader2 size={24} className="spin" />
               ) : feature.is_enabled ? (
                 <ToggleRight size={32} />
               ) : (
                 <ToggleLeft size={32} />
               )}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: "12px 16px", background: "var(--primary-soft)", borderRadius: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <CheckCircle2 size={16} className="primary" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)" }}>Alterações são aplicadas em tempo real para todos os membros logados.</span>
      </div>
    </div>
  );
}
