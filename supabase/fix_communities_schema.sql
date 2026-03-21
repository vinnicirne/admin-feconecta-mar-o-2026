-- 🛠️ CORREÇÃO: Adicionar colunas faltantes na tabela 'communities'
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna 'category' se não existir
ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Igreja Local';

-- 2. Adicionar demais colunas do schema completo (seguro com IF NOT EXISTS)
ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS banner_url TEXT;

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

ALTER TABLE public.communities 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Criar unique index no slug (apenas se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'communities' AND indexname = 'communities_slug_key'
  ) THEN
    CREATE UNIQUE INDEX communities_slug_key ON public.communities(slug) WHERE slug IS NOT NULL;
  END IF;
END $$;

-- 4. Criar tabela prayer_rooms se não existir (com todas as colunas)
CREATE TABLE IF NOT EXISTS public.prayer_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'scheduled',
    max_duration_minutes INTEGER DEFAULT 60,
    current_viewers INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    livekit_room_name TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Habilitar RLS (seguro repetir)
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_rooms ENABLE ROW LEVEL SECURITY;

-- 6. Policies (DROP antes para evitar conflito — lista completa)
DROP POLICY IF EXISTS "Anyone can read communities" ON public.communities;
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Leader can update their community" ON public.communities;
DROP POLICY IF EXISTS "Anyone can read prayer rooms" ON public.prayer_rooms;
DROP POLICY IF EXISTS "Authenticated users can create prayer rooms" ON public.prayer_rooms;
DROP POLICY IF EXISTS "Host can update prayer room" ON public.prayer_rooms;

CREATE POLICY "Anyone can read communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create communities" ON public.communities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Leader can update their community" ON public.communities FOR UPDATE TO authenticated USING (leader_id = auth.uid());

CREATE POLICY "Anyone can read prayer rooms" ON public.prayer_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create prayer rooms" ON public.prayer_rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Host can update prayer room" ON public.prayer_rooms FOR UPDATE TO authenticated USING (host_id = auth.uid());
