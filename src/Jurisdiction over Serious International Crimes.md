---
theme: dashboard
title: Jurisdiction over Serious International Crimes
toc: false
---

# Universal Jurisdiction

## Jurisdiction over Serious International Crimes

Universal jurisdiction allows countries to prosecute the most serious international crimes—genocide, war crimes, crimes against humanity, and aggression—regardless of where they were committed, the nationality of the perpetrator, or the nationality of the victim. This principle is crucial for ensuring that perpetrators have nowhere to hide and that survivors can access justice.

```js
// Load the data
const data = await FileAttachment("/data/Data_Interjust@2.csv").csv({typed: true});

// Filter for UN Member States only
const unMemberStates = data.filter(d => d.Status?.trim() === "UN Member State");

// Helper functions
function hasJurisdiction(value) {
  return value && value.trim() !== "" && value.trim() !== "N/A";
}

function hasJurisdictionType(value, type) {
  if (!value || value.trim() === "" || value.trim() === "N/A") return false;
  return value.includes(type);
}

// Jurisdiction columns
const jurisdictionCols = {
  genocide: {
    no: "Jurisdiction GENOCIDE - NO perpetrator presence",
    yes: "Jurisdiction GENOCIDE - YES perpetrator presence"
  },
  warCrimes: {
    no: "Jurisdiction WAR CRIMES - NO perpetrator presence",
    yes: "Jurisdiction WAR CRIMES - YES perpetrator presence"
  },
  crimesAgainstHumanity: {
    no: "Jurisdiction CRIMES AGAINST HUMANITY - NO perpetrator presence",
    yes: "Jurisdiction CRIMES AGAINST HUMANITY - YES perpetrator presence"
  },
  aggression: {
    no: "Jurisdiction AGGRESSION - NO perpetrator presence",
    yes: "Jurisdiction AGGRESSION - YES perpetrator presence"
  }
};

// Calculate detailed statistics with country lists
const statesWithJurisdictionBeyondBorders = unMemberStates.filter(row => 
  Object.values(jurisdictionCols).some(crime => 
    hasJurisdiction(row[crime.no]) || hasJurisdiction(row[crime.yes])
  )
);

const statesWithAbsoluteUJ = unMemberStates.filter(row => 
  Object.values(jurisdictionCols).some(crime => 
    hasJurisdictionType(row[crime.no], "UJ") || hasJurisdictionType(row[crime.yes], "UJ")
  )
);

const statesWithPresenceJurisdiction = unMemberStates.filter(row => 
  Object.values(jurisdictionCols).some(crime => 
    hasJurisdictionType(row[crime.yes], "Presence only")
  )
);

const statesWithActivePersonality = unMemberStates.filter(row => 
  Object.values(jurisdictionCols).some(crime => 
    hasJurisdictionType(row[crime.no], "Active personality") || 
    hasJurisdictionType(row[crime.yes], "Active personality")
  )
);

const statesWithPassivePersonality = unMemberStates.filter(row => 
  Object.values(jurisdictionCols).some(crime => 
    hasJurisdictionType(row[crime.no], "Passive personality") || 
    hasJurisdictionType(row[crime.yes], "Passive personality")
  )
);

const statesWithProtectivePrinciple = unMemberStates.filter(row => 
  Object.values(jurisdictionCols).some(crime => 
    hasJurisdictionType(row[crime.no], "Protective principle") || 
    hasJurisdictionType(row[crime.yes], "Protective principle")
  )
);

const stats = {
  total: unMemberStates.length,
  beyondBorders: statesWithJurisdictionBeyondBorders.length,
  absoluteUJ: statesWithAbsoluteUJ.length,
  presenceOnly: statesWithPresenceJurisdiction.length,
  activePersonality: statesWithActivePersonality.length,
  passivePersonality: statesWithPassivePersonality.length,
  protectivePrinciple: statesWithProtectivePrinciple.length,
  treatyObligation: 94 // Based on Geneva Conventions ratification from report
};

// Regional breakdown function
function getRegionalBreakdown(statesList) {
  const regions = d3.group(statesList, d => d.Region);
  return Array.from(regions, ([region, countries]) => ({
    region: region || "Unknown",
    count: countries.length,
    countries: countries.map(c => c.Country)
  })).sort((a, b) => b.count - a.count);
}

const regionalData = {
  beyondBorders: getRegionalBreakdown(statesWithJurisdictionBeyondBorders),
  absoluteUJ: getRegionalBreakdown(statesWithAbsoluteUJ),
  presenceOnly: getRegionalBreakdown(statesWithPresenceJurisdiction),
  activePersonality: getRegionalBreakdown(statesWithActivePersonality),
  passivePersonality: getRegionalBreakdown(statesWithPassivePersonality),
  protectivePrinciple: getRegionalBreakdown(statesWithProtectivePrinciple)
};
```

