-- 🛠️ CORREÇÃO DE CONSTRAINTS: posts_post_type_check
-- Ajusta para aceitar os novos tipos ministeriais: compartilhar, edificar, oracao

DO $$
BEGIN
    -- 1. Remover a constraint antiga se existir
    ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;

    -- 2. Criar a nova constraint atualizada (FéConecta v2)
    ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check 
    CHECK (post_type IN ('compartilhar', 'edificar', 'oracao'));

    RAISE NOTICE 'Constraint posts_post_type_check atualizada com sucesso!';
END $$;

-- 🛡️ Garantir que a coluna media_type também aceite os formatos corretos
DO $$
BEGIN
    ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_media_type_check;
    
    ALTER TABLE public.posts ADD CONSTRAINT posts_media_type_check 
    CHECK (media_type IN ('text', 'image', 'video', 'audio'));
    
    RAISE NOTICE 'Constraint posts_media_type_check verificada!';
END $$;
