-- Expansão de Perfis com dados demográficos e ministeriais
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS church TEXT;

-- Adicionar índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Garantir que o nome completo seja gerado ou mantido
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT;
