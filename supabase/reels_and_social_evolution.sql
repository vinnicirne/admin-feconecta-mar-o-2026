-- 🛡️ EVOLUÇÃO SOCIAL DO REFÚGIO (REELS + MINISTERIAL)
-- Execute este script no SQL Editor do seu Supabase

-- 1. Evolução da Tabela POSTS
-- Adiciona suporte a mídias, tipos de post ministerial e estilos visuais
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'compartilhar' CHECK (post_type IN ('compartilhar', 'edificar', 'oracao')),
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'audio')),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS background_style TEXT DEFAULT 'transparent',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Sans',
ADD COLUMN IF NOT EXISTS is_bold BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_italic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb; -- Ouro: Salva trim, overlay e música do Reels

-- 2. Sistema de Orações Reais (🙏)
-- Tabela para registrar quem está orando por qual post de oração
CREATE TABLE IF NOT EXISTS public.post_prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- 3. Segurança (RLS) para Orações
ALTER TABLE public.post_prayers ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver quem está orando
CREATE POLICY "Orações visíveis para todos" 
ON public.post_prayers FOR SELECT 
USING (true);

-- Política: Apenas usuários autenticados podem orar
CREATE POLICY "Membros podem orar" 
ON public.post_prayers FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Política: O usuário pode "remover" sua oração (unpray)
CREATE POLICY "Remover própria oração" 
ON public.post_prayers FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Buckets de Mídia (STORAGE)
-- Requisito para o Reels funcionar
-- Nota: Execute estes comandos se o seu projeto permitir criação via SQL
-- Caso contrário, crie um bucket público chamado 'post-media' no painel Storage.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas do Storage para o Bucket 'post-media'
CREATE POLICY "Mídias públicas para visualização" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'post-media');

CREATE POLICY "Membros podem subir mídias" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'post-media' AND auth.role() = 'authenticated');

-- 5. Índices para Performance do Feed
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_media_type ON public.posts(media_type);
CREATE INDEX IF NOT EXISTS idx_post_prayers_post_id ON public.post_prayers(post_id);
