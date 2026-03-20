
import React, { useState, useMemo, useEffect } from 'react';
import { TransactionType, FinanceCategory, Transaction, ExpenseTemplate, PaymentStatus } from '../../types/types';
import { MONTHS } from '../../constants/constants';

interface TransactionModalProps {
  onClose: () => void;
  onAdd: (t: Transaction) => void;
  initialData?: Transaction;
  templates: ExpenseTemplate[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ onClose, onAdd, initialData, templates }) => {
  const now = new Date();
  const [formData, setFormData] = useState({
    description: '',
    selectedTemplateId: 'manual',
    amount: '',
    type: TransactionType.EXPENSE,
    category: FinanceCategory.PERSONAL,
    isRecurring: false,
    installments: '',
    dueDateDay: now.getDate().toString(),
    startMonth: now.getMonth(),
    startYear: now.getFullYear(),
    isPaid: true
  });

  useEffect(() => {
    if (initialData) {
      const d = new Date(initialData.date);
      const matchedTemplate = templates.find(t => t.name === initialData.description);
      setFormData({
        description: initialData.description,
        selectedTemplateId: matchedTemplate ? matchedTemplate.id : 'manual',
        amount: initialData.amount.toString(),
        type: initialData.type,
        category: initialData.category,
        isRecurring: !!initialData.isRecurring,
        installments: initialData.installments?.toString() || '',
        dueDateDay: initialData.dueDateDay.toString(),
        startMonth: d.getMonth(),
        startYear: d.getFullYear(),
        isPaid: initialData.status[d.getMonth()] === PaymentStatus.PAID
      });
    }
  }, [initialData, templates]);

  const handleTemplateChange = (id: string) => {
    if (id === 'manual') {
      setFormData(prev => ({ ...prev, selectedTemplateId: id, description: '' }));
    } else {
      const t = templates.find(item => item.id === id);
      if (t) {
        setFormData(prev => ({
          ...prev,
          selectedTemplateId: id,
          description: t.name,
          category: t.defaultCategory,
          type: TransactionType.EXPENSE
        }));
      }
    }
  };

  const isInstallmentMode = useMemo(() => {
    const instCount = parseInt(formData.installments || '0');
    return !formData.isRecurring && instCount > 1;
  }, [formData.isRecurring, formData.installments]);

  const calculatedTotal = useMemo(() => {
    const val = parseFloat(formData.amount || '0');
    const inst = parseInt(formData.installments || '1');
    return val * (isInstallmentMode ? inst : 1);
  }, [formData.amount, formData.installments, isInstallmentMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const constructedDate = new Date(formData.startYear, formData.startMonth, parseInt(formData.dueDateDay));

    const newTransaction: Transaction = {
      id: initialData ? initialData.id : Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: constructedDate.toISOString().split('T')[0],
      type: formData.type,
      category: formData.category,
      isRecurring: formData.isRecurring,
      installments: formData.installments ? parseInt(formData.installments) : undefined,
      dueDateDay: parseInt(formData.dueDateDay),
      status: initialData ? { ...initialData.status, [formData.startMonth]: formData.isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID } : { [formData.startMonth]: formData.isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID }
    };

    onAdd(newTransaction);
    onClose();
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium";
  const labelClasses = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1";
  const selectMiniClasses = "bg-white border border-slate-200 rounded-lg text-[11px] font-black px-3 py-2 outline-none text-slate-600 cursor-pointer hover:border-blue-300 transition-colors appearance-none";

  const profTemplates = templates.filter(t => t.defaultCategory === FinanceCategory.PROFESSIONAL);
  const personalTemplates = templates.filter(t => t.defaultCategory === FinanceCategory.PERSONAL);

  const themeColors = formData.category === FinanceCategory.PERSONAL
    ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'peer-checked:bg-amber-600', card: 'bg-amber-50/50 border-amber-100', badge: 'bg-amber-600' }
    : { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'peer-checked:bg-blue-600', card: 'bg-blue-50/50 border-blue-100', badge: 'bg-blue-600' };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestão Financeira Inteligente</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto scrollbar-hide">

          {/* NOME / DESCRIÇÃO - AGORA É O PRIMEIRO ITEM */}
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Nome / Descrição</label>
              <select
                value={formData.selectedTemplateId}
                onChange={e => handleTemplateChange(e.target.value)}
                className={inputClasses}
              >
                <option value="manual">➕ Digitar Novo Nome</option>
                {profTemplates.length > 0 && (
                  <optgroup label="💼 Modelos Profissionais">
                    {profTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                )}
                {personalTemplates.length > 0 && (
                  <optgroup label="👤 Modelos Pessoais">
                    {personalTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                )}
              </select>
            </div>

            {formData.selectedTemplateId === 'manual' && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <input
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={inputClasses}
                  placeholder="O que está sendo lançado?"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Tipo</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}
                className={`${inputClasses} ${formData.type === TransactionType.INCOME ? 'border-emerald-200 text-emerald-700' : 'border-rose-200 text-rose-700'}`}
              >
                <option value={TransactionType.INCOME}>💰 Entrada (Recebimento)</option>
                <option value={TransactionType.EXPENSE}>💸 Saída (Pagamento)</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Categoria Destino</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as FinanceCategory })}
                className={`${inputClasses} ${themeColors.border} ${themeColors.text} font-black`}
              >
                <option value={FinanceCategory.PERSONAL}>👤 Pessoal</option>
                <option value={FinanceCategory.PROFESSIONAL}>💼 Profissional</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Período de Referência</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <select
                  value={formData.startMonth}
                  onChange={e => setFormData({ ...formData, startMonth: parseInt(e.target.value) })}
                  className={`${selectMiniClasses} w-full`}
                >
                  {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <div className="relative">
                <select
                  value={formData.startYear}
                  onChange={e => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
                  className={`${selectMiniClasses} w-full`}
                >
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] flex items-center justify-between">
            <div>
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block ml-1">Status do Pagamento</label>
              <p className="text-xs font-bold text-emerald-600/70 ml-1">Marcar como liquidada agora?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPaid}
                onChange={e => setFormData({ ...formData, isPaid: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[21px] after:w-[21px] after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-black uppercase tracking-wider text-emerald-700 w-16">
                {formData.isPaid ? 'PAGO' : 'PENDENTE'}
              </span>
            </label>
          </div>

          <div className={`p-6 ${themeColors.card} rounded-[1.5rem] border transition-all duration-300 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={e => setFormData({ ...formData, isRecurring: e.target.checked, installments: e.target.checked ? '' : formData.installments })}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${themeColors.ring}`}></div>
                </label>
                <span className={`text-xs font-black uppercase tracking-wider ${formData.isRecurring ? themeColors.text : 'text-slate-500'}`}>
                  Lançamento Fixo (Mensal)
                </span>
              </div>
              <div className={`${themeColors.badge} text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm`}>
                {formData.category}
              </div>
            </div>

            {!formData.isRecurring && (
              <div className="pt-4 border-t border-slate-200/30 animate-in slide-in-from-top-2 duration-200">
                <label className={labelClasses}>Número de Parcelas</label>
                <input
                  type="number" min="1"
                  value={formData.installments}
                  onChange={e => setFormData({ ...formData, installments: e.target.value })}
                  className={`${inputClasses} bg-white text-slate-900`}
                  placeholder="Vazio para à vista"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={`${labelClasses} ${isInstallmentMode || formData.isRecurring ? themeColors.text : ''}`}>
                {isInstallmentMode || formData.isRecurring ? "Valor Parcela (R$)" : "Valor Total (R$)"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                <input
                  required type="number" step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className={`${inputClasses} pl-10 text-slate-900`}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Dia de Vencimento</label>
              <input
                type="number" min="1" max="31"
                value={formData.dueDateDay}
                onChange={e => setFormData({ ...formData, dueDateDay: e.target.value })}
                className={inputClasses}
              />
            </div>
          </div>

          {isInstallmentMode && (
            <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-xl animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Calculado</p>
                  <p className="text-2xl font-black text-emerald-400">R$ {calculatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Resumo</p>
                  <p className="text-xs font-bold text-slate-300">{formData.installments}x de R$ {formData.amount}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-4 rounded-2xl transition-all uppercase text-[10px] tracking-widest">Cancelar</button>
            <button type="submit" className={`${formData.category === FinanceCategory.PERSONAL ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'} flex-[2] text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest`}>
              {initialData ? 'Atualizar' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
