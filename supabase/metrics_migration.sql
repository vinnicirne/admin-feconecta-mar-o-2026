-- 1. Métricas Históricas com Foco no Reino
TRUNCATE public.historical_metrics;

-- Crescimento de Vidas (Onde a Palavra alcançou)
INSERT INTO public.historical_metrics (metric_key, label, value) VALUES
('platform_growth', 'Jan', 48000),
('platform_growth', 'Fev', 56000),
('platform_growth', 'Mar', 72500), -- Expansao na Pascoa
('platform_growth', 'Abr', 89200),
('platform_growth', 'Mai', 104800),
('platform_growth', 'Jun', 128400);

-- Engajamento Espiritual (O que edifica a comunidade)
INSERT INTO public.historical_metrics (metric_key, label, value) VALUES
('feature_engagement', 'Estudo da Biblia', 84.0),
('feature_engagement', 'Intercessao/Oracao', 76.0),
('feature_engagement', 'Compartilhamentos de Testemunhos', 62.0),
('feature_engagement', 'Pastoreio Remoto', 48.0),
('feature_engagement', 'Cursos Teologicos', 52.0);

-- Economia do Reino (Dizimos, Ofertas e Missoes)
INSERT INTO public.historical_metrics (metric_key, label, value) VALUES
('revenue_snapshot', 'arrecadacao_mrr', 64500.0),
('revenue_snapshot', 'ofertas_missoes', 18400.0),
('revenue_snapshot', 'ticket_medio_oferta', 28.50);
