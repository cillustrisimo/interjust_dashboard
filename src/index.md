---
theme: dashboard
title: Draft Dashboard
toc: false
---
<!-- Interjust Logo -->
<div class="logo-container">
    <img src="interjust_dashboard/images/InterJust-logo.png" 
          alt="Interjust Logo" 
          class="logo">
</div> 

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

<!-- Dual Charts (NEED TO NORMALIZE COUNT) -->
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



<!-- PLACE HOLDER PLOT -->
```js
function launchTimeline(data, {width} = {}) {
  return Plot.plot({
    title: "PLACEHOLDER",
    width,
    height: 300,
    y: {grid: true, label: "PLACEHOLDER"},
    color: {...color, legend: true},
    marks: [
      Plot.rectY(data, Plot.binX({y: "count"}, {x: "date", fill: "state", interval: "year", tip: true})),
      Plot.ruleY([0])
    ]
  });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => launchTimeline(launches, {width}))}
  </div>
</div>

<!-- Plot of launch vehicles -->

```js
function vehicleChart(data, {width}) {
  return Plot.plot({
    title: "PLACEHOLDER",
    width,
    height: 300,
    marginTop: 0,
    marginLeft: 50,
    x: {grid: true, label: "PLACEHOLDER"},
    y: {label: null},
    color: {...color, legend: true},
    marks: [
      Plot.rectX(data, Plot.groupY({x: "count"}, {y: "family", fill: "state", tip: true, sort: {y: "-x"}})),
      Plot.ruleX([0])
    ]
  });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => vehicleChart(launches, {width}))}
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