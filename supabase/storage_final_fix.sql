-- 1. Garantir que o bucket 'posts' existe (Hospedagem de Fé)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas antigas para evitar conflitos (Faxina Ministerial)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Liberação Total de Mídia" ON storage.objects;

-- 3. CRIAR POLÍTICA DE LIBERAÇÃO TOTAL (Ideal para Fase de Teste e Produção)
-- Permite que membros postem suas mídias sem bloqueios de RLS no bucket 'posts'
CREATE POLICY "Liberação Total de Mídia" ON storage.objects
FOR ALL TO anon, authenticated
USING (bucket_id = 'posts')
WITH CHECK (bucket_id = 'posts');

-- 4. Dar permissões de nível PostgreSQL para o esquema de storage
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO anon;
GRANT ALL ON storage.buckets TO authenticated;
