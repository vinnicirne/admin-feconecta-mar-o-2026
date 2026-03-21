-- 🛡️ REFORÇO DE CAPTURA DE DADOS (FéConecta v2)
-- Corrige a captura de Nascimento suportando múltiplos formatos de metadados
-- Garante que o E-mail seja sempre persistido no perfil para o Dashboard

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username, 
    email,
    birth_date, 
    church,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', lower(split_part(NEW.email, '@', 1))),
    NEW.email,
    -- Captura inteligente de nascimento (tenta birth_date, birthdate ou dob)
    COALESCE(
      NEW.raw_user_meta_data->>'birth_date', 
      NEW.raw_user_meta_data->>'birthdate',
      NEW.raw_user_meta_data->>'dob'
    )::DATE,
    NEW.raw_user_meta_data->>'church',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || NEW.id)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    birth_date = EXCLUDED.birth_date;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sincronização Retroativa de Nascimento para perfis existentes
UPDATE public.profiles p
SET birth_date = COALESCE(u.raw_user_meta_data->>'birth_date', u.raw_user_meta_data->>'birthdate', u.raw_user_meta_data->>'dob')::DATE
FROM auth.users u
WHERE p.id = u.id AND p.birth_date IS NULL;
