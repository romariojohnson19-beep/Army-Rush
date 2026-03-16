class Building {
    constructor(id, name, category, icon, description, baseCost, stats, requirements = {}) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.icon = icon;
        this.description = description;
        this.baseCost = baseCost; // { energy: 100, metal: 50, crystals: 0, darkMatter: 0 }
        this.stats = stats; // Production, defense, research bonuses
        this.requirements = requirements; // Unlock requirements
        this.level = 0;
        this.maxLevel = 10;
    }

    getCost(level = this.level + 1) {
        const multiplier = Math.pow(1.5, level - 1);
        const cost = {};
        Object.keys(this.baseCost).forEach(resource => {
            cost[resource] = Math.floor(this.baseCost[resource] * multiplier);
        });
        return cost;
    }

    getStats(level = this.level) {
        const stats = {};
        Object.keys(this.stats).forEach(stat => {
            stats[stat] = this.stats[stat] * level;
        });
        return stats;
    }

    canAfford(resources, level = this.level + 1) {
        const cost = this.getCost(level);
        return Object.keys(cost).every(resource => {
            const resourceKey = resource === 'darkMatter' ? 'darkMatter' : resource;
            return (resources[resourceKey] || 0) >= cost[resource];
        });
    }

    isUnlocked(playerProgress) {
        if (!this.requirements.distance) return true;
        return playerProgress.bestDistance >= this.requirements.distance;
    }
}

class Base {
    constructor(checkpointDistance, tier) {
        this.checkpointDistance = checkpointDistance;
        this.tier = tier;
        this.grid = Array(8).fill(null).map(() => Array(6).fill(null)); // 8x6 grid
        this.buildings = new Map(); // Building instances by position
        this.level = 1;
        this.defenseRating = 0;
        this.productionRates = {
            energy: 0,
            metal: 0,
            crystals: 0,
            darkMatter: 0
        };
        this.researchBonus = 0;
        this.lastUpdate = Date.now();
    }

    addBuilding(x, y, buildingId) {
        if (this.isValidPosition(x, y) && !this.grid[x][y]) {
            const building = new Building(...this.getBuildingData(buildingId));
            building.level = 1;
            this.grid[x][y] = building;
            this.buildings.set(`${x},${y}`, building);
            this.updateBaseStats();
            return true;
        }
        return false;
    }

    removeBuilding(x, y) {
        if (this.grid[x][y]) {
            this.grid[x][y] = null;
            this.buildings.delete(`${x},${y}`);
            this.updateBaseStats();
            return true;
        }
        return false;
    }

    upgradeBuilding(x, y) {
        const building = this.grid[x][y];
        if (building && building.level < building.maxLevel) {
            building.level++;
            this.updateBaseStats();
            return true;
        }
        return false;
    }

    updateBaseStats() {
        // Reset stats
        this.defenseRating = 0;
        this.productionRates = { energy: 0, metal: 0, crystals: 0, darkMatter: 0 };
        this.researchBonus = 0;

        // Calculate from buildings
        this.buildings.forEach(building => {
            const stats = building.getStats();
            this.defenseRating += stats.defense || 0;
            this.researchBonus += stats.research || 0;
            
            Object.keys(this.productionRates).forEach(resource => {
                this.productionRates[resource] += stats[resource] || 0;
            });
        });

        // Base tier bonuses
        const tierMultiplier = this.getTierMultiplier();
        Object.keys(this.productionRates).forEach(resource => {
            this.productionRates[resource] *= tierMultiplier;
        });
    }

    getTierMultiplier() {
        const multipliers = {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 3.0
        };
        return multipliers[this.tier] || 1.0;
    }

    isValidPosition(x, y) {
        return x >= 0 && x < 8 && y >= 0 && y < 6;
    }

    getBuildingData(buildingId) {
        return BUILDING_DEFINITIONS[buildingId] || null;
    }

    // Calculate idle production since last update
    calculateIdleProduction() {
        const now = Date.now();
        const hoursPassed = (now - this.lastUpdate) / (1000 * 60 * 60);
        
        const production = {};
        Object.keys(this.productionRates).forEach(resource => {
            production[resource] = Math.floor(this.productionRates[resource] * hoursPassed);
        });
        
        this.lastUpdate = now;
        return production;
    }

    toSaveData() {
        return {
            checkpointDistance: this.checkpointDistance,
            tier: this.tier,
            grid: this.grid.map(row => row.map(building => 
                building ? { id: building.id, level: building.level } : null
            )),
            level: this.level,
            lastUpdate: this.lastUpdate
        };
    }

