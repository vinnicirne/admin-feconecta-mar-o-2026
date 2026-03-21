import { createClient } from "./supabase/client";

/**
 * 🛡️ DELEGADOR DINÂMICO SUPABASE (FéConecta v2)
 * 
 * Este Proxy resolve o problema de importação prematura no Next.js onde as 
 * chaves NEXT_PUBLIC ainda não foram injetadas no 'process.env' no momento da 
 * avaliação do código do arquivo. 
 * 
 * Agora, ao acessar 'supabase.from()', o sistema chama dinamicamente o Singleton 'createClient()' 
 * que já garante a instância única, resolvendo problemas de locks e chaves vazias simultaneamente. 
 */
let serverInstance: any = null;

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    // Reusa a instância (Singleton no Browser - via createClient, ou Cache no Servidor)
    const isBrowser = typeof window !== 'undefined';
    let client = isBrowser ? createClient() : serverInstance;

    if (!isBrowser && !client) {
      serverInstance = createClient();
      client = serverInstance;
    }

    if (!client) {
      console.warn(`⚠️ Supabase client indisponível ao acessar: ${String(prop)}`);
      // Retorna um placeholder para evitar crashimediato, mas as chamadas falharão
      return (prop === 'from' || prop === 'auth') ? (() => ({})) : null;
    }

    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});
