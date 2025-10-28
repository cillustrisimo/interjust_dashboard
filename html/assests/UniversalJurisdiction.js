// ============================================
// UNIVERSAL JURISDICTION MODULE
// ============================================
// PURPOSE: Handles navigation to and rendering of Universal Jurisdiction page

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

// 0. Countries with at least one UJ case
const statesWithCases = unMemberStates.filter(row => {
    const jurisprudenceCol = row["Jurisprudence - Has the country had a UJ or ETJ case?"];
    return jurisprudenceCol && jurisprudenceCol.trim().toLowerCase() === "yes";        
});

// 1. Countries with jurisdiction beyond borders (any type, any column)
        const statesWithJurisdictionBeyondBorders = unMemberStates.filter(row => 
            Object.values(jurisdictionCols).some(crime => 
                hasJurisdiction(row[crime.no]) || hasJurisdiction(row[crime.yes])
            )
        );
        
// 2. Absolute UJ - ONLY check NO perpetrator columns (CORRECTED)
        const statesWithAbsoluteUJ = unMemberStates.filter(row => 
            Object.values(jurisdictionCols).some(crime => 
                hasJurisdictionType(row[crime.no], "UJ")
            )
        );
        
// 3. Perpetrator Presence - ONLY check YES columns (already correct)
const statesWithPresenceJurisdiction = unMemberStates.filter(row => 
    Object.values(jurisdictionCols).some(crime => 
        hasJurisdictionType(row[crime.yes], "Presence only")
    )
);
        
// 4. Active Personality - check BOTH columns (already correct)
const statesWithActivePersonality = unMemberStates.filter(row => 
    Object.values(jurisdictionCols).some(crime => 
        hasJurisdictionType(row[crime.no], "Active personality") || 
        hasJurisdictionType(row[crime.yes], "Active personality")
    )
);
        
// 5. Passive Personality - check BOTH columns (already correct)
const statesWithPassivePersonality = unMemberStates.filter(row => 
    Object.values(jurisdictionCols).some(crime => 
        hasJurisdictionType(row[crime.no], "Passive personality") || 
        hasJurisdictionType(row[crime.yes], "Passive personality")
    )
);
        
// 6. Protective Principle - ONLY check NO perpetrator columns (CORRECTED)
const statesWithProtectivePrinciple = unMemberStates.filter(row => 
    Object.values(jurisdictionCols).some(crime => 
        hasJurisdictionType(row[crime.no], "Protective principle")
    )
);

// 7. Treaty Obligations - make dynamic instead of hardcoded (CORRECTED)
const statesWithTreatyObligation = unMemberStates.filter(row => 
    hasJurisdictionType(row[jurisdictionCols.warCrimes.yes], "Treaty")
);

  
// 8. Create statistics object with counts
   const stats = {
    total: unMemberStates.length,
    beyondBorders: statesWithJurisdictionBeyondBorders.length,
    absoluteUJ: statesWithAbsoluteUJ.length,
    presenceOnly: statesWithPresenceJurisdiction.length,
    activePersonality: statesWithActivePersonality.length,
    passivePersonality: statesWithPassivePersonality.length,
    protectivePrinciple: statesWithProtectivePrinciple.length,
    treatyObligation: statesWithTreatyObligation.length,
    withCases: statesWithCases.length
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
     }      

    catch (error) {
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

const heroStat = document.getElementById('hero-stat');
if (heroStat) {
    const percentage = Math.round(stats.beyondBorders / stats.total * 100);
    heroStat.innerHTML = `
        <div class="text-6xl font-bold text-green-400">${percentage}%</div>
        <div class="text-2xl text-gray-300 mt-2">of ${stats.total} UN Member States</div>
    `;
    
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