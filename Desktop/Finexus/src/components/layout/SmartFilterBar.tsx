
import React, { useState } from 'react';
import { MONTHS } from '../../constants/constants';
import { FinanceCategory } from '../../types/types';

export type FilterMode = 'day' | 'month' | 'year' | 'period';

interface SmartFilterBarProps {
  mode: FilterMode;
  setMode: (mode: FilterMode) => void;
  value: any;
  setValue: (val: any) => void;
  categoryFilter: FinanceCategory | 'ALL';
  setCategoryFilter: (cat: FinanceCategory | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SmartFilterBar: React.FC<SmartFilterBarProps> = ({
  mode, setMode, value, setValue,
  categoryFilter, setCategoryFilter,
  searchQuery, setSearchQuery
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const modes = [
    { id: 'day', label: 'Visão Diária', icon: '📅' },
    { id: 'month', label: 'Visão Mensal', icon: '🗓️' },
    { id: 'year', label: 'Visão Anual', icon: '📊' },
    { id: 'period', label: 'Período Personalizado', icon: '⏳' },
  ];

  const years = [2024, 2025, 2026];

  const handleModeChange = (newMode: FilterMode) => {
    setMode(newMode);
    setIsOpen(false);
    const now = new Date();
    if (newMode === 'month') setValue(now.getMonth());
    if (newMode === 'year') setValue(now.getFullYear());
    if (newMode === 'day') setValue(now.toISOString().split('T')[0]);
    if (newMode === 'period') setValue('30 DIAS');
  };

  return (
    <div className="relative w-full max-w-[1400px] mx-auto mb-10 space-y-4">
      <div className="flex flex-col xl:flex-row gap-4">

        {/* 1. SELETOR DE MODO (ESTILO MÚLTIPLA ESCOLHA) */}
        <div className="relative min-w-[260px]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white border border-slate-200 hover:border-blue-400 px-5 py-4 rounded-2xl flex items-center justify-between transition-all shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-blue-500 transition-colors bg-white">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${isOpen ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              </div>
              <span className="font-bold text-slate-700 text-sm tracking-tight">
                {modes.find(m => m.id === mode)?.label}
              </span>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleModeChange(m.id as FilterMode)}
                    className={`w-full px-5 py-3.5 flex items-center gap-3 text-sm font-bold transition-colors hover:bg-slate-50 ${mode === m.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'}`}
                  >
                    <span className="text-lg opacity-80">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 2. FILTRO DE CATEGORIA (MIX QUICK TOGGLE) */}
        <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex items-center gap-1 shadow-sm overflow-hidden min-w-[320px]">
          {[
            { id: 'ALL', label: 'Tudo', icon: '💰' },
            { id: FinanceCategory.PROFESSIONAL, label: 'Profissional', icon: '💼' },
            { id: FinanceCategory.PERSONAL, label: 'Pessoal', icon: '👤' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === cat.id
                  ? 'bg-[#1e293b] text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
            >
              <span className="opacity-70">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* 3. BUSCA LIVE */}
        <div className="flex-1 relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar transação por nome..."
            className="w-full bg-white border border-slate-200 h-full min-h-[56px] pl-14 pr-6 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>
      </div>

      {/* 4. ÁREA DINÂMICA DE SUB-FILTROS TEMPORAIS */}
      <div className="bg-white/40 backdrop-blur-md border border-slate-200/50 p-1.5 rounded-[1.5rem] flex items-center gap-1.5 overflow-x-auto scrollbar-hide shadow-inner">
        {mode === 'month' && MONTHS.map((m, idx) => (
          <button
            key={m}
            onClick={() => setValue(idx)}
            className={`flex-1 min-w-[70px] py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${value === idx
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.03]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
          >
            {m}
          </button>
        ))}

        {mode === 'year' && years.map((y) => (
          <button
            key={y}
            onClick={() => setValue(y)}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${value === y
                ? 'bg-slate-900 text-white shadow-xl'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
          >
            EXERCÍCIO {y}
          </button>
        ))}

        {mode === 'day' && (
          <div className="flex-1 flex items-center justify-center p-1 bg-white rounded-xl mx-2">
            <input
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-black text-slate-700 text-sm px-4 py-1 text-center cursor-pointer hover:text-blue-600 transition-colors"
            />
          </div>
        )}

        {mode === 'period' && (
          <div className="flex-1 flex gap-2 p-1">
            {['7 DIAS', '15 DIAS', '30 DIAS', '90 DIAS'].map((p) => (
              <button
                key={p}
                onClick={() => setValue(p)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black transition-all border ${value === p
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                    : 'text-slate-400 border-transparent hover:border-slate-200 hover:bg-white'
                  }`}
              >
                ÚLTIMOS {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartFilterBar;
