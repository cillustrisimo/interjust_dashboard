/**
 * CHARTS.JS 
 * ==================================================
 * TO SWAP OUT A GRAPH:
 * 1. Find the function for your chart (e.g., createChart_Section2A)
 * 2. Replace the D3 code inside with your own chart code
 * 3. Keep the containerId parameter the same
 * 4. The chart will automatically render in the correct location
 * 
 * ==================================================
 */


/* ===============================================
   SECTION 1: HORIZONTAL TIMELINE LOGIC 
   (CURRENTLY DEFINED IN SEPARATE TIMELINE_JS DOC)
   =============================================== */



/* ===============================================
   SECTION 2A: SCROLLYTELLING - Choropleth Map
   Shows criminalization of international crimes by country
   Features search, legend, and individual country boundaries
   =============================================== */
function createChart_Section2A(containerId) {
    console.log('[Charts] Rendering Section 2A (Choropleth Map - Criminalization)');
    
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();
    
    // Remove any existing tooltips for this chart
    d3.selectAll(".choropleth-tooltip").remove();
    d3.selectAll(".choropleth-search-container").remove();
    
    const width = 960;
    const height = 560;
    
    // Create wrapper for search bar and map
    const wrapper = container.append("div")
        .attr("class", "choropleth-wrapper")
        .style("position", "relative")
        .style("width", "100%")
        .style("max-width", "960px")
        .style("margin", "0 auto");
    
    // Create search container
    const searchContainer = wrapper.append("div")
        .attr("class", "choropleth-search-container")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("gap", "8px")
        .style("margin-bottom", "16px")
        .style("padding", "8px 0");
    
    // Search input
    const searchInput = searchContainer.append("input")
        .attr("type", "text")
        .attr("class", "choropleth-search-input")
        .attr("placeholder", "Search countries...")
        .style("padding", "10px 16px")
        .style("border", "1px solid #4A5568")
        .style("border-radius", "24px")
        .style("background", "rgba(26, 32, 44, 0.95)")
        .style("color", "#E2E8F0")
        .style("font-size", "13px")
        .style("font-family", "sans-serif")
        .style("width", "260px")
        .style("outline", "none")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
        .style("transition", "all 0.2s ease");
    
    // Clear button
    const clearBtn = searchContainer.append("button")
        .attr("class", "choropleth-search-clear")
        .style("background", "rgba(99, 179, 237, 0.2)")
        .style("border", "1px solid #63B3ED")
        .style("border-radius", "50%")
        .style("width", "32px")
        .style("height", "32px")
        .style("color", "#63B3ED")
        .style("cursor", "pointer")
        .style("font-size", "14px")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("opacity", "0")
        .style("pointer-events", "none")
        .style("transition", "all 0.2s ease")
        .html("×");
    
    const svg = wrapper.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto")
        .style("display", "block")
        .style("max-width", "none")
        .style("background", "transparent");
    
    // Crime types
    const crimeTypes = ["War Crimes", "Genocide", "Crimes Against Humanity", "Crime of Aggression"];
    
    // Sample country data for static fallback
    // In production, use: DataCounterHub.processAllRecords(airtableRecords, 'criminalization')
    const countryData = {
        // North America
        "USA": { crimes: ["War Crimes", "Genocide"], count: 2 },
        "CAN": { crimes: ["War Crimes", "Genocide", "Crimes Against Humanity", "Crime of Aggression"], count: 4 },
        "MEX": { crimes: ["War Crimes", "Genocide"], count: 2 },
        // Europe
        "GBR": { crimes: ["War Crimes", "Genocide", "Crimes Against Humanity", "Crime of Aggression"], count: 4 },
        "FRA": { crimes: ["War Crimes", "Genocide", "Crimes Against Humanity", "Crime of Aggression"], count: 4 },
        "DEU": { crimes: ["War Crimes", "Genocide", "Crimes Against Humanity", "Crime of Aggression"], count: 4 },
        // Add more countries as needed...
    };
    
    // Color scale
    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range([
            "#d4e6f1", // 0 - lightest blue
            "#a9cce3", // 1
            "#5dade2", // 2
            "#2980b9", // 3
            "#1a5276"  // 4 - darkest blue
        ]);
    
    // Projection
    const projection = d3.geoNaturalEarth1()
        .scale(170)
        .translate([width / 2, height / 2 + 30]);
    
    const path = d3.geoPath().projection(projection);
    
    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "choropleth-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(26, 32, 44, 0.97)")
        .style("border", "1px solid #4A5568")
        .style("border-radius", "8px")
        .style("padding", "16px 20px")
        .style("font-family", "sans-serif")
        .style("font-size", "13px")
        .style("color", "#E2E8F0")
        .style("box-shadow", "0 8px 32px rgba(0,0,0,0.5)")
        .style("pointer-events", "none")
        .style("z-index", "10000")
        .style("max-width", "320px");
    
    const g = svg.append("g");
    
    // Load world map and render
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
        const countries = topojson.feature(world, world.objects.countries);
        
        // Draw countries
        g.selectAll(".country")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", "#2D3748")
            .attr("stroke", "rgba(255,255,255,0.3)")
            .attr("stroke-width", "0.5")
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("stroke", "#63B3ED")
                    .attr("stroke-width", "2");
                
                tooltip.html(`
                    <div style="font-weight: 600; font-size: 15px; margin-bottom: 8px; color: #fff;">${d.properties?.name || 'Unknown territory'}</div>
                    <div style="color: #A0AEC0; font-size: 12px;">Static data mode</div>
                `)
                    .style("visibility", "visible");
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 15) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("stroke", "rgba(255,255,255,0.3)")
                    .attr("stroke-width", "0.5");
                tooltip.style("visibility", "hidden");
            });
    });
    
    // Add legend
    const legendData = [
        { count: 0, label: "0 crimes" },
        { count: 1, label: "1 crime" },
        { count: 2, label: "2 crimes" },
        { count: 3, label: "3 crimes" },
        { count: 4, label: "All 4 crimes" }
    ];
    
    const legend = wrapper.append("div")
        .attr("class", "choropleth-legend")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("gap", "12px")
        .style("margin-top", "20px")
        .style("flex-wrap", "wrap");
    
    legendData.forEach(item => {
        const legendItem = legend.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "6px")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            .style("color", "#A0AEC0");
        
        legendItem.append("div")
            .style("width", "16px")
            .style("height", "16px")
            .style("background", colorScale(item.count))
            .style("border-radius", "3px")
            .style("border", "1px solid rgba(255,255,255,0.2)");
        
        legendItem.append("span")
            .text(item.label);
    });
}


