async function run() {
  console.log("Calling local download-leads API...");
  try {
    const res = await fetch("http://localhost:8081/api/public/download-leads?token=ironforge_crm_secret_2026&format=json");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Returned Leads:", data);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
