import { createBrowserClient } from "@supabase/ssr";

// Singleton para o cliente no navegador
let clientInstance: any = null;

/**
 * 🛡️ CLIENTE MONITORADO SUPABASE (FéConecta v2)
 * 
 * Este singleton resolve a concorrência por locks de autenticação no navegador 
 * e blinda a aplicação contra o uso de chaves 'placeholder'. Se as variáveis 
 * NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estiverem 
 * disponíveis no momento da criação, o sistema loga um erro ministerial crítico 
 * e impede a criação de uma instância inválida.
 */
export function createClient() {
  const isBrowser = typeof window !== 'undefined';
  
  // Singleton para o navegador
  if (isBrowser && clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // 🛡️ BLOQUEIO DE CHAVES INVÁLIDAS
  if (!url || !key || url.includes('placeholder') || key === 'placeholder') {
    if (isBrowser) {
      console.error("❌ SUPABASE_URL ou ANON_KEY não configuradas ou são 'placeholder'!");
      console.warn("Dica: Verifique seu arquivo .env ou reinicie o 'npm run dev'");
    }
    // Retornamos um dummy nulo para evitar recursão infinita ou quebra de hooks
    return null;
  }
  
  if (isBrowser) {
    clientInstance = createBrowserClient(url, key);
    return clientInstance;
  }
  
  // No servidor (SSR), o Next.js lida com a concorrência, retornamos nova instância
  return createBrowserClient(url, key);
}