/* ===============================================
   SECTION 3: COMMAND RESPONSIBILITY
   =============================================== */
/* ===============================================
   SECTION 3: Command Responsibility Visualization (live data)
   Uses DataCounterHub.getCommandResponsibilityByRegion() for data
   =============================================== */
function createChart_Section3(containerId) {
    console.log("[Charts] Rendering Section 3 (Command Responsibility)");

    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    // --------------------------------------------------
    // 1. Get data from DataLoader cache or fallback
    // --------------------------------------------------
    let records = null;
    
    // Try to get data from DataLoader cache first
    if (typeof DataLoader !== 'undefined' && DataLoader._cache && DataLoader._cache.airtable) {
        records = DataLoader._cache.airtable;
        console.log('[Section 3] Using DataLoader cached data:', records.length, 'records');
    } 
    // Fallback to global variables if DataLoader not available
    else if (typeof grid_view2025129 !== 'undefined' && grid_view2025129) {
        records = grid_view2025129;
        console.log('[Section 3] Using grid_view2025129:', records.length, 'records');
    } 
    else if (typeof data_interjust !== 'undefined' && data_interjust) {
        records = data_interjust;
        console.log('[Section 3] Using data_interjust:', records.length, 'records');
    }

    if (!records || !records.length) {
        console.warn("[Section 3] No dataset found.");
        container.append("div")
            .style("color", "#E2E8F0")
            .style("font-size", "12px")
            .style("text-align", "center")
            .style("padding", "40px")
            .text("No data available for command responsibility.");
        return;
    }

    // --------------------------------------------------
    // 2. Get regional statistics from DataCounterHub
    // --------------------------------------------------
    let data;
    
    if (typeof DataCounterHub !== 'undefined' && DataCounterHub.getCommandResponsibilityByRegion) {
        data = DataCounterHub.getCommandResponsibilityByRegion(records);
        console.log('[Section 3] Regional data from DataCounterHub:', data.length, 'regions');
    } else {
        // Fallback: inline calculation if DataCounterHub not available
        console.warn('[Section 3] DataCounterHub not available, using inline calculation');
        data = calculateCommandResponsibilityByRegion(records);
    }

    // --------------------------------------------------
    // 3. Draw the glasses chart
    // --------------------------------------------------
    const width = 950;
    const height = 310;
    const glassHeight = 120;
    const glassTopWidth = 50;
    const glassBottomWidth = 32;
    const marginTop = 90;
    const marginSide = 40;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto")
        .attr("font-family", "system-ui, sans-serif");

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 22)
        .attr("text-anchor", "middle")
        .attr("font-size", 20)
        .attr("font-weight", "600")
        .attr("fill", "#FFFFFF")
        .text("Command or Superior Responsibility");

    // Subtitle
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 42)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "#E2E8F0")
        .text("Share of countries in each region recognizing command/superior responsibility");

    const n = data.length;
    const usableWidth = width - marginSide * 2;
    const step = usableWidth / n;

    const defs = svg.append("defs");

    data.forEach((d, i) => {
        if (!d) return;

        const cx = marginSide + step * (i + 0.5);
        const yTop = marginTop;
        const yBottom = yTop + glassHeight;

        const tl = cx - glassTopWidth / 2;
        const tr = cx + glassTopWidth / 2;
        const bl = cx - glassBottomWidth / 2;
        const br = cx + glassBottomWidth / 2;

        const clipId = `glass-clip-${i}`;

        defs.append("clipPath")
            .attr("id", clipId)
            .append("path")
            .attr("d", `M${tl},${yTop} L${bl},${yBottom} L${br},${yBottom} L${tr},${yTop} Z`);

        // Glass outline
        svg.append("path")
            .attr("d", `M${tl},${yTop} L${bl},${yBottom} L${br},${yBottom} L${tr},${yTop}`)
            .attr("fill", "none")
            .attr("stroke", "#E2E8F0")
            .attr("stroke-width", 1.5);

        // Water fill
        const fillHeight = glassHeight * d.pctYes;
        const fy = yBottom - fillHeight;

        svg.append("rect")
            .attr("x", tl)
            .attr("y", fy)
            .attr("width", glassTopWidth)
            .attr("height", fillHeight)
            .attr("clip-path", `url(#${clipId})`)
            .attr("fill", "#6fb8ff");

        // Percentage label
        svg.append("text")
            .attr("x", cx)
            .attr("y", fy - 6)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("fill", "#FFFFFF")
            .text(d3.format(".0%")(d.pctYes));

        // Region label
        svg.append("text")
            .attr("x", cx)
            .attr("y", yBottom + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("fill", "#E2E8F0")
            .text(d.region);
    });

    // Legend
    const legendY = height - 35;
    const legendX = width / 2 - 150;

    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY - 10)
        .attr("width", 16)
        .attr("height", 16)
        .attr("rx", 3)
        .attr("fill", "#6fb8ff");

    svg.append("text")
        .attr("x", legendX + 24)
        .attr("y", legendY + 2)
        .attr("alignment-baseline", "middle")
        .attr("font-size", 12)
        .attr("fill", "#E2E8F0")
        .text("Share of countries with command/superior responsibility");
}

