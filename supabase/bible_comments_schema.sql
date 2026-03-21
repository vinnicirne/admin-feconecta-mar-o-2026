-- 5. Tabela de Comentários de Versículo (Recurso Separado de Notas)
CREATE TABLE IF NOT EXISTS public.bible_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verses INTEGER[] DEFAULT '{}',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.bible_comments ENABLE ROW LEVEL SECURITY;

-- Política: Somente o dono vê/altera
CREATE POLICY "Comentários Pessoais" ON public.bible_comments
FOR ALL TO authenticated
USING (auth.uid() = profile_id);

GRANT ALL ON public.bible_comments TO authenticated;