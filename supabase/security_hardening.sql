-- 🛡️ PROTOCOLO DE AUTORIDADE MINISTERIAL (RLS HARDENING)

-- 1. Função de Verificação de Autoridade (O Selo de Admin)
CREATE OR REPLACE FUNCTION public.is_admin_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE auth_user_id = user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. BLINDAGEM DA TABELA DE POSTS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Escrita Ministerial de Membros" ON public.posts;
DROP POLICY IF EXISTS "Gestão Ministerial de Posts" ON public.posts;

-- Política: Somente Logados POSTAM (Fim do acesso Anon)
CREATE POLICY "Postagem Exclusiva de Membros" ON public.posts
FOR INSERT TO authenticated
WITH CHECK (true);

-- Política: Admin ou Autor EDITAM/EXCLUEM (Acesso Total Admin)
CREATE POLICY "Autoridade em Posts" ON public.posts
FOR ALL TO authenticated
USING (auth.uid() = profile_id OR is_admin_access(auth.uid()));

-- 3. BLINDAGEM DO STORAGE (MÍDIAS)
DROP POLICY IF EXISTS "Liberação Total de Mídia" ON storage.objects;

-- Política: Somente Ativos SOBEM ARQUIVOS
CREATE POLICY "Upload Seguro de Membros" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

-- Política: Admin ou Autor GERENCIAM MÍDIAS (Inviolabilidade Admin)
CREATE POLICY "Autoridade em Mídias" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'posts' AND (
  (storage.foldername(name))[1] = auth.uid()::text OR is_admin_access(auth.uid())
));

-- 4. Garantir que anônimos apenas LEIAM
REVOKE ALL ON public.posts FROM anon;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
