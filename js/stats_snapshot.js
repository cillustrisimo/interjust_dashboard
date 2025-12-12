/**
 * STATS_SNAPSHOT.JS
 * ==================================================
 * Self-updating statistics cache.
 * 1. On load: Returns cached stats from localStorage (instant)
 * 2. Falls back to hardcoded defaults if no cache exists
 * 3. When PlaceholderFiller calculates live stats, it calls
 *    StatsSnapshot.updateIfChanged() to sync the cache
 * 4. Next page load uses the updated cached values
 * ==================================================
 */

var StatsSnapshot = {
    // localStorage key
    STORAGE_KEY: 'meridian_stats_cache',
    
    // Hardcoded defaults (fallback if no cache exists)
    // These values are used on first-ever visit
    DEFAULTS: {
        totalCountries: 193,
        
        criminalization: {
            atLeastOne: 153,
            allFour: 32,
            warCrimes: 148,
            genocide: 131,
            crimesAgainstHumanity: 94,
            aggression: 86
        },
        
        commandResponsibility: 82,
        
        jurisdiction: {
            anyJurisdiction: 148,
            absoluteUJ: 97,
            presenceRequired: 128,
            activePersonality: 98,
            passivePersonality: 73,
            protectivePrinciple: 52,
            treatyBased: 121
        },
        
        practice: {
            hasLaunchedCase: 26,
            hasSpecializedUnit: 26
        },
        
        percentages: {
            atLeastOneCrime: 79,
            hasUsedLaws: 18
        }
    },
    
    /**
     * Get cached stats from localStorage, or return defaults
     */
    get: function() {
        try {
            var cached = localStorage.getItem(this.STORAGE_KEY);
            if (cached) {
                var parsed = JSON.parse(cached);
                console.log('[StatsSnapshot] Loaded from cache (last updated: ' + (parsed._meta?.updatedAt || 'unknown') + ')');
                return parsed;
            }
        } catch (e) {
            console.warn('[StatsSnapshot] Error reading cache:', e);
        }
        
        console.log('[StatsSnapshot] Using hardcoded defaults (first visit)');
        return this.DEFAULTS;
    },
    
    /**
     * Save stats to localStorage
     */
    save: function(stats) {
        try {
            // Add metadata
            var toSave = Object.assign({}, stats, {
                _meta: {
                    updatedAt: new Date().toISOString(),
                    source: 'live-calculation'
                }
            });
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toSave));
            console.log('[StatsSnapshot] Cache updated');
            return true;
        } catch (e) {
            console.warn('[StatsSnapshot] Error saving cache:', e);
            return false;
        }
    },
    
    /**
     * Compare two stats objects and check if they differ
     */
    hasChanged: function(oldStats, newStats) {
        // Compare key values
        var dominated = [
            ['criminalization', 'atLeastOne'],
            ['criminalization', 'allFour'],
            ['commandResponsibility'],
            ['jurisdiction', 'anyJurisdiction'],
            ['jurisdiction', 'absoluteUJ'],
            ['jurisdiction', 'presenceRequired'],
            ['practice', 'hasLaunchedCase'],
            ['practice', 'hasSpecializedUnit']
        ];
        
        for (var i = 0; i < dominated.length; i++) {
            var path = dominated[i];
            var oldVal, newVal;
            
            if (path.length === 1) {
                oldVal = oldStats[path[0]];
                newVal = newStats[path[0]];
            } else {
                oldVal = oldStats[path[0]] && oldStats[path[0]][path[1]];
                newVal = newStats[path[0]] && newStats[path[0]][path[1]];
            }
            
            if (oldVal !== newVal) {
                console.log('[StatsSnapshot] Change detected:', path.join('.'), oldVal, '->', newVal);
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * Update cache if new stats differ from cached stats
     * Called by PlaceholderFiller after live calculation
     */
    updateIfChanged: function(newStats) {
        var cached = this.get();
        
        if (this.hasChanged(cached, newStats)) {
            console.log('[StatsSnapshot] Data has changed, updating cache...');
            this.save(newStats);
            return true;
        } else {
            console.log('[StatsSnapshot] No changes detected, cache is current');
            return false;
        }
    },
    
    /**
     * Clear the cache (for debugging)
     */
    clear: function() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('[StatsSnapshot] Cache cleared');
        } catch (e) {
            console.warn('[StatsSnapshot] Error clearing cache:', e);
        }
    }
};

// Initialize STATS_SNAPSHOT global variable immediately
var STATS_SNAPSHOT = StatsSnapshot.get();

// Make available globally
window.StatsSnapshot = StatsSnapshot;
window.STATS_SNAPSHOT = STATS_SNAPSHOT;
