-- Adicionar preferência de privacidade para a data de nascimento
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_birth_date_public BOOLEAN DEFAULT true;
