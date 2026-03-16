class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.score = 0;
        this.distance = 0;
        this.farthestDistance = saveSystem.data.bestDistance || 0;
        this.distanceMultiplier = 1;
        this.lastMilestone = 0;
        this.resumeFromCheckpoint = false;
        this.pendingWarpCheckpoint = null;
        this.asteroidWarningShown = false;
        this.asteroidZoneActive = false;
        
        // Initialize character system
        this.characterSystem = new CharacterSystem(saveSystem);
        
        // Get selected character from session storage or use default
        const selectedCharacter = sessionStorage.getItem('selectedCharacter') || 'rookie';
        this.characterSystem.selectCharacter(selectedCharacter);
        
        // Apply starting bonuses from upgrades and character
        this.startingBonuses = saveSystem.getStartingBonuses();
        const characterBonuses = this.characterSystem.getCharacterStartingBonuses();
        
        // Merge bonuses
        const combinedBonuses = { ...this.startingBonuses };
        for (const [key, value] of Object.entries(characterBonuses)) {
            if (typeof value === 'number' && combinedBonuses[key]) {
                combinedBonuses[key] *= value; // Multiply for percentage bonuses
            } else {
                combinedBonuses[key] = value; // Direct assignment for other types
            }
        }
        
        // Game objects
        this.player = new Player(this.width / 2, this.height - 50, this.width, this.height, combinedBonuses);
        
        // Set player ship type based on selected character
        const currentChar = this.characterSystem.getCurrentCharacter();
        if (currentChar && currentChar.sprite) {
            const shipSkin = currentChar.sprite.replace('player_', '');
            if (typeof this.player.setBaseShipType === 'function') {
                this.player.setBaseShipType(shipSkin);
            } else {
                this.player.shipType = shipSkin;
                this.player.baseShipType = shipSkin;
            }
        }
        
        // Apply upgrade system upgrades to player
        if (this.upgradeSystem) {
            this.upgradeSystem.applyUpgrades(this.player);
        }
        
        // Reset game stats for new session
        this.characterSystem.resetGameStats();
        this.enemies = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.enemySpawner = typeof EnemySpawner !== 'undefined' ? new EnemySpawner(this.width) : null;
        
        // Power-up system
    this.powerUps = [];
    this.powerUpManager = typeof PowerUpManager !== 'undefined' ? new PowerUpManager(this.width) : null;
    this.powerUpEffects = [];
    // Relic/session modifiers manager (roguelite hooks)
    this.relicManager = typeof RelicManager !== 'undefined' ? new RelicManager(this) : null;
    this.audioManager = typeof AudioManager !== 'undefined' ? new AudioManager() : null;
    this.supportFighters = [];
    this.resourcePickups = [];
    this.resourceEffects = [];
        
        // Galaxy Conquest systems
    this.resourceManager = new GalaxyResourceManager();
        this.warpPortalManager = new WarpPortalManager(this.width);
        this.baseBuildingManager = new BaseBuildingManager();
    this.asteroidField = typeof AsteroidField !== 'undefined' ? new AsteroidField(this.width, this.height) : null;
        
        // Load Galaxy Conquest save data
        this.loadGalaxyConquestData();
        const restoredCheckpoint = this.applySavedWarpCheckpoint();
        if (restoredCheckpoint) {
            this.updateDistanceEffects();
        }
        
        // Particle effects
        this.explosions = [];
        
        // Screen effects
        this.screenShake = 0;
        this.currencyDoublerActive = false;
        this.currencyDoublerTime = 0;
        this.nukeFlashTime = 0;
        this.bossWarningTime = 0;
        
        // UI elements - Updated for new mobile HTML structure
        this.scoreElement = document.getElementById('score-value');
        this.waveElement = document.getElementById('wave-value');
        this.killsElement = document.getElementById('kills-value');
        this.currencyElement = document.getElementById('currency-value');
        this.distanceElement = document.getElementById('distance-value');
        this.farthestDistanceElement = document.getElementById('farthest-distance-value');
        this.difficultyElement = document.getElementById('difficulty-value');
        this.distanceGaugeElement = document.getElementById('nav-value');
        this.comboDisplayElement = document.getElementById('combo-display');
        this.streakValueElement = document.getElementById('streak-value');
        this.comboValueElement = document.getElementById('combo-value');
        this.gameOverElement = document.getElementById('game-over-overlay');
        this.finalScoreElement = document.getElementById('final-score-value');
        this.finalDistanceElement = document.getElementById('final-distance-value');
        this.finalKillsElement = document.getElementById('final-kills-value');
        this.creditsEarnedElement = document.getElementById('credits-earned-value');
        this.restartBtn = document.getElementById('restart-action-btn');
        this.menuBtn = document.getElementById('menu-action-btn');
        this.powerUpStatusElement = document.getElementById('power-status');
        this.powerUpBadgesElement = document.getElementById('power-badges');
        this.powerUpShipElement = document.getElementById('power-ship');
        this.powerUpGlowElement = document.getElementById('power-glow');
        this.damageMeterFill = document.getElementById('health-fill');
        this.damageMeterValue = document.getElementById('health-value');
        this.resourceHUD = {
            energy: document.getElementById('energy-value'),
            metal: document.getElementById('metal-value'),
            crystals: document.getElementById('crystals-value'),
            darkMatter: document.getElementById('dark-matter-value')
        };
        this.powerUpUIStateHash = '';
        this.powerUpUIEmpty = true;
        this.commandMenu = document.getElementById('pause-overlay');
        this.resumeMissionBtn = document.getElementById('resume-mission-btn');
        this.commandMainMenuBtn = document.getElementById('main-menu-btn');
        this.commandBaseBtn = document.getElementById('base-btn');
        this.commandAudioBtn = document.getElementById('audio-btn');

        // New mobile UI elements
        this.pauseBtn = document.getElementById('pause-btn');
        this.menuBtnBottom = document.getElementById('menu-btn');
        this.currencyDisplay = document.getElementById('currency-display');
        this.healthBar = document.getElementById('health-bar');
        this.statusBar = document.getElementById('status-bar');
        this.controlBar = document.getElementById('control-bar');
        this.leftPanel = document.getElementById('left-panel');
        this.rightPanel = document.getElementById('right-panel');

        // Initialize UI
        this.initializeMobileUI();
        
        // Initialize upgrade system and load saved upgrades
        if (typeof upgradeSystem !== 'undefined') {
            const savedUpgrades = saveSystem.getUpgradesData();
            if (savedUpgrades) {
                upgradeSystem.loadSaveData(savedUpgrades);
            } else {
                // Set initial currency from save system credits
                upgradeSystem.currency = saveSystem.getCredits();
            }
            // Apply upgrades to player
            upgradeSystem.applyUpgrades(this.player);
        }
        
        // Initialize achievement manager
        this.achievementManager = new AchievementManager();
        this.achievementManager.addListener((event, data) => {
            if (event === 'achievement_unlocked') {
                this.showAchievementNotification(data.achievement, data.reward);
                this.updateAchievementsUI();
            }
        });
        
        // Initialize daily challenges system
        this.dailyChallenges = new DailyChallenges(saveSystem);
        
        // Set up challenge completion callback
        this.dailyChallenges.onChallengeComplete = (challenge) => {
            this.showChallengeNotification(challenge);
            this.updateDailyChallengesUI();
        };
        
        // Initial UI updates
        this.updateDailyChallengesUI();
        this.updateAchievementsUI();
        
    this.setupEventListeners();
    this.setupCommandMenu();
    // Expose instance for debugging and enable quick inspection from DevTools
    try { window.gameInstance = this; } catch (e) { /* noop in strict contexts */ }
    this.start();
        // Set initial UI states
        if (this.powerUpStatusElement) {
            this.powerUpStatusElement.textContent = 'None';
        }

        // Initialize health bar
        this.updateHealthBar();

        // Initialize currency display
        this.updateCurrencyDisplay();

        // Initialize navigation display
        this.updateNavigationDisplay();

        // Initialize resource display
        this.updateResourceDisplay();

        this.updatePowerUpShipSprite();
        this.updatePowerUpGlow();
    }

    updateHealthBar() {
        if (!this.damageMeterFill || !this.damageMeterValue) return;

        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        this.damageMeterFill.style.width = `${healthPercent}%`;
        this.damageMeterValue.textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
    }

    updateCurrencyDisplay() {
        if (!this.currencyElement || !this.currencyDisplay) return;
        this.currencyElement.textContent = this.score.toLocaleString();
    }

    updateNavigationDisplay() {
        if (!this.distanceGaugeElement) return;
        this.distanceGaugeElement.textContent = Math.floor(this.distance);
    }

    updateResourceDisplay() {
        if (!this.resourceHUD.energy) return;

        const resources = this.resourceManager.getResources();
        this.resourceHUD.energy.textContent = Math.floor(resources.energy);
        this.resourceHUD.metal.textContent = Math.floor(resources.metal);
        this.resourceHUD.crystals.textContent = Math.floor(resources.crystals);
        this.resourceHUD.darkMatter.textContent = Math.floor(resources.darkMatter);
    }

    setupEventListeners() {
        // Mobile control buttons
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.togglePause());
        }
        if (this.menuBtnBottom) {
            this.menuBtnBottom.addEventListener('click', () => this.returnToMenu());
        }

        // Game over actions
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => this.returnToMenu());
        }

        // Pause functionality - both keyboard and touch
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Escape') {
                this.togglePause();
                e.preventDefault();
            }
        });

        // Prevent context menu on mobile
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupCommandMenu() {
        if (!this.commandMenu) return;
        this.resumeMissionBtn?.addEventListener('click', () => {
            if (this.isPaused) {
                this.togglePause();
            }
        });
        this.commandMainMenuBtn?.addEventListener('click', () => this.returnToMenu());
        this.commandBaseBtn?.addEventListener('click', () => this.dockAtBaseFromMenu());
        this.commandAudioBtn?.addEventListener('click', () => {
            if (!this.audioManager) return;
            const muted = this.audioManager.toggleMute();
            this.commandAudioBtn.textContent = muted ? 'SOUND: OFF' : 'SOUND: ON';
        });
        if (this.audioManager && this.commandAudioBtn) {
            this.commandAudioBtn.textContent = this.audioManager.isMuted ? 'SOUND: OFF' : 'SOUND: ON';
        }
    }

    start() {
        this.isRunning = true;
        this.gameOver = false;
        this.gameLoop();
    }

    restart() {
        this.score = 0;
        this.distance = 0;
        this.distanceMultiplier = 1;
        this.lastMilestone = 0;
        this.gameOver = false;
        this.isPaused = false;
    this.updateCommandMenuVisibility();
        
        // Reapply starting bonuses
        this.startingBonuses = saveSystem.getStartingBonuses();
        
        // Reset player
        this.player.reset(this.width / 2, this.height - 50, this.startingBonuses);
        
        // Clear arrays
        this.enemies = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.explosions = [];
        this.powerUps = [];
        this.powerUpEffects = [];
        
        // Reset spawner
        this.enemySpawner = new EnemySpawner(this.width);
        this.powerUpManager = new PowerUpManager(this.width);
    this.asteroidField = typeof AsteroidField !== 'undefined' ? new AsteroidField(this.width, this.height) : null;
    this.asteroidWarningShown = false;
    this.asteroidZoneActive = false;
        
        // Hide game over screen
        this.gameOverElement.classList.add('hidden');
        
        this.start();
    }

    togglePause() {
        if (!this.gameOver) {
            this.isPaused = !this.isPaused;
            this.updateCommandMenuVisibility();
        }
    }

    updateCommandMenuVisibility() {
        if (!this.commandMenu) return;
        if (this.isPaused) {
            this.commandMenu.classList.remove('hidden');
            this.commandMenu.classList.add('visible');
        } else {
            this.commandMenu.classList.remove('visible');
            this.commandMenu.classList.add('hidden');
        }
    }

    update() {
        if (this.isPaused || this.gameOver) return;

    // Update distance (player is always "moving forward")
    this.distance += 0.5; // Base distance increment per frame
    const distanceKm = Math.floor(this.distance / 100);
    this.updateDistanceEffects();
    
    // Track achievement progress for distance
    this.achievementManager.trackEvent('distance_traveled', { distance: this.distance });
    this.achievementManager.trackEvent('score_earned', { score: this.score });
    this.dailyChallenges.trackEvent('distance_traveled', Math.floor(this.distance / 100));
    
    // Update character system distance tracking
    this.characterSystem.updateGameStats('distance', this.distance);
    
    // Update player
    this.player.update();
    this.updateSupportFighters();
        
        // Player automatic shooting
        const playerProjectile = this.player.shoot();
        if (playerProjectile) {
            if (Array.isArray(playerProjectile)) {
                // Multi-shot
                this.playerProjectiles.push(...playerProjectile);
            } else {
                this.playerProjectiles.push(playerProjectile);
            }
            if (this.audioManager) {
                this.audioManager.playShoot();
            }
        }
        
        // Update enemy spawner
        this.enemySpawner.update();
        
        // Spawn new enemies (can be single enemy or formation)
        const newEnemy = this.enemySpawner.spawnEnemy();
        if (newEnemy) {
            if (Array.isArray(newEnemy)) {
                // Formation spawning
                this.enemies.push(...newEnemy);
            } else {
                this.enemies.push(newEnemy);
            }
        }
        
        // Update power-up manager
        this.powerUpManager.update();
        
        // Spawn new power-ups
        const newPowerUp = this.powerUpManager.spawnPowerUp();
        if (newPowerUp) {
            this.powerUps.push(newPowerUp);
        }
        
        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update());
    this.resourcePickups.forEach(pickup => pickup.update());
    this.updateResourceEffects();
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player.x, this.player.y);
            
            // Enemy shooting with adaptive frequency
            const shootChance = enemy.type === 'boss' ? 0.05 : 
                              enemy.type === 'sniper' ? 0.03 : 
                              enemy.type === 'heavy' ? 0.025 : 0.008;
            
            if (enemy.canShoot() && Math.random() < shootChance) {
                const enemyProjectiles = enemy.shoot();
                if (enemyProjectiles) {
                    if (Array.isArray(enemyProjectiles)) {
                        this.enemyProjectiles.push(...enemyProjectiles);
                    } else {
                        this.enemyProjectiles.push(enemyProjectiles);
                    }
                }
            }
        });
        
        // Update projectiles
        this.playerProjectiles.forEach(projectile => projectile.update(this.enemies));
        this.enemyProjectiles.forEach(projectile => projectile.update());
        
        // Update explosions and effects
        this.explosions.forEach(explosion => explosion.update());
        this.powerUpEffects.forEach(effect => effect.update());
        
        // Update Galaxy Conquest systems
        this.warpPortalManager.update(this.distance);
        
        // Check for warp portal collisions
        const portalCollision = this.warpPortalManager.checkPortalCollisions(this.player);
        if (portalCollision) {
            this.handleWarpPortalEntry(portalCollision);
        }

        // Update asteroid field hazards between 44-54km
        if (this.asteroidField) {
            this.asteroidField.update({
                distanceKm,
                player: this.player,
                projectiles: this.playerProjectiles,
                createExplosion: (x, y, color, scale) => this.createExplosion(x, y, color, scale),
                onPlayerHit: () => {
                    this.screenShake = Math.max(this.screenShake, 6);
                    const playerDead = this.player.takeDamage();
                    if (playerDead) {
                        this.endGame();
                    }
                },
                onScore: (points) => {
                    if (points) {
                        this.score += Math.round(points * this.player.getScoreMultiplier());
                    }
                },
                onEnter: () => this.handleAsteroidFieldEnter(),
                onExit: () => this.handleAsteroidFieldExit()
            });
        }
        
        // Update screen effects
        if (this.screenShake > 0) {
            this.screenShake--;
        }
        
        // Update currency doubler timer
        if (this.currencyDoublerTime > 0) {
            this.currencyDoublerTime--;
            if (this.currencyDoublerTime <= 0) {
                this.currencyDoublerActive = false;
            }
        }
        
        // Update nuke flash effect
        if (this.nukeFlashTime > 0) {
            this.nukeFlashTime--;
        }
        
        if (this.bossWarningTime > 0) {
            this.bossWarningTime--;
        }
        
        // Check for boss wave warning
        if (this.enemySpawner.currentWave > 0 && 
            (this.enemySpawner.currentWave + 1) % 5 === 0 && 
            this.enemySpawner.isWaveBreak && 
            this.bossWarningTime === 0) {
            this.bossWarningTime = 180; // 3 seconds warning
        }
        
        // Handle collisions
        this.handleCollisions();
        
        // Remove off-screen objects
        this.cleanupObjects();
        
        // Update UI
        this.updateUI();
    }

    updateUI() {
        // Update status bar elements
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score.toLocaleString();
        }
        if (this.waveElement) {
            this.waveElement.textContent = this.enemySpawner.currentWave;
        }
        if (this.killsElement) {
            this.killsElement.textContent = this.player.kills || 0;
        }
        if (this.distanceElement) {
            this.distanceElement.textContent = Math.floor(this.distance);
        }
        if (this.farthestDistanceElement) {
            this.farthestDistanceElement.textContent = Math.floor(this.farthestDistance);
        }
        if (this.difficultyElement) {
            this.difficultyElement.textContent = this.enemySpawner.getDifficultyLevel();
        }

        // Update health bar
        this.updateHealthBar();

        // Update navigation display
        this.updateNavigationDisplay();

        // Update currency display
        this.updateCurrencyDisplay();

        // Update resource display
        this.updateResourceDisplay();

        // Update combo display
        this.updateComboDisplay();

        // Update power-up status
        this.updatePowerUpDisplay();
    }

    updateComboDisplay() {
        if (!this.comboDisplayElement) return;

        const combo = this.player.combo || 0;
        const streak = this.player.killStreak || 0;

        if (combo > 1) {
            this.comboDisplayElement.classList.remove('hidden');
            if (this.streakValueElement) {
                this.streakValueElement.textContent = streak;
            }
            if (this.comboValueElement) {
                this.comboValueElement.textContent = combo.toFixed(1);
            }
        } else {
            this.comboDisplayElement.classList.add('hidden');
        }
    }

    updatePowerUpDisplay() {
        if (!this.powerUpStatusElement) return;

        const activePowerUps = this.player.getActivePowerUps();
        if (activePowerUps.length > 0) {
            this.powerUpStatusElement.textContent = activePowerUps[0].type;
        } else {
            this.powerUpStatusElement.textContent = 'None';
        }
    }

    handleCollisions() {
        // Player projectiles vs enemies
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.playerProjectiles[i];
            let projectileHitSomething = false;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                // Skip if piercing bullet already hit this enemy
                if (projectile.hitTargets && projectile.hitTargets.has(enemy)) {
                    continue;
                }
                
                if (projectile.collidesWith(enemy)) {
                    // Create explosion
                    this.createExplosion(enemy.x, enemy.y);
                    
                    // Mark enemy as hit for piercing bullets
                    if (projectile.hitTargets) {
                        projectile.hitTargets.add(enemy);
                    }
                    
                    // Damage enemy with bullet damage
                    const damage = projectile.damage || 1;
                    const enemyDestroyed = enemy.takeDamage(damage);
                    if (enemyDestroyed) {
                        this.score += enemy.points * this.player.getScoreMultiplier();
                        this.enemies.splice(j, 1);
                        this.enemySpawner.onEnemyKilled();
                        this.player.onEnemyKilled();
                        this.spawnResourceDrops(enemy);
                        
                        // Award currency for destroying enemy
                        if (typeof upgradeSystem !== 'undefined') {
                            let coinReward = upgradeSystem.calculateCoinReward(enemy);
                            // Double coins if currency doubler is active
                            if (this.currencyDoublerActive) {
                                coinReward *= 2;
                            }
                            upgradeSystem.addCurrency(coinReward);
                        }
                        
                        // Track kills for character system
                        this.characterSystem.updateGameStats('enemy_kill');
                        if (enemy.isBoss) {
                            this.characterSystem.updateGameStats('boss_kill');
                        }
                        
                        // Track for collection system
                        collectionSystem.encounterEnemy(enemy.type);
                        collectionSystem.updateStats({
                            totalKills: collectionSystem.statistics.totalKills + 1,
                            bossesDefeated: enemy.isBoss ? collectionSystem.statistics.bossesDefeated + 1 : collectionSystem.statistics.bossesDefeated,
                            megaBossesDefeated: enemy.isMegaBoss ? collectionSystem.statistics.megaBossesDefeated + 1 : collectionSystem.statistics.megaBossesDefeated
                        });
                        
                        // Special effects for certain enemy types
                        if (enemy.type === 'boss') {
                            this.createBossDestroyEffect(enemy.x, enemy.y);
                        }
                        
                        // Explosive shots create area damage
                        if (projectile.isExplosive) {
                            this.createExplosiveAreaDamage(enemy.x, enemy.y, projectile.damage);
                        }
                    }
                    
                    projectileHitSomething = true;
                    
                    // Remove projectile if not piercing or hit max targets
                    if (!projectile.isPiercing || projectile.hitTargets.size >= projectile.maxPierceTargets) {
                        break;
                    }
                }
            }
            
            // Remove projectile if it hit something and isn't piercing, or if piercing and hit max targets
            if (projectileHitSomething && (!projectile.isPiercing || (projectile.hitTargets && projectile.hitTargets.size >= projectile.maxPierceTargets))) {
                this.playerProjectiles.splice(i, 1);
                if (typeof projectile.recycle === 'function') {
                    projectile.recycle();
                }
            }
        }
        
        // Enemy projectiles vs player
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            
            if (projectile.collidesWith(this.player)) {
                this.enemyProjectiles.splice(i, 1);
                if (typeof projectile.recycle === 'function') {
                    projectile.recycle();
                }
                this.createExplosion(this.player.x, this.player.y);
                
                const playerDead = this.player.takeDamage();
                if (playerDead) {
                    this.endGame();
                } else if (this.audioManager) {
                    this.audioManager.playDamage();
                }
            }
        }
        
        // Enemies vs player (collision damage)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.collidesWith(this.player)) {
                this.enemies.splice(i, 1);
                this.createExplosion(enemy.x, enemy.y);
                this.spawnResourceDrops(enemy);
                
                // Track achievement progress
                this.achievementManager.trackEvent('enemy_killed', { enemyType: enemy.type });
                this.dailyChallenges.trackEvent('enemy_killed');
                if (enemy.isBoss) {
                    this.achievementManager.trackEvent('boss_killed', { bossType: enemy.type });
                    this.dailyChallenges.trackEvent('boss_killed');
                }
                
                const playerDead = this.player.takeDamage();
                if (playerDead) {
                    this.endGame();
                } else if (this.audioManager) {
                    this.audioManager.playDamage();
                }
            }
        }
        
        // Player projectiles vs special power-ups (currencyDoubler needs to be shot)
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.playerProjectiles[i];
            
            for (let j = this.powerUps.length - 1; j >= 0; j--) {
                const powerUp = this.powerUps[j];
                
                // Only currency doubler can be shot
                if (powerUp.type === 'currencyDoubler' && projectile.collidesWith(powerUp)) {
                    // Remove projectile
                    this.playerProjectiles.splice(i, 1);
                    if (typeof projectile.recycle === 'function') {
                        projectile.recycle();
                    }
                    
                    // Hit the power-up
                    const readyToCollect = powerUp.takeDamage(projectile.damage || 1);
                    
                    // Create hit effect
                    this.createExplosion(powerUp.x, powerUp.y, '#ffd700', 0.5);
                    
                    if (readyToCollect) {
                        // Power-up is ready to be collected automatically
                        this.powerUps.splice(j, 1);
                        
                        // Create collection effect
                        this.powerUpEffects.push(new PowerUpEffect(powerUp.x, powerUp.y, powerUp.color, 'collect'));
                        
                        // Activate currency doubler effect
                        this.activateCurrencyDoubler();
                        
                        // Create activation effect on player
                        this.powerUpEffects.push(new PowerUpEffect(this.player.x, this.player.y, powerUp.color, 'activate'));
                    }
                    
                    break;
                }
            }
        }
        
        // Power-ups vs player
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (powerUp.collidesWith(this.player)) {
                // Handle different power-up types
                if (powerUp.type === 'nuke') {
                    // Nuke effect - instant activation
                    this.activateNuke();
                    this.powerUps.splice(i, 1);
                    
                    // Create massive explosion effect
                    this.powerUpEffects.push(new PowerUpEffect(powerUp.x, powerUp.y, powerUp.color, 'collect'));
                    this.powerUpEffects.push(new PowerUpEffect(this.player.x, this.player.y, powerUp.color, 'activate'));
                } else if (powerUp.type === 'currencyDoubler') {
                    // Currency doubler cannot be collected by touch - must be shot
                    continue;
                } else {
                    // Regular power-up collection
                    powerUp.collect();
                    this.powerUps.splice(i, 1);
                    
                    // Create collection effect
                    this.powerUpEffects.push(new PowerUpEffect(powerUp.x, powerUp.y, powerUp.color, 'collect'));
                    
                    // Activate power-up
                    this.player.activatePowerUp(powerUp.type, powerUp.duration);
                    
                    // Track achievement progress
                    this.achievementManager.trackEvent('powerup_collected', { powerupType: powerUp.type });
                    this.dailyChallenges.trackEvent('powerup_collected');
                    
                    // Create activation effect on player
                    this.powerUpEffects.push(new PowerUpEffect(this.player.x, this.player.y, powerUp.color, 'activate'));
                }
            }
        }

        // Resource pickups vs player (support magnet relic attraction)
        for (let i = this.resourcePickups.length - 1; i >= 0; i--) {
            const pickup = this.resourcePickups[i];
            let collected = false;

            // Standard collision check
            if (pickup.collidesWith(this.player)) {
                collected = true;
            }

            // Magnet relic: attract pickups within 120px
            if (!collected && this.player && this.player._relicMagnet) {
                const dx = pickup.x - this.player.x;
                const dy = pickup.y - this.player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist <= 120) {
                    collected = true;
                }
            }

            if (collected) {
                this.collectResourcePickup(pickup, i);
            }
        }
    }

    cleanupObjects() {
        this.recycleProjectiles(this.playerProjectiles);
        this.recycleProjectiles(this.enemyProjectiles);
        
        // Remove off-screen enemies (they reached the bottom)
        this.enemies = this.enemies.filter(enemy => !enemy.isOffScreen(this.height));
        
        // Remove off-screen power-ups
        this.powerUps = this.powerUps.filter(powerUp => !powerUp.isOffScreen(this.height));
        
        // Remove finished explosions and effects
        this.explosions = this.explosions.filter(explosion => !explosion.isFinished());
        this.powerUpEffects = this.powerUpEffects.filter(effect => !effect.isFinished());
        this.capArray(this.powerUpEffects, 80);
        this.supportFighters = this.supportFighters.filter(fighter => !fighter.isExpired());
        this.resourcePickups = this.resourcePickups.filter(pickup => !pickup.isExpired(this.height));
        this.resourceEffects = this.resourceEffects.filter(effect => effect.currentLife < effect.lifetime);
        this.capArray(this.resourceEffects, 50);
    }

    recycleProjectiles(list) {
        for (let i = list.length - 1; i >= 0; i--) {
            const projectile = list[i];
            if (!projectile || !projectile.active || projectile.isOffScreen(this.height)) {
                if (projectile && typeof projectile.recycle === 'function') {
                    projectile.recycle();
                }
                list.splice(i, 1);
            }
        }
    }

    capArray(list, maxSize, recycleFn) {
        if (!Array.isArray(list) || list.length <= maxSize) return;
        const overflow = list.length - maxSize;
        const removed = list.splice(0, overflow);
        if (typeof recycleFn === 'function') {
            removed.forEach(item => recycleFn(item));
        }
    }

    createExplosion(x, y, color = null, scale = 1) {
        this.explosions.push(new Explosion(x, y, color, scale));
        this.capArray(this.explosions, 40);
        if (this.audioManager) {
            this.audioManager.playExplosion();
        }
    }

    updateDistanceEffects() {
        // Calculate distance-based multipliers
        const distanceKm = Math.floor(this.distance / 100);
        this.distanceMultiplier = 1 + (distanceKm * 0.1); // 10% increase per km
        
        // Check for distance milestones
        const currentMilestone = Math.floor(distanceKm / 5) * 5; // Every 5km
        if (currentMilestone > this.lastMilestone && currentMilestone > 0) {
            this.triggerDistanceMilestone(currentMilestone);
            this.lastMilestone = currentMilestone;
            // Offer mutation portal on larger milestones (every 15 km)
            const km = Math.floor(this.distance / 100);
            if (km % 15 === 0 && km > 0) {
                this.offerMutationChoice();
            }
        }
        
        // Update enemy spawner with distance difficulty
        this.enemySpawner.setDistanceMultiplier(this.distanceMultiplier, distanceKm);
    }

    triggerDistanceMilestone(milestone) {
        // Create visual effect for milestone
        this.screenShake = 8;
        
        // Special milestone rewards based on distance
        if (milestone % 10 === 0) { // Every 10km - Major milestone
            // Guaranteed rare power-up
            const x = Math.random() * (this.width - 40) + 20;
            this.powerUps.push(new PowerUp(x, -30, 'scoreMultiplier'));
            
            // Restore health if not at max
            if (this.player.lives < this.player.maxLives) {
                this.player.lives++;
                if (typeof this.player.health === 'number') {
                    this.player.health = Math.min(this.player.maxHealth || this.player.maxLives, this.player.health + 1);
                }
            }
            
            // Big score bonus
            this.score += milestone * 25 * this.player.getScoreMultiplier();
        } else if (milestone % 5 === 0) { // Every 5km - Regular milestone
            // 80% chance for power-up
            if (Math.random() < 0.8) {
                const x = Math.random() * (this.width - 40) + 20;
                const powerUpTypes = ['rapidFire', 'multiShot', 'shield', 'health'];
                const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                this.powerUps.push(new PowerUp(x, -30, randomType));
            }
            
            // Regular score bonus
            this.score += milestone * 15 * this.player.getScoreMultiplier();
        }
        
        // Create celebration effect
        this.createMilestoneEffect();
        // Small chance to award a blueprint shard for boss-tier milestones
        if (milestone % 10 === 0 && Math.random() < 0.5) {
            // pick a simple blueprint key
            const bpKey = `ship_frame_${Math.floor(Math.random()*3)+1}`;
            if (this.resourceManager) {
                this.resourceManager.addBlueprint(bpKey, 1);
                if (typeof this.showPortalRewardToast === 'function') {
                    this.showPortalRewardToast('Blueprint Fragment', `Recovered blueprint fragment: ${bpKey}`);
                }
            }
        }
    }

    createMilestoneEffect() {
        // Create multiple small explosions across the screen
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                this.powerUpEffects.push(new PowerUpEffect(x, y, '#ffaa00', 'collect'));
            }, i * 100);
        }
    }

    handleAsteroidFieldEnter() {
        this.asteroidZoneActive = true;
        this.screenShake = Math.max(this.screenShake, 5);
        if (!this.asteroidWarningShown && typeof this.showPortalRewardToast === 'function') {
            this.showPortalRewardToast('Asteroid Field Detected', 'Dense debris between 44-54 km!');
        }
        this.asteroidWarningShown = true;
        if (this.audioManager) {
            this.audioManager.playWarning();
        }
    }

    handleAsteroidFieldExit() {
        this.asteroidZoneActive = false;
    }

    createBossDestroyEffect(x, y) {
        // Create multiple large explosions for boss
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.explosions.push(new Explosion(
                    x + (Math.random() - 0.5) * 80,
                    y + (Math.random() - 0.5) * 60
                ));
                this.screenShake = 10; // Screen shake effect
            }, i * 200);
        }
    }
    
    activateCurrencyDoubler() {
        // Set a currency doubler flag that lasts for a certain duration
        this.currencyDoublerActive = true;
        this.currencyDoublerTime = 480; // 8 seconds at 60fps
        
        // Visual feedback
        this.screenShake = 5;
        console.log("Currency Doubler activated! Double coins for 8 seconds!");
    }
    
    activateNuke() {
        // Kill all regular enemies and damage bosses
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.isBoss || enemy.type.includes('boss') || enemy.type === 'inferno' || 
                enemy.type === 'kraken' || enemy.type === 'ironclad' || enemy.type === 'venom') {
                // Boss enemies take 50% damage
                const damage = Math.ceil(enemy.maxHealth / 2);
                const destroyed = enemy.takeDamage(damage);
                
                if (destroyed) {
                    this.score += enemy.points * this.player.getScoreMultiplier();
                    this.enemies.splice(i, 1);
                    this.enemySpawner.onEnemyKilled();
                    this.player.onEnemyKilled();
                    this.spawnResourceDrops(enemy);
                    
                    // Award currency
                    if (typeof upgradeSystem !== 'undefined') {
                        let coinReward = upgradeSystem.calculateCoinReward(enemy);
                        // Double coins if currency doubler is active
                        if (this.currencyDoublerActive) {
                            coinReward *= 2;
                        }
                        upgradeSystem.addCurrency(coinReward);
                    }
                }
            } else {
                // Regular enemies are instantly destroyed
                this.score += enemy.points * this.player.getScoreMultiplier();
                this.enemies.splice(i, 1);
                this.enemySpawner.onEnemyKilled();
                this.player.onEnemyKilled();
                this.spawnResourceDrops(enemy);
                
                // Award currency
                if (typeof upgradeSystem !== 'undefined') {
                    let coinReward = upgradeSystem.calculateCoinReward(enemy);
                    // Double coins if currency doubler is active
                    if (this.currencyDoublerActive) {
                        coinReward *= 2;
                    }
                    upgradeSystem.addCurrency(coinReward);
                }
            }
            
            // Create explosion effect for each enemy
            this.createExplosion(enemy.x, enemy.y, '#ff0000', 1.5);
        }
        
        // Screen effects
        this.screenShake = 15;
        
        // Create screen-wide flash effect
        this.nukeFlashTime = 30; // Flash effect duration
        
        console.log("NUKE ACTIVATED! All enemies affected!");
    }
    
    createExplosiveAreaDamage(x, y, damage) {
        const explosionRadius = 60;
        const areaDamage = Math.ceil(damage / 2);
        
        // Create visual effect
        for (let i = 0; i < 8; i++) {
            this.explosions.push(new Explosion(
                x + (Math.random() - 0.5) * explosionRadius * 1.5,
                y + (Math.random() - 0.5) * explosionRadius * 1.5
            ));
        }
        
        // Screen shake for explosion effect
        this.screenShake = 5;
        
        // Damage enemies in explosion radius
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const distance = Math.sqrt(
                Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2)
            );
            
            if (distance <= explosionRadius) {
                const enemyDestroyed = enemy.takeDamage(areaDamage);
                if (enemyDestroyed) {
                    this.score += enemy.points * this.player.getScoreMultiplier();
                    this.enemies.splice(i, 1);
                    this.enemySpawner.onEnemyKilled();
                    this.player.onEnemyKilled();
                    
                    // Award currency for destroying enemy
                    if (typeof upgradeSystem !== 'undefined') {
                        let coinReward = upgradeSystem.calculateCoinReward(enemy);
                        // Double coins if currency doubler is active
                        if (this.currencyDoublerActive) {
                            coinReward *= 2;
                        }
                        upgradeSystem.addCurrency(coinReward);
                    }
                    
                    // Track kills for character system
                    this.characterSystem.updateGameStats('enemy_kill');
                    if (enemy.isBoss) {
                        this.characterSystem.updateGameStats('boss_kill');
                    }
                    
                    // Track for collection system
                    collectionSystem.encounterEnemy(enemy.type);
                    collectionSystem.updateStats({
                        totalKills: collectionSystem.statistics.totalKills + 1,
                        bossesDefeated: enemy.isBoss ? collectionSystem.statistics.bossesDefeated + 1 : collectionSystem.statistics.bossesDefeated,
                        megaBossesDefeated: enemy.isMegaBoss ? collectionSystem.statistics.megaBossesDefeated + 1 : collectionSystem.statistics.megaBossesDefeated
                    });
                }
            }
        }
    }

    spawnResourceDrops(enemy) {
        if (!enemy || !enemy.isBoss || typeof this.resourceManager === 'undefined') return;
        if (typeof ResourcePickup === 'undefined') return;

        const dropType = this.mapEnemyTypeForResources(enemy);
        const drops = this.resourceManager.generateCombatDrop(dropType, false);
        const multiplier = enemy.isMegaBoss ? 2.5 : enemy.type?.toLowerCase().includes('mini') ? 1.4 : 1;

        Object.entries(drops).forEach(([resource, amount]) => {
            if (!amount) return;
            const scaledAmount = Math.max(1, Math.round(amount * multiplier));
            const offsetX = (Math.random() - 0.5) * 30;
            this.resourcePickups.push(new ResourcePickup(enemy.x + offsetX, enemy.y, resource, scaledAmount));
        });

        this.spawnBossPowerUp(enemy);

        if (enemy.isMegaBoss && typeof this.player.addExtraLife === 'function') {
            const gained = this.player.addExtraLife(1, true);
            if (gained > 0) {
                this.powerUpEffects.push(new PowerUpEffect(this.player.x, this.player.y, '#ff6b6b', 'activate'));
                if (typeof this.showPortalRewardToast === 'function') {
                    this.showPortalRewardToast('Mega Boss Core Salvaged', '+1 extra life secured!');
                }
            }
        }
    }

    spawnBossPowerUp(enemy) {
        if (!enemy || !enemy.isBoss || typeof PowerUp === 'undefined') return;
        const pool = enemy.isMegaBoss
            ? ['multiShot', 'shield', 'scoreMultiplier', 'nuke', 'currencyDoubler']
            : ['rapidFire', 'multiShot', 'shield', 'speedBoost'];
        const dropCount = enemy.isMegaBoss ? 2 : 1;

        for (let i = 0; i < dropCount; i++) {
            const choice = pool[Math.floor(Math.random() * pool.length)];
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 20;
            this.powerUps.push(new PowerUp(enemy.x + offsetX, enemy.y + offsetY, choice));
        }
    }

    mapEnemyTypeForResources(enemy) {
        const type = (enemy?.type || 'basic').toLowerCase();
        if (type.includes('boss')) return 'boss';
        if (type.includes('mini')) return 'miniboss';
        if (type.includes('tank') || type.includes('heavy')) return 'tank';
        if (type.includes('fast') || type.includes('scout')) return 'fast';
        return 'basic';
    }

    collectResourcePickup(pickup, index) {
        this.resourceManager.addResource(pickup.resource, pickup.amount);
        const effect = this.resourceManager.createResourceEffect(pickup.x, pickup.y, pickup.resource, pickup.amount);
        this.resourceEffects.push(effect);
        this.capArray(this.resourceEffects, 50);
        this.resourcePickups.splice(index, 1);
        this.updateResourceHUD();
        if (this.audioManager) {
            this.audioManager.playPickup();
        }
    }

    spawnSupportFighter(type = 'basic') {
        if (typeof SupportFighter === 'undefined') return null;
        const fighter = new SupportFighter(type, this.player, this.width, this.height);
        this.supportFighters.push(fighter);
        if (this.supportFighters.length > 2) {
            this.supportFighters.shift();
        }
        return fighter;
    }

    showPortalRewardToast(title, description) {
        const toast = document.createElement('div');
        toast.className = 'portal-toast';
        toast.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('visible'));
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Offer a mutation choice UI: pick 3 relics and let the player choose one for the run
    offerMutationChoice() {
        // Pause the game
        this.isPaused = true;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'mutation-overlay';
        overlay.style.cssText = `position:fixed;left:0;top:0;width:100%;height:100%;z-index:2000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);`;

        const panel = document.createElement('div');
        panel.style.cssText = 'background:#07101a;color:#fff;padding:18px;border-radius:8px;max-width:600px;width:90%;text-align:center;font-family:Courier, monospace;';
        panel.innerHTML = '<h3 style="margin-top:0">MUTATION PORTAL</h3><p>Choose one relic for this run (temporary modifiers)</p>';

        const list = document.createElement('div');
        list.style.cssText = 'display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;';

        const picks = this.relicManager.pickRandomRelics(3);
        picks.forEach((rid) => {
            const relic = this.relicManager.available[rid];
            const btn = document.createElement('button');
            btn.className = 'cp-btn';
            btn.style.cssText = 'min-width:140px;padding:10px;border-radius:6px;background:#0b1b2a;color:#fff;border:1px solid rgba(255,255,255,0.06);cursor:pointer;';
            btn.innerHTML = `<strong>${relic.name}</strong><div style="font-size:12px;margin-top:6px">${relic.description}</div>`;
            btn.addEventListener('click', () => {
                this.relicManager.grantRelicToPlayer(rid);
                document.body.removeChild(overlay);
                this.isPaused = false;
            });
            list.appendChild(btn);
        });

        const skipBtn = document.createElement('button');
        skipBtn.textContent = 'Skip';
        skipBtn.style.cssText = 'display:block;margin:12px auto 0;padding:8px 14px;border-radius:6px;background:#222;color:#fff;border:none;cursor:pointer;';
        skipBtn.addEventListener('click', () => { document.body.removeChild(overlay); this.isPaused = false; });

        panel.appendChild(list);
        panel.appendChild(skipBtn);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    }

    offerBaseBuilderAccess(portalData) {
        const entryKm = this.pendingWarpCheckpoint?.entryKm ?? Math.floor(this.distance / 100);
        const message = `Warp portal stabilized at ${portalData.distance}km.\n\n` +
            `Dock at the satellite base now and resume combat at ${entryKm}km when you launch again?`;
        if (confirm(message)) {
            if (typeof saveSystem.setWarpCheckpoint === 'function') {
                saveSystem.setWarpCheckpoint(entryKm, portalData.distance, portalData.tier);
            }
            this.pendingWarpCheckpoint = null;
            window.location.href = `base-builder.html?checkpoint=${portalData.distance}`;
            return;
        }
        this.pendingWarpCheckpoint = null;
        this.isPaused = false;
    }

    showAchievementNotification(achievement, reward) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                ${reward ? `<div class="achievement-reward">Reward: ${reward.type === 'cosmetic' ? 'New Cosmetic' : reward.type}</div>` : ''}
            </div>
        `;

        // Add to game UI
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            gameUI.appendChild(notification);

            // Animate in
            setTimeout(() => notification.classList.add('show'), 100);

            // Remove after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }, 5000);
        }
    }

    updateDailyChallengesUI() {
        const challengesList = document.querySelector('.challenges-list');
        if (!challengesList || !this.dailyChallenges) return;

        // Get active challenges
        const challenges = this.dailyChallenges.getActiveChallenges();
        
        // Clear current display
        challengesList.innerHTML = '';

        // Render each challenge
        challenges.forEach((challenge, index) => {
            const progress = challenge.progress || 0;
            const target = challenge.target || 1;
            const percentage = Math.min(100, (progress / target) * 100);
            const isCompleted = challenge.completed;

            const challengeItem = document.createElement('div');
            challengeItem.className = `challenge-item${isCompleted ? ' completed' : ''}`;
            challengeItem.innerHTML = `
                <div class="challenge-title">${challenge.name}</div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar">
                        <div class="challenge-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="challenge-progress-text">${progress}/${target}</div>
                </div>
                <div class="challenge-reward">${challenge.reward}</div>
            `;
            challengesList.appendChild(challengeItem);
        });

        // Show message if no challenges
        if (challenges.length === 0) {
            challengesList.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">No active challenges today</div>';
        }
    }

    showChallengeNotification(challenge) {
        // Create challenge notification
        const notification = document.createElement('div');
        notification.className = 'challenge-notification';
        notification.innerHTML = `
            <div class="challenge-notification-icon"></div>
            <div class="challenge-notification-title">Challenge Complete!</div>
            <div class="challenge-notification-text">${challenge.name}</div>
            <div class="challenge-notification-reward">${challenge.reward}</div>
        `;

        // Add to body
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);

        // Play sound if available
        if (this.audioManager) {
            this.audioManager.playPowerUp();
        }
    }

    updateAchievementsUI() {
        const achievementCount = document.getElementById('achievementCount');
        const recentAchievements = document.getElementById('recentAchievements');
        
        if (!achievementCount || !recentAchievements || !this.achievementManager) return;

        // Update count
        const total = this.achievementManager.getAllAchievements().length;
        const unlocked = this.achievementManager.getUnlockedAchievements().length;
        achievementCount.textContent = `${unlocked}/${total}`;

        // Show recent achievements with progress
        const allAchievements = this.achievementManager.getAllAchievements();
        const inProgress = allAchievements
            .filter(ach => {
                const progress = this.achievementManager.getProgress(ach.id);
                return !progress.completed && progress.current > 0;
            })
            .sort((a, b) => {
                const progressA = this.achievementManager.getProgress(a.id);
                const progressB = this.achievementManager.getProgress(b.id);
                const percentA = progressA.current / (a.condition.total || a.condition.count || 1);
                const percentB = progressB.current / (b.condition.total || b.condition.count || 1);
                return percentB - percentA;
            })
            .slice(0, 3); // Show top 3 in-progress

        recentAchievements.innerHTML = '';
        
        inProgress.forEach(achievement => {
            const progress = this.achievementManager.getProgress(achievement.id);
            const target = achievement.condition.total || achievement.condition.count || 1;
            const percentage = Math.min(100, (progress.current / target) * 100);

            const achievementItem = document.createElement('div');
            achievementItem.className = 'achievement-mini';
            achievementItem.innerHTML = `
                <div class="achievement-mini-icon">${achievement.icon}</div>
                <div class="achievement-mini-info">
                    <div class="achievement-mini-name">${achievement.name}</div>
                    <div class="achievement-mini-desc">${Math.round(percentage)}% Complete</div>
                </div>
                <div class="achievement-mini-progress">${progress.current}/${target}</div>
            `;
            recentAchievements.appendChild(achievementItem);
        });

        if (inProgress.length === 0) {
            recentAchievements.innerHTML = '<div style="padding: 10px; text-align: center; color: #888; font-size: 10px;">Complete actions to unlock achievements!</div>';
        }
    }

    // Basic game loop in case it was missing in this file. Uses requestAnimationFrame.
    // Keeps the loop lightweight and non-invasive for debugging.
    draw() {
        // Basic drawing: clear canvas, apply screen shake, draw background and core objects.
        if (!this.ctx) return;
        const ctx = this.ctx;
        // keep canvas size in sync with CSS pixel size (helps when window resized)
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const cssW = Math.max(1, Math.round(rect.width));
            const cssH = Math.max(1, Math.round(rect.height));
            if (this.canvas.width !== cssW || this.canvas.height !== cssH) {
                this.canvas.width = cssW;
                this.canvas.height = cssH;
                this.width = this.canvas.width;
                this.height = this.canvas.height;
            }
        }

        ctx.save();

        // Screen shake
        if (this.screenShake && this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            ctx.translate(dx, dy);
        }

        // Clear / background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw player (player.draw handles sprite fallback)
        if (this.player && typeof this.player.draw === 'function') {
            try { this.player.draw(ctx); } catch (e) { console.warn('player.draw failed', e); }
        }

        // Draw enemies
        if (Array.isArray(this.enemies)) {
            this.enemies.forEach(enemy => {
                if (!enemy) return;
                if (typeof enemy.draw === 'function') {
                    try { enemy.draw(ctx); } catch (e) { /* non-fatal */ }
                } else if (typeof enemy.x === 'number' && typeof enemy.y === 'number') {
                    ctx.fillStyle = '#c33';
                    ctx.fillRect(enemy.x - 8, enemy.y - 8, 16, 16);
                }
            });
        }

        // Draw player projectiles
        if (Array.isArray(this.playerProjectiles)) {
            this.playerProjectiles.forEach(p => {
                if (!p) return;
                if (typeof p.draw === 'function') {
                    try { p.draw(ctx); } catch (e) { /* ignore */ }
                } else if (typeof p.x === 'number' && typeof p.y === 'number') {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(p.x - 2, p.y - 6, 4, 12);
                }
            });
        }

        // Draw enemy projectiles
        if (Array.isArray(this.enemyProjectiles)) {
            this.enemyProjectiles.forEach(p => {
                if (!p) return;
                if (typeof p.draw === 'function') {
                    try { p.draw(ctx); } catch (e) { /* ignore */ }
                } else if (typeof p.x === 'number' && typeof p.y === 'number') {
                    ctx.fillStyle = '#f44';
                    ctx.fillRect(p.x - 2, p.y - 6, 4, 12);
                }
            });
        }

        // Draw explosions/effects
        if (Array.isArray(this.explosions)) {
            this.explosions.forEach(ex => { if (ex && typeof ex.draw === 'function') { try { ex.draw(ctx); } catch (e) {} } });
        }

        // Flash effect for nukes
        if (this.nukeFlashTime && this.nukeFlashTime > 0) {
            const alpha = Math.min(1, this.nukeFlashTime / 30);
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();
    }

    loadGalaxyConquestData() {
        // Load galaxy conquest progress from save system
        if (typeof saveSystem !== 'undefined' && saveSystem) {
            const data = saveSystem.getGalaxyConquestData();
            if (data) {
                // Restore galaxy conquest state if saved data exists
                if (data.resources && this.resourceManager) {
                    this.resourceManager.resources = { ...this.resourceManager.resources, ...data.resources };
                }
                if (data.distance && typeof data.distance === 'number') {
                    this.distance = data.distance;
                }
            }
        }
    }

    applySavedWarpCheckpoint() {
        // Apply saved warp checkpoint if it exists
        if (typeof saveSystem !== 'undefined' && saveSystem) {
            const checkpoint = saveSystem.getWarpCheckpoint();
            if (checkpoint && checkpoint.distance) {
                this.distance = checkpoint.distance || 0;
                this.waveNumber = Math.floor(checkpoint.distance / 10) || 1;
                return checkpoint;
            }
        }
        return null;
    }

    gameLoop() {
        if (!this.isRunning) return;

        try {
            this.update();
            if (typeof this.draw === 'function') this.draw();
        } catch (err) {
            // Log but don't crash the loop
            console.error('Game loop error:', err);
        }

        // Low-frequency heartbeat to help debugging (once per ~60 frames)
        if (!this._frameCount) this._frameCount = 0;
        this._frameCount = (this._frameCount + 1) % 60;
        if (this._frameCount === 0) {
            // Use console.debug so it's less noisy in normal logs
            console.debug('gameLoop heartbeat', { isPaused: this.isPaused, gameOver: this.gameOver });
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Auto-initialize the game when the page loads
// Wait for DOM content (scripts load in order, canvas element present)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const game = new Game();
            console.log('Game initialized successfully');
        } catch (err) {
            console.error('Failed to initialize game:', err);
        }
    });
} else {
    // DOM already loaded (script is defer/async or at bottom)
    try {
        const game = new Game();
        console.log('Game initialized successfully');
    } catch (err) {
        console.error('Failed to initialize game:', err);
    }
}
