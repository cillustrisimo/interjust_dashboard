# Project Meridian
## A Global Tool to Increase Survivors' Access to Justice

(An interactive dashboard analyzing the criminalization of international crimes across 216 jurisdictions worldwide.)

*Based on research by the Clooney Foundation for Justice*

---

## Global Overview

```js
// Data Loading
const rawData = FileAttachment("data/Data_Interjust@2.csv").csv()

// Calculate Key Statistics
const withLaws = rawData.filter(d => {
  const genocideJurisdiction = d["Jurisdiction GENOCIDE - NO perpetrator presence"] !== "N/A";
  const warCrimesJurisdiction = d["Jurisdiction WAR CRIMES - NO perpetrator presence"] !== "N/A";
  const cahJurisdiction = d["Jurisdiction CRIMES AGAINST HUMANITY - NO perpetrator presence"] !== "N/A";
  const aggressionJurisdiction = d["Jurisdiction AGGRESSION - NO perpetrator presence"] !== "N/A";
  return genocideJurisdiction || warCrimesJurisdiction || cahJurisdiction || aggressionJurisdiction;
}).length

// Count Prosecutions
const withCases = rawData.filter(d => 
  d["Jurisprudence - Has the country had a UJ or ETJ case? "] === "Yes"
).length

// Display Summary Statistics
const summaryStats = ({
  "Total jurisdictions analyzed": rawData.length,
  "Countries with extraterritorial laws": withLaws,
  "Countries with actual prosecutions": withCases,
  "Implementation gap": withLaws - withCases,
  "Implementation rate": `${(withCases / withLaws * 100).toFixed(1)}%`
})

display(summaryStats)

// Calculate Regional Data
const regionalData = d3.rollup(rawData,
  v => ({
    total: v.length,
    withLaws: v.filter(d => {
      const genocideJurisdiction = d["Jurisdiction GENOCIDE - NO perpetrator presence"] !== "N/A";
      const warCrimesJurisdiction = d["Jurisdiction WAR CRIMES - NO perpetrator presence"] !== "N/A";
      const cahJurisdiction = d["Jurisdiction CRIMES AGAINST HUMANITY - NO perpetrator presence"] !== "N/A";
      const aggressionJurisdiction = d["Jurisdiction AGGRESSION - NO perpetrator presence"] !== "N/A";
      return genocideJurisdiction || warCrimesJurisdiction || cahJurisdiction || aggressionJurisdiction;
    }).length,
    withCases: v.filter(d => d["Jurisprudence - Has the country had a UJ or ETJ case? "] === "Yes").length
  }),
  d => d.Region
)

// Region Selector
const selectedRegion = view(Inputs.select(
  ["All Regions", ...regionalData.keys()].sort(),
  {label: "Filter by region:", value: "All Regions"}
))

// Interactive Bar Chart
display((() => {
  const width = 960;
  const height = 540;
  const margin = {top: 80, right: 160, bottom: 80, left: 80};
  
  // Filter data
  const filteredData = selectedRegion === "All Regions" 
    ? rawData 
    : rawData.filter(d => d.Region === selectedRegion);
  
  // Calculate metrics
  const total = filteredData.length;
  const withLaws = filteredData.filter(d => {
    const genocideJurisdiction = d["Jurisdiction GENOCIDE - NO perpetrator presence"] !== "N/A";
    const warCrimesJurisdiction = d["Jurisdiction WAR CRIMES - NO perpetrator presence"] !== "N/A";
    const cahJurisdiction = d["Jurisdiction CRIMES AGAINST HUMANITY - NO perpetrator presence"] !== "N/A";
    const aggressionJurisdiction = d["Jurisdiction AGGRESSION - NO perpetrator presence"] !== "N/A";
    return genocideJurisdiction || warCrimesJurisdiction || cahJurisdiction || aggressionJurisdiction;
  }).length;
  
  const withCases = filteredData.filter(d => 
    d["Jurisprudence - Has the country had a UJ or ETJ case? "] === "Yes"
  ).length;
  
  // Create SVG with subtle gradient background
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: auto; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;");
  
  // Add subtle background
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#FAFBFC");
  
  // Professional color scheme
  const colors = {
    total: "#4A5568",
    laws: "#5B21B6",
    cases: "#059669"
  };
  
  // Data for visualization
  const data = [
    {
      category: "Total Jurisdictions", 
      value: total, 
      color: colors.total,
      label: "All Countries Analyzed"
    },
    {
      category: "Extraterritorial Legislation", 
      value: withLaws, 
      color: colors.laws,
      label: "Can Prosecute Foreign Crimes"
    },
    {
      category: "Actual Prosecutions", 
      value: withCases, 
      color: colors.cases,
      label: "Have Used These Laws"
    }
  ];
  
  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([margin.left, width - margin.right])
    .padding(0.35);
  
  const y = d3.scaleLinear()
    .domain([0, Math.max(220, total * 1.15)])
    .nice()
    .range([height - margin.bottom, margin.top]);
  
  // Grid lines
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat(d => d))
    .style("stroke-dasharray", "2,2")
    .style("opacity", 0.3)
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line")
      .style("stroke", "#E5E7EB"))
    .call(g => g.selectAll(".tick text")
      .style("font-size", "12px")
      .style("fill", "#6B7280"));
  
  // X-axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick text")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("fill", "#374151"));
  
  // Bars with shadow effect
  const barGroup = svg.append("g");
  
  // Add shadows
  barGroup.selectAll(".shadow")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.category) + 2)
    .attr("y", d => y(d.value) + 2)
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.value))
    .attr("fill", "#000")
    .attr("opacity", 0.1)
    .attr("rx", 6);
  
  // Main bars
  const bars = barGroup.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.category))
    .attr("y", height - margin.bottom)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", d => d.color)
    .attr("rx", 6);
  
  // Animate bars
  bars.transition()
    .duration(800)
    .delay((d, i) => i * 150)
    .attr("y", d => y(d.value))
    .attr("height", d => height - margin.bottom - y(d.value));
  
  // Value labels
  svg.selectAll(".value-label")
    .data(data)
    .join("text")
    .attr("class", "value-label")
    .attr("x", d => x(d.category) + x.bandwidth()/2)
    .attr("y", d => y(d.value) - 12)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "700")
    .style("fill", d => d.color)
    .text(d => d.value);
  
  // Percentage labels
  svg.selectAll(".percent-label")
    .data(data.slice(1))
    .join("text")
    .attr("x", (d, i) => x(d.category) + x.bandwidth()/2)
    .attr("y", d => y(d.value) - 36)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("fill", "#9CA3AF")
    .text((d, i) => i === 0 
      ? `${(withLaws/total*100).toFixed(1)}% of total`
      : `${(withCases/withLaws*100).toFixed(1)}% of those with laws`);
  
  // Description labels
  svg.selectAll(".desc-label")
    .data(data)
    .join("text")
    .attr("x", d => x(d.category) + x.bandwidth()/2)
    .attr("y", height - margin.bottom + 24)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("fill", "#9CA3AF")
    .style("font-style", "italic")
    .text(d => d.label);
  
  // Title
  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 40)
    .style("font-size", "28px")
    .style("font-weight", "700")
    .style("fill", "#111827")
    .text(selectedRegion === "All Regions" 
      ? "Global Justice Implementation Gap" 
      : `${selectedRegion}: Implementation Analysis`);
  
  // Subtitle
  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 64)
    .style("font-size", "16px")
    .style("fill", "#6B7280")
    .text(withLaws > 0
      ? `Only ${(withCases/withLaws*100).toFixed(1)}% of jurisdictions with extraterritorial laws have actually used them`
      : "No jurisdictions in this region have extraterritorial legislation");
  
  return svg.node();
})())

