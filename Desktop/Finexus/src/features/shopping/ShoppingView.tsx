
import React, { useState } from 'react';
import { ShoppingList, ShoppingItem } from '../../types/types';

interface ShoppingViewProps {
  lists: ShoppingList[];
  onSave: (list: Partial<ShoppingList>) => void;
  onDelete: (id: string) => void;
}

const ShoppingView: React.FC<ShoppingViewProps> = ({ lists, onSave, onDelete }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [openedList, setOpenedList] = useState<ShoppingList | null>(null);

  const [formData, setFormData] = useState({ title: '', budget: '' });
  const [depositAmount, setDepositAmount] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemPrice, setEditingItemPrice] = useState('');

  const handleCreateList = () => {
    if (!formData.title) return;
    onSave({
      title: formData.title,
      budget: Number(formData.budget) || 0,
      currentAmount: 0,
      items: [],
      createdAt: new Date().toISOString()
    });
    setFormData({ title: '', budget: '' });
    setIsCreateModalOpen(false);
  };

  const handleUpdateList = () => {
    if (!editingList || !formData.title) return;
    onSave({ ...editingList, title: formData.title, budget: Number(formData.budget) || 0 });
    setEditingList(null);
    setFormData({ title: '', budget: '' });
  };

  const handleAddDeposit = (list: ShoppingList) => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;
    onSave({ ...list, currentAmount: (list.currentAmount || 0) + val });
    setDepositAmount('');
    if (openedList?.id === list.id) setOpenedList({ ...list, currentAmount: (list.currentAmount || 0) + val });
  };

  const handleAddItem = (list: ShoppingList, itemName: string, itemPrice: number) => {
    const newItem: ShoppingItem = { id: Date.now().toString(), name: itemName, price: itemPrice, isBought: false };
    const updatedList = { ...list, items: [...list.items, newItem] };
    onSave(updatedList);
    setOpenedList(updatedList);
  };

  const toggleItem = (list: ShoppingList, itemId: string) => {
    const newItems = list.items.map(i => i.id === itemId ? { ...i, isBought: !i.isBought } : i);
    const updatedList = { ...list, items: newItems };
    onSave(updatedList);
    setOpenedList(updatedList);
  };

  const deleteItem = (list: ShoppingList, itemId: string) => {
    const newItems = list.items.filter(i => i.id !== itemId);
    const updatedList = { ...list, items: newItems };
    onSave(updatedList);
    setOpenedList(updatedList);
  };

  const handleUpdateItemPrice = (list: ShoppingList, itemId: string, newPrice: number) => {
    const newItems = list.items.map(i => i.id === itemId ? { ...i, price: newPrice } : i);
    const updatedList = { ...list, items: newItems };
    onSave(updatedList);
    setOpenedList(updatedList);
    setEditingItemId(null);
  };

  const handleToggleComplete = (list: ShoppingList) => {
    const updatedList = { ...list, isCompleted: !list.isCompleted };
    onSave(updatedList);
    setOpenedList(updatedList);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      {/* Header com Resumo Visual */}
      {!openedList && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Cofres de Compras</h2>
            <p className="text-slate-500 font-medium mt-1">Transforme seu lucro profissional em bens e metas de vida.</p>
          </div>
          <button
            onClick={() => { setFormData({ title: '', budget: '' }); setIsCreateModalOpen(true); }}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
          >
            + CRIAR LISTA DE COMPRAS
          </button>
        </div>
      )}

      {lists.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 flex flex-col items-center text-center animate-in zoom-in-95">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">🛒</div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Sua prateleira está vazia</h3>
          <p className="text-slate-400 max-w-xs font-medium">Comece a planejar suas compras importantes reservando lucros do seu negócio.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${openedList ? 'hidden' : ''}`}>
          {lists.map(list => {
            const progressPercent = list.budget > 0 ? (list.currentAmount / list.budget) * 100 : 0;
            const itemsBoughtCount = list.items.filter(i => i.isBought).length;

            return (
              <div
                key={list.id}
                onClick={() => setOpenedList(list)}
                className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-100 transition-all cursor-pointer overflow-hidden flex flex-col h-[320px]"
              >
                {/* Visual Card Style - Opacidade reduzida e posição ajustada para evitar sobreposição */}
                <div className="absolute -top-4 -right-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                  <span className="text-[12rem] font-black tracking-tighter">#{(lists.indexOf(list) + 1).toString().padStart(2, '0')}</span>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 ${list.isCompleted ? 'bg-emerald-500' : 'bg-slate-900'} rounded-2xl flex items-center justify-center text-xl text-white shadow-lg transition-colors`}>
                      {list.isCompleted ? '✓' : '📦'}
                    </div>
                    {list.isCompleted && (
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-500">
                        Concluído
                      </span>
                    )}
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditingList(list); setFormData({ title: list.title, budget: list.budget.toString() }); }} className="p-2 text-slate-400 hover:text-blue-600">✎</button>
                      <button onClick={() => { if (window.confirm("Excluir planejamento?")) onDelete(list.id); }} className="p-2 text-slate-400 hover:text-rose-500">✕</button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors truncate pr-10">{list.title}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                    {itemsBoughtCount} de {list.items.length} itens adquiridos
                  </p>

                  <div className="mt-auto space-y-5">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo no Cofre</p>
                        <p className="text-2xl font-black text-emerald-600">R$ {list.currentAmount.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Meta do Objetivo</p>
                        <p className="text-sm font-black text-slate-800">R$ {list.budget.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                        <span>{Math.round(progressPercent)}% Concluído</span>
                        <span>Faltam R$ {(list.budget - list.currentAmount).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR */}
      {(isCreateModalOpen || editingList) && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-12 animate-in zoom-in-95">
            <h3 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">{editingList ? 'Editar Lista' : 'Nova Lista de Compras'}</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">O que você quer comprar?</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-all text-lg"
                  placeholder="Ex: Macbook Pro M3"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Orçamento Planejado (R$)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-all text-lg"
                  placeholder="0,00"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => { setIsCreateModalOpen(false); setEditingList(null); }} className="flex-1 h-16 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[11px] tracking-widest">Cancelar</button>
                <button onClick={editingList ? handleUpdateList : handleCreateList} className="flex-[2] h-16 bg-blue-600 text-white font-black rounded-2xl uppercase text-[11px] tracking-widest shadow-xl shadow-blue-100">{editingList ? 'Atualizar' : 'Criar Lista'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DE DETALHES (PAGE FEEL) */}
      {openedList && (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex flex-col w-full">
            {/* Top Navigation */}
            <div className="flex justify-between items-center mb-12">
              <button onClick={() => setOpenedList(null)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest">
                <span className="text-xl">←</span> Voltar aos Cofres
              </button>
              <div className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">
                Criado em {new Date(openedList.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Coluna Esquerda: Status e Saldo */}
              <div className="lg:col-span-5 space-y-12">
                <div>
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-none">{openedList.title}</h1>
                  <div className="flex items-center gap-4">
                    <span className={`w-4 h-4 rounded-full ${openedList.isCompleted ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span>
                    <p className={`text-sm font-bold ${openedList.isCompleted ? 'text-emerald-600' : 'text-blue-600'} uppercase tracking-widest`}>
                      {openedList.isCompleted ? 'Objetivo Concluído' : 'Planejamento Ativo'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-200/50 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo no Cofre</p>
                      <p className="text-4xl font-black text-emerald-400">R$ {openedList.currentAmount.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Disponível p/ Planejar</p>
                      <p className="text-4xl font-black text-blue-400">R$ {(openedList.budget - openedList.items.reduce((a, b) => a + b.price, 0)).toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Meta do Objetivo</p>
                      <p className="text-xl font-black opacity-80">R$ {openedList.budget.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Realizar Aporte</p>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="0,00"
                          disabled={openedList.isCompleted}
                          className="w-full h-14 pl-6 pr-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:border-emerald-500 transition-all disabled:opacity-30"
                        />
                      </div>
                      <button
                        onClick={() => handleAddDeposit(openedList)}
                        disabled={openedList.isCompleted}
                        className="px-6 bg-emerald-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-900 disabled:opacity-50 disabled:grayscale"
                      >
                        Aportar
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleComplete(openedList)}
                    className={`w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl ${openedList.isCompleted
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-900/20'
                      }`}
                  >
                    {openedList.isCompleted ? 'Reabrir Planejamento' : '✓ Finalizar Objetivo'}
                  </button>
                </div>
              </div>

              {/* Coluna Direita: Lista de Itens */}
              <div className="lg:col-span-7 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Checklist de Itens</h3>
                  <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase">
                    Total: R$ {openedList.items.reduce((a, b) => a + b.price, 0).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4">
                  <div className="flex gap-2">
                    <input
                      placeholder="Nome do Item / Preço (Ex: Monitor/1200)"
                      className="flex-1 h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-blue-400 placeholder:text-slate-400"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const parts = input.value.split('/');
                          handleAddItem(openedList, parts[0], Number(parts[1]) || 0);
                          input.value = '';
                        }
                      }}
                    />
                    <button className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-100">+</button>
                  </div>

                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {openedList.items.length === 0 ? (
                      <div className="py-20 text-center opacity-20"><p className="text-xs font-black uppercase tracking-widest">Nenhum item adicionado ainda.</p></div>
                    ) : (
                      openedList.items.map(item => (
                        <div key={item.id} className={`group flex items-center justify-between p-5 rounded-2xl border transition-all ${item.isBought ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-white shadow-sm'}`}>
                          <div className="flex items-center gap-5 cursor-pointer flex-1" onClick={() => toggleItem(openedList, item.id)}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.isBought ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                              {item.isBought && <span className="text-white text-[10px]">✓</span>}
                            </div>
                            <div>
                              <p className={`font-black text-sm ${item.isBought ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.name}</p>
                              {editingItemId === item.id ? (
                                <input
                                  type="number"
                                  autoFocus
                                  value={editingItemPrice}
                                  onChange={e => setEditingItemPrice(e.target.value)}
                                  onBlur={() => handleUpdateItemPrice(openedList, item.id, Number(editingItemPrice) || 0)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleUpdateItemPrice(openedList, item.id, Number(editingItemPrice) || 0);
                                    if (e.key === 'Escape') setEditingItemId(null);
                                  }}
                                  className="w-24 h-6 px-2 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-900 outline-none focus:border-blue-500"
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <p
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItemId(item.id);
                                    setEditingItemPrice(item.price.toString());
                                  }}
                                  className="text-[10px] font-bold text-slate-400 hover:text-blue-500 cursor-edit"
                                >
                                  R$ {item.price.toLocaleString('pt-BR')} <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">(Clique p/ editar)</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <button onClick={() => deleteItem(openedList, item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all">✕</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingView;
