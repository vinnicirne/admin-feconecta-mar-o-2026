
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum FinanceCategory {
  PERSONAL = 'Pessoal',
  PROFESSIONAL = 'Profissional'
}

export enum PaymentStatus {
  PAID = 'PAGO',
  UNPAID = 'NÃO PAGO',
  NO_DATA = 'SEM DADOS'
}

export interface ExpenseTemplate {
  id: string;
  name: string;
  defaultCategory: FinanceCategory;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: FinanceCategory;
  isRecurring: boolean;
  installments?: number;
  currentInstallment?: number;
  dueDateDay: number;
  status: Record<number, PaymentStatus>;
}

export interface InvestmentEvent {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW';
  date: string;
  description: string;
}

export interface Investment {
  balance: number;
  history: InvestmentEvent[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  isBought: boolean;
}

export interface ShoppingList {
  id: string;
  title: string;
  budget: number;
  currentAmount: number; // Saldo já reservado para esta lista
  items: ShoppingItem[];
  createdAt: string;
  isCompleted?: boolean;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'ESSENTIAL' | 'DREAM' | 'FREEDOM';
}

export interface FinancialState {
  transactions: Transaction[];
  investment: Investment;
  expenseTemplates: ExpenseTemplate[];
  shoppingLists: ShoppingList[];
  goals: FinancialGoal[];
}
