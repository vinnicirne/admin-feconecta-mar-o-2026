"use client";

import { useState, useEffect } from "react";
import { 
    Sparkles, 
    Search, 
    BookOpen, 
    Clock, 
    TrendingUp, 
    Star, 
    Medal,
    ChevronRight,
    Play
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function PlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    const categories = ["Todos", "Fé", "Oração", "Família", "Liderança", "Jovens"];

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('study_plans')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPlans(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPlans = selectedCategory === "Todos" 
        ? plans 
        : plans.filter(p => p.category === selectedCategory);

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px 120px" }}>
            
            {/* 🔴 HEADER & BUSCA */}
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: 8 }}>Cresça na Palavra</h1>
                <p className="muted" style={{ fontSize: "1.1rem" }}>Descubra planos de estudo e devocionais preparados para fortalecer sua caminhada cristã.</p>
                
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={20} className="muted" style={{ position: "absolute", left: 16, top: 14 }} />
                        <input 
                            placeholder="Buscar plano (Ex: Sabedoria, Perdão...)" 
                            style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: 16, border: "2px solid var(--line)", background: "white", fontSize: 15 }}
                        />
                    </div>
                </div>
            </div>

            {/* 🔴 CATEGORIAS */}
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 24 }} className="hide-scroll">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{ 
                            padding: "10px 24px", borderRadius: 12, border: "0", 
                            background: selectedCategory === cat ? "var(--primary)" : "white",
                            color: selectedCategory === cat ? "white" : "#64748b",
                            fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 🔴 EM DESTAQUE */}
            <section style={{ marginBottom: 48 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                     <h2 style={{ fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}>
                        <TrendingUp size={20} className="primary" /> Em Alta no Refúgio
                     </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="card shadow-sm" style={{ height: 320, borderRadius: 24, background: "#f1f5f9" }}></div>)
                    ) : filteredPlans.length === 0 ? (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, border: "2px dashed var(--line)", borderRadius: 32 }}>
                             <Sparkles size={32} className="muted" style={{ margin: "0 auto 12px" }} />
                             <p className="muted">Nenhum plano encontrado nesta categoria hoje.</p>
                        </div>
                    ) : filteredPlans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} />
                    ))}
                </div>
            </section>

            {/* 🔴 MINHAS JORNADAS */}
            <section style={{ marginTop: 60 }}>
                <div style={{ background: "var(--primary)", borderRadius: 32, padding: 32, color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Suas Jornadas</h2>
                        <p style={{ opacity: 0.8, fontSize: 14 }}>Você ainda não se inscreveu em nenhum plano de estudo.</p>
                        <button className="button" style={{ marginTop: 20, background: "white", color: "var(--primary)", fontWeight: 900 }}>
                           Continuar Maratona
                        </button>
                    </div>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center" }}>
                        <Medal size={48} />
                    </div>
                </div>
            </section>
        </div>
    );
}

function PlanCard({ plan }: { plan: any }) {
    return (
        <div className="card shadow-hover" style={{ borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ position: "relative", height: 180, background: plan.cover_url ? `url(${plan.cover_url})` : "var(--primary)", backgroundSize: "cover" }}>
                <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 8, color: "white", fontSize: 10, fontWeight: 900 }}>
                    {plan.category.toUpperCase()}
                </div>
            </div>
            <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.3 }}>{plan.title}</h3>
                <p className="muted" style={{ fontSize: 13, lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 20 }}>
                    {plan.description}
                </p>
                
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                            <Clock size={14} /> {plan.duration_days} Dias
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                            <BookOpen size={14} /> Bíblico
                        </div>
                    </div>
                    <Link href={`/plans/${plan.id}`} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-soft)", display: "grid", placeItems: "center", color: "var(--primary)" }}>
                        <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
