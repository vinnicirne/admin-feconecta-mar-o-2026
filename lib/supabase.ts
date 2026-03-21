import { createClient } from "./supabase/client";

// Exportamos uma instância singleton para compatibilidade com o código legado que usa 'import { supabase }'
// O createClient() no diretório supabase/client.ts já garante que seja um singleton real
export const supabase = createClient();
