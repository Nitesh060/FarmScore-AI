# FarmScore AI

Satellite-driven farm credit risk scoring platform. Farmers/loan officers enter basic farm details, and the platform generates a FarmScore (0–100) with a risk category and a downloadable PDF report.

## Project Structure

```
FarmScore-AI/
│
├── client/
│   ├── index.html      # Farm details form + score display
│   ├── style.css        # Styling
│   └── script.js         # API calls, form handling, PDF download
│
├── server/
│   ├── server.js         # Express API entry point
│   ├── score.js          # FarmScore calculation logic
│   └── pdf.js             # PDF report generation (pdfkit)
│
├── docs/
│   ├── sample-report.pdf  # Example generated report
│   └── ownership.pdf      # Project ownership / documentation
│
├── package.json
├── README.md
└── .gitignore
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   The API runs at `http://localhost:5000`.

3. Open `client/index.html` in your browser (or serve it with any static
   file server) to use the form.

## API Endpoints

| Method | Endpoint       | Description                          |
|--------|----------------|---------------------------------------|
| GET    | `/api/health`  | Health check                          |
| POST   | `/api/score`   | Calculate FarmScore from farm details |
| POST   | `/api/report`  | Generate and download a PDF report    |

## Roadmap

- [ ] Replace placeholder scoring heuristics in `score.js` with real
      satellite-derived indicators (NDVI, soil moisture, rainfall/CHIRPS)
      via Google Earth Engine
- [ ] Add persistent storage for farmer records
- [ ] Add authentication for loan officers
- [ ] Map-based farm boundary input (Leaflet.js)

## License

Internal / proprietary — update as needed before publishing.
