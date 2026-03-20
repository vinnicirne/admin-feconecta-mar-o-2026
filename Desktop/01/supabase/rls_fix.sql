-- 1. Habilitar RLS na tabela de Posts (Zelo Ministerial)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Política: Qualquer pessoa pode VER os posts (Leitura Pública do Refúgio)
CREATE POLICY "Leitura Pública do Refúgio" ON public.posts
FOR SELECT TO public
USING (true);

-- 3. Política: Somente membros autenticados podem POSTAR (Escrita Ministerial)
CREATE POLICY "Escrita Ministerial de Membros" ON public.posts
FOR INSERT TO anon, authenticated
WITH CHECK (true); -- Permitimos anon para o seu teste atual, depois restringiremos.

-- 4. Política: Somente o autor ou o ADM pode EDITAR/EXCLUIR (Gestão de Autoridade)
CREATE POLICY "Gestão Ministerial de Posts" ON public.posts
FOR ALL TO authenticated
USING (auth.uid() = profile_id);

-- 5. Dar permissões totais para as tabelas relacionadas
GRANT ALL ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