/**
 * Fallback function for calculating command responsibility by region
 * Used only if DataCounterHub is not available
 */
function calculateCommandResponsibilityByRegion(records) {
    const regionOrder = [
        "North America", "Central America", "Caribbean", "South America",
        "Europe", "Africa", "Middle East & North Africa", "Asia", "Oceania"
    ];
    
    // Find the command responsibility column
    const keys = Object.keys(records[0] || {});
    const cmdKey = keys.find(k =>
        /Command\s+or\s+Superior\s+Responsibility.*domestic\s+provision/i.test(k)
    );
    
    if (!cmdKey) {
        console.warn('[Section 3 Fallback] Could not find command responsibility column');
        return regionOrder.map(r => ({ region: r, yes: 0, no: 0, total: 0, pctYes: 0 }));
    }
    
    // Filter to UN Member States
    const unMembers = records.filter(d =>
        String(d.Status || d.status || "").trim() === "UN Member State"
    );
    
    // Aggregate by region
    const regionMap = {};
    
    unMembers.forEach(row => {
        let region = String(row.Region || row.region || "").trim();
        if (/Middle East.*North Africa/i.test(region)) region = "Middle East & North Africa";
        if (!regionOrder.includes(region)) return;
        
        const val = String(row[cmdKey] || "").trim().toUpperCase();
        const isYes = (val === "YES" || val === "Y");
        
        if (!regionMap[region]) regionMap[region] = { yes: 0, no: 0 };
        if (isYes) regionMap[region].yes++;
        else regionMap[region].no++;
    });
    
    return regionOrder.map(region => {
        const counts = regionMap[region] || { yes: 0, no: 0 };
        const total = counts.yes + counts.no;
        return {
            region,
            yes: counts.yes,
            no: counts.no,
            total,
            pctYes: total > 0 ? counts.yes / total : 0
        };
    });
}


/* ===============================================
   SECTION 4: JURISDICTION TYPES & CASE STUDIES
   =============================================== */
function createChart_Section4A(containerId) {
    console.log('[Charts] Rendering Section 4A');
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();
    container.append("div")
        .style("color", "#A0AEC0")
        .style("text-align", "center")
        .style("padding", "40px")
        .text("Chart 4A - Coming Soon");
}

function createChart_Section4B(containerId) {
    console.log('[Charts] Rendering Section 4B');
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();
    container.append("div")
        .style("color", "#A0AEC0")
        .style("text-align", "center")
        .style("padding", "40px")
        .text("Chart 4B - Coming Soon");
}

function createChart_Section4C(containerId) {
    console.log('[Charts] Rendering Section 4C');
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();
    container.append("div")
        .style("color", "#A0AEC0")
        .style("text-align", "center")
        .style("padding", "40px")
        .text("Chart 4C - Coming Soon");
}

