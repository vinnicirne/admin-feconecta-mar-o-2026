import React, { useState, useEffect } from 'react';
import { analyzeFinances } from '../../services/geminiService';
import { useFinance } from '../../context/FinanceContext';

interface AIAnalysisProps {
}

const AIAnalysis: React.FC<AIAnalysisProps> = () => {
  const { state } = useFinance();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "Sincronizando banco de dados FiNexus...",
    "Analisando mix de gastos com Nina...",
    "Verificando aportes de investimento...",
    "Projetando fluxo de caixa estratégico...",
    "Finalizando consultoria inteligente..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      const result = await analyzeFinances(state);
      setAnalysis(result || "Não foi possível gerar a análise.");
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao processar dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-2 md:px-0">
      <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-white text-center relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
            <span className="text-4xl">🔮</span>
          </div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">Consultoria Estratégica FiNexus</h2>
          <p className="text-indigo-100 mb-10 max-w-lg mx-auto font-medium">
            Nossa inteligência artificial analisa cada centavo para ajudar você a separar de vez o pessoal do profissional.
          </p>

          <button
            onClick={runAnalysis}
            disabled={loading}
            className={`
              relative group overflow-hidden bg-white text-indigo-900 font-black px-12 py-5 rounded-2xl shadow-xl transition-all active:scale-95
              ${loading ? 'opacity-90 cursor-wait' : 'hover:bg-indigo-50 hover:-translate-y-1'}
            `}
          >
            <div className="flex items-center gap-3">
              {loading && <div className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>}
              <span className="uppercase text-xs tracking-[0.2em]">
                {loading ? 'Nina está analisando...' : 'Gerar Análise Estratégica'}
              </span>
            </div>
          </button>

          {loading && (
            <div className="mt-8 animate-pulse">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">
                {steps[loadingStep]}
              </p>
              <div className="w-48 h-1 bg-white/20 mx-auto rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl text-center">
          <p className="text-rose-600 font-black text-sm uppercase tracking-widest mb-4">⚠️ Erro Detectado</p>
          <p className="text-rose-500 font-medium mb-4">{error}</p>
          <button onClick={runAnalysis} className="text-xs font-black text-rose-600 underline uppercase tracking-widest">Tentar Novamente</button>
        </div>
      )}

      {analysis && (
        <div className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-100">🤖</div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">Relatório FiNexus AI</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Gerado por Nina em {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <button onClick={() => window.print()} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-700 prose-p:leading-relaxed text-slate-800 whitespace-pre-wrap">
            {analysis}
          </div>

          <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
            <span className="text-xl">💡</span>
            <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-wide">
              Este relatório é gerado por IA e deve ser validado com seu contador. O FiNexus utiliza modelos de probabilidade para sugerir melhorias de fluxo.
            </p>
          </div>
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "01", title: "Pró-labore Fixo", text: "Defina um valor fixo mensal para não sangrar o caixa da sua empresa com gastos pessoais inesperados.", color: "indigo" },
            { id: "02", title: "Reserva Tributária", text: "Sempre separe uma porcentagem de cada entrada profissional para impostos futuros, evitando surpresas.", color: "emerald" },
            { id: "03", title: "Cartões Separados", text: "Utilize contas bancárias diferentes. O sistema FiNexus ajuda a rastrear, mas a disciplina começa na origem.", color: "amber" }
          ].map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all hover:-translate-y-1 shadow-sm">
              <div className={`w-10 h-10 bg-${item.color}-50 text-${item.color}-600 rounded-xl flex items-center justify-center font-black mb-4`}>{item.id}</div>
              <h4 className="font-black text-slate-800 mb-2 uppercase text-[10px] tracking-widest">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
