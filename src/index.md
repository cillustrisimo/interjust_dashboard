---
theme: dashboard
title: Draft Dashboard
toc: false
---
<!-- Interjust Logo -->
<!-- <div class="logo-container">
    <img src="interjust_dashboard/images/InterJust-logo.png" 
          alt="Interjust Logo" 
          class="logo">
</div>  -->

<!-- Landing Page Title -->
<div class="hero">
  <h1>Interjust Dashboard Draft</h1>
</div>



<!-- LOAD RELEVANT DATA -->
```js
const launches = FileAttachment("data/launches.csv").csv({typed: true});
const uj_counts_py = FileAttachment("data/uj_counts.csv").csv({typed: true});
```

<!-- TOY UJ COUNT DATA -->
```js
const uj_counts = uj_counts_py.map(d => ({
  year: +d.year,       // The '+' converts the string '1945' to the number 1945
  count: +d.count      // The '+' converts the count string to a floating-point number
}));
```

<!-- A shared color scale for consistency, sorted by the number of launches -->

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    domain: d3.groupSort(launches, (D) => -D.length, (d) => d.state).filter((d) => d !== "Other"),
    unknown: "var(--theme-foreground-muted)"
  }
});

console.log(uj_counts);
```

<!-- Cards with big numbers -->
<!-- This is the plot to sho key findings -->
<h2><p style="font-family: Arial, Helvetica, sans-serif;"> Of 193 UN Member States </p></h2>
<div class="grid grid-cols-4">
  <div class="card">
    <span class="big">142</span>
    <h2>have criminalized war crimes</h2>
  </div>
  <div class="card">
    <span class="big">134</span>
    <h2>have criminalized genocide</h2>
  </div>
  <div class="card">
    <span class="big">99</span>
    <h2>have criminalized crimes against humanity</h2>
  </div>
  <div class="card">
    <span class="big">51</span>
    <h2>have criminalized war crimes</h2>
  </div>
</div>

<!-- MARCO BAR PLOT -->
```js
const rawData = FileAttachment("static_data/Data_Interjust@2.csv").csv({typed: true});
```
```js
const regionalData = d3.rollup(rawData,
  v => ({
    total: v.length,
    withLaws: v.filter(d => {
      const g = d["Jurisdiction GENOCIDE - NO perpetrator presence"] !== "N/A";
      const w = d["Jurisdiction WAR CRIMES - NO perpetrator presence"] !== "N/A";
      const c = d["Jurisdiction CRIMES AGAINST HUMANITY - NO perpetrator presence"] !== "N/A";
      const a = d["Jurisdiction AGGRESSION - NO perpetrator presence"] !== "N/A";
      return g || w || c || a;
    }).length,
    withCases: v.filter(d => d["Jurisprudence - Has the country had a UJ or ETJ case? "] === "Yes").length
  }),
  d => d.Region
);
```
```js
const selectedRegion = view(Inputs.select(
  ["All Regions", ...regionalData.keys()].sort(),
  {label: "Filter by region:", value: "All Regions"}
));
```
```js
function implementationChart(data, region, width) {
  const filteredData = region === "All Regions" ? data : data.filter(d => d.Region === region);
  const total = filteredData.length;
  const withLaws = filteredData.filter(d => {
    const g = d["Jurisdiction GENOCIDE - NO perpetrator presence"] !== "N/A";
    const w = d["Jurisdiction WAR CRIMES - NO perpetrator presence"] !== "N/A";
    const c = d["Jurisdiction CRIMES AGAINST HUMANITY - NO perpetrator presence"] !== "N/A";
    const a = d["Jurisdiction AGGRESSION - NO perpetrator presence"] !== "N/A";
    return g || w || c || a;
  }).length;
  const withCases = filteredData.filter(d => d["Jurisprudence - Has the country had a UJ or ETJ case? "] === "Yes").length;
  
  const svg = d3.create("svg").attr("viewBox", [0, 0, width, 540]).attr("style", "width: 100%; height: auto;");
  const height = 540;
  const margin = {top: 80, right: 40, bottom: 80, left: 80};
  const colors = {total: "#206dc6ff", laws: "#5484d2ff", cases: "#a0e7f3ff"};
  const plotData = [
    {category: "Total", value: total, color: colors.total},
    {category: "Has Laws", value: withLaws, color: colors.laws},
    {category: "Prosecuted", value: withCases, color: colors.cases}
  ];
  
  const x = d3.scaleBand().domain(plotData.map(d => d.category)).range([margin.left, width - margin.right]).padding(0.3);
  const y = d3.scaleLinear().domain([0, Math.max(total * 1.1, 220)]).nice().range([height - margin.bottom, margin.top]);
  
  svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickSize(0)).selectAll("text").style("font-size", "16px").style("fill", "white");
  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5)).selectAll("text").style("font-size", "14px").style("fill", "white");
  
  // Bars with animation
  svg.selectAll(".bar")
    .data(plotData)
    .join("rect")
    .attr("x", d => x(d.category))
    .attr("y", height - margin.bottom)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", d => d.color)
    .attr("rx", 4)
    .transition()
    .duration(800)
    .delay((d, i) => i * 150)
    .attr("y", d => y(d.value))
    .attr("height", d => height - margin.bottom - y(d.value));
  
  // Labels with animation
  svg.selectAll(".label")
    .data(plotData)
    .join("text")
    .attr("x", d => x(d.category) + x.bandwidth() / 2)
    .attr("y", height - margin.bottom)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", d => d.color)
    .style("opacity", 0)
    .text(d => d.value)
    .transition()
    .duration(800)
    .delay((d, i) => i * 150 + 400)
    .attr("y", d => y(d.value) - 10)
    .style("opacity", 1);
  
  svg.append("text").attr("x", margin.left).attr("y", 30).style("font-size", "18px").style("font-weight", "600").style("fill", "white").text(region === "All Regions" ? "Global Justice Implementation Gap" : `${region}: Justice Implementation Gap`);
  
  return svg.node();
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => implementationChart(rawData, selectedRegion, width))}
  </div>
