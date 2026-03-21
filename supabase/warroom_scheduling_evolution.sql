-- 🛡️ EVOLUÇÃO DAS SALAS DE GUERRA (Agendamento e Intenção)
-- Adição de campos para suportar Salas Agendadas e Propósito Ministerial

DO $$
BEGIN
    -- 1. Campos de Agendamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_rooms' AND column_name = 'is_scheduled') THEN
        ALTER TABLE public.prayer_rooms ADD COLUMN is_scheduled BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_rooms' AND column_name = 'scheduled_for') THEN
        ALTER TABLE public.prayer_rooms ADD COLUMN scheduled_for TIMESTAMPTZ;
    END IF;

    -- 2. Campos de Intenção (Profundidade Ministerial)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_rooms' AND column_name = 'verse_base') THEN
        ALTER TABLE public.prayer_rooms ADD COLUMN verse_base TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_rooms' AND column_name = 'prayer_objective') THEN
        ALTER TABLE public.prayer_rooms ADD COLUMN prayer_objective TEXT;
    END IF;

    -- 3. Engajamento Prévio (Interessados)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_rooms' AND column_name = 'interested_count') THEN
        ALTER TABLE public.prayer_rooms ADD COLUMN interested_count INTEGER DEFAULT 0;
    END IF;

END $$;

-- 🛡️ POLÍTICAS PARA LEMBRETE (Interessados)
-- Permite que qualquer usuário autenticado 'marque interesse' (isso será feito via rpc ou update se permitido)
-- Por enquanto, garantimos apenas a estrutura. 
-- ✅ DASHBOARD SYNC: O administrador poderá ver salas agendadas e taxa de interesse.
