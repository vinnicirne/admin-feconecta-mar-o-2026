import React, { createContext, useContext, ReactNode } from 'react';
import { useFinanceApp } from '../hooks/useFinanceApp';
import { FinancialState, Transaction, PaymentStatus, FinanceCategory, ShoppingList, FinancialGoal } from '../types/types';

interface FinanceContextType {
    state: FinancialState;
    loading: boolean;
    handleSaveTransaction: (t: Transaction) => Promise<Transaction>;
    handleDeleteTransaction: (id: string) => Promise<void>;
    handleUpdateStatus: (id: string, month: number, status: PaymentStatus) => Promise<Transaction | undefined>;
    handleInvestmentUpdate: (amount: number, type: 'DEPOSIT' | 'WITHDRAW', description: string) => Promise<void>;
    handleSaveShoppingList: (list: Partial<ShoppingList>) => Promise<ShoppingList>;
    handleDeleteShoppingList: (id: string) => Promise<void>;
    handleSaveGoal: (goal: Partial<FinancialGoal>) => Promise<FinancialGoal>;
    handleDeleteGoal: (id: string) => Promise<void>;
    handleSaveTemplate: (name: string, category: FinanceCategory) => Promise<any>;
    handleDeleteTemplate: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const finance = useFinanceApp();

    return (
        <FinanceContext.Provider value={finance}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
