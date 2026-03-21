"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    CheckCircle2, 
    Circle, 
    ArrowLeft, 
    Sparkles,
    Play,
    BookOpen,
    Calendar,
    ChevronRight,
    Medal
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PlanDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [plan, setPlan] = useState<any>(null);
    const [steps, setSteps] = useState<any[]>([]);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: planData, error: planError } = await supabase
                .from('study_plans')
                .select('*')
                .eq('id', id)
                .single();

            if (planError) throw planError;
            setPlan(planData);

            const { data: stepsData } = await supabase
                .from('study_plan_steps')
                .select('*')
                .eq('plan_id', id)
                .order('day_number', { ascending: true });

            setSteps(stepsData || []);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: enrollData } = await supabase
                    .from('study_plan_enrollments')
                    .select('*')
                    .eq('plan_id', id)
                    .eq('profile_id', user.id)
                    .single();
                setEnrollment(enrollData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            setActionLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { alert("Login ministerial necessário para iniciar uma jornada."); return; }

            const { data, error } = await supabase
                .from('study_plan_enrollments')
                .insert([{
                    plan_id: id,
                    profile_id: user.id,
                    current_day: 1,
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;
            setEnrollment(data);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStep = async (stepId: number) => {
        if (!enrollment) return;
        try {
            const isCompleted = enrollment.completed_steps?.includes(stepId);
            let nextSteps = [...(enrollment.completed_steps || [])];
            
            if (isCompleted) {
                nextSteps = nextSteps.filter(id => id !== stepId);
            } else {
                nextSteps.push(stepId);
            }

            const { error } = await supabase
                .from('study_plan_enrollments')
                .update({ 
                    completed_steps: nextSteps,
                    status: nextSteps.length === steps.length ? 'completed' : 'active'
                })
                .eq('id', enrollment.id);

            if (error) throw error;
            setEnrollment({ ...enrollment, completed_steps: nextSteps });
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ textAlign: "center", padding: 100 }}><Sparkles className="spin" /></div>;
    if (!plan) return <div style={{ padding: 40, textAlign: "center" }}>Plano não encontrado.</div>;

    const completedCount = enrollment?.completed_steps?.length || 0;
    const progressPercent = Math.round((completedCount / (steps.length || 1)) * 100);

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px 120px" }}>
            
            <button onClick={() => router.back()} style={{ background: "none", border: 0, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 32 }}>
                <ArrowLeft size={20} /> Voltar para Planos
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, alignItems: "start" }}>
                
                {/* 🔴 CONTEÚDO PRINCIPAL */}
                <div>
                   <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <span style={{ padding: "4px 12px", background: "var(--primary-soft)", color: "var(--primary)", borderRadius: 8, fontSize: 11, fontWeight: 900 }}>
                         {plan.category || 'DEVOCIONAL'}
                      </span>
                      {plan.is_verified && <span style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", display: "flex", alignItems: "center", gap: 4 }}>★ Comunidade Verificada</span>}
                   </div>
                   
                   <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 16 }}>{plan.title}</h1>
                   <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 40 }}>{plan.description}</p>

                   <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Etapas da Jornada</h3>
                   <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {steps.map((step) => {
                         const isDone = enrollment?.completed_steps?.includes(step.id);
                         return (
                            <div key={step.id} className="card" style={{ padding: 20, borderRadius: 20, display: "flex", gap: 16, alignItems: "center", opacity: enrollment ? 1 : 0.6 }}>
                               <button 
                                 onClick={() => toggleStep(step.id)} 
                                 disabled={!enrollment}
                                 style={{ background: "none", border: 0, cursor: enrollment ? "pointer" : "default", color: isDone ? "#10b981" : "#e2e8f0" }}
                               >
                                  {isDone ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                               </button>
                               <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.6 }}>DIA {step.day_number}</div>
                                  <div style={{ fontWeight: 800, fontSize: 16 }}>{step.title}</div>
                                  {step.bible_reference && <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700, marginTop: 4 }}>📖 {step.bible_reference}</div>}
                               </div>
                               <ChevronRight size={18} className="muted" />
                            </div>
                         );
                      })}
                   </div>
                </div>

                {/* 🔴 LATERAL: STATUS & AÇÕES */}
                <div style={{ position: "sticky", top: 100 }}>
                   <div className="card shadow-sm" style={{ padding: 32, borderRadius: 32, border: "2px solid var(--primary-soft)" }}>
                      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px", display: "grid", placeItems: "center" }}>
                          <svg width="84" height="84" viewBox="0 0 84 84">
                             <circle cx="42" cy="42" r="38" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                             <circle cx="42" cy="42" r="38" stroke="var(--primary)" strokeWidth="8" fill="none" strokeDasharray="238.7" strokeDashoffset={238.7 - (238.7 * progressPercent) / 100} strokeLinecap="round" />
                          </svg>
                          <div style={{ position: "absolute", fontSize: 18, fontWeight: 900 }}>{progressPercent}%</div>
                      </div>

                      <div style={{ textAlign: "center", marginBottom: 32 }}>
                         <div style={{ fontWeight: 900, fontSize: 14 }}>{completedCount} de {steps.length} concluídos</div>
                         <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>Progresso na jornada ministerial</p>
                      </div>

                      {enrollment ? (
                         <div style={{ textAlign: "center", padding: 16, background: "var(--primary-soft)", borderRadius: 16, border: "1px dashed var(--primary)" }}>
                            <Sparkles size={20} className="primary" style={{ margin: "0 auto 8px" }} />
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>Jornada em andamento!</p>
                         </div>
                      ) : (
                         <button 
                           onClick={handleEnroll} 
                           disabled={actionLoading}
                           className="button" 
                           style={{ width: "100%", height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 16, fontWeight: 900 }}
                         >
                            {actionLoading ? "Processando..." : <><Play fill="white" size={18}/> Iniciar Jornada</>}
                         </button>
                      )}

                      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                         <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.5, marginBottom: 4 }}>TEMPO</div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>{plan.duration_days} Dias</div>
                         </div>
                         <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.5, marginBottom: 4 }}>MEMBROS</div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>+1.2k</div>
                         </div>
                      </div>
                   </div>
                </div>

            </div>
        </div>
    );
}
