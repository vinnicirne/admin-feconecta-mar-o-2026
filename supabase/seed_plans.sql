-- Script para Popular Planos de Estudo (Seed Data)
DO $$
DECLARE
    v_creator_id UUID;
BEGIN
    SELECT id INTO v_creator_id FROM public.profiles LIMIT 1;
    
    IF v_creator_id IS NOT NULL THEN
        INSERT INTO public.study_plans (title, description, duration_days, category, is_verified, creator_id)
        VALUES 
        ('7 Dias de Fé Inabalável', 'Uma jornada profunda para fortalecer sua confiança em Deus nos momentos de tempestade.', 7, 'Fé', true, v_creator_id),
        ('O Poder da Oração Diária', 'Aprenda os segredos da oração fervorosa que move o céu e transforma a terra.', 5, 'Oração', false, v_creator_id),
        ('Edificando a Família sobre a Rocha', 'Princípios bíblicos para um lar abençoado e relacionamentos restaurados.', 10, 'Família', true, v_creator_id);

        INSERT INTO public.study_plan_steps (plan_id, day_number, title, content, bible_reference)
        SELECT id, 1, 'Definindo a Fé Real', 'O que é fé segundo as Escrituras?', 'Hebreus 11:1' FROM study_plans WHERE title = '7 Dias de Fé Inabalável';
        INSERT INTO public.study_plan_steps (plan_id, day_number, title, content, bible_reference)
        SELECT id, 2, 'A Fé contra o Medo', 'Como Davi enfrentou o gigante confiando no Senhor.', '1 Samuel 17:45' FROM study_plans WHERE title = '7 Dias de Fé Inabalável';
        INSERT INTO public.study_plan_steps (plan_id, day_number, title, content, bible_reference)
        SELECT id, 3, 'Fé na Fornalha', 'Permanecendo fiel mesmo quando o fogo esquenta.', 'Daniel 3:17-18' FROM study_plans WHERE title = '7 Dias de Fé Inabalável';
    END IF;
END $$;