    static fromSaveData(data) {
        const base = new Base(data.checkpointDistance, data.tier);
        base.level = data.level;
        base.lastUpdate = data.lastUpdate;
        
        // Restore buildings
        data.grid.forEach((row, x) => {
            row.forEach((buildingData, y) => {
                if (buildingData) {
                    const building = new Building(...base.getBuildingData(buildingData.id));
                    building.level = buildingData.level;
                    base.grid[x][y] = building;
                    base.buildings.set(`${x},${y}`, building);
                }
            });
        });
        
        base.updateBaseStats();
        return base;
    }
}

// Building Definitions
const BUILDING_DEFINITIONS = {
    // Infrastructure Buildings
    'power_generator': [
        'power_generator',
        'Power Generator',
        'infrastructure',
        '⚡',
        'Generates energy to power your base operations. Essential for all advanced buildings.',
        { energy: 0, metal: 100, crystals: 0, darkMatter: 0 },
        { energy: 50 },
        {}
    ],
    
    'command_center': [
        'command_center',
        'Command Center',
        'infrastructure',
        '🏛️',
        'Central hub that increases base efficiency and unlocks advanced buildings.',
        { energy: 200, metal: 300, crystals: 100, darkMatter: 0 },
        { defense: 100, research: 10 },
        {}
    ],
    
    'shield_generator': [
        'shield_generator',
        'Shield Generator',
        'infrastructure',
        '🛡️',
        'Provides defensive barriers to protect your base from enemy attacks.',
        { energy: 300, metal: 200, crystals: 150, darkMatter: 0 },
        { defense: 300 },
        { distance: 10 }
    ],

    // Production Buildings
    'metal_refinery': [
        'metal_refinery',
        'Metal Refinery',
        'production',
        '🔧',
        'Processes raw materials into refined metal for construction and upgrades.',
        { energy: 150, metal: 100, crystals: 0, darkMatter: 0 },
        { metal: 25 },
        {}
    ],
    
    'crystal_harvester': [
        'crystal_harvester',
        'Crystal Harvester',
        'production',
        '💎',
        'Extracts and processes rare crystals needed for advanced technologies.',
        { energy: 200, metal: 250, crystals: 0, darkMatter: 0 },
        { crystals: 15 },
        { distance: 15 }
    ],
    
    'dark_matter_collector': [
        'dark_matter_collector',
        'Dark Matter Collector',
        'production',
        '🌌',
        'Harvests dark matter from space anomalies. Required for legendary upgrades.',
        { energy: 500, metal: 400, crystals: 300, darkMatter: 0 },
        { darkMatter: 5 },
        { distance: 50 }
    ],

    // Military Buildings
    'defense_turret': [
        'defense_turret',
        'Defense Turret',
        'military',
        '🔫',
        'Automated defense system that protects your base from enemy incursions.',
        { energy: 100, metal: 200, crystals: 50, darkMatter: 0 },
        { defense: 150 },
        { distance: 5 }
    ],
    
    'missile_silo': [
        'missile_silo',
        'Missile Silo',
        'military',
        '🚀',
        'Long-range missile system for devastating area attacks on enemy formations.',
        { energy: 400, metal: 600, crystals: 300, darkMatter: 50 },
        { defense: 500 },
        { distance: 25 }
    ],
    
    'ship_dock': [
        'ship_dock',
        'Ship Dock',
        'military',
        '🛸',
        'Maintenance and upgrade facility for your combat vessels.',
        { energy: 300, metal: 400, crystals: 200, darkMatter: 25 },
        { defense: 200, research: 15 },
        { distance: 10 }
    ],

    // Blueprint-unlocked experimental hangar (example unlock)
    'experimental_hangar': [
        'experimental_hangar',
        'Experimental Hangar',
        'military',
        '🛠️',
        'Advanced ship integration bay unlocked by forging Frame Beta.',
        { energy: 500, metal: 800, crystals: 400, darkMatter: 50 },
        { defense: 800, research: 30 },
        { distance: 25, blueprint: 'ship_frame_2' }
    ],

    // Research Buildings
    'research_lab': [
        'research_lab',
        'Research Lab',
        'research',
        '🔬',
        'Advanced laboratory for developing new technologies and ship upgrades.',
        { energy: 250, metal: 300, crystals: 200, darkMatter: 0 },
        { research: 25 },
        { distance: 15 }
    ],
    
    'quantum_computer': [
        'quantum_computer',
        'Quantum Computer',
        'research',
        '🖥️',
        'Processes complex calculations to accelerate research and unlock secrets.',
        { energy: 600, metal: 400, crystals: 500, darkMatter: 100 },
        { research: 50 },
        { distance: 35 }
    ],
    
    'observatory': [
        'observatory',
        'Observatory',
        'research',
        '🔭',
        'Scans deep space for new discoveries and resource opportunities.',
        { energy: 200, metal: 150, crystals: 300, darkMatter: 50 },
        { research: 20, crystals: 10 },
        { distance: 25 }
    ]
};