function createChart_Section4D(containerId) {
    console.log('[Charts] Rendering Section 4D');
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();
    container.append("div")
        .style("color", "#A0AEC0")
        .style("text-align", "center")
        .style("padding", "40px")
        .text("Chart 4D - Coming Soon");
}

function createChart_Section4E(containerId) {
    console.log('[Charts] Rendering Section 4E');
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();
    container.append("div")
        .style("color", "#A0AEC0")
        .style("text-align", "center")
        .style("padding", "40px")
        .text("Chart 4E - Coming Soon");
}

function createChart_Section5A(containerId) {
    console.log('[Charts] Rendering Section 5A - UJ/ETJ Packed Bubble Chart');
    
    var container = d3.select('#' + containerId);
    if (container.empty()) {
        console.warn('[Charts] Container not found:', containerId);
        return;
    }
    container.selectAll("*").remove();
    
    // Get container dimensions
    var bbox = container.node().getBoundingClientRect();
    var width = bbox.width || 950;
    var height = 620;
    
    // Get data from cache or preload
    var records = null;
    if (typeof DataLoader !== 'undefined' && DataLoader._cache && DataLoader._cache.airtable) {
        records = DataLoader._cache.airtable;
    } else if (typeof window.DATA_PRELOAD !== 'undefined' && window.DATA_PRELOAD) {
        records = window.DATA_PRELOAD;
    }
    
    if (!records || !records.length) {
        console.warn('[Charts] No data available for Section 5A');
        container.append("div")
            .style("color", "#A0AEC0")
            .style("text-align", "center")
            .style("padding", "40px")
            .text("Loading data...");
        return;
    }
    
    // Get processed jurisprudence data from DataCounterHub
    if (typeof DataCounterHub === 'undefined' || !DataCounterHub.getJurisprudenceData) {
        console.warn('[Charts] DataCounterHub.getJurisprudenceData not available');
        return;
    }
    
    var jurisprudenceData = DataCounterHub.getJurisprudenceData(records);
    var nodes = jurisprudenceData.nodes;
    var hierarchyData = jurisprudenceData.hierarchy;
    var regions = jurisprudenceData.regions;
    var stats = jurisprudenceData.stats;
    
    if (!nodes.length) {
        console.warn('[Charts] No jurisprudence data found');
        container.append("div")
            .style("color", "#A0AEC0")
            .style("text-align", "center")
            .style("padding", "40px")
            .text("No data available");
        return;
    }
    
    // Exponent for case count scaling (compresses large values)
    var CASE_EXP = 0.6;
    
    // Build D3 hierarchy with value function
    var root = d3.hierarchy(hierarchyData)
        .sum(function(d) {
            if (d.children) return 0;
            
            if (d.hasCase) {
                var c = d.cases || 1;
                return Math.pow(c, CASE_EXP);
            }
            // Small weight for 0-case countries so they still appear
            return 0.25;
        })
        .sort(function(a, b) {
            return (b.value || 0) - (a.value || 0);
        });
    
    // Pack layout for region circles
    var pack = d3.pack()
        .size([width, height - 40])
        .padding(10);
    
    pack(root);
    
    var regionNodes = root.children || [];
    var countryNodes = root.leaves();
    
    // Force layout inside each region
    regionNodes.forEach(function(regionNode) {
        var children = regionNode.children || [];
        if (!children.length) return;
        
        var centerX = regionNode.x;
        var centerY = regionNode.y;
        
        // Start children scattered around region in a loose ring
        var angleBase = Math.random() * 2 * Math.PI;
        var inner = regionNode.r * 0.25;
        var outer = regionNode.r * 0.75;
        
        children.forEach(function(c, i) {
            var angle = angleBase + (2 * Math.PI * i) / children.length;
            var radius = inner + Math.random() * (outer - inner);
            c.x = centerX + Math.cos(angle) * radius;
            c.y = centerY + Math.sin(angle) * radius;
        });
        
        var sim = d3.forceSimulation(children)
            .force("x", d3.forceX(centerX).strength(0.08))
            .force("y", d3.forceY(centerY).strength(0.08))
            .force("collide", d3.forceCollide(function(d) {
                var scale = d.data.hasCase ? 1 : 0.55;
                return d.r * scale + 1.5;
            }))
            .stop();
        
        // Run simulation
        for (var i = 0; i < 180; ++i) {
            sim.tick();
            
            var maxRegionR = regionNode.r - 4;
            children.forEach(function(n) {
                var scale = n.data.hasCase ? 1 : 0.55;
                var dx = n.x - centerX;
                var dy = n.y - centerY;
                var dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
                var allowed = maxRegionR - n.r * scale;
                if (dist > allowed) {
                    var k = allowed / dist;
                    n.x = centerX + dx * k;
                    n.y = centerY + dy * k;
                }
            });
        }
    });
    
    // Color scale by region
    var color = d3.scaleOrdinal(regions, d3.schemeTableau10);
    var offsetY = 20; // Nudge everything down away from title
    
    // Create SVG
    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("font-family", "Inter, system-ui, sans-serif");
    
    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 26)
        .attr("text-anchor", "middle")
        .attr("font-size", 22)
        .attr("font-weight", 600)
        .attr("fill", "#E2E8F0")
        .text("Investigations and Prosecutions of Serious International Crimes");
    
    // Subtitle
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 48)
        .attr("text-anchor", "middle")
        .attr("font-size", 13)
        .attr("fill", "#A0AEC0")
        .text(stats.statesWithCases + " UN Member States have launched a criminal case involving international crimes committed outside their borders.");
    
    var g = svg.append("g");
    
    // Region circles
    var regionG = g.selectAll("g.region")
        .data(regionNodes)
        .join("g")
        .attr("class", "region");
    
    regionG.append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y + offsetY; })
        .attr("r", function(d) { return d.r; })
        .attr("fill", function(d) { return color(d.data.name); })
        .attr("fill-opacity", 0.06)
        .attr("stroke", function(d) { return color(d.data.name); })
        .attr("stroke-width", 1);
    
    // Region labels
    regionG.append("text")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y + offsetY + d.r + 18; })
        .attr("text-anchor", "middle")
        .attr("font-size", 13)
        .attr("font-weight", 600)
        .attr("stroke", "#1A202C")
        .attr("stroke-width", 3)
        .attr("paint-order", "stroke")
        .attr("fill", "#F7FAFC")
        .text(function(d) { return d.data.name; });
    
    // Country bubbles
    var countryG = g.selectAll("g.country")
        .data(countryNodes)
        .join("g")
        .attr("class", "country");
    
    countryG.append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y + offsetY; })
        .attr("r", function(d) { return d.r * (d.data.hasCase ? 1 : 0.55); })
        .attr("fill", function(d) {
            var base = d3.color(color(d.data.regionPretty));
            base.opacity = d.data.hasCase ? 0.9 : 0.25;
            return base;
        })
        .attr("stroke", function(d) { 
            return d.data.hasCase ? "#111827" : color(d.data.regionPretty); 
        })
        .attr("stroke-width", function(d) { return d.data.hasCase ? 1 : 0.8; });
    
    // Tooltips
    countryG.append("title")
        .text(function(d) {
            var base = d.data.name + "\nRegion: " + d.data.regionPretty;
            if (d.data.hasCase) {
                return base + "\n" + d.data.cases + " " + (d.data.cases === 1 ? "case" : "cases") + " (UJ/ETJ case recorded)";
            } else {
                return base + "\n0 cases (no UJ/ETJ case recorded)";
            }
        });
    
    // Region Legend (top-right)
    var legend = svg.append("g")
        .attr("transform", "translate(" + (width - 190) + ", 90)");
    
    legend.append("text")
        .attr("x", 0)
        .attr("y", -8)
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .attr("fill", "#E2E8F0")
        .text("Region");
    
    var legendItem = legend.selectAll("g")
        .data(regions)
        .join("g")
        .attr("transform", function(d, i) { return "translate(0, " + (i * 16) + ")"; });
    
    legendItem.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .attr("fill", function(d) { return color(d); });
    
    legendItem.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("font-size", 11)
        .attr("fill", "#E2E8F0")
        .text(function(d) { return d; });
    
    // Yes/No status legend
    var statusLegendY = 90 + regions.length * 16 + 18;
    
    var statusLegend = svg.append("g")
        .attr("transform", "translate(" + (width - 190) + ", " + statusLegendY + ")");
    
    statusLegend.append("text")
        .attr("x", 0)
        .attr("y", -8)
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .attr("fill", "#E2E8F0")
        .text("Country status");
    
    var baseColor = color(regions[0]);
    var statusData = [
        { label: "Country with UJ/ETJ case", hasCase: true },
        { label: "Country without UJ/ETJ case", hasCase: false }
    ];
    
    var statusItem = statusLegend.selectAll("g")
        .data(statusData)
        .join("g")
        .attr("transform", function(d, i) { return "translate(0, " + (i * 18) + ")"; });
    
    statusItem.append("circle")
        .attr("cx", 6)
        .attr("cy", 6)
        .attr("r", 6)
        .attr("fill", function(d) {
            var c = d3.color(baseColor);
            c.opacity = d.hasCase ? 0.9 : 0.25;
            return c;
        })
        .attr("stroke", function(d) { return d.hasCase ? "#111827" : baseColor; })
        .attr("stroke-width", 1);
    
    statusItem.append("text")
        .attr("x", 18)
        .attr("y", 9)
        .attr("font-size", 11)
        .attr("fill", "#E2E8F0")
        .text(function(d) { return d.label; });
    
    // Size legend for "Yes" bubbles
    var yesNodes = countryNodes.filter(function(d) { return d.data.hasCase; });
    var maxCases = d3.max(yesNodes, function(d) { return d.data.cases; }) || 1;
    
    var rScale = d3.scalePow()
        .exponent(CASE_EXP / 2)
        .domain([1, maxCases])
        .range([20, 60]);
    
    var sizeLegendY = statusLegendY + statusData.length * 18 + 26;
    
    var sizeLegend = svg.append("g")
        .attr("transform", "translate(" + (width - 190) + ", " + sizeLegendY + ")");
    
    sizeLegend.append("text")
        .attr("x", 0)
        .attr("y", -8)
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .attr("fill", "#E2E8F0")
        .text("Bubble size (colored)");
    
    var exampleCases = maxCases === 1 ? [1] : [1, maxCases];
    
    sizeLegend.selectAll("circle")
        .data(exampleCases)
        .join("circle")
        .attr("cx", function() { return rScale(exampleCases[exampleCases.length - 1]) + 2; })
        .attr("cy", function(d) { return rScale(exampleCases[exampleCases.length - 1]) * 2 - rScale(d); })
        .attr("r", function(d) { return rScale(d); })
        .attr("fill", "none")
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 0.8);
    
    sizeLegend.selectAll("text.size-label")
        .data(exampleCases)
        .join("text")
        .attr("class", "size-label")
        .attr("x", function() { return rScale(exampleCases[exampleCases.length - 1]) * 2 + 8; })
        .attr("y", function(d) { return rScale(exampleCases[exampleCases.length - 1]) * 2 - rScale(d); })
        .attr("dy", "0.35em")
        .attr("font-size", 10)
        .attr("fill", "#E2E8F0")
        .text(function(d) { return d + " " + (d === 1 ? "case" : "cases"); });
    
    console.log('[Charts] Section 5A rendered:', stats.statesWithCases, 'states with UJ/ETJ cases');
}

