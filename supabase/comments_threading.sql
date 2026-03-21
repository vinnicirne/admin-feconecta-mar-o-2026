-- 1. ADICIONAR SUPORTE A RESPOSTAS (THREADS)
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. POLÍTICAS DE RLS PARA COMENTÁRIOS (EDIÇÃO E EXCLUSÃO)
DROP POLICY IF EXISTS "Dono pode editar comentário" ON public.comments;
CREATE POLICY "Dono pode editar comentário" ON public.comments 
FOR UPDATE TO authenticated USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Dono pode excluir comentário" ON public.comments;
CREATE POLICY "Dono pode excluir comentário" ON public.comments 
FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- 3. HABILITAR REALTIME (Ato Final para Tempo Real)
-- Execute isto para garantir que as mudanças apareçam instantaneamente para todos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_prayers;
