---
theme: dashboard
title: Draft Dashboard
toc: false
---

<div class="hero">
  <h1>Interjust Dashboard Draft</h1>
</div>

<!-- LOAD RELEVANT DATA -->
```js
const launches = FileAttachment("data/launches.csv").csv({typed: true});
```
<script src="https://unpkg.com/papaparse@latest/papaparse.min.js"></script>

<!-- TOY UJ COUNT DATA -->
```js
const rawMap = new Map([ 
  [1945,10],
  [1946,22],
  [1947,21],
  [1948,21],
  [1949,26],
  [1950,22],
  [1951,28],
  [1952,52],
  [1953,37],
  [1954,42],
  [1955,46],
  [1956,94],
  [1957,47],
  [1958,42],
  [1959,47],
  [1960,40],
  [1961,78],
  [1962,92],
  [1963,101],
  [1964,116],
  [1965,85],
  [1966,58],
  [1967,81],
  [1968,100],
  [1969,91],
  [1970,99],
  [1971,71],
  [1972,76],
  [1973,57],
  [1974,162],
  [1975,68],
  [1976,55],
  [1977,69],
  [1978,104],
  [1979,146],
  [1980,66],
  [1981,44],
  [1982,56],
  [1983,121],
  [1984,96],
  [1985,79],
  [1986,131],
  [1987,156],
  [1988,252],
  [1989,207],
  [1990,546],
  [1991,218],
  [1992,436],
  [1993,141],
  [1994,232],
  [1995,269],
  [1996,414],
  [1997,539],
  [1998,426],
  [1999,798],
  [2000,1172],
  [2001,1087],
  [2002,1273],
  [2003,2619],
  [2004,2549],
  [2005,4126],
  [2006,3922],
  [2007,2525],
  [2008,3305]
]);

const uj_counts = Array.from(rawMap, ([key, value]) => ({ Years: key, y: value }));
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
      y: {grid: true, label: "Non-Normalized Count"},
      marks: [
        Plot.line(uj_counts, { x: "Years", y: "y" })
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
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
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

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>