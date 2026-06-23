/**
 * Script: Executa o SQL das funções RPC diretamente na API do Supabase
 * via chamada REST com a chave pública (anon key).
 * 
 * NOTA: Este script tenta executar as funções via fetch + SQL RPC.
 * Para criação de funções, é necessário autorização com service_role key.
 * 
 * Apenas use este script se você tiver a SERVICE ROLE KEY disponível.
 */

const SUPABASE_URL = "https://ydshptsbmjuvoqnyfbrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2hwdHNibWp1dm9xbnlmYnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTExMzcsImV4cCI6MjA5NzM4NzEzN30.9trqKQMPjQL5oTyWNN8QETlh16vP4yNjTrb-f9809qA";

// Tenta verificar se o RPC existe com a key atual
async function run() {
  console.log("Testando se get_leads_secure existe...");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_leads_secure`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_PUBLISHABLE_KEY,
      "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token_input: "ironforge_crm_secret_2026" })
  });
  
  const status = res.status;
  const text = await res.text();
  
  if (status === 200) {
    const data = JSON.parse(text);
    console.log(`✅ RPC OK! Total de leads: ${data.length}`);
    if (data.length > 0) {
      console.log("Primeiro lead:", data[0]);
    }
  } else if (status === 404 || text.includes("PGRST202")) {
    console.log("❌ Função get_leads_secure NÃO encontrada no banco.");
    console.log("AÇÃO NECESSÁRIA: Execute o SQL do arquivo 'supabase/migrations/20260623000001_secure_rpc_functions.sql' no Supabase SQL Editor.");
    console.log("URL: https://supabase.com/dashboard/project/ydshptsbmjuvoqnyfbrp/sql/new");
  } else {
    console.log(`Status: ${status}`);
    console.log("Body:", text);
  }
}

run();
