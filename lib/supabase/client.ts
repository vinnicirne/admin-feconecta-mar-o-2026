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
  
  // Singleton para o navegador (Evita múltiplos clients e locks de auth)
  if (isBrowser && clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  
  // 🛡️ VALIDAÇÃO DE CONFIGURAÇÃO
  if (!url || !key) {
    if (isBrowser) {
      console.error("❌ ERRO CRÍTICO: Variáveis do Supabase ausentes!");
      console.table({ 
        URL: url ? "Configurada ✅" : "Ausente ❌", 
        ANON_KEY: key ? "Configurada ✅" : "Ausente ❌" 
      });
    }
    return null;
  }

  // 🛡️ BLOQUEIO DE CHAVES PLACEHOLDER
  const isPlaceholder = url.includes('placeholder') || key.includes('placeholder') || key.length < 50;
  if (isPlaceholder) {
    if (isBrowser) {
       console.error("❌ SUPABASE_URL ou ANON_KEY contêm placeholders ou são inválidas!");
       console.warn("Valor detectado parece ser um placeholder ou chave incompleta.");
    }
    return null;
  }
  
  try {
    const client = createBrowserClient(url, key);
    
    if (isBrowser) {
      clientInstance = client;
    }
    
    return client;
  } catch (err) {
    console.error("❌ Erro ao criar cliente Supabase:", err);
    return null;
  }
}
