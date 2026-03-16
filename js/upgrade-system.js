class UpgradeSystem {
    constructor() {
        this.currency = 0;
        this.upgrades = {
            // Weapon upgrades
            weaponLevel: 1,
            bulletSpeed: 1,
            bulletSize: 1,
            fireRate: 1,
            
            // Defense upgrades  
            shieldLevel: 0,
            armor: 1,
            regeneration: 0,
            
            // Movement upgrades
            speed: 1,
            agility: 1,
            dash: 0,
            
            // Special abilities
            multiShot: 0,
            piercingShots: 0,
            explosiveShots: 0,
            magneticPickup: 0
        };
        
        this.maxUpgradeLevel = 10;
        this.upgradeDefinitions = this.initializeUpgradeDefinitions();
    }

    initializeUpgradeDefinitions() {
        return {
            // Weapon Upgrades
            weaponLevel: {
                name: "Weapon Power",
                description: "Increases bullet damage",
                baseCost: 50,
                costMultiplier: 1.5,
                maxLevel: 10,
                category: "weapons"
            },
            bulletSpeed: {
                name: "Bullet Velocity", 
                description: "Increases bullet travel speed",
                baseCost: 30,
                costMultiplier: 1.4,
                maxLevel: 8,
                category: "weapons"
            },
            bulletSize: {
                name: "Bullet Size",
                description: "Increases bullet size for easier hits",
                baseCost: 40,
                costMultiplier: 1.6,
                maxLevel: 6,
                category: "weapons"
            },
            fireRate: {
                name: "Fire Rate",
                description: "Increases shooting speed",
                baseCost: 60,
                costMultiplier: 1.7,
                maxLevel: 8,
                category: "weapons"
            },

            // Defense Upgrades
            shieldLevel: {
                name: "Energy Shield",
                description: "Absorbs enemy damage",
                baseCost: 100,
                costMultiplier: 2.0,
                maxLevel: 5,
                category: "defense"
            },
            armor: {
                name: "Hull Armor",
                description: "Reduces damage taken",
                baseCost: 80,
                costMultiplier: 1.8,
                maxLevel: 7,
                category: "defense"
            },
            regeneration: {
                name: "Auto Repair",
                description: "Slowly regenerates health",
                baseCost: 150,
                costMultiplier: 2.2,
                maxLevel: 3,
                category: "defense"
            },

            // Movement Upgrades  
            speed: {
                name: "Engine Power",
                description: "Increases movement speed",
                baseCost: 25,
                costMultiplier: 1.3,
                maxLevel: 10,
                category: "movement"
            },
            agility: {
                name: "Maneuverability", 
                description: "Improves turning speed",
                baseCost: 35,
                costMultiplier: 1.4,
                maxLevel: 8,
                category: "movement"
            },
            dash: {
                name: "Boost Drive",
                description: "Unlocks dash ability",
                baseCost: 200,
                costMultiplier: 2.5,
                maxLevel: 3,
                category: "movement"
            },

            // Special Abilities
            multiShot: {
                name: "Multi-Shot",
                description: "Fire multiple bullets at once",
                baseCost: 300,
                costMultiplier: 3.0,
                maxLevel: 4,
                category: "special"
            },
            piercingShots: {
                name: "Piercing Rounds",
                description: "Bullets go through enemies",
                baseCost: 250,
                costMultiplier: 2.8,
                maxLevel: 3,
                category: "special"
            },
            explosiveShots: {
                name: "Explosive Rounds",
                description: "Bullets explode on impact",
                baseCost: 400,
                costMultiplier: 3.5,
                maxLevel: 3,
                category: "special"
            },
            magneticPickup: {
                name: "Magnetic Field",
                description: "Attracts coins from distance",
                baseCost: 180,
                costMultiplier: 2.0,
                maxLevel: 5,
                category: "special"
            }
        };
    }
    
    // Apply upgrades to player
    applyUpgrades(player) {
        if (player && player.updateUpgrades) {
            player.updateUpgrades(this.upgrades);
        }
    }

    // Currency management
    addCurrency(amount) {
        this.currency += amount;
    }

    spendCurrency(amount) {
        if (this.currency >= amount) {
            this.currency -= amount;
            return true;
        }
        return false;
    }

    getCurrency() {
        return this.currency;
    }

    // Upgrade management
    getUpgradeCost(upgradeType) {
        const def = this.upgradeDefinitions[upgradeType];
        if (!def) return 0;
        
        const currentLevel = this.upgrades[upgradeType];
        if (currentLevel >= def.maxLevel) return 0; // Max level reached
        
        return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
    }

    canUpgrade(upgradeType) {
        const cost = this.getUpgradeCost(upgradeType);
        const currentLevel = this.upgrades[upgradeType];
        const maxLevel = this.upgradeDefinitions[upgradeType]?.maxLevel || 0;
        
        return cost > 0 && this.currency >= cost && currentLevel < maxLevel;
    }

    purchaseUpgrade(upgradeType) {
        if (!this.canUpgrade(upgradeType)) return false;
        
        const cost = this.getUpgradeCost(upgradeType);
        if (this.spendCurrency(cost)) {
            this.upgrades[upgradeType]++;
            return true;
        }
        return false;
    }

    getUpgradeLevel(upgradeType) {
        return this.upgrades[upgradeType] || 0;
    }

    // Calculate coin rewards
    calculateCoinReward(enemy) {
        let baseCoins = 1;
        
        // Different coin values based on enemy type
        switch(enemy.type) {
            case 'basic':
                baseCoins = 1;
                break;
            case 'fast':
            case 'tank':
                baseCoins = 2;
                break;
            case 'sniper':
            case 'bomber':
            case 'swarm':
                baseCoins = 3;
                break;
            case 'heavy':
            case 'stealth':
            case 'guardian':
                baseCoins = 5;
                break;
            case 'assassin':
            case 'splitter':
                baseCoins = 8;
                break;
            default:
                // Boss types
                if (enemy.isBoss) {
                    if (enemy.isMegaBoss) {
                        baseCoins = 100; // Mega boss
                    } else {
                        baseCoins = 25; // Mini boss
                    }
                } else {
                    baseCoins = 1;
                }
                break;
        }

        // Bonus coins based on wave progression
        const waveBonus = Math.floor(enemy.wave * 0.5);
        return baseCoins + waveBonus;
    }

    // Apply upgrades to player stats
    applyUpgrades(player) {
        // Weapon upgrades
        player.bulletLevel = this.upgrades.weaponLevel;
        player.bulletSpeed = 8 + (this.upgrades.bulletSpeed * 2);
        player.fireRate = Math.max(5, 15 - (this.upgrades.fireRate * 1.5));
        
        // Movement upgrades
        player.speed = 5 + (this.upgrades.speed * 0.8);
        
        // Defense upgrades  
        player.maxHealth = 3 + this.upgrades.armor;
        player.shieldLevel = this.upgrades.shieldLevel;
        
        // Special abilities flags
        player.hasMultiShot = this.upgrades.multiShot > 0;
        player.multiShotCount = 1 + this.upgrades.multiShot;
        player.hasPiercingShots = this.upgrades.piercingShots > 0;
        player.hasExplosiveShots = this.upgrades.explosiveShots > 0;
        player.magneticRange = this.upgrades.magneticPickup * 50;
    }

    // Get upgrade categories for UI
    getUpgradesByCategory() {
        const categories = {
            weapons: [],
            defense: [],
            movement: [],
            special: []
        };

        Object.keys(this.upgradeDefinitions).forEach(upgradeType => {
            const def = this.upgradeDefinitions[upgradeType];
            const level = this.upgrades[upgradeType];
            const cost = this.getUpgradeCost(upgradeType);
            
            categories[def.category].push({
                type: upgradeType,
                name: def.name,
                description: def.description,
                level: level,
                maxLevel: def.maxLevel,
                cost: cost,
                canAfford: this.currency >= cost,
                maxed: level >= def.maxLevel
            });
        });

        return categories;
    }

    // Save/load system integration
    getSaveData() {
        return {
            currency: this.currency,
            upgrades: { ...this.upgrades }
        };
    }

    loadSaveData(data) {
        if (data.currency !== undefined) {
            this.currency = data.currency;
        }
        if (data.upgrades) {
            this.upgrades = { ...this.upgrades, ...data.upgrades };
        }
    }
}

// Global upgrade system instance
window.upgradeSystem = new UpgradeSystem();