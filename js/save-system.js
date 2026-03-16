class SaveSystem {
    constructor() {
        this.defaultData = {
            credits: 0,
            bestDistance: 0,
            highScore: 0,
            totalKills: 0,
            missionsFlown: 0,
            bossesKilled: 0,
            creditsEarned: 0,
            upgrades: {
                rapidFire: 0,
                multiCannon: 0,
                armor: 0,
                shield: 0,
                speed: 0
            },
            // Character system data
            unlockedCharacters: ['rookie'],
            selectedCharacter: 'rookie',
            gameStats: {
                bossesKilledThisGame: 0,
                killsThisGame: 0,
                maxDistanceThisGame: 0
            },
            warpCheckpoint: {
                distanceKm: 0,
                portalKm: 0,
                tier: 'common',
                timestamp: 0,
                active: false
            },
            galaxyConquest: {
                resources: {
                    energy: 0,
                    metal: 0,
                    crystals: 0,
                    darkMatter: 0
                },
                distance: 0,
                lastUpdated: 0
            }
        };
        
        this.data = this.loadData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem('armyRushSave');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with default data to ensure all properties exist
                return { 
                    ...this.defaultData, 
                    ...parsed, 
                    upgrades: { ...this.defaultData.upgrades, ...parsed.upgrades },
                    gameStats: { ...this.defaultData.gameStats, ...parsed.gameStats }
                };
            }
        } catch (error) {
            console.warn('Failed to load save data:', error);
        }
        return { ...this.defaultData };
    }

    saveData() {
        try {
            localStorage.setItem('armyRushSave', JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    // Credits
    addCredits(amount) {
        this.data.credits += amount;
        this.data.creditsEarned += amount;
        this.saveData();
    }

    spendCredits(amount) {
        if (this.data.credits >= amount) {
            this.data.credits -= amount;
            this.saveData();
            return true;
        }
        return false;
    }

    getCredits() {
        return this.data.credits;
    }

    // Statistics
    updateStats(gameData) {
        if (gameData.distance > this.data.bestDistance) {
            this.data.bestDistance = gameData.distance;
        }
        
        if (gameData.score > this.data.highScore) {
            this.data.highScore = gameData.score;
        }
        
        this.data.totalKills += gameData.kills;
        this.data.bossesKilled += gameData.bossKills || 0;
        this.data.missionsFlown++;
        
        // Award credits based on performance
        const creditsEarned = Math.floor(gameData.score / 100) + (gameData.kills * 2) + Math.floor(gameData.distance / 100) * 10;
        this.addCredits(creditsEarned);
        
        this.saveData();
        return creditsEarned;
    }

    getAllStats() {
        return this.data;
    }

    setWarpCheckpoint(distanceKm, portalKm = distanceKm, tier = 'common') {
        this.data.warpCheckpoint = {
            distanceKm: distanceKm || 0,
            portalKm: portalKm || distanceKm || 0,
            tier: tier || 'common',
            timestamp: Date.now(),
            active: Boolean(distanceKm)
        };
        this.saveData();
    }

    getWarpCheckpoint() {
        return this.data.warpCheckpoint || null;
    }

    clearWarpCheckpoint() {
        this.data.warpCheckpoint = {
            distanceKm: 0,
            portalKm: 0,
            tier: 'common',
            timestamp: 0,
            active: false
        };
        this.saveData();
    }

    // Galaxy conquest data
    getGalaxyConquestData() {
        return this.data.galaxyConquest || null;
    }

    saveGalaxyConquestData(conquestData = {}) {
        this.data.galaxyConquest = {
            ...this.data.galaxyConquest,
            ...conquestData,
            resources: {
                ...(this.data.galaxyConquest?.resources || {}),
                ...(conquestData.resources || {})
            }
        };
        this.saveData();
        return this.data.galaxyConquest;
    }

    // Upgrades
    buyUpgrade(upgradeType) {
        const costs = {
            rapidFire: [100, 200, 400, 800, 1600],
            multiCannon: [250, 500, 1000],
            armor: [200, 400, 800],
            shield: [500],
            speed: [150, 300, 600, 1200]
        };

        const maxLevels = {
            rapidFire: 5,
            multiCannon: 3,
            armor: 3,
            shield: 1,
            speed: 4
        };

        const currentLevel = this.data.upgrades[upgradeType] || 0;
        
        if (currentLevel >= maxLevels[upgradeType]) {
            return { success: false, reason: 'Max level reached' };
        }

        const cost = costs[upgradeType][currentLevel];
        
        if (this.spendCredits(cost)) {
            this.data.upgrades[upgradeType] = currentLevel + 1;
            this.saveData();
            return { success: true, newLevel: currentLevel + 1 };
        }
        
        return { success: false, reason: 'Insufficient credits' };
    }

    getUpgradeLevel(upgradeType) {
        return this.data.upgrades[upgradeType] || 0;
    }

    getUpgradeCost(upgradeType) {
        const costs = {
            rapidFire: [100, 200, 400, 800, 1600],
            multiCannon: [250, 500, 1000],
            armor: [200, 400, 800],
            shield: [500],
            speed: [150, 300, 600, 1200]
        };

        const currentLevel = this.data.upgrades[upgradeType] || 0;
        return costs[upgradeType][currentLevel] || 0;
    }

    // Get starting bonuses based on upgrades
    getStartingBonuses() {
        return {
            extraLives: this.data.upgrades.armor || 0,
            startWithShield: this.data.upgrades.shield >= 1,
            speedMultiplier: 1 + (this.data.upgrades.speed * 0.15),
            shootRateMultiplier: 1 - (this.data.upgrades.rapidFire * 0.1),
            startingBulletLevel: Math.min(3, 1 + this.data.upgrades.multiCannon)
        };
    }

    // Reset all data (for testing or new game+)
    resetData() {
        this.data = { ...this.defaultData };
        this.saveData();
    }

    exportSave() {
        return JSON.stringify(this.data);
    }

    importSave(saveString) {
        try {
            const imported = JSON.parse(saveString);
            this.data = { ...this.defaultData, ...imported, upgrades: { ...this.defaultData.upgrades, ...imported.upgrades } };
            this.saveData();
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            return false;
        }
    }

    // Upgrade system integration
    getUpgradesData() {
        return this.data.upgradeSystemData || null;
    }

    saveUpgradesData(upgradesData) {
        this.data.upgradeSystemData = upgradesData;
        this.saveData();
    }

    // Update credits from upgrade system 
    updateCreditsFromUpgradeSystem() {
        if (typeof upgradeSystem !== 'undefined') {
            this.data.credits = upgradeSystem.getCurrency();
            this.saveData();
        }
    }
}

// Global save system instance
const saveSystem = new SaveSystem();
if (typeof window !== 'undefined') {
    window.saveSystem = saveSystem;
}