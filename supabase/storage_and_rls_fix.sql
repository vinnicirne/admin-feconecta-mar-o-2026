-- 🛡️ FIX DE SEGURANÇA MINISTERIAL (RLS & STORAGE)
-- Este script garante que todos os membros autenticados possam postar e fazer upload de mídia.

-- 1. Garantir que o Bucket 'post-media' exista e seja público para visualização
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Políticas de Storage para 'post-media'
DROP POLICY IF EXISTS "Qualquer um pode ver as mídias" ON storage.objects;
CREATE POLICY "Qualquer um pode ver as mídias" ON storage.objects FOR SELECT USING (bucket_id = 'post-media');

DROP POLICY IF EXISTS "Autenticados podem fazer upload" ON storage.objects;
CREATE POLICY "Autenticados podem fazer upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'post-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Dono da mídia pode deletar" ON storage.objects;
CREATE POLICY "Dono da mídia pode deletar" ON storage.objects FOR DELETE 
USING (bucket_id = 'post-media' AND auth.uid() = owner);

-- 3. Garantir Políticas de RLS na tabela POSTS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ver posts" ON public.posts;
CREATE POLICY "Qualquer um pode ver posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Qualquer autenticado pode postar" ON public.posts;
CREATE POLICY "Qualquer autenticado pode postar" ON public.posts FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Dono pode apagar seu post" ON public.posts;
CREATE POLICY "Dono pode apagar seu post" ON public.posts FOR DELETE 
USING (auth.uid() = profile_id);