function createChart_Section5B(containerId) {
    console.log('[Charts] Rendering Section 5B - Specialized Units Bar Chart');
    
    var container = d3.select('#' + containerId);
    if (container.empty()) {
        console.warn('[Charts] Container not found:', containerId);
        return;
    }
    container.selectAll("*").remove();
    
    // Make container a positioning context for tooltip
    container.style("position", "relative");
    
    // Get data from cache or preload
    var records = null;
    if (typeof DataLoader !== 'undefined' && DataLoader._cache && DataLoader._cache.airtable) {
        records = DataLoader._cache.airtable;
    } else if (typeof window.DATA_PRELOAD !== 'undefined' && window.DATA_PRELOAD) {
        records = window.DATA_PRELOAD;
    }
    
    if (!records || !records.length) {
        console.warn('[Charts] No data available for Section 5B');
        container.append("div")
            .style("color", "#A0AEC0")
            .style("text-align", "center")
            .style("padding", "40px")
            .text("Loading data...");
        return;
    }
    
    // Get processed specialized unit data from DataCounterHub
    if (typeof DataCounterHub === 'undefined' || !DataCounterHub.getSpecializedUnitData) {
        console.warn('[Charts] DataCounterHub.getSpecializedUnitData not available');
        return;
    }
    
    var data = DataCounterHub.getSpecializedUnitData(records);
    
    if (data.error) {
        container.append("div")
            .style("color", "#E2E8F0")
            .style("font-size", "12px")
            .text("Specialized-unit column not found in dataset.");
        return;
    }
    
    if (!data.stats.hasData) {
        container.append("div")
            .style("color", "#E2E8F0")
            .style("font-size", "12px")
            .text("No specialized-unit information available for UN Member States.");
        return;
    }
    
    var summary = data.summary;
    var regionCountries = data.regionCountries;
    var regionOrderByData = data.regionOrderByData;
    var totalWithUnit = data.stats.totalWithUnit;
    var maxVal = data.stats.maxVal;
    
    // Layout
    var bbox = container.node().getBoundingClientRect();
    var width = bbox.width || 960;
    var height = 480;
    var margin = { top: 80, right: 140, bottom: 90, left: 140 };
    
    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("font-family", "system-ui, -apple-system, BlinkMacSystemFont, sans-serif");
    
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Scales
    var xScale = d3.scaleLinear()
        .domain([-maxVal, maxVal])
        .range([0, innerWidth]);
    
    var yScale = d3.scaleBand()
        .domain(regionOrderByData)
        .range([0, innerHeight])
        .padding(0.35);
    
    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 26)
        .attr("text-anchor", "middle")
        .attr("font-size", 18)
        .attr("font-weight", 600)
        .attr("fill", "#FFFFFF")
        .text("Specialized Units to Investigate and Prosecute International Crimes");
    
    // Subtitle
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 48)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "#E2E8F0")
        .text(totalWithUnit + " U.N. Member States have a specialized unit to support the investigation and prosecution of the most serious international crimes.");
    
    // Center line
    g.append("line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(0))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#4A5568")
        .attr("stroke-width", 1);
    
    // Tooltip
    var tooltip = container.append("div")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", "#1A202C")
        .style("color", "#F7FAFC")
        .style("padding", "6px 10px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("box-shadow", "0 4px 10px rgba(0,0,0,0.4)")
        .style("opacity", 0)
        .style("z-index", 1000);
    
    function showTooltip(event, d, side) {
        var coords = d3.pointer(event, container.node());
        var mx = coords[0];
        var my = coords[1];
        var count = side === "with" ? d.withUnit : d.withoutUnit;
        var sideLabel = side === "with" 
            ? "have a specialized unit" 
            : "do not have a specialized unit";
        
        var html = "<strong>" + d.region + "</strong><br/>" +
            count + " " + (count === 1 ? "country" : "countries") + " " + sideLabel;
        
        if (side === "with") {
            var countries = regionCountries[d.region] || [];
            if (countries.length) {
                html += "<br/><br/><span style=\"opacity:0.9;\">Countries: " + 
                    countries.join(", ") + "</span>";
            }
        }
        
        tooltip
            .style("left", (mx + 12) + "px")
            .style("top", (my - 10) + "px")
            .style("opacity", 1)
            .html(html);
    }
    
    function hideTooltip() {
        tooltip.style("opacity", 0);
    }
    
    // Build bar data mapped by region
    var summaryByRegion = {};
    summary.forEach(function(d) {
        summaryByRegion[d.region] = d;
    });
    var barData = regionOrderByData.map(function(r) {
        return summaryByRegion[r];
    });
    
    var barGroup = g.append("g");
    
    // Left bars: WITH specialized unit (negative direction)
    barGroup.selectAll(".bar-left")
        .data(barData)
        .enter()
        .append("rect")
        .attr("class", "bar-left")
        .attr("y", function(d) { return yScale(d.region); })
        .attr("height", yScale.bandwidth())
        .attr("x", function(d) { return xScale(-d.withUnit); })
        .attr("width", function(d) { return xScale(0) - xScale(-d.withUnit); })
        .attr("fill", "#63B3ED")
        .style("cursor", "pointer")
        .on("mousemove", function(event, d) { showTooltip(event, d, "with"); })
        .on("mouseleave", hideTooltip);
    
    // Right bars: WITHOUT specialized unit (positive direction)
    barGroup.selectAll(".bar-right")
        .data(barData)
        .enter()
        .append("rect")
        .attr("class", "bar-right")
        .attr("y", function(d) { return yScale(d.region); })
        .attr("height", yScale.bandwidth())
        .attr("x", function(d) { return xScale(0); })
        .attr("width", function(d) { return xScale(d.withoutUnit) - xScale(0); })
        .attr("fill", "#4A5568")
        .attr("stroke", "#718096")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mousemove", function(event, d) { showTooltip(event, d, "without"); })
        .on("mouseleave", hideTooltip);
    
    // X Axis
    var xAxis = d3.axisBottom(xScale)
        .tickFormat(function(d) { return Math.abs(d); })
        .ticks(Math.min(maxVal, 8));
    
    g.append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(xAxis)
        .call(function(g) { g.selectAll("text").attr("fill", "#A0AEC0"); })
        .call(function(g) { g.selectAll("line").attr("stroke", "#4A5568"); })
        .call(function(g) { g.selectAll("path.domain").attr("stroke", "#4A5568"); });
    
    // Y Axis
    var yAxis = d3.axisLeft(yScale);
    
    g.append("g")
        .call(yAxis)
        .call(function(g) { g.selectAll("text").attr("fill", "#E2E8F0"); })
        .call(function(g) { g.selectAll("line").attr("stroke", "#4A5568"); })
        .call(function(g) { g.selectAll("path.domain").attr("stroke", "#4A5568"); });
    
    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 40)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", "#A0AEC0")
        .text("Countries with specialized unit ←   |   Countries without specialized unit →");
    
    // Legend (centered under the plot)
    var legendY = height - 20;
    
    // Calculate legend width for proper centering
    var legendItemWidth = 220; // Approximate width of each legend item
    var legendGap = 40; // Gap between items
    var totalLegendWidth = (legendItemWidth * 2) + legendGap;
    var legendX = (width - totalLegendWidth) / 2;
    
    var legend = svg.append("g")
        .attr("transform", "translate(" + legendX + ", " + legendY + ")");
    
    // First legend item
    legend.append("rect")
        .attr("x", 0)
        .attr("y", -10)
        .attr("width", 14)
        .attr("height", 14)
        .attr("rx", 2)
        .attr("fill", "#63B3ED");
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 2)
        .attr("font-size", 12)
        .attr("fill", "#E2E8F0")
        .text("Countries with specialized unit");
    
    // Second legend item
    var secondItemX = legendItemWidth + legendGap;
    
    legend.append("rect")
        .attr("x", secondItemX)
        .attr("y", -10)
        .attr("width", 14)
        .attr("height", 14)
        .attr("rx", 2)
        .attr("fill", "#4A5568")
        .attr("stroke", "#718096")
        .attr("stroke-width", 1);
    
    legend.append("text")
        .attr("x", secondItemX + 20)
        .attr("y", 2)
        .attr("font-size", 12)
        .attr("fill", "#E2E8F0")
        .text("Countries without specialized unit");
    
    console.log('[Charts] Section 5B rendered:', totalWithUnit, 'states with specialized units');
}


