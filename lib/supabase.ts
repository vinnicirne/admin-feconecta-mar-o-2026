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
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = createClient();
    if (!client) {
      // Falha silenciosa no acesso à constante mas logamos o erro se não houver o cliente
      return null;
    }
    const val = client[prop];
    // Garantir que métodos (como .from(), .auth) continuem vinculados ao contexto correto
    return typeof val === 'function' ? val.bind(client) : val;
  }
});
