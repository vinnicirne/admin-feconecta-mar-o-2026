
import { createClient } from '@supabase/supabase-js';
import { Transaction, Investment, ExpenseTemplate, FinanceCategory, ShoppingList, FinancialGoal, InvestmentEvent } from '../types/types';

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (error) return [];
      return (data || []).map(t => ({
        id: t.id, description: t.description, amount: Number(t.amount), date: t.date, type: t.type,
        category: t.category, isRecurring: t.is_recurring, installments: t.installments, dueDateDay: t.due_date_day, status: t.status || {}
      }));
    } catch (e) { return []; }
  },

  async saveTransaction(t: Transaction) {
    const payload = { description: t.description, amount: t.amount, date: t.date, type: t.type, category: t.category, is_recurring: t.isRecurring, installments: t.installments, due_date_day: t.dueDateDay, status: t.status };
    const isUpdate = t.id && t.id.length > 20;
    const { data, error } = isUpdate ? await supabase.from('transactions').update(payload).eq('id', t.id).select() : await supabase.from('transactions').insert([payload]).select();
    if (error) throw error;
    return { ...t, id: data[0].id };
  },

  async deleteTransaction(id: string) { await supabase.from('transactions').delete().eq('id', id); },

  async getInvestmentHistory(): Promise<InvestmentEvent[]> {
    const { data, error } = await supabase.from('investment_history').select('*').order('date', { ascending: false });
    return error ? [] : (data || []).map(h => ({
      id: h.id,
      amount: Number(h.amount),
      type: h.type,
      date: h.date,
      description: h.description
    }));
  },

  async addInvestmentEvent(amount: number, type: 'DEPOSIT' | 'WITHDRAW', description: string) {
    const { data, error } = await supabase.from('investment_history').insert([{ amount, type, description }]).select();
    if (error) throw error;
    return { ...data[0], amount: Number(data[0].amount) } as InvestmentEvent;
  },

  async getExpenseTemplates(): Promise<ExpenseTemplate[]> {
    const { data, error } = await supabase.from('expense_templates').select('*').order('name');
    return error ? [] : data.map(d => ({ id: d.id, name: d.name, defaultCategory: d.default_category }));
  },

  async saveExpenseTemplate(name: string, category: FinanceCategory) {
    const { data, error } = await supabase.from('expense_templates').insert([{ name, default_category: category }]).select();
    if (error) throw error;
    return { id: data[0].id, name: data[0].name, defaultCategory: data[0].default_category };
  },

  async deleteExpenseTemplate(id: string) { await supabase.from('expense_templates').delete().eq('id', id); },

  async getShoppingLists(): Promise<ShoppingList[]> {
    try {
      const { data, error } = await supabase.from('shopping_lists').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn("Aviso: Falha ao carregar listas de compras. Verifique se a coluna current_amount existe.", error);
        return [];
      }
      return data.map(d => ({
        id: d.id,
        title: d.title,
        budget: Number(d.budget),
        currentAmount: Number(d.current_amount || 0), // Fallback para 0 se a coluna falhar
        items: d.items || [],
        createdAt: d.created_at
      }));
    } catch (e) {
      return [];
    }
  },

  async saveShoppingList(list: Partial<ShoppingList>) {
    const payload: any = {
      title: list.title,
      budget: list.budget,
      items: list.items
    };

    // Tentamos adicionar o current_amount apenas se ele estiver definido no objeto
    if (list.currentAmount !== undefined) {
      payload.current_amount = list.currentAmount;
    }

    const isUpdate = list.id && list.id.length > 20;
    const { data, error } = isUpdate
      ? await supabase.from('shopping_lists').update(payload).eq('id', list.id).select()
      : await supabase.from('shopping_lists').insert([payload]).select();

    if (error) {
      console.error("Erro ao salvar lista:", error);
      throw error;
    }

    return {
      ...list,
      id: data[0].id,
      budget: Number(data[0].budget),
      currentAmount: Number(data[0].current_amount || 0)
    } as ShoppingList;
  },

  async deleteShoppingList(id: string) { await supabase.from('shopping_lists').delete().eq('id', id); },

  async getGoals(): Promise<FinancialGoal[]> {
    const { data, error } = await supabase.from('financial_goals').select('*').order('target_amount', { ascending: false });
    return error ? [] : data.map(d => ({ id: d.id, title: d.title, targetAmount: Number(d.target_amount), currentAmount: Number(d.current_amount), deadline: d.deadline, category: d.category }));
  },

  async saveGoal(goal: Partial<FinancialGoal>) {
    const payload = { title: goal.title, target_amount: goal.targetAmount, current_amount: goal.currentAmount, deadline: goal.deadline, category: goal.category };
    const { data, error } = goal.id ? await supabase.from('financial_goals').update(payload).eq('id', goal.id).select() : await supabase.from('financial_goals').insert([payload]).select();
    if (error) throw error;
    return { ...goal, id: data[0].id } as FinancialGoal;
  },

  async deleteGoal(id: string) { await supabase.from('financial_goals').delete().eq('id', id); }
};