/* ===============================================
   DATA TABLE FUNCTIONS (Legacy Support)
   =============================================== */
function generateRegionalData(count = 15) {
    const prefixes = ["Regio", "Provincia", "Districtus", "Ager", "Civitas"];
    const suffixes = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa"];
    
    return Array.from({length: count}, (_, i) => ({
        name: `${prefixes[i % prefixes.length]} ${suffixes[i % suffixes.length]}`,
        metric1: Math.floor(Math.random() * 1000),
        metric2: Math.floor(Math.random() * 100),
        score: (Math.random() * 10).toFixed(1)
    }));
}

function initDataTable() {
    const tableBody = document.getElementById("table-body");
    if (!tableBody) return;

    let regionalData = generateRegionalData(10);

    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.name}</td>
                <td>${row.metric1}</td>
                <td>${row.metric2}%</td>
                <td><strong>${row.score}</strong></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    renderTable(regionalData);

    document.querySelectorAll("th.sortable").forEach(th => {
        th.addEventListener("click", function() {
            const field = this.dataset.sort;
            const isAsc = this.classList.contains("asc");
            document.querySelectorAll("th").forEach(h => h.classList.remove("asc", "desc"));
            
            regionalData.sort((a, b) => {
                let valA = a[field];
                let valB = b[field];
                if (!isNaN(parseFloat(valA))) {
                    valA = parseFloat(valA);
                    valB = parseFloat(valB);
                }
                return isAsc ? valA - valB : valB - valA;
            });

            this.classList.add(isAsc ? "desc" : "asc");
            renderTable(regionalData);
        });
    });

    document.getElementById("reset-sort")?.addEventListener("click", () => {
        renderTable(regionalData); 
    });
}


