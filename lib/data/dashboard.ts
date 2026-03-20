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
