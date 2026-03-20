-- 1. Tabela de Planos de Estudo (Caminhos de Fé)
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    category TEXT DEFAULT 'Devocional', -- 'Estudo Bíblico', 'Teologia', etc.
    cover_url TEXT,
    is_verified BOOLEAN DEFAULT false, -- Selo de Comunidade Verificada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Etapas do Plano (Passos de Fé)
CREATE TABLE IF NOT EXISTS public.study_plan_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.study_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    bible_reference TEXT, -- Ex: 'João 3:16'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Inscrições e Progresso (Jornada Ministerial)
CREATE TABLE IF NOT EXISTS public.study_plan_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.study_plans(id) ON DELETE CASCADE,
    current_day INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
    completed_steps INTEGER[] DEFAULT '{}', -- Array de IDs de etapas concluídas
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, plan_id)
);

-- Ativar RLS
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan_enrollments ENABLE ROW LEVEL SECURITY;

-- Planos são públicos para leitura
CREATE POLICY "Planos Públicos" ON public.study_plans FOR SELECT TO public USING (true);
CREATE POLICY "Etapas Públicas" ON public.study_plan_steps FOR SELECT TO public USING (true);

-- Inscrições são privadas do membro
CREATE POLICY "Minha Jornada de Estudo" ON public.study_plan_enrollments
FOR ALL TO authenticated
USING (auth.uid() = profile_id);

GRANT ALL ON public.study_plans TO authenticated;
GRANT ALL ON public.study_plan_steps TO authenticated;
GRANT ALL ON public.study_plan_enrollments TO authenticated;
