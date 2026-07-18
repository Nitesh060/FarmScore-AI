const farmerNameEl = document.getElementById('farmerName');
const latEl = document.getElementById('latitude');
const lonEl = document.getElementById('longitude');
const mapBtn = document.getElementById('mapBtn');
const reportBtn = document.getElementById('reportBtn');
const downloadBtn = document.getElementById('downloadBtn');
const coordReadout = document.getElementById('coordReadout');

const gaugeFill = document.getElementById('gaugeFill');
const farmScoreEl = document.getElementById('farmScore');
const farmScoreEchoEl = document.getElementById('farmScoreEcho');
const riskLevelEl = document.getElementById('riskLevel');
const statusEl = document.getElementById('status');

const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 68;
let lastReport = null;

function updateReadout() {
  const lat = latEl.value ? parseFloat(latEl.value).toFixed(4) : '--.----';
  const lon = lonEl.value ? parseFloat(lonEl.value).toFixed(4) : '--.----';
  coordReadout.textContent = `LAT ${lat}    LON ${lon}`;
}
latEl.addEventListener('input', updateReadout);
lonEl.addEventListener('input', updateReadout);

// Simulated "pick from map" — drops a sample coordinate in an Odisha farm belt.
mapBtn.addEventListener('click', () => {
  latEl.value = (21.35 + Math.random() * 0.3).toFixed(4);
  lonEl.value = (83.85 + Math.random() * 0.3).toFixed(4);
  updateReadout();
});

function scoreToColor(score) {
  if (score >= 70) return getComputedStyle(document.documentElement).getPropertyValue('--veg').trim();
  if (score >= 40) return getComputedStyle(document.documentElement).getPropertyValue('--soil').trim();
  return getComputedStyle(document.documentElement).getPropertyValue('--danger').trim();
}

function riskFromScore(score) {
  if (score >= 70) return { label: 'Low', cls: 'risk-low' };
  if (score >= 40) return { label: 'Medium', cls: 'risk-medium' };
  return { label: 'High', cls: 'risk-high' };
}

// Deterministic mock score derived from name + coordinates.
// Replace this with the real GEE-backed scoring call.
function computeMockScore(name, lat, lon) {
  const seed = `${name}|${lat}|${lon}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return 35 + (hash % 60); // spread across 35-94
}

reportBtn.addEventListener('click', () => {
  const name = farmerNameEl.value.trim();
  const lat = latEl.value;
  const lon = lonEl.value;

  if (!name || !lat || !lon) {
    statusEl.textContent = 'Enter name and coordinates first';
    statusEl.style.color = 'var(--danger)';
    return;
  }

  statusEl.style.color = '';
  statusEl.textContent = 'Analyzing satellite data…';
  farmScoreEl.textContent = '--';
  farmScoreEchoEl.textContent = '--';
  riskLevelEl.textContent = '--';
  gaugeFill.style.stroke = scoreToColor(70);
  gaugeFill.style.strokeDashoffset = GAUGE_CIRCUMFERENCE;

  setTimeout(() => {
    const score = computeMockScore(name, lat, lon);
    const risk = riskFromScore(score);
    const offset = GAUGE_CIRCUMFERENCE * (1 - score / 100);

    gaugeFill.style.stroke = scoreToColor(score);
    gaugeFill.style.strokeDashoffset = offset;
    farmScoreEl.textContent = score;
    farmScoreEchoEl.textContent = `${score} / 100`;
    riskLevelEl.textContent = risk.label;
    riskLevelEl.className = `result-val ${risk.cls}`;
    statusEl.textContent = 'Report ready';

    lastReport = { name, lat, lon, score, risk: risk.label, date: new Date().toLocaleDateString() };
    downloadBtn.disabled = false;
  }, 900);
});

downloadBtn.addEventListener('click', () => {
  if (!lastReport) return;

  if (window.jspdf) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('FarmScore AI — Farm Suitability Report', 14, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Date: ${lastReport.date}`, 14, 32);
    doc.text(`Farmer name: ${lastReport.name}`, 14, 42);
    doc.text(`Coordinates: ${lastReport.lat}, ${lastReport.lon}`, 14, 50);
    doc.setFontSize(14);
    doc.text(`Farm score: ${lastReport.score} / 100`, 14, 64);
    doc.text(`Risk level: ${lastReport.risk}`, 14, 74);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Data sources: Sentinel-2, CHIRPS, MODIS, GLDAS', 14, 90);
    doc.save(`FarmScore_${lastReport.name.replace(/\s+/g, '_')}.pdf`);
  } else {
    // Fallback if the PDF library fails to load
    const text = `FarmScore AI Report\nFarmer: ${lastReport.name}\nCoordinates: ${lastReport.lat}, ${lastReport.lon}\nFarm score: ${lastReport.score}/100\nRisk level: ${lastReport.risk}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `FarmScore_${lastReport.name.replace(/\s+/g, '_')}.txt`;
    a.click();
  }
});
