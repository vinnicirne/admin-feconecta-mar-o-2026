import React, { useState, Suspense, lazy } from 'react';
import { Transaction, FinanceCategory, ShoppingList } from './types/types';
import Sidebar from './components/layout/Sidebar';
import SmartFilterBar, { FilterMode } from './components/layout/SmartFilterBar';
import VoiceAssistant from './features/nina/VoiceAssistant';
import { useFinance } from './context/FinanceContext';

// Lazy loading views
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const CDDView = lazy(() => import('./features/analysis/CDDView'));
const CDPView = lazy(() => import('./features/analysis/CDPView'));
const InvestmentView = lazy(() => import('./features/investments/InvestmentView'));
const AIAnalysis = lazy(() => import('./features/analysis/AIAnalysis'));
const TemplatesView = lazy(() => import('./features/transactions/TemplatesView'));
const ShoppingView = lazy(() => import('./features/shopping/ShoppingView'));
const GoalsView = lazy(() => import('./features/goals/GoalsView'));
const TransactionModal = lazy(() => import('./features/transactions/TransactionModal'));
const TransactionDetailModal = lazy(() => import('./features/transactions/TransactionDetailModal'));

const App: React.FC = () => {
  const {
    state,
    loading,
    handleSaveTransaction,
    handleDeleteTransaction,
    handleUpdateStatus,
    handleInvestmentUpdate,
    handleSaveShoppingList,
    handleDeleteShoppingList,
    handleSaveGoal,
    handleDeleteGoal,
    handleSaveTemplate,
    handleDeleteTemplate
  } = useFinance();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [filterMode, setFilterMode] = useState<FilterMode>('month');
  const [filterValue, setFilterValue] = useState<any>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [categoryFilter, setCategoryFilter] = useState<FinanceCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);

  const wrapHandleDeleteTransaction = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este lançamento?")) {
      await handleDeleteTransaction(id);
    }
  };

  const wrapHandleDeleteTemplate = async (id: string) => {
    if (window.confirm("Excluir este modelo de cadastro?")) {
      await handleDeleteTemplate(id);
    }
  };

  const onSaveTransaction = async (t: Transaction) => {
    const saved = await handleSaveTransaction(t);
    if (saved && detailTransaction?.id === saved.id) setDetailTransaction(saved);
    setIsModalOpen(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-blue-600 animate-pulse uppercase tracking-widest">Carregando FiNexus...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-x-hidden relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={false} onClose={() => { }} />
      <main className="flex-1 w-full md:ml-64 px-4 py-6 md:p-10">
        <header className="flex justify-between items-end mb-8 no-print">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Financial Overview</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {activeTab === 'dashboard' ? 'Dashboard' : activeTab}
            </h2>
          </div>
          <button
            onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
            className="gradient-blue text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:-translate-y-1 transition-all active:scale-95"
          >
            + Novo Lançamento
          </button>
        </header>

        {(activeTab === 'dashboard' || activeTab === 'cdp') && (
          <SmartFilterBar mode={filterMode} setMode={setFilterMode} value={filterValue} setValue={setFilterValue} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}

        <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
          <Suspense fallback={<div className="py-20 text-center animate-pulse font-black text-blue-600 uppercase tracking-widest text-[10px]">Sincronizando visão...</div>}>
            {activeTab === 'dashboard' && <Dashboard filterMode={filterMode} filterValue={filterValue} filterYear={filterYear} categoryFilter={categoryFilter} searchQuery={searchQuery} onEdit={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} onDelete={wrapHandleDeleteTransaction} onDetail={setDetailTransaction} />}
            {activeTab === 'cdd' && <CDDView onEdit={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} onDelete={wrapHandleDeleteTransaction} filterYear={filterYear} />}
            {activeTab === 'cdp' && <CDPView filterMode={filterMode} filterValue={filterValue} filterYear={filterYear} categoryFilter={categoryFilter} searchQuery={searchQuery} onDetail={setDetailTransaction} />}
            {activeTab === 'shopping' && <ShoppingView lists={state.shoppingLists} onSave={handleSaveShoppingList} onDelete={handleDeleteShoppingList} />}
            {activeTab === 'goals' && <GoalsView goals={state.goals} onSave={handleSaveGoal} onDelete={handleDeleteGoal} />}
            {activeTab === 'investments' && <InvestmentView investment={state.investment} onUpdate={handleInvestmentUpdate} />}
            {activeTab === 'templates' && <TemplatesView templates={state.expenseTemplates} onAdd={handleSaveTemplate} onDelete={wrapHandleDeleteTemplate} />}
            {activeTab === 'ai' && <AIAnalysis />}
          </Suspense>
        </div>
      </main>

      <VoiceAssistant
        state={state}
        onSaveTransaction={onSaveTransaction}
        onSaveShoppingList={handleSaveShoppingList}
        language="pt-BR"
        voiceName="Kore"
      />

      <Suspense fallback={null}>
        {isModalOpen && <TransactionModal onClose={() => setIsModalOpen(false)} onAdd={onSaveTransaction} initialData={editingTransaction || undefined} templates={state.expenseTemplates} />}
        {detailTransaction && <TransactionDetailModal transaction={detailTransaction} currentMonth={filterValue} onClose={() => setDetailTransaction(null)} onEdit={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} onSave={onSaveTransaction} />}
      </Suspense>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] shadow-2xl flex items-center justify-around py-4 px-2 z-[60] no-print">
        {[
          { id: 'dashboard', icon: '💎', label: 'Home' },
          { id: 'cdp', icon: '📊', label: 'Gastos' },
          { id: 'cdd', icon: '📈', label: 'Fluxo' },
          { id: 'shopping', icon: '🛍️', label: 'Compras' },
          { id: 'ai', icon: '✨', label: 'Assistente' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveTab(btn.id)}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-500 ease-out ${activeTab === btn.id ? 'scale-110' : 'opacity-40 grayscale blur-[0.5px]'}`}
          >
            <span className="text-2xl">{btn.icon}</span>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTab === btn.id ? 'text-blue-600' : 'text-slate-500'}`}>{btn.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
