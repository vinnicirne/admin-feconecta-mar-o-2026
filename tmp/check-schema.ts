import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSchema() {
   const { data, error } = await supabase
     .from('profiles')
     .select('gender, birth_date, church, community_id, social_links, username_updated_at')
     .limit(1);

   if (error) {
     console.log("❌ ERRO NO SCHEMA:", error.code, error.message);
     if (error.code === '42703') {
        console.log("💡 CONFIRMADO: Colunas ausentes na tabela 'profiles'.");
     }
   } else {
     console.log("✅ SCHEMA OK: Todas as colunas existem.");
   }
}

testSchema();
