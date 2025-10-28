
# Interactive Bar Chart Example
## Implementation Gap

```js
const rawData = FileAttachment("data/Data_Interjust@2.csv").csv({typed: true});
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

