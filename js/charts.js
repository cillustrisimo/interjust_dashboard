/**
 * CHARTS.JS - ALL CHART RENDERING FUNCTIONS
 * ==================================================
 * All chart drawing functions are in this file.
 * Data loading is handled by data_loader.js which calls these functions.
 * 
 * FONTS: Georgia (site font) - configured in CHART_FONTS object below
 * ==================================================
 * 
 * =====================================================
 * CHART SIZING GUIDE - HOW TO ADJUST EACH CHART
 * =====================================================
 * 
 * Each chart has a SIZE CONTROLS section near the top of its function.
 * Look for comments like "// CHOROPLETH SIZE CONTROLS" or similar.
 * 
 * SECTION 2A - CHOROPLETH MAP (createChart_Section2A)
 * ---------------------------------------------------
 * SIZE CONTROLS at ~line 127:
 *   var width = 1400;      // SVG width
 *   var height = 800;      // SVG height
 *   var mapScale = 280;    // Map zoom (higher = bigger countries)
 * 
 * SECTION 3 - COMMAND RESPONSIBILITY GLASSES (createChart_Section3)
 * -----------------------------------------------------------------
 * SIZE CONTROLS at ~line 460:
 *   width, height, glassHeight, glassTopWidth, glassBottomWidth
 * 
 * SECTION 4A - SANKEY CHART (SECTION4_CONFIG object)
 * ---------------------------------------------------
 * SIZE CONTROLS at ~line 703 (SECTION4_CONFIG):
 *   viewBox: { w: 1300, h: 800 }  // Changes aspect ratio only
 *   margin.l: 0.14  // Left margin % - increase if left labels cut off
 *   l2BoxW: 0.155   // Right box width % - increase if right labels cut off
 * 
 * MAX SIZE: Controlled by .section4-sankey-wrapper max-width (default: 1400px)
 * To change ACTUAL display size, modify the CSS for .section4-sankey-wrapper
 * in the injectSection4Styles function (~line 844).
 * 
 * SECTION 5A - PACKED BUBBLE CHART (createChart_Section5A)
 * --------------------------------------------------------
 * SIZE CONTROLS at ~line 1920:
 *   width, height, legendWidth, bubbleAreaWidth
 * 
 * SECTION 5B - BAR CHART (createChart_Section5B)
 * ----------------------------------------------
 * SIZE CONTROLS at ~line 2330:
 *   width: 960, height: 580
 *   margin: { top: 80, right: 140, bottom: 120, left: 140 }
 *   wrapper max-width: 1100px (prevents blowup on large screens)
 * 
 * GLOBAL FONT SIZES (CHART_FONT_SIZES)
 * ------------------------------------
 *   title: 28, subtitle: 18, label: 16, smallLabel: 14
 * 
 * =====================================================
 */

/* ===============================================
   SITE FONT CONFIGURATION
   Using Georgia to match the site's typography
   =============================================== */
const CHART_FONTS = {
    title: "Georgia, 'Times New Roman', serif",
    body: "Georgia, 'Times New Roman', serif",
    label: "Georgia, 'Times New Roman', serif"
};

const CHART_FONT_SIZES = {
    title: 28,
    subtitle: 18,
    label: 16,
    smallLabel: 14,
    legend: 14,
    tooltip: 14
};


/* ===============================================
   SECTION 2A: SCROLLYTELLING - Choropleth Map
   Shows criminalization of international crimes by country
   =============================================== */
function createChart_Section2A(containerId, loadedData) {
    console.log('[Charts] Rendering Section 2A (Choropleth Map - Criminalization)');
    console.log('[Charts] Data provided:', loadedData ? 'Yes (' + Object.keys(loadedData.byCountry || {}).length + ' countries)' : 'No (static mode)');
    
    var container = d3.select('#' + containerId);
    container.selectAll("*").remove();
    
    // Allow container to show overflow (so map can bleed)
    container.style("overflow", "visible");
    
    // Remove any existing tooltips
    d3.selectAll(".choropleth-tooltip").remove();
    
    // =====================================================
    // CHOROPLETH SIZE CONTROLS
    // =====================================================
    // Adjust these values to change the map size:
    var width = 1400;      // SVG width (increase for wider map)
    var height = 700;      // SVG height (reduced - title/subtitle now outside)
    var mapScale = 280;    // Map zoom level (increase for bigger countries)
    // =====================================================
    
    // Use real data if provided, otherwise empty object
    var countryData = loadedData ? loadedData.byCountry : {};
    var stats = loadedData ? loadedData.stats : { total: 0, atLeastOne: 0 };
    
    // Create wrapper - allow overflow for map bleeding
    var wrapper = container.append("div")
        .attr("class", "choropleth-wrapper")
        .style("position", "relative")
        .style("width", "100%")
        .style("max-width", width + "px")
        .style("margin", "0 auto")
        .style("overflow", "visible");  // Allow map to bleed outside
    
    // Title - as HTML above everything
    wrapper.append("h3")
        .style("text-align", "center")
        .style("font-family", CHART_FONTS.title)
        .style("font-size", CHART_FONT_SIZES.title + "px")
        .style("font-weight", "700")
        .style("color", "#E2E8F0")
        .style("margin", "0 0 8px 0")
        .text("Criminalization of the Most Serious International Crimes");
    
    // Subtitle - as HTML below title
    wrapper.append("p")
        .style("text-align", "center")
        .style("font-family", CHART_FONTS.body)
        .style("font-size", CHART_FONT_SIZES.subtitle + "px")
        .style("color", "#A0AEC0")
        .style("margin", "0 0 16px 0")
        .text(stats.atLeastOne + ' of ' + stats.total + ' countries criminalize at least one crime');
    
    // Search container - with Georgia font, raised above map with z-index
    var searchContainer = wrapper.append("div")
        .attr("class", "choropleth-search-container")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("gap", "8px")
        .style("margin-bottom", "24px")
        .style("padding", "12px 0")
        .style("position", "relative")
        .style("z-index", "100")
        .style("pointer-events", "auto");  // Ensure all children are clickable
    
    // Search input - with Georgia font
    var searchInput = searchContainer.append("input")
        .attr("type", "text")
        .attr("placeholder", "Search countries...")
        .style("padding", "12px 20px")
        .style("border", "1px solid #4A5568")
        .style("border-radius", "24px")
        .style("background", "rgba(26, 32, 44, 0.95)")
        .style("color", "#E2E8F0")
        .style("font-size", CHART_FONT_SIZES.label + "px")
        .style("font-family", CHART_FONTS.body)
        .style("width", "300px")
        .style("outline", "none")
        .style("pointer-events", "auto");  // Ensure clickable
    
    // Clear button
    var clearBtn = searchContainer.append("button")
        .style("background", "rgba(99, 179, 237, 0.2)")
        .style("border", "1px solid #63B3ED")
        .style("border-radius", "50%")
        .style("width", "36px")
        .style("height", "36px")
        .style("color", "#63B3ED")
        .style("cursor", "pointer")
        .style("font-size", "18px")
        .style("opacity", "0")
        .style("pointer-events", "none")
        .html("&times;");
    
    var svg = wrapper.append("svg")
        .attr("viewBox", '0 0 ' + width + ' ' + height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto")
        .style("overflow", "visible")  // Allow countries to bleed outside
        .style("margin-bottom", "60px")  // Space for caption below Antarctica
        .style("background", "transparent");
    
    // Crime types for tooltip
    var crimeTypes = ["War Crimes", "Genocide", "Crimes Against Humanity", "Crime of Aggression"];
    
    // Color scale
    var colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range(["#d4e6f1", "#a9cce3", "#5dade2", "#2980b9", "#1a5276"]);
    
    // Projection - uses mapScale variable
    var projection = d3.geoNaturalEarth1()
        .scale(mapScale)
        .translate([width / 2, height / 2]);  // Centered since title/subtitle are outside SVG
    
    var path = d3.geoPath().projection(projection);
    
    // Tooltip - with Georgia font
    var tooltip = d3.select("body").append("div")
        .attr("class", "choropleth-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(26, 32, 44, 0.97)")
        .style("border", "1px solid #4A5568")
        .style("border-radius", "8px")
        .style("padding", "16px 20px")
        .style("font-family", CHART_FONTS.body)
        .style("font-size", CHART_FONT_SIZES.tooltip + "px")
        .style("color", "#E2E8F0")
        .style("box-shadow", "0 8px 32px rgba(0,0,0,0.5)")
        .style("pointer-events", "none")
        .style("z-index", "10000")
        .style("max-width", "320px");
    
    var g = svg.append("g");
    
    // ISO numeric to alpha-3 mapping
    var isoNumericToAlpha3 = {
        "4": "AFG", "8": "ALB", "12": "DZA", "16": "ASM", "20": "AND",
        "24": "AGO", "28": "ATG", "31": "AZE", "32": "ARG", "36": "AUS",
        "40": "AUT", "44": "BHS", "48": "BHR", "50": "BGD", "51": "ARM",
        "52": "BRB", "56": "BEL", "60": "BMU", "64": "BTN", "68": "BOL",
        "70": "BIH", "72": "BWA", "76": "BRA", "84": "BLZ", "90": "SLB",
        "92": "VGB", "96": "BRN", "100": "BGR", "104": "MMR", "108": "BDI",
        "112": "BLR", "116": "KHM", "120": "CMR", "124": "CAN", "132": "CPV",
        "136": "CYM", "140": "CAF", "144": "LKA", "148": "TCD", "152": "CHL",
        "156": "CHN", "158": "TWN", "162": "CXR", "166": "CCK", "170": "COL",
        "174": "COM", "175": "MYT", "178": "COG", "180": "COD", "184": "COK",
        "188": "CRI", "191": "HRV", "192": "CUB", "196": "CYP", "203": "CZE",
        "204": "BEN", "208": "DNK", "212": "DMA", "214": "DOM", "218": "ECU",
        "222": "SLV", "226": "GNQ", "231": "ETH", "232": "ERI", "233": "EST",
        "234": "FRO", "238": "FLK", "242": "FJI", "246": "FIN", "248": "ALA",
        "250": "FRA", "254": "GUF", "258": "PYF", "260": "ATF", "262": "DJI",
        "266": "GAB", "268": "GEO", "270": "GMB", "275": "PSE", "276": "DEU",
        "288": "GHA", "292": "GIB", "296": "KIR", "300": "GRC", "304": "GRL",
        "308": "GRD", "312": "GLP", "316": "GUM", "320": "GTM", "324": "GIN",
        "328": "GUY", "332": "HTI", "336": "VAT", "340": "HND", "344": "HKG",
        "348": "HUN", "352": "ISL", "356": "IND", "360": "IDN", "364": "IRN",
        "368": "IRQ", "372": "IRL", "376": "ISR", "380": "ITA", "384": "CIV",
        "388": "JAM", "392": "JPN", "398": "KAZ", "400": "JOR", "404": "KEN",
        "408": "PRK", "410": "KOR", "414": "KWT", "417": "KGZ", "418": "LAO",
        "422": "LBN", "426": "LSO", "428": "LVA", "430": "LBR", "434": "LBY",
        "438": "LIE", "440": "LTU", "442": "LUX", "446": "MAC", "450": "MDG",
        "454": "MWI", "458": "MYS", "462": "MDV", "466": "MLI", "470": "MLT",
        "474": "MTQ", "478": "MRT", "480": "MUS", "484": "MEX", "492": "MCO",
        "496": "MNG", "498": "MDA", "499": "MNE", "500": "MSR", "504": "MAR",
        "508": "MOZ", "512": "OMN", "516": "NAM", "520": "NRU", "524": "NPL",
        "528": "NLD", "531": "CUW", "533": "ABW", "534": "SXM", "535": "BES",
        "540": "NCL", "548": "VUT", "554": "NZL", "558": "NIC", "562": "NER",
        "566": "NGA", "570": "NIU", "574": "NFK", "578": "NOR", "580": "MNP",
        "581": "UMI", "583": "FSM", "584": "MHL", "585": "PLW", "586": "PAK",
        "591": "PAN", "598": "PNG", "600": "PRY", "604": "PER", "608": "PHL",
        "612": "PCN", "616": "POL", "620": "PRT", "624": "GNB", "626": "TLS",
        "630": "PRI", "634": "QAT", "638": "REU", "642": "ROU", "643": "RUS",
        "646": "RWA", "652": "BLM", "654": "SHN", "659": "KNA", "660": "AIA",
        "662": "LCA", "663": "MAF", "666": "SPM", "670": "VCT", "674": "SMR",
        "678": "STP", "682": "SAU", "686": "SEN", "688": "SRB", "690": "SYC",
        "694": "SLE", "702": "SGP", "703": "SVK", "704": "VNM", "705": "SVN",
        "706": "SOM", "710": "ZAF", "716": "ZWE", "724": "ESP", "728": "SSD",
        "729": "SDN", "732": "ESH", "736": "SDN", "740": "SUR", "744": "SJM",
        "748": "SWZ", "752": "SWE", "756": "CHE", "760": "SYR", "762": "TJK",
        "764": "THA", "768": "TGO", "772": "TKL", "776": "TON", "780": "TTO",
        "784": "ARE", "788": "TUN", "792": "TUR", "795": "TKM", "796": "TCA",
        "798": "TUV", "800": "UGA", "804": "UKR", "807": "MKD", "818": "EGY",
        "826": "GBR", "831": "GGY", "832": "JEY", "833": "IMN", "834": "TZA",
        "840": "USA", "850": "VIR", "854": "BFA", "858": "URY", "860": "UZB",
        "862": "VEN", "876": "WLF", "882": "WSM", "887": "YEM", "894": "ZMB",
        "900": "XKX"
    };
    
    function getAlpha3(id) {
        var strId = String(id);
        if (isoNumericToAlpha3[strId]) {
            return isoNumericToAlpha3[strId];
        }
        var numericId = String(parseInt(strId, 10));
        if (isoNumericToAlpha3[numericId]) {
            return isoNumericToAlpha3[numericId];
        }
        return null;
    }
    
    var currentSearchTerm = "";
    var matchedCountries = new Set();
    
    // Load map
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(function(world) {
        var countries = topojson.feature(world, world.objects.countries);
        
        function updateCountryAppearance(searchTerm) {
            currentSearchTerm = searchTerm.toLowerCase().trim();
            matchedCountries.clear();
            
            if (currentSearchTerm) {
                Object.keys(countryData).forEach(function(iso) {
                    var data = countryData[iso];
                    if (data.name && data.name.toLowerCase().indexOf(currentSearchTerm) !== -1) {
                        matchedCountries.add(iso);
                    }
                });
            }
            
            g.selectAll("path.country")
                .transition()
                .duration(300)
                .attr("fill", function(d) {
                    var isoAlpha3 = getAlpha3(d.id);
                    if (!isoAlpha3) return "#2D3748";
                    
                    var data = countryData[isoAlpha3];
                    var baseColor = data ? colorScale(data.count) : "#2D3748";
                    
                    if (currentSearchTerm && !matchedCountries.has(isoAlpha3)) {
                        return "#2D3748";
                    }
                    return baseColor;
                })
                .attr("opacity", function(d) {
                    if (!currentSearchTerm) return 1;
                    var isoAlpha3 = getAlpha3(d.id);
                    if (!isoAlpha3) return 0.15;
                    return matchedCountries.has(isoAlpha3) ? 1 : 0.15;
                });
        }
        
        // Draw countries
        g.selectAll("path.country")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", function(d) {
                var isoAlpha3 = getAlpha3(d.id);
                if (isoAlpha3 && countryData[isoAlpha3]) {
                    return colorScale(countryData[isoAlpha3].count);
                }
                return "#2D3748";
            })
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                var isoAlpha3 = getAlpha3(d.id);
                var content = "";
                
                // Check if this is Antarctica
                var isAntarctica = (d.id === "ATA" || d.id === "010" || 
                    (d.properties && d.properties.name && d.properties.name.toLowerCase().indexOf("antarctica") !== -1));
                
                if (isoAlpha3 && countryData[isoAlpha3]) {
                    var data = countryData[isoAlpha3];
                    content = '<div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: #90CDF4; border-bottom: 1px solid #4A5568; padding-bottom: 10px; font-family: ' + CHART_FONTS.title + ';">' + data.name + '</div>';
                    content += '<div style="font-size: 14px; margin-bottom: 12px; color: #A0AEC0;">Criminalizes <strong style="color: #fff; font-size: 18px;">' + data.count + '</strong> of 4 international crimes</div>';
                    
                    // Show ALL 4 crime types with filled/empty circles
                    content += '<div style="display: grid; gap: 8px;">';
                    crimeTypes.forEach(function(crime) {
                        var hasCrime = data.crimes && data.crimes.indexOf(crime) !== -1;
                        // Filled circle for yes, empty circle for no
                        var circleStyle = hasCrime 
                            ? 'width: 10px; height: 10px; border-radius: 50%; background: #48BB78; border: 2px solid #48BB78;'
                            : 'width: 10px; height: 10px; border-radius: 50%; background: transparent; border: 2px solid #718096;';
                        var textColor = hasCrime ? "#E2E8F0" : "#718096";
                        content += '<div style="display: flex; align-items: center; gap: 10px;">';
                        content += '<span style="' + circleStyle + '"></span>';
                        content += '<span style="color: ' + textColor + ';">' + crime + '</span>';
                        content += '</div>';
                    });
                    content += '</div>';
                } else if (isAntarctica) {
                    content = '<div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #90CDF4; font-family: ' + CHART_FONTS.title + ';">Antarctica</div>';
                    content += '<div style="color: #718096; font-style: italic;">No data available</div>';
                } else if (isoAlpha3) {
                    content = '<div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #90CDF4; font-family: ' + CHART_FONTS.title + ';">' + isoAlpha3 + '</div>';
                    content += '<div style="color: #718096; font-style: italic;">No data available</div>';
                } else {
                    content = '<div style="color: #718096; font-style: italic;">Unknown territory</div>';
                }
                
                tooltip.html(content)
                    .style("visibility", "visible");
                
                d3.select(this)
                    .attr("stroke", "#90CDF4")
                    .attr("stroke-width", 2);
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 15) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
                d3.select(this)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 0.5);
            });
        
        // Search functionality
        searchInput.on("input", function() {
            var value = this.value;
            updateCountryAppearance(value);
            
            clearBtn
                .style("opacity", value ? "1" : "0")
                .style("pointer-events", value ? "auto" : "none");
        });
        
        clearBtn.on("click", function() {
            searchInput.node().value = "";
            updateCountryAppearance("");
            d3.select(this)
                .style("opacity", "0")
                .style("pointer-events", "none");
        });
    });
    
    // Legend - with Georgia font (no title text, evenly spaced)
    var legendX = width - 180;
    var legendY = 70;
    var legendItemHeight = 26;  // Even spacing between items
    
    var legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", 'translate(' + legendX + ', ' + legendY + ')');
    
    // Background box - adjusted height for items only (no title)
    legendGroup.append("rect")
        .attr("x", -12)
        .attr("y", -15)
        .attr("width", 160)
        .attr("height", 150)
        .attr("fill", "rgba(26, 32, 44, 0.85)")
        .attr("stroke", "#4A5568")
        .attr("rx", 6);
    
    // Legend items only - no title text
    var legendItems = [
        { value: 4, label: "4 crimes" },
        { value: 3, label: "3 crimes" },
        { value: 2, label: "2 crimes" },
        { value: 1, label: "1 crime" },
        { value: 0, label: "0 crimes" }
    ];
    
    legendItems.forEach(function(item, i) {
        var itemG = legendGroup.append("g")
            .attr("transform", 'translate(0, ' + (i * legendItemHeight) + ')');
        
        itemG.append("rect")
            .attr("width", 28)
            .attr("height", 18)
            .attr("fill", colorScale(item.value))
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .attr("rx", 2);
        
        itemG.append("text")
            .attr("x", 38)
            .attr("y", 14)
            .style("font-family", CHART_FONTS.body)
            .style("font-size", CHART_FONT_SIZES.smallLabel + "px")
            .style("fill", "#E2E8F0")
            .text(item.label);
    });
    
    // Title and subtitle are now HTML elements above the SVG (see wrapper creation above)
}


