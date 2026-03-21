-- 🛡️ INTEGRIDADE MINISTERIAL (CONSTRAINTS DE INTERAÇÃO)
-- Garante que um membro possa orar/curtir apenas uma vez por post, permitindo o "descurtir" ou "retirar oração" futuramente.

-- 1. Unicidade em LIKES (Um like por membro por post)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_likes_unique_user_id') THEN
        ALTER TABLE public.post_likes ADD CONSTRAINT post_likes_unique_user_id UNIQUE (post_id, profile_id);
    END IF;
END $$;

-- 2. Unicidade em ORAÇÕES (Uma intercessão por membro por post)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_prayers_unique_user_id') THEN
        ALTER TABLE public.post_prayers ADD CONSTRAINT post_prayers_unique_user_id UNIQUE (post_id, profile_id);
    END IF;
END $$;

-- 3. Unicidade em SEGUIDORES (Evitar redundância ministerial)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follows_unique_user_id') THEN
        ALTER TABLE public.follows ADD CONSTRAINT follows_unique_user_id UNIQUE (follower_id, following_id);
    END IF;
END $$;
