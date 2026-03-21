-- 🔄 RE-SINCRONIZAÇÃO COMPLETA DE PERFIS (Igreja e Metadados)
-- Atualiza os perfis que podem estar com a igreja ou outros dados faltando

UPDATE public.profiles p
SET 
  church = COALESCE(u.raw_user_meta_data->>'church', p.church),
  full_name = COALESCE(u.raw_user_meta_data->>'full_name', p.full_name),
  username = COALESCE(u.raw_user_meta_data->>'username', p.username)
FROM auth.users u
WHERE p.id = u.id;

-- Garante que novos perfis também puxem a igreja no backfill caso falte
INSERT INTO public.profiles (id, full_name, username, church)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email), 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    raw_user_meta_data->>'church'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    church = EXCLUDED.church;
