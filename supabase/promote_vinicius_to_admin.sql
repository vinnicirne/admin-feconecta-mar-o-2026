-- 🛡️ PROMOÇÃO DE ADMINISTRADOR: viniciuscirne@gmail.com

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Buscar o ID do usuário no Supabase Auth
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'viniciuscirne@gmail.com';

    IF target_user_id IS NOT NULL THEN
        -- 2. Atualizar Metadata do Auth (Para o Next.js reconhecer a role)
        UPDATE auth.users 
        SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
            raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
        WHERE id = target_user_id;

        -- 3. Inserir ou Atualizar na tabela de Administradores do Dashboard
        INSERT INTO public.admin_users (auth_user_id, name, email, role, status)
        VALUES (
            target_user_id,
            'Vinicius Cirne', -- Nome de exibição
            'viniciuscirne@gmail.com',
            'super_admin', -- Nível máximo de acesso
            'active'
        )
        ON CONFLICT (email) DO UPDATE SET 
            auth_user_id = EXCLUDED.auth_user_id,
            role = 'super_admin',
            status = 'active';

        RAISE NOTICE 'Usuário viniciuscirne@gmail.com promovido a SUPER_ADMIN com sucesso!';
    ELSE
        RAISE EXCEPTION 'Usuário com email viniciuscirne@gmail.com não encontrado. Verifique se ele já se cadastrou no app.';
    END IF;
END $$;
