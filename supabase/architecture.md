# Arquitetura recomendada

## Base atual

- Vercel hospeda o app Next.js
- Supabase concentra Auth, Postgres, Storage e Realtime
- Route Handlers e Server Components formam um BFF leve
- Edge Functions ficam reservadas para regras sensiveis

## Quando escalar

- `worker-moderation`: spam, denuncias e classificacao de risco
- `worker-billing`: assinatura, chargeback e conciliacao
- `worker-notifications`: email, push e campanhas
- `analytics-pipeline`: agregacao de eventos para BI

## Principios

- Nao colocar processamento pesado dentro de Server Actions
- Nao depender de autorizacao apenas no frontend
- Usar RLS, claims e tabelas de RBAC no banco
- Separar eventos financeiros, moderacao e auditoria desde o schema