/* ===============================================
   SECTION 3: COMMAND RESPONSIBILITY
   =============================================== */
function createChart_Section3(containerId) {
    console.log("[Charts] Rendering Section 3 (Command Responsibility)");

    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    // Get data from DataLoader cache or fallback
    let records = null;
    
    if (typeof DataLoader !== 'undefined' && DataLoader._cache && DataLoader._cache.airtable) {
        records = DataLoader._cache.airtable;
        console.log('[Section 3] Using DataLoader cached data:', records.length, 'records');
    } 
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
            .style("font-size", "16px")
            .style("font-family", CHART_FONTS.body)
            .style("text-align", "center")
            .style("padding", "40px")
            .text("No data available for command responsibility.");
        return;
    }

    // Get regional statistics from DataCounterHub
    let data;
    
    if (typeof DataCounterHub !== 'undefined' && DataCounterHub.getCommandResponsibilityByRegion) {
        data = DataCounterHub.getCommandResponsibilityByRegion(records);
        console.log('[Section 3] Regional data from DataCounterHub:', data.length, 'regions');
    } else {
        console.warn('[Section 3] DataCounterHub not available, using inline calculation');
        data = calculateCommandResponsibilityByRegion(records);
    }

    // =====================================================
    // SECTION 3 SIZE CONTROLS
    // =====================================================
    const width = 1100;        // ~90% of original 1200
    const height = 360;        // ~90% of original 400
    const glassHeight = 135;   // ~90% of original 150
    const glassTopWidth = 55;  // ~90% of original 60
    const glassBottomWidth = 35; // ~90% of original 38
    const marginTop = 100;     // ~90% of original 110
    const marginSide = 45;     // ~90% of original 50
    // =====================================================

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("max-width", width + "px")
        .style("height", "auto")
        .style("margin", "0 auto")
        .style("display", "block")
        .attr("font-family", CHART_FONTS.body);

    // Title with SITE FONT
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 34)
        .attr("text-anchor", "middle")
        .attr("font-size", 24)  // Slightly larger for bigger chart
        .attr("font-weight", "600")
        .attr("font-family", CHART_FONTS.title)
        .attr("fill", "#FFFFFF")
        .text("Command or Superior Responsibility");

    // Subtitle with SITE FONT
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 60)
        .attr("text-anchor", "middle")
        .attr("font-size", 16)  // Slightly larger for bigger chart
        .attr("font-family", CHART_FONTS.body)
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

        // Glass outline - ORIGINAL STYLE: light stroke color
        svg.append("path")
            .attr("d", `M${tl},${yTop} L${bl},${yBottom} L${br},${yBottom} L${tr},${yTop}`)
            .attr("fill", "none")
            .attr("stroke", "#E2E8F0")
            .attr("stroke-width", 1.5);

        // Water fill - ORIGINAL COLOR: #6fb8ff (lighter blue)
        const fillHeight = glassHeight * (d.pctYes || 0);
        const fillY = yBottom - fillHeight;

        svg.append("rect")
            .attr("x", tl)
            .attr("y", fillY)
            .attr("width", glassTopWidth)
            .attr("height", fillHeight)
            .attr("clip-path", `url(#${clipId})`)
            .attr("fill", "#6fb8ff");

        // Percentage label - positioned ON TOP of the water line
        // Sits just above the fill level so it's always visible
        const labelY = fillY - 8;  // 8px above the water line
        svg.append("text")
            .attr("x", cx)
            .attr("y", labelY)
            .attr("text-anchor", "middle")
            .attr("font-size", CHART_FONT_SIZES.label)
            .attr("font-weight", "600")
            .attr("font-family", CHART_FONTS.label)
            .attr("fill", "#FFFFFF")
            .text(Math.round((d.pctYes || 0) * 100) + "%");

        // Region label with SITE FONT
        svg.append("text")
            .attr("x", cx)
            .attr("y", yBottom + 24)
            .attr("text-anchor", "middle")
            .attr("font-size", CHART_FONT_SIZES.smallLabel)
            .attr("font-family", CHART_FONTS.label)
            .attr("fill", "#E2E8F0")
            .text(d.region);
    });

    // Legend at bottom - RESTORED
    const legendY = height - 30;
    const legendX = width / 2 - 180;

    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY - 10)
        .attr("width", 18)
        .attr("height", 18)
        .attr("rx", 3)
        .attr("fill", "#6fb8ff");

    svg.append("text")
        .attr("x", legendX + 28)
        .attr("y", legendY + 4)
        .attr("alignment-baseline", "middle")
        .attr("font-size", CHART_FONT_SIZES.smallLabel)
        .attr("font-family", CHART_FONTS.body)
        .attr("fill", "#E2E8F0")
        .text("Share of countries with command/superior responsibility");
}

