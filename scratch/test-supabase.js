import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = "https://ydshptsbmjuvoqnyfbrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2hwdHNibWp1dm9xbnlmYnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTExMzcsImV4cCI6MjA5NzM4NzEzN30.9trqKQMPjQL5oTyWNN8QETlh16vP4yNjTrb-f9809qA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("Connecting to Supabase...");
  
  const leadId = "dc44e14e-4d21-46fd-8ea3-fd3094387a17"; // The lead ID we successfully inserted earlier
  const bookingId = crypto.randomUUID();
  console.log("Pre-generated Booking ID:", bookingId);

  const { error } = await supabase
    .from("bookings")
    .insert({
      id: bookingId,
      lead_id: leadId,
      booking_time: new Date().toISOString(),
      status: "agendado"
    });

  if (error) {
    console.error("SUPABASE BOOKING ERROR:", error);
  } else {
    console.log("SUCCESS! Booking inserted successfully. Booking ID:", bookingId);
  }
}

run();
