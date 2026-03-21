import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    // Retorna um objeto proxy nulo seguro para evitar quebras imediatas
    // No browser real, isso indicaria erro de configuração.
    return null as any;
  }
  
  return createBrowserClient(url, key);
}

