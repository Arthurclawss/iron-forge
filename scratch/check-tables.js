import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ydshptsbmjuvoqnyfbrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2hwdHNibWp1dm9xbnlmYnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTExMzcsImV4cCI6MjA5NzM4NzEzN30.9trqKQMPjQL5oTyWNN8QETlh16vP4yNjTrb-f9809qA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("Querying 'leads'...");
  const { data, error } = await supabase
    .from("leads")
    .select("id")
    .limit(1);

  if (error) {
    console.error("LEADS ERROR:", error);
  } else {
    console.log("LEADS SUCCESS! Found leads:", data);
  }
}

run();
