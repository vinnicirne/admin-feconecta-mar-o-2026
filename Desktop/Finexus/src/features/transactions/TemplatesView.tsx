
import React, { useState } from 'react';
import { ExpenseTemplate, FinanceCategory } from '../../types/types';

interface TemplatesViewProps {
  templates: ExpenseTemplate[];
  onAdd: (name: string, category: FinanceCategory) => void;
  onDelete: (id: string) => void;
}

const TemplatesView: React.FC<TemplatesViewProps> = ({ templates, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<FinanceCategory>(FinanceCategory.PROFESSIONAL);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName, newCat);
    setNewName('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Formulário de Cadastro Corrigido */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          Novo Cadastro de Despesa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          <div className="md:col-span-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Despesa</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: Aluguel Escritório, MEI..."
              className="w-full h-[52px] px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-700 placeholder:font-medium"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria Sugerida</label>
            <div className="relative">
              <select
                value={newCat}
                onChange={e => setNewCat(e.target.value as FinanceCategory)}
                className="w-full h-[52px] px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value={FinanceCategory.PROFESSIONAL}>💼 Profissional</option>
                <option value={FinanceCategory.PERSONAL}>👤 Pessoal</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              onClick={handleAdd}
              className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all uppercase text-xs tracking-widest"
            >
              CADASTRAR
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Modelos */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-800">Modelos Ativos</h3>
          <p className="text-sm text-slate-400 font-medium">Estes nomes facilitam o lançamento rápido no sistema.</p>
        </div>
        <div className="divide-y divide-slate-50">
          {templates.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-4">📑</div>
              <p className="text-slate-400 font-medium">Nenhum modelo cadastrado.</p>
            </div>
          ) : (
            templates.map(t => (
              <div key={t.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors group border-l-4 border-transparent hover:border-blue-600">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-xl shadow-sm ${t.defaultCategory === FinanceCategory.PROFESSIONAL ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                    {t.defaultCategory === FinanceCategory.PROFESSIONAL ? '💼' : '👤'}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">{t.name}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block ${t.defaultCategory === FinanceCategory.PROFESSIONAL ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {t.defaultCategory}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(t.id); }}
                  className="w-12 h-12 flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-100 rounded-2xl transition-all shadow-sm hover:bg-rose-100 active:scale-90"
                  title="Excluir"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesView;
