-- 1. Evolução da Tabela de Posts (FéConecta v2)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text', -- 'image', 'video', 'audio', 'text'
ADD COLUMN IF NOT EXISTS background_style TEXT DEFAULT 'transparent', 
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS is_bold BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_italic BOOLEAN DEFAULT false;

-- 2. Tabela de Comentários (Interação de Fé)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Likes (Reação de Fé)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, profile_id)
);

-- Ativar RLS para as novas tabelas
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.comments TO authenticated;
GRANT ALL ON public.post_likes TO authenticated;
