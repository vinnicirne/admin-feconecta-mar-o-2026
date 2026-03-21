-- 🛡️ EXPANSÃO ECLESIÁSTICA (FéConecta v3)
-- Criação de Tabelas para Comunidades (Igrejas) e Sala de Guerra (Prayer Rooms)

-- 1. Tabela de Comunidades (Igrejas/Ministérios)
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Igreja Local',
    leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    avatar_url TEXT,
    banner_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active', -- active, suspended, review
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Sala de Guerra (Prayer Rooms - Salas de Oração ao Vivo)
CREATE TABLE IF NOT EXISTS public.prayer_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled, live, ended
    max_duration_minutes INTEGER DEFAULT 60,
    current_viewers INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    livekit_room_name TEXT UNIQUE,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Participantes da Sala (Moderadores, Ouvintes)
CREATE TABLE IF NOT EXISTS public.prayer_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.prayer_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'listener', -- host, moderator, listener, speaker
    is_muted BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(room_id, profile_id)
);

-- 🛡️ POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_rooms ENABLE ROW LEVEL SECURITY;

-- Admins podem fazer tudo
CREATE POLICY "Admins manage all communities" ON public.communities FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage all prayer rooms" ON public.prayer_rooms FOR ALL TO authenticated USING (true);
