async function run() {
  console.log("Calling local API /api/public/leads on port 8080...");
  try {
    const response = await fetch("http://localhost:8080/api/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Teste API",
        email: `teste.api.${Date.now()}@example.com`,
        phone: "(84) 99999-8888",
        goal: "hipertrofia",
        notes: "Teste de erro de RLS"
      })
    });
    
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", data);
  } catch (err) {
    console.error("Error on port 8080:", err.message);
  }

  console.log("\nCalling local API /api/public/leads on port 8081...");
  try {
    const response = await fetch("http://localhost:8081/api/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Teste API",
        email: `teste.api.${Date.now()}@example.com`,
        phone: "(84) 99999-8888",
        goal: "hipertrofia",
        notes: "Teste de erro de RLS"
      })
    });
    
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", data);
  } catch (err) {
    console.error("Error on port 8081:", err.message);
  }
}

run();
