const express = require("express");
const cors = require("cors");
const { calculateFarmScore } = require("./score");
const { generateReport } = require("./pdf");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "FarmScore-AI" });
});

// Calculate farm score
app.post("/api/score", (req, res) => {
  try {
    const { farmerName, landArea, latitude, longitude, cropType } = req.body;

    if (!farmerName || !landArea || latitude === undefined || longitude === undefined || !cropType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = calculateFarmScore({ landArea, latitude, longitude, cropType });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate farm score" });
  }
});

// Generate PDF report
app.post("/api/report", async (req, res) => {
  try {
    const farmData = req.body;
    const pdfBuffer = await generateReport(farmData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FarmScore-Report-${farmData.farmerName || "report"}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF report" });
  }
});

app.listen(PORT, () => {
  console.log(`FarmScore-AI server running on http://localhost:${PORT}`);
});
