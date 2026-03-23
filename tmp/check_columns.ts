
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase.from('prayer_rooms').select('community_id').limit(1)
  if (error) {
    if (error.code === 'PGRST204') {
      console.log('Column community_id DOES NOT exist')
    } else {
      console.log('Error checking column:', error)
    }
  } else {
    console.log('Column community_id EXISTS')
  }
}

checkColumns()