---

## UN Member States with Laws to Investigate Crimes Beyond Their Borders

The total number of UN Member States that have legal frameworks allowing them to investigate and prosecute at least one of the four serious international crimes even when committed outside their borders.

<div class="hero">
  <h1>${stats.beyondBorders}</h1>
  <p>out of ${stats.total} UN Member States</p>
</div>

```js
Plot.plot({
  height: 150,
  marginLeft: 200,
  x: {domain: [0, stats.total], label: "Number of States"},
  y: {label: null},
  color: {domain: ["With Laws", "Without Laws"], range: ["#2ecc71", "#e74c3c"]},
  marks: [
    Plot.barX([
      {category: "With Laws", value: stats.beyondBorders},
      {category: "Without Laws", value: stats.total - stats.beyondBorders}
    ], {
      x: "value",
      y: "category",
      fill: "category",
      tip: true
    }),
    Plot.text([
      {category: "With Laws", value: stats.beyondBorders, label: `${stats.beyondBorders} (${Math.round(stats.beyondBorders / stats.total * 100)}%)`},
      {category: "Without Laws", value: stats.total - stats.beyondBorders, label: `${stats.total - stats.beyondBorders} (${Math.round((stats.total - stats.beyondBorders) / stats.total * 100)}%)`}
    ], {
      x: "value",
      y: "category",
      text: "label",
      dx: -10,
      textAnchor: "end",
      fill: "white"
    })
  ]
})
```

### Regional Distribution

```js
Plot.plot({
  marginLeft: 120,
  height: 300,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {scheme: "Observable10"},
  marks: [
    Plot.barX(regionalData.beyondBorders, {
      x: "count",
      y: "region",
      fill: "region",
      sort: {y: "-x"},
      tip: true
    }),
    Plot.text(regionalData.beyondBorders, {
      x: "count",
      y: "region",
      text: d => `${d.count}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

<div class="note">
  <strong>Key Insight:</strong> While 77% of UN Member States have laws enabling cross-border investigations, only about 12% have actually used them to open cases over the past three decades. This represents a significant gap between legal capacity and practical implementation.
</div>

---

## 1. Absolute Universal Jurisdiction

<div class="grid grid-cols-2">
  <div>
    <p><strong>${stats.absoluteUJ}</strong> UN Member States can exercise absolute universal jurisdiction over at least one of the most serious international crimes.</p>
    <p>This means they can open a case against a person suspected of committing a serious international crime <strong>regardless of</strong>:</p>
    <ul>
      <li>The nationality of the alleged perpetrator</li>
      <li>The nationality of the victim</li>
      <li>The location where the offence was committed</li>
      <li>The presence of the suspect</li>
    </ul>
  </div>
  <div class="big-number-container">
    <div class="big-number">${stats.absoluteUJ}</div>
    <div class="percentage">${Math.round(stats.absoluteUJ / stats.total * 100)}%</div>
  </div>
</div>

```js
Plot.plot({
  height: 300,
  marginLeft: 120,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {range: ["#e74c3c", "#34495e"]},
  marks: [
    Plot.barX([
      {category: "With Absolute UJ", value: stats.absoluteUJ},
      {category: "Without", value: stats.total - stats.absoluteUJ}
    ], {
      x: "value",
      y: "category",
      fill: "category",
      tip: true
    }),
    Plot.text([
      {category: "With Absolute UJ", value: stats.absoluteUJ},
      {category: "Without", value: stats.total - stats.absoluteUJ}
    ], {
      x: "value",
      y: "category",
      text: d => `${d.value}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

### Regional Breakdown - Absolute Universal Jurisdiction

```js
Plot.plot({
  marginLeft: 120,
  height: 250,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {scheme: "Reds"},
  marks: [
    Plot.barX(regionalData.absoluteUJ, {
      x: "count",
      y: "region",
      fill: "region",
      sort: {y: "-x"},
      tip: true
    }),
    Plot.text(regionalData.absoluteUJ, {
      x: "count",
      y: "region",
      text: d => `${d.count}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

