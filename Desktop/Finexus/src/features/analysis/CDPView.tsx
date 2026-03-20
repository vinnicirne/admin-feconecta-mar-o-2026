import React, { useMemo } from 'react';
import { TransactionType, PaymentStatus, Transaction, FinanceCategory } from '../../types/types';
import { MONTHS } from '../../constants/constants';
import { FilterMode } from '../../components/layout/SmartFilterBar';
import { useFinance } from '../../context/FinanceContext';

interface CDPViewProps {
  filterMode: FilterMode;
  filterValue: any;
  filterYear: number;
  categoryFilter: FinanceCategory | 'ALL';
  searchQuery: string;
  onDetail: (t: Transaction) => void;
}

const CDPView: React.FC<CDPViewProps> = ({
  filterMode, filterValue, filterYear,
  categoryFilter, searchQuery,
  onDetail
}) => {
  const { state, handleUpdateStatus } = useFinance();

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      // 1. Filtro de Categoria
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;

      // 2. Filtro de Busca
      if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // 3. Lógica Temporal (RECORRÊNCIA)
      const startDate = new Date(t.date);
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const startTotalMonths = startYear * 12 + startMonth;

      if (filterMode === 'month') {
        const targetMonth = filterValue;
        const targetYear = filterYear;
        const targetTotalMonths = targetYear * 12 + targetMonth;

        if (targetTotalMonths < startTotalMonths) return false;
        if (t.isRecurring) return true;
        if (t.installments && t.installments > 1) {
          return targetTotalMonths < (startTotalMonths + t.installments);
        }
        return targetTotalMonths === startTotalMonths;
      }

      if (filterMode === 'day') {
        const targetDate = new Date(filterValue);
        const targetDay = targetDate.getDate();
        if (t.isRecurring) return t.dueDateDay === targetDay && targetDate >= startDate;
        return new Date(t.date).toISOString().split('T')[0] === filterValue;
      }

      if (filterMode === 'year') {
        if (t.isRecurring) return startYear <= filterValue;
        return startYear === filterValue;
      }

      return true;
    });
  }, [state.transactions, filterMode, filterValue, filterYear, categoryFilter, searchQuery]);

  const effectiveMonthIndex = filterMode === 'month' ? filterValue : new Date().getMonth();

  const stats = useMemo(() => {
    const paid = filteredTransactions
      .filter(t => t.status[effectiveMonthIndex] === PaymentStatus.PAID)
      .reduce((acc, t) => t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0);

    const total = filteredTransactions
      .reduce((acc, t) => t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0);

    return { paid, total };
  }, [filteredTransactions, effectiveMonthIndex]);

  const handleToggleStatus = (id: string, currentStatus: PaymentStatus) => {
    const next = currentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID;
    handleUpdateStatus(id, effectiveMonthIndex, next);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Controle de Pagamentos
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {searchQuery ? `Procurando por: "${searchQuery}"` :
              filterMode === 'month' ? `Exibindo lançamentos de ${MONTHS[filterValue]} ${filterYear}` : 'Filtro avançado aplicado'}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Efetivado</p>
            <p className={`text-xl font-black ${stats.paid >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {stats.paid.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-slate-900 px-6 py-3 rounded-2xl shadow-xl shadow-slate-200 text-white text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Previsão Período</p>
            <p className="text-xl font-black">R$ {stats.total.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Lançamento / Categoria</th>
                <th className="px-4 py-6 text-center">Tipo</th>
                <th className="px-4 py-6 text-center">Vencimento</th>
                <th className="px-4 py-6 text-right">Valor</th>
                <th className="px-8 py-6 text-center">Ações de Baixa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <span className="text-5xl mb-4">📭</span>
                      <p className="text-sm font-black uppercase tracking-[0.2em]">Nenhum registro encontrado com estes filtros</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => {
                  const status = t.status[effectiveMonthIndex] || PaymentStatus.UNPAID;
                  const isPaid = status === PaymentStatus.PAID;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => onDetail(t)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors leading-tight">{t.description}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{t.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {t.type === TransactionType.INCOME ? 'CRÉDITO' : 'DÉBITO'}
                        </span>
                      </td>
                      <td className="px-4 py-6 text-center font-black text-slate-500 text-xs">Dia {t.dueDateDay}</td>
                      <td className="px-4 py-6 text-right font-black text-[15px] text-slate-900">R$ {t.amount.toLocaleString('pt-BR')}</td>
                      <td className="px-8 py-6 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleStatus(t.id, status)}
                          className={`w-full max-w-[150px] py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${isPaid
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-100'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-rose-300 hover:text-rose-500'
                            }`}
                        >
                          {isPaid ? '✓ LIQUIDADO' : 'PENDENTE'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CDPView;
