-- 🛡️ REPARO DEFINITIVO DE INTERAÇÕES (REPOSTS E ORAÇÕES)
-- Este script garante a existência das tabelas, colunas corretas e segurança RLS.

-- 1. TABELA DE REPOSTS (Garantia de Estrutura)
CREATE TABLE IF NOT EXISTS public.post_reposts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, profile_id)
);

-- 2. TABELA DE SHARES (Garantia de Estrutura)
CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. HABILITAR RLS EM TUDO
ALTER TABLE public.post_reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO (REPOSTS)
DROP POLICY IF EXISTS "Select_Public_Reposts" ON public.post_reposts;
CREATE POLICY "Select_Public_Reposts" ON public.post_reposts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Write_Own_Reposts" ON public.post_reposts;
CREATE POLICY "Write_Own_Reposts" ON public.post_reposts FOR ALL TO authenticated 
USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- 5. POLÍTICAS DE ACESSO (SHARES)
DROP POLICY IF EXISTS "Select_Public_Shares" ON public.post_shares;
CREATE POLICY "Select_Public_Shares" ON public.post_shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert_Public_Shares" ON public.post_shares;
CREATE POLICY "Insert_Public_Shares" ON public.post_shares FOR INSERT WITH CHECK (true);

-- 6. PERMISSÕES DE EXECUÇÃO
GRANT ALL ON TABLE public.post_reposts TO authenticated;
GRANT ALL ON TABLE public.post_reposts TO anon;
GRANT ALL ON TABLE public.post_shares TO authenticated;
GRANT ALL ON TABLE public.post_shares TO anon;

-- Notificação de execução finalizada
DO $$ BEGIN RAISE NOTICE 'Interações de Repostagem e Compartilhamento restauradas com sucesso! 🎉🕊️'; END $$;