</div>

<!-- Dual Charts -->
<!-- One plot is word count timeline, other is waffle chart -->
<div class="grid grid-cols-2" style="grid-auto-rows: 504px;">
  <div class="card">${
    resize((width) => Plot.plot({
      title: "Mentions of universal jurisdiction over time",
      subtitle: "Charting growth of the legal principle",
      width,
      y: {grid: true, label: "Per Million Words Frequency"},
      marks: [
        Plot.line(uj_counts, { x: "year", y: "count" })
      ]
    }))
  }</div>

   <div class="card">${
    resize((width) => Plot.plot({
    grid: true,
    height: 400,
    marginTop: 70,
    marginBottom: 20,
    title: "UN Member States which have criminalized all four atrocity crimes",
    subtitle: "41 have criminalized all, 152 have not",
    width,
    marks:[
    Plot.waffleY([42, 151], {x: ["Criminalized", "Not Criminalized"],
    fill: ["#2563eb", "#dc2626"] })
    ]
  }))
  }
</div>
</div>

<style>

.hero {
  display: flex;
  flex-direction: column;
  font-family: var(--sans-serif);
  text-wrap: balance;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, #1c53ae, #1c53ae);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

/* logo container */
.logo-container {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    padding: 15px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 0 0 10px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

/* Logo image styling */
.logo {
    display: block;
    max-width: 150px;
    height: auto;
    width: auto;
}

/* Responsive adjustments for logo */
@media (max-width: 768px) {
    .logo-container {
        padding: 10px;
    }
    
    .logo {
        max-width: 120px;
    }
}

@media (max-width: 480px) {
    .logo-container {
        padding: 8px;
    }
    
    .logo {
        max-width: 100px;
    }
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>