-- 🛡️ EVOLUÇÃO REALTIME DA SALA DE GUERRA
-- Adição de tabelas para mensagens e reações em tempo real

-- 1. Tabela de Mensagens da Sala (Substitui State Local)
CREATE TABLE IF NOT EXISTS public.prayer_room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.prayer_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Reações da Sala (Globaliza a Explosão)
CREATE TABLE IF NOT EXISTS public.prayer_room_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.prayer_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Habilitar Realtime para estas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_room_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_rooms;

-- 🛡️ POLÍTICAS RLS (Segurança Mínima)
ALTER TABLE public.prayer_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_room_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone in room can view messages" ON public.prayer_room_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone in room can insert messages" ON public.prayer_room_messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anyone in room can view reactions" ON public.prayer_room_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone in room can insert reactions" ON public.prayer_room_reactions FOR INSERT TO authenticated WITH CHECK (true);
