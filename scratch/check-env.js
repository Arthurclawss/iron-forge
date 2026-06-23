console.log("ENV VARS STATUS:");
console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
console.log("SUPABASE_PUBLISHABLE_KEY length:", process.env.SUPABASE_PUBLISHABLE_KEY ? process.env.SUPABASE_PUBLISHABLE_KEY.length : 0);
console.log("SUPABASE_SERVICE_ROLE_KEY length:", process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0);
console.log("LEADS_TOKEN exists:", !!process.env.LEADS_TOKEN);
