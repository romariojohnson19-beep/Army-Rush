class DailyChallenges {
    constructor(saveSystem) {
        this.saveSystem = saveSystem;
        this.challenges = [];
        this.activeChallenges = [];
        this.completedToday = [];
        this.lastResetDate = null;
        this.challengePool = this.initializeChallengePool();
        this.loadProgress();
        this.checkDailyReset();
    }

    initializeChallengePool() {
        return [
            // Combat Challenges
            {
                id: 'enemy_slayer',
                name: 'Enemy Slayer',
                description: 'Destroy {count} enemies',
                type: 'combat',
                targets: [50, 100, 150, 200],
                reward: { type: 'cosmetic', value: 'enemy_slayer_badge' },
                icon: '⚔️',
                rarity: 'common'
            },
            {
                id: 'boss_hunter',
                name: 'Boss Hunter',
                description: 'Defeat {count} boss enemies',
                type: 'combat',
                targets: [3, 5, 8, 10],
                reward: { type: 'cosmetic', value: 'boss_hunter_crown' },
                icon: '👑',
                rarity: 'rare'
            },
            {
                id: 'perfect_accuracy',
                name: 'Perfect Accuracy',
                description: 'Complete a run with {count}% accuracy',
                type: 'combat',
                targets: [85, 90, 95, 100],
                reward: { type: 'cosmetic', value: 'sharpshooter_star' },
                icon: '🎯',
                rarity: 'epic'
            },

            // Survival Challenges
            {
                id: 'distance_runner',
                name: 'Distance Runner',
                description: 'Travel {count} km in a single run',
                type: 'survival',
                targets: [25, 50, 75, 100],
                reward: { type: 'cosmetic', value: 'explorer_wings' },
                icon: '🛩️',
                rarity: 'common'
            },
            {
                id: 'survivor',
                name: 'Survivor',
                description: 'Survive for {count} minutes',
                type: 'survival',
                targets: [5, 10, 15, 20],
                reward: { type: 'cosmetic', value: 'survivor_medal' },
                icon: '⏱️',
                rarity: 'rare'
            },

            // Collection Challenges
            {
                id: 'powerup_collector',
                name: 'Power-up Collector',
                description: 'Collect {count} power-ups',
                type: 'collection',
                targets: [10, 20, 30, 50],
                reward: { type: 'cosmetic', value: 'collector_badge' },
                icon: '💎',
                rarity: 'common'
            },
            {
                id: 'combo_master',
                name: 'Combo Master',
                description: 'Achieve a {count}x combo multiplier',
                type: 'collection',
                targets: [5, 10, 15, 20],
                reward: { type: 'cosmetic', value: 'combo_master_star' },
                icon: '🔥',
                rarity: 'epic'
            },

            // Special Challenges
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Reach {count} km/h speed',
                type: 'special',
                targets: [800, 1000, 1200, 1500],
                reward: { type: 'cosmetic', value: 'speed_demon_flames' },
                icon: '💨',
                rarity: 'rare'
            },
            {
                id: 'no_damage',
                name: 'Untouchable',
                description: 'Complete a run taking no damage',
                type: 'special',
                targets: [1], // Binary challenge
                reward: { type: 'cosmetic', value: 'untouchable_aura' },
                icon: '🛡️',
                rarity: 'legendary'
            }
        ];
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.lastResetDate !== today) {
            this.resetDailyChallenges();
            this.lastResetDate = today;
            this.saveProgress();
        }
    }

    resetDailyChallenges() {
        this.completedToday = [];
        this.activeChallenges = this.generateDailyChallenges();
        this.saveProgress();
    }

    generateDailyChallenges() {
        const challenges = [];
        const challengePool = [...this.challengePool];

        // Select 3 challenges: 1 common, 1 rare, 1 random
        const commonChallenges = challengePool.filter(c => c.rarity === 'common');
        const rareChallenges = challengePool.filter(c => c.rarity === 'rare');
        const epicChallenges = challengePool.filter(c => c.rarity === 'epic');
        const legendaryChallenges = challengePool.filter(c => c.rarity === 'legendary');

        // Always include one common
        if (commonChallenges.length > 0) {
            const randomCommon = commonChallenges[Math.floor(Math.random() * commonChallenges.length)];
            challenges.push(this.createChallengeInstance(randomCommon));
        }

        // Always include one rare or better
        const rareOrBetter = [...rareChallenges, ...epicChallenges, ...legendaryChallenges];
        if (rareOrBetter.length > 0) {
            const randomRarePlus = rareOrBetter[Math.floor(Math.random() * rareOrBetter.length)];
            challenges.push(this.createChallengeInstance(randomRarePlus));
        }

        // One more random challenge
        if (challengePool.length > 0) {
            const randomChallenge = challengePool[Math.floor(Math.random() * challengePool.length)];
            challenges.push(this.createChallengeInstance(randomChallenge));
        }

        return challenges;
    }

    createChallengeInstance(challengeTemplate) {
        const targetIndex = Math.floor(Math.random() * challengeTemplate.targets.length);
        const target = challengeTemplate.targets[targetIndex];

        return {
            id: challengeTemplate.id,
            name: challengeTemplate.name,
            description: challengeTemplate.description.replace('{count}', target),
            type: challengeTemplate.type,
            target: target,
            current: 0,
            completed: false,
            reward: challengeTemplate.reward,
            icon: challengeTemplate.icon,
            rarity: challengeTemplate.rarity,
            templateId: challengeTemplate.id
        };
    }

    trackEvent(eventType, value = 1) {
        this.activeChallenges.forEach(challenge => {
            if (challenge.completed) return;

            let progress = false;

            switch (challenge.templateId) {
                case 'enemy_slayer':
                    if (eventType === 'enemy_killed') {
                        challenge.current += value;
                        progress = true;
                    }
                    break;
                case 'boss_hunter':
                    if (eventType === 'boss_killed') {
                        challenge.current += value;
                        progress = true;
                    }
                    break;
                case 'distance_runner':
                    if (eventType === 'distance_traveled') {
                        challenge.current = Math.max(challenge.current, value);
                        progress = true;
                    }
                    break;
                case 'survivor':
                    if (eventType === 'survival_time') {
                        challenge.current = Math.max(challenge.current, value);
                        progress = true;
                    }
                    break;
                case 'powerup_collector':
                    if (eventType === 'powerup_collected') {
                        challenge.current += value;
                        progress = true;
                    }
                    break;
                case 'combo_master':
                    if (eventType === 'combo_achieved') {
                        challenge.current = Math.max(challenge.current, value);
                        progress = true;
                    }
                    break;
                case 'speed_demon':
                    if (eventType === 'speed_achieved') {
                        challenge.current = Math.max(challenge.current, value);
                        progress = true;
                    }
                    break;
                case 'perfect_accuracy':
                    if (eventType === 'accuracy_achieved') {
                        challenge.current = Math.max(challenge.current, value);
                        progress = true;
                    }
                    break;
                case 'no_damage':
                    if (eventType === 'perfect_run') {
                        challenge.current = 1;
                        progress = true;
                    }
                    break;
            }

            if (progress) {
                this.checkChallengeCompletion(challenge);
                this.saveProgress();
            }
        });
    }

    checkChallengeCompletion(challenge) {
        if (challenge.current >= challenge.target && !challenge.completed) {
            challenge.completed = true;
            this.completedToday.push(challenge.id);
            this.grantReward(challenge.reward);

            // Trigger notification
            if (typeof window.game !== 'undefined' && window.game.showChallengeNotification) {
                window.game.showChallengeNotification(challenge);
            }
        }
    }

    grantReward(reward) {
        if (!reward) return;

        switch (reward.type) {
            case 'cosmetic':
                // Unlock cosmetic item
                if (this.saveSystem && typeof this.saveSystem.unlockCosmetic === 'function') {
                    this.saveSystem.unlockCosmetic(reward.value);
                }
                break;
            case 'bonus':
                // Grant temporary bonus
                if (this.saveSystem && typeof this.saveSystem.addBonus === 'function') {
                    this.saveSystem.addBonus(reward.value);
                }
                break;
        }
    }

    getActiveChallenges() {
        return this.activeChallenges;
    }

    getCompletedToday() {
        return this.completedToday.length;
    }

    getTotalChallenges() {
        return this.activeChallenges.length;
    }

    isCompleted(challengeId) {
        return this.completedToday.includes(challengeId);
    }

    saveProgress() {
        const progress = {
            activeChallenges: this.activeChallenges,
            completedToday: this.completedToday,
            lastResetDate: this.lastResetDate
        };

        if (this.saveSystem && typeof this.saveSystem.saveDailyChallenges === 'function') {
            this.saveSystem.saveDailyChallenges(progress);
        }
    }

    loadProgress() {
        if (this.saveSystem && typeof this.saveSystem.loadDailyChallenges === 'function') {
            const progress = this.saveSystem.loadDailyChallenges();
            if (progress) {
                this.activeChallenges = progress.activeChallenges || [];
                this.completedToday = progress.completedToday || [];
                this.lastResetDate = progress.lastResetDate;
            }
        }
    }

    // Get challenge progress for UI display
    getChallengeProgress(challengeId) {
        const challenge = this.activeChallenges.find(c => c.id === challengeId);
        if (!challenge) return null;

        return {
            current: challenge.current,
            target: challenge.target,
            completed: challenge.completed,
            percentage: Math.min((challenge.current / challenge.target) * 100, 100)
        };
    }
}