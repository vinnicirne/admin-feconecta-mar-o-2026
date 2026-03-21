-- 🛡️ SEGURANÇA DE INTERAÇÕES MINISTERIAIS (FIX RLS)
-- Este script garante que todos os membros possam curtir, comentar e orar.

-- 1. Tabela de LIKES
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ver curtidas" ON public.post_likes;
CREATE POLICY "Qualquer um pode ver curtidas" ON public.post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Autenticados podem curtir" ON public.post_likes;
CREATE POLICY "Autenticados podem curtir" ON public.post_likes FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Dono pode descurtir" ON public.post_likes;
CREATE POLICY "Dono pode descurtir" ON public.post_likes FOR DELETE 
USING (auth.uid() = profile_id);


-- 2. Tabela de ORAÇÕES (Coração do Refúgio)
ALTER TABLE public.post_prayers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ver orações" ON public.post_prayers;
CREATE POLICY "Qualquer um pode ver orações" ON public.post_prayers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Autenticados podem orar" ON public.post_prayers;
CREATE POLICY "Autenticados podem orar" ON public.post_prayers FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Dono pode retirar oração" ON public.post_prayers;
CREATE POLICY "Dono pode retirar oração" ON public.post_prayers FOR DELETE 
USING (auth.uid() = profile_id);


-- 3. Tabela de COMENTÁRIOS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ver comentários" ON public.comments;
CREATE POLICY "Qualquer um pode ver comentários" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Autenticados podem comentar" ON public.comments;
CREATE POLICY "Autenticados podem comentar" ON public.comments FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Dono pode apagar comentário" ON public.comments;
CREATE POLICY "Dono pode apagar comentário" ON public.comments FOR DELETE 
USING (auth.uid() = profile_id);
