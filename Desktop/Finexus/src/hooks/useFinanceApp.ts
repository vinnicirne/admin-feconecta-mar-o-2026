import { useState, useEffect } from 'react';
import { FinancialState, Transaction, PaymentStatus, FinanceCategory, ShoppingList, FinancialGoal, Investment, ExpenseTemplate } from '../types/types';
import { db } from '../services/supabase';

export const useFinanceApp = () => {
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState<FinancialState>({
        transactions: [],
        investment: { balance: 0, history: [] },
        expenseTemplates: [],
        shoppingLists: [],
        goals: []
    });

    const calculateInvestment = (history: any[]): Investment => {
        let balance = 0;
        history.forEach(h => {
            balance += h.type === 'DEPOSIT' ? h.amount : -h.amount;
        });
        return { balance, history };
    };

    useEffect(() => {
        async function init() {
            setLoading(true);
            try {
                const [transactions, history, templates, lists, goals] = await Promise.all([
                    db.getTransactions(),
                    db.getInvestmentHistory(),
                    db.getExpenseTemplates(),
                    db.getShoppingLists(),
                    db.getGoals()
                ]);
                const investment = calculateInvestment(history);
                setState({ transactions, investment, expenseTemplates: templates, shoppingLists: lists, goals });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    const handleSaveTransaction = async (t: Transaction) => {
        const saved = await db.saveTransaction(t);
        setState(prev => {
            const idx = prev.transactions.findIndex(i => i.id === saved.id);
            const newT = [...prev.transactions];
            if (idx !== -1) newT[idx] = saved; else newT.unshift(saved);
            return { ...prev, transactions: newT };
        });
        return saved;
    };

    const handleDeleteTransaction = async (id: string) => {
        await db.deleteTransaction(id);
        setState(prev => ({
            ...prev,
            transactions: prev.transactions.filter(t => t.id !== id)
        }));
    };

    const handleUpdateStatus = async (id: string, month: number, status: PaymentStatus) => {
        const t = state.transactions.find(item => item.id === id);
        if (!t) return;
        const newStatus = { ...t.status, [month]: status };
        const updated = await db.saveTransaction({ ...t, status: newStatus });
        setState(prev => ({
            ...prev,
            transactions: prev.transactions.map(item => item.id === id ? updated : item)
        }));
        return updated;
    };

    const handleInvestmentUpdate = async (amount: number, type: 'DEPOSIT' | 'WITHDRAW', description: string) => {
        const event = await db.addInvestmentEvent(amount, type, description);
        setState(prev => {
            const newHistory = [...prev.investment.history, event];
            return { ...prev, investment: calculateInvestment(newHistory) };
        });
    };

    const handleSaveShoppingList = async (list: Partial<ShoppingList>) => {
        const saved = await db.saveShoppingList(list);
        setState(prev => {
            const idx = prev.shoppingLists.findIndex(l => l.id === saved.id);
            const newL = [...prev.shoppingLists];
            if (idx !== -1) newL[idx] = saved; else newL.unshift(saved);
            return { ...prev, shoppingLists: newL };
        });
        return saved;
    };

    const handleDeleteShoppingList = async (id: string) => {
        await db.deleteShoppingList(id);
        setState(prev => ({
            ...prev,
            shoppingLists: prev.shoppingLists.filter(l => l.id !== id)
        }));
    };

    const handleSaveGoal = async (goal: Partial<FinancialGoal>) => {
        const saved = await db.saveGoal(goal);
        setState(prev => {
            const idx = prev.goals.findIndex(g => g.id === saved.id);
            const newG = [...prev.goals];
            if (idx !== -1) newG[idx] = saved; else newG.unshift(saved);
            return { ...prev, goals: newG };
        });
        return saved;
    };

    const handleDeleteGoal = async (id: string) => {
        await db.deleteGoal(id);
        setState(prev => ({
            ...prev,
            goals: prev.goals.filter(g => g.id !== id)
        }));
    };

    const handleSaveTemplate = async (name: string, category: FinanceCategory) => {
        const saved = await db.saveExpenseTemplate(name, category);
        setState(prev => ({
            ...prev,
            expenseTemplates: [...prev.expenseTemplates, saved]
        }));
        return saved;
    };

    const handleDeleteTemplate = async (id: string) => {
        await db.deleteExpenseTemplate(id);
        setState(prev => ({
            ...prev,
            expenseTemplates: prev.expenseTemplates.filter(t => t.id !== id)
        }));
    };

    return {
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
    };
};