// Fallback calculation function
function calculateCommandResponsibilityByRegion(records) {
    const regionOrder = [
        "North America", "Central America", "Caribbean", "South America",
        "Europe", "Africa", "Middle East & North Africa", "Asia", "Oceania"
    ];
    
    const keys = Object.keys(records[0] || {});
    const cmdKey = keys.find(k =>
        /Command\s+or\s+Superior\s+Responsibility.*domestic\s+provision/i.test(k)
    );
    
    if (!cmdKey) {
        console.warn('[Section 3 Fallback] Could not find command responsibility column');
        return regionOrder.map(r => ({ region: r, yes: 0, no: 0, total: 0, pctYes: 0 }));
    }
    
    const unMembers = records.filter(d =>
        String(d.Status || d.status || "").trim() === "UN Member State"
    );
    
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
   SECTION 4: JURISDICTION SANKEY CHART
   Full implementation with modal
   =============================================== */

var Section4SankeyState = {
    regionData: {},
    linkGroup: null,
    graphData: null,
    processedData: null,
    stylesInjected: false,
    modalInjected: false
};

var SECTION4_CONFIG = {
    regionOrder: [
        'Africa', 'Asia', 'Caribbean', 'Central America', 'Europe',
        'Middle East & North Africa', 'North America', 'Oceania', 'South America'
    ],
    regionColors: {
  'Africa': '#FF6B6B',
  'Asia': '#FFA94D',
  'Caribbean': '#BE4BDB',
  'Central America': '#69DB7C',
  'Europe': '#38D9A9',
  'Middle East & North Africa': '#4DABF7',
  'North America': '#845EF7',
  'Oceania': '#F783AC',
  'South America': '#FFD43B'
},

    nodeColors: {
        layer0: '#1d4e89',
        withJurisdiction: '#1a5276',
        withoutJurisdiction: '#FF4500',
        layer2: '#63B3ED'
    },
    // =====================================================
    // SANKEY SIZING - HOW IT WORKS
    // =====================================================
    // viewBox sets the INTERNAL coordinate system (aspect ratio)
    // The SVG scales to fit its container width (up to max-width: 1400px)
    // To change ACTUAL display size, adjust CSS for .section4-sankey-wrapper
    // in injectSection4Styles function (~line 844)
    //
    // These settings control PROPORTIONS within the chart:
    // =====================================================
    viewBox: { w: 1300, h: 800 },  // Internal coordinates (changes aspect ratio)
    // margin: Percentage of viewBox for margins (l=left, r=right, t=top, b=bottom)
    // Increase margin.l if left labels ("All UN Member States") are cut off
    margin: { l: 0.14, r: 0.145, t: 0.077, b: 0.062 },
    // nodeW: Width of the sankey nodes as percentage of viewBox width
    nodeW: 0.022,
    // nodePad: Vertical padding between nodes as percentage of viewBox height  
    nodePad: 0.001,
    // l2BoxW: Width of Layer 2 jurisdiction boxes as percentage of viewBox width
    // Increase this if right-side labels ("Passive Personality") are cut off
    l2BoxW: 0.155,
    // l2Pad: Vertical padding between Layer 2 boxes
    l2Pad: 0.022,
    // l1Gap: Gap between Layer 1 groups (with/without jurisdiction)
    l1Gap: 0.035,
    jurisdictionInfo: {
        'Absolute UJ': {
            title: 'Absolute Universal Jurisdiction',
            description: 'Pure universal jurisdiction without any required nexus to the prosecuting state',
            overview: '<span id="stat-jurisdiction-absolute-modal" class="stat-placeholder">--</span> U.N. Member States can exercise jurisdiction over at least one of the most serious international crimes, regardless of the nationality of the alleged perpetrator, the nationality of the victim, the location where the offense was committed, or the location of the alleged perpetrator.',
            highlight: 'Absolute universal jurisdiction is the "purest" form of universal jurisdiction, reflecting the original idea behind the principle that certain crimes are considered to be committed against the international community as a whole.',
            caseStudy: {
                title: 'Case Study: Former ISIS Member Taha al-Jumailly Prosecuted in Germany for Genocide, Crimes against Humanity, and War Crimes Committed Against Yazidi Women in Iraq',
                text: '<p>Taha al-Jumailly is an Iraqi national and former ISIS member who committed genocide, crimes against humanity, and war crimes through his enslavement and abuse of a Yazidi woman and her daughter.<sup><a href="#ref-28" class="ref-link">[28]</a></sup> Along with his wife, Jennifer Wenisch, a German national who was later convicted of crimes against humanity and war crimes, al-Jumailly held the Yazidi woman and her daughter in inhuman conditions at his home in Fallujah during the summer of 2015.<sup><a href="#ref-29" class="ref-link">[29]</a></sup> The German Federal Court of Justice issued an arrest warrant for al-Jumailly in April 2019, based on a structural investigation into crimes committed against the Yazidi by ISIS in Syria and Iraq that German authorities had opened in 2014.<sup><a href="#ref-30" class="ref-link">[30]</a></sup> Greek authorities arrested al-Jumailly based on the European Arrest Warrant in May 2019, and extradited him to Germany in October.<sup><a href="#ref-31" class="ref-link">[31]</a></sup> The Higher Regional Court of Frankfurt am Main convicted al-Jumailly of genocide, crimes against humanity, and war crimes and sentenced him to life imprisonment in November 2021.<sup><a href="#ref-32" class="ref-link">[32]</a></sup> Al-Jumailly\'s genocide conviction was the first worldwide of an ISIS member.<sup><a href="#ref-33" class="ref-link">[33]</a></sup></p>',
                significance: 'This case marked the first worldwide conviction of an ISIS member for genocide against the Yazidi people, demonstrating how universal jurisdiction can address atrocities even when the perpetrator has no connection to the prosecuting state.',
                links: [
                    { name: 'Trial International', url: 'https://ujim.trialinternational.org/latest-post/taha-aj/' },
                    { name: 'Eurojust Database', url: 'https://www.eurojust.europa.eu/judicial-cooperation/practitioner-networks/genocide-prosecution-network/national-jurisprudence?country_of_trial=Germany&country_of_crime=Iraq&key_terms=Yazidi' }
                ]
            }
        },
        'Presence-based': {
            title: 'Presence-Based Jurisdiction',
            description: 'Jurisdiction requiring the alleged perpetrator to be present in the prosecuting state',
            overview: '<span id="stat-jurisdiction-presence" class="stat-placeholder">--</span> U.N. Member States can exercise jurisdiction over at least one of the most serious international crimes if the alleged perpetrator is physically present in the State, even if neither the perpetrator nor victim are nationals of that State.',
            highlight: 'In many States, laws granting jurisdiction over the most serious international crimes committed abroad are subject to a significant limitation: the suspected perpetrator must be physically present in that State to trigger jurisdiction. This limitation, which is commonly referred to as "conditional universal jurisdiction,"<sup><a href="#ref-34" class="ref-link">[34]</a></sup> is often motivated by resource constraints which justify focusing on those perpetrators who are actually present on the would-be prosecuting State\'s territory.',
            caseStudy: {
                title: 'Case Study: Former Gambian Interior Minister Ousman Sonko Prosecuted in Switzerland for Crimes Committed in The Gambia During the Regime of Yahya Jammeh',
                text: '<p>Ousman Sonko is a Gambian national who committed crimes against humanity in several roles under the regime of Yahya Jammeh, who led The Gambia from 1996-2017.<sup><a href="#ref-35" class="ref-link">[35]</a></sup> Sonko left the Gambia in September 2016.<sup><a href="#ref-36" class="ref-link">[36]</a></sup> Trial International filed a criminal complaint with prosecutors in Switzerland in January 2017, after it became aware of Sonko\'s presence in country.<sup><a href="#ref-37" class="ref-link">[37]</a></sup> Switzerland\'s Office of the Attorney General then opened what would become a six-year investigation which involved multiple trips to The Gambia to collect evidence and hear witness testimony.<sup><a href="#ref-38" class="ref-link">[38]</a></sup> In 2021, The Gambia\'s Truth, Reconciliation, and Reparations Commission recommended that Sonko be prosecuted for killings and acts of torture and sexual violence committed between 2000 and 2016.<sup><a href="#ref-39" class="ref-link">[39]</a></sup> The Federal Criminal Court of Bellinzona convicted Sonko of crimes against humanity and sentenced him to 20 years\' imprisonment in May 2024.<sup><a href="#ref-40" class="ref-link">[40]</a></sup> Having previously served as The Gambia\'s Minister of the Interior, Sonko is to date the highest-ranking State official prosecuted by a European court under the principle of universal jurisdiction.<sup><a href="#ref-41" class="ref-link">[41]</a></sup></p>',
                significance: 'Sonko is the highest-ranking State official prosecuted by a European court under universal jurisdiction, demonstrating how presence-based jurisdiction can reach high-level perpetrators who seek refuge abroad.',
                links: [
                    { name: 'Trial International', url: 'https://ujim.trialinternational.org/latest-post/ousman-sonko/' }
                ]
            }
        },
        'Active Personality': {
            title: 'Active Personality Jurisdiction',
            description: 'Jurisdiction based on the nationality of the alleged perpetrator',
            overview: '<span id="stat-jurisdiction-active" class="stat-placeholder">--</span> U.N. Member States can exercise some sort of jurisdiction over at least one of the most serious international crimes if the alleged perpetrator is a national of that State.',
            highlight: 'Most States exercise jurisdiction over crimes committed by their nationals, regardless of the place of commission. This is commonly referred to as "active personality" jurisdiction. Some States interpret this type of jurisdiction to include alleged perpetrators who are residents, refugees, or stateless persons residing permanently in that State.',
            caseStudy: {
                title: 'Case Study: Dual Ethiopian and Dutch National Eshetu Alemu Prosecuted in the Netherlands for International Crimes Committed in Ethiopia',
                text: '<p>Eshetu Alemu is a dual Ethiopian and Dutch national who committed war crimes as a member of the communist military regime, the "Derg", that ruled Ethiopia from 1974-91.<sup><a href="#ref-42" class="ref-link">[42]</a></sup> Alemu settled in the Netherlands in 1990, a year prior to the Derg\'s collapse, and obtained Dutch citizenship in 1998.<sup><a href="#ref-43" class="ref-link">[43]</a></sup> Also in 1998, a Dutch magazine published an investigative piece linking Alemu to war crimes in Ethiopia.<sup><a href="#ref-44" class="ref-link">[44]</a></sup> Based on the magazine article, the Dutch National Investigative Service\'s International Crimes Unit opened what would become a four-year investigation into Alemu in 2009 that involved cooperation with Ethiopia\'s Special Prosecutor\'s Office.<sup><a href="#ref-45" class="ref-link">[45]</a></sup> Dutch police arrested Alemu in September 2015, and The Hague District Court convicted him of war crimes and sentenced him to life imprisonment in December 2017.<sup><a href="#ref-46" class="ref-link">[46]</a></sup> Alemu\'s case is to date the only prosecution abroad for international crimes committed in Ethiopia.</p>',
                significance: 'This case demonstrates how active personality jurisdiction can close impunity gaps decades after atrocities occurred, when perpetrators later acquire nationality in countries with strong accountability mechanisms.',
                links: [
                    { name: 'Trial International', url: 'https://ujim.trialinternational.org/latest-post/eshetu-alemu/' },
                    { name: 'Eurojust Database', url: 'https://www.eurojust.europa.eu/judicial-cooperation/practitioner-networks/genocide-prosecution-network/national-jurisprudence?country_of_trial=Netherlands&country_of_crime=Ethiopia' }
                ]
            }
        },
        'Passive Personality': {
            title: 'Passive Personality Jurisdiction',
            description: 'Jurisdiction based on the nationality of the victim',
            overview: '<span id="stat-jurisdiction-passive" class="stat-placeholder">--</span> U.N. Member States can exercise some sort of jurisdiction over at least one of the most serious international crimes when a victim of the crime is a national of that State.',
            highlight: 'Many States exercise jurisdiction over crimes committed against their nationals, regardless of the place of commission. This is commonly referred to as "passive personality" jurisdiction. Some States extend this jurisdiction to victims who are residents, refugees, or stateless persons residing permanently in that State.',
            caseStudy: {
                title: 'Case Study: Assad Regime Officials Prosecuted in Absentia in France for the Arrest, Detention, and Disappearance of Dual French and Syrian Nationals in Damascus',
                text: '<p>Ali Mamlouk, Jamil Hassan, and Abdel Salam Mahmoud are all Syrian nationals and former high-ranking officials in the Assad regime who were connected to the November 2013 arrest, detention, and disappearance of dual French and Syrian nationals Patrick and Mazen Dabbagh in Damascus.<sup><a href="#ref-47" class="ref-link">[47]</a></sup> Obeida Dabbagh, a family member of the disappeared, filed a complaint at the Paris Tribunal with the International Federation for Human Rights and one of its French affiliates in October 2016.<sup><a href="#ref-48" class="ref-link">[48]</a></sup> Judges from France\'s specialized unit for the prosecution of international crimes issued international arrest warrants for the three suspects in October 2018, and they completed their investigation in March 2022.<sup><a href="#ref-49" class="ref-link">[49]</a></sup> The Paris Criminal Court convicted Mamlouk, Hassan, and Mahmoud in absentia for complicity in crimes against humanity and war crimes and sentenced them to life imprisonment in May 2024.<sup><a href="#ref-50" class="ref-link">[50]</a></sup> In its ruling, the Court held that functional immunities for State officials do not apply in serious international crimes cases.<sup><a href="#ref-51" class="ref-link">[51]</a></sup></p>',
                significance: 'This case demonstrates how passive personality jurisdiction enables States to pursue justice when their own nationals are victimized abroad, even when perpetrators remain in their home countries.',
                links: [
                    { name: 'Trial International - Mamlouk', url: 'https://ujim.trialinternational.org/latest-post/ali-mamluk/' },
                    { name: 'Trial International - Hassan', url: 'https://ujim.trialinternational.org/latest-post/jamil-hassan/' },
                    { name: 'Trial International - Mahmoud', url: 'https://ujim.trialinternational.org/latest-post/abdel-salam-mahmoud/' }
                ]
            }
        },
        'Protective Principle': {
            title: 'Protective Principle',
            description: 'Jurisdiction to protect state interests',
            overview: '<span id="stat-jurisdiction-protective" class="stat-placeholder">--</span> U.N. Member States can exercise protective principle jurisdiction over at least one core international crime to protect national security or national interests.',
            highlight: 'Some States can exercise jurisdiction over crimes that affect their sovereignty, security, or national interest, or simply over crimes that they consider to be committed against their country. This is commonly referred to as “protective principle” jurisdiction. While this type of jurisdiction could in theory extend to the most serious international crimes which are seen to affect the interests of all countries<sup><a href="#ref-52" class="ref-link">[52]</a></sup>, States rarely invoke it to investigate and prosecute such crimes<sup><a href="#ref-53" class="ref-link">[53]</a></sup>. In practice: <span id="stat-jurisdiction-protective-no-presence" class="stat-placeholder">--</span> states provide for protective jurisdiction even when the alleged perpetrator is not present, while <span id="stat-jurisdiction-protective-presence-only" class="stat-placeholder">--</span> recognize it only when the alleged perpetrator is present. "Presence" refers to whether the alleged perpetrator must be physically present on the state\'s territory to enable jurisdiction.',
            caseStudy: null
        },
        'Treaty Obligations': {
            title: 'Treaty-Based Obligation',
            description: 'Jurisdiction arising from international treaty commitments',
            overview: '<span id="stat-jurisdiction-treaty" class="stat-placeholder">--</span> U.N. Member States have an obligation to exercise jurisdiction over certain serious international crimes as a result of international treaties they have ratified.',
            highlight: 'Many States are required to exercise jurisdiction over crimes committed abroad as an obligation under a treaty. Most relevant for Project Meridian, the 1949 Geneva Conventions, which govern the conduct of war and provide protections for those who are not taking part in hostilities, include an obligation to prosecute suspected war criminals or extradite them to a State that is better placed to prosecute<sup><a href="#ref-54" class="ref-link">[54]</a></sup>. Therefore, any State that has ratified the Geneva Conventions has not only jurisdiction but an obligation to investigate and prosecute "grave breaches" of the Conventions committed in other States.',
            caseStudy: null
        }
    }
};

function injectSection4Styles() {
    if (Section4SankeyState.stylesInjected) return;
    if (document.getElementById('section4-sankey-styles')) {
        Section4SankeyState.stylesInjected = true;
        return;
    }
    
    var css = `
    .section4-sankey-wrapper {
        background: transparent;
        border-radius: 8px;
        padding: 30px;
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
    }
    .section4-chart-title {
        text-align: center;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 2.2rem;
        font-weight: 700;
        color: #E2E8F0;
        margin-bottom: 12px;
        letter-spacing: -0.5px;
        line-height: 1.2;
    }
    .section4-chart-subtitle {
        text-align: center;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: clamp(1rem, 1.8vw, 1.2rem);
        color: #A0AEC0;
        margin-bottom: 12px;
    }

    .section4-chart-instructions {
        margin: 4px 0 14px 0;
        text-align: center;
        font-size: clamp(1rem, 1.8vw, 1.2rem);
        color: #A0AEC0;
        opacity: 0.95;
        margin-bottom: 20px;
    }

    .section4-stats-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
        margin-bottom: 24px;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: clamp(1rem, 1.5vw, 1.1rem);
        color: #A0AEC0;
    }
    .section4-stats-row span {
        padding: 8px 16px;
        border-radius: 999px;
        background: rgba(45, 55, 72, 0.7);
        border: 1px solid rgba(74, 85, 104, 0.5);
    }
    .section4-stats-row strong { font-weight: 600; color: #E2E8F0; }
    #section4-sankey-chart {
        width: 100%;
        aspect-ratio: 13 / 8;
        min-height: 500px;
    }
    #section4-sankey-chart svg {
        display: block;
        width: 100%;
        height: 100%;
    }
    .section4-sankey-link {
        transition: stroke-opacity 0.2s ease, stroke 0.2s ease;
    }
    .section4-sankey-link.link-highlight { stroke-opacity: 0.9 !important; }
    .section4-sankey-link.link-fade { stroke-opacity: 0.06 !important; }
    .section4-region-legend {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        gap: 10px;
        margin-top: 12px;
        margin-bottom: 0;
        padding: 0;
        background: transparent;
        position: relative;
    }
    .section4-region-box {
        padding: 6px 12px;
        border-radius: 4px;
        background: transparent;
        color: #A0AEC0;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
        border: 1px solid rgba(74, 85, 104, 0.6);
        white-space: nowrap;
    }
    .section4-region-box:hover {
        color: #ffffff;
        border-color: transparent;
    }
    .section4-region-tooltip {
        position: fixed;
        background: rgba(26, 32, 44, 0.95);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 14px;
        pointer-events: none;
        z-index: 1000;
        max-width: 360px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(74, 85, 104, 0.5);
        display: none;
    }
    .section4-region-tooltip .region-name {
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 15px;
        color: #63B3ED;
    }
    .section4-region-tooltip .country-list-tooltip {
        font-size: 12px;
        opacity: 0.95;
        line-height: 1.5;
    }
    .section4-layer2-clickable {
    cursor: pointer;
    transition: filter 0.15s ease;
    }
    .section4-layer2-clickable:hover { 
    filter: brightness(1.15); 
    }

    /* Pulse ring animation for Layer 2 nodes */
    .section4-pulse-ring {
    pointer-events: none;
    fill: none;
    stroke: #63B3ED;
    animation: sankeyPulse 2s ease-in-out infinite;
    }

    @keyframes sankeyPulse {
    0%, 100% { 
        stroke-width: 0;
        stroke-opacity: 0.8;
    }
    50% { 
        stroke-width: 16px;
        stroke-opacity: 0;
    }
    }
    
    /* Modal Styles */
    .section4-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    }
    .section4-modal-overlay.active {
        display: flex;
    }
    .section4-modal-card {
        background: #1A202C;
        border-radius: 12px;
        width: 90%;
        max-width: 900px;
        max-height: 85vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        border: 1px solid rgba(74, 85, 104, 0.5);
    }
    .section4-card-header {
        background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
        padding: 30px;
        position: relative;
        border-bottom: 1px solid rgba(74, 85, 104, 0.5);
    }
    .section4-card-header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }
    .section4-card-title-section { flex: 1; padding-right: 20px; }
    .section4-card-title {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 28px;
        font-weight: 700;
        color: #E2E8F0;
        margin: 0 0 8px 0;
        line-height: 1.2;
    }
    .section4-card-description {
        font-family: Georgia, 'Times New Roman', serif;
        color: #A0AEC0;
        font-size: 14px;
        margin: 0;
    }
    .section4-key-stat {
        background: rgba(66, 153, 225, 0.15);
        border: 1px solid rgba(66, 153, 225, 0.3);
        border-radius: 12px;
        padding: 20px 30px;
        text-align: center;
        min-width: 140px;
        margin-right: 60px;
    }
    .section4-key-stat-number {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 48px;
        font-weight: 700;
        color: #63B3ED;
        line-height: 1;
    }
    .section4-key-stat-label {
        font-size: 12px;
        color: #A0AEC0;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 8px;
    }
    .section4-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted, #A0AEC0);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.section4-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: rotate(90deg);
}
    .section4-tab {
        flex: 1;
        padding: 16px 24px;
        background: none;
        border: none;
        color: #A0AEC0;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 3px solid transparent;
    }
    .section4-tab:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; }
    .section4-tab.active {
        color: #63B3ED;
        border-bottom-color: #63B3ED;
        background: rgba(66, 153, 225, 0.1);
    }
    .section4-card-content {
        flex: 1;
        overflow-y: auto;
        padding: 30px;
    }
    .section4-tab-panel { display: none; }
    .section4-tab-panel.active { display: block; }
    .section4-overview-intro {
        background: rgba(66, 153, 225, 0.1);
        border-left: 4px solid #4299E1;
        padding: 20px 24px;
        border-radius: 0 8px 8px 0;
        margin-bottom: 24px;
    }
    .section4-overview-intro p {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 15px;
        line-height: 1.7;
        color: #E2E8F0;
        margin: 0;
    }
    .section4-highlight-box {
        background: #2D3748;
        color: #E2E8F0;
        padding: 20px 24px;
        border-radius: 8px;
        margin-bottom: 28px;
        border: 1px solid rgba(74, 85, 104, 0.5);
    }
    .section4-highlight-box p {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
    }
    .section4-section-title {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 18px;
        font-weight: 700;
        color: #E2E8F0;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid rgba(74, 85, 104, 0.5);
    }
    .section4-region-bar-item { margin-bottom: 16px; }
    .section4-region-bar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .section4-region-bar-name { font-size: 14px; font-weight: 600; color: #E2E8F0; }
    .section4-region-bar-count { font-size: 13px; color: #A0AEC0; }
    .section4-region-bar-track { height: 28px; background: #2D3748; border-radius: 4px; overflow: hidden; }
    .section4-region-bar-fill {
        height: 100%;
        border-radius: 4px;
        display: flex;
        align-items: center;
        padding-left: 12px;
        min-width: 45px;
    }
    .section4-region-bar-percent { font-size: 12px; font-weight: 600; color: white; }
    .section4-accordion-item { border: 1px solid rgba(74, 85, 104, 0.5); border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
    .section4-accordion-header {
        width: 100%;
        padding: 16px 20px;
        background: #2D3748;
        border: none;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: inherit;
        transition: background 0.2s;
        color: #E2E8F0;
    }
    .section4-accordion-header:hover { background: rgba(66, 153, 225, 0.1); }
    .section4-accordion-header-left { display: flex; align-items: center; gap: 12px; }
    .section4-accordion-region { font-size: 15px; font-weight: 600; color: #E2E8F0; }
    .section4-accordion-count { background: #4299E1; color: white; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px; }
    .section4-accordion-icon { font-size: 18px; color: #A0AEC0; transition: transform 0.2s; }
    .section4-accordion-item.open .section4-accordion-icon { transform: rotate(180deg); }
    .section4-accordion-content { display: none; padding: 0 20px 20px; background: #1A202C; }
    .section4-accordion-item.open .section4-accordion-content { display: block; }
    .section4-country-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; padding-top: 16px; border-top: 1px solid rgba(74, 85, 104, 0.5); }
    .section4-country-item { background: #2D3748; padding: 12px 16px; border-radius: 6px; border: 1px solid rgba(74, 85, 104, 0.5); }
    .section4-country-name { font-size: 14px; font-weight: 600; color: #E2E8F0; margin-bottom: 8px; }
    .section4-crime-badges { display: flex; flex-wrap: wrap; gap: 4px; }
    .section4-crime-badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section4-crime-badge.genocide { background: #9B2C2C; color: white; }
    .section4-crime-badge.war-crimes { background: #2B6CB0; color: white; }
    .section4-crime-badge.cah { background: #6B46C1; color: white; }
    .section4-crime-badge.aggression { background: #C05621; color: white; }
    .section4-case-study-title { font-size: 20px; font-weight: 700; color: #E2E8F0; margin-bottom: 20px; line-height: 1.4; }
    .section4-case-study-text { font-size: 15px; line-height: 1.8; color: #E2E8F0; margin-bottom: 24px; }
    .section4-case-study-significance {
        background: rgba(66, 153, 225, 0.1);
        border-left: 4px solid #4299E1;
        padding: 16px 20px;
        border-radius: 0 8px 8px 0;
        margin-bottom: 24px;
    }
    .section4-case-study-significance p { font-size: 14px; font-weight: 600; color: #63B3ED; font-style: italic; margin: 0; }
    .section4-database-links { margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(74, 85, 104, 0.5); }
    .section4-database-links-title { font-size: 13px; font-weight: 600; color: #A0AEC0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .section4-database-link-list { display: flex; flex-wrap: wrap; gap: 12px; }
    .section4-database-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        background: #2D3748;
        border: 1px solid rgba(74, 85, 104, 0.5);
        border-radius: 6px;
        color: #E2E8F0;
        text-decoration: none;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s;
    }
    .section4-database-link:hover { background: #4299E1; border-color: #4299E1; color: white; }
    .section4-database-link svg { width: 14px; height: 14px; }
    .section4-card-footer {
        padding: 20px 30px;
        background: #2D3748;
        border-top: 1px solid rgba(74, 85, 104, 0.5);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .section4-data-source { font-size: 12px; color: #A0AEC0; }
    .section4-data-source a { color: #63B3ED; text-decoration: none; }
    .section4-data-source a:hover { text-decoration: underline; }
    @media (max-width: 1200px) {
        .section4-region-legend { flex-wrap: wrap; }
    }
    @media (max-width: 768px) {
        .section4-card-header-content { flex-direction: column; }
        .section4-key-stat { margin: 16px 0 0 0; }
        .section4-card-title-section { padding-right: 50px; }
        .section4-card-footer { flex-direction: column; gap: 16px; text-align: center; }
        .section4-chart-title { font-size: 1.5rem; }
        .section4-region-legend { flex-wrap: wrap; gap: 6px; }
        .section4-region-box { font-size: 10px; padding: 4px 8px; }
    }
    `;
    
    var styleEl = document.createElement('style');
    styleEl.id = 'section4-sankey-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    Section4SankeyState.stylesInjected = true;
}

    function injectSection4Modal() {
    if (Section4SankeyState.modalInjected) return;
    if (document.getElementById('section4-modal-overlay')) {
        Section4SankeyState.modalInjected = true;
        return;
    }
    
    var modalHtml = `
    <div id="section4-modal-overlay" class="section4-modal-overlay">
        <div class="section4-modal-card">
            <div class="section4-card-header">
                <div class="section4-card-header-content">
                    <div class="section4-card-title-section">
                        <h1 class="section4-card-title" id="section4-modal-title">Jurisdiction Type</h1>
                        <p class="section4-card-description" id="section4-modal-description">Description</p>
                    </div>
                    <div class="section4-key-stat">
                        <div class="section4-key-stat-number" id="section4-modal-count">0</div>
                        <div class="section4-key-stat-label">UN Member States</div>
                    </div>
                </div>
                <button class="section4-close-btn" aria-label="Close" onclick="closeSection4Modal()">&times;</button>
            </div>
            <div class="section4-tabs">
                <button class="section4-tab active" onclick="switchSection4Tab('overview', this)">Overview</button>
                <button class="section4-tab" onclick="switchSection4Tab('countries', this)">Countries</button>
                <button class="section4-tab" onclick="switchSection4Tab('case-study', this)">Case Study</button>
            </div>
            <div class="section4-card-content">
                <div id="section4-overview" class="section4-tab-panel active">
                    <div class="section4-overview-intro">
                        <p id="section4-modal-overview-text">Overview text</p>
                    </div>
                    <div class="section4-highlight-box">
                        <p id="section4-modal-highlight-text">Highlight</p>
                    </div>
                    <h3 class="section4-section-title">Regional Distribution</h3>
                    <div id="section4-regional-breakdown"></div>
                </div>
                <div id="section4-countries" class="section4-tab-panel">
                    <div id="section4-countries-accordion"></div>
                </div>
                <div id="section4-case-study" class="section4-tab-panel">
                    <h2 class="section4-case-study-title" id="section4-case-study-title">Case Study</h2>
                    <p class="section4-case-study-text" id="section4-case-study-text">Text</p>
                    <div class="section4-case-study-significance">
                        <p id="section4-case-study-significance">Significance</p>
                    </div>
                    <div class="section4-database-links">
                        <div class="section4-database-links-title">Database Links</div>
                        <div class="section4-database-link-list" id="section4-database-links"></div>
                    </div>
                </div>
            </div>
            <div class="section4-card-footer">
                <div class="section4-data-source">
                    Data source: <a href="https://projectmeridian.org/" target="_blank">Project Meridian</a>
                </div>
                <a href="https://projectmeridian.org/" target="_blank" class="section4-explore-link">
        Explore the Global Mapping Tool →
    </a>
            </div>
        </div>
    </div>
    <div id="section4-region-tooltip" class="section4-region-tooltip" style="display:none;"></div>
    `;
    
    var container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container);
    
    document.getElementById('section4-modal-overlay').addEventListener('click', function(e) {
        if (e.target.id === 'section4-modal-overlay') closeSection4Modal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSection4Modal();
    });
    
    Section4SankeyState.modalInjected = true;
}

