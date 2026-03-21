-- 📤 CONFIGURAÇÃO DO STORAGE PARA MÍDIA (VÍDEOS E IMAGENS)
-- Este script cria o bucket e define quem pode postar.

-- 1. Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Limpar políticas existentes para evitar erros de duplicata
DROP POLICY IF EXISTS "Acesso Público para Mídia" ON storage.objects;
DROP POLICY IF EXISTS "Upload Autorizado de Mídia" ON storage.objects;
DROP POLICY IF EXISTS "Deleção de Própria Mídia" ON storage.objects;

-- 3. Permitir que qualquer pessoa veja a mídia (Bucket Público)
CREATE POLICY "Acesso Público para Mídia"
ON storage.objects FOR SELECT
USING ( bucket_id = 'post-media' );

-- 4. Permitir que usuários logados façam upload para o bucket 'post-media'
-- Importante: O dono (owner) será gravado pelo Supabase automaticamente
CREATE POLICY "Upload Autorizado de Mídia"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'post-media' );

-- 5. Permitir que o dono delete seu próprio arquivo
CREATE POLICY "Deleção de Própria Mídia"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'post-media' AND (auth.uid() = owner) );
