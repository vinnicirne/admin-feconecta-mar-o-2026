-- ⚙️ CONTROLE DE FUNCIONALIDADES (FEATURE FLAGS)
-- Permite ligar/desligar partes do app dinamicamente pelo Dashboard

-- 1. Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS public.app_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL, -- Ex: 'feed', 'bible', 'notes'
    label TEXT NOT NULL,       -- Ex: 'Feed de Notícias'
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.app_features ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança
-- Qualquer pessoa pode ver quais funções estão ativas
CREATE POLICY "Leitura Pública de Features"
ON public.app_features FOR SELECT
USING ( true );

-- Somente administradores (ou por enquanto qualquer pessoa logada para o teste rápido) podem atualizar
-- Idealmente: to dashboard_admin ROLE ou check metadata
CREATE POLICY "Gestão de Features"
ON public.app_features FOR ALL
TO authenticated
USING ( true );

-- 4. Inserir estados iniciais
INSERT INTO public.app_features (name, label, is_enabled)
VALUES 
    ('feed', 'Feed de Interação', true),
    ('bible', 'Bíblia Digital', true),
    ('notes', 'Notas Ministeriais', true),
    ('plans', 'Planos de Leitura', true),
    ('communities', 'Comunidades', true),
    ('post', 'Criação de Posts', true)
ON CONFLICT (name) DO NOTHING;
INSERT INTO public.app_features (name, label, is_enabled) VALUES ('testimonies', 'M�dulo de Testemunhos', true), ('prayer_answers', 'Respostas de Ora��o', true) ON CONFLICT (name) DO NOTHING;
