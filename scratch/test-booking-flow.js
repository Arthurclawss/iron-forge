import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = "https://ydshptsbmjuvoqnyfbrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2hwdHNibWp1dm9xbnlmYnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTExMzcsImV4cCI6MjA5NzM4NzEzN30.9trqKQMPjQL5oTyWNN8QETlh16vP4yNjTrb-f9809qA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("--- START INTEGRATION TEST ---");
  
  // 1. Create a dummy lead
  const testLeadId = crypto.randomUUID();
  console.log("Creating dummy lead with ID:", testLeadId);
  
  const { error: leadError } = await supabase
    .from("leads")
    .insert({
      id: testLeadId,
      name: "Teste Agendamento",
      email: `teste.${Date.now()}@example.com`,
      phone: "(11) 99999-8888",
      goal: "hipertrofia",
      source: "direct",
      notes: "Nota inicial do lead"
    });

  if (leadError) {
    console.error("Failed to create dummy lead:", leadError);
    return;
  }
  console.log("Dummy lead created successfully!");

  // 2. Call local booking API
  const bookingTime = new Date();
  bookingTime.setDate(bookingTime.getDate() + 2); // 2 days from now
  
  console.log("Calling local booking API...");
  try {
    const response = await fetch("http://localhost:8081/api/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: testLeadId,
        bookingTime: bookingTime.toISOString(),
        notes: "Gostaria de treinar a noite",
        name: "Teste Agendamento",
        email: `teste.${Date.now()}@example.com`,
        phone: "(11) 99999-8888"
      })
    });

    const status = response.status;
    const data = await response.json();
    console.log(`API response status: ${status}`);
    console.log("API response data:", data);

    if (data.ok) {
      console.log("API reported success!");
      
      // 3. Verify lead notes were updated with fallback info
      console.log("Verifying lead notes update in database...");
      const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("notes")
        .eq("id", testLeadId)
        .single();
        
      if (fetchError || !lead) {
        console.error("Failed to fetch lead after update:", fetchError);
      } else {
        console.log("Lead notes after booking:", JSON.stringify(lead.notes));
        if (lead.notes.includes("Aula Experimental Agendada")) {
          console.log("SUCCESS: Lead notes contain the booking backup!");
        } else {
          console.error("FAIL: Lead notes do not contain the booking backup!");
        }
      }
    } else {
      console.error("FAIL: API returned failure:", data.error);
    }
  } catch (err) {
    console.error("Failed to call API:", err.message);
  }
}

run();
