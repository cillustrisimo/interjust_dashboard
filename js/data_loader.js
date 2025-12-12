/**
 * DATA_LOADER.JS
 * ==================================================
 * Central data management for Project Meridian Report
 * 
 * This file contains:
 * 1. DataCounterHub - Centralized counting/processing for Airtable data
 *    (used by charts.js and other modules)
 * 2. DataLoader - Handles loading from Airtable API or CSV fallback
 * 3. createChart_Section2A_WithData - Choropleth rendering with real data
 * 
 * IMPORTANT: 
 * - DataCounterHub is defined HERE and exported globally
 * - charts.js should NOT define its own DataCounterHub
 * - Data is cached in DataLoader._cache.airtable for PlaceholderFiller.js
 * ==================================================
 */

// ==============================================
// DATA COUNTER HUB
// A centralized counting function for Airtable data
// that can be extended for future graph needs
// ==============================================

var DataCounterHub = {
    // Version identifier to detect conflicts with other definitions
    _version: 'data_loader.js',
    
    // Cache for processed data
    _cache: {},
    
    // Column definitions for different counting operations
    // These map to the exact Airtable column names
    COLUMNS: {
        // Core criminalization columns (Section 2A choropleth)
        CRIMINALIZATION: {
            WAR_CRIMES: 'War Crimes - Does the country criminalize war crimes?',
            GENOCIDE: 'Genocide - Does the country criminalize genocide?',
            CRIMES_AGAINST_HUMANITY: 'Crimes Against Humanity - Does the country criminalize crimes against humanity?',
            AGGRESSION: 'Aggression - Does the country criminalize the international "crime of aggression" or the "crimes against peace"?'
        },
        // Command responsibility
        COMMAND_RESPONSIBILITY: {
            HAS_PROVISION: 'Command or Superior Responsibility - Does the country have a domestic provision regarding command or superior responsibility?'
        },
        // Jurisdiction columns
        JURISDICTION: {
            UNIVERSAL_EXTRATERRITORIAL: 'Jurisdiction - Are there universal or extraterritorial jurisdiction provisions?',
            GENOCIDE_YES_PRESENCE: 'Jurisdiction GENOCIDE - YES perpetrator presence',
            GENOCIDE_NO_PRESENCE: 'Jurisdiction GENOCIDE - NO perpetrator presence',
            WAR_CRIMES_YES_PRESENCE: 'Jurisdiction WAR CRIMES - YES perpetrator presence',
            WAR_CRIMES_NO_PRESENCE: 'Jurisdiction WAR CRIMES - NO perpetrator presence',
            CAH_YES_PRESENCE: 'Jurisdiction CRIMES AGAINST HUMANITY - YES perpetrator presence',
            CAH_NO_PRESENCE: 'Jurisdiction CRIMES AGAINST HUMANITY - NO perpetrator presence',
            AGGRESSION_YES_PRESENCE: 'Jurisdiction AGGRESSION - YES perpetrator presence',
            AGGRESSION_NO_PRESENCE: 'Jurisdiction AGGRESSION - NO perpetrator presence'
        },
        // Rome Statute
        ROME_STATUTE: {
            SIGNED_RATIFIED: 'Rome Statute of the International Criminal Court - Has the country signed or ratified the Rome Statute?',
            DOMESTICATED: 'Rome Statute of the International Criminal Court - If ratified, did the country domesticate the Rome Statute provisions?'
        },
        // Jurisprudence
        JURISPRUDENCE: {
            HAS_CASE: 'Jurisprudence - Has the country had a UJ or ETJ case? ',
            CASE_COUNT: 'Jurisprudence - How many UJ or ETJ cases has the country launched?'
        },
        // Practice
        PRACTICE: {
            HAS_SPECIALIZED_UNIT: 'Practice - Is there a specialized unit for investigating international crimes?'
        },
        // Identifiers
        IDENTIFIERS: {
            COUNTRY: 'Country',
            ISO_CODE: 'ISO 3166-1 alpha-3',
            REGION: 'Region'
        }
    },
    
    /**
     * Count "Yes" values across specified columns for a single record
     * @param {Object} record - A single Airtable record
     * @param {Array<string>} columns - Array of column names to check
     * @returns {Object} - { count: number, details: { columnName: boolean, ... } }
     */
    countYesValues: function(record, columns) {
        var details = {};
        var count = 0;
        
        columns.forEach(function(col) {
            var value = record[col];
            var isYes = value && 
                        typeof value === 'string' && 
                        value.toLowerCase().trim() === 'yes';
            details[col] = isYes;
            if (isYes) count++;
        });
        
        return { count: count, details: details };
    },
    
    /**
     * Count criminalized crimes for a country
     * This is the primary function for the Section 2A choropleth
     * @param {Object} record - A single Airtable record
     * @returns {Object} - { count: 0-4, crimes: Array<string>, details: Object }
     */
    countCriminalizedCrimes: function(record) {
        var self = this;
        var columns = [
            this.COLUMNS.CRIMINALIZATION.WAR_CRIMES,
            this.COLUMNS.CRIMINALIZATION.GENOCIDE,
            this.COLUMNS.CRIMINALIZATION.CRIMES_AGAINST_HUMANITY,
            this.COLUMNS.CRIMINALIZATION.AGGRESSION
        ];
        
        var result = this.countYesValues(record, columns);
        
        // Build human-readable crimes array
        var crimeLabels = {};
        crimeLabels[this.COLUMNS.CRIMINALIZATION.WAR_CRIMES] = 'War Crimes';
        crimeLabels[this.COLUMNS.CRIMINALIZATION.GENOCIDE] = 'Genocide';
        crimeLabels[this.COLUMNS.CRIMINALIZATION.CRIMES_AGAINST_HUMANITY] = 'Crimes Against Humanity';
        crimeLabels[this.COLUMNS.CRIMINALIZATION.AGGRESSION] = 'Crime of Aggression';
        
        var crimes = [];
        Object.keys(result.details).forEach(function(col) {
            if (result.details[col] && crimeLabels[col]) {
                crimes.push(crimeLabels[col]);
            }
        });
        
        return {
            count: result.count,
            crimes: crimes,
            details: result.details
        };
    },
    
    /**
     * Process all records from Airtable and cache results
     * @param {Array} records - Array of Airtable records
     * @param {string} countType - Type of count ('criminalization', 'jurisdiction', etc.)
     * @returns {Object} - Keyed by ISO code with count data
     */
    processAllRecords: function(records, countType) {
        countType = countType || 'criminalization';
        var cacheKey = countType + '_' + records.length;
        var self = this;
        
        if (this._cache[cacheKey]) {
            return this._cache[cacheKey];
        }
        
        var processedData = {};
        
        records.forEach(function(record) {
            var isoCode = record[self.COLUMNS.IDENTIFIERS.ISO_CODE];
            var countryName = record[self.COLUMNS.IDENTIFIERS.COUNTRY];
            var region = record[self.COLUMNS.IDENTIFIERS.REGION];
            
            if (!isoCode) return;
            
            var countData;
            
            switch (countType) {
                case 'criminalization':
                    countData = self.countCriminalizedCrimes(record);
                    break;
                case 'command_responsibility':
                    countData = self.countYesValues(record, [
                        self.COLUMNS.COMMAND_RESPONSIBILITY.HAS_PROVISION
                    ]);
                    break;
                case 'jurisdiction':
                    countData = self.countYesValues(record, [
                        self.COLUMNS.JURISDICTION.UNIVERSAL_EXTRATERRITORIAL
                    ]);
                    break;
                default:
                    countData = self.countCriminalizedCrimes(record);
            }
            
            processedData[isoCode] = {
                count: countData.count,
                crimes: countData.crimes,
                details: countData.details,
                name: countryName,
                isoCode: isoCode,
                region: region
            };
        });
        
        this._cache[cacheKey] = processedData;
        return processedData;
    },
    
    /**
     * Get aggregate statistics across all records
     * @param {Array} records - Array of Airtable records
     * @param {string} countType - Type of count
     * @returns {Object} - { total: number, byCount: { 0: n, 1: n, ... }, byCrime: { ... }, allFour: n, atLeastOne: n }
     */
    getAggregateStats: function(records, countType) {
        countType = countType || 'criminalization';
        var processedData = this.processAllRecords(records, countType);
        
        var stats = {
            total: Object.keys(processedData).length,
            byCount: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
            byCrime: {
                'War Crimes': 0,
                'Genocide': 0,
                'Crimes Against Humanity': 0,
                'Crime of Aggression': 0
            },
            allFour: 0,
            atLeastOne: 0
        };
        
        Object.keys(processedData).forEach(function(key) {
            var data = processedData[key];
            var count = data.count || 0;
            stats.byCount[count] = (stats.byCount[count] || 0) + 1;
            
            if (count === 4) stats.allFour++;
            if (count > 0) stats.atLeastOne++;
            
            if (data.crimes) {
                data.crimes.forEach(function(crime) {
                    if (stats.byCrime.hasOwnProperty(crime)) {
                        stats.byCrime[crime]++;
                    }
                });
            }
        });
        
        return stats;
    },
    
    /**
     * Clear the cache (useful when data is updated)
     */
    clearCache: function() {
        this._cache = {};
    },
    
    /**
     * Match GeoJSON features with Airtable data
     * @param {Object} geojsonData - GeoJSON FeatureCollection
     * @param {Object} airtableProcessed - Processed Airtable data keyed by ISO code
     * @returns {Object} - GeoJSON with enriched properties
     */
    enrichGeoJSON: function(geojsonData, airtableProcessed) {
        var enrichedFeatures = geojsonData.features.map(function(feature) {
            var isoCode = feature.properties.ISO_A3;
            var airtableData = airtableProcessed[isoCode] || null;
            
            return {
                type: feature.type,
                id: feature.id,
                geometry: feature.geometry,
                properties: Object.assign({}, feature.properties, {
                    airtableData: airtableData,
                    crimeCount: airtableData ? airtableData.count : null,
                    crimes: airtableData ? airtableData.crimes : []
                })
            };
        });
        
        return {
            type: geojsonData.type,
            features: enrichedFeatures
        };
    },
    
    /**
     * Region order for consistent chart display
     */
    REGION_ORDER: [
        "North America",
        "Central America",
        "Caribbean",
        "South America",
        "Europe",
        "Africa",
        "Middle East & North Africa",
        "Asia",
        "Oceania"
    ],
    
    /**
     * Normalize region name to match expected format
     * @param {string} region - Raw region string
     * @returns {string} - Normalized region name
     */
    normalizeRegion: function(region) {
        var s = String(region || "").trim();
        if (!s) return "Unknown";
        // Handle variations in MENA naming
        if (/Middle East.*North Africa/i.test(s)) return "Middle East & North Africa";
        return s;
    },
    
    /**
     * Get regional statistics for a specific count type
     * Aggregates yes/no counts by region for UN Member States
     * @param {Array} records - Array of Airtable records
     * @param {string} countType - Type of count ('command_responsibility', 'jurisdiction', etc.)
     * @returns {Array} - Array of { region, yes, no, total, pctYes } objects in REGION_ORDER
     */
    getRegionalStats: function(records, countType) {
        var self = this;
        countType = countType || 'command_responsibility';
        
        // Determine which column to check based on countType
        var columnToCheck;
        switch (countType) {
            case 'command_responsibility':
                columnToCheck = this.COLUMNS.COMMAND_RESPONSIBILITY.HAS_PROVISION;
                break;
            case 'jurisdiction':
                columnToCheck = this.COLUMNS.JURISDICTION.UNIVERSAL_EXTRATERRITORIAL;
                break;
            default:
                columnToCheck = this.COLUMNS.COMMAND_RESPONSIBILITY.HAS_PROVISION;
        }
        
        // Filter to UN Member States only
        var unMemberStates = records.filter(function(record) {
            var status = String(record.Status || record.status || "").trim();
            return status === "UN Member State";
        });
        
        // Aggregate by region
        var regionMap = {};
        
        unMemberStates.forEach(function(record) {
            var region = self.normalizeRegion(record.Region || record.region);
            
            // Skip regions not in our display order
            if (self.REGION_ORDER.indexOf(region) === -1) return;
            
            var value = String(record[columnToCheck] || "").trim().toUpperCase();
            var isYes = (value === "YES" || value === "Y");
            
            if (!regionMap[region]) {
                regionMap[region] = { yes: 0, no: 0 };
            }
            
            if (isYes) {
                regionMap[region].yes++;
            } else {
                regionMap[region].no++;
            }
        });
        
        // Build result array in REGION_ORDER
        var result = this.REGION_ORDER.map(function(region) {
            var counts = regionMap[region] || { yes: 0, no: 0 };
            var total = counts.yes + counts.no;
            return {
                region: region,
                yes: counts.yes,
                no: counts.no,
                total: total,
                pctYes: total > 0 ? counts.yes / total : 0
            };
        });
        
        return result;
    },
    
    /**
     * Get command responsibility statistics by region
     * Convenience method for Section 3 chart
     * @param {Array} records - Array of Airtable records
     * @returns {Array} - Regional stats for command responsibility
     */
    getCommandResponsibilityByRegion: function(records) {
        return this.getRegionalStats(records, 'command_responsibility');
    },
    
    /**
     * Get jurisprudence data for UJ/ETJ packed bubble chart (Section 5A)
     * Processes all UN Member States and returns data structured for D3 hierarchy
     * @param {Array} records - Array of Airtable records
     * @returns {Object} - { nodes: Array, hierarchy: Object, stats: Object }
     */
    getJurisprudenceData: function(records) {
        var self = this;
        
        // Filter to UN Member States only
        var unMemberStates = records.filter(function(record) {
            var status = String(record.Status || record.status || "").trim();
            return status === "UN Member State";
        });
        
        if (!unMemberStates.length) {
            console.warn('[DataCounterHub] No UN Member State records found');
            return { nodes: [], hierarchy: null, stats: { totalStates: 0, statesWithCases: 0 } };
        }
        
        // Dynamically find column names (handles slight variations)
        var keys = Object.keys(unMemberStates[0] || {});
        
        var hasCaseCol = this.COLUMNS.JURISPRUDENCE.HAS_CASE;
        var caseCountCol = this.COLUMNS.JURISPRUDENCE.CASE_COUNT;
        
        // If exact columns not found, search by pattern
        if (keys.indexOf(hasCaseCol) === -1) {
            hasCaseCol = keys.find(function(k) {
                return /Jurisprudence\s*[-–]\s*Has the country had a UJ or ETJ case/i.test(k);
            }) || hasCaseCol;
        }
        
        if (keys.indexOf(caseCountCol) === -1) {
            caseCountCol = keys.find(function(k) {
                return /Jurisprudence\s*[-–]\s*How many UJ or ETJ cases/i.test(k);
            }) || caseCountCol;
        }
        
        console.log('[DataCounterHub] Jurisprudence columns:', hasCaseCol ? 'found' : 'not found', caseCountCol ? 'found' : 'not found');
        
        // Build nodes array with case info
        var nodes = [];
        var statesWithCases = 0;
        
        unMemberStates.forEach(function(record) {
            // Get country name
            var countryName = record[self.COLUMNS.IDENTIFIERS.COUNTRY] || record.Country || "Unknown";
            
            // Check if country has UJ/ETJ case
            var hasCaseRaw = record[hasCaseCol];
            var hasCaseStr = String(hasCaseRaw || "").trim().toUpperCase();
            var hasCase = (hasCaseStr === "YES" || hasCaseStr === "Y");
            
            // Get case count
            var caseCountRaw = record[caseCountCol];
            var cases = 0;
            if (caseCountRaw != null) {
                var s = String(caseCountRaw).trim();
                if (s && s.toUpperCase() !== "N/A") {
                    var num = parseFloat(s.replace(/,/g, ""));
                    if (isFinite(num) && num > 0) {
                        cases = Math.floor(num);
                    }
                }
            }
            
            // Fallback: if dataset says "YES" but forgot number, treat as 1
            if (!cases && hasCase) cases = 1;
            
            // Normalize region name
            var regionRaw = record[self.COLUMNS.IDENTIFIERS.REGION] || record.Region || "";
            var region = self.normalizeRegion(regionRaw);
            // Shorten MENA for display
            var regionPretty = (region === "Middle East & North Africa") ? "MENA" : region;
            
            if (hasCase) statesWithCases++;
            
            nodes.push({
                name: countryName,
                region: region,
                regionPretty: regionPretty,
                cases: cases,
                hasCase: hasCase
            });
        });
        
        // Group by region for hierarchy
        var regionMap = {};
        nodes.forEach(function(node) {
            var r = node.regionPretty;
            if (!regionMap[r]) {
                regionMap[r] = [];
            }
            regionMap[r].push(node);
        });
        
        // Get sorted region names
        var regions = Object.keys(regionMap).sort(function(a, b) {
            return a.localeCompare(b);
        });
        
        // Build hierarchy structure for D3
        var hierarchy = {
            name: "root",
            children: regions.map(function(regionName) {
                return {
                    name: regionName,
                    children: regionMap[regionName]
                };
            })
        };
        
        return {
            nodes: nodes,
            hierarchy: hierarchy,
            regions: regions,
            stats: {
                totalStates: unMemberStates.length,
                statesWithCases: statesWithCases,
                maxCases: Math.max.apply(null, nodes.map(function(n) { return n.cases; })) || 0
            }
        };
    },
    
    /**
     * Get specialized unit data for mirrored bar chart (Section 5B)
     * Aggregates by region: countries with/without specialized investigation units
     * @param {Array} records - Array of Airtable records
     * @returns {Object} - { summary: Array, regionCountries: Object, stats: Object }
     */
    getSpecializedUnitData: function(records) {
        var self = this;
        
        // Filter to UN Member States only
        var unMemberStates = records.filter(function(record) {
            var status = String(record.Status || record.status || "").trim();
            return status === "UN Member State";
        });
        
        if (!unMemberStates.length) {
            console.warn('[DataCounterHub] No UN Member State records found');
            return { summary: [], regionCountries: {}, stats: { totalWithUnit: 0 } };
        }
        
        // Find the specialized unit column dynamically
        var keys = Object.keys(unMemberStates[0] || {});
        var specializedUnitCol = this.COLUMNS.PRACTICE.HAS_SPECIALIZED_UNIT;
        
        // If exact column not found, search by pattern
        if (keys.indexOf(specializedUnitCol) === -1) {
            specializedUnitCol = keys.find(function(k) {
                return /Practice\s*[-–]\s*Is there a specialized unit for investigating international crimes/i.test(k);
            }) || specializedUnitCol;
        }
        
        if (!specializedUnitCol || keys.indexOf(specializedUnitCol) === -1) {
            console.warn('[DataCounterHub] Could not find specialized unit column');
            return { summary: [], regionCountries: {}, stats: { totalWithUnit: 0 }, error: 'Column not found' };
        }
        
        console.log('[DataCounterHub] Specialized unit column:', specializedUnitCol ? 'found' : 'not found');
        
        // Region display order
        var regionOrder = [
            "North America",
            "Europe", 
            "South America",
            "Central America",
            "Africa",
            "Oceania",
            "Caribbean",
            "MENA",
            "Asia"
        ];
        
        // Aggregate by region
        var regionStats = {};
        var regionCountriesMap = {};
        
        unMemberStates.forEach(function(record) {
            var regionRaw = record[self.COLUMNS.IDENTIFIERS.REGION] || record.Region || "";
            var region = self.normalizeRegion(regionRaw);
            // Shorten MENA for display
            if (region === "Middle East & North Africa") region = "MENA";
            
            // Skip regions not in our display order
            if (regionOrder.indexOf(region) === -1) return;
            
            var rawVal = record[specializedUnitCol];
            var valStr = String(rawVal || "").trim().toUpperCase();
            var hasUnit = (valStr === "YES" || valStr === "Y");
            
            if (!regionStats[region]) {
                regionStats[region] = { withUnit: 0, withoutUnit: 0, total: 0 };
            }
            
            regionStats[region].total++;
            
            if (hasUnit) {
                regionStats[region].withUnit++;
                if (!regionCountriesMap[region]) {
                    regionCountriesMap[region] = [];
                }
                var countryName = record[self.COLUMNS.IDENTIFIERS.COUNTRY] || record.Country;
                if (countryName) {
                    regionCountriesMap[region].push(countryName);
                }
            } else {
                regionStats[region].withoutUnit++;
            }
        });
        
        // Build summary array in region order
        var summary = regionOrder.map(function(region) {
            var stats = regionStats[region] || { withUnit: 0, withoutUnit: 0, total: 0 };
            return {
                region: region,
                withUnit: stats.withUnit,
                withoutUnit: stats.withoutUnit,
                total: stats.total
            };
        });
        
        // Clean up countries lists (unique, sorted)
        var regionCountries = {};
        for (var region in regionCountriesMap) {
            if (regionCountriesMap.hasOwnProperty(region)) {
                var list = regionCountriesMap[region];
                var unique = [];
                var seen = {};
                list.forEach(function(c) {
                    if (c && !seen[c]) {
                        seen[c] = true;
                        unique.push(c);
                    }
                });
                unique.sort();
                regionCountries[region] = unique;
            }
        }
        
        // Calculate total with unit
        var totalWithUnit = 0;
        summary.forEach(function(s) {
            totalWithUnit += s.withUnit;
        });
        
        // Sort regions by proportion with units (descending)
        var regionOrderByData = summary
            .slice()
            .sort(function(a, b) {
                var pa = a.total ? a.withUnit / a.total : 0;
                var pb = b.total ? b.withUnit / b.total : 0;
                if (pb !== pa) return pb - pa;
                if (b.total !== a.total) return b.total - a.total;
                return a.region.localeCompare(b.region);
            })
            .map(function(d) { return d.region; });
        
        // Calculate max value for scale
        var maxVal = 1;
        summary.forEach(function(s) {
            maxVal = Math.max(maxVal, s.withUnit, s.withoutUnit);
        });
        
        return {
            summary: summary,
            regionCountries: regionCountries,
            regionOrderByData: regionOrderByData,
            stats: {
                totalWithUnit: totalWithUnit,
                maxVal: maxVal,
                hasData: summary.some(function(d) { return d.total > 0; })
            }
        };
    }
};

