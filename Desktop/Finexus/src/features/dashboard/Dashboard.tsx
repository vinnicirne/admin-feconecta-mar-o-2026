import React, { useMemo } from 'react';
import { TransactionType, FinanceCategory, Transaction, PaymentStatus } from '../../types/types';
import { FilterMode } from '../../components/layout/SmartFilterBar';
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';

interface DashboardProps {
  filterMode: FilterMode;
  filterValue: any;
  filterYear: number;
  categoryFilter: FinanceCategory | 'ALL';
  searchQuery: string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onDetail: (t: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  filterMode, filterValue, filterYear,
  categoryFilter, searchQuery,
  onEdit, onDelete, onDetail
}) => {
  const { state } = useFinance();

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      if (categoryFilter !== 'ALL' && t.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      const startDate = new Date(t.date);
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const startTotalMonths = startYear * 12 + startMonth;

      if (filterMode === 'month') {
        const targetTotalMonths = filterYear * 12 + filterValue;
        if (targetTotalMonths < startTotalMonths) return false;
        if (t.isRecurring) return true;
        if (t.installments && t.installments > 1) return targetTotalMonths < (startTotalMonths + t.installments);
        return targetTotalMonths === startTotalMonths;
      }
      return true;
    });
  }, [state.transactions, filterMode, filterValue, filterYear, categoryFilter, searchQuery]);

  const effectiveMonthIndex = filterMode === 'month' ? filterValue : new Date().getMonth();

  const totalIncomePaid = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME && (t.status[effectiveMonthIndex] === PaymentStatus.PAID))
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpensePaid = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE && (t.status[effectiveMonthIndex] === PaymentStatus.PAID))
    .reduce((acc, t) => acc + t.amount, 0);

  const SummaryCard = ({ title, value, icon, gradientClass, isDark = true }: any) => (
    <div className={`p-8 rounded-[2.5rem] ${isDark ? 'text-white ' + gradientClass : 'bg-white border border-slate-100 text-slate-900'} shadow-2xl shadow-slate-200/50 relative overflow-hidden group transition-all hover:-translate-y-2 hover:shadow-3xl`}>
      <div className="relative z-10">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? 'opacity-80' : 'text-slate-400'}`}>{title}</p>
        <h3 className="text-4xl font-black tracking-tight">R$ {value.toLocaleString('pt-BR')}</h3>
      </div>
      <div className="absolute right-6 bottom-6 text-6xl opacity-20 group-hover:scale-125 group-hover:opacity-40 transition-all duration-700">{icon}</div>
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <SummaryCard title="Entradas Liquidadas" value={totalIncomePaid} icon="💰" gradientClass="gradient-emerald" />
        <SummaryCard title="Despesas Liquidadas" value={totalExpensePaid} icon="💸" gradientClass="gradient-rose" />
        <SummaryCard title="Reserva de Lucro" value={state.investment.balance} icon="📈" gradientClass="gradient-blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-slate-900 text-xl mb-1">Perfil de Gasto</h4>
          <p className="text-xs font-medium text-slate-400 mb-10 uppercase tracking-widest">Pessoal vs Profissional</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pessoal', value: Math.max(0.1, filteredTransactions.filter(t => t.category?.toLowerCase().includes('pess')).reduce((a, b) => a + b.amount, 0)) },
                    { name: 'Empresa', value: Math.max(0.1, filteredTransactions.filter(t => t.category?.toLowerCase().includes('prof')).reduce((a, b) => a + b.amount, 0)) },
                  ]}
                  cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none"
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" fill="#f59e0b" stroke="#1e293b" strokeWidth="1" />
                <path d="M8 5V11M6 6.5H9C9.55 6.5 10 6.95 10 7.5C10 8.05 9.55 8.5 9 8.5H7C6.45 8.5 6 8.95 6 9.5C6 10.05 6.45 10.5 7 10.5H10" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                <path d="M4 20H10V16H4V20ZM12 20H18V12H12V20ZM20 20H22V8H20V20Z" fill="#3b82f6" stroke="#1e293b" strokeWidth="1" />
                <path d="M4 14C8 13 14 10 20 6M20 6L17 6M20 6L20 9" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-10">
            <div className="p-4 bg-amber-50 rounded-2xl text-center border border-amber-100">
              <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Pessoal</p>
              <p className="font-black text-slate-800">R$ {filteredTransactions.filter(t => t.category?.toLowerCase().includes('pess')).reduce((a, b) => a + b.amount, 0).toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl text-center border border-blue-100">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Profissional</p>
              <p className="font-black text-slate-800">R$ {filteredTransactions.filter(t => t.category?.toLowerCase().includes('prof')).reduce((a, b) => a + b.amount, 0).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="font-black text-slate-900 text-xl">Movimentações do Período</h4>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Últimos 10 registros filtrados</p>
            </div>
            <span className="bg-slate-50 px-4 py-2 rounded-xl text-[9px] font-black uppercase text-slate-500 tracking-widest border border-slate-100">Live Sync</span>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredTransactions.slice(0, 10).map(t => (
              <div key={t.id} onClick={() => onDetail(t)} className="flex items-center p-6 bg-slate-50/30 rounded-3xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 cursor-pointer transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 text-xl shadow-sm ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {t.type === TransactionType.INCOME ? '↙' : '↗'}
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-800 text-lg leading-none mb-2">{t.description}</p>
                  <div className="flex gap-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${t.category?.toLowerCase().includes('pess') ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{t.category}</span>
                    {t.status[effectiveMonthIndex] === PaymentStatus.PAID && (
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest bg-emerald-100 text-emerald-600">
                        {t.type === TransactionType.INCOME ? 'Recebido' : 'Pago'}
                      </span>
                    )}
                    {t.isRecurring && <span className="text-[8px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Fixo</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onEdit(t)} className="p-3 text-slate-400 hover:text-blue-600 transition-colors">✎</button>
                  <button onClick={() => onDelete(t.id)} className="p-3 text-slate-400 hover:text-rose-500 transition-colors">✕</button>
                </div>
                <p className={`font-black text-xl ml-4 ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>R$ {t.amount.toLocaleString('pt-BR')}</p>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="py-20 text-center opacity-20"><p className="text-sm font-black uppercase tracking-widest">Nenhum lançamento encontrado.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
