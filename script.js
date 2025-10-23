document.addEventListener('DOMContentLoaded', () => {
    // --- Select all the key elements ---
    const mainContainer = document.getElementById('main-container');
    const primaryColumn = document.getElementById('primary-column');
    const logoSection = document.getElementById('logo-section');
    const navGrid = document.getElementById('nav-grid');
    const disclaimerSection = document.getElementById('disclaimer-section');
    const detailWrapper = document.getElementById('detail-content-wrapper');
    
    const navCards = document.querySelectorAll('.nav-card');
    const detailPages = document.querySelectorAll('.detail-page');

    let isDetailViewActive = false;

    // --- Function to go to Detail View ---
    function goToDetailView() {
        if (isDetailViewActive) return; 
        isDetailViewActive = true;

        logoSection.classList.add('opacity-0', '-translate-y-10', 'h-0', 'overflow-hidden', 'pointer-events-none');
        primaryColumn.classList.remove('gap-10');
        disclaimerSection.classList.add('opacity-0', 'h-0', 'overflow-hidden', 'pointer-events-none');
        mainContainer.classList.remove('flex-col', 'items-center', 'justify-center', 'py-20');
        mainContainer.classList.add('flex-row', 'items-start', 'pt-12', 'container', 'mx-auto');
        primaryColumn.classList.remove('max-w-4xl', 'w-full', 'items-center');
        primaryColumn.classList.add('w-full', 'md:w-1/3', 'lg:w-1/4', 'pr-6', 'flex-shrink-0');
        navGrid.classList.remove('sm:grid-cols-2', 'lg:grid-cols-3', 'max-w-5xl');
        navGrid.classList.add('grid-cols-1');
    }

    // --- Function to go to Home View ---
    function goToHomeView() {
        if (!isDetailViewActive) return; 
        isDetailViewActive = false;

        logoSection.classList.remove('opacity-0', '-translate-y-10', 'h-0', 'overflow-hidden', 'pointer-events-none');
        primaryColumn.classList.add('gap-10');
        disclaimerSection.classList.remove('opacity-0', 'h-0', 'overflow-hidden', 'pointer-events-none');
        mainContainer.classList.add('flex-col', 'items-center', 'justify-center', 'py-20');
        mainContainer.classList.remove('flex-row', 'items-start', 'pt-12', 'container', 'mx-auto');
        primaryColumn.classList.add('max-w-4xl', 'w-full', 'items-center');
        primaryColumn.classList.remove('w-full', 'md:w-1/3', 'lg:w-1/4', 'pr-6', 'flex-shrink-0');
        navGrid.classList.add('sm:grid-cols-2', 'lg:grid-cols-3', 'max-w-5xl');
        navGrid.classList.remove('grid-cols-1');
        detailWrapper.classList.add('w-0', 'opacity-0');
        detailWrapper.classList.remove('w-full', 'md:w-2/3', 'lg:w-3/4', 'opacity-100');
        
        detailPages.forEach(p => p.classList.add('hidden'));
    }

    // Use a flag to prevent re-initializing
    let dashboardInitialized = false; 

    function initDashboardD3() {
        if (dashboardInitialized) {
            console.log("Dashboard D3 already initialized.");
            return;
        }
        dashboardInitialized = true;
        console.log("Initializing Dashboard D3 charts...");

        // --- DATA ---
        const geoJsonUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
        const crimeDataUrl = "src/static_data/Data_Interjust@2.csv"; 

        let crimeData = {};
        
        // --- 1. MAP SETUP ---
        const container = d3.select("#map-container");
        if (container.empty()) {
            console.error("D3 Error: #map-container not found.");
            return;
        }

        // Clear the container *before* appending a new SVG.
        // This stops the maps from stacking.
        container.html("");

        const tooltip = d3.select(".tooltip");

        // Define a "base" aspect ratio. All calculations will use this.
        const baseWidth = 900;
        const baseHeight = baseWidth * 0.55;

        // Make the SVG responsive using viewBox.
        // scale to 100% of the container.
        const svg = container.append("svg")
            .attr("width", "100%") // <-- FIX: Use 100%
            .attr("height", "100%") // <-- FIX: Use 100%
            .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`); // <-- FIX: Set viewBox

        // Scale the projection to the base size, not the "real" width
        const projection = d3.geoMercator()
            .scale(baseWidth / (2 * Math.PI)) // <-- FIX: Use baseWidth
            .translate([baseWidth / 2, baseHeight / 1.6]); // <-- FIX: Use baseWidth/Height

        const path = d3.geoPath().projection(projection);


        // --- COLOR SCALES FOR MAP ---
        const colorAll = "#eab308"; // yellow-500
        const colorSome = "#14b8a6"; // teal-500
        const colorNone = "#6b7280"; // gray-500 

        // --- DATA LOADING AND DRAWING LOGIC ---
        Promise.all([
            d3.csv(crimeDataUrl),
            d3.json(geoJsonUrl)
        ]).then(([csvData, worldData]) => {
            // (Name mapping geojson-->interjust data)
            const nameMappings = {
                "Bolivia" : "Bolivia, Plurinational State of",
                "Bosnia and Herz.": "Bosnia and Herzegovina",
                "Brunei": "Brunei Darussalam",
                "Central African Rep.": "Central African Republic",
                "Congo": "Congo, Republic of the",
                "Czechia": "Czech Republic",
                "Côte d'Ivoire": "Côte d'Ivoire",
                "Dem. Rep. Congo": "Congo, Democratic Republic of the (DRC)",
                "Dominican Rep.": "Dominican Republic",
                "Eq. Guinea": "Equatorial Guinea",
                "Falkland Is.": "Falkland Islands",
                "Iran": "Iran, Islamic Republic Of",
                "Iraq": "Iraq‡",
                "Laos": "Lao People's Democratic Republic",
                "Moldova": "Moldova, Republic of",
                "Myanmar": "Myanmar (Burma)",
                "N. Cyprus": "Cyprus",
                "North Korea": "Korea, Democratic People's Republic of (North Korea)",
                "Palestine": "State of Palestine",
                "Russia": "Russian Federation",
                "S. Sudan": "South Sudan",
                "Solomon Is.": "Solomon Islands",
                "South Korea": "Korea, Republic of (South Korea)",
                "Syria": "Syrian Arab Republic",
                "Tanzania": "Tanzania, United Republic of",
                "United Kingdom": "United Kingdom of Great Britain and Northern Ireland",
                "Venezuela": "Venezuela, Bolivarian Republic of",
            };
            
            const csvDataByName = new Map();
            csvData.forEach(row => {
                csvDataByName.set(row["Country"].trim(), row);
            });

            const countries = topojson.feature(worldData, worldData.objects.countries);

            countries.features.forEach(feature => {
                const geoName = feature.properties.name;
                const numericId = feature.id;
                const csvName = nameMappings[geoName] || geoName;
                const row = csvDataByName.get(csvName);

                if (row && numericId) {
                    crimeData[numericId] = {
                        name: row["Country"],
                        genocide: row["Genocide - Does the country criminalize genocide?"] === "Yes",
                        war_crimes: row["War Crimes - Does the country criminalize war crimes?"] === "Yes",
                        humanity: row["Crimes Against Humanity - Does the country criminalize crimes against humanity?"] === "Yes",
                        aggression: row['Aggression - Does the country criminalize the international ""crime of aggression"" or the ""crimes against peace""?'] === "Yes",
                        anyCrime: row["Does the country have at least one criminalized international crime?"] === "Yes"
                    };
                }
            });

            updateStats(crimeData);

            // TOOL TIP CODE
            svg.selectAll("path")
                .data(countries.features)
                .enter().append("path")
                .attr("d", path)
                .attr("stroke", "#ffffff") // White borders
                .attr("stroke-width", 0.5)
                .on("mouseover", function (event, d) {
                    tooltip.style("opacity", 1);
                })
                .on("mousemove", function (event, d) {
                    const countryData = crimeData[d.id];
                    let tooltipHtml = `<strong class="text-base">${d.properties.name}</strong>`;
                    if (countryData) {
                        const activeCrimes = getActiveCrimes();
                        tooltipHtml += `<div class='mt-2 text-xs space-y-1'>`;
                        activeCrimes.forEach(crime => {
                            const hasLaw = countryData[crime.id] ? 'Yes' : 'No';
                            const textColor = countryData[crime.id] ? 'text-green-400' : 'text-red-400';
                            tooltipHtml += `<div>${crime.name}: <span class='font-bold ${textColor}'>${hasLaw}</span></div>`;
                        });
                        tooltipHtml += `</div>`;
                    } else {
                        tooltipHtml += "<br/><span class='text-xs text-gray-400'>No data available</span>";
                    }

                    tooltip.html(tooltipHtml)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    tooltip.style("opacity", 0);
                });

            updateMap();
        }).catch(error => {
            console.error("Error loading data:", error);
            container.text("Failed to load map data.");
        });

        // --- INTERACTIVITY ---

        function updateStats(data) {
            const totalCountries = Object.keys(data).length;
            let anyCrimeCount = 0;
            let genocideCount = 0;
            Object.values(data).forEach(country => {
                if (country.anyCrime) anyCrimeCount++;
                if (country.genocide) genocideCount++;
            });
            d3.select("#stat-advocacy").text("150"); // Hardcoded as in old file
            d3.select("#stat-national-laws").text(anyCrimeCount);
            d3.select("#stat-crime-type").text(genocideCount);
            d3.select("#stat-fourth-card").text("..."); // Placeholder
        }

        function getActiveCrimes() {
            const active = [];
            // Select *from the newly loaded content*
            document.querySelectorAll("#filters [data-crime]").forEach(el => {
                if (el.querySelector('input').checked) {
                    active.push({
                        id: el.dataset.crime,
                        name: el.querySelector('span').textContent
                    });
                }
            });
            return active;
        }

        function getCountryColor(countryData, activeCrimes) {
            if (!countryData || activeCrimes.length === 0) {
                return colorNone;
            }
            let trueCount = 0;
            for (const crime of activeCrimes) {
                if (countryData[crime.id]) {
                    trueCount++;
                }
            }
            if (trueCount === activeCrimes.length && activeCrimes.length > 0) {
                return colorAll;
            } else if (trueCount > 0) {
                return colorSome;
            } else {
                return colorNone;
            }
        }

        function updateMap() {
            const activeCrimes = getActiveCrimes();
            svg.selectAll("path")
                .transition()
                .duration(300)
                .attr("fill", d => {
                    const countryData = crimeData[d.id];
                    return getCountryColor(countryData, activeCrimes);
                });
        }

        // Add listeners to the *newly loaded* elements
        document.querySelectorAll('#filters input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateMap);
        });

        const countrySearch = document.getElementById('country-search');
        if (countrySearch) {
            countrySearch.addEventListener('input', function (e) {
                const searchTerm = e.target.value.toLowerCase();
                svg.selectAll('path')
                    .attr('opacity', d => {
                        const countryName = d.properties.name.toLowerCase();
                        const countryData = crimeData[d.id];
                        const csvName = countryData ? countryData.name.toLowerCase() : "";
                        return countryName.includes(searchTerm) || csvName.includes(searchTerm) ? 1 : 0.2;
                    });
            });
        }
        
        // --- BAR CHART SCRIPT ---
        drawBarChart();
    }

    function drawBarChart() {
        const barChartContainer = d3.select("#bar-graph-container");
        if (barChartContainer.empty()) {
             console.error("D3 Error: #bar-graph-container not found.");
             return;
        }

        // Clear previous chart if any
        barChartContainer.html("");

        const data = [
            { group: "|", value: 127, color: "#14b8a6" },
            { group: " |", value: 10, color: "#e06666" }
        ];

        // --- 2. SVG AND CHART SETUP (FIXED) ---
        const margin = { top: 60, right: 50, bottom: 50, left: 160 };

        // Define a "base" size.
        const baseWidth = 1100;
        const baseHeight = 250;

        // Calculate internal chart dimensions from the base size
        const chartWidth = baseWidth - margin.left - margin.right;
        const chartHeight = baseHeight - margin.top - margin.bottom;

        // Make the SVG responsive using viewBox
        const svgBar = barChartContainer.append("svg")
            .attr("width", "100%") // <-- FIX: Use 100%
            .attr("height", "100%") // <-- FIX: Use 100%
            .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`) // <-- FIX: Set viewBox
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
            // --- END OF SVG SETUP FIX ---
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) + 10])
            .range([0, chartWidth]); // This uses the base chartWidth

        const y = d3.scaleBand()
            .domain(data.map(d => d.group))
            .range([0, chartHeight])
            .padding(0.25);

        // Axes 
        svgBar.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x).ticks(7))
            .attr("class", "text-gray-400"); // Style axis

        svgBar.append("g")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove();

        // Style Y-axis text
        svgBar.selectAll(".tick text").style("font-size", "16px").attr("class", "text-gray-300");

        // Draw bars
        svgBar.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", d => y(d.group))
            .attr("height", y.bandwidth())
            .attr("x", 0)
            .attr("width", 0) // Start at 0 for transition
            .attr("fill", d => d.color)
            .transition() // Add transition
            .duration(1000)
            .attr("width", d => x(d.value));

        // Add text labels (Styled for dark theme)
        svgBar.selectAll(".bar-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", 0) // Start at 0
            .attr("y", d => y(d.group) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", "#e5e7eb") // Light text
            .text(d => d.value)
            .transition() // Add transition
            .duration(1000)
            .attr("x", d => x(d.value) + 8); // Move to end

        
        // --- 3. LEGEND.  ---
        const legendData = [
            { color: "#14b8a6", text: "UN Member States with at least one law against atrocity crimes" },
            { color: "#e06666", text: "UN Member States which have used them" }
        ];

        const legend = svgBar.append("g")
            .attr("class", "legend");
        
        // Manually create Item 1
        const legendItem1 = legend.append("g")
            .attr("class", "legend-item")
            .attr("transform", "translate(0, 0)"); // Position at 0,0

        legendItem1.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", legendData[0].color);

        legendItem1.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(legendData[0].text)
            .style("font-size", "14px")
            .style("fill", "#e5e7eb")
            .style("alignment-baseline", "middle");

        // Manually create Item 2 with a fixed offset
        const legendItem2 = legend.append("g")
            .attr("class", "legend-item")
            .attr("transform", "translate(450, 0)"); // <-- FIX: Manually set offset

        legendItem2.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", legendData[1].color);

        legendItem2.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(legendData[1].text)
            .style("font-size", "14px")
            .style("fill", "#e5e7eb")
            .style("alignment-baseline", "middle");
        
        // Center the legend
        const legendWidth = legend.node().getBBox().width;
        legend.attr("transform", `translate(${(chartWidth - legendWidth) / 2}, ${-margin.top + 25})`);
        // --- END OF LEGEND FIX ---
    }

        
    async function fetchPageContent(targetPage, path, targetId) {
        // Check a custom data attribute  ---
        if (targetPage.dataset.loaded === 'true') {
            console.log(`Content for ${targetId} is already loaded.`);
            
            // RE-INIT D3 if it's the dashboard, in case window resized
            if (targetId === 'page-dashboard') {
                // We'll just re-run the init function which clears and redraws
                dashboardInitialized = false; // Allow re-run
                initDashboardD3();
            }
            return; // Do nothing, content is already there
        }
        // --- END FIX ---

        // Show a loading message
        targetPage.innerHTML = `<p class="text-lg text-gray-400">Loading...</p>`;

        try {
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`Could not load page. Status: ${response.status}`);
            }
            
            const html = await response.text();
            targetPage.innerHTML = html; // Inject the new HTML

            // Mark the page as successfully loaded ---
            targetPage.dataset.loaded = 'true';


            // If this is the dashboard, init D3
            if (targetId === 'page-dashboard') {
                // This call is now safe because the D3 functions
                // do not depend on the container's animated size.
                dashboardInitialized = false; // Allow re-run
                initDashboardD3();
            }
            
        } catch (error) {
            console.error("Fetch error:", error);
            targetPage.innerHTML = `<p class="text-lg text-red-400">Error: Could not load content.</p>`;
            
            // --Allow the user to try fetching again if it failed ---
            delete targetPage.dataset.loaded;
        }
    }

    // --- Main Click Listener  ---
    navCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault(); 

            const targetId = card.dataset.target;
            const path = card.dataset.path; // Get the new path attribute
            const targetPage = document.getElementById(targetId);

            // 1. Highlight the clicked card (always do this)
            navCards.forEach(c => {
                c.classList.remove('border-blue-500', 'bg-gray-800/60');
                c.classList.add('border-transparent', 'bg-gray-800/30');
            });
            card.classList.add('border-blue-500', 'bg-gray-800/60');
            card.classList.remove('border-transparent', 'bg-gray-800/30');

            // 2. Decide where to go
            if (targetId === 'page-home') {
                goToHomeView();
            } else {
                goToDetailView(); // Run the layout change

                // 3. Hide all pages, then show the target
                detailPages.forEach(p => p.classList.add('hidden'));
                if (targetPage) {
                    targetPage.classList.remove('hidden');
                }
                
                // 4. Show the main content wrapper
                detailWrapper.classList.remove('w-0', 'opacity-0');
                detailWrapper.classList.add('w-full', 'md:w-2/3', 'lg:w-3/4', 'opacity-100');

                // 5. Fetch content *if needed*
                if (path && targetPage) {
                    fetchPageContent(targetPage, path, targetId);
                } else if (!path && targetId !== 'page-home') {
                    console.warn(`No data-path set for card: ${targetId}`);
                }
            }
        });
    });

    console.log("D3.js is loaded and main script is ready.");
});