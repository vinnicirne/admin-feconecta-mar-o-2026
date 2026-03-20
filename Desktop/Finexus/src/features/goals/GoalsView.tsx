
import React, { useState } from 'react';
import { FinancialGoal } from '../../types/types';

interface GoalsViewProps {
  goals: FinancialGoal[];
  onSave: (goal: Partial<FinancialGoal>) => void;
  onDelete: (id: string) => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ goals, onSave, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: '', targetAmount: '', deadline: '', category: 'DREAM' as any });

  const handleAdd = () => {
    if (!formData.title || !formData.targetAmount) return;
    onSave({ ...formData, targetAmount: Number(formData.targetAmount), currentAmount: 0 });
    setFormData({ title: '', targetAmount: '', deadline: '', category: 'DREAM' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Vision Board</h2>
          <p className="text-slate-500">Transforme lucros profissionais em conquistas pessoais.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95">
          {showAdd ? 'Fechar' : 'Nova Meta'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-[2rem] border border-blue-100 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in slide-in-from-top-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Qual o objetivo?</label>
            <input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
              placeholder="Ex: Viagem Japão"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Valor Alvo (R$)</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <button onClick={handleAdd} className="h-12 bg-blue-600 text-white font-black rounded-xl uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-100">Salvar Meta</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${goal.category === 'ESSENTIAL' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  {goal.category}
                </span>
                <button onClick={() => onDelete(goal.id)} className="text-slate-200 hover:text-rose-400 transition-colors">✕</button>
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2">{goal.title}</h4>
              <p className="text-slate-400 text-xs font-medium mb-8">Data Alvo: {goal.deadline || 'Em aberto'}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Acumulado</p>
                    <p className="text-2xl font-black text-slate-900">R$ {goal.currentAmount.toLocaleString('pt-BR')}</p>
                  </div>
                  <p className="text-xs font-black text-blue-600">{Math.round(progress)}%</p>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>

                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Faltam R$ {(goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsView;
