# InterJust Dashboard

A data visualization platform (draft) for the Responsibility Lab, presenting international criminal justice data through interactive charts and maps.

---

## Overview

This dashboard visualizes data from the InterJust database, tracking how countries around the world criminalize and prosecute serious international crimes including genocide, war crimes, crimes against humanity, and the crime of aggression.

---

## Live Preview

View the current build at:  
https://cillustrisimo.github.io/interjust_dashboard

---

## Local Development

To run locally, start a simple HTTP server from the project root:

```bash
python3 -m http.server
```

Then navigate to `http://localhost:8000` in your browser.

---

## Project Structure

```
interjust_dashboard/
├── index.html              # Main page
├── css/
│   ├── styles.css          # Core styles
│   ├── additional_styles.css
│   ├── mobile_styles.css   # Responsive design
│   └── globe_case_study.css
├── js/
│   ├── data_loader.js      # Data fetching and processing
│   ├── charts.js           # D3.js chart rendering
│   ├── placeholder_filler.js
│   ├── case_study_globes.js
│   └── data_preload.js     # Static data fallback
├── data/
│   ├── interjust_snapshot.csv
│   └── world-110m.json     # TopoJSON for maps
└── assets/
```

---

## Data Architecture

The dashboard uses a tiered data loading strategy:

1. **Instant Render** - Preloaded static data for immediate display
2. **Background Refresh** - Live Airtable API fetch updates the cache
3. **Fallback** - CSV snapshot if API is unavailable

All data processing is centralized in `DataCounterHub` within `data_loader.js`.

---

## Visualizations

| Section | Chart Type | Description |
|---------|------------|-------------|
| 2A | Choropleth Map | Criminalization of international crimes by country |
| 3 | Stacked Bar | Command responsibility provisions by region |
| 4A-4E | Bar Charts | Jurisdiction analysis across crime types |
| 5A | Packed Bubbles | UJ/ETJ cases by country and region |
| 5B | Mirrored Bar | Specialized investigation units by region |

Additional features include interactive case study globes and scrollytelling narrative cards.

---

## Key Technologies

- D3.js for data visualization
- TopoJSON for geographic rendering
- Airtable API for live data
- Vanilla JavaScript (ES5 compatible)

---

## Browser Support

Tested on modern versions of Chrome, Firefox, Safari, and Edge. Mobile responsive design included.

---

## Notes

This is an early draft. Features and data are subject to change as the project develops.

All text is from InterJust. The platform itself was developed by the Responsibility Lab

---