function openSection4Modal(jurisdictionType, count) {
    var info = SECTION4_CONFIG.jurisdictionInfo[jurisdictionType];
    if (!info) return;
    
    document.getElementById('section4-modal-title').textContent = info.title;
    document.getElementById('section4-modal-description').textContent = info.description;
    document.getElementById('section4-modal-count').textContent = count;
    document.getElementById('section4-modal-overview-text').innerHTML = info.overview;
    document.getElementById('section4-modal-highlight-text').innerHTML = info.highlight;
    
    var countries = getSection4CountriesForJurisdiction(jurisdictionType);
    renderSection4RegionalBreakdown(countries, count);
    renderSection4CountriesAccordion(countries);
    
    // Handle case study tab
    var caseStudyTab = document.querySelector('.section4-tab:nth-child(3)');
    
    if (info.caseStudy && info.caseStudy.title) {
        // Enable case study tab
        caseStudyTab.disabled = false;
        caseStudyTab.style.opacity = '1';
        caseStudyTab.style.cursor = 'pointer';
        
        document.getElementById('section4-case-study-title').textContent = info.caseStudy.title;
        document.getElementById('section4-case-study-text').innerHTML = info.caseStudy.text;
        document.getElementById('section4-case-study-significance').textContent = info.caseStudy.significance;
        
        var linksContainer = document.getElementById('section4-database-links');
        linksContainer.innerHTML = info.caseStudy.links.map(function(link) {
            return '<a href="' + link.url + '" target="_blank" class="section4-database-link">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>' +
                '<polyline points="15 3 21 3 21 9"></polyline>' +
                '<line x1="10" y1="14" x2="21" y2="3"></line>' +
                '</svg>' + link.name + '</a>';
        }).join('');
        } else {
        // Disable case study tab for jurisdiction types without case studies
        caseStudyTab.disabled = true;
        caseStudyTab.style.opacity = '0.4';
        caseStudyTab.style.cursor = 'not-allowed';
        
        document.getElementById('section4-case-study-title').textContent = 'No Case Study Available';
        document.getElementById('section4-case-study-text').innerHTML = '<p>There has not been a core international crimes conviction based on this type of jurisdiction to date.</p>';
        document.getElementById('section4-case-study-significance').textContent = '';
        document.getElementById('section4-database-links').innerHTML = '';
    }
    
    switchSection4Tab('overview', document.querySelector('.section4-tab'));
    document.getElementById('section4-modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';

    if (typeof PlaceholderFiller !== 'undefined' && PlaceholderFiller.stats) {
        PlaceholderFiller.fillAllPlaceholders(PlaceholderFiller.stats);
    }
    
}

function closeSection4Modal() {
    document.getElementById('section4-modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
}
    window.closeSection4Modal = closeSection4Modal;

function switchSection4Tab(tabId, button) {
    document.querySelectorAll('.section4-tab-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.section4-tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById('section4-' + tabId).classList.add('active');
    button.classList.add('active');
}
    window.switchSection4Tab = switchSection4Tab;

function toggleSection4Accordion(header) {
    header.parentElement.classList.toggle('open');
}
    window.toggleSection4Accordion = toggleSection4Accordion;

function getSection4CountriesForJurisdiction(jurisdictionType) {
    var propMap = {
        'Absolute UJ': 'hasAbsoluteUJ',
        'Presence-based': 'hasPresence',
        'Active Personality': 'hasActive',
        'Passive Personality': 'hasPassive',
        'Protective Principle': 'hasProtective',
        'Treaty Obligations': 'hasTreaty'
    };
    
    var prop = propMap[jurisdictionType];
    if (!prop || !Section4SankeyState.processedData) return [];
    
    return Section4SankeyState.processedData.enrichedStates
        .filter(function(s) { return s[prop]; })
        .map(function(s) {
            return { country: s.country, region: s.region, crimes: s.crimes || [] };
        });
}

function renderSection4RegionalBreakdown(countries, total) {
    var regionCounts = {};
    countries.forEach(function(c) {
        regionCounts[c.region] = (regionCounts[c.region] || 0) + 1;
    });
    
    var sorted = Object.entries(regionCounts).sort(function(a, b) { return b[1] - a[1]; });
    var maxCount = sorted.length > 0 ? sorted[0][1] : 1;
    var colors = ['#4299E1', '#3182CE', '#2B6CB0', '#2C5282', '#1A365D'];
    
    var container = document.getElementById('section4-regional-breakdown');
    container.innerHTML = sorted.map(function(item, i) {
        var region = item[0], count = item[1];
        var pct = ((count / total) * 100).toFixed(1);
        var widthPct = (count / maxCount) * 100;
        var color = colors[Math.min(i, colors.length - 1)];
        
        return '<div class="section4-region-bar-item">' +
            '<div class="section4-region-bar-header">' +
            '<span class="section4-region-bar-name">' + region + '</span>' +
            '<span class="section4-region-bar-count">' + count + ' ' + (count === 1 ? 'country' : 'countries') + '</span>' +
            '</div>' +
            '<div class="section4-region-bar-track">' +
            '<div class="section4-region-bar-fill" style="width: ' + widthPct + '%; background: ' + color + ';">' +
            '<span class="section4-region-bar-percent">' + pct + '%</span>' +
            '</div></div></div>';
    }).join('');
}

function renderSection4CountriesAccordion(countries) {
    var byRegion = {};
    countries.forEach(function(c) {
        if (!byRegion[c.region]) byRegion[c.region] = [];
        byRegion[c.region].push(c);
    });
    
    var sortedRegions = Object.entries(byRegion).sort(function(a, b) { return b[1].length - a[1].length; });
    
    var container = document.getElementById('section4-countries-accordion');
    container.innerHTML = sortedRegions.map(function(item) {
        var region = item[0], regionCountries = item[1];
        var countryItems = regionCountries.sort(function(a, b) { return a.country.localeCompare(b.country); })
            .map(function(c) {
                var badges = c.crimes.map(function(crime) {
                    var cls = 'section4-crime-badge ' + crime;
                    var labels = { 'genocide': 'Genocide', 'war-crimes': 'War Crimes', 'cah': 'CAH', 'aggression': 'Aggression' };
                    return '<span class="' + cls + '">' + (labels[crime] || crime) + '</span>';
                }).join('');
                return '<div class="section4-country-item">' +
                    '<div class="section4-country-name">' + c.country + '</div>' +
                    '<div class="section4-crime-badges">' + badges + '</div></div>';
            }).join('');
        
        return '<div class="section4-accordion-item">' +
            '<button class="section4-accordion-header" onclick="toggleSection4Accordion(this)">' +
            '<div class="section4-accordion-header-left">' +
            '<span class="section4-accordion-region">' + region + '</span>' +
            '<span class="section4-accordion-count">' + regionCountries.length + '</span></div>' +
            '<span class="section4-accordion-icon">▼</span></button>' +
            '<div class="section4-accordion-content">' +
            '<div class="section4-country-list">' + countryItems + '</div></div></div>';
    }).join('');
}

function buildSection4SankeyData(processed) {
    var stats = processed.stats;
    var states = processed.enrichedStates;
    
    var withJurisdiction = states.filter(function(s) { return s.hasBeyondBorders && s.typeCount > 0; })
        .sort(function(a, b) { return a.country.localeCompare(b.country); });
    var withoutJurisdiction = states.filter(function(s) { return !s.hasBeyondBorders; })
        .sort(function(a, b) { return a.country.localeCompare(b.country); });
    
    var nodes = [];
    var links = [];
    
    var IDX_ALL = 0;
    nodes.push({ name: 'All UN Member States', layer: 0, displayValue: stats.total, isLayer0: true });
    
    var WITHOUT_START = nodes.length;
    withoutJurisdiction.forEach(function(state) {
        nodes.push({
            name: 'without_' + state.country, layer: 1, country: state.country, region: state.region,
            isCountryNode: true, isWithoutJurisdiction: true
        });
    });
    
    var WITH_START = nodes.length;
    withJurisdiction.forEach(function(state) {
        nodes.push({
            name: 'with_' + state.country, layer: 1, country: state.country, region: state.region,
            isCountryNode: true, isWithJurisdiction: true, typeCount: state.typeCount,
            hasAbsoluteUJ: state.hasAbsoluteUJ, hasPresence: state.hasPresence, hasActive: state.hasActive,
            hasPassive: state.hasPassive, hasProtective: state.hasProtective, hasTreaty: state.hasTreaty
        });
    });
    
    var IDX_ABS = nodes.length;
    nodes.push({ name: 'Absolute UJ', layer: 2, displayValue: stats.absoluteUJ, isLayer2: true });
    var IDX_PRES = nodes.length;
    nodes.push({ name: 'Presence-based', layer: 2, displayValue: stats.presenceOnly, isLayer2: true });
    var IDX_ACTIVE = nodes.length;
    nodes.push({ name: 'Active Personality', layer: 2, displayValue: stats.activePersonality, isLayer2: true });
    var IDX_PASSIVE = nodes.length;
    nodes.push({ name: 'Passive Personality', layer: 2, displayValue: stats.passivePersonality, isLayer2: true });
    var IDX_PROT = nodes.length;
    nodes.push({ name: 'Protective Principle', layer: 2, displayValue: stats.protectivePrinciple, isLayer2: true });
    var IDX_TREATY = nodes.length;
    nodes.push({ name: 'Treaty Obligations', layer: 2, displayValue: stats.treatyObligation, isLayer2: true });
    
    withoutJurisdiction.forEach(function(state, i) {
        links.push({ source: IDX_ALL, target: WITHOUT_START + i, value: 1, country: state.country, region: state.region, linkType: 'without' });
    });
    
    withJurisdiction.forEach(function(state, i) {
        links.push({ source: IDX_ALL, target: WITH_START + i, value: 1, country: state.country, region: state.region, linkType: 'with' });
    });
    
    var typeMap = [
        ['hasAbsoluteUJ', IDX_ABS, 'Absolute UJ'],
        ['hasPresence', IDX_PRES, 'Presence-based'],
        ['hasActive', IDX_ACTIVE, 'Active Personality'],
        ['hasPassive', IDX_PASSIVE, 'Passive Personality'],
        ['hasProtective', IDX_PROT, 'Protective Principle'],
        ['hasTreaty', IDX_TREATY, 'Treaty Obligations']
    ];
    
    withJurisdiction.forEach(function(state, i) {
        var nodeIdx = WITH_START + i;
        var v = 1 / state.typeCount;
        typeMap.forEach(function(tm) {
            if (state[tm[0]]) {
                links.push({ source: nodeIdx, target: tm[1], value: v, country: state.country, region: state.region, linkType: 'jurisdiction', jurisdictionType: tm[2] });
            }
        });
    });
    
    return { nodes: nodes, links: links, withStart: WITH_START, withoutStart: WITHOUT_START, withCount: withJurisdiction.length, withoutCount: withoutJurisdiction.length };
}

function createSection4LinkGradients(defs, links) {
    var nc = SECTION4_CONFIG.nodeColors;
    links.forEach(function(link, i) {
        var gradientId = 'section4-link-gradient-' + i;
        link.gradientId = gradientId;
        var startColor, endColor;
        if (link.linkType === 'without') { startColor = nc.layer0; endColor = nc.withoutJurisdiction; }
        else if (link.linkType === 'with') { startColor = nc.layer0; endColor = nc.withJurisdiction; }
        else { startColor = nc.withJurisdiction; endColor = nc.layer2; }
        
        var lg = defs.append('linearGradient').attr('id', gradientId)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', link.source.x1).attr('x2', link.target.x0);
        lg.append('stop').attr('offset', '0%').attr('stop-color', startColor);
        lg.append('stop').attr('offset', '100%').attr('stop-color', endColor);
    });
}

function renderSection4Links(container, links) {
    container.selectAll('path').data(links).enter().append('path')
        .attr('class', function(d) {
            var cls = 'section4-sankey-link';
            cls += ' region-' + (d.region || 'none').replace(/\s+/g, '-').replace(/&/g, 'and');
            if (d.jurisdictionType) cls += ' jtype-' + d.jurisdictionType.replace(/\s+/g, '-');
            return cls;
        })
        .attr('d', d3.sankeyLinkHorizontal())
        .attr('stroke', function(d) { return 'url(#' + d.gradientId + ')'; })
        .attr('stroke-width', function(d) { return Math.max(1, d.width); })
        .attr('fill', 'none').attr('stroke-opacity', 0.55)
        .attr('data-region', function(d) { return d.region || ''; })
        .attr('data-country', function(d) { return d.country || ''; });
}

function renderSection4Layer0(container, node, fonts, vbW, vbH) {
    if (!node) return;
    var g = container.append('g').attr('transform', 'translate(' + node.x0 + ',' + node.y0 + ')');
    var w = node.x1 - node.x0, h = node.y1 - node.y0;
    
    g.append('rect').attr('width', w).attr('height', h)
        .attr('fill', SECTION4_CONFIG.nodeColors.layer0).attr('stroke', '#4A5568').attr('stroke-width', 1).attr('rx', 3);
    g.append('text').attr('x', w / 2).attr('y', h / 2).attr('dy', '0.35em')
        .attr('text-anchor', 'middle').attr('fill', '#E2E8F0').attr('font-weight', '700').attr('font-size', fonts.large)
        .attr('font-family', CHART_FONTS.body)
        .text(node.displayValue);
    g.append('text').attr('x', -vbW * 0.009).attr('y', h / 2 - vbH * 0.012).attr('text-anchor', 'end')
        .attr('fill', '#A0AEC0').attr('font-size', fonts.small).attr('font-weight', '500')
        .attr('font-family', CHART_FONTS.body).text('All');
    g.append('text').attr('x', -vbW * 0.009).attr('y', h / 2 + vbH * 0.012).attr('text-anchor', 'end')
        .attr('fill', '#A0AEC0').attr('font-size', fonts.small).attr('font-weight', '500')
        .attr('font-family', CHART_FONTS.body).text('UN Member States');
}

function renderSection4Layer1Overlays(container, nodes, stats, fonts, vbW, vbH) {
    var withoutNodes = nodes.filter(function(n) { return n.isWithoutJurisdiction; });
    if (withoutNodes.length) {
        var minY = d3.min(withoutNodes, function(n) { return n.y0; });
        var maxY = d3.max(withoutNodes, function(n) { return n.y1; });
        var x0 = withoutNodes[0].x0, x1 = withoutNodes[0].x1;
        
        container.append('rect').attr('x', x0).attr('y', minY).attr('width', x1 - x0).attr('height', maxY - minY)
            .attr('fill', SECTION4_CONFIG.nodeColors.withoutJurisdiction).attr('stroke', '#4A5568').attr('stroke-width', 1).attr('rx', 3).lower();
        container.append('text').attr('x', x0 + (x1 - x0) / 2).attr('y', minY + (maxY - minY) / 2).attr('dy', '0.35em')
            .attr('text-anchor', 'middle').attr('fill', '#E2E8F0').attr('font-weight', '700').attr('font-size', fonts.large)
            .attr('font-family', CHART_FONTS.body)
            .text(stats.total - stats.beyondBorders);
        container.append('text').attr('x', x0 + (x1 - x0) / 2).attr('y', minY - vbH * 0.025).attr('text-anchor', 'middle')
            .attr('fill', '#A0AEC0').attr('font-size', fonts.small).attr('font-weight', '500')
            .attr('font-family', CHART_FONTS.body).text('UN Member States Without Jurisdiction');
    }
    
    var withNodes = nodes.filter(function(n) { return n.isWithJurisdiction; });
    if (withNodes.length) {
        var minY = d3.min(withNodes, function(n) { return n.y0; });
        var maxY = d3.max(withNodes, function(n) { return n.y1; });
        var x0 = withNodes[0].x0, x1 = withNodes[0].x1;
        
        container.append('rect').attr('x', x0).attr('y', minY).attr('width', x1 - x0).attr('height', maxY - minY)
            .attr('fill', SECTION4_CONFIG.nodeColors.withJurisdiction).attr('stroke', '#4A5568').attr('stroke-width', 1).attr('rx', 3).lower();
        container.append('text').attr('x', x0 + (x1 - x0) / 2).attr('y', minY + (maxY - minY) / 2).attr('dy', '0.35em')
            .attr('text-anchor', 'middle').attr('fill', '#E2E8F0').attr('font-weight', '700').attr('font-size', fonts.large)
            .attr('font-family', CHART_FONTS.body)
            .text(stats.beyondBorders);
        container.append('text').attr('x', x0 + (x1 - x0) / 2).attr('y', maxY + vbH * 0.028).attr('text-anchor', 'middle')
            .attr('fill', '#A0AEC0').attr('font-size', fonts.small).attr('font-weight', '500')
            .attr('font-family', CHART_FONTS.body).text('UN Member States With Jurisdiction');
    }
}

function renderSection4Layer2(container, nodes, fonts, l2BoxW, vbW, vbH) {
    nodes.forEach(function(node) {
        var nodeHeight = node.y1 - node.y0;
        var boxHeight = Math.max(nodeHeight, vbH * 0.043);
        var boxY = node.y0 + (nodeHeight - boxHeight) / 2;
        
        var g = container.append('g').attr('class', 'section4-layer2-clickable')
            .attr('transform', 'translate(' + node.x0 + ',' + boxY + ')').attr('data-jurisdiction', node.name);
        // Pulse ring (behind the box)
        g.append('rect').attr('class', 'section4-pulse-ring').attr('width', l2BoxW).attr('height', boxHeight).attr('rx', 4);
        // Main box (on top)    
        g.append('rect').attr('width', l2BoxW).attr('height', boxHeight)
            .attr('fill', SECTION4_CONFIG.nodeColors.layer2).attr('stroke', '#4A5568').attr('stroke-width', 1).attr('rx', 4);
        g.append('text').attr('x', vbW * 0.016).attr('y', boxHeight / 2).attr('dy', '0.35em')
            .attr('text-anchor', 'middle').attr('fill', '#E2E8F0').attr('font-weight', '700').attr('font-size', fonts.base)
            .attr('font-family', CHART_FONTS.body)
            .text(node.displayValue);
        g.append('text').attr('x', vbW * 0.036).attr('y', boxHeight / 2).attr('dy', '0.35em')
            .attr('text-anchor', 'start').attr('fill', '#E2E8F0').attr('font-size', fonts.label).attr('font-weight', '500')
            .attr('font-family', CHART_FONTS.body)
            .text(node.name);
        
        g.on('mouseenter', function() { highlightSection4JurisdictionLinks(node.name, true); })
         .on('mouseleave', function() { highlightSection4JurisdictionLinks(node.name, false); })
         .on('click', function() { openSection4Modal(node.name, node.displayValue); });
    });
}

function highlightSection4JurisdictionLinks(jurisdictionType, highlight) {
    if (!Section4SankeyState.linkGroup || !Section4SankeyState.graphData) return;
    
    var connectedCountries = new Set();
    Section4SankeyState.graphData.links.forEach(function(link) {
        if (link.jurisdictionType === jurisdictionType) connectedCountries.add(link.country);
    });
    
    Section4SankeyState.linkGroup.selectAll('path').each(function(link) {
        var el = d3.select(this);
        var isConnected = link.jurisdictionType === jurisdictionType ||
            (link.linkType === 'with' && connectedCountries.has(link.country));
        
        if (highlight) {
            el.classed('link-highlight', isConnected).classed('link-fade', !isConnected);
            if (isConnected) el.attr('stroke', SECTION4_CONFIG.nodeColors.layer2);
        } else {
            el.classed('link-highlight', false).classed('link-fade', false);
            el.attr('stroke', 'url(#' + link.gradientId + ')');
        }
    });
}

function highlightSection4RegionLinks(region, highlight) {
  if (!Section4SankeyState.linkGroup) return;

  Section4SankeyState.linkGroup.selectAll('path').each(function(link) {
    var el = d3.select(this);
    var isMatch = link.region === region;

    // base width (same logic used when rendering: Math.max(1, d.width))
    var baseW = Math.max(1, link.width || 1);

    if (highlight) {
      el.classed('link-highlight', isMatch)
        .classed('link-fade', link.region && !isMatch);

      if (isMatch) {
        // Subtle bump + hard cap (enhancing visibility without overly distorting)
        var highlightW = Math.min(baseW * 1.5, baseW + 0.6, 3);

        el.attr('stroke', SECTION4_CONFIG.regionColors[region])
          .attr('stroke-width', highlightW);
      }
    } else {
      el.classed('link-highlight', false).classed('link-fade', false);
      el.attr('stroke', 'url(#' + link.gradientId + ')')
        .attr('stroke-width', baseW); // reset cleanly
    }
  });
}



function renderSection4RegionLegend(legendEl) {
    var tooltip = document.getElementById('section4-region-tooltip');
    
    SECTION4_CONFIG.regionOrder.forEach(function(region) {
        var box = document.createElement('div');
        box.className = 'section4-region-box';
        box.textContent = region;
        box.dataset.region = region;
        
        box.addEventListener('mouseenter', function(e) {
            box.style.backgroundColor = SECTION4_CONFIG.regionColors[region];
            highlightSection4RegionLinks(region, true);
            if (tooltip) showSection4RegionTooltip(tooltip, region, e);
        });
        box.addEventListener('mousemove', function(e) {
            if (tooltip) positionSection4Tooltip(tooltip, e);
        });
        box.addEventListener('mouseleave', function() {
            box.style.backgroundColor = '';
            highlightSection4RegionLinks(region, false);
            if (tooltip) tooltip.style.display = 'none';
        });
        
        legendEl.appendChild(box);
    });
}

function showSection4RegionTooltip(tooltip, region, e) {
    var info = Section4SankeyState.regionData[region];
    if (!info) return;
    
    var html = '<div class="region-name">' + region + '</div><div class="country-list-tooltip">';
    if (info.withJurisdiction && info.withJurisdiction.length > 0) {
        html += '<strong>With Jurisdiction (' + info.withJurisdiction.length + '):</strong> ' + info.withJurisdiction.join(', ') + '<br/>';
    }
    if (info.withoutJurisdiction && info.withoutJurisdiction.length > 0) {
        html += '<strong>Without Jurisdiction (' + info.withoutJurisdiction.length + '):</strong> ' + info.withoutJurisdiction.join(', ');
    }
    html += '</div>';
    
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    positionSection4Tooltip(tooltip, e);
}

function positionSection4Tooltip(tooltip, e) {
    var tooltipHeight = tooltip.offsetHeight || 150;
    tooltip.style.left = (e.clientX - 100) + 'px';
    tooltip.style.top = (e.clientY - tooltipHeight - 15) + 'px';
}

function renderSection4Sankey(containerEl, sankeyData, stats) {
    containerEl.innerHTML = '';
    
    var vbW = SECTION4_CONFIG.viewBox.w;
    var vbH = SECTION4_CONFIG.viewBox.h;
    
    var m = {
        l: vbW * SECTION4_CONFIG.margin.l,
        r: vbW * SECTION4_CONFIG.margin.r,
        t: vbH * SECTION4_CONFIG.margin.t,
        b: vbH * SECTION4_CONFIG.margin.b
    };
    var innerW = vbW - m.l - m.r;
    var innerH = vbH - m.t - m.b;
    var nodeW = vbW * SECTION4_CONFIG.nodeW;
    var nodePad = vbH * SECTION4_CONFIG.nodePad;
    var l2BoxW = vbW * SECTION4_CONFIG.l2BoxW;
    var l2Pad = vbH * SECTION4_CONFIG.l2Pad;
    var l1Gap = vbH * SECTION4_CONFIG.l1Gap;
    
    var fontL = vbW * 0.014;
    var fontM = vbW * 0.012;
    var fontS = vbW * 0.011;
    
    var fonts = {
        large: fontL + 'px',
        base: fontM + 'px',
        small: fontS + 'px',
        label: fontS + 'px'
    };
    
    SECTION4_CONFIG._l2BoxW = l2BoxW;
    SECTION4_CONFIG._vbW = vbW;
    SECTION4_CONFIG._vbH = vbH;
    
    var svg = d3.select(containerEl).append('svg')
        .attr('viewBox', '0 0 ' + vbW + ' ' + vbH)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('font-family', CHART_FONTS.body);
    
    var defs = svg.append('defs');
    var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');
    
    var sankey = d3.sankey().nodeWidth(nodeW).nodePadding(nodePad)
        .nodeAlign(function(d) { return d.layer; })
        .extent([[0, 0], [innerW, innerH]]);
    
    var graph = sankey({
        nodes: sankeyData.nodes.map(function(d) { return Object.assign({}, d); }),
        links: sankeyData.links.map(function(d) { return Object.assign({}, d); })
    });
    
    Section4SankeyState.graphData = graph;
    
    var withoutNodes = graph.nodes.filter(function(n) { return n.isWithoutJurisdiction; });
    var withNodes = graph.nodes.filter(function(n) { return n.isWithJurisdiction; });
    
    if (withoutNodes.length && withNodes.length) {
        var overlap = d3.max(withoutNodes, function(n) { return n.y1; }) - d3.min(withNodes, function(n) { return n.y0; }) + l1Gap;
        if (overlap > 0) {
            withNodes.forEach(function(n) { n.y0 += overlap; n.y1 += overlap; });
            var maxY = d3.max(withNodes, function(n) { return n.y1; });
            if (maxY > innerH) {
                var scale = innerH / maxY;
                graph.nodes.filter(function(n) { return n.layer === 1; }).forEach(function(n) { n.y0 *= scale; n.y1 *= scale; });
            }
        }
    }
    
    var l2Nodes = graph.nodes.filter(function(n) { return n.isLayer2; }).sort(function(a, b) { return a.y0 - b.y0; });
    var totalH = l2Nodes.reduce(function(s, n) { return s + n.y1 - n.y0; }, 0) + (l2Nodes.length - 1) * l2Pad;
    var startY = Math.max(0, (innerH - totalH) / 2);
    l2Nodes.forEach(function(n) { 
        var h = n.y1 - n.y0; 
        n.y0 = startY; 
        n.y1 = startY + h; 
        startY += h + l2Pad; 
    });
    
    sankey.update(graph);
    
    createSection4LinkGradients(defs, graph.links);
    
    Section4SankeyState.linkGroup = g.append('g').attr('class', 'links');
    renderSection4Links(Section4SankeyState.linkGroup, graph.links);
    
    var nodeGroup = g.append('g').attr('class', 'nodes');
    renderSection4Layer0(nodeGroup, graph.nodes.find(function(n) { return n.isLayer0; }), fonts, vbW, vbH);
    renderSection4Layer1Overlays(nodeGroup, graph.nodes, stats, fonts, vbW, vbH);
    renderSection4Layer2(nodeGroup, l2Nodes, fonts, l2BoxW, vbW, vbH);
}

function createChart_Section4A(containerId) {
    console.log('[Charts] Rendering Section 4A - Jurisdiction Sankey');
    
    injectSection4Styles();
    injectSection4Modal();
    
    var container = document.getElementById(containerId);
    if (!container) {
        console.warn('[Charts] Container not found:', containerId);
        return;
    }
    container.innerHTML = '';
    
    var records = null;
    if (typeof DataLoader !== 'undefined' && DataLoader._cache && DataLoader._cache.airtable) {
        records = DataLoader._cache.airtable;
    } else if (typeof window.DATA_PRELOAD !== 'undefined' && window.DATA_PRELOAD) {
        records = window.DATA_PRELOAD;
    }
    
    if (!records || !records.length) {
        console.warn('[Charts] No data available for Section 4A');
        container.innerHTML = '<div style="color: #A0AEC0; text-align: center; padding: 40px; font-family: Georgia, serif;">Loading data...</div>';
        return;
    }
    
    if (typeof DataCounterHub === 'undefined' || !DataCounterHub.getJurisdictionSankeyData) {
        console.warn('[Charts] DataCounterHub.getJurisdictionSankeyData not available');
        container.innerHTML = '<div style="color: #A0AEC0; text-align: center; padding: 40px; font-family: Georgia, serif;">Data processing unavailable</div>';
        return;
    }
    
    var processed = DataCounterHub.getJurisdictionSankeyData(records);
    Section4SankeyState.processedData = processed;
    Section4SankeyState.regionData = processed.regionData;
    
    var stats = processed.stats;
    
    var wrapper = document.createElement('div');
    wrapper.className = 'section4-sankey-wrapper';
    
    var title = document.createElement('h3');
    title.className = 'section4-chart-title';
    title.textContent = 'Legal Ability to Investigate and Prosecute Extraterritorial Crimes';
    wrapper.appendChild(title);
    
    var subtitle = document.createElement('p');
    subtitle.className = 'section4-chart-subtitle';
    subtitle.textContent = 'How UN Member States exercise legal authority over international crimes committed abroad.'
    wrapper.appendChild(subtitle);
    
    var instructions = document.createElement('p');
    instructions.className = 'section4-chart-instructions';
    instructions.textContent = 'Click on jurisdiction types to explore in detail. Hover over regions to highlight flows.';
    wrapper.appendChild(instructions);

    var statsRow = document.createElement('div');
    statsRow.className = 'section4-stats-row';
    statsRow.innerHTML = '<span>Total UN Member States: <strong>' + stats.total + '</strong></span>' +
        '<span>With Jurisdiction: <strong>' + stats.beyondBorders + '</strong></span>' +
        '<span>Without Jurisdiction: <strong>' + (stats.total - stats.beyondBorders) + '</strong></span>';
    wrapper.appendChild(statsRow);
    
    var chartContainer = document.createElement('div');
    chartContainer.id = 'section4-sankey-chart';
    wrapper.appendChild(chartContainer);
    
    var legendEl = document.createElement('div');
    legendEl.className = 'section4-region-legend';
    wrapper.appendChild(legendEl);
    
    container.appendChild(wrapper);
    
    var sankeyData = buildSection4SankeyData(processed);
    renderSection4Sankey(chartContainer, sankeyData, stats);
    renderSection4RegionLegend(legendEl);
    
    console.log('[Charts] Section 4A rendered successfully');
}


/* ===============================================
   SECTION 5A: UJ/ETJ PACKED BUBBLE CHART
   =============================================== */
function createChart_Section5A(containerId) {
    console.log('[Charts] Rendering Section 5A - UJ/ETJ Packed Bubble Chart');
    
    var container = d3.select('#' + containerId);
    if (container.empty()) {
        console.warn('[Charts] Container not found:', containerId);
        return;
    }
    container.selectAll("*").remove();
    container.style("overflow", "visible");  // Prevent clipping
    
    // =====================================================
    // SECTION 5A SIZE CONTROLS
    // =====================================================
    var bubbleAreaWidth = 750;  // Width for bubble pack area (increased)
    var legendWidth = 250;      // Width reserved for legend (increased for text)
    var width = bubbleAreaWidth + legendWidth;  // Total = 1000
    var height = 650;           // Total SVG height (increased)
    // =====================================================
    
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
            .style("font-family", CHART_FONTS.body)
            .style("font-size", "18px")
            .text("Loading data...");
        return;
    }
    
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
            .style("font-family", CHART_FONTS.body)
            .text("No data available");
        return;
    }
    
    var CASE_EXP = 0.6;
    
    var root = d3.hierarchy(hierarchyData)
        .sum(function(d) {
            if (d.children) return 0;
            if (d.hasCase) {
                var c = d.cases || 1;
                return Math.pow(c, CASE_EXP);
            }
            return 0.25;
        })
        .sort(function(a, b) {
            return (b.value || 0) - (a.value || 0);
        });
    
    var pack = d3.pack()
        .size([bubbleAreaWidth - 40, height - 100])  // Leave margins for bubbles
        .padding(12);
    
    pack(root);
    
    var regionNodes = root.children || [];
    var countryNodes = root.leaves();
    
    regionNodes.forEach(function(regionNode) {
        var children = regionNode.children || [];
        if (!children.length) return;
        
        var centerX = regionNode.x;
        var centerY = regionNode.y;
        
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
                return d.r * scale + 2;
            }))
            .stop();
        
        for (var i = 0; i < 180; ++i) {
            sim.tick();
            
            var maxRegionR = regionNode.r - 6;
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
    
    var color = d3.scaleOrdinal(regions, d3.schemeTableau10);
    var offsetY = 40;
    
    // Create wrapper - centered with max-width
    var wrapper = container.append("div")
        .style("width", "100%")
        .style("max-width", width + "px")
        .style("margin", "0 auto")
        .style("overflow", "visible");  // Prevent clipping
    
    var svg = wrapper.append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto")
        .style("overflow", "visible")  // Prevent text clipping
        .attr("font-family", CHART_FONTS.body);
    
    // Title - centered over entire chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("font-size", CHART_FONT_SIZES.title)
        .attr("font-weight", 600)
        .attr("font-family", CHART_FONTS.title)
        .attr("fill", "#E2E8F0")
        .text("Investigations and Prosecutions of Serious International Crimes");
    
    // Subtitle - centered over entire chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 60)
        .attr("text-anchor", "middle")
        .attr("font-size", CHART_FONT_SIZES.subtitle)
        .attr("font-family", CHART_FONTS.body)
        .attr("fill", "#A0AEC0")
        .text(stats.statesWithCases + " UN Member States have launched a criminal case involving international crimes committed outside their borders.");
    
    var g = svg.append("g")
        .attr("transform", "translate(20, 75)");  // Position bubbles below title/subtitle
    
    var regionG = g.selectAll("g.region")
        .data(regionNodes)
        .join("g")
        .attr("class", "region");
    
    regionG.append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.r; })
        .attr("fill", function(d) { return color(d.data.name); })
        .attr("fill-opacity", 0.08)
        .attr("stroke", function(d) { return color(d.data.name); })
        .attr("stroke-width", 1.5);
    
    regionG.append("text")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y + d.r + 24; })
        .attr("text-anchor", "middle")
        .attr("font-size", CHART_FONT_SIZES.label)
        .attr("font-weight", 600)
        .attr("font-family", CHART_FONTS.label)
        .attr("stroke", "#1A202C")
        .attr("stroke-width", 3)
        .attr("paint-order", "stroke")
        .attr("fill", "#F7FAFC")
        .text(function(d) { return d.data.name; });
    
    var countryG = g.selectAll("g.country")
        .data(countryNodes)
        .join("g")
        .attr("class", "country");
    
    countryG.append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.r * (d.data.hasCase ? 1 : 0.55); })
        .attr("fill", function(d) {
            var base = d3.color(color(d.data.regionPretty));
            base.opacity = d.data.hasCase ? 0.9 : 0.25;
            return base;
        })
        .attr("stroke", function(d) { 
            return d.data.hasCase ? "#111827" : color(d.data.regionPretty); 
        })
        .attr("stroke-width", function(d) { return d.data.hasCase ? 1.5 : 1; });
    
    countryG.append("title")
        .text(function(d) {
            var base = d.data.name + "\nRegion: " + d.data.regionPretty;
            if (d.data.hasCase) {
                return base + "\n" + d.data.cases + " " + (d.data.cases === 1 ? "case" : "cases");
            } else {
                return base + "\n0 cases";
            }
        });
    
    // =====================================================
    // LEGEND - positioned to the right of bubble area
    // =====================================================
    var legendX = bubbleAreaWidth + 30;  // 30px gap after bubbles
    
    // Region Legend
    var legend = svg.append("g")
        .attr("transform", "translate(" + legendX + ", 100)");
    
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", CHART_FONT_SIZES.smallLabel)
        .attr("font-weight", 600)
        .attr("font-family", CHART_FONTS.label)
        .attr("fill", "#E2E8F0")
        .text("Region");
    
    var legendItem = legend.selectAll("g.region-legend")
        .data(regions)
        .join("g")
        .attr("class", "region-legend")
        .attr("transform", function(d, i) { return "translate(0, " + (i * 20) + ")"; });
    
    legendItem.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("rx", 2)
        .attr("fill", function(d) { return color(d); });
    
    legendItem.append("text")
        .attr("x", 20)
        .attr("y", 11)
        .attr("font-size", CHART_FONT_SIZES.smallLabel)
        .attr("font-family", CHART_FONTS.body)
        .attr("fill", "#E2E8F0")
        .text(function(d) { return d; });
    
    // Yes/No status legend
    var statusLegendY = regions.length * 20 + 30;
    
    var statusLegend = svg.append("g")
        .attr("transform", "translate(" + legendX + ", " + (100 + statusLegendY) + ")");
    
    statusLegend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", CHART_FONT_SIZES.smallLabel)
        .attr("font-weight", 600)
        .attr("font-family", CHART_FONTS.label)
        .attr("fill", "#E2E8F0")
        .text("Country status");
    
    var baseColor = color(regions[0]);
    var statusData = [
        { label: "Country with UJ/ETJ case", hasCase: true },
        { label: "Country without UJ/ETJ case", hasCase: false }
    ];
    
    var statusItem = statusLegend.selectAll("g.status-legend")
        .data(statusData)
        .join("g")
        .attr("class", "status-legend")
        .attr("transform", function(d, i) { return "translate(0, " + (i * 22) + ")"; });
    
    statusItem.append("circle")
        .attr("cx", 7)
        .attr("cy", 7)
        .attr("r", 7)
        .attr("fill", function(d) {
            var c = d3.color(baseColor);
            c.opacity = d.hasCase ? 0.9 : 0.25;
            return c;
        })
        .attr("stroke", function(d) { return d.hasCase ? "#111827" : baseColor; })
        .attr("stroke-width", 1);
    
    statusItem.append("text")
        .attr("x", 20)
        .attr("y", 11)
        .attr("font-size", CHART_FONT_SIZES.smallLabel)
        .attr("font-family", CHART_FONTS.body)
        .attr("fill", "#E2E8F0")
        .text(function(d) { return d.label; });
    
    // Size legend for "Yes" bubbles
    var yesNodes = countryNodes.filter(function(d) { return d.data.hasCase; });
    var maxCases = d3.max(yesNodes, function(d) { return d.data.cases; }) || 1;
    
    var rScale = d3.scalePow()
        .exponent(CASE_EXP / 2)
        .domain([1, maxCases])
        .range([22, 65]);
    
    var sizeLegendY = statusLegendY + statusData.length * 22 + 35;
    
    var sizeLegend = svg.append("g")
        .attr("transform", "translate(" + legendX + ", " + (100 + sizeLegendY) + ")");
    
    sizeLegend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", CHART_FONT_SIZES.smallLabel)
        .attr("font-weight", 600)
        .attr("font-family", CHART_FONTS.label)
        .attr("fill", "#E2E8F0")
        .text("Bubble size (colored)");
    
    var exampleCases = maxCases === 1 ? [1] : [1, maxCases];
    
    sizeLegend.selectAll("circle.size-example")
        .data(exampleCases)
        .join("circle")
        .attr("class", "size-example")
        .attr("cx", function() { return rScale(exampleCases[exampleCases.length - 1]) + 2; })
        .attr("cy", function(d) { return rScale(exampleCases[exampleCases.length - 1]) * 2 - rScale(d); })
        .attr("r", function(d) { return rScale(d); })
        .attr("fill", "none")
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 1);
    
    sizeLegend.selectAll("text.size-label")
        .data(exampleCases)
        .join("text")
        .attr("class", "size-label")
        .attr("x", function() { return rScale(exampleCases[exampleCases.length - 1]) * 2 + 12; })
        .attr("y", function(d) { return rScale(exampleCases[exampleCases.length - 1]) * 2 - rScale(d); })
        .attr("dy", "0.35em")
        .attr("font-size", CHART_FONT_SIZES.smallLabel - 2)
        .attr("font-family", CHART_FONTS.body)
        .attr("fill", "#E2E8F0")
        .text(function(d) { return d + " " + (d === 1 ? "case" : "cases"); });
    
    console.log('[Charts] Section 5A rendered:', stats.statesWithCases, 'states with UJ/ETJ cases');
}


