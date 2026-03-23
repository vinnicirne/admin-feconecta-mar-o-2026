-- 🙏 ATUALIZAÇÃO DE COMUNIDADES: IDENTIFICADOR ÚNICO
-- Adiciona um "handle" (@) único para cada comunidade facilitar a busca.

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS handle text UNIQUE;

-- Criar um índice de busca por nome e handle para performance
CREATE INDEX IF NOT EXISTS idx_communities_search ON public.communities USING gin (to_tsvector('portuguese', name || ' ' || coalesce(handle, '')));

-- ✨ COMENTÁRIO
COMMENT ON COLUMN public.communities.handle IS 'Identificador único da comunidade (ex: @igreja_central).';
