/**
 * PLACEHOLDER_FILLER.JS
 * ==================================================
 * Fills statistic placeholders in the DOM.
 * 
 *   TWO-PHASE LOADING:
 * 1. INSTANT: Fill placeholders from cached STATS_SNAPSHOT
 * 2. BACKGROUND: Calculate live stats from Airtable
 * 3. SYNC: If live differs from cache, update DOM and cache
 * 
 * FIXED: Added robust column name matching to handle trailing spaces
 * ==================================================
 */

var PlaceholderFiller = {
    stats: null,
    filled: false,
    
    /**
     * PHASE 1: Fill placeholders instantly from snapshot (no waiting)
     */
    fillFromSnapshot: function() {
        if (typeof STATS_SNAPSHOT === 'undefined') {
            console.log('[PlaceholderFiller] No snapshot available');
            return false;
        }
        
        console.log('[PlaceholderFiller] Phase 1: Instant fill from cache');
        this.stats = STATS_SNAPSHOT;
        this.fillAllPlaceholders(STATS_SNAPSHOT);
        this.filled = true;
        return true;
    },
    
    /**
     * PHASE 2: Calculate live stats and sync cache if needed
     */
    syncWithLiveData: function() {
        var self = this;
        
        console.log('[PlaceholderFiller] Phase 2: Background live calculation...');
        
        // Wait for DataLoader to have data
        function attemptSync() {
            if (typeof DataLoader === 'undefined') {
                console.log('[PlaceholderFiller] DataLoader not available, skipping sync');
                return;
            }
            
            // Check if data is already cached
            if (DataLoader._cache && DataLoader._cache.airtable) {
                self.processLiveData(DataLoader._cache.airtable);
            } else {
                // Wait for data to load
                DataLoader.fetchAirtableData().then(function(records) {
                    self.processLiveData(records);
                }).catch(function(err) {
                    console.warn('[PlaceholderFiller] Could not fetch live data:', err);
                });
            }
        }
        
        // Delay slightly to not block initial render
        setTimeout(attemptSync, 100);
    },
    
    /**
     * Process live data: calculate stats, compare, update if needed
     */
    processLiveData: function(records) {
        console.log('[PlaceholderFiller] Processing live data...');
        
        var liveStats = this.calculateAllStats(records);
        
        // Check if cache needs updating
        if (typeof StatsSnapshot !== 'undefined') {
            var changed = StatsSnapshot.updateIfChanged(liveStats);
            
            if (changed) {
                console.log('[PlaceholderFiller] Updating DOM with fresh values');
                this.fillAllPlaceholders(liveStats);
                this.stats = liveStats;
            }
        }
        
        console.log('[PlaceholderFiller] Sync complete');
    },
    
    /**
     * Find a column by pattern matching (handles trailing spaces, variations)
     */
    findColumn: function(keys, patterns) {
        // patterns is an array of regex patterns to try
        for (var i = 0; i < patterns.length; i++) {
            var found = keys.find(function(k) {
                return patterns[i].test(k);
            });
            if (found) return found;
        }
        return null;
    },
    
    /**
     * Calculate all statistics from Airtable records
     */
    calculateAllStats: function(records) {
        var self = this;
        
        // Filter to UN Member States only
        var unMembers = records.filter(function(r) {
            return r['Status'] === 'UN Member State';
        });
        
        // Get all column names from first record
        var keys = Object.keys(unMembers[0] || {});
        
        // Column patterns for robust matching (handles trailing spaces, slight variations)
        var COLS = {
            HAS_AT_LEAST_ONE: self.findColumn(keys, [
                /^Does the country have at least one criminalized international crime\??\s*$/i
            ]) || 'Does the country have at least one criminalized international crime?',
            
            GENOCIDE: self.findColumn(keys, [
                /^Genocide\s*-\s*Does the country criminalize genocide\??\s*$/i
            ]) || 'Genocide - Does the country criminalize genocide?',
            
            WAR_CRIMES: self.findColumn(keys, [
                /^War Crimes\s*-\s*Does the country criminalize war crimes\??\s*$/i
            ]) || 'War Crimes - Does the country criminalize war crimes?',
            
            CAH: self.findColumn(keys, [
                /^Crimes Against Humanity\s*-\s*Does the country criminalize crimes against humanity\??\s*$/i
            ]) || 'Crimes Against Humanity - Does the country criminalize crimes against humanity?',
            
            AGGRESSION: self.findColumn(keys, [
                /^Aggression\s*-\s*Does the country criminalize the international.*crime of aggression.*\??\s*$/i
            ]) || 'Aggression - Does the country criminalize the international "crime of aggression" or the "crimes against peace"?',
            
            COMMAND_RESP: self.findColumn(keys, [
                /^Command or Superior Responsibility\s*-\s*Does the country have a domestic provision.*\??\s*$/i
            ]) || 'Command or Superior Responsibility - Does the country have a domestic provision regarding command or superior responsibility?',
            
            GENOCIDE_NO_PRESENCE: self.findColumn(keys, [
                /^Jurisdiction GENOCIDE\s*-\s*NO perpetrator presence\s*$/i
            ]) || 'Jurisdiction GENOCIDE - NO perpetrator presence',
            
            GENOCIDE_YES_PRESENCE: self.findColumn(keys, [
                /^Jurisdiction GENOCIDE\s*-\s*YES perpetrator presence\s*$/i
            ]) || 'Jurisdiction GENOCIDE - YES perpetrator presence',
            
            WAR_CRIMES_NO_PRESENCE: self.findColumn(keys, [
                /^Jurisdiction WAR CRIMES\s*-\s*NO perpetrator presence\s*$/i
            ]) || 'Jurisdiction WAR CRIMES - NO perpetrator presence',
            
            WAR_CRIMES_YES_PRESENCE: self.findColumn(keys, [
                /^Jurisdiction WAR CRIMES\s*-\s*YES perpetrator presence\s*$/i
            ]) || 'Jurisdiction WAR CRIMES - YES perpetrator presence',
            
            CAH_NO_PRESENCE: self.findColumn(keys, [
                /^Jurisdiction CRIMES AGAINST HUMANITY\s*-\s*NO perpetrator presence\s*$/i
            ]) || 'Jurisdiction CRIMES AGAINST HUMANITY - NO perpetrator presence',
            
            CAH_YES_PRESENCE: self.findColumn(keys, [
                /^Jurisdiction CRIMES AGAINST HUMANITY\s*-\s*YES perpetrator presence\s*$/i
            ]) || 'Jurisdiction CRIMES AGAINST HUMANITY - YES perpetrator presence',
            
            AGGRESSION_NO_PRESENCE: self.findColumn(keys, [
                /^Jurisdiction AGGRESSION\s*-\s*NO perpetrator presence\s*$/i
            ]) || 'Jurisdiction AGGRESSION - NO perpetrator presence',
            
            AGGRESSION_YES_PRESENCE: self.findColumn(keys, [
                /^Jurisdiction AGGRESSION\s*-\s*YES perpetrator presence\s*$/i
            ]) || 'Jurisdiction AGGRESSION - YES perpetrator presence',
            
            ROME_STATUTE: self.findColumn(keys, [
                /^Rome Statute.*Has the country signed or ratified.*\??\s*$/i
            ]) || 'Rome Statute of the International Criminal Court - Has the country signed or ratified the Rome Statute?',
            
            // FIXED: This column name had a trailing space causing lookup failures
            HAS_CASE: self.findColumn(keys, [
                /^Jurisprudence\s*[-–]\s*Has the country had a UJ or ETJ case\??\s*$/i
            ]) || 'Jurisprudence - Has the country had a UJ or ETJ case?',
            
            HAS_UNIT: self.findColumn(keys, [
                /^Practice\s*[-–]\s*Is there a specialized unit for investigating international crimes\??\s*$/i
            ]) || 'Practice - Is there a specialized unit for investigating international crimes?'
        };
        
        console.log('[PlaceholderFiller] Column mapping:', {
            HAS_CASE: COLS.HAS_CASE,
            HAS_UNIT: COLS.HAS_UNIT
        });
        
        var ALL_JURIS_COLS = [
            COLS.GENOCIDE_NO_PRESENCE, COLS.GENOCIDE_YES_PRESENCE,
            COLS.WAR_CRIMES_NO_PRESENCE, COLS.WAR_CRIMES_YES_PRESENCE,
            COLS.CAH_NO_PRESENCE, COLS.CAH_YES_PRESENCE,
            COLS.AGGRESSION_NO_PRESENCE, COLS.AGGRESSION_YES_PRESENCE
        ];
        
        var NO_PRESENCE_COLS = [
            COLS.GENOCIDE_NO_PRESENCE, COLS.WAR_CRIMES_NO_PRESENCE,
            COLS.CAH_NO_PRESENCE, COLS.AGGRESSION_NO_PRESENCE
        ];
        
        var YES_PRESENCE_COLS = [
            COLS.GENOCIDE_YES_PRESENCE, COLS.WAR_CRIMES_YES_PRESENCE,
            COLS.CAH_YES_PRESENCE, COLS.AGGRESSION_YES_PRESENCE
        ];
        
        function isYes(value) {
            if (!value) return false;
            return String(value).toLowerCase().trim() === 'yes';
        }
        
        function hasJurisdictionValue(value) {
            if (!value) return false;
            if (Array.isArray(value)) {
                return value.some(function(v) {
                    return v && String(v).trim() !== '' && String(v).trim().toUpperCase() !== 'N/A';
                });
            }
            var str = String(value).trim();
            return str !== '' && str.toUpperCase() !== 'N/A';
        }
        
        function jurisdictionContains(value, searchTerm) {
            if (!value) return false;
            var searchLower = searchTerm.toLowerCase();
            if (Array.isArray(value)) {
                return value.some(function(v) {
                    return v && String(v).toLowerCase().indexOf(searchLower) !== -1;
                });
            }
            return String(value).toLowerCase().indexOf(searchLower) !== -1;
        }
        
        // Match data_loader.js logic exactly: split by ';' and check each part
        function jurisdictionPartContains(value, searchTerm, excludeTerm) {
            if (!value) return false;
            var valStr = Array.isArray(value) ? value.join(';') : String(value);
            var parts = valStr.split(';').map(function(p) { return p.trim().toLowerCase(); });
            return parts.some(function(part) {
                if (!part || part === 'n/a') return false;
                var hasSearch = part.indexOf(searchTerm.toLowerCase()) !== -1;
                if (excludeTerm) {
                    return hasSearch && part.indexOf(excludeTerm.toLowerCase()) === -1;
                }
                return hasSearch;
            });
        }
        
        // Initialize stats
        var stats = {
            totalCountries: unMembers.length,
            criminalization: {
                atLeastOne: 0,
                allFour: 0,
                warCrimes: 0,
                genocide: 0,
                crimesAgainstHumanity: 0,
                aggression: 0
            },
            commandResponsibility: 0,
            jurisdiction: {
                anyJurisdiction: 0,
                absoluteUJ: 0,
                presenceRequired: 0,
                activePersonality: 0,
                passivePersonality: 0,
                protectivePrinciple: 0,
                treatyBased: 0
            },
            practice: {
                hasLaunchedCase: 0,
                hasSpecializedUnit: 0
            }
        };
        
        // Process each UN Member State
        unMembers.forEach(function(record) {
            var hasGenicide = isYes(record[COLS.GENOCIDE]);
            var hasWarCrimes = isYes(record[COLS.WAR_CRIMES]);
            var hasCAH = isYes(record[COLS.CAH]);
            var hasAggression = isYes(record[COLS.AGGRESSION]);
            
            if (hasGenicide) stats.criminalization.genocide++;
            if (hasWarCrimes) stats.criminalization.warCrimes++;
            if (hasCAH) stats.criminalization.crimesAgainstHumanity++;
            if (hasAggression) stats.criminalization.aggression++;
            
            if (isYes(record[COLS.HAS_AT_LEAST_ONE])) {
                stats.criminalization.atLeastOne++;
            }
            
            if (hasGenicide && hasWarCrimes && hasCAH && hasAggression) {
                stats.criminalization.allFour++;
            }
            
            if (isYes(record[COLS.COMMAND_RESP])) {
                stats.commandResponsibility++;
            }
            
            var hasAnyJuris = ALL_JURIS_COLS.some(function(col) {
                return hasJurisdictionValue(record[col]);
            });
            if (hasAnyJuris) {
                stats.jurisdiction.anyJurisdiction++;
            }
            
            // Match data_loader.js logic exactly for all jurisdiction types:
            // Absolute UJ: contains 'uj' but NOT 'presence'
            var hasAbsolute = ALL_JURIS_COLS.some(function(col) {
                return jurisdictionPartContains(record[col], 'uj', 'presence');
            });
            if (hasAbsolute) {
                stats.jurisdiction.absoluteUJ++;
            }
            
            // Presence-based: contains 'presence'
            var hasConditional = ALL_JURIS_COLS.some(function(col) {
                return jurisdictionPartContains(record[col], 'presence');
            });
            if (hasConditional) {
                stats.jurisdiction.presenceRequired++;
            }
            
            // Active Personality: contains 'active personality' or 'active-personality'
            var hasActive = ALL_JURIS_COLS.some(function(col) {
                return jurisdictionPartContains(record[col], 'active personality') || 
                       jurisdictionPartContains(record[col], 'active-personality');
            });
            
            // Passive Personality: contains 'passive personality' or 'passive-personality'
            var hasPassive = ALL_JURIS_COLS.some(function(col) {
                return jurisdictionPartContains(record[col], 'passive personality') ||
                       jurisdictionPartContains(record[col], 'passive-personality');
            });
            
            // Protective Principle: contains 'protective'
            var hasProtective = ALL_JURIS_COLS.some(function(col) {
                return jurisdictionPartContains(record[col], 'protective');
            });

            if (hasActive) stats.jurisdiction.activePersonality++;
            if (hasPassive) stats.jurisdiction.passivePersonality++;
            if (hasProtective) stats.jurisdiction.protectivePrinciple++;
            
            // Treaty-based: contains 'treaty' or 'section 9'
            var hasTreaty = ALL_JURIS_COLS.some(function(col) {
                return jurisdictionPartContains(record[col], 'treaty') || 
                       jurisdictionPartContains(record[col], 'section 9');
            });
            if (hasTreaty) stats.jurisdiction.treatyBased++;
            
            // Practice - FIXED: Using dynamically found column names
            if (isYes(record[COLS.HAS_CASE])) {
                stats.practice.hasLaunchedCase++;
            }
            if (isYes(record[COLS.HAS_UNIT])) {
                stats.practice.hasSpecializedUnit++;
            }
        });
        
        // Calculate percentages
        stats.percentages = {
            atLeastOneCrime: Math.round((stats.criminalization.atLeastOne / stats.totalCountries) * 100),
            hasUsedLaws: stats.jurisdiction.anyJurisdiction > 0 
                ? Math.round((stats.practice.hasLaunchedCase / stats.jurisdiction.anyJurisdiction) * 100)
                : 0
        };
        
        console.log('[PlaceholderFiller] Calculated stats:', {
            hasLaunchedCase: stats.practice.hasLaunchedCase,
            hasSpecializedUnit: stats.practice.hasSpecializedUnit,
            hasUsedLaws: stats.percentages.hasUsedLaws
        });
        
        return stats;
    },
    
    /**
     * Fill all placeholders in the DOM
     */
    fillAllPlaceholders: function(stats) {
        var placeholders = [
            { id: 'stat-intro-jurisdiction', value: stats.jurisdiction.anyJurisdiction },
            { id: 'stat-criminalization-at-least-one', value: stats.criminalization.atLeastOne },
            { id: 'stat-criminalization-percent', value: stats.percentages.atLeastOneCrime },
            { id: 'stat-criminalization-all-four', value: stats.criminalization.allFour },
            { id: 'stat-command-responsibility', value: stats.commandResponsibility },
            { id: 'stat-jurisdiction-any', value: stats.jurisdiction.anyJurisdiction },
            { id: 'stat-jurisdiction-absolute', value: stats.jurisdiction.absoluteUJ },
            { id: 'stat-jurisdiction-presence', value: stats.jurisdiction.presenceRequired },
            { id: 'stat-jurisdiction-active', value: stats.jurisdiction.activePersonality },
            { id: 'stat-jurisdiction-passive', value: stats.jurisdiction.passivePersonality },
            { id: 'stat-jurisdiction-protective', value: stats.jurisdiction.protectivePrinciple },
            { id: 'stat-jurisdiction-treaty', value: stats.jurisdiction.treatyBased },
            { id: 'stat-cases-launched', value: stats.practice.hasLaunchedCase },
            { id: 'stat-jurisdiction-for-gap', value: stats.jurisdiction.anyJurisdiction },
            { id: 'stat-jurisdiction-any-2', value: stats.jurisdiction.anyJurisdiction },
            { id: 'stat-percent-used-laws', value: stats.percentages.hasUsedLaws },
            { id: 'stat-specialized-units', value: stats.practice.hasSpecializedUnit }
        ];
        
        var filledCount = 0;
        placeholders.forEach(function(item) {
            var element = document.getElementById(item.id);
            if (element) {
                element.textContent = item.value;
                element.classList.remove('stat-placeholder');
                element.classList.add('stat-filled');
                filledCount++;
            }
        });
        
        console.log('[PlaceholderFiller] Filled', filledCount, 'placeholders');
    },
    
    /**
     * Initialize: instant fill + background sync
     */
    init: function() {
        console.log('[PlaceholderFiller] Initializing...');
        
        // Phase 1: Instant fill from cache
        var hasSnapshot = this.fillFromSnapshot();
        
        // Phase 2: Background sync with live data
        this.syncWithLiveData();
        
        if (!hasSnapshot) {
            console.log('[PlaceholderFiller] No snapshot, waiting for live data...');
        }
    }
};

// ==============================================
// INSTANT INITIALIZATION
// ==============================================

(function instantInit() {
    if (document.readyState !== 'loading') {
        PlaceholderFiller.init();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            PlaceholderFiller.init();
        });
    }
})();

// Export for manual use
window.PlaceholderFiller = PlaceholderFiller;
