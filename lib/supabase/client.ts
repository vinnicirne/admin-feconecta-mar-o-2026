import { createBrowserClient } from "@supabase/ssr";

// Singleton para o cliente no navegador para evitar erro de múltiplas instâncias GoTrue
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser && client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  
  if (isBrowser) {
    client = createBrowserClient(url, key);
    return client;
  }
  
  // No servidor, criamos uma instância rápida ou usamos o server client se necessário
  // MAS no browser, o singleton é sagrado para evitar conflitos de locks
  return createBrowserClient(url, key);
}
