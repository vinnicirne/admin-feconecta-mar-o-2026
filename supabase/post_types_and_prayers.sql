-- 1. Adição do Tipo de Post
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'compartilhar';

-- 2. Tabela de Orações (O Coração do FéConecta)
-- Rastreia quem orou por qual post e evita duplicidade
CREATE TABLE IF NOT EXISTS public.post_prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, profile_id)
);

-- Ativar RLS (Segurança Ministerial)
ALTER TABLE public.post_prayers ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS: Qualquer um pode ver contagem, apenas dono pode apagar
CREATE POLICY "Qualquer autenticado pode registrar oração" 
ON public.post_prayers FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Qualquer um pode ver quem orou" 
ON public.post_prayers FOR SELECT 
USING (true);

-- Permissões
GRANT ALL ON public.post_prayers TO authenticated;
GRANT ALL ON public.post_prayers TO service_role;
