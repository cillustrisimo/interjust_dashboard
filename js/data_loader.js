/**
 * DATA_LOADER.JS
 * ==================================================
 * Central data management for Project Meridian Report
 * 
 * This file contains:
 * 1. DataCounterHub - Centralized counting/processing for Airtable data
 *    (used by charts.js and other modules)
 * 2. DataLoader - Handles loading from Airtable API or CSV fallback
 * 
 * NOTE: The choropleth rendering function (createChart_Section2A) has been
 * moved to charts.js for consistency. This file now calls charts.js functions.
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
    },

    /**
     * Get jurisdiction sankey data for Section 4 visualization
     * Processes all UN Member States and returns data structured for Sankey chart
     * @param {Array} records - Array of Airtable records
     * @returns {Object} - { enrichedStates: Array, regionData: Object, stats: Object }
     */
    getJurisdictionSankeyData: function(records) {
        var self = this;
        
        var unMemberStates = records.filter(function(record) {
            var status = String(record.Status || record.status || "").trim();
            return status === "UN Member State";
        });
        
        if (!unMemberStates.length) {
            console.warn('[DataCounterHub] No UN Member State records found');
            return { enrichedStates: [], regionData: {}, stats: {} };
        }
        
        var keys = Object.keys(unMemberStates[0] || {});
        
        var ujEtjCol = this.COLUMNS.JURISDICTION.UNIVERSAL_EXTRATERRITORIAL;
        if (keys.indexOf(ujEtjCol) === -1) {
            ujEtjCol = keys.find(function(k) {
                return /Jurisdiction\s*[-–]\s*Are there universal or extraterritorial/i.test(k);
            }) || ujEtjCol;
        }
        
        var jurisdictionCols = {
            genocideYes: this.COLUMNS.JURISDICTION.GENOCIDE_YES_PRESENCE,
            genocideNo: this.COLUMNS.JURISDICTION.GENOCIDE_NO_PRESENCE,
            warCrimesYes: this.COLUMNS.JURISDICTION.WAR_CRIMES_YES_PRESENCE,
            warCrimesNo: this.COLUMNS.JURISDICTION.WAR_CRIMES_NO_PRESENCE,
            cahYes: this.COLUMNS.JURISDICTION.CAH_YES_PRESENCE,
            cahNo: this.COLUMNS.JURISDICTION.CAH_NO_PRESENCE,
            aggressionYes: this.COLUMNS.JURISDICTION.AGGRESSION_YES_PRESENCE,
            aggressionNo: this.COLUMNS.JURISDICTION.AGGRESSION_NO_PRESENCE
        };
        
        function parseJurisdictionTypes(record, yesCols, noCols) {
            var types = {
                hasAbsoluteUJ: false,
                hasPresence: false,
                hasActive: false,
                hasPassive: false,
                hasProtective: false,
                hasTreaty: false
            };
            var crimes = [];
            
            var allCols = yesCols.concat(noCols);
            allCols.forEach(function(col) {
                var val = String(record[col] || "").trim();
                if (!val || val.toUpperCase() === "N/A") return;
                
                var parts = val.split(';').map(function(p) { return p.trim().toLowerCase(); });
                parts.forEach(function(part) {
                    if (part.indexOf('uj') !== -1 && part.indexOf('presence') === -1) {
                        types.hasAbsoluteUJ = true;
                    }
                    if (part.indexOf('presence') !== -1) {
                        types.hasPresence = true;
                    }
                    if (part.indexOf('active personality') !== -1 || part.indexOf('active-personality') !== -1) {
                        types.hasActive = true;
                    }
                    if (part.indexOf('passive personality') !== -1 || part.indexOf('passive-personality') !== -1) {
                        types.hasPassive = true;
                    }
                    if (part.indexOf('protective') !== -1) {
                        types.hasProtective = true;
                    }
                    if (part.indexOf('treaty') !== -1 || part.indexOf('section 9') !== -1) {
                        types.hasTreaty = true;
                    }
                });
            });
            
            var crimeCols = [
                { yes: jurisdictionCols.genocideYes, no: jurisdictionCols.genocideNo, name: 'genocide' },
                { yes: jurisdictionCols.warCrimesYes, no: jurisdictionCols.warCrimesNo, name: 'war-crimes' },
                { yes: jurisdictionCols.cahYes, no: jurisdictionCols.cahNo, name: 'cah' },
                { yes: jurisdictionCols.aggressionYes, no: jurisdictionCols.aggressionNo, name: 'aggression' }
            ];
            
            crimeCols.forEach(function(cc) {
                var yesVal = String(record[cc.yes] || "").trim();
                var noVal = String(record[cc.no] || "").trim();
                if ((yesVal && yesVal.toUpperCase() !== "N/A") || (noVal && noVal.toUpperCase() !== "N/A")) {
                    crimes.push(cc.name);
                }
            });
            
            return { types: types, crimes: crimes };
        }
        
        var yesCols = [jurisdictionCols.genocideYes, jurisdictionCols.warCrimesYes, jurisdictionCols.cahYes, jurisdictionCols.aggressionYes];
        var noCols = [jurisdictionCols.genocideNo, jurisdictionCols.warCrimesNo, jurisdictionCols.cahNo, jurisdictionCols.aggressionNo];
        
        var enrichedStates = [];
        var regionOrder = ['Africa', 'Asia', 'Caribbean', 'Central America', 'Europe', 'Middle East & North Africa', 'North America', 'Oceania', 'South America'];
        
        unMemberStates.forEach(function(record) {
            var countryName = record[self.COLUMNS.IDENTIFIERS.COUNTRY] || record.Country || "Unknown";
            var regionRaw = record[self.COLUMNS.IDENTIFIERS.REGION] || record.Region || "";
            var region = self.normalizeRegion(regionRaw);
            
            var parsed = parseJurisdictionTypes(record, yesCols, noCols);
            var types = parsed.types;
            var crimes = parsed.crimes;
            
            var hasBeyondBorders = types.hasAbsoluteUJ || types.hasPresence || 
                                   types.hasActive || types.hasPassive || 
                                   types.hasProtective || types.hasTreaty;
            
            var typeCount = 0;
            if (types.hasAbsoluteUJ) typeCount++;
            if (types.hasPresence) typeCount++;
            if (types.hasActive) typeCount++;
            if (types.hasPassive) typeCount++;
            if (types.hasProtective) typeCount++;
            if (types.hasTreaty) typeCount++;
            
            enrichedStates.push({
                country: countryName,
                region: region,
                hasBeyondBorders: hasBeyondBorders,
                hasAbsoluteUJ: types.hasAbsoluteUJ,
                hasPresence: types.hasPresence,
                hasActive: types.hasActive,
                hasPassive: types.hasPassive,
                hasProtective: types.hasProtective,
                hasTreaty: types.hasTreaty,
                typeCount: typeCount,
                crimes: crimes
            });
        });
        
        var regionDataMap = {};
        regionOrder.forEach(function(r) {
            regionDataMap[r] = { withJurisdiction: [], withoutJurisdiction: [] };
        });
        
        enrichedStates.forEach(function(s) {
            if (regionDataMap[s.region]) {
                if (s.hasBeyondBorders) {
                    regionDataMap[s.region].withJurisdiction.push(s.country);
                } else {
                    regionDataMap[s.region].withoutJurisdiction.push(s.country);
                }
            }
        });
        
        Object.values(regionDataMap).forEach(function(r) {
            r.withJurisdiction.sort();
            r.withoutJurisdiction.sort();
        });
        
        var stats = {
            total: enrichedStates.length,
            beyondBorders: enrichedStates.filter(function(s) { return s.hasBeyondBorders; }).length,
            absoluteUJ: enrichedStates.filter(function(s) { return s.hasAbsoluteUJ; }).length,
            presenceOnly: enrichedStates.filter(function(s) { return s.hasPresence; }).length,
            activePersonality: enrichedStates.filter(function(s) { return s.hasActive; }).length,
            passivePersonality: enrichedStates.filter(function(s) { return s.hasPassive; }).length,
            protectivePrinciple: enrichedStates.filter(function(s) { return s.hasProtective; }).length,
            treatyObligation: enrichedStates.filter(function(s) { return s.hasTreaty; }).length
        };
        
        return {
            enrichedStates: enrichedStates,
            regionData: regionDataMap,
            regionOrder: regionOrder,
            stats: stats
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
        // Now calls createChart_Section2A in charts.js (with data parameter)
        console.log('[Charts] Creating choropleth with real data...');
        if (typeof createChart_Section2A === 'function') {
            createChart_Section2A('chart-section-2a', data);
        }
        
        // Initialize other charts
        if (typeof createChart_Section3 === 'function') {
            createChart_Section3('chart-section-3');
        }
        if (typeof createChart_Section4A === 'function') {
            createChart_Section4A('chart-section-4a');
        }
        if (typeof createChart_Section5A === 'function') {
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
        }
        if (typeof createChart_Section5A === 'function') {
            createChart_Section5A('chart-section-5a');
            createChart_Section5B('chart-section-5b');
        }
    }
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