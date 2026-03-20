"use client";

import type { ManagedUser } from "@/types";

// Dados para os cards de métricas
export const metricsData = {
  activeUsers: { value: "128.4k", change: "+12%", isPositive: true },
  openReports: { value: "214", change: "-5%", isPositive: true },
  revenueCents: { value: "R$ 82.9k", change: "+8%", isPositive: true },
  securityIncidents: { value: "2", change: "0%", isPositive: false },
};

// ... outros cards e dados do dashboard ...

export const managedUsers: ManagedUser[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Ana Beatriz Lima (Exemplo)",
    username: "@anabia",
    email: "ana@feconecta.com",
    status: "active",
    joinedAt: "2026-01-14",
    role: "member",
    reportsReceived: 2,
    activityScore: "Alta",
    bio: "Usuário de exemplo para validação de interface.",
    church: "Igreja Nova Aliança",
    lastSeen: "2 horas atrás",
    activityHistory: ["Acesso via Dashboard"]
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "João Victor Moraes (Exemplo)",
    username: "@joaovm",
    email: "joao@feconecta.com",
    status: "suspended",
    joinedAt: "2025-11-02",
    role: "member",
    reportsReceived: 14,
    activityScore: "Baixa",
    bio: "Usuário de exemplo para teste de moderação.",
    church: "Batista Central",
    lastSeen: "3 dias atrás",
    activityHistory: ["Alerta de segurança gerado"]
  }
];

// --- DADOS DE AUTOMAÇÃO E MODERAÇÃO ---
export const prohibitedWords = ["spam", "propaganda", "ofensa", "fake news"];

export const moderationDetectors: any[] = [
  {
    id: "ia-toxic",
    label: "Detecção de Toxicidade (IA)",
    description: "Analisa o tom e a intenção de mensagens usando modelos de linguagem natural.",
    enabled: true,
    sensitivity: "medium",
    action: "hide"
  },
  {
    id: "spam-filter",
    label: "Filtro Anti-Spam",
    description: "Identifica links repetitivos, comportamentos robóticos e mensagens em massa.",
    enabled: true,
    sensitivity: "high",
    action: "alert"
  }
];

// --- DADOS DE RELATÓRIOS ---
export const moderationReports: any[] = [
  {
    id: "REP-001",
    category: "hate_speech",
    targetType: "post",
    targetLabel: "Post inadequado sobre doutrina",
    reporter: "Membro Preocupado",
    createdAt: "2026-03-20",
    queue: "high",
    summary: "Conteúdo que fere as diretrizes básicas de respeito mútuo da comunidade.",
    decisionHistory: ["IA sinalizou como risco alto"],
    userActionHint: "Revisar e possivelmente ocultar"
  }
];

// --- DADOS DE ACESSO E SEGURAÇA ---
export const accessLogs: any[] = [
  { id: "LOG-001", actor: "Vinicius (Admin)", action: "Login realizado", location: "Rio de Janeiro, BR", device: "Chrome / Windows", createdAt: "2026-03-20 10:30" }
];

export const managedPosts = [];
export const revenueSnapshot = {};
export const managedCommunities = [];
export const managedLives = [];
export const bibleVersions = [];
