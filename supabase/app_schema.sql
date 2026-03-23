-- 1. Extender Perfis com Redes Sociais e Contadores
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"youtube": "", "instagram": "", "whatsapp": "", "facebook": "", "linkedin": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Outro',
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS username_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

-- 2. Tabela de Seguidores (Relacionamento de Fé)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- 3. Mensagem do Dia (Destaque Ministerial)
-- Usaremos a tabela posts mas com uma flag especial
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_message_of_the_day BOOLEAN DEFAULT false;

-- Ativar RLS para Seguidores
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.follows TO authenticated;