class BaseBuildingManager {
    constructor() {
        this.bases = new Map(); // checkpointDistance -> Base
        this.currentBase = null;
        this.selectedCategory = 'infrastructure';
        this.unlockedShipFrames = new Set(); // ship frames unlocked via forging
    }

    createBase(checkpointDistance, tier) {
        const base = new Base(checkpointDistance, tier);
        this.bases.set(checkpointDistance, base);
        return base;
    }

    getBase(checkpointDistance) {
        return this.bases.get(checkpointDistance);
    }

    setCurrentBase(checkpointDistance) {
        this.currentBase = this.bases.get(checkpointDistance);
        return this.currentBase;
    }

    getBuildingsByCategory(category) {
        return Object.keys(BUILDING_DEFINITIONS).filter(id => {
            const building = new Building(...BUILDING_DEFINITIONS[id]);
            return building.category === category;
        });
    }

    canBuildAt(x, y) {
        if (!this.currentBase) return false;
        return this.currentBase.isValidPosition(x, y) && !this.currentBase.grid[x][y];
    }

    buildBuilding(x, y, buildingId, resources) {
        if (!this.currentBase) return false;
        
        const building = new Building(...BUILDING_DEFINITIONS[buildingId]);
        const cost = building.getCost(1);
        
        if (!building.canAfford(resources)) return false;
        
        if (this.currentBase.addBuilding(x, y, buildingId)) {
            // Deduct resources
            Object.keys(cost).forEach(resource => {
                const resourceKey = resource === 'darkMatter' ? 'darkMatter' : resource;
                if (resources[resourceKey] !== undefined) {
                    resources[resourceKey] -= cost[resource];
                }
            });
            return true;
        }
        return false;
    }

    upgradeBuilding(x, y, resources) {
        if (!this.currentBase) return false;
        
        const building = this.currentBase.grid[x][y];
        if (!building) return false;
        
        const cost = building.getCost(building.level + 1);
        if (!building.canAfford(resources, building.level + 1)) return false;
        
        if (this.currentBase.upgradeBuilding(x, y)) {
            // Deduct resources
            Object.keys(cost).forEach(resource => {
                const resourceKey = resource === 'darkMatter' ? 'darkMatter' : resource;
                if (resources[resourceKey] !== undefined) {
                    resources[resourceKey] -= cost[resource];
                }
            });
            return true;
        }
        return false;
    }

    demolishBuilding(x, y) {
        if (!this.currentBase) return false;
        return this.currentBase.removeBuilding(x, y);
    }

    // Calculate total production from all bases
    getTotalProduction() {
        const total = { energy: 0, metal: 0, crystals: 0, darkMatter: 0 };
        
        this.bases.forEach(base => {
            Object.keys(total).forEach(resource => {
                total[resource] += base.productionRates[resource];
            });
        });
        
        return total;
    }

    // Get idle production from all bases
    collectIdleResources() {
        const total = { energy: 0, metal: 0, crystals: 0, darkMatter: 0 };
        
        this.bases.forEach(base => {
            const production = base.calculateIdleProduction();
            Object.keys(total).forEach(resource => {
                total[resource] += production[resource];
            });
        });
        
        return total;
    }

    toSaveData() {
        const basesData = {};
        this.bases.forEach((base, distance) => {
            basesData[distance] = base.toSaveData();
        });
        return {
            bases: basesData,
            selectedCategory: this.selectedCategory
            , unlockedShipFrames: Array.from(this.unlockedShipFrames || [])
        };
    }

    fromSaveData(data) {
        if (data.bases) {
            Object.keys(data.bases).forEach(distance => {
                const baseData = data.bases[distance];
                const base = Base.fromSaveData(baseData);
                this.bases.set(parseInt(distance), base);
            });
        }
        this.selectedCategory = data.selectedCategory || 'infrastructure';
        if (data.unlockedShipFrames) {
            this.unlockedShipFrames = new Set(data.unlockedShipFrames);
        }
    }

    // Allow external systems (ShipRegistry / Forge) to register unlocked ship frames so
    // BaseBuildingManager and other code can query them.
    registerShipFrame(key) {
        if (!key) return;
        this.unlockedShipFrames = this.unlockedShipFrames || new Set();
        this.unlockedShipFrames.add(key);
    }
}

// Export for use in other files
window.BaseBuildingManager = BaseBuildingManager;
window.BUILDING_DEFINITIONS = BUILDING_DEFINITIONS;