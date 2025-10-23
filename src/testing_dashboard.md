---
theme: dashboard
title: Test Chloropleths for Crime Visualizations (2-4 of Graphs)
toc: false
---
```js
const chartVariant = view(Inputs.radio(
  ["Binary (Any Crime)", "Heatmap (Number of Crimes)"], 
  {label: "Select Map Variant", value: "Binary (Any Crime)"}
));
```

```js
// Call the chart function with the selected variant.
// This cell will automatically re-render when the chartVariant selection changes.
display(interactiveChloropleth(justiceData, worldGeoJSON, chartVariant, width));
```

```js
// Load the primary dataset and the GeoJSON for world boundaries.
const justiceData = FileAttachment("static_data/Data_Interjust@2.csv").csv({typed: true});
const worldGeoJSON = d3.json("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson");
```

```js
// This is the main function that creates the chart.
// It processes the data and handles all D3.js rendering logic.
function interactiveChloropleth(rawData, worldISO, variant, width) {

  // 1. DATA PROCESSING AND HELPER FUNCTIONS
  // =========================================

  // Helper to standardize varied string inputs ("Yes", "1", "true") into a clean "Yes" or "No".
  function formatStatus(value) {
    const s = String(value ?? "").trim().toLowerCase();
    // Consider various forms of "yes" in different languages or formats.
    const affirmative = ["yes", "true", "1", "y", "sí", "si"];
    return affirmative.includes(s) ? "Yes" : "No";
  }

  // Define the specific CSV columns that correspond to each crime.
  const crimeColumns = {
    genocide: "Genocide - Does the country criminalize genocide?",
    war: "War Crimes - Does the country criminalize war crimes?",
    cah: "Crimes Against Humanity - Does the country criminalize crimes against humanity?",
    aggression: "Aggression - Does the country criminalize the international \"crime of aggression\" or the \"crimes against peace\"?"
  };
  
  // Create a Map for efficient lookup of country data by its ISO code.
  const dataByISO = new Map();
  for (const d of rawData) {
    const iso = String(d["ISO 3166-1 alpha-3"] || "").trim();
    if (iso) {
      const genocide = formatStatus(d[crimeColumns.genocide]);
      const war = formatStatus(d[crimeColumns.war]);
      const cah = formatStatus(d[crimeColumns.cah]);
      const aggression = formatStatus(d[crimeColumns.aggression]);
      
      // Calculate the total number of criminalized crimes for the heatmap.
      const crimeCount = (genocide === "Yes" ? 1 : 0) + 
                         (war === "Yes" ? 1 : 0) + 
                         (cah === "Yes" ? 1 : 0) + 
                         (aggression === "Yes" ? 1 : 0);
      
      dataByISO.set(iso, {
        countryName: d.Country,
        hasAnyCrime: formatStatus(d["Does the country have at least one criminalized international crime?"]),
        crimeCount: crimeCount,
        statuses: { // Store individual statuses for the tooltip
          Genocide: genocide,
          "War Crimes": war,
          "Crimes against Humanity": cah,
          Aggression: aggression
        }
      });
    }
  }

  // 2. CHART CONFIGURATION
  // =======================

  const height = Math.min(600, width * 0.6);
  const projection = d3.geoMercator().scale(width / 2 / Math.PI - 20).translate([width / 2, height / 1.7]);
  const path = d3.geoPath(projection);

  // Define color scales for both variants.
  const binaryColor = d3.scaleOrdinal()
    .domain(["Yes", "No"])
    .range(["#6ee7b7", "#fca5a5"]); // Pastel Green for Yes, Pastel Red for No

  const heatmapColor = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 4.5]); // Domain goes from 0 to 4 crimes, extended slightly for better color range.

  const noDataColor = "#e5e7eb"; // Light gray for countries not in the dataset.

  // 3. SVG RENDERING
  // ==================
  
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; background-color: #ffffff;");

  // Add a sphere for the globe background
  svg.append("path")
      .attr("d", path({type: "Sphere"}))
      .attr("fill", "#ffffff") // White sea
      .attr("stroke", "#9ca3af");

  // Add the countries (land masses)
  svg.append("g")
    .selectAll("path")
    .data(worldISO.features)
    .join("path")
      .attr("d", path)
      .attr("stroke", "#6b7280") // Mid-gray borders for countries
      .attr("stroke-width", 0.5)
      .attr("fill", d => {
        const iso = String(d.properties?.["ISO3166-1-Alpha-3"] || "").trim();
        const countryData = dataByISO.get(iso);

        if (!countryData) return noDataColor;

        // Apply color based on the selected chart variant
        if (variant === "Binary (Any Crime)") {
          return binaryColor(countryData.hasAnyCrime);
        } else { // "Heatmap (Number of Crimes)"
          return heatmapColor(countryData.crimeCount);
        }
      })
    .append("title") // This creates the hover tooltip
      .text(d => {
        const iso = String(d.properties?.["ISO3166-1-Alpha-3"] || "").trim();
        const countryData = dataByISO.get(iso);
        const countryName = d.properties?.name ?? "Unknown Country";
        
        if (!countryData) {
          return `${countryName} (${iso || "—"})\nNo data available`;
        }

        // Build the detailed tooltip string
        const tooltipDetails = Object.entries(countryData.statuses)
          .map(([crime, status]) => `- ${crime}: ${status}`)
          .join("\n");
        
        return `${countryData.countryName} (${iso})\n\nCriminalized:\n${tooltipDetails}`;
      });

  // 4. LEGEND RENDERING
  // =======================================
  if (variant === "Heatmap (Number of Crimes)") {
    const legendWidth = Math.min(width * 0.4, 260);
    const legendHeight = 8;
    const legendX = 20;
    const legendY = height - 40;

    const legendScale = d3.scaleLinear()
      .domain([0, 4])
      .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format("d")); // Integer format

    // Create a group for the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    // Add legend title
    legend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .style("fill", "#374151")
      .text("Number of Crimes Criminalized");
      
    // Create the color gradient definition
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient").attr("id", "legend-gradient");
    linearGradient.selectAll("stop")
      .data(heatmapColor.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: heatmapColor(t) })))
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    // Draw the legend rectangle with the gradient
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    // Add the legend axis
    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .select(".domain").remove(); // Remove the axis line

  } else if (variant === "Binary (Any Crime)") {
    const legendX = 20;
    const legendY = height - 50;
    const legendItemSize = 12;
    const legendSpacing = 5;

    const legend = svg.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    const legendItems = [
      {label: "At least one crime criminalized", color: binaryColor("Yes")},
      {label: "No crimes criminalized", color: binaryColor("No")}
    ];

    const legendItem = legend.selectAll(".legend-item")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`);

    legendItem.append("rect")
      .attr("width", legendItemSize)
      .attr("height", legendItemSize)
      .style("fill", d => d.color);

    legendItem.append("text")
      .attr("x", legendItemSize + legendSpacing)
      .attr("y", legendItemSize / 2)
      .attr("dy", "0.35em") // vertical alignment
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .style("fill", "#374151")
      .text(d => d.label);
  }
  
  return svg.node();
}
```

<!-- CALL CHART -->
htl.html`<div class="grid grid-cols-1">
  <div class="card" style="background-color: #111827;">
    ${resize((width) => interactiveChloropleth(justiceData, worldGeoJSON, chartVariant, width))}
  </div>
</div>`