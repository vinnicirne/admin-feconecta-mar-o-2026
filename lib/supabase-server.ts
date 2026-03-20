import { createClient } from '@supabase/supabase-js';

// 🛡️ MOTOR DE SERVIDOR (MINISTÉRIO RESTRITO)
// Estas variáveis serão lidas APENAS no servidor da Vercel (Cloud).
// Elas NUNCA são enviadas ao navegador, mesmo que o usuário tente inspecionar o código.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Chave de Poder Total (Oculta)

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
