const API_BASE = "http://localhost:5000/api";

const form = document.getElementById("farmForm");
const resultCard = document.getElementById("resultCard");
const scoreOutput = document.getElementById("scoreOutput");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

let lastFarmData = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const farmData = {
    farmerName: document.getElementById("farmerName").value,
    landArea: parseFloat(document.getElementById("landArea").value),
    latitude: parseFloat(document.getElementById("latitude").value),
    longitude: parseFloat(document.getElementById("longitude").value),
    cropType: document.getElementById("cropType").value,
  };

  lastFarmData = farmData;

  try {
    const res = await fetch(`${API_BASE}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(farmData),
    });

    if (!res.ok) throw new Error("Failed to calculate score");

    const data = await res.json();
    lastFarmData.score = data.score;
    lastFarmData.breakdown = data.breakdown;

    scoreOutput.innerHTML = `
      <div class="score-value">${data.score} / 100</div>
      <p><strong>Risk Category:</strong> ${data.riskCategory}</p>
      <ul>
        ${Object.entries(data.breakdown)
          .map(([k, v]) => `<li>${k}: ${v}</li>`)
          .join("")}
      </ul>
    `;
    resultCard.hidden = false;
  } catch (err) {
    alert("Error: " + err.message);
  }
});

downloadPdfBtn.addEventListener("click", async () => {
  if (!lastFarmData) return;

  try {
    const res = await fetch(`${API_BASE}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lastFarmData),
    });

    if (!res.ok) throw new Error("Failed to generate PDF");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FarmScore-Report-${lastFarmData.farmerName || "report"}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("Error: " + err.message);
  }
});
