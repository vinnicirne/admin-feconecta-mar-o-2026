-- 1. Criar o Bucket de Posts (Se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir que Qualquer Usuário Autenticado veja os arquivos (Leitura Pública)
CREATE POLICY "Leitura Pública de Posts" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'posts');

-- 3. Permitir que Usuários Autenticados façam Upload (Escrita Ministerial)
CREATE POLICY "Upload Ministerial de Posts" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'posts');

-- 4. Permitir que o Usuário Exclua seu próprio arquivo (Gestão de Mídia)
CREATE POLICY "Exclusão Ministerial de Posts" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);
