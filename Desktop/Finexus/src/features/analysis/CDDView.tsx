import React, { useState, useMemo } from 'react';
import { TransactionType, Transaction, PaymentStatus } from '../../types/types';
import { MONTHS } from '../../constants/constants';
import { useFinance } from '../../context/FinanceContext';

interface CDDViewProps {
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  filterYear: number;
}

const CDDView: React.FC<CDDViewProps> = ({ onEdit, onDelete, filterYear }) => {
  const { state } = useFinance();
  const [viewType, setViewType] = useState<TransactionType>(TransactionType.EXPENSE);

  const isMonthApplicable = (t: Transaction, monthIndex: number) => {
    const startDate = new Date(t.date);
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();

    const startTotalMonths = startYear * 12 + startMonth;
    const targetTotalMonths = filterYear * 12 + monthIndex;

    if (targetTotalMonths < startTotalMonths) return false;
    if (t.isRecurring) return true;
    if (t.installments && t.installments > 1) {
      return targetTotalMonths < (startTotalMonths + t.installments);
    }
    return targetTotalMonths === startTotalMonths;
  };

  const getMonthlyValue = (t: Transaction, monthIndex: number, onlyPaid: boolean = false) => {
    if (!isMonthApplicable(t, monthIndex)) return 0;
    const status = t.status[monthIndex] || PaymentStatus.UNPAID;
    if (onlyPaid && status !== PaymentStatus.PAID) return 0;
    return t.amount;
  };

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => t.type === viewType);
  }, [state.transactions, viewType]);

  const totals = useMemo(() => {
    const real = filteredTransactions.reduce((acc, t) => {
      return acc + MONTHS.reduce((mAcc, _, i) => mAcc + getMonthlyValue(t, i, true), 0);
    }, 0);
    const proj = filteredTransactions.reduce((acc, t) => {
      return acc + MONTHS.reduce((mAcc, _, i) => mAcc + getMonthlyValue(t, i, false), 0);
    }, 0);
    return { real, proj };
  }, [filteredTransactions, filterYear]);

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* SELETOR DE FLUXO */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setViewType(TransactionType.INCOME)}
            className={`flex-1 md:w-48 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${viewType === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
          >
            <span className="text-sm">↙</span> Ver Entradas
          </button>
          <button
            onClick={() => setViewType(TransactionType.EXPENSE)}
            className={`flex-1 md:w-48 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${viewType === TransactionType.EXPENSE ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
          >
            <span className="text-sm">↗</span> Ver Saídas
          </button>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Realizado {filterYear}</p>
            <p className={`text-xl font-black ${viewType === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
              R$ {totals.real.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
          <div className="flex-1 md:flex-none text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Projetado Anual</p>
            <p className="text-xl font-black text-slate-900">
              R$ {totals.proj.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* TABELA ANUAL */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-900 text-slate-500 uppercase text-[9px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-6 sticky left-0 bg-slate-900 z-30 border-r border-white/5 w-[250px]">Lançamento</th>
                {MONTHS.map(m => (
                  <th key={m} className="px-2 py-6 text-center border-r border-white/5">{m}</th>
                ))}
                <th className="px-8 py-6 text-right sticky right-0 bg-slate-800 z-30 text-white">Total Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-24 text-center opacity-20">
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhum registro de {viewType === TransactionType.INCOME ? 'Entrada' : 'Saída'}</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 sticky left-0 bg-white border-r border-slate-100 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-[13px] leading-tight truncate">{t.description}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${t.category === 'Pessoal' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {t.category}
                          </span>
                          {t.isRecurring && <span className="text-[7px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black tracking-widest">FIXO</span>}
                        </div>
                      </div>
                    </td>

                    {MONTHS.map((_, i) => {
                      const val = getMonthlyValue(t, i, false);
                      const isPaid = (t.status[i] || PaymentStatus.UNPAID) === PaymentStatus.PAID;

                      return (
                        <td key={i} className="px-1 py-5 text-center border-r border-slate-50">
                          {val > 0 ? (
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-black ${isPaid ? (viewType === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900') : 'text-slate-300'}`}>
                                {val.toLocaleString('pt-BR')}
                              </span>
                              {!isPaid && <span className="text-[6px] font-black text-slate-200 uppercase tracking-tighter">PREV</span>}
                            </div>
                          ) : (
                            <span className="text-slate-100 text-[10px]">—</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-8 py-5 text-right font-black text-[13px] bg-slate-50 sticky right-0 z-20 text-slate-900 border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
                      R$ {(MONTHS.reduce((acc, _, i) => acc + getMonthlyValue(t, i, true), 0)).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
                <td className="px-8 py-5 sticky left-0 bg-slate-50 z-30 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Totais Mensais</td>
                {MONTHS.map((_, i) => {
                  const monthlyTotal = filteredTransactions.reduce((acc, t) => acc + getMonthlyValue(t, i, true), 0);
                  return (
                    <td key={i} className="px-1 py-5 text-center border-r border-slate-100">
                      R$ {monthlyTotal.toLocaleString('pt-BR')}
                    </td>
                  );
                })}
                <td className="px-8 py-5 text-right sticky right-0 bg-slate-900 text-white z-30">
                  R$ {totals.real.toLocaleString('pt-BR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="md:hidden text-center text-slate-400 text-[8px] font-black uppercase tracking-[0.3em]">
        Arraste a tabela para o lado para ver todos os meses ↔
      </div>
    </div>
  );
};

export default CDDView;
