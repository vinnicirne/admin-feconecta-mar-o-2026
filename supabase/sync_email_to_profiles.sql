-- 🛡️ SINCRONIZAÇÃO DE DADOS CRÍTICOS (FéConecta v2)
-- Adiciona E-mail e campos de contato à tabela de perfis para gestão via Dashboard

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Sincronizar e-mails existentes do Auth para os Perfis
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Atualizar o trigger para incluir o e-mail em novos cadastros
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
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    NEW.raw_user_meta_data->>'church',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || NEW.id)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
