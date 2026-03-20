
import { GoogleGenAI } from "@google/genai";
import { FinancialState, TransactionType, FinanceCategory } from "../types/types";

export async function analyzeFinances(state: FinancialState) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Consolidar dados para não sobrecarregar o prompt
  const totalIncome = state.transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = state.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const personalTotal = state.transactions
    .filter(t => t.type === TransactionType.EXPENSE && t.category === FinanceCategory.PERSONAL)
    .reduce((acc, t) => acc + t.amount, 0);

  const professionalTotal = state.transactions
    .filter(t => t.type === TransactionType.EXPENSE && t.category === FinanceCategory.PROFESSIONAL)
    .reduce((acc, t) => acc + t.amount, 0);

  const lastTransactions = state.transactions.slice(0, 20).map(t => ({
    d: t.description,
    v: t.amount,
    c: t.category,
    t: t.type
  }));

  const prompt = `
    Como um consultor financeiro de elite para empreendedores, analise este resumo:
    - Entradas Totais: R$ ${totalIncome}
    - Saídas Totais: R$ ${totalExpense}
    - Gastos Pessoais: R$ ${personalTotal}
    - Gastos Profissionais: R$ ${professionalTotal}
    - Investimentos: R$ ${state.investment.balance}
    - Últimos Lançamentos: ${JSON.stringify(lastTransactions)}
    
    O empreendedor mistura renda pessoal e profissional. Forneça um plano estratégico em 4 tópicos:
    1. Diagnóstico da Mistura de Contas (quão grave está o mix?).
    2. Alocação Sugerida (quanto deveria ir para cada lado?).
    3. Potencial de Investimento (com base no saldo livre).
    4. Plano de Ação 30 dias (passos práticos).

    Responda em Markdown elegante, use emojis financeiros e seja direto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Falha na comunicação com a Inteligência Financeira.");
  }
}
