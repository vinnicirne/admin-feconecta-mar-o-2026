
import React, { useState } from 'react';
import { Investment } from '../../types/types';

interface InvestmentViewProps {
  investment: Investment;
  onUpdate: (amount: number, type: 'DEPOSIT' | 'WITHDRAW', description: string) => void;
}

const InvestmentView: React.FC<InvestmentViewProps> = ({ investment, onUpdate }) => {
  const [amount, setAmount] = useState<string>('');
  const [desc, setDesc] = useState<string>('');

  const handleAction = (type: 'DEPOSIT' | 'WITHDRAW') => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    if (type === 'WITHDRAW' && val > investment.balance) {
      alert("Saldo insuficiente para o resgate.");
      return;
    }

    onUpdate(val, type, desc || (type === 'DEPOSIT' ? 'Depósito' : 'Resgate'));
    setAmount('');
    setDesc('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-600 p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Saldo Disponível em Investimentos</p>
          <h2 className="text-5xl font-black tracking-tighter mb-8">R$ {investment.balance.toLocaleString('pt-BR')}</h2>
          <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
              <p className="text-[8px] font-black text-blue-200 uppercase mb-1">Total de Aportes</p>
              <p className="text-sm font-bold text-white">{investment.history.filter(h => h.type === 'DEPOSIT').length} Movimentações</p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 p-8 opacity-10 text-9xl group-hover:scale-110 transition-transform duration-700">📈</div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-4">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-1">Valor da Operação (R$)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-500 transition-all" />
        </div>
        <div className="lg:col-span-5">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-1">Descrição / Origem</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Lucro do Mês, Reserva de Emergência" className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" />
        </div>
        <div className="lg:col-span-3 flex gap-2">
          <button onClick={() => handleAction('DEPOSIT')} className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-100 transition-all active:scale-95">Depósito</button>
          <button onClick={() => handleAction('WITHDRAW')} className="flex-1 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-rose-100 transition-all active:scale-95">Resgate</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-800">Histórico de Movimentações</h3>
        </div>
        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
          {investment.history.length === 0 ? (
            <div className="p-20 text-center opacity-30 flex flex-col items-center">
              <span className="text-4xl mb-4">📜</span>
              <p className="text-xs font-black uppercase tracking-widest">Ainda não há registros</p>
            </div>
          ) : (
            investment.history.map(h => (
              <div key={h.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {h.type === 'DEPOSIT' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-none mb-1">{h.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(h.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <p className={`font-black ${h.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {h.type === 'DEPOSIT' ? '+' : '-'} R$ {h.amount.toLocaleString('pt-BR')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentView;
