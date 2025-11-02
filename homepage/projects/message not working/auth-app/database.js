const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

async function test() {
  const { data, error } = await supabase.from('chat').select('*').limit(5)
  if (error) console.error("❌ Erreur :", error)
  else console.log("✅ Données :", data)
}

test()

module.exports = supabase