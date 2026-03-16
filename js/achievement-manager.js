class AchievementManager {
    constructor() {
        this.achievements = {};
        this.unlockedAchievements = new Set();
        this.progress = {};
        this.listeners = [];
        this.initializeAchievements();
    }

    initializeAchievements() {
        // Kill-based achievements
        this.achievements = {
            // Basic progression
            'first_kill': {
                id: 'first_kill',
                name: 'First Blood',
                description: 'Destroy your first enemy',
                icon: '🎯',
                type: 'kills',
                condition: { total: 1 },
                reward: { type: 'cosmetic', item: 'first_blood_badge' },
                rarity: 'common'
            },
            'enemy_slayer': {
                id: 'enemy_slayer',
                name: 'Enemy Slayer',
                description: 'Destroy 100 enemies',
                icon: '⚔️',
                type: 'kills',
                condition: { total: 100 },
                reward: { type: 'cosmetic', item: 'slayer_skin' },
                rarity: 'common'
            },
            'veteran': {
                id: 'veteran',
                name: 'Veteran Pilot',
                description: 'Destroy 1000 enemies',
                icon: '🎖️',
                type: 'kills',
                condition: { total: 1000 },
                reward: { type: 'cosmetic', item: 'veteran_wings' },
                rarity: 'rare'
            },
            'legend': {
                id: 'legend',
                name: 'Legendary Pilot',
                description: 'Destroy 10000 enemies',
                icon: '👑',
                type: 'kills',
                condition: { total: 10000 },
                reward: { type: 'cosmetic', item: 'legendary_aura' },
                rarity: 'epic'
            },

            // Distance achievements
            'space_traveler': {
                id: 'space_traveler',
                name: 'Space Traveler',
                description: 'Travel 100km',
                icon: '🚀',
                type: 'distance',
                condition: { total: 100 },
                reward: { type: 'cosmetic', item: 'traveler_trail' },
                rarity: 'common'
            },
            'deep_space': {
                id: 'deep_space',
                name: 'Deep Space Explorer',
                description: 'Travel 500km',
                icon: '🌌',
                type: 'distance',
                condition: { total: 500 },
                reward: { type: 'cosmetic', item: 'deep_space_glow' },
                rarity: 'rare'
            },
            'galaxy_hopper': {
                id: 'galaxy_hopper',
                name: 'Galaxy Hopper',
                description: 'Travel 1000km',
                icon: '🌠',
                type: 'distance',
                condition: { total: 1000 },
                reward: { type: 'cosmetic', item: 'galaxy_warp' },
                rarity: 'epic'
            },

            // Boss achievements
            'boss_hunter': {
                id: 'boss_hunter',
                name: 'Boss Hunter',
                description: 'Defeat 10 bosses',
                icon: '🎯',
                type: 'bossKills',
                condition: { total: 10 },
                reward: { type: 'cosmetic', item: 'hunter_scope' },
                rarity: 'rare'
            },
            'leviathan_slayer': {
                id: 'leviathan_slayer',
                name: 'Leviathan Slayer',
                description: 'Defeat Mega Leviathan 5 times',
                icon: '🐉',
                type: 'specificBoss',
                condition: { bossType: 'megaboss_leviathan', count: 5 },
                reward: { type: 'cosmetic', item: 'leviathan_scales' },
                rarity: 'epic'
            },

            // Survival achievements
            'survivor': {
                id: 'survivor',
                name: 'Survivor',
                description: 'Survive for 5 minutes',
                icon: '⏱️',
                type: 'survival',
                condition: { time: 300 },
                reward: { type: 'cosmetic', item: 'survivor_badge' },
                rarity: 'common'
            },
            'untouchable': {
                id: 'untouchable',
                name: 'Untouchable',
                description: 'Complete a run without taking damage',
                icon: '🛡️',
                type: 'perfect',
                condition: { noDamage: true },
                reward: { type: 'cosmetic', item: 'invincible_aura' },
                rarity: 'rare'
            },

            // Power-up achievements
            'power_user': {
                id: 'power_user',
                name: 'Power User',
                description: 'Collect 50 power-ups',
                icon: '⚡',
                type: 'powerups',
                condition: { total: 50 },
                reward: { type: 'cosmetic', item: 'power_circuit' },
                rarity: 'common'
            },
            'heat_seeker': {
                id: 'heat_seeker',
                name: 'Heat Seeker',
                description: 'Use heat-seeking missiles 25 times',
                icon: '🎯',
                type: 'specificPowerup',
                condition: { powerupType: 'heatSeekingMissiles', count: 25 },
                reward: { type: 'cosmetic', item: 'seeker_trail' },
                rarity: 'rare'
            },

            // Score achievements
            'high_scorer': {
                id: 'high_scorer',
                name: 'High Scorer',
                description: 'Score 100,000 points',
                icon: '💎',
                type: 'score',
                condition: { total: 100000 },
                reward: { type: 'cosmetic', item: 'score_glow' },
                rarity: 'rare'
            },
            'millionaire': {
                id: 'millionaire',
                name: 'Millionaire',
                description: 'Score 1,000,000 points',
                icon: '💰',
                type: 'score',
                condition: { total: 1000000 },
                reward: { type: 'cosmetic', item: 'millionaire_crown' },
                rarity: 'epic'
            },

            // Combo achievements
            'combo_master': {
                id: 'combo_master',
                name: 'Combo Master',
                description: 'Achieve a 10x score multiplier',
                icon: '🔥',
                type: 'combo',
                condition: { multiplier: 10 },
                reward: { type: 'cosmetic', item: 'combo_flames' },
                rarity: 'rare'
            },

            // Collection achievements
            'collector': {
                id: 'collector',
                name: 'Collector',
                description: 'Unlock 10 different cosmetics',
                icon: '📦',
                type: 'cosmetics',
                condition: { total: 10 },
                reward: { type: 'cosmetic', item: 'collector_badge' },
                rarity: 'rare'
            }
        };

        // Initialize progress tracking
        Object.keys(this.achievements).forEach(id => {
            this.progress[id] = {
                current: 0,
                completed: false,
                unlockedAt: null
            };
        });
    }

    // Track game events
    trackEvent(eventType, data) {
        switch(eventType) {
            case 'enemy_killed':
                this.updateProgress('first_kill', 1);
                this.updateProgress('enemy_slayer', 1);
                this.updateProgress('veteran', 1);
                this.updateProgress('legend', 1);
                break;

            case 'distance_traveled':
                const km = Math.floor(data.distance / 100);
                this.updateProgress('space_traveler', km);
                this.updateProgress('deep_space', km);
                this.updateProgress('galaxy_hopper', km);
                break;

            case 'boss_killed':
                this.updateProgress('boss_hunter', 1);
                if (data.bossType === 'megaboss_leviathan') {
                    this.updateProgress('leviathan_slayer', 1);
                }
                break;

            case 'survival_time':
                const seconds = Math.floor(data.time / 60);
                this.updateProgress('survivor', seconds);
                break;

            case 'perfect_run':
                this.unlockAchievement('untouchable');
                break;

            case 'powerup_collected':
                this.updateProgress('power_user', 1);
                break;

            case 'powerup_used':
                if (data.powerupType === 'heatSeekingMissiles') {
                    this.updateProgress('heat_seeker', 1);
                }
                break;

            case 'score_earned':
                this.updateProgress('high_scorer', data.score);
                this.updateProgress('millionaire', data.score);
                break;

            case 'combo_multiplier':
                if (data.multiplier >= 10) {
                    this.unlockAchievement('combo_master');
                }
                break;

            case 'cosmetic_unlocked':
                this.updateProgress('collector', 1);
                break;
        }
    }

    updateProgress(achievementId, increment = 1) {
        if (!this.achievements[achievementId] || this.progress[achievementId].completed) {
            return;
        }

        const achievement = this.achievements[achievementId];
        const progress = this.progress[achievementId];

        // Update progress based on achievement type
        switch(achievement.type) {
            case 'kills':
            case 'bossKills':
            case 'powerups':
            case 'cosmetics':
                progress.current = Math.min(progress.current + increment, achievement.condition.total);
                break;

            case 'distance':
            case 'score':
                progress.current = Math.max(progress.current, increment);
                break;

            case 'survival':
                progress.current = Math.max(progress.current, increment);
                break;
        }

        // Check if achievement is completed
        if (this.isAchievementCompleted(achievementId)) {
            this.unlockAchievement(achievementId);
        }
    }

    isAchievementCompleted(achievementId) {
        const achievement = this.achievements[achievementId];
        const progress = this.progress[achievementId];

        switch(achievement.type) {
            case 'kills':
            case 'bossKills':
            case 'powerups':
            case 'cosmetics':
            case 'distance':
            case 'score':
            case 'survival':
                return progress.current >= achievement.condition.total;

            case 'specificBoss':
                return progress.current >= achievement.condition.count;

            case 'specificPowerup':
                return progress.current >= achievement.condition.count;

            case 'perfect':
            case 'combo':
                return progress.completed;

            default:
                return false;
        }
    }

    unlockAchievement(achievementId) {
        if (this.unlockedAchievements.has(achievementId)) {
            return;
        }

        const achievement = this.achievements[achievementId];
        this.progress[achievementId].completed = true;
        this.progress[achievementId].unlockedAt = Date.now();
        this.unlockedAchievements.add(achievementId);

        // Grant reward
        this.grantReward(achievement.reward);

        // Notify listeners
        this.listeners.forEach(listener => {
            listener('achievement_unlocked', {
                achievement: achievement,
                reward: achievement.reward
            });
        });

        console.log(`🏆 Achievement Unlocked: ${achievement.name}!`);
    }

    grantReward(reward) {
        switch(reward.type) {
            case 'cosmetic':
                // Add to unlocked cosmetics
                if (typeof cosmeticManager !== 'undefined') {
                    cosmeticManager.unlockCosmetic(reward.item);
                }
                break;

            case 'currency':
                if (typeof saveSystem !== 'undefined') {
                    saveSystem.addCredits(reward.amount);
                }
                break;

            case 'upgrade':
                // Apply permanent upgrade
                break;
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    getAchievement(id) {
        return this.achievements[id];
    }

    getProgress(id) {
        return this.progress[id];
    }

    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements).map(id => this.achievements[id]);
    }

    getAllAchievements() {
        return Object.values(this.achievements);
    }

    getCompletionPercentage() {
        const total = Object.keys(this.achievements).length;
        const completed = this.unlockedAchievements.size;
        return Math.round((completed / total) * 100);
    }

    // Save/Load functionality
    toSaveData() {
        return {
            unlocked: Array.from(this.unlockedAchievements),
            progress: this.progress
        };
    }

    loadFromSaveData(saveData) {
        if (saveData.unlocked) {
            this.unlockedAchievements = new Set(saveData.unlocked);
        }
        if (saveData.progress) {
            this.progress = { ...this.progress, ...saveData.progress };
        }
    }
}

// Global instance
const achievementManager = new AchievementManager;