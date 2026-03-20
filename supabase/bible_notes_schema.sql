-- 1. Tabela de Diário Espiritual (Notas Pessoais)
CREATE TABLE IF NOT EXISTS public.user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL, -- Ex: 'GEN'
    chapter INTEGER NOT NULL,
    verses JSONB DEFAULT '[]'::jsonb, -- Lista de versículos associados
    title TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Marca-texto Digital (Bible Highlights)
CREATE TABLE IF NOT EXISTS public.bible_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    color TEXT DEFAULT '#fef08a', -- Cor do Highlight (Marca-texto)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, book_id, chapter, verse)
);

-- 3. Tabela de Favoritos da Bíblia
CREATE TABLE IF NOT EXISTS public.bible_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, book_id, chapter, verse)
);

-- 4. Habilitar RLS (Privacidade Absoluta das Notas)
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_favorites ENABLE ROW LEVEL SECURITY;

-- Notas: Somente o dono vê, a menos que ele torne pública.
CREATE POLICY "Privacidade das Notas Pessoais" ON public.user_notes
FOR ALL TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Marca-texto Pessoal" ON public.bible_highlights
FOR ALL TO authenticated
USING (auth.uid() = profile_id);

GRANT ALL ON public.user_notes TO authenticated;
GRANT ALL ON public.bible_highlights TO authenticated;
GRANT ALL ON public.bible_favorites TO authenticated;
