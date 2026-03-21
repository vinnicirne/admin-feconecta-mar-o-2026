-- 🛡️ CORREÇÃO DE SEGURANÇA: Visibilidade das Salas de Guerra
-- Permite que todos os usuários autenticados vejam as salas ativas

-- 1. Políticas para prayer_rooms
DROP POLICY IF EXISTS "Qualquer um pode ver salas ativas" ON public.prayer_rooms;
CREATE POLICY "Qualquer um pode ver salas ativas" 
ON public.prayer_rooms FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Usuários podem criar salas" ON public.prayer_rooms;
CREATE POLICY "Usuários podem criar salas" 
ON public.prayer_rooms FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Host pode atualizar sua sala" ON public.prayer_rooms;
CREATE POLICY "Host pode atualizar sua sala" 
ON public.prayer_rooms FOR UPDATE 
TO authenticated 
USING (auth.uid() = host_id);

-- 2. Políticas para comunidades (necessário para o feed)
DROP POLICY IF EXISTS "Qualquer um pode ver comunidades" ON public.communities;
CREATE POLICY "Qualquer um pode ver comunidades" 
ON public.communities FOR SELECT 
TO authenticated 
USING (true);

-- 3. Políticas para participantes
DROP POLICY IF EXISTS "Qualquer um pode ver participantes de uma sala" ON public.prayer_room_participants;
CREATE POLICY "Qualquer um pode ver participantes de uma sala" 
ON public.prayer_room_participants FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Usuários podem se juntar a salas" ON public.prayer_room_participants;
CREATE POLICY "Usuários podem se juntar a salas" 
ON public.prayer_room_participants FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = profile_id);
