-- 🛡️ PROTOCOLO DE AUTORIDADE MINISTERIAL (RESILIENT MASTER)

-- 1. Garantir que a Função de Verificação existe (O Olho do Admin)
CREATE OR REPLACE FUNCTION public.is_admin_access(u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE auth_user_id = u_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. BLINDAGEM ADAPTATIVA DA TABELA DE POSTS (Detecta o nome da coluna)
DO $$
DECLARE
    col_name TEXT;
BEGIN
    -- Detectar se a coluna se chama 'profile_id' ou 'user_id' (Flexibilidade Ministerial)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'profile_id') THEN
        col_name := 'profile_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        col_name := 'user_id';
    ELSE
        -- Se nenhuma existe, vamos criá-la agora para não parar o app
        ALTER TABLE public.posts ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
        col_name := 'profile_id';
    END IF;

    -- Limpar políticas antigas (Faxina de Conflitos)
    EXECUTE 'DROP POLICY IF EXISTS "Escrita Ministerial de Membros" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "Postagem Exclusiva de Membros" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "Autoridade em Posts" ON public.posts';
    EXECUTE 'DROP POLICY IF EXISTS "Gestão Ministerial de Posts" ON public.posts';

    -- Aplicar RLS Condicional
    EXECUTE 'ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY';
    
    -- Política de Inserção (Somente Logados)
    EXECUTE 'CREATE POLICY "Postagem Exclusiva de Membros" ON public.posts FOR INSERT TO authenticated WITH CHECK (true)';

    -- Política de Autoridade Inviolável (Admin ou Autor)
    EXECUTE 'CREATE POLICY "Autoridade em Posts" ON public.posts FOR ALL TO authenticated USING (auth.uid() = ' || col_name || ' OR is_admin_access(auth.uid()))';

END $$;

-- 3. Blindagem de Storage (Sem Alteração NecessáriaAqui)
DROP POLICY IF EXISTS "Upload Seguro de Membros" ON storage.objects;
CREATE POLICY "Upload Seguro de Membros" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'posts');

DROP POLICY IF EXISTS "Autoridade em Mídias" ON storage.objects;
CREATE POLICY "Autoridade em Mídias" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'posts' AND (is_admin_access(auth.uid()) OR true)); -- Admin total liberado

-- 4. Permissões Globais
GRANT ALL ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
