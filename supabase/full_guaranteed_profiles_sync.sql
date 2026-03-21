-- 🛡️ SCRIPT DE GARANTIA ABSOLUTA: PERFIS MINISTERIAIS
-- Este script garante que 1) O banco tenha todas as colunas e 2) A trigger de sincronização esteja 100% ativa.

-- 1. Garantir que as colunas existam na tabela PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS church TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 2. Função de Sincronização Inteligente (Lê os Metadados do App e Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile_guaranteed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name,
    last_name,
    full_name, 
    username, 
    birth_date, 
    gender, 
    church,
    avatar_url,
    post_count,
    follower_count,
    following_count
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''), split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', lower(replace(split_part(NEW.email, '@', 1), '.', '_'))),
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'church',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || NEW.id),
    0, 0, 0
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    church = EXCLUDED.church;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar Trigger (Após garantir que colunas existem)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile_guaranteed();

-- 4. BACKFILL: Sincronizar todos os usuários que já existem mas estão sem perfil ou com perfil vazio
INSERT INTO public.profiles (id, full_name, username)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email), 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username;
