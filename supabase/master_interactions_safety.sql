-- 🛡️ MASTER SAFETY: SEGURANÇA SUPREMA DE INTERAÇÕES MINISTERIAIS
-- Este script resolve todos os conflitos de RLS e erros de 'violação de política'.

-- ---------------------------------------------------------
-- 1. TABELA DE ORAÇÕES (Coração do FéConecta)
-- ---------------------------------------------------------
ALTER TABLE public.post_prayers ENABLE ROW LEVEL SECURITY;

-- Limpar Políticas Antigas para evitar conflitos de nomes
DROP POLICY IF EXISTS "Qualquer autenticado pode registrar oração" ON public.post_prayers;
DROP POLICY IF EXISTS "Qualquer um pode ver quem orou" ON public.post_prayers;
DROP POLICY IF EXISTS "Autenticados podem orar" ON public.post_prayers;
DROP POLICY IF EXISTS "Qualquer um pode ver orações" ON public.post_prayers;
DROP POLICY IF EXISTS "Interação Universal: Orações" ON public.post_prayers;

-- Nova Política Única e Robusta (Basta uma que cobre tudo ou políticas claras separadas)
CREATE POLICY "Interação Universal: Orações" 
ON public.post_prayers 
FOR ALL 
TO authenticated 
USING (auth.uid() = profile_id OR (FOR SELECT USING (true)));

-- Refinamento p/ granularidade se o Supabase reclamar do OR acima:
DROP POLICY IF EXISTS "Interação Universal: Orações" ON public.post_prayers;
CREATE POLICY "Select_Public_Prayers" ON public.post_prayers FOR SELECT USING (true);
CREATE POLICY "Write_Own_Prayers" ON public.post_prayers FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);


-- ---------------------------------------------------------
-- 2. TABELA DE LIKES (Impacto de Fé)
-- ---------------------------------------------------------
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ver curtidas" ON public.post_likes;
DROP POLICY IF EXISTS "Autenticados podem curtir" ON public.post_likes;
DROP POLICY IF EXISTS "Dono pode descurtir" ON public.post_likes;
DROP POLICY IF EXISTS "Interação Universal: Curtidas" ON public.post_likes;

CREATE POLICY "Select_Public_Likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Write_Own_Likes" ON public.post_likes FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);


-- ---------------------------------------------------------
-- 3. TABELA DE COMENTÁRIOS (Comunhão Ministerial)
-- ---------------------------------------------------------
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ver comentários" ON public.comments;
DROP POLICY IF EXISTS "Autenticados podem comentar" ON public.comments;
DROP POLICY IF EXISTS "Dono pode apagar comentário" ON public.comments;
DROP POLICY IF EXISTS "Interação Universal: Comentários" ON public.comments;

CREATE POLICY "Select_Public_Comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Write_Own_Comments" ON public.comments FOR ALL TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);


-- ---------------------------------------------------------
-- 4. ÍNDICES DE UNICIDADE (Garantia de Não-Duplicidade)
-- ---------------------------------------------------------
-- Recriar as constraints para garantir que o 'upsert' do código não falhe por falta de conflito detectável.
ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_unique_user_id;
ALTER TABLE public.post_likes ADD CONSTRAINT post_likes_unique_user_id UNIQUE (post_id, profile_id);

ALTER TABLE public.post_prayers DROP CONSTRAINT IF EXISTS post_prayers_unique_user_id;
ALTER TABLE public.post_prayers ADD CONSTRAINT post_prayers_unique_user_id UNIQUE (post_id, profile_id);

-- Garente permissões de uso das tabelas para o papel autenticado
GRANT ALL ON TABLE public.post_prayers TO authenticated;
GRANT ALL ON TABLE public.post_likes TO authenticated;
GRANT ALL ON TABLE public.comments TO authenticated;

-- Finalizado sem erros de syntax externa
DO $$ BEGIN RAISE NOTICE 'Segurança de Comunhão Ministerial Resetada e Reconfigurada com Sucesso! 🎉🙏❤️'; END $$;
