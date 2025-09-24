---
theme: dashboard
title: Draft Dashboard
toc: false
---
<!-- Interjust Logo -->
<!-- <div class="logo-container">
    <img src="/images/InterJust-logo.png" 
          alt="Interjust Logo" 
          class="logo">
</div> -->

<!-- Landing Page Title -->
<div class="hero">
  <h1>Interjust Dashboard Draft</h1>
</div>



<!-- LOAD RELEVANT DATA -->
```js
const launches = FileAttachment("data/launches.csv").csv({typed: true});
// const uj_counts = FileAttachment("src/data/uj_counts.csv").csv({typed: true});
```

<!-- TOY UJ COUNT DATA -->
```js
const rawMap = new Map([ 
  [1945,0.010794721354486746],
  [1946,0.018284247792158585],
  [1947,0.015153321643931131],
  [1948,0.014131844256328019],
  [1949,0.015843764878285455],
  [1950,0.013378724100880568],
  [1951,0.017462949340615125],
  [1952,0.032063520221056956],
  [1953,0.02326363840263997],
  [1954,0.02526832334798883],
  [1955,0.026259908223732968],
  [1956,0.05171962751847784],
  [1957,0.024072019438059408],
  [1958,0.02125400305167911],
  [1959,0.0227687091796163],
  [1960,0.017079554061946847],
  [1961,0.030374095278074224],
  [1962,0.032639220700517224],
  [1963,0.0341787590845585],
  [1964,0.03957640970202419],
  [1965,0.025752710040540697],
  [1966,0.016729920587852304],
  [1967,0.022142521355621253],
  [1968,0.02519683705485237],
  [1969,0.023083425603767714],
  [1970,0.024226742636021568],
  [1971,0.017493817695298133],
  [1972,0.01820720191789203],
  [1973,0.014043878365875848],
  [1974,0.04004461859403032],
  [1975,0.016567666974669097],
  [1976,0.012964584696314854],
  [1977,0.015992295444204406],
  [1978,0.023821304240695746],
  [1979,0.03224145610577721],
  [1980,0.014311704756653762],
  [1981,0.00950856677262391],
  [1982,0.01157136946257089],
  [1983,0.024286615859661746],
  [1984,0.018081743335010076],
  [1985,0.014428513790259442],
  [1986,0.022609803415177394],
  [1987,0.02627785314601084],
  [1988,0.04069841753937103],
  [1989,0.03160624282831638],
  [1990,0.07717300191811122],
  [1991,0.03161383387064819],
  [1992,0.05739252570953508],
  [1993,0.018819747314946206],
  [1994,0.02890118129766588],
  [1995,0.032502609335153275],
  [1996,0.04734107019348836],
  [1997,0.06002422278289939],
  [1998,0.045286830283620925],
  [1999,0.07982270000337377],
  [2000,0.10472714071349662],
  [2001,0.09577619359399236],
  [2002,0.1016779425878256],
  [2003,0.19212108234163933],
  [2004,0.17333601668639423],
  [2005,0.28602754823087073],
  [2006,0.2561641387731734],
  [2007,0.15580535628198067],
  [2008,0.16963562014570244]
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
      y: {grid: true, label: "Per Million Words Frequency"},
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