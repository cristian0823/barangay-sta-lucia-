const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cojgsyrnexbwgsfttojq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E'
);

async function checkDb() {
  const { data, error } = await supabase.from('equipment').select('*');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

checkDb();