<div class="note">
  <strong>Examples:</strong> Argentina and Germany have actively made use of their absolute universal jurisdiction provisions. In a 2021 case, a German court found a member of ISIS guilty of genocide, crimes against humanity, and war crimes under absolute universal jurisdiction.
</div>

---

## 2. Perpetrator Presence Required

<div class="grid grid-cols-2">
  <div>
    <p><strong>${stats.presenceOnly}</strong> UN Member States have jurisdiction over at least one of the most serious international crimes if the alleged perpetrator is physically present in the country, regardless of their nationality or residence.</p>
    <p>This "conditional universal jurisdiction" requires the presence of the suspected perpetrator in the country for the investigation to be launched.</p>
  </div>
  <div class="big-number-container">
    <div class="big-number">${stats.presenceOnly}</div>
    <div class="percentage">${Math.round(stats.presenceOnly / stats.total * 100)}%</div>
  </div>
</div>

```js
Plot.plot({
  height: 300,
  marginLeft: 120,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {range: ["#9b59b6", "#34495e"]},
  marks: [
    Plot.barX([
      {category: "Presence Required", value: stats.presenceOnly},
      {category: "Not Required", value: stats.total - stats.presenceOnly}
    ], {
      x: "value",
      y: "category",
      fill: "category",
      tip: true
    }),
    Plot.text([
      {category: "Presence Required", value: stats.presenceOnly},
      {category: "Not Required", value: stats.total - stats.presenceOnly}
    ], {
      x: "value",
      y: "category",
      text: d => `${d.value}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

### Regional Breakdown - Presence Required

```js
Plot.plot({
  marginLeft: 120,
  height: 250,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {scheme: "Purples"},
  marks: [
    Plot.barX(regionalData.presenceOnly, {
      x: "count",
      y: "region",
      fill: "region",
      sort: {y: "-x"},
      tip: true
    }),
    Plot.text(regionalData.presenceOnly, {
      x: "count",
      y: "region",
      text: d => `${d.count}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

<div class="note">
  <strong>Example:</strong> In 2017, Swiss authorities arrested Ousman Sonko, the Minister of Interior under Gambian dictator Yahya Jammeh, who fled to Switzerland and applied for asylum. Sonko was charged with crimes against humanity based on his presence in Switzerland.
</div>

---

## 3. Active Personality Jurisdiction

<div class="grid grid-cols-2">
  <div>
    <p><strong>${stats.activePersonality}</strong> UN Member States have some form of jurisdiction over at least one of the most serious international crimes if the alleged perpetrator is a national of the country.</p>
    <p>This can also include:</p>
    <ul>
      <li>Permanent residents</li>
      <li>Refugees or asylum seekers</li>
      <li>Stateless persons habitually residing in the country</li>
    </ul>
  </div>
  <div class="big-number-container">
    <div class="big-number">${stats.activePersonality}</div>
    <div class="percentage">${Math.round(stats.activePersonality / stats.total * 100)}%</div>
  </div>
</div>

```js
Plot.plot({
  height: 300,
  marginLeft: 160,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {range: ["#3498db", "#34495e"]},
  marks: [
    Plot.barX([
      {category: "Active Personality", value: stats.activePersonality},
      {category: "Without", value: stats.total - stats.activePersonality}
    ], {
      x: "value",
      y: "category",
      fill: "category",
      tip: true
    }),
    Plot.text([
      {category: "Active Personality", value: stats.activePersonality},
      {category: "Without", value: stats.total - stats.activePersonality}
    ], {
      x: "value",
      y: "category",
      text: d => `${d.value}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

### Regional Breakdown - Active Personality

```js
Plot.plot({
  marginLeft: 120,
  height: 250,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {scheme: "Blues"},
  marks: [
    Plot.barX(regionalData.activePersonality, {
      x: "count",
      y: "region",
      fill: "region",
      sort: {y: "-x"},
      tip: true
    }),
    Plot.text(regionalData.activePersonality, {
      x: "count",
      y: "region",
      text: d => `${d.count}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

<div class="note">
  <strong>Example:</strong> In the Netherlands, Abu Khuder was prosecuted after being arrested and found guilty in 2021 of a war crime for his involvement in the execution of a prisoner of war in Syria. The Dutch court established jurisdiction because Khuder had been granted temporary asylum in the Netherlands since 2014.
</div>

---

## 4. Passive Personality Jurisdiction

