-- 🎵 AMBIENTE DE LOUVOR SINCRONIZADO (REALTIME VIVO)
-- Criação do estado global para sincronização de tempo dos fiéis

CREATE TABLE IF NOT EXISTS public.praise_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id TEXT NOT NULL,         -- ID do YouTube
    track_title TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(), -- Quando a música começou
    is_playing BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Realtime para esta tabela
ALTER TABLE public.praise_session REPLICA IDENTITY FULL;

-- Inserir a primeira música de exemplo (Harpa Cristã - Hino da Vitória)
INSERT INTO public.praise_session (track_id, track_title)
VALUES ('7Euvg8YkL_0', 'Harpa Cristã Instrumental') -- ID de exemplo real
ON CONFLICT DO NOTHING;
