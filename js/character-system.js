class CharacterSystem {
    constructor(saveSystem) {
        this.saveSystem = saveSystem;
        this.characters = this.initializeCharacters();
        this.currentCharacter = this.saveSystem.data.selectedCharacter || 'rookie';
        this.ensureCharacterData();
    }

    initializeCharacters() {
        return {
            rookie: {
                id: 'rookie',
                name: 'Rookie Pilot',
                description: 'Standard starter pilot with balanced stats',
                sprite: 'player_basic',
                unlocked: true,
                unlockRequirement: null,
                stats: {
                    speed: 1.0,
                    fireRate: 1.0,
                    armor: 1.0,
                    luck: 1.0
                },
                startingBonuses: {},
                rarity: 'common',
                unlockMessage: 'Available from start'
            },
            
            veteran: {
                id: 'veteran',
                name: 'Veteran Ace',
                description: 'Experienced pilot with improved fire rate',
                sprite: 'player_veteran',
                unlocked: false,
                unlockRequirement: {
                    type: 'distance',
                    value: 10000, // 10 km
                    description: 'Reach 10 km distance'
                },
                stats: {
                    speed: 1.0,
                    fireRate: 1.3,
                    armor: 1.0,
                    luck: 1.1
                },
                startingBonuses: {
                    shootRateMultiplier: 0.8 // Faster shooting
                },
                rarity: 'uncommon',
                unlockMessage: 'Unlocked by reaching 10 km!'
            },

            tank: {
                id: 'tank',
                name: 'Tank Commander',
                description: 'Heavy armor specialist with extra lives',
                sprite: 'player_heavy',
                unlocked: false,
                unlockRequirement: {
                    type: 'survival',
                    value: 20000, // 20 km
                    description: 'Survive to 20 km distance'
                },
                stats: {
                    speed: 0.8,
                    fireRate: 0.9,
                    armor: 1.5,
                    luck: 1.0
                },
                startingBonuses: {
                    extraLives: 1,
                    speedMultiplier: 0.9
                },
                rarity: 'rare',
                unlockMessage: 'Unlocked by surviving to 20 km!'
            },

            speedster: {
                id: 'speedster',
                name: 'Speed Demon',
                description: 'Lightning-fast pilot with enhanced mobility',
                sprite: 'player_fast',
                unlocked: false,
                unlockRequirement: {
                    type: 'kills',
                    value: 500,
                    description: 'Achieve 500 total kills'
                },
                stats: {
                    speed: 1.5,
                    fireRate: 1.2,
                    armor: 0.8,
                    luck: 1.2
                },
                startingBonuses: {
                    speedMultiplier: 1.4
                },
                rarity: 'rare',
                unlockMessage: 'Unlocked by achieving 500 kills!'
            },

            boss_hunter: {
                id: 'boss_hunter',
                name: 'Boss Hunter',
                description: 'Specialist in taking down large targets',
                sprite: 'player_hunter',
                unlocked: false,
                unlockRequirement: {
                    type: 'bosses_single_game',
                    value: 3,
                    description: 'Kill 3 bosses in a single game'
                },
                stats: {
                    speed: 1.1,
                    fireRate: 1.4,
                    armor: 1.2,
                    luck: 1.3
                },
                startingBonuses: {
                    startingBulletLevel: 2
                },
                rarity: 'epic',
                unlockMessage: 'Unlocked by killing 3 bosses in one game!'
            },

            ghost: {
                id: 'ghost',
                name: 'Ghost Pilot',
                description: 'Stealth specialist with shield mastery',
                sprite: 'player_ghost',
                unlocked: false,
                unlockRequirement: {
                    type: 'total_bosses',
                    value: 10,
                    description: 'Defeat 10 bosses total'
                },
                stats: {
                    speed: 1.2,
                    fireRate: 1.1,
                    armor: 0.9,
                    luck: 1.4
                },
                startingBonuses: {
                    startWithShield: true
                },
                rarity: 'epic',
                unlockMessage: 'Unlocked by defeating 10 bosses!'
            },

            destroyer: {
                id: 'destroyer',
                name: 'Destroyer Class',
                description: 'Ultimate killing machine with devastating firepower',
                sprite: 'player_destroyer',
                unlocked: false,
                unlockRequirement: {
                    type: 'kills_single_game',
                    value: 200,
                    description: 'Kill 200 enemies in a single game'
                },
                stats: {
                    speed: 0.9,
                    fireRate: 1.6,
                    armor: 1.3,
                    luck: 1.2
                },
                startingBonuses: {
                    shootRateMultiplier: 0.6,
                    startingBulletLevel: 3
                },
                rarity: 'legendary',
                unlockMessage: 'Unlocked by killing 200 enemies in one game!'
            },

            phoenix: {
                id: 'phoenix',
                name: 'Phoenix Rising',
                description: 'Legendary pilot reborn from ashes',
                sprite: 'player_phoenix',
                unlocked: false,
                unlockRequirement: {
                    type: 'distance_milestone',
                    value: 50000, // 50 km
                    description: 'Reach the legendary 50 km milestone'
                },
                stats: {
                    speed: 1.3,
                    fireRate: 1.5,
                    armor: 1.4,
                    luck: 1.6
                },
                startingBonuses: {
                    extraLives: 2,
                    startWithShield: true,
                    startingBulletLevel: 2,
                    speedMultiplier: 1.2
                },
                rarity: 'legendary',
                unlockMessage: 'Unlocked by reaching 50 km - true legend!'
            },

            nightmare: {
                id: 'nightmare',
                name: 'Nightmare',
                description: 'The ultimate pilot - master of all combat',
                sprite: 'player_nightmare',
                unlocked: false,
                unlockRequirement: {
                    type: 'multiple',
                    requirements: [
                        { type: 'distance', value: 75000 }, // 75 km
                        { type: 'total_bosses', value: 25 },
                        { type: 'kills', value: 2000 }
                    ],
                    description: 'Reach 75 km, defeat 25 bosses, and achieve 2000 total kills'
                },
                stats: {
                    speed: 1.4,
                    fireRate: 1.7,
                    armor: 1.5,
                    luck: 1.8
                },
                startingBonuses: {
                    extraLives: 3,
                    startWithShield: true,
                    startingBulletLevel: 4,
                    speedMultiplier: 1.3,
                    shootRateMultiplier: 0.5
                },
                rarity: 'mythic',
                unlockMessage: 'Ultimate pilot unlocked - you are legendary!'
            }
        };
    }

    ensureCharacterData() {
        if (!this.saveSystem.data.unlockedCharacters) {
            this.saveSystem.data.unlockedCharacters = ['rookie'];
        }
        if (!this.saveSystem.data.selectedCharacter) {
            this.saveSystem.data.selectedCharacter = 'rookie';
        }
        if (!this.saveSystem.data.gameStats) {
            this.saveSystem.data.gameStats = {
                bossesKilledThisGame: 0,
                killsThisGame: 0,
                maxDistanceThisGame: 0
            };
        }
    }

    checkUnlocks(gameStats = null) {
        let newUnlocks = [];
        
        for (const [id, character] of Object.entries(this.characters)) {
            if (character.unlocked || this.saveSystem.data.unlockedCharacters.includes(id)) {
                continue;
            }

            if (this.isCharacterUnlocked(character, gameStats)) {
                this.unlockCharacter(id);
                newUnlocks.push(character);
            }
        }

        return newUnlocks;
    }

    isCharacterUnlocked(character, gameStats = null) {
        const req = character.unlockRequirement;
        const saveData = this.saveSystem.data;

        // Character with no unlock requirement (like rookie) is always unlocked
        if (!req) return true;

        switch (req.type) {
            case 'distance':
                return saveData.bestDistance >= req.value;
            
            case 'survival':
                return saveData.bestDistance >= req.value;
            
            case 'kills':
                return saveData.totalKills >= req.value;
            
            case 'total_bosses':
                return saveData.bossesKilled >= req.value;
            
            case 'bosses_single_game':
                return gameStats && gameStats.bossesKilledThisGame >= req.value;
            
            case 'kills_single_game':
                return gameStats && gameStats.killsThisGame >= req.value;
            
            case 'distance_milestone':
                return saveData.bestDistance >= req.value;
            
            case 'multiple':
                return req.requirements.every(subReq => {
                    return this.isCharacterUnlocked({ unlockRequirement: subReq }, gameStats);
                });
            
            default:
                return false;
        }
    }

    unlockCharacter(characterId) {
        if (!this.saveSystem.data.unlockedCharacters.includes(characterId)) {
            this.saveSystem.data.unlockedCharacters.push(characterId);
            this.characters[characterId].unlocked = true;
            this.saveSystem.saveData();
        }
    }

    selectCharacter(characterId) {
        const character = this.characters[characterId];
        if (!character) {
            console.warn(`Character ${characterId} not found, defaulting to rookie`);
            characterId = 'rookie';
            character = this.characters.rookie;
        }

        if (this.isCharacterUnlocked(character) || 
            this.saveSystem.data.unlockedCharacters.includes(characterId)) {
            this.currentCharacter = characterId;
            this.saveSystem.data.selectedCharacter = characterId;
            this.saveSystem.saveData();
            return true;
        }
        return false;
    }

    getCurrentCharacter() {
        return this.characters[this.currentCharacter];
    }

    getUnlockedCharacters() {
        return Object.values(this.characters).filter(char => 
            char.unlocked || this.saveSystem.data.unlockedCharacters.includes(char.id)
        );
    }

    getAllCharacters() {
        // Update unlock status from save data
        for (const char of Object.values(this.characters)) {
            if (this.saveSystem.data.unlockedCharacters.includes(char.id)) {
                char.unlocked = true;
            }
        }
        return this.characters;
    }

    getCharacterStartingBonuses() {
        const character = this.getCurrentCharacter();
        return character ? character.startingBonuses : {};
    }

    getRarityColor(rarity) {
        const colors = {
            common: '#ffffff',
            uncommon: '#1eff00',
            rare: '#0070dd',
            epic: '#a335ee',
            legendary: '#ff8000',
            mythic: '#e6cc80'
        };
        return colors[rarity] || colors.common;
    }

    getProgressToNextUnlock() {
        const saveData = this.saveSystem.data;
        const lockedCharacters = Object.values(this.characters).filter(char => 
            !char.unlocked && !saveData.unlockedCharacters.includes(char.id)
        );

        if (lockedCharacters.length === 0) {
            return null; // All characters unlocked
        }

        // Find the closest unlock
        let closest = null;
        let minProgress = Infinity;

        for (const char of lockedCharacters) {
            const progress = this.getUnlockProgress(char);
            if (progress.percentage < 100 && progress.percentage > minProgress) {
                closest = { character: char, progress };
                minProgress = progress.percentage;
            }
        }

        return closest;
    }

    getUnlockProgress(character) {
        const req = character.unlockRequirement;
        const saveData = this.saveSystem.data;

        let current = 0;
        let target = 0;

        switch (req.type) {
            case 'distance':
            case 'survival':
            case 'distance_milestone':
                current = saveData.bestDistance;
                target = req.value;
                break;
            
            case 'kills':
                current = saveData.totalKills;
                target = req.value;
                break;
            
            case 'total_bosses':
                current = saveData.bossesKilled;
                target = req.value;
                break;
            
            case 'bosses_single_game':
                current = 0; // This is a per-game achievement
                target = req.value;
                break;
            
            case 'kills_single_game':
                current = 0; // This is a per-game achievement
                target = req.value;
                break;
            
            case 'multiple':
                // For multiple requirements, show the lowest completion percentage
                let totalProgress = 0;
                for (const subReq of req.requirements) {
                    const subProgress = this.getUnlockProgress({ unlockRequirement: subReq });
                    totalProgress += subProgress.percentage;
                }
                return {
                    current: Math.floor(totalProgress / req.requirements.length),
                    target: 100,
                    percentage: totalProgress / req.requirements.length
                };
        }

        return {
            current,
            target,
            percentage: Math.min(100, (current / target) * 100)
        };
    }

    // Reset game stats for new game
    resetGameStats() {
        this.saveSystem.data.gameStats = {
            bossesKilledThisGame: 0,
            killsThisGame: 0,
            maxDistanceThisGame: 0
        };
    }

    // Update game stats during gameplay
    updateGameStats(type, value) {
        if (!this.saveSystem.data.gameStats) {
            this.resetGameStats();
        }

        switch (type) {
            case 'boss_kill':
                this.saveSystem.data.gameStats.bossesKilledThisGame++;
                break;
            case 'enemy_kill':
                this.saveSystem.data.gameStats.killsThisGame++;
                break;
            case 'distance':
                this.saveSystem.data.gameStats.maxDistanceThisGame = Math.max(
                    this.saveSystem.data.gameStats.maxDistanceThisGame, 
                    value
                );
                break;
        }
    }
}