/* ===============================================
   SECTION 5B: SPECIALIZED UNITS BAR CHART
   =============================================== */
    function createChart_Section5B(containerId) {
    console.log('[Charts] Rendering Section 5B - Specialized Units Bar Chart');
    
    var container = d3.select('#' + containerId);
    if (container.empty()) {
        console.warn('[Charts] Container not found:', containerId);
        return;
    }
    container.selectAll("*").remove();
    
    container.style("position", "relative");
    
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
            .style("font-family", CHART_FONTS.body)
            .style("font-size", "18px")
            .text("Loading data...");
        return;
    }
    
    if (typeof DataCounterHub === 'undefined' || !DataCounterHub.getSpecializedUnitData) {
        console.warn('[Charts] DataCounterHub.getSpecializedUnitData not available');
        return;
    }
    
    var data = DataCounterHub.getSpecializedUnitData(records);
    
    if (data.error) {
        container.append("div")
            .style("color", "#E2E8F0")
            .style("font-size", "16px")
            .style("font-family", CHART_FONTS.body)
            .text("Specialized-unit column not found in dataset.");
        return;
    }
    
    if (!data.stats.hasData) {
        container.append("div")
            .style("color", "#E2E8F0")
            .style("font-size", "16px")
            .style("font-family", CHART_FONTS.body)
            .text("No specialized-unit information available for UN Member States.");
        return;
    }
    
    var summary = data.summary;
    var regionCountries = data.regionCountries;
    var regionOrderByData = data.regionOrderByData;
    var totalWithUnit = data.stats.totalWithUnit;
    var maxVal = data.stats.maxVal;
    
    // Layout - using viewBox for proper centering
    var width = 960;
    var height = 580;
    var margin = { top: 80, right: 140, bottom: 120, left: 140 };
    
    // Create wrapper to constrain max size on large screens
    var wrapper = container.append("div")
        .style("width", "100%")
        .style("max-width", "1100px")
        .style("margin", "0 auto");
    
    // Create SVG with viewBox for responsive centering
    var svg = wrapper.append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto")
        .style("display", "block")
        .style("margin", "0 auto")
        .attr("font-family", CHART_FONTS.body);
    
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
    
    // Title at TOP of chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 26)
        .attr("text-anchor", "middle")
        .attr("font-size", 18)
        .attr("font-weight", 600)
        .attr("font-family", CHART_FONTS.title)
        .attr("fill", "#FFFFFF")
        .text("Specialized Units to Investigate and Prosecute International Crimes");
    
    // Subtitle
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 48)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("font-family", CHART_FONTS.body)
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
        .style("font-family", CHART_FONTS.body)
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
    
    // Build bar data
    var summaryByRegion = {};
    summary.forEach(function(d) {
        summaryByRegion[d.region] = d;
    });
    var barData = regionOrderByData.map(function(r) {
        return summaryByRegion[r];
    }).filter(function(d) { return d; });
    
    var barGroup = g.append("g");
    
    // Left bars: WITH specialized unit (negative direction) - LIGHT BLUE
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
    
    // Right bars: WITHOUT specialized unit (positive direction) - DARK GRAY
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
    
    // X Axis with numbers
    var xAxis = d3.axisBottom(xScale)
        .tickFormat(function(d) { return Math.abs(d); })
        .ticks(Math.min(maxVal, 8));
    
    g.append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(xAxis)
        .call(function(g) { g.selectAll("text").attr("fill", "#A0AEC0").attr("font-family", CHART_FONTS.body); })
        .call(function(g) { g.selectAll("line").attr("stroke", "#4A5568"); })
        .call(function(g) { g.selectAll("path.domain").attr("stroke", "#4A5568"); });
    
    // Y Axis
    var yAxis = d3.axisLeft(yScale);
    
    g.append("g")
        .call(yAxis)
        .call(function(g) { g.selectAll("text").attr("fill", "#E2E8F0").attr("font-family", CHART_FONTS.body); })
        .call(function(g) { g.selectAll("line").attr("stroke", "#4A5568"); })
        .call(function(g) { g.selectAll("path.domain").attr("stroke", "#4A5568"); });
    
    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 40)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("font-family", CHART_FONTS.body)
        .attr("fill", "#A0AEC0")
        .text("Countries with specialized unit ←   |   Countries without specialized unit →");
    
    // Legend (centered under the plot)
    var legendY = height - 20;
    var legendItemWidth = 220;
    var legendGap = 40;
    var totalLegendWidth = (legendItemWidth * 2) + legendGap;
    var legendX = (width - totalLegendWidth) / 2;
    
    var legend = svg.append("g")
        .attr("transform", "translate(" + legendX + ", " + legendY + ")");
    
    // First legend item - WITH (blue)
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
        .attr("font-family", CHART_FONTS.body)
        .attr("fill", "#E2E8F0")
        .text("Countries with specialized unit");
    
    // Second legend item - WITHOUT (gray)
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
        .attr("font-family", CHART_FONTS.body)
        .attr("fill", "#E2E8F0")
        .text("Countries without specialized unit");
    
    console.log('[Charts] Section 5B rendered:', totalWithUnit, 'states with specialized units');
}


