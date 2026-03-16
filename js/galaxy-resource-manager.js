class GalaxyResourceManager {
    constructor(saveSystem) {
        this.saveSystem = saveSystem || this.getGlobalSaveSystem();
        this.resources = {
            energy: 1000,    // Primary resource for ship operations
            metal: 500,      // Building materials and ship hulls
            crystals: 100,   // Advanced technology and upgrades
            darkMatter: 0    // Rare resource for ultimate upgrades
        };
        
        // Load saved resources
        this.loadResources();
        
        // Resource generation rates (per second when bases are built)
        this.baseProduction = {
            energy: 0,
            metal: 0,
            crystals: 0,
            darkMatter: 0
        };
        
        // Resource caps based on base infrastructure
        this.resourceCaps = {
            energy: 5000,
            metal: 2500,
            crystals: 1000,
            darkMatter: 500
        };
        
        // Combat drop rates (resources from destroyed enemies)
        this.combatDropRates = {
            basic: { energy: [1, 3], metal: [0, 1], crystals: [0, 0] },
            fast: { energy: [2, 4], metal: [1, 2], crystals: [0, 1] },
            tank: { energy: [3, 6], metal: [2, 4], crystals: [0, 1] },
            boss: { energy: [20, 40], metal: [15, 25], crystals: [5, 15], darkMatter: [0, 1] },
            miniboss: { energy: [50, 100], metal: [25, 50], crystals: [10, 25], darkMatter: [1, 3] }
        };

        // Blueprint shards and ship blueprints
        this.blueprints = {}; // key -> count
        this.unlockedBlueprints = {}; // key -> true when forged/unlocked
    }

    // Resource Management
    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            const newAmount = Math.min(
                this.resources[type] + amount, 
                this.resourceCaps[type]
            );
            this.resources[type] = newAmount;
            this.saveResources();
            return amount;
        }
        return 0;
    }

    // Blueprints management (for Ship Forge / long-term progression)
    addBlueprint(key, amount = 1) {
        if (!key) return 0;
        this.blueprints[key] = (this.blueprints[key] || 0) + amount;
        this.saveResources();
        return amount;
    }

    // Spend blueprint shards (returns true if successful)
    spendBlueprint(key, amount = 1) {
        if (!key || !this.blueprints[key] || this.blueprints[key] < amount) return false;
        this.blueprints[key] -= amount;
        if (this.blueprints[key] <= 0) delete this.blueprints[key];
        this.saveResources();
        return true;
    }

    // Unlock a blueprint (permanent unlock for forge)
    unlockBlueprint(key) {
        if (!key) return false;
        this.unlockedBlueprints[key] = true;
        this.saveResources();
        return true;
    }

    isBlueprintUnlocked(key) {
        return !!(this.unlockedBlueprints && this.unlockedBlueprints[key]);
    }

    // Spend blueprint shards (returns true if successful)
    spendBlueprint(key, amount = 1) {
        if (!key || !this.blueprints[key] || this.blueprints[key] < amount) return false;
        this.blueprints[key] -= amount;
        if (this.blueprints[key] <= 0) delete this.blueprints[key];
        this.saveResources();
        return true;
    }

    getBlueprints() {
        return { ...this.blueprints };
    }

    spendResource(type, amount) {
        if (this.resources.hasOwnProperty(type) && this.resources[type] >= amount) {
            this.resources[type] -= amount;
            this.saveResources();
            return true;
        }
        return false;
    }

    canAfford(costs) {
        for (const [resource, cost] of Object.entries(costs)) {
            if (this.resources[resource] < cost) {
                return false;
            }
        }
        return true;
    }

    spendResources(costs) {
        if (!this.canAfford(costs)) return false;
        
        for (const [resource, cost] of Object.entries(costs)) {
            this.spendResource(resource, cost);
        }
        return true;
    }

    // Combat drops when enemies are destroyed
    generateCombatDrop(enemyType, autoCollect = true) {
        const drops = this.combatDropRates[enemyType] || this.combatDropRates.basic;
        const collected = {};
        
        for (const [resource, range] of Object.entries(drops)) {
            if (range[1] > 0) {
                const amount = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
                if (amount > 0) {
                    collected[resource] = amount;
                    if (autoCollect) {
                        this.addResource(resource, amount);
                    }
                }
            }
        }
        
        return collected;
    }

    // Enhanced combat drop with distance scaling and rare drops
    generateCombatDropWithDistance(enemyType, distanceKm = 0, isMegaBoss = false) {
        const baseDrops = this.combatDropRates[enemyType] || this.combatDropRates.basic;
        const collected = {};
        
        // Distance-based multiplier (increases rare resource drops)
        const distanceMultiplier = 1 + (distanceKm / 100);
        
        // Generate base drops
        for (const [resource, range] of Object.entries(baseDrops)) {
            if (range[1] > 0) {
                const amount = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
                if (amount > 0) {
                    collected[resource] = Math.ceil(amount * distanceMultiplier);
                    this.addResource(resource, collected[resource]);
                }
            }
        }
        
        // Mega boss special drops
        if (isMegaBoss) {
            // Guaranteed dark matter
            const extraDarkMatter = 5 + Math.floor(distanceKm / 20);
            collected.darkMatter = (collected.darkMatter || 0) + extraDarkMatter;
            this.addResource('darkMatter', extraDarkMatter);
            
            // Random rare blueprint shards
            if (Math.random() < 0.3) {
                const blueprintTypes = ['ship_frame_1', 'ship_frame_2', 'ship_frame_3', 'engine_upgrade_1', 'armor_plate_1'];
                const choice = blueprintTypes[Math.floor(Math.random() * blueprintTypes.length)];
                const shardCount = 1 + Math.floor(Math.random() * 3);
                this.addBlueprint(choice, shardCount);
                collected.blueprints = { ...collected.blueprints, [choice]: shardCount };
            }
        }
        
        // Rare drops increase with distance (dark matter especially)
        if (distanceKm > 15 && Math.random() < (distanceKm / 200)) {
            const rareAmount = 1 + Math.floor(Math.random() * Math.floor(distanceKm / 30));
            collected.darkMatter = (collected.darkMatter || 0) + rareAmount;
            this.addResource('darkMatter', rareAmount);
        }
        
        return collected;
    }

    // Base Production System
    updateBaseProduction() {
        // This will be called by the base manager to update production rates
        for (const [resource, rate] of Object.entries(this.baseProduction)) {
            if (rate > 0) {
                this.addResource(resource, rate / 60); // Convert per-second to per-frame
            }
        }
    }

    setProductionRate(resource, rate) {
        this.baseProduction[resource] = rate;
    }

    increaseResourceCap(resource, amount) {
        this.resourceCaps[resource] += amount;
    }

    // Save/Load System
    saveResources() {
        const resourceData = {
            resources: this.resources,
            baseProduction: this.baseProduction,
            resourceCaps: this.resourceCaps
        };
        if (this.saveSystem && typeof this.saveSystem.setGalaxyResources === 'function') {
            this.saveSystem.setGalaxyResources(resourceData);
        } else if (this.hasLocalStorage()) {
            localStorage.setItem('galaxyResources', JSON.stringify(resourceData));
        }
    }

    loadResources() {
        let saved = null;
        if (this.saveSystem && typeof this.saveSystem.getGalaxyResources === 'function') {
            saved = this.saveSystem.getGalaxyResources();
        }

        if (!saved && this.hasLocalStorage()) {
            try {
                const stored = localStorage.getItem('galaxyResources');
                if (stored) {
                    saved = JSON.parse(stored);
                }
            } catch (err) {
                console.warn('Failed to parse galaxyResources from localStorage', err);
            }
        }

        if (saved) {
            this.resources = { ...this.resources, ...saved.resources };
            this.baseProduction = { ...this.baseProduction, ...(saved.baseProduction || {}) };
            this.resourceCaps = { ...this.resourceCaps, ...(saved.resourceCaps || {}) };
            if (saved.blueprints) {
                this.blueprints = { ...this.blueprints, ...saved.blueprints };
            }
            if (saved.unlockedBlueprints) {
                this.unlockedBlueprints = { ...this.unlockedBlueprints, ...saved.unlockedBlueprints };
            }
        }
    }

    getGlobalSaveSystem() {
        if (typeof window !== 'undefined' && window.saveSystem) {
            return window.saveSystem;
        }
        return undefined;
    }

    hasLocalStorage() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return false;
            }
            const testKey = '__galaxy_resource_test__';
            window.localStorage.setItem(testKey, '1');
            window.localStorage.removeItem(testKey);
            return true;
        } catch (err) {
            return false;
        }
    }

    // Get current resources for UI display
    getResources() {
        return { ...this.resources };
    }

    getResourceCaps() {
        return { ...this.resourceCaps };
    }

    getProductionRates() {
        return { ...this.baseProduction };
    }

    // Resource conversion and trading
    convertResources(fromResource, toResource, ratio = 2) {
        const convertAmount = Math.floor(this.resources[fromResource] / ratio);
        if (convertAmount > 0) {
            this.spendResource(fromResource, convertAmount * ratio);
            this.addResource(toResource, convertAmount);
            return convertAmount;
        }
        return 0;
    }

    // Special resource events
    triggerResourceEvent(eventType) {
        switch(eventType) {
            case 'asteroid_field':
                const metalBonus = Math.floor(Math.random() * 50) + 25;
                this.addResource('metal', metalBonus);
                return { type: 'metal', amount: metalBonus, message: `Asteroid field mined: +${metalBonus} Metal` };
                
            case 'energy_storm':
                const energyBonus = Math.floor(Math.random() * 100) + 50;
                this.addResource('energy', energyBonus);
                return { type: 'energy', amount: energyBonus, message: `Energy storm harvested: +${energyBonus} Energy` };
                
            case 'crystal_nebula':
                const crystalBonus = Math.floor(Math.random() * 20) + 10;
                this.addResource('crystals', crystalBonus);
                return { type: 'crystals', amount: crystalBonus, message: `Crystal nebula discovered: +${crystalBonus} Crystals` };
                
            case 'dark_matter_anomaly':
                const darkMatterBonus = Math.floor(Math.random() * 5) + 1;
                this.addResource('darkMatter', darkMatterBonus);
                return { type: 'darkMatter', amount: darkMatterBonus, message: `Dark matter anomaly: +${darkMatterBonus} Dark Matter` };
                
            default:
                return null;
        }
    }

    // Format resources for display
    formatResource(amount, decimals = 0) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(decimals) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(decimals) + 'K';
        }
        return Math.floor(amount).toString();
    }

    // Resource collection effects for UI
    createResourceEffect(x, y, resource, amount) {
        return {
            x: x,
            y: y,
            resource: resource,
            amount: amount,
            lifetime: 60,
            currentLife: 0,
            velocityY: -2,
            color: this.getResourceColor(resource)
        };
    }

    getResourceColor(resource) {
        const colors = {
            energy: '#00ffff',
            metal: '#888888',
            crystals: '#ff00ff',
            darkMatter: '#4a0080'
        };
        return colors[resource] || '#ffffff';
    }

    getResourceIcon(resource) {
        const icons = {
            energy: '⚡',
            metal: '⚙️',
            crystals: '💎',
            darkMatter: '🌌'
        };
        return icons[resource] || '📦';
    }

    toSaveData() {
        return {
            resources: { ...this.resources },
            baseProduction: { ...this.baseProduction },
            resourceCaps: { ...this.resourceCaps },
            blueprints: { ...this.blueprints },
            unlockedBlueprints: { ...this.unlockedBlueprints }
        };
    }

    fromSaveData(data = {}) {
        if (!data) return;
        if (data.resources) {
            this.resources = { ...this.resources, ...data.resources };
        }
        if (data.baseProduction) {
            this.baseProduction = { ...this.baseProduction, ...data.baseProduction };
        }
        if (data.resourceCaps) {
            this.resourceCaps = { ...this.resourceCaps, ...data.resourceCaps };
        }
    }
}