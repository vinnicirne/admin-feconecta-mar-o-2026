-- 🛡️ EVOLUÇÃO MINISTERIAL DE AUDITORIA (FéConecta v2)
-- Adiciona campos para controle de retenção, notas de moderação e análise de IA

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS reach_limit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_risk_score FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS ai_incident_report TEXT;

COMMENT ON COLUMN public.posts.reach_limit IS 'Indica se a publicação deve ter seu alcance retido/limitado (shadowban suave)';
COMMENT ON COLUMN public.posts.ai_risk_score IS 'Pontuação de risco gerada pelo motor de IA ministerial';