<div class="grid grid-cols-2">
  <div>
    <p><strong>${stats.passivePersonality}</strong> UN Member States have some form of jurisdiction over at least one of the most serious international crimes when a victim of the crime is a national of the country.</p>
    <p>This can also include victims who are:</p>
    <ul>
      <li>Residents of the country</li>
      <li>Refugees or asylum seekers</li>
      <li>Stateless persons residing in the country</li>
    </ul>
  </div>
  <div class="big-number-container">
    <div class="big-number">${stats.passivePersonality}</div>
    <div class="percentage">${Math.round(stats.passivePersonality / stats.total * 100)}%</div>
  </div>
</div>

```js
Plot.plot({
  height: 300,
  marginLeft: 160,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {range: ["#e67e22", "#34495e"]},
  marks: [
    Plot.barX([
      {category: "Passive Personality", value: stats.passivePersonality},
      {category: "Without", value: stats.total - stats.passivePersonality}
    ], {
      x: "value",
      y: "category",
      fill: "category",
      tip: true
    }),
    Plot.text([
      {category: "Passive Personality", value: stats.passivePersonality},
      {category: "Without", value: stats.total - stats.passivePersonality}
    ], {
      x: "value",
      y: "category",
      text: d => `${d.value}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

### Regional Breakdown - Passive Personality

```js
Plot.plot({
  marginLeft: 120,
  height: 250,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {scheme: "Oranges"},
  marks: [
    Plot.barX(regionalData.passivePersonality, {
      x: "count",
      y: "region",
      fill: "region",
      sort: {y: "-x"},
      tip: true
    }),
    Plot.text(regionalData.passivePersonality, {
      x: "count",
      y: "region",
      text: d => `${d.count}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

<div class="note">
  <strong>Example:</strong> In 1994, families of Belgian peacekeepers murdered alongside Rwandan civilians during the Rwandan genocide initiated a case in Belgium against a former Rwandan officer. After many years of procedural hurdles, the suspect eventually turned himself in and was tried and convicted for war crimes in Belgium in 2007.
</div>

---

## 5. Protective Principle

<div class="grid grid-cols-2">
  <div>
    <p><strong>${stats.protectivePrinciple}</strong> UN Member States can exercise jurisdiction over at least one of the most serious international crimes to protect their own national interest or security.</p>
    <p>This includes crimes deemed to affect:</p>
    <ul>
      <li>National sovereignty</li>
      <li>State security</li>
      <li>National interests</li>
      <li>Crimes committed against the state</li>
    </ul>
  </div>
  <div class="big-number-container">
    <div class="big-number">${stats.protectivePrinciple}</div>
    <div class="percentage">${Math.round(stats.protectivePrinciple / stats.total * 100)}%</div>
  </div>
</div>

```js
Plot.plot({
  height: 300,
  marginLeft: 160,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {range: ["#16a085", "#34495e"]},
  marks: [
    Plot.barX([
      {category: "Protective Principle", value: stats.protectivePrinciple},
      {category: "Without", value: stats.total - stats.protectivePrinciple}
    ], {
      x: "value",
      y: "category",
      fill: "category",
      tip: true
    }),
    Plot.text([
      {category: "Protective Principle", value: stats.protectivePrinciple},
      {category: "Without", value: stats.total - stats.protectivePrinciple}
    ], {
      x: "value",
      y: "category",
      text: d => `${d.value}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

### Regional Breakdown - Protective Principle

```js
Plot.plot({
  marginLeft: 120,
  height: 250,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {scheme: "Greens"},
  marks: [
    Plot.barX(regionalData.protectivePrinciple, {
      x: "count",
      y: "region",
      fill: "region",
      sort: {y: "-x"},
      tip: true
    }),
    Plot.text(regionalData.protectivePrinciple, {
      x: "count",
      y: "region",
      text: d => `${d.count}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

<div class="note">
  <strong>Note:</strong> Few states recognize this type of jurisdiction and those that do rarely, if ever, invoke it to prosecute core international crimes. In 2022, Austria's Ministry of Justice issued a decree stating it would interpret its protective jurisdiction provision to extend to Ukrainian survivors of serious international crimes who fled to Austria following Russia's invasion.
</div>

---

## 6. Treaty-Based Jurisdiction

