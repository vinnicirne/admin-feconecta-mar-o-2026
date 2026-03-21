-- 🛡️ GESTÃO DE CARGOS E PERMISSÕES
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna 'role' com valor padrão 'member'
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- 2. Garantir que os papéis permitidos sejam 'member', 'moderator' ou 'admin'
-- (Opcional: check constraint)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_profile_role;

ALTER TABLE public.profiles
  ADD CONSTRAINT check_profile_role 
  CHECK (role IN ('member', 'moderator', 'admin'));

-- 3. Atualizar administrador inicial (opcional - mude o ID se quiser)
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'seu-id-aqui';

-- 4. Criar função para verificar se usuário é admin (para RLS mais complexo no futuro)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
