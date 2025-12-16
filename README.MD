# InterJust Dashboard

A (draft) data visualization platform for the Responsibility Lab, presenting international criminal justice data through interactive charts and maps.

---

## Overview

This dashboard visualizes data from the InterJust database, tracking how countries around the world criminalize and prosecute serious international crimes including genocide, war crimes, crimes against humanity, and the crime of aggression.

---

## Live Preview

View the current build at:  
https://cillustrisimo.github.io/interjust_dashboard

---

## Project Structure

```
interjust_dashboard/
├── index.html
├── css/
│   ├── additional_styles.css
│   ├── globe_case_study.css
│   ├── mobile_styles.css
│   ├── style.css
│   └── timeline_styles_integrated.css
├── data/
│   ├── geojson/
│   │   ├── countries.geojson
│   │   ├── region-africa.geojson
│   │   ├── region-asia.geojson
│   │   ├── region-caribbean.geojson
│   │   ├── region-central-america.geojson
│   │   ├── region-europe.geojson
│   │   ├── region-middle-east-north-africa.geojson
│   │   ├── region-north-america.geojson
│   │   ├── region-oceania.geojson
│   │   ├── region-south-america.geojson
│   │   └── world.geojson
│   ├── interjust_snapshot.csv
│   └── timeline_data.json
├── images/
│   ├── icons_objects/
│   ├── timeline/
│   ├── interjust-logo.svg
│   └── interjust-logo.png
└── js/
    ├── case_study_globes.js
    ├── charts.js
    ├── data_loader.js
    ├── data_preload.js
    ├── placeholder_filler.js
    ├── scripts.js
    ├── stats_snapshot.js
    ├── timeline_mobile.js
    └── timeline_script.js
```

---

## File Descriptions

### Root

| File | Description |
|------|-------------|
| `index.html` | Main HTML document containing the full scrollytelling narrative, chart containers, and page structure |

### CSS

| File | Description |
|------|-------------|
| `style.css` | Core stylesheet with CSS variables, typography, layout grid, navigation, and base component styles |
| `additional_styles.css` | Extended styles for case studies, references section, gradient backgrounds, and graph containers |
| `globe_case_study.css` | Styles for interactive globe modals, country pins, and case study narrative panels |
| `mobile_styles.css` | Responsive design rules for mobile and tablet viewports |
| `timeline_styles_integrated.css` | Styles for the historical timeline component including cards, markers, and scroll behavior |

### JavaScript

| File | Description |
|------|-------------|
| `data_loader.js` | Central data management module handling Airtable API fetches, CSV fallback, caching, and the DataCounterHub for all statistical calculations |
| `charts.js` | D3.js chart rendering functions for all visualizations (choropleth, bar charts, packed bubbles) |
| `scripts.js` | Page interaction logic including scroll spy navigation, scrollytelling focus/zoom, and smooth scroll behavior |
| `placeholder_filler.js` | Dynamic statistic injection into DOM placeholders with two-phase loading (instant cache, background sync) |
| `stats_snapshot.js` | LocalStorage-based statistics cache with automatic updates when live data changes |
| `data_preload.js` | Static data snapshot for instant page rendering before API response |
| `case_study_globes.js` | Interactive 3D globe rendering for country case studies with rotation, pins, and modal integration |
| `timeline_script.js` | Timeline component logic for desktop with scroll-based animations and card transitions |
| `timeline_mobile.js` | Mobile-optimized timeline with touch interactions and responsive layout |

### Data

| File/Folder | Description |
|-------------|-------------|
| `geojson/` | Geographic boundary files for world map and individual regions |
| `interjust_snapshot.csv` | Static CSV export of the Airtable database for offline fallback |
| `timeline_data.json` | Structured data for historical timeline events and milestones |

### Images

| Folder/File | Description |
|-------------|-------------|
| `icons_objects/` | Miscellaneous UI icons and decorative elements |
| `timeline/` | Images associated with timeline events |
| `interjust-logo.svg` | Vector logo for crisp rendering at any size |
| `interjust-logo.png` | Raster logo fallback |

---

## Visualizations (subject to change)

| Section | Chart Type | Description |
|---------|------------|-------------|
| 2A | Choropleth Map | Criminalization of international crimes by country |
| 3 | Glasses Chart | Command responsibility provisions by region |
| 4 | Sankey Graph | Interactive Sankey with jurisdiction analysis across crime types |
| 5A | Packed Bubbles | UJ/ETJ cases by country and region |
| 5B | Mirrored Bar | Specialized investigation units by region |

Additional features include interactive case study globes and scrollytelling narrative cards.

---


## Notes

This is a draft. Features and data are subject to change as the project develops.


All text is from InterJust. The platform itself was developed by the Responsibility Lab

As a note: For our convenience, when working locally, we stored the API key in a JS file:
- `js/config.js` as `CONFIG.INTERJUST_API_KEY`

This build does not contain config.js 

