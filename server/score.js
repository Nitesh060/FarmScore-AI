/**
 * Farm Score Calculation
 *
 * NOTE: This is a placeholder scoring model using simple heuristics.
 * Replace the weighted factors below with real satellite-derived
 * indicators (NDVI, soil moisture, rainfall/CHIRPS, land-use, etc.)
 * once the data pipeline (e.g. Google Earth Engine) is connected.
 */

const CROP_RISK_WEIGHTS = {
  rice: 0.85,
  wheat: 0.9,
  cotton: 0.7,
  sugarcane: 0.75,
  maize: 0.88,
  default: 0.8,
};

function scoreLandArea(landArea) {
  // Larger, well-managed holdings score slightly higher, capped
  if (landArea <= 0) return 0;
  const score = Math.min(landArea / 10, 1) * 100;
  return Math.round(score);
}

function scoreLocationStability(latitude, longitude) {
  // Placeholder: in production, replace with NDVI / rainfall consistency
  // derived from satellite time series for this lat/lon.
  const pseudoStability = 60 + ((Math.abs(latitude * longitude) * 13) % 35);
  return Math.round(pseudoStability);
}

function scoreCropType(cropType) {
  const key = (cropType || "").toLowerCase().trim();
  const weight = CROP_RISK_WEIGHTS[key] ?? CROP_RISK_WEIGHTS.default;
  return Math.round(weight * 100);
}

function calculateFarmScore({ landArea, latitude, longitude, cropType }) {
  const landScore = scoreLandArea(landArea);
  const locationScore = scoreLocationStability(latitude, longitude);
  const cropScore = scoreCropType(cropType);

  const breakdown = {
    "Land Area Score": landScore,
    "Location Stability Score": locationScore,
    "Crop Risk Score": cropScore,
  };

  const finalScore = Math.round(
    landScore * 0.3 + locationScore * 0.4 + cropScore * 0.3
  );

  let riskCategory;
  if (finalScore >= 75) riskCategory = "Low Risk";
  else if (finalScore >= 50) riskCategory = "Moderate Risk";
  else riskCategory = "High Risk";

  return { score: finalScore, riskCategory, breakdown };
}

module.exports = { calculateFarmScore };
