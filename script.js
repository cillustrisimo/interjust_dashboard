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
        primaryColumn.classList.add('w-full', 'md:w-1/3', 'lg:w-1/4', 'pr-6', 'flex-shrink-0', 'sticky', 'top-12', 'self-start'); // <-- MODIFIED LINE
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
        primaryColumn.classList.remove('w-full', 'md:w-1/3', 'lg:w-1/4', 'pr-6', 'flex-shrink-0', 'sticky', 'top-12', 'self-start'); // <-- MODIFIED LINE
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
            .attr("width", "100%") // <--  Use 100%
            .attr("height", "100%") // <-- Use 100%
            .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`); // <-- Set viewBox

        // Scale the projection to the base size, not the "real" width
        const projection = d3.geoMercator()
            .scale(baseWidth / (2 * Math.PI)) // <-- Use baseWidth
            .translate([baseWidth / 2, baseHeight / 1.6]); // <-- Use baseWidth/Height

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
            d3.select("#stat-advocacy").text("142"); // Hardcoded FOR NOW
            d3.select("#stat-national-laws").text("134");
            d3.select("#stat-crime-type").text("99");
            d3.select("#stat-fourth-card").text("51"); // Placeholder
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
            { group: "|", value: 148, color: "#14b8a6" },
            { group: " |", value: 23, color: "#e06666" }
        ];

        // --- 2. SVG AND CHART SETUP () ---
        const margin = { top: 60, right: 50, bottom: 50, left: 160 };

        // Define a "base" size.
        const baseWidth = 1100;
        const baseHeight = 250;

        // Calculate internal chart dimensions from the base size
        const chartWidth = baseWidth - margin.left - margin.right;
        const chartHeight = baseHeight - margin.top - margin.bottom;

        // Make the SVG responsive using viewBox
        const svgBar = barChartContainer.append("svg")
            .attr("width", "100%") // <--  Use 100%
            .attr("height", "100%") // <--  Use 100%
            .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`) // <--  Set viewBox
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

        // Manually create Item 2 with a fixed  offset
        const legendItem2 = legend.append("g")
            .attr("class", "legend-item")
            .attr("transform", "translate(450, 0)"); // <--  Manually set offset

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

            // If this is Universal Jurisdiction, init charts
            if (targetId === 'page-universal-jurisdiction') {
                initUniversalJurisdiction();
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

// ============================================
// UNIVERSAL JURISDICTION MODULE
// ============================================
// PURPOSE: Handles navigation to and rendering of Universal Jurisdiction page
// LOCATION: Add this code to the END of script.js (after the existing code)
// DEPENDENCIES: 
//   - D3.js (already loaded in index.html)
//   - Observable Plot (needs to be added to index.html - see instructions)
//   - CSV data file: src/static_data/Data_Interjust@2.csv
// ============================================

// --------------------------------------------
// NAVIGATION HANDLER
// --------------------------------------------
// This handles the click event on the "View Full Analysis" button in dashboard.html
// When clicked, it navigates to the Universal Jurisdiction page

document.addEventListener('DOMContentLoaded', () => {
    // Wait for the button to be added to the DOM (it's in dashboard.html which loads dynamically)
    // We use event delegation on the document to catch clicks even for dynamically loaded elements
    
    document.addEventListener('click', (e) => {
        // Check if the clicked element is our navigation button
        if (e.target.id === 'nav-to-universal-jurisdiction' || 
            e.target.closest('#nav-to-universal-jurisdiction')) {
            
            e.preventDefault(); // Prevent default button behavior
            
            console.log('Navigating to Universal Jurisdiction page...');
            
            // Find the navigation card for Universal Jurisdiction
            const ujNavCard = document.querySelector('[data-target="page-universal-jurisdiction"]');
            
            if (ujNavCard) {
                // Programmatically click the navigation card to trigger page load
                ujNavCard.click();
            } else {
                console.error('Universal Jurisdiction navigation card not found. Make sure it exists in index.html');
            }
        }
        
        // Handle "Back to Dashboard" button click
        if (e.target.id === 'back-to-dashboard' || 
            e.target.closest('#back-to-dashboard')) {
            
            e.preventDefault();
            
            console.log('Returning to dashboard...');
            
            // Find and click the dashboard navigation card
            const dashboardNavCard = document.querySelector('[data-target="page-dashboard"]');
            
            if (dashboardNavCard) {
                dashboardNavCard.click();
            } else {
                console.error('Dashboard navigation card not found');
            }
        }
    });
});


// --------------------------------------------
// FLAG TO PREVENT RE-INITIALIZATION
// --------------------------------------------
// Similar to dashboardInitialized flag, this prevents the charts from being
// rendered multiple times if the user navigates back and forth
let universalJurisdictionInitialized = false;


// ============================================
// MAIN INITIALIZATION FUNCTION
// ============================================
// This function is called when the Universal Jurisdiction page loads
// It fetches data, processes it, and renders all charts

async function initUniversalJurisdiction() {
    // --------------------------------------------
    // CHECK IF ALREADY INITIALIZED
    // --------------------------------------------
    if (universalJurisdictionInitialized) {
        console.log('Universal Jurisdiction already initialized.');
        return;
    }
    
    universalJurisdictionInitialized = true;
    console.log('Initializing Universal Jurisdiction page...');
    
    // --------------------------------------------
    // CHECK FOR REQUIRED ELEMENTS
    // --------------------------------------------
    const loadingEl = document.getElementById('uj-loading');
    const contentEl = document.getElementById('uj-content');
    
    if (!loadingEl || !contentEl) {
        console.error('Required page elements not found. Make sure universal-jurisdiction.html is loaded.');
        return;
    }
    
    try {
        // --------------------------------------------
        // STEP 1: LOAD DATA
        // --------------------------------------------
        const csvPath = 'src/static_data/Data_Interjust@2.csv'; // Same data source as dashboard
        console.log('Fetching data from:', csvPath);
        
        const response = await fetch(csvPath);
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const data = d3.csvParse(csvText, d3.autoType);
        console.log('Data loaded:', data.length, 'rows');
        
        // --------------------------------------------
        // STEP 2: FILTER FOR UN MEMBER STATES
        // --------------------------------------------
        const unMemberStates = data.filter(d => d.Status?.trim() === "UN Member State");
        console.log('UN Member States:', unMemberStates.length);
        
        // --------------------------------------------
        // STEP 3: DEFINE HELPER FUNCTIONS
        // --------------------------------------------
        
        // Check if a jurisdiction value exists and is not N/A
        function hasJurisdiction(value) {
            return value && value.trim() !== "" && value.trim() !== "N/A";
        }
        
        // Check if a jurisdiction value contains a specific type (e.g., "UJ", "Active personality")
        function hasJurisdictionType(value, type) {
            if (!value || value.trim() === "" || value.trim() === "N/A") return false;
            return value.includes(type);
        }
        
        // --------------------------------------------
        // STEP 4: DEFINE JURISDICTION COLUMN NAMES
        // --------------------------------------------
        // These correspond to the CSV column headers for different crime types
        // Each crime has a "NO perpetrator presence" and "YES perpetrator presence" column
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
        
        // --------------------------------------------
        // STEP 5: CALCULATE STATISTICS
        // --------------------------------------------
        // Each filter creates a list of countries that meet certain jurisdiction criteria
        
        // States with ANY jurisdiction beyond their borders
        const statesWithJurisdictionBeyondBorders = unMemberStates.filter(row => 
            Object.values(jurisdictionCols).some(crime => 
                hasJurisdiction(row[crime.no]) || hasJurisdiction(row[crime.yes])
            )
        );
        
        // States with ABSOLUTE universal jurisdiction (marked as "UJ")
        const statesWithAbsoluteUJ = unMemberStates.filter(row => 
            Object.values(jurisdictionCols).some(crime => 
                hasJurisdictionType(row[crime.no], "UJ") || hasJurisdictionType(row[crime.yes], "UJ")
            )
        );
        
        // States requiring PRESENCE of the suspect
        const statesWithPresenceJurisdiction = unMemberStates.filter(row => 
            Object.values(jurisdictionCols).some(crime => 
                hasJurisdictionType(row[crime.yes], "Presence only")
            )
        );
        
        // States with ACTIVE PERSONALITY jurisdiction (based on perpetrator nationality)
        const statesWithActivePersonality = unMemberStates.filter(row => 
            Object.values(jurisdictionCols).some(crime => 
                hasJurisdictionType(row[crime.no], "Active personality") || 
                hasJurisdictionType(row[crime.yes], "Active personality")
            )
        );
        
        // States with PASSIVE PERSONALITY jurisdiction (based on victim nationality)
        const statesWithPassivePersonality = unMemberStates.filter(row => 
            Object.values(jurisdictionCols).some(crime => 
                hasJurisdictionType(row[crime.no], "Passive personality") || 
                hasJurisdictionType(row[crime.yes], "Passive personality")
            )
        );
        
        // States with PROTECTIVE PRINCIPLE jurisdiction (based on national security)
        const statesWithProtectivePrinciple = unMemberStates.filter(row => 
            Object.values(jurisdictionCols).some(crime => 
                hasJurisdictionType(row[crime.no], "Protective principle") || 
                hasJurisdictionType(row[crime.yes], "Protective principle")
            )
        );
        
        // Create statistics object with counts
        const stats = {
            total: unMemberStates.length,
            beyondBorders: statesWithJurisdictionBeyondBorders.length,
            absoluteUJ: statesWithAbsoluteUJ.length,
            presenceOnly: statesWithPresenceJurisdiction.length,
            activePersonality: statesWithActivePersonality.length,
            passivePersonality: statesWithPassivePersonality.length,
            protectivePrinciple: statesWithProtectivePrinciple.length,
            treatyObligation: 94 // Based on Geneva Conventions ratification
        };
        
        console.log('Statistics calculated:', stats);
        
        // --------------------------------------------
        // STEP 6: CALCULATE REGIONAL BREAKDOWNS
        // --------------------------------------------
        // This function groups states by region and counts them
        function getRegionalBreakdown(statesList) {
            const regions = d3.group(statesList, d => d.Region);
            return Array.from(regions, ([region, countries]) => ({
                region: region || "Unknown",
                count: countries.length,
                countries: countries.map(c => c.Country)
            })).sort((a, b) => b.count - a.count); // Sort by count descending
        }
        
        // Create regional breakdowns for each jurisdiction type
        const regionalData = {
            beyondBorders: getRegionalBreakdown(statesWithJurisdictionBeyondBorders),
            absoluteUJ: getRegionalBreakdown(statesWithAbsoluteUJ),
            presenceOnly: getRegionalBreakdown(statesWithPresenceJurisdiction),
            activePersonality: getRegionalBreakdown(statesWithActivePersonality),
            passivePersonality: getRegionalBreakdown(statesWithPassivePersonality),
            protectivePrinciple: getRegionalBreakdown(statesWithProtectivePrinciple)
        };
        
        // --------------------------------------------
        // STEP 7: PREPARE COMPARISON DATA
        // --------------------------------------------
        // This creates data for the final comparative chart showing all jurisdiction types
        const comparisonData = [
            {type: "Beyond Borders", count: stats.beyondBorders, percentage: Math.round(stats.beyondBorders / stats.total * 100)},
            {type: "Absolute UJ", count: stats.absoluteUJ, percentage: Math.round(stats.absoluteUJ / stats.total * 100)},
            {type: "Presence Required", count: stats.presenceOnly, percentage: Math.round(stats.presenceOnly / stats.total * 100)},
            {type: "Active Personality", count: stats.activePersonality, percentage: Math.round(stats.activePersonality / stats.total * 100)},
            {type: "Passive Personality", count: stats.passivePersonality, percentage: Math.round(stats.passivePersonality / stats.total * 100)},
            {type: "Protective Principle", count: stats.protectivePrinciple, percentage: Math.round(stats.protectivePrinciple / stats.total * 100)},
            {type: "Treaty-Based", count: stats.treatyObligation, percentage: Math.round(stats.treatyObligation / stats.total * 100)}
        ];
        
        // --------------------------------------------
        // STEP 8: POPULATE TEXT CONTENT
        // --------------------------------------------
        // Fill in dynamic text elements with calculated statistics
        populateTextContent(stats);
        
        // --------------------------------------------
        // STEP 9: RENDER ALL CHARTS
        // --------------------------------------------
        // Call function to create all visualizations
        renderAllCharts(stats, regionalData, comparisonData);
        
        // --------------------------------------------
        // STEP 10: SHOW CONTENT, HIDE LOADING
        // --------------------------------------------
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        
        console.log('Universal Jurisdiction page initialized successfully');
        
    } catch (error) {
        // --------------------------------------------
        // ERROR HANDLING
        // --------------------------------------------
        console.error('Error initializing Universal Jurisdiction:', error);
        loadingEl.innerHTML = `
            <div class="bg-red-900/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg">
                <p class="font-bold">Error loading data:</p>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
        
        // Reset flag so user can try again
        universalJurisdictionInitialized = false;
    }
}


// ============================================
// TEXT CONTENT POPULATION
// ============================================
// Fills in dynamic text elements with calculated values

function populateTextContent(stats) {
    // Hero stat (main "Beyond Borders" number)
    const heroStat = document.getElementById('hero-stat');
    if (heroStat) {
        heroStat.innerHTML = `
            <div class="text-6xl font-bold text-green-400">${stats.beyondBorders}</div>
            <div class="text-2xl text-gray-300 mt-2">out of ${stats.total} UN Member States</div>
        `;
    }
    
    // Absolute UJ description and stat
    const absoluteUJDesc = document.getElementById('absolute-uj-description');
    if (absoluteUJDesc) {
        absoluteUJDesc.innerHTML = `<strong class="text-white">${stats.absoluteUJ}</strong> UN Member States can exercise absolute universal jurisdiction over at least one of the most serious international crimes.`;
    }
    
    const absoluteUJStat = document.getElementById('absolute-uj-stat');
    if (absoluteUJStat) {
        absoluteUJStat.innerHTML = `
            <div class="text-6xl font-bold text-blue-400">${stats.absoluteUJ}</div>
            <div class="text-3xl text-gray-400 mt-2">${Math.round(stats.absoluteUJ / stats.total * 100)}%</div>
        `;
    }
    
    // Presence Required description and stat
    const presenceDesc = document.getElementById('presence-required-description');
    if (presenceDesc) {
        presenceDesc.innerHTML = `<strong class="text-white">${stats.presenceOnly}</strong> UN Member States can exercise conditional universal jurisdiction requiring the presence of the suspect in their territory.`;
    }
    
    const presenceStat = document.getElementById('presence-required-stat');
    if (presenceStat) {
        presenceStat.innerHTML = `
            <div class="text-6xl font-bold text-purple-400">${stats.presenceOnly}</div>
            <div class="text-3xl text-gray-400 mt-2">${Math.round(stats.presenceOnly / stats.total * 100)}%</div>
        `;
    }
    
    // Active Personality description and stat
    const activeDesc = document.getElementById('active-personality-description');
    if (activeDesc) {
        activeDesc.innerHTML = `<strong class="text-white">${stats.activePersonality}</strong> UN Member States can exercise jurisdiction over at least one of the most serious international crimes when their own nationals are the alleged perpetrators.`;
    }
    
    const activeStat = document.getElementById('active-personality-stat');
    if (activeStat) {
        activeStat.innerHTML = `
            <div class="text-6xl font-bold text-blue-400">${stats.activePersonality}</div>
            <div class="text-3xl text-gray-400 mt-2">${Math.round(stats.activePersonality / stats.total * 100)}%</div>
        `;
    }
    
    // Passive Personality description and stat
    const passiveDesc = document.getElementById('passive-personality-description');
    if (passiveDesc) {
        passiveDesc.innerHTML = `<strong class="text-white">${stats.passivePersonality}</strong> UN Member States can exercise jurisdiction over at least one of the most serious international crimes when their own nationals are victims.`;
    }
    
    const passiveStat = document.getElementById('passive-personality-stat');
    if (passiveStat) {
        passiveStat.innerHTML = `
            <div class="text-6xl font-bold text-orange-400">${stats.passivePersonality}</div>
            <div class="text-3xl text-gray-400 mt-2">${Math.round(stats.passivePersonality / stats.total * 100)}%</div>
        `;
    }
    
    // Protective Principle description and stat
    const protectiveDesc = document.getElementById('protective-principle-description');
    if (protectiveDesc) {
        protectiveDesc.innerHTML = `<strong class="text-white">${stats.protectivePrinciple}</strong> UN Member States can exercise jurisdiction over at least one of the most serious international crimes to protect their own national interest or security.`;
    }
    
    const protectiveStat = document.getElementById('protective-principle-stat');
    if (protectiveStat) {
        protectiveStat.innerHTML = `
            <div class="text-6xl font-bold text-teal-400">${stats.protectivePrinciple}</div>
            <div class="text-3xl text-gray-400 mt-2">${Math.round(stats.protectivePrinciple / stats.total * 100)}%</div>
        `;
    }
    
    // Treaty-Based description and stat
    const treatyDesc = document.getElementById('treaty-based-description');
    if (treatyDesc) {
        treatyDesc.innerHTML = `<strong class="text-white">${stats.treatyObligation}</strong> UN Member States have an obligation to exercise jurisdiction over certain serious international crimes as part of international treaties they have ratified.`;
    }
    
    const treatyStat = document.getElementById('treaty-based-stat');
    if (treatyStat) {
        treatyStat.innerHTML = `
            <div class="text-6xl font-bold text-yellow-400">${stats.treatyObligation}</div>
            <div class="text-3xl text-gray-400 mt-2">${Math.round(stats.treatyObligation / stats.total * 100)}%</div>
        `;
    }
}


// ============================================
// CHART RENDERING FUNCTION
// ============================================
// Creates all Observable Plot visualizations

function renderAllCharts(stats, regionalData, comparisonData) {
    console.log('Rendering charts...');
    
    // --------------------------------------------
    // HELPER: Create horizontal bar chart (overview)
    // --------------------------------------------
    // This creates the two-category charts (With/Without)
    function createOverviewChart(containerId, data, colors, marginLeft = 160) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }
        
        // Clear any existing content
        container.innerHTML = '';
        
        const chart = Plot.plot({
            height: 300,
            marginLeft: marginLeft,
            x: {label: "Number of States", grid: true},
            y: {label: null},
            color: {range: colors},
            marks: [
                // Bars
                Plot.barX(data, {
                    x: "value",
                    y: "category",
                    fill: "category",
                    tip: true
                }),
                // Text labels
                Plot.text(data, {
                    x: "value",
                    y: "category",
                    text: d => `${d.value}`,
                    dx: 10,
                    textAnchor: "start",
                    fill: "white"
                })
            ]
        });
        
        container.appendChild(chart);
    }
    
    // --------------------------------------------
    // HELPER: Create regional breakdown chart
    // --------------------------------------------
    // This creates the regional distribution charts
    function createRegionalChart(containerId, data, colorScheme) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }
        
        // Clear any existing content
        container.innerHTML = '';
        
        const chart = Plot.plot({
            marginLeft: 120,
            height: 250,
            x: {label: "Number of States", grid: true},
            y: {label: null},
            color: {scheme: colorScheme},
            marks: [
                // Bars
                Plot.barX(data, {
                    x: "count",
                    y: "region",
                    fill: "region",
                    sort: {y: "-x"}, // Sort by count descending
                    tip: true
                }),
                // Text labels
                Plot.text(data, {
                    x: "count",
                    y: "region",
                    text: d => `${d.count}`,
                    dx: 10,
                    textAnchor: "start",
                    fill: "white"
                })
            ]
        });
        
        container.appendChild(chart);
    }
    
    // --------------------------------------------
    // CHART 1: Beyond Borders Overview
    // --------------------------------------------
    createOverviewChart(
        'chart-beyond-borders-overview',
        [
            {category: "With Laws", value: stats.beyondBorders},
            {category: "Without Laws", value: stats.total - stats.beyondBorders}
        ],
        ["#2ecc71", "#e74c3c"],
        200
    );
    
    // --------------------------------------------
    // CHART 2: Beyond Borders Regional
    // --------------------------------------------
    createRegionalChart(
        'chart-beyond-borders-regional',
        regionalData.beyondBorders,
        "Observable10"
    );
    
    // --------------------------------------------
    // CHART 3: Absolute UJ Overview
    // --------------------------------------------
    createOverviewChart(
        'chart-absolute-uj-overview',
        [
            {category: "With Absolute UJ", value: stats.absoluteUJ},
            {category: "Without", value: stats.total - stats.absoluteUJ}
        ],
        ["#e74c3c", "#34495e"]
    );
    
    // --------------------------------------------
    // CHART 4: Absolute UJ Regional
    // --------------------------------------------
    createRegionalChart(
        'chart-absolute-uj-regional',
        regionalData.absoluteUJ,
        "Reds"
    );
    
    // --------------------------------------------
    // CHART 5: Presence Required Overview
    // --------------------------------------------
    createOverviewChart(
        'chart-presence-required-overview',
        [
            {category: "Presence Required", value: stats.presenceOnly},
            {category: "Without", value: stats.total - stats.presenceOnly}
        ],
        ["#9b59b6", "#34495e"]
    );
    
    // --------------------------------------------
    // CHART 6: Presence Required Regional
    // --------------------------------------------
    createRegionalChart(
        'chart-presence-required-regional',
        regionalData.presenceOnly,
        "Purples"
    );
    
    // --------------------------------------------
    // CHART 7: Active Personality Overview
    // --------------------------------------------
    createOverviewChart(
        'chart-active-personality-overview',
        [
            {category: "Active Personality", value: stats.activePersonality},
            {category: "Without", value: stats.total - stats.activePersonality}
        ],
        ["#3498db", "#34495e"]
    );
    
    // --------------------------------------------
    // CHART 8: Active Personality Regional
    // --------------------------------------------
    createRegionalChart(
        'chart-active-personality-regional',
        regionalData.activePersonality,
        "Blues"
    );
    
    // --------------------------------------------
    // CHART 9: Passive Personality Overview
    // --------------------------------------------
    createOverviewChart(
        'chart-passive-personality-overview',
        [
            {category: "Passive Personality", value: stats.passivePersonality},
            {category: "Without", value: stats.total - stats.passivePersonality}
        ],
        ["#e67e22", "#34495e"]
    );
    
    // --------------------------------------------
    // CHART 10: Passive Personality Regional
    // --------------------------------------------
    createRegionalChart(
        'chart-passive-personality-regional',
        regionalData.passivePersonality,
        "Oranges"
    );
    
    // --------------------------------------------
    // CHART 11: Protective Principle Overview
    // --------------------------------------------
    createOverviewChart(
        'chart-protective-principle-overview',
        [
            {category: "Protective Principle", value: stats.protectivePrinciple},
            {category: "Without", value: stats.total - stats.protectivePrinciple}
        ],
        ["#16a085", "#34495e"]
    );
    
    // --------------------------------------------
    // CHART 12: Protective Principle Regional
    // --------------------------------------------
    createRegionalChart(
        'chart-protective-principle-regional',
        regionalData.protectivePrinciple,
        "Greens"
    );
    
    // --------------------------------------------
    // CHART 13: Treaty-Based Overview
    // --------------------------------------------
    createOverviewChart(
        'chart-treaty-based-overview',
        [
            {category: "Treaty Obligations", value: stats.treatyObligation},
            {category: "Without", value: stats.total - stats.treatyObligation}
        ],
        ["#f39c12", "#34495e"]
    );
    
    // --------------------------------------------
    // CHART 14: Comparative Overview
    // --------------------------------------------
    const comparativeContainer = document.getElementById('chart-comparative-overview');
    if (comparativeContainer) {
        comparativeContainer.innerHTML = '';
        
        const chart = Plot.plot({
            marginLeft: 150,
            height: 450,
            x: {label: "Number of UN Member States", grid: true, domain: [0, stats.total]},
            y: {label: null},
            color: {
                domain: comparisonData.map(d => d.type),
                range: ["#2ecc71", "#e74c3c", "#9b59b6", "#3498db", "#e67e22", "#16a085", "#f39c12"]
            },
            marks: [
                // Bars
                Plot.barX(comparisonData, {
                    x: "count",
                    y: "type",
                    fill: "type",
                    sort: {y: "-x"},
                    tip: true
                }),
                // Text labels with percentages
                Plot.text(comparisonData, {
                    x: "count",
                    y: "type",
                    text: d => `${d.count} (${d.percentage}%)`,
                    dx: 10,
                    textAnchor: "start",
                    fill: "white"
                }),
                // Reference line at 50%
                Plot.ruleX([stats.total / 2], {
                    stroke: "white",
                    strokeDasharray: "4,4",
                    strokeOpacity: 0.3
                })
            ]
        });
        
        comparativeContainer.appendChild(chart);
    }
    
    console.log('All charts rendered successfully');
}


// ============================================
// HOOK INTO EXISTING FETCH LOGIC
// ============================================
// Modify the existing fetchPageContent function to call our init function
// INSTRUCTIONS: Find the fetchPageContent function in script.js and add this code

// Look for this section in the existing fetchPageContent function:
/*
if (targetId === 'page-dashboard') {
    dashboardInitialized = false;
    initDashboardD3();
}
*/

// Add this immediately after:
/*
if (targetId === 'page-universal-jurisdiction') {
    initUniversalJurisdiction();
}
*/

// ============================================
// END OF UNIVERSAL JURISDICTION MODULE
// ============================================