/* ===============================================
   CHART INITIALIZATION
   =============================================== */
async function initializeAllCharts() {
    console.log('[Charts] Initializing all charts...');
    console.log('[Charts] DataCounterHub available:', typeof DataCounterHub !== 'undefined');
    console.log('[Charts] DataLoader available:', typeof DataLoader !== 'undefined');
    console.log('[Charts] initChartsWithRealData available:', typeof initChartsWithRealData !== 'undefined');
    
    if (typeof DataLoader !== 'undefined' && typeof initChartsWithRealData === 'function') {
        console.log('[Charts] DataLoader detected - attempting to load real data...');
        try {
            await initChartsWithRealData();
            console.log('[Charts] All charts initialized with real data');
            return;
        } catch (error) {
            console.warn('[Charts] Could not load real data, falling back to static data:', error);
        }
    } else {
        console.log('[Charts] DataLoader not found - using static data');
    }
    
    console.log('[Charts] Initializing charts with static data...');
    
    createChart_Section2A('chart-section-2a');
    createChart_Section3('chart-section-3');
    createChart_Section4A('chart-section-4a');
    createChart_Section5A('chart-section-5a');
    createChart_Section5B('chart-section-5b');
    
    console.log('[Charts] All charts initialized with static data');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllCharts);
} else {
    requestAnimationFrame(initializeAllCharts);
}
