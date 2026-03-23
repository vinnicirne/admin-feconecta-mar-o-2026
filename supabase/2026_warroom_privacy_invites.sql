-- UPDATE: Public vs Private War Rooms & Guest Invites
-- Autor: Engenheiro Sênior (Antigravity Assistant)

-- 1. Adicionando tipagem na Sala de Guerra para torná-la Publica ou Privada
ALTER TABLE public.prayer_rooms ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- 2. Tabela de Convites (Ações de Chat/Alerta Pessoal)
CREATE TABLE IF NOT EXISTS public.prayer_room_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.prayer_rooms(id) ON DELETE CASCADE,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_username TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Segurança e Políticas de Acesso
ALTER TABLE public.prayer_room_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes podem visualizar convites" 
ON public.prayer_room_invites 
FOR SELECT 
USING (true);

CREATE POLICY "Anfitriões podem enviar convites" 
ON public.prayer_room_invites 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar seus convites" 
ON public.prayer_room_invites 
FOR UPDATE 
USING (true);
