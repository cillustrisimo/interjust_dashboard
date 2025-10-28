// src/components/modes_of_liability.js
// Assumes d3 and @observablehq/plot are loaded globally (they are in index.html).

// -----------------------------------------------------------------------------
// Utility functions
// -----------------------------------------------------------------------------

const molPrettyRegion = (r) =>
  ({
    "Middle East & North Africa": "Middle East &\nNorth Africa",
    "North America": "North\nAmerica",
    "South America": "South\nAmerica",
    "Central America": "Central\nAmerica",
  }[r] ?? r);

const MOL_REGION_ORDER = [
  "Africa",
  "Asia",
  "Europe",
  "Middle East &\nNorth Africa",
  "Oceania",
  "Caribbean",
  "Central\nAmerica",
  "South\nAmerica",
  "North\nAmerica",
];

// -----------------------------------------------------------------------------
// Draws vertical stacked Yes/No bar chart per region
// -----------------------------------------------------------------------------
function molRenderStackedYesNoChart({ containerId, rows, headerRegex, title }) {
  const el = document.getElementById(containerId);
  if (!el) return;

  // Find column that matches question
  const first = rows?.[0] || {};
  const col = Object.keys(first).find((k) => headerRegex.test(k));
  if (!col) {
    el.textContent = "Column not found. Check modes_of_liability.js headerRegex.";
    console.warn("MOL: Column not found for regex:", headerRegex);
    return;
  }

  // Keep only UN Member States + normalize answers
  const shaped = rows
    .filter((d) => (d.Status || "").trim() === "UN Member State")
    .map((d) => ({
      regionPretty: molPrettyRegion(d.Region),
      answer: /yes/i.test(String(d[col])) ? "Yes" : "No",
    }));

  // Create the stacked vertical bar chart
  const chart = Plot.plot({
    width: Math.max(320, el.clientWidth || 920),
    height: 520,
    marginLeft: 80,
    marginBottom: 90,
    marginRight: 140,
    grid: true,
    title,
    x: { label: "Region", domain: MOL_REGION_ORDER, tickPadding: 6 },
    y: { label: "↑ Number of UN Member States", nice: true },
    color: {
      legend: true,
      label: "Response",
      domain: ["No", "Yes"],
      range: ["#4F46E5", "#F59E0B"], // blue + yellow
    },
    marks: [
      Plot.ruleY([0]),
      Plot.barY(
        shaped,
        Plot.groupX({ y: "count" }, {
          x: "regionPretty",
          fill: "answer",
          tip: true,
          pointer: "x",
          stroke: "currentColor",
          strokeWidth: 1.2,
        })
      ),
    ],
  });

  el.replaceChildren(chart);
}

// -----------------------------------------------------------------------------
// Initialization function (called by router when page loads)
// -----------------------------------------------------------------------------
async function initModesOfLiability() {
  console.log("MOL: initModesOfLiability() start");
  const loading = document.getElementById("mol-loading");
  const content = document.getElementById("mol-content");
  if (loading) loading.style.display = "";
  if (content) content.style.display = "none";

  try {
    const csvPath = "src/static_data/Data_Interjust@2.csv";
    const rows = await d3.csv(csvPath, d3.autoType);

    // Render stacked Yes/No chart
    molRenderStackedYesNoChart({
      containerId: "chart-command-responsibility-regional",
      rows,
      headerRegex: /Command\s*or\s*Superior\s*Responsibility/i,
      title:
        "Command or Superior Responsibility — Does the country have a domestic provision regarding command or superior responsibility?",
    });

    if (loading) loading.style.display = "none";
    if (content) content.style.display = "";
    console.log("MOL: initialized successfully");
  } catch (err) {
    console.error("MOL: failed to load CSV:", err);
    if (loading) loading.innerHTML = `<p class="text-red-400">Error loading data.</p>`;
  }
}

// Make available to script.js router
window.initModesOfLiability = initModesOfLiability;
