const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { error } = await supabase.from('app_features').upsert([
    { name: 'war_room_join_button', label: 'Botão "Entrar na Sala" no Feed (Posts)', is_enabled: true }
  ], { onConflict: 'name' });

  if (error) console.error("Error inserting feature:", error);
  else console.log("Feature 'war_room_join_button' added/verified successfully.");
}

run();
