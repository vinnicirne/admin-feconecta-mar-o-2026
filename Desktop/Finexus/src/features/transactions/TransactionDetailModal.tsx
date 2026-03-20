
import React from 'react';
import { Transaction, TransactionType, FinanceCategory, PaymentStatus } from '../../types/types';
import { MONTHS } from '../../constants/constants';

interface TransactionDetailModalProps {
  transaction: Transaction;
  currentMonth: number;
  onClose: () => void;
  onEdit: (t: Transaction) => void;
  onSave?: (t: Transaction) => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  currentMonth,
  onClose,
  onEdit,
  onSave
}) => {
  const isPaid = (transaction.status[currentMonth] || PaymentStatus.UNPAID) === PaymentStatus.PAID;

  const handleToggleCategory = () => {
    if (!onSave) return;
    const newCategory = transaction.category === FinanceCategory.PERSONAL
      ? FinanceCategory.PROFESSIONAL
      : FinanceCategory.PERSONAL;

    onSave({
      ...transaction,
      category: newCategory
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        {/* Banner de Cor Superior */}
        <div className={`h-32 w-full ${transaction.type === TransactionType.INCOME ? 'bg-emerald-500' : 'bg-rose-500'} relative`}>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl">
              {transaction.type === TransactionType.INCOME ? '💰' : '💸'}
            </div>
          </div>
        </div>

        <div className="pt-14 px-8 pb-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${transaction.category === FinanceCategory.PERSONAL ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {transaction.category}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {isPaid ? 'PAGO' : 'PENDENTE'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{transaction.description}</h2>
              <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">
                R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Quick Action: Editar Categoria */}
            <button
              onClick={handleToggleCategory}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 group ${transaction.category === FinanceCategory.PERSONAL ? 'border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100' : 'border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
              title="Alternar Categoria"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                {transaction.category === FinanceCategory.PERSONAL ? '💼' : '👤'}
              </span>
              <span className="text-[8px] font-black uppercase tracking-tighter">Mudar para {transaction.category === FinanceCategory.PERSONAL ? 'Prof' : 'Pers'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
              <p className="font-bold text-slate-700">Todo dia {transaction.dueDateDay}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Periodicidade</p>
              <p className="font-bold text-slate-700">{transaction.isRecurring ? 'Recorrente (Mensal)' : 'Lançamento Único'}</p>
            </div>
          </div>

          {transaction.installments && transaction.installments > 1 && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Plano de Parcelamento</p>
                <span className="text-xs font-black text-blue-700">{transaction.installments} Parcelas</span>
              </div>
              <div className="mt-2 w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-1/3"></div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => { onEdit(transaction); onClose(); }}
              className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Editar Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
