import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const features = [
    { name: 'profile_edit_email', label: 'Editar E-mail de Acesso', is_enabled: true },
    { name: 'profile_edit_username', label: 'Editar @Username (Trava 15 dias)', is_enabled: true },
    { name: 'profile_edit_church', label: 'Vincular Igreja/Comunidade', is_enabled: true },
    { name: 'profile_advanced_social', label: 'Links Sociais Avançados', is_enabled: true }
  ];

  const { error } = await supabase.from('app_features').upsert(features, { onConflict: 'name' });

  if (error) console.error("Error inserting features:", error);
  else console.log("Profile features added successfully.");
}

run();
