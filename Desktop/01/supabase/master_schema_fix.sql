-- 1. Garantir que a tabela Profiles existe (O Coração do Membro)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Garantir que a tabela Posts existe com a coluna PROFILE_ID (O Caminho da Fé)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    media_type TEXT DEFAULT 'text',
    background_style TEXT DEFAULT 'transparent',
    font_family TEXT DEFAULT 'Inter',
    is_bold BOOLEAN DEFAULT false,
    is_italic BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Se por acaso a coluna se chamava user_id, vamos renomear ou garantir profile_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        ALTER TABLE public.posts RENAME COLUMN user_id TO profile_id;
    END IF;
END $$;

-- 4. Repetir as políticas de segurança (RLS) sem erros
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura Pública do Refúgio" ON public.posts;
CREATE POLICY "Leitura Pública do Refúgio" ON public.posts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Escrita Ministerial de Membros" ON public.posts;
CREATE POLICY "Escrita Ministerial de Membros" ON public.posts FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5. Dar permissões
GRANT ALL ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
