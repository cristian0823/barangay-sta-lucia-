const fs = require('fs');

async function testSupabase() {
    try {
        console.log("Checking equipment table...");
        const response = await fetch("https://wpyryqbbsttllokikqys.supabase.co/rest/v1/equipment?select=name,quantity,available", {
            headers: {
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweXJ5cWJic3R0bGxva2lrcXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwMDc3MjQsImV4cCI6MjAzMTU4MzcyNH0", // Warning: Use env vars instead for real scripts
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweXJ5cWJic3R0bGxva2lrcXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwMDc3MjQsImV4cCI6MjAzMTU4MzcyNH0"
            }
        });
        const data = await response.json();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
testSupabase();
