import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = "https://ydshptsbmjuvoqnyfbrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2hwdHNibWp1dm9xbnlmYnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTExMzcsImV4cCI6MjA5NzM4NzEzN30.9trqKQMPjQL5oTyWNN8QETlh16vP4yNjTrb-f9809qA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("Inserting lead directly into Supabase using public/anon key...");
  
  const leadId = crypto.randomUUID();
  const email = `test-${Date.now()}@example.com`;
  const { data, error } = await supabase
    .from("leads")
    .insert({
      id: leadId,
      name: "Teste Direto",
      email: email,
      phone: "558498071144",
      goal: "hipertrofia",
      source: "direct"
    })
    .select();

  if (error) {
    console.error("Direct Insert Error:", error);
  } else {
    console.log("Direct Insert Success:", data);
  }
}

run();