/* ===============================================
   MASTER INITIALIZATION
   ==================================================
   THIS IS WHERE ALL CHARTS ARE REGISTERED
   
   TO ADD A NEW CHART:
   1. Create a function above (e.g., createChart_Section6A)
   2. Add it to this initialization list
   3. Make sure the containerId matches your HTML
   
   TO USE REAL DATA:
   1. Include data_loader.js after this file
   2. The initChartsWithRealData() function will be called automatically
   ==================================================
*/

// Main initialization function
async function initializeAllCharts() {
    console.log('[Charts] Initializing all charts...');
    console.log('[Charts] DataCounterHub available:', typeof DataCounterHub !== 'undefined');
    console.log('[Charts] DataLoader available:', typeof DataLoader !== 'undefined');
    console.log('[Charts] initChartsWithRealData available:', typeof initChartsWithRealData !== 'undefined');
    
    // Check if DataLoader is available (data_loader.js included)
    if (typeof DataLoader !== 'undefined' && typeof initChartsWithRealData === 'function') {
        console.log('[Charts] DataLoader detected - attempting to load real data...');
        try {
            await initChartsWithRealData();
            console.log('[Charts] All charts initialized with real data');
            return; // Exit early if successful
        } catch (error) {
            console.warn('[Charts] Could not load real data, falling back to static data:', error);
        }
    } else {
        console.log('[Charts] DataLoader not found - using static data');
    }
    
    // Fallback: Initialize with static/demo data
    console.log('[Charts] Initializing charts with static data...');
    
    // SECTION 1: HORIZONTAL TIMELINE (handled by its own script)
    // initTimeline_Section1();
    
    // SECTION 2 - Criminalization (Single choropleth map)
    createChart_Section2A('chart-section-2a');
    
    // SECTION 3 - Command Responsibility
    createChart_Section3('chart-section-3');
    
    // SECTION 4 - Jurisdiction Types & Case Studies
    createChart_Section4A('chart-section-4a');
    createChart_Section4B('chart-section-4b');
    createChart_Section4C('chart-section-4c');
    createChart_Section4D('chart-section-4d');
    createChart_Section4E('chart-section-4e');
    createChart_Section5A('chart-section-5a');
    createChart_Section5B('chart-section-5b');
    
    console.log('[Charts] All charts initialized with static data');
}

// Handle both cases: DOM already loaded, or not yet loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllCharts);
} else {
    // Use requestAnimationFrame for immediate execution on next frame
    // This ensures data_loader.js globals are available
    requestAnimationFrame(initializeAllCharts);
}
