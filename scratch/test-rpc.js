import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ydshptsbmjuvoqnyfbrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2hwdHNibWp1dm9xbnlmYnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTExMzcsImV4cCI6MjA5NzM4NzEzN30.9trqKQMPjQL5oTyWNN8QETlh16vP4yNjTrb-f9809qA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("Calling get_leads_secure RPC...");
  const { data, error } = await supabase
    .rpc("get_leads_secure", { token_input: "ironforge_crm_secret_2026" });

  if (error) {
    console.error("RPC ERROR:", error);
  } else {
    console.log("RPC SUCCESS! Found leads:", data);
  }
}

run();
