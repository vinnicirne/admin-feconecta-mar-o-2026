-- 🛡️ REPOST & SHARE SAFETY: SEGURANÇA FINAL DE INTERAÇÕES
-- Este script garante que o 'Repostar' e 'Compartilhar' funcionem e contabilizem corretamente.

-- 1. TABELA DE REPOSTS
ALTER TABLE public.post_reposts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select_Public_Reposts" ON public.post_reposts;
CREATE POLICY "Select_Public_Reposts" ON public.post_reposts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Write_Own_Reposts" ON public.post_reposts;
CREATE POLICY "Write_Own_Reposts" ON public.post_reposts FOR ALL TO authenticated 
USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- 2. TABELA DE SHARES (Garantir contagem pública)
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select_Public_Shares" ON public.post_shares;
CREATE POLICY "Select_Public_Shares" ON public.post_shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert_Public_Shares" ON public.post_shares;
CREATE POLICY "Insert_Public_Shares" ON public.post_shares FOR INSERT WITH CHECK (true);

-- 3. GARANTIR PERMISSÕES
GRANT ALL ON TABLE public.post_reposts TO authenticated;
GRANT ALL ON TABLE public.post_reposts TO anon;
GRANT ALL ON TABLE public.post_shares TO authenticated;
GRANT ALL ON TABLE public.post_shares TO anon;

-- Notificação de sucesso
DO $$ BEGIN RAISE NOTICE 'Segurança de Repostagem e Compartilhamento Reconfigurada! 🕊️🔄'; END $$;
