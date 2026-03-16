class CollectionSystem {
    constructor() {
        this.encounteredEnemies = new Set();
        this.unlockedUpgrades = new Set();
        this.unlockedAchievements = new Set();
        this.statistics = {
            totalKills: 0,
            totalDistance: 0,
            totalCredits: 0,
            totalPlayTime: 0,
            maxCombo: 0,
            maxStreak: 0,
            bossesDefeated: 0,
            megaBossesDefeated: 0
        };

        this.enemyData = this.initializeEnemyData();
        this.upgradeData = this.initializeUpgradeData();
        this.achievementData = this.initializeAchievementData();
    }

    initializeEnemyData() {
        return {
            // Regular enemies
            'basic': {
                name: 'Scout Drone',
                description: 'Basic enemy unit. Fast and numerous, but weak.',
                stats: { health: 1, speed: 1, points: 10 },
                category: 'regular',
                rarity: 'common',
                unlockReward: 50
            },
            'fast': {
                name: 'Interceptor',
                description: 'High-speed attacker that zigzags unpredictably.',
                stats: { health: 1, speed: 2, points: 20 },
                category: 'regular',
                rarity: 'common',
                unlockReward: 75
            },
            'tank': {
                name: 'Heavy Assault',
                description: 'Slow but heavily armored. Requires multiple hits.',
                stats: { health: 3, speed: 0.5, points: 50 },
                category: 'regular',
                rarity: 'uncommon',
                unlockReward: 100
            },
            'sniper': {
                name: 'Precision Sniper',
                description: 'Long-range attacker that stops to fire accurately.',
                stats: { health: 2, speed: 0.8, points: 30 },
                category: 'regular',
                rarity: 'uncommon',
                unlockReward: 125
            },
            'bomber': {
                name: 'Bombardier',
                description: 'Dives in with explosive attacks.',
                stats: { health: 2, speed: 1.5, points: 40 },
                category: 'regular',
                rarity: 'uncommon',
                unlockReward: 150
            },
            'swarm': {
                name: 'Swarm Unit',
                description: 'Small, fast, and appears in groups.',
                stats: { health: 1, speed: 2.5, points: 15 },
                category: 'regular',
                rarity: 'common',
                unlockReward: 60
            },
            'heavy': {
                name: 'Battle Tank',
                description: 'Massive firepower but slow movement.',
                stats: { health: 5, speed: 0.3, points: 80 },
                category: 'regular',
                rarity: 'rare',
                unlockReward: 200
            },
            'stealth': {
                name: 'Ghost Ship',
                description: 'Cloaks itself and ambushes targets.',
                stats: { health: 2, speed: 1.8, points: 35 },
                category: 'regular',
                rarity: 'rare',
                unlockReward: 175
            },
            'guardian': {
                name: 'Shield Guardian',
                description: 'Protects allies with energy shields.',
                stats: { health: 4, speed: 0.6, points: 60 },
                category: 'regular',
                rarity: 'rare',
                unlockReward: 225
            },
            'assassin': {
                name: 'Shadow Assassin',
                description: 'Extremely fast with deadly precision.',
                stats: { health: 1, speed: 3, points: 25 },
                category: 'regular',
                rarity: 'epic',
                unlockReward: 300
            },
            'splitter': {
                name: 'Splitter Drone',
                description: 'Splits into smaller units when destroyed.',
                stats: { health: 2, speed: 1.2, points: 45 },
                category: 'regular',
                rarity: 'epic',
                unlockReward: 250
            },

            // Mini-bosses
            'miniboss_destroyer': {
                name: 'Destroyer',
                description: 'Aggressive mini-boss with heavy firepower.',
                stats: { health: 8, speed: 1.2, points: 120 },
                category: 'miniboss',
                rarity: 'rare',
                unlockReward: 500
            },
            'miniboss_carrier': {
                name: 'Carrier',
                description: 'Spawns smaller ships to aid in battle.',
                stats: { health: 10, speed: 0.8, points: 150 },
                category: 'miniboss',
                rarity: 'epic',
                unlockReward: 600
            },
            'miniboss_fortress': {
                name: 'Fortress',
                description: 'Immobile fortress with devastating defenses.',
                stats: { health: 12, speed: 0.5, points: 180 },
                category: 'miniboss',
                rarity: 'epic',
                unlockReward: 700
            },
            'miniboss_hunter': {
                name: 'Hunter',
                description: 'Tracks and pursues targets relentlessly.',
                stats: { health: 6, speed: 1.5, points: 100 },
                category: 'miniboss',
                rarity: 'rare',
                unlockReward: 450
            },
            'miniboss_phantom': {
                name: 'Phantom',
                description: 'Phases in and out of reality during combat.',
                stats: { health: 7, speed: 1.8, points: 110 },
                category: 'miniboss',
                rarity: 'epic',
                unlockReward: 550
            },
            'miniboss_berserker': {
                name: 'Berserker',
                description: 'Enters rage mode when damaged.',
                stats: { health: 5, speed: 2.2, points: 90 },
                category: 'miniboss',
                rarity: 'rare',
                unlockReward: 400
            },
            'miniboss_inferno': {
                name: 'Inferno',
                description: 'Unleashes fiery barrages in combat.',
                stats: { health: 8, speed: 1.8, points: 120 },
                category: 'miniboss',
                rarity: 'epic',
                unlockReward: 650
            },
            'miniboss_kraken': {
                name: 'Kraken',
                description: 'Tentacled horror from the deep void.',
                stats: { health: 12, speed: 1.5, points: 150 },
                category: 'miniboss',
                rarity: 'legendary',
                unlockReward: 800
            },
            'miniboss_ironclad': {
                name: 'Ironclad',
                description: 'Nearly indestructible armored behemoth.',
                stats: { health: 18, speed: 0.8, points: 200 },
                category: 'miniboss',
                rarity: 'legendary',
                unlockReward: 1000
            },
            'miniboss_venom': {
                name: 'Venom',
                description: 'Releases toxic clouds that damage over time.',
                stats: { health: 10, speed: 1.3, points: 140 },
                category: 'miniboss',
                rarity: 'epic',
                unlockReward: 600
            },

            // Mega-bosses
            'megaboss_dreadnought': {
                name: 'Dreadnought',
                description: 'Massive capital ship with overwhelming firepower.',
                stats: { health: 25, speed: 1.0, points: 500 },
                category: 'megaboss',
                rarity: 'legendary',
                unlockReward: 2000
            },
            'megaboss_mothership': {
                name: 'Mothership',
                description: 'Mobile command center that deploys endless waves.',
                stats: { health: 30, speed: 0.4, points: 600 },
                category: 'megaboss',
                rarity: 'legendary',
                unlockReward: 2500
            },
            'megaboss_leviathan': {
                name: 'Leviathan',
                description: 'Ancient cosmic entity of immense power.',
                stats: { health: 20, speed: 1.2, points: 450 },
                category: 'megaboss',
                rarity: 'mythic',
                unlockReward: 3000
            }
        };
    }

    initializeUpgradeData() {
        return {
            // Weapon upgrades
            'weaponLevel': {
                name: 'Weapon Power',
                description: 'Increases bullet damage and effectiveness.',
                category: 'weapons',
                icon: '⚡'
            },
            'bulletSpeed': {
                name: 'Bullet Velocity',
                description: 'Makes bullets travel faster.',
                category: 'weapons',
                icon: '💨'
            },
            'bulletSize': {
                name: 'Bullet Size',
                description: 'Larger bullets for easier hits.',
                category: 'weapons',
                icon: '🎯'
            },
            'fireRate': {
                name: 'Fire Rate',
                description: 'Shoot more bullets per second.',
                category: 'weapons',
                icon: '🔥'
            },

            // Defense upgrades
            'shieldLevel': {
                name: 'Energy Shield',
                description: 'Absorbs damage before reaching hull.',
                category: 'defense',
                icon: '🛡️'
            },
            'armor': {
                name: 'Hull Armor',
                description: 'Reduces damage taken from hits.',
                category: 'defense',
                icon: '🔧'
            },
            'regeneration': {
                name: 'Auto Repair',
                description: 'Slowly repairs damage over time.',
                category: 'defense',
                icon: '⚕️'
            },

            // Movement upgrades
            'speed': {
                name: 'Engine Power',
                description: 'Increases base movement speed.',
                category: 'movement',
                icon: '🚀'
            },
            'agility': {
                name: 'Agility',
                description: 'Improves turning and maneuverability.',
                category: 'movement',
                icon: '💫'
            },
            'dash': {
                name: 'Dash Drive',
                description: 'Short burst speed boost ability.',
                category: 'movement',
                icon: '⚡'
            },

            // Special abilities
            'multiShot': {
                name: 'Multi-Shot',
                description: 'Fire multiple bullets at once.',
                category: 'special',
                icon: '🎯'
            },
            'piercingShots': {
                name: 'Piercing Shots',
                description: 'Bullets pass through multiple enemies.',
                category: 'special',
                icon: '🗡️'
            },
            'explosiveShots': {
                name: 'Explosive Rounds',
                description: 'Bullets explode on impact.',
                category: 'special',
                icon: '💥'
            },
            'magneticPickup': {
                name: 'Magnetic Pickup',
                description: 'Automatically collect nearby resources.',
                category: 'special',
                icon: '🧲'
            }
        };
    }

    initializeAchievementData() {
        // This will be populated from achievement-manager.js data
        return {};
    }

    // Track enemy encounter
    encounterEnemy(enemyType) {
        if (this.enemyData[enemyType]) {
            this.encounteredEnemies.add(enemyType);
            this.saveProgress();
        }
    }

    // Track upgrade unlock
    unlockUpgrade(upgradeKey) {
        if (this.upgradeData[upgradeKey]) {
            this.unlockedUpgrades.add(upgradeKey);
            this.saveProgress();
        }
    }

    // Track achievement unlock
    unlockAchievement(achievementKey) {
        this.unlockedAchievements.add(achievementKey);
        this.saveProgress();
    }

    // Update statistics
    updateStats(stats) {
        Object.assign(this.statistics, stats);
        this.saveProgress();
    }

    // Get collection completion percentage
    getCompletionPercentage() {
        const totalEnemies = Object.keys(this.enemyData).length;
        const totalUpgrades = Object.keys(this.upgradeData).length;
        const totalAchievements = Object.keys(this.achievementData).length;

        const enemyCompletion = (this.encounteredEnemies.size / totalEnemies) * 100;
        const upgradeCompletion = (this.unlockedUpgrades.size / totalUpgrades) * 100;
        const achievementCompletion = (this.unlockedAchievements.size / totalAchievements) * 100;

        return {
            overall: (enemyCompletion + upgradeCompletion + achievementCompletion) / 3,
            enemies: enemyCompletion,
            upgrades: upgradeCompletion,
            achievements: achievementCompletion
        };
    }

    // Check for collection rewards
    checkCollectionRewards() {
        const completion = this.getCompletionPercentage();
        let rewards = 0;

        // Enemy collection rewards
        if (completion.enemies >= 25 && !this.collectionRewards?.enemy25) {
            rewards += 500;
            this.collectionRewards = this.collectionRewards || {};
            this.collectionRewards.enemy25 = true;
        }
        if (completion.enemies >= 50 && !this.collectionRewards?.enemy50) {
            rewards += 1000;
            this.collectionRewards.enemy50 = true;
        }
        if (completion.enemies >= 75 && !this.collectionRewards?.enemy75) {
            rewards += 2000;
            this.collectionRewards.enemy75 = true;
        }
        if (completion.enemies >= 100 && !this.collectionRewards?.enemy100) {
            rewards += 5000;
            this.collectionRewards.enemy100 = true;
        }

        return rewards;
    }

    // Save progress to localStorage
    saveProgress() {
        const data = {
            encounteredEnemies: Array.from(this.encounteredEnemies),
            unlockedUpgrades: Array.from(this.unlockedUpgrades),
            unlockedAchievements: Array.from(this.unlockedAchievements),
            statistics: this.statistics,
            collectionRewards: this.collectionRewards || {}
        };
        localStorage.setItem('galaxyConquest_collection', JSON.stringify(data));
    }

    // Load progress from localStorage
    loadProgress() {
        const data = localStorage.getItem('galaxyConquest_collection');
        if (data) {
            const parsed = JSON.parse(data);
            this.encounteredEnemies = new Set(parsed.encounteredEnemies || []);
            this.unlockedUpgrades = new Set(parsed.unlockedUpgrades || []);
            this.unlockedAchievements = new Set(parsed.unlockedAchievements || []);
            this.statistics = { ...this.statistics, ...parsed.statistics };
            this.collectionRewards = parsed.collectionRewards || {};
        }
    }

    // Get enemy collection data for UI
    getEnemyCollection() {
        const categories = {
            regular: [],
            miniboss: [],
            megaboss: []
        };

        Object.entries(this.enemyData).forEach(([key, data]) => {
            categories[data.category].push({
                key,
                ...data,
                encountered: this.encounteredEnemies.has(key)
            });
        });

        return categories;
    }

    // Get upgrade collection data for UI
    getUpgradeCollection() {
        const categories = {
            weapons: [],
            defense: [],
            movement: [],
            special: []
        };

        Object.entries(this.upgradeData).forEach(([key, data]) => {
            categories[data.category].push({
                key,
                ...data,
                unlocked: this.unlockedUpgrades.has(key)
            });
        });

        return categories;
    }

    // Get statistics for UI
    getStatistics() {
        return {
            ...this.statistics,
            completion: this.getCompletionPercentage()
        };
    }
}

// Global instance
const collectionSystem = new CollectionSystem();