<div class="grid grid-cols-2">
  <div>
    <p><strong>${stats.treatyObligation}</strong> UN Member States have an obligation to exercise jurisdiction over certain serious international crimes as part of international treaties they have ratified.</p>
    <p>Most relevant treaties include:</p>
    <ul>
      <li><strong>1949 Geneva Conventions</strong> - obligation to prosecute or extradite for "grave breaches"</li>
      <li>Convention against Torture</li>
      <li>International Convention for the Protection of All Persons from Enforced Disappearance</li>
    </ul>
  </div>
  <div class="big-number-container">
    <div class="big-number">${stats.treatyObligation}</div>
    <div class="percentage">${Math.round(stats.treatyObligation / stats.total * 100)}%</div>
  </div>
</div>

```js
Plot.plot({
  height: 300,
  marginLeft: 160,
  x: {label: "Number of States", grid: true},
  y: {label: null},
  color: {range: ["#f39c12", "#34495e"]},
  marks: [
    Plot.barX([
      {category: "Treaty Obligations", value: stats.treatyObligation},
      {category: "Without", value: stats.total - stats.treatyObligation}
    ], {
      x: "value",
      y: "category",
      fill: "category",
      tip: true
    }),
    Plot.text([
      {category: "Treaty Obligations", value: stats.treatyObligation},
      {category: "Without", value: stats.total - stats.treatyObligation}
    ], {
      x: "value",
      y: "category",
      text: d => `${d.value}`,
      dx: 10,
      textAnchor: "start"
    })
  ]
})
```

<div class="note">
  <strong>Important:</strong> Any country that has ratified the Geneva Conventions has not only jurisdiction but an <strong>obligation</strong> to investigate and prosecute individuals for "grave breaches" of the Conventions committed in other countries, or to extradite them to a country that is better placed to prosecute.
</div>

---

## Comparative Overview

```js
// Prepare data for comparison chart
const comparisonData = [
  {type: "Beyond Borders", count: stats.beyondBorders, percentage: Math.round(stats.beyondBorders / stats.total * 100)},
  {type: "Absolute UJ", count: stats.absoluteUJ, percentage: Math.round(stats.absoluteUJ / stats.total * 100)},
  {type: "Presence Required", count: stats.presenceOnly, percentage: Math.round(stats.presenceOnly / stats.total * 100)},
  {type: "Active Personality", count: stats.activePersonality, percentage: Math.round(stats.activePersonality / stats.total * 100)},
  {type: "Passive Personality", count: stats.passivePersonality, percentage: Math.round(stats.passivePersonality / stats.total * 100)},
  {type: "Protective Principle", count: stats.protectivePrinciple, percentage: Math.round(stats.protectivePrinciple / stats.total * 100)},
  {type: "Treaty-Based", count: stats.treatyObligation, percentage: Math.round(stats.treatyObligation / stats.total * 100)}
];
```

```js
Plot.plot({
  marginLeft: 150,
  height: 450,
  x: {label: "Number of UN Member States", grid: true, domain: [0, stats.total]},
  y: {label: null},
  color: {
    domain: comparisonData.map(d => d.type),
    range: ["#2ecc71", "#e74c3c", "#9b59b6", "#3498db", "#e67e22", "#16a085", "#f39c12"]
  },
  marks: [
    Plot.barX(comparisonData, {
      x: "count",
      y: "type",
      fill: "type",
      sort: {y: "-x"},
      tip: true
    }),
    Plot.text(comparisonData, {
      x: "count",
      y: "type",
      text: d => `${d.count} (${d.percentage}%)`,
      dx: 10,
      textAnchor: "start"
    }),
    Plot.ruleX([stats.total / 2], {stroke: "white", strokeDasharray: "4,4", strokeOpacity: 0.3})
  ]
})
```

<style>
  .hero {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%);
    border-radius: 8px;
    margin: 2rem 0;
  }
  
  .hero h1 {
    font-size: 4rem;
    color: #2ecc71;
    margin: 0;
  }
  
  .hero p {
    font-size: 1.5rem;
    color: #7f8c8d;
    margin: 0.5rem 0 0 0;
  }
  
  .note {
    background: rgba(52, 152, 219, 0.1);
    border-left: 4px solid #3498db;
    padding: 1.5rem;
    margin: 2rem 0;
    border-radius: 4px;
  }
  
  .big-number-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .big-number {
    font-size: 5rem;
    font-weight: bold;
    color: #3498db;
    line-height: 1;
  }
  
  .percentage {
    font-size: 2rem;
    color: #7f8c8d;
    margin-top: 0.5rem;
  }
</style>

---

*Data Source: Justice Beyond Borders Project | Clooney Foundation for Justice | 2023*  
*Analysis covers 193 UN Member States and their jurisdictional frameworks for prosecuting international crimes.*