// Make DataCounterHub available globally
window.DataCounterHub = DataCounterHub;


// ==============================================
// DATA LOADER MODULE
// ==============================================

const DataLoader = {
    // ==============================================
    // CONFIGURATION - MUST MATCH ORIGINAL VALUES
    // ==============================================
    config: {
        airtable: {
            baseId: "appceDWWzmrL1awQi",
            tableId: "tblNt3dQ9b6F32QTU",
            // API key loaded from config.js - must be loaded before this script
            apiKey: (typeof CONFIG !== 'undefined') ? CONFIG.INTERJUST_API_KEY : null
        },
        snapshot: {
            // CSV fallback for when API key is not available
            path: './data/interjust_snapshot.csv'
        },
        geojson: {
            basePath: './data/geojson/',
            files: {
                countries: 'countries.geojson',
                world: 'world.geojson',
                africa: 'region-africa.geojson',
                asia: 'region-asia.geojson',
                caribbean: 'region-caribbean.geojson',
                centralAmerica: 'region-central-america.geojson',
                europe: 'region-europe.geojson',
                middleEastNorthAfrica: 'region-middle-east-north-africa.geojson',
                northAmerica: 'region-north-america.geojson',
                oceania: 'region-oceania.geojson',
                southAmerica: 'region-south-america.geojson'
            }
        }
    },

    // Cache for loaded data - PlaceholderFiller depends on _cache.airtable
    _cache: {
        airtable: null,
        geojson: {},
        processed: null
    },
    
    // State flags for background refresh
    _isRefreshing: false,
    _hasFreshData: false,

    // ==============================================
    // CSV PARSING UTILITIES (Fallback)
    // ==============================================

    /**
     * Parse CSV text into records
     * Handles multi-line quoted fields correctly
     */
    parseCSV: function(csvText) {
        var lines = this.splitCSVLines(csvText);
        
        if (lines.length === 0) return [];
        
        var headers = this.parseCSVLine(lines[0]);
        var records = [];
        
        for (var i = 1; i < lines.length; i++) {
            var values = this.parseCSVLine(lines[i]);
            
            if (values.length === headers.length) {
                var record = {};
                headers.forEach(function(header, index) {
                    record[header] = values[index];
                });
                records.push(record);
            }
        }
        
        return records;
    },

    /**
     * Split CSV text into lines, respecting quoted multi-line fields
     */
    splitCSVLines: function(csvText) {
        var lines = [];
        var currentLine = '';
        var inQuotes = false;
        
        for (var i = 0; i < csvText.length; i++) {
            var char = csvText[i];
            var nextChar = csvText[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    currentLine += '""';
                    i++;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    currentLine += char;
                }
            } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
                // End of line (not inside quotes)
                if (currentLine.trim()) {
                    lines.push(currentLine);
                }
                currentLine = '';
                if (char === '\r') i++; // Skip \n in \r\n
            } else if (char === '\r' && !inQuotes) {
                // Handle standalone \r
                if (currentLine.trim()) {
                    lines.push(currentLine);
                }
                currentLine = '';
            } else {
                currentLine += char;
            }
        }
        
        // Don't forget the last line
        if (currentLine.trim()) {
            lines.push(currentLine);
        }
        
        return lines;
    },

    parseCSVLine: function(line) {
        var result = [];
        var current = '';
        var inQuotes = false;
        
        for (var i = 0; i < line.length; i++) {
            var char = line[i];
            var nextChar = line[i + 1];
            
            if (inQuotes) {
                if (char === '"' && nextChar === '"') {
                    current += '"';
                    i++;
                } else if (char === '"') {
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        
        result.push(current.trim());
        return result;
    },

    fetchCSVSnapshot: async function() {
        console.log('[DataLoader] Fetching CSV snapshot...');
        
        try {
            var response = await fetch(this.config.snapshot.path);
            
            if (!response.ok) {
                throw new Error('CSV fetch error: ' + response.status);
            }
            
            var csvText = await response.text();
            var records = this.parseCSV(csvText);
            
            console.log('[DataLoader] CSV snapshot loaded:', records.length, 'records');
            
            return records;
        } catch (error) {
            console.error('[DataLoader] Error loading CSV snapshot:', error);
            throw error;
        }
    },

    // ==============================================
    // AIRTABLE DATA FETCHING
    // ==============================================

    /**
     * Fetch data with smart fallback chain:
     * 1. Use preload for instant rendering
     * 2. Update from Airtable API in background (self-healing)
     * 3. If API fails, keep preload data
     * 4. If no preload, try API directly
     * 5. If API fails and no preload, use CSV
     */
    fetchAirtableData: async function() {
        var self = this;
        
        // Check for preloaded data first (instant loading)
        var hasPreload = typeof window.DATA_PRELOAD !== 'undefined' && 
                         window.DATA_PRELOAD && 
                         window.DATA_PRELOAD.length > 0;
        
        if (hasPreload) {
            console.log('[DataLoader] Using preloaded data for instant render:', window.DATA_PRELOAD.length, 'records');
            this._cache.airtable = window.DATA_PRELOAD;
            
            // Schedule background refresh from API (self-healing/updating)
            this._scheduleBackgroundRefresh();
            
            return window.DATA_PRELOAD;
        }
        
        // No preload - try to fetch fresh data
        return await this._fetchFreshData();
    },
    
    /**
     * Schedule a background refresh from API
     * This updates preload data with fresh Airtable data
     */
    _scheduleBackgroundRefresh: function() {
        var self = this;
        
        // Don't refresh if already refreshing
        if (this._isRefreshing) {
            return;
        }
        
        // Check if API key is available
        var apiKey = this.config.airtable.apiKey;
        if (!apiKey) {
            console.log('[DataLoader] No API key - skipping background refresh');
            return;
        }
        
        // Delay background refresh to not block initial render
        setTimeout(function() {
            self._backgroundRefresh();
        }, 1000);
    },
    
    /**
     * Perform background refresh from Airtable API
     */
    _backgroundRefresh: async function() {
        var self = this;
        
        if (this._isRefreshing) {
            return;
        }
        
        this._isRefreshing = true;
        console.log('[DataLoader] Starting background refresh from Airtable API...');
        
        try {
            var freshData = await this._fetchFromAirtableAPI();
            
            if (freshData && freshData.length > 0) {
                console.log('[DataLoader] Background refresh successful:', freshData.length, 'records');
                
                // Update cache with fresh data
                this._cache.airtable = freshData;
                
                // Mark that we have fresh data
                this._hasFreshData = true;
                
                // Dispatch event for any listeners that want to know data was updated
                if (typeof window.dispatchEvent === 'function') {
                    window.dispatchEvent(new CustomEvent('dataloader:refreshed', { 
                        detail: { recordCount: freshData.length } 
                    }));
                }
                
                console.log('[DataLoader] Cache updated with fresh Airtable data');
            }
        } catch (error) {
            console.warn('[DataLoader] Background refresh failed, keeping preload data:', error.message);
            // Keep using preload data - it's still valid
        } finally {
            this._isRefreshing = false;
        }
    },
    
    /**
     * Fetch fresh data - tries API first, then CSV fallback
     */
    _fetchFreshData: async function() {
        // Return cached data if available
        if (this._cache.airtable && this._cache.airtable.length > 0) {
            console.log('[DataLoader] Using cached data:', this._cache.airtable.length, 'records');
            return this._cache.airtable;
        }
        
        var apiKey = this.config.airtable.apiKey;
        
        // If no API key, go straight to CSV
        if (!apiKey) {
            console.log('[DataLoader] No API key found, trying CSV snapshot...');
            return await this._fetchFromCSVWithFallback();
        }
        
        // Try API first
        try {
            var records = await this._fetchFromAirtableAPI();
            this._cache.airtable = records;
            return records;
        } catch (apiError) {
            console.error('[DataLoader] API fetch failed:', apiError.message);
            console.log('[DataLoader] Falling back to CSV snapshot...');
            return await this._fetchFromCSVWithFallback();
        }
    },
    
    /**
     * Fetch from Airtable API (raw fetch, no fallbacks)
     */
    _fetchFromAirtableAPI: async function() {
        var baseId = this.config.airtable.baseId;
        var tableId = this.config.airtable.tableId;
        var apiKey = this.config.airtable.apiKey;
        
        if (!apiKey) {
            throw new Error('No API key available');
        }
        
        var url = 'https://api.airtable.com/v0/' + baseId + '/' + tableId;
        var allRecords = [];
        var offset = null;

        console.log('[DataLoader] Fetching from Airtable API...');

        do {
            var fetchUrl = offset ? (url + '?offset=' + offset) : url;
            
            var response = await fetch(fetchUrl, {
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Airtable API error: ' + response.status + ' ' + response.statusText);
            }

            var data = await response.json();
            
            var records = data.records.map(function(record) {
                return Object.assign({ _id: record.id }, record.fields);
            });
            
            allRecords = allRecords.concat(records);
            offset = data.offset;

            console.log('[DataLoader] Fetched', records.length, 'records (total:', allRecords.length + ')');

        } while (offset);

        console.log('[DataLoader] Airtable fetch complete:', allRecords.length, 'total records');
        return allRecords;
    },
    
    /**
     * Fetch from CSV with proper error handling
     */
    _fetchFromCSVWithFallback: async function() {
        try {
            var records = await this.fetchCSVSnapshot();
            this._cache.airtable = records;
            console.log('[DataLoader] CSV snapshot loaded:', records.length, 'records');
            return records;
        } catch (csvError) {
            console.error('[DataLoader] CSV fallback failed:', csvError);
            
            // Last resort: check if we have any cached data at all
            if (this._cache.airtable && this._cache.airtable.length > 0) {
                console.log('[DataLoader] Using previously cached data as last resort');
                return this._cache.airtable;
            }
            
            throw new Error('All data sources failed: No preload, API failed, CSV failed');
        }
    },

    // ==============================================
    // GEOJSON DATA FETCHING
    // ==============================================

    fetchGeoJSON: async function(fileKey) {
        if (this._cache.geojson[fileKey]) {
            console.log('[DataLoader] Using cached GeoJSON:', fileKey);
            return this._cache.geojson[fileKey];
        }

        var fileName = this.config.geojson.files[fileKey];
        if (!fileName) {
            throw new Error('Unknown GeoJSON file key: ' + fileKey);
        }

        var url = this.config.geojson.basePath + fileName;
        
        console.log('[DataLoader] Fetching GeoJSON:', fileKey);

        try {
            var response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('GeoJSON fetch error: ' + response.status);
            }

            var geojson = await response.json();
            
            console.log('[DataLoader] GeoJSON loaded:', fileKey, '(' + (geojson.features ? geojson.features.length : 0) + ' features)');
            
            this._cache.geojson[fileKey] = geojson;
            
            return geojson;

        } catch (error) {
            console.error('[DataLoader] Error fetching GeoJSON (' + fileKey + '):', error);
            throw error;
        }
    },

    fetchCountriesGeoJSON: async function() {
        return this.fetchGeoJSON('countries');
    },

    // ==============================================
    // COMBINED DATA LOADING & PROCESSING
    // ==============================================

    loadAndProcessData: async function() {
        if (this._cache.processed) {
            console.log('[DataLoader] Using cached processed data');
            return this._cache.processed;
        }

        try {
            console.log('[DataLoader] === Starting Data Load ===');

            // Step 1: Fetch Airtable/CSV data
            var airtableRecords = await this.fetchAirtableData();
            console.log('[DataLoader] Loaded', airtableRecords.length, 'records from data source');
            
            // Step 2: Fetch GeoJSON
            var countriesGeoJSON = await this.fetchCountriesGeoJSON();
            console.log('[DataLoader] Loaded GeoJSON with', countriesGeoJSON.features.length, 'features');

            // Step 3: Process through DataCounterHub
            var processedByCountry = DataCounterHub.processAllRecords(
                airtableRecords, 
                'criminalization'
            );

            // Step 4: Get aggregate statistics
            var stats = DataCounterHub.getAggregateStats(
                airtableRecords, 
                'criminalization'
            );

            // Step 5: Enrich GeoJSON with Airtable data
            var enrichedGeoJSON = DataCounterHub.enrichGeoJSON(
                countriesGeoJSON, 
                processedByCountry
            );

            var countByISO = {};
            Object.keys(processedByCountry).forEach(function(iso) {
                countByISO[iso] = processedByCountry[iso].count;
            });

            var result = {
                raw: {
                    airtable: airtableRecords,
                    geojson: countriesGeoJSON
                },
                byCountry: processedByCountry,
                stats: stats,
                enrichedGeoJSON: enrichedGeoJSON,
                countByISO: countByISO,
                loadedAt: new Date().toISOString()
            };

            console.log('[DataLoader] === Data Load Complete ===');
            console.log('[DataLoader] Countries processed:', Object.keys(processedByCountry).length);
            console.log('[DataLoader] At least one crime:', stats.atLeastOne, '| All four:', stats.allFour);

            this._cache.processed = result;

            return result;

        } catch (error) {
            console.error('[DataLoader] Error loading and processing data:', error);
            throw error;
        }
    },

    // ==============================================
    // UTILITY FUNCTIONS
    // ==============================================

    clearCache: function() {
        this._cache = {
            airtable: null,
            geojson: {},
            processed: null
        };
        if (typeof DataCounterHub !== 'undefined') {
            DataCounterHub.clearCache();
        }
        console.log('[DataLoader] All caches cleared');
    },

    isDataLoaded: function() {
        return this._cache.processed !== null;
    },

    getCachedData: function() {
        return this._cache.processed;
    }
};

// Make DataLoader available globally
window.DataLoader = DataLoader;


// ==============================================
// INTEGRATION WITH CHARTS
// ==============================================

async function initChartsWithRealData() {
    try {
        console.log('[Charts] Initializing charts with real data...');
        
        var data = await DataLoader.loadAndProcessData();
        
        console.log('[Charts] Data loaded successfully:');
        console.log('[Charts]   -', Object.keys(data.byCountry).length, 'countries');
        console.log('[Charts]   -', data.stats.atLeastOne, 'with at least one crime criminalized');
        
        // Store for re-rendering
        window.choroplethData = data;
        
        // Initialize Section 2A choropleth with real data
        console.log('[Charts] Creating choropleth with real data...');
        createChart_Section2A_WithData('chart-section-2a', data);
        
        // Initialize other charts
        if (typeof createChart_Section3 === 'function') {
            createChart_Section3('chart-section-3');
        }
        if (typeof createChart_Section4A === 'function') {
            createChart_Section4A('chart-section-4a');
            createChart_Section4B('chart-section-4b');
            createChart_Section4C('chart-section-4c');
            createChart_Section4D('chart-section-4d');
            createChart_Section4E('chart-section-4e');
            createChart_Section5A('chart-section-5a');
            createChart_Section5B('chart-section-5b');
        }
        
        console.log('[Charts] All charts initialized with real data');
        
    } catch (error) {
        console.error('[Charts] Failed to initialize charts with real data:', error);
        console.log('[Charts] Falling back to static data...');
        
        if (typeof createChart_Section2A === 'function') {
            createChart_Section2A('chart-section-2a');
        }
        if (typeof createChart_Section3 === 'function') {
            createChart_Section3('chart-section-3');
        }
        if (typeof createChart_Section4A === 'function') {
            createChart_Section4A('chart-section-4a');
            createChart_Section4B('chart-section-4b');
            createChart_Section4C('chart-section-4c');
            createChart_Section4D('chart-section-4d');
            createChart_Section4E('chart-section-4e');
            createChart_Section5A('chart-section-5a');
            createChart_Section5B('chart-section-5b');
        }
    }
}


/**
 * Choropleth with real data - includes title and proper tooltip with circle indicators
 */
function createChart_Section2A_WithData(containerId, loadedData) {
    console.log('[Choropleth] Rendering Section 2A with real data');
    console.log('[Choropleth]   Countries in data:', Object.keys(loadedData.byCountry).length);
    
    var container = d3.select('#' + containerId);
    container.selectAll("*").remove();
    
    // Remove any existing tooltips
    d3.selectAll(".choropleth-tooltip").remove();
    
    var width = 960;
    var height = 560;
    
    // Create wrapper
    var wrapper = container.append("div")
        .attr("class", "choropleth-wrapper")
        .style("position", "relative")
        .style("width", "100%")
        .style("max-width", "960px")
        .style("margin", "0 auto");
    
    // Search container
    var searchContainer = wrapper.append("div")
        .attr("class", "choropleth-search-container")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("gap", "8px")
        .style("margin-bottom", "16px")
        .style("padding", "8px 0");
    
    // Search input
    var searchInput = searchContainer.append("input")
        .attr("type", "text")
        .attr("placeholder", "Search countries...")
        .style("padding", "10px 16px")
        .style("border", "1px solid #4A5568")
        .style("border-radius", "24px")
        .style("background", "rgba(26, 32, 44, 0.95)")
        .style("color", "#E2E8F0")
        .style("font-size", "13px")
        .style("font-family", "sans-serif")
        .style("width", "260px")
        .style("outline", "none");
    
    // Clear button
    var clearBtn = searchContainer.append("button")
        .style("background", "rgba(99, 179, 237, 0.2)")
        .style("border", "1px solid #63B3ED")
        .style("border-radius", "50%")
        .style("width", "32px")
        .style("height", "32px")
        .style("color", "#63B3ED")
        .style("cursor", "pointer")
        .style("opacity", "0")
        .style("pointer-events", "none")
        .html("&times;");
    
    var svg = wrapper.append("svg")
        .attr("viewBox", '0 0 ' + width + ' ' + height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto")
        .style("background", "transparent");
    
    // Crime types for tooltip
    var crimeTypes = ["War Crimes", "Genocide", "Crimes Against Humanity", "Crime of Aggression"];
    
    // Use real data
    var countryData = loadedData.byCountry;
    
    // Color scale
    var colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range(["#d4e6f1", "#a9cce3", "#5dade2", "#2980b9", "#1a5276"]);
    
    // Projection
    var projection = d3.geoNaturalEarth1()
        .scale(170)
        .translate([width / 2, height / 2 + 30]);
    
    var path = d3.geoPath().projection(projection);
    
    // Tooltip
    var tooltip = d3.select("body").append("div")
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
                    content = '<div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: #90CDF4; border-bottom: 1px solid #4A5568; padding-bottom: 10px;">' + data.name + '</div>';
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
                    content = '<div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #90CDF4;">Antarctica</div>';
                    content += '<div style="color: #718096; font-style: italic;">No data available</div>';
                } else if (isoAlpha3) {
                    content = '<div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #90CDF4;">' + isoAlpha3 + '</div>';
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
    
    // Legend
    var legendX = width - 180;
    var legendY = 60;
    var legendItemHeight = 22;
    
    var legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", 'translate(' + legendX + ', ' + legendY + ')');
    
    legendGroup.append("rect")
        .attr("x", -12)
        .attr("y", -35)
        .attr("width", 160)
        .attr("height", 160)
        .attr("fill", "rgba(26, 32, 44, 0.85)")
        .attr("stroke", "#4A5568")
        .attr("rx", 6);
    
    legendGroup.append("text")
        .attr("x", 68)
        .attr("y", -12)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .style("fill", "#A0AEC0")
        .style("text-transform", "uppercase")
        .text("Crimes Criminalized");
    
    var legendItems = [
        { value: 4, label: "4 crimes" },
        { value: 3, label: "3 crimes" },
        { value: 2, label: "2 crimes" },
        { value: 1, label: "1 crime" },
        { value: 0, label: "0 crimes" }
    ];
    
    legendItems.forEach(function(item, i) {
        var itemG = legendGroup.append("g")
            .attr("transform", 'translate(0, ' + (i * legendItemHeight + 5) + ')');
        
        itemG.append("rect")
            .attr("width", 28)
            .attr("height", 16)
            .attr("fill", colorScale(item.value))
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .attr("rx", 2);
        
        itemG.append("text")
            .attr("x", 38)
            .attr("y", 12)
            .style("font-size", "12px")
            .style("fill", "#E2E8F0")
            .text(item.label);
    });
    
    // Title
    var stats = loadedData.stats;
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 28)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "18px")
        .style("font-weight", "700")
        .style("fill", "#E2E8F0")
        .text("Criminalization of the Most Serious International Crimes");
    
    // Subtitle with stats
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 48)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .style("fill", "#A0AEC0")
        .text(stats.atLeastOne + ' of ' + stats.total + ' countries criminalize at least one crime');
}


// ==============================================
// AUTO-INITIALIZATION
// ==============================================

(function autoInit() {
    console.log('[DataLoader] data_loader.js loaded');
    
    async function initWithRealData() {
        console.log('[DataLoader] Auto-initializing charts with real data...');
        try {
            await initChartsWithRealData();
        } catch (error) {
            console.error('[DataLoader] Auto-init failed:', error);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWithRealData);
    } else {
        // DOM already ready - initialize immediately (no delay)
        initWithRealData();
    }
})();
