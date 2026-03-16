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
        this.distanceMultiplier = 1;
        this.lastMilestone = 0;
        
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
            this.player.shipType = currentChar.sprite.replace('player_', '');
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
        this.enemySpawner = new EnemySpawner(this.width);
        
        // Power-up system
        this.powerUps = [];
        this.powerUpManager = new PowerUpManager(this.width);
        this.powerUpEffects = [];
        
        // Galaxy Conquest systems
        this.resourceManager = new GalaxyResourceManager();
        this.warpPortalManager = new WarpPortalManager(this.width);
        this.baseBuildingManager = new BaseBuildingManager();
        
        // Load Galaxy Conquest save data
        this.loadGalaxyConquestData();
        
        // Particle effects
        this.explosions = [];
        
        // Screen effects
        this.screenShake = 0;
        this.currencyDoublerActive = false;
        this.currencyDoublerTime = 0;
        this.nukeFlashTime = 0;
        this.bossWarningTime = 0;
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.waveElement = document.getElementById('wave');
        this.killsElement = document.getElementById('kills');
        this.currencyElement = document.getElementById('currency');
        this.distanceElement = document.getElementById('distance');
        this.difficultyElement = document.getElementById('difficulty');
        this.milestoneElement = document.getElementById('milestone');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalDistanceElement = document.getElementById('finalDistance');
        this.finalKillsElement = document.getElementById('finalKills');
        this.creditsEarnedElement = document.getElementById('creditsEarned');
        this.restartBtn = document.getElementById('restartBtn');
        this.menuBtn = document.getElementById('menuBtn');
        this.powerUpsListElement = document.getElementById('powerUpsList');
        
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
        
        this.setupEventListeners();
        this.start();
    }

    setupEventListeners() {
        this.restartBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        this.menuBtn.addEventListener('click', () => this.returnToMenu());
        
        // Pause functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Escape') {
                this.togglePause();
                e.preventDefault();
            }
        });
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
        
        // Hide game over screen
        this.gameOverElement.classList.add('hidden');
        
        this.start();
    }

    togglePause() {
        if (!this.gameOver) {
            this.isPaused = !this.isPaused;
        }
    }

    update() {
        if (this.isPaused || this.gameOver) return;

        // Update distance (player is always "moving forward")
        this.distance += 0.5; // Base distance increment per frame
        this.updateDistanceEffects();
        
        // Update character system distance tracking
        this.characterSystem.updateGameStats('distance', this.distance);
        
        // Update player
        this.player.update();
        
        // Player automatic shooting
        const playerProjectile = this.player.shoot();
        if (playerProjectile) {
            if (Array.isArray(playerProjectile)) {
                // Multi-shot
                this.playerProjectiles.push(...playerProjectile);
            } else {
                this.playerProjectiles.push(playerProjectile);
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
        this.playerProjectiles.forEach(projectile => projectile.update());
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
            }
        }
        
        // Enemy projectiles vs player
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            
            if (projectile.collidesWith(this.player)) {
                this.enemyProjectiles.splice(i, 1);
                this.createExplosion(this.player.x, this.player.y);
                
                const playerDead = this.player.takeDamage();
                if (playerDead) {
                    this.endGame();
                }
            }
        }
        
        // Enemies vs player (collision damage)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.collidesWith(this.player)) {
                this.enemies.splice(i, 1);
                this.createExplosion(enemy.x, enemy.y);
                
                const playerDead = this.player.takeDamage();
                if (playerDead) {
                    this.endGame();
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
                    
                    // Create activation effect on player
                    this.powerUpEffects.push(new PowerUpEffect(this.player.x, this.player.y, powerUp.color, 'activate'));
                }
            }
        }
    }

    cleanupObjects() {
        // Remove off-screen projectiles
        this.playerProjectiles = this.playerProjectiles.filter(p => !p.isOffScreen(this.height));
        this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.isOffScreen(this.height));
        
        // Remove off-screen enemies (they reached the bottom)
        this.enemies = this.enemies.filter(enemy => !enemy.isOffScreen(this.height));
        
        // Remove off-screen power-ups
        this.powerUps = this.powerUps.filter(powerUp => !powerUp.isOffScreen(this.height));
        
        // Remove finished explosions and effects
        this.explosions = this.explosions.filter(explosion => !explosion.isFinished());
        this.powerUpEffects = this.powerUpEffects.filter(effect => !effect.isFinished());
    }

    createExplosion(x, y, color = null, scale = 1) {
        this.explosions.push(new Explosion(x, y, color, scale));
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
                }
            }
        }
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.player.getLives();
        
        const currentWave = this.enemySpawner.getCurrentWave();
        if (currentWave % 5 === 0) {
            this.waveElement.innerHTML = `${currentWave} <span style="color: #ff0044; font-weight: bold;">(BOSS!)</span>`;
        } else if ((currentWave + 1) % 5 === 0) {
            this.waveElement.innerHTML = `${currentWave} <span style="color: #ffaa00; animation: blink 1s infinite;">(Boss Next!)</span>`;
        } else {
            this.waveElement.textContent = currentWave;
        }
        
        this.killsElement.textContent = this.enemySpawner.totalEnemiesKilled;
        
        // Update currency display
        if (typeof upgradeSystem !== 'undefined') {
            this.currencyElement.textContent = upgradeSystem.getCurrency().toLocaleString();
        }
        
        // Update distance UI
        const distanceKm = Math.floor(this.distance / 100);
        this.distanceElement.textContent = distanceKm;
        this.difficultyElement.textContent = `x${this.distanceMultiplier.toFixed(1)}`;
        
        // Update milestone display
        const nextMilestone = Math.ceil(distanceKm / 5) * 5;
        if (nextMilestone === distanceKm && distanceKm > 0) {
            this.milestoneElement.textContent = `Milestone Reached: ${distanceKm} km!`;
            this.milestoneElement.classList.add('achieved');
            setTimeout(() => {
                this.milestoneElement.classList.remove('achieved');
            }, 2000);
        } else {
            this.milestoneElement.textContent = `Next Milestone: ${nextMilestone} km`;
        }
        
        // Update warp portal UI
        this.updateWarpPortalUI(distanceKm);
        
        this.updatePowerUpUI();
    }

    updateWarpPortalUI(distanceKm) {
        const warpPortalInfo = document.getElementById('warpPortalInfo');
        const nextPortalElement = document.getElementById('nextPortal');
        
        if (!warpPortalInfo || !nextPortalElement) return;
        
        // Get next portal distance
        const portalDistances = [5, 10, 15, 25, 35, 50, 75, 100, 150, 200];
        const nextPortalDistance = portalDistances.find(distance => distance > distanceKm);
        
        if (nextPortalDistance) {
            warpPortalInfo.style.display = 'block';
            nextPortalElement.textContent = `Next Warp Portal: ${nextPortalDistance} km`;
            
            // Change color based on proximity
            const distanceToPortal = nextPortalDistance - distanceKm;
            if (distanceToPortal <= 1) {
                nextPortalElement.style.color = '#00ff88';
                nextPortalElement.style.animation = 'blink 1s infinite';
            } else if (distanceToPortal <= 3) {
                nextPortalElement.style.color = '#ffaa00';
                nextPortalElement.style.animation = 'none';
            } else {
                nextPortalElement.style.color = '#4a90e2';
                nextPortalElement.style.animation = 'none';
            }
        } else {
            // All portals reached
            warpPortalInfo.style.display = 'none';
        }
        
        // Show active portals count
        const activePortals = this.warpPortalManager.getActivePortals();
        if (activePortals.length > 0) {
            warpPortalInfo.style.display = 'block';
            nextPortalElement.textContent = `🌀 Warp Portal Available!`;
            nextPortalElement.style.color = '#00ff88';
            nextPortalElement.style.animation = 'pulse 2s infinite';
        }
    }

    updatePowerUpUI() {
        const activePowerUps = this.player.getActivePowerUps();
        this.powerUpsListElement.innerHTML = '';
        
        if (activePowerUps.size === 0) {
            this.powerUpsListElement.innerHTML = '<div style="color: #888; font-size: 11px; text-align: center;">None active</div>';
            return;
        }
        
        for (const [type, timeLeft] of activePowerUps.entries()) {
            const powerUpItem = document.createElement('div');
            powerUpItem.className = `power-up-item ${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            
            const name = document.createElement('span');
            name.className = 'power-up-name';
            name.textContent = this.getPowerUpDisplayName(type);
            
            const timer = document.createElement('span');
            timer.className = 'power-up-timer';
            const seconds = Math.ceil(timeLeft / 60);
            timer.textContent = `${seconds}s`;
            
            if (seconds <= 3) {
                timer.classList.add('warning');
            }
            
            powerUpItem.appendChild(name);
            powerUpItem.appendChild(timer);
            this.powerUpsListElement.appendChild(powerUpItem);
        }
    }

    getPowerUpDisplayName(type) {
        const names = {
            'rapidFire': 'Rapid Fire',
            'multiShot': 'Multi Shot',
            'shield': 'Shield',
            'speedBoost': 'Speed Boost',
            'scoreMultiplier': '2x Score'
        };
        return names[type] || type;
    }

    endGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.isRunning = false;
        
        // Collect resources based on performance
        const resourcesEarned = this.resourceManager.generateCombatDrop('boss', {
            distance: Math.floor(this.distance / 100),
            score: this.score,
            kills: this.characterSystem.gameStats.kills
        });
        
        // Add resources to player's collection
        Object.keys(resourcesEarned).forEach(resource => {
            this.resourceManager.addResource(resource, resourcesEarned[resource]);
        });
        
        // Save galaxy conquest data
        this.saveGalaxyConquestData();
        
        // Update character progression
        this.characterSystem.updateGameStats('kills', this.characterSystem.gameStats.kills);
        this.characterSystem.updateGameStats('distance', this.distance);
        this.characterSystem.updateGameStats('gamesPlayed', this.characterSystem.gameStats.gamesPlayed + 1);
        
        // Save game data and get credits earned
        const gameData = {
            score: this.score,
            distance: Math.floor(this.distance / 100), // Convert to km
            kills: this.player.kills,
            bossKills: 0 // TODO: Track boss kills
        };
        
        const creditsEarned = saveSystem.updateStats(gameData);
        
        // Save upgrade system data
        if (typeof upgradeSystem !== 'undefined') {
            upgradeSystem.currency = saveSystem.getCredits();
            saveSystem.saveUpgrades(upgradeSystem.toSaveData());
        }
        saveSystem.saveCharacterProgress(this.characterSystem.toSaveData());
        
        // Check for character unlocks
        const newUnlocks = this.characterSystem.checkUnlocks(saveSystem.data.gameStats);
        
        // Display results with resources earned
        this.showGameOverScreen(creditsEarned, resourcesEarned, newUnlocks);
    }

    showUnlockNotifications(newUnlocks) {
        // Create unlock notification element
        const unlockDiv = document.createElement('div');
        unlockDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff00ff, #00ffff);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
            box-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
            animation: unlockPulse 2s ease-in-out;
        `;
        
        let content = '<h2 style="margin: 0 0 15px 0; font-size: 24px;">🎉 NEW PILOT UNLOCKED! 🎉</h2>';
        for (const character of newUnlocks) {
            content += `<div style="margin: 10px 0; font-size: 18px; color: ${this.characterSystem.getRarityColor(character.rarity)};">
                ${character.name}
                <div style="font-size: 14px; margin-top: 5px;">${character.unlockMessage}</div>
            </div>`;
        }
        content += '<div style="margin-top: 15px; font-size: 12px;">Visit the Pilot Selection to use your new characters!</div>';
        
        unlockDiv.innerHTML = content;
        document.body.appendChild(unlockDiv);
        
        // Add animation styles
        if (!document.getElementById('unlockAnimationStyles')) {
            const style = document.createElement('style');
            style.id = 'unlockAnimationStyles';
            style.textContent = `
                @keyframes unlockPulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (unlockDiv.parentNode) {
                unlockDiv.parentNode.removeChild(unlockDiv);
            }
        }, 5000);
    }

    returnToMenu() {
        window.location.href = 'menu.html';
    }

    draw() {
        // Apply screen shake
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
        }
        
        // Draw background based on distance
        this.drawBackground();
        
        // Draw stars background
        this.drawStars();
        
        // Draw game objects
        this.player.draw(this.ctx);
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        this.playerProjectiles.forEach(projectile => projectile.draw(this.ctx));
        this.enemyProjectiles.forEach(projectile => projectile.draw(this.ctx));
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
        this.powerUpEffects.forEach(effect => effect.draw(this.ctx));
        
        // Draw warp portals
        this.warpPortalManager.draw(this.ctx);
        
        // Draw boss warning
        if (this.bossWarningTime > 0) {
            this.drawBossWarning();
        }
        
        // Draw nuke flash effect
        if (this.nukeFlashTime > 0) {
            this.drawNukeFlash();
        }
        
        // Draw currency doubler indicator
        if (this.currencyDoublerActive) {
            this.drawCurrencyDoublerIndicator();
        }
        
        // Draw pause overlay
        if (this.isPaused) {
            this.drawPauseOverlay();
        }
        
        // Reset screen shake transform
        if (this.screenShake > 0) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    drawBackground() {
        const distanceKm = Math.floor(this.distance / 100);
        const time = Date.now() * 0.001;
        
        if (distanceKm >= 35) {
            // Aurora theme background
            this.drawAuroraBackground(time, distanceKm);
        } else {
            // Normal space background
            this.ctx.fillStyle = '#000011';
            this.ctx.fillRect(-this.screenShake, -this.screenShake, 
                              this.width + this.screenShake * 2, 
                              this.height + this.screenShake * 2);
        }
    }

    drawAuroraBackground(time, distanceKm) {
        // Base dark space background
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(-this.screenShake, -this.screenShake, 
                          this.width + this.screenShake * 2, 
                          this.height + this.screenShake * 2);
        
        // Aurora waves
        const auroraIntensity = Math.min(1, (distanceKm - 35) * 0.1);
        
        // Create gradient for aurora effect
        for (let i = 0; i < 5; i++) {
            const wave1 = Math.sin(time * 0.5 + i * 0.8) * 30;
            const wave2 = Math.cos(time * 0.3 + i * 1.2) * 20;
            const yOffset = i * 40 + wave1 + wave2;
            
            // Aurora colors - green, blue, purple
            const colors = [
                `rgba(0, 255, 150, ${0.15 * auroraIntensity})`,
                `rgba(100, 200, 255, ${0.12 * auroraIntensity})`,
                `rgba(200, 100, 255, ${0.1 * auroraIntensity})`,
                `rgba(150, 255, 200, ${0.08 * auroraIntensity})`,
                `rgba(255, 150, 255, ${0.06 * auroraIntensity})`
            ];
            
            this.ctx.fillStyle = colors[i];
            
            // Draw wavy aurora bands
            this.ctx.beginPath();
            this.ctx.moveTo(-this.screenShake, yOffset);
            
            for (let x = 0; x <= this.width + this.screenShake * 2; x += 20) {
                const waveY = yOffset + Math.sin((x + time * 50) * 0.01) * 15 + Math.cos((x + time * 30) * 0.008) * 10;
                this.ctx.lineTo(x - this.screenShake, waveY);
            }
            
            this.ctx.lineTo(this.width + this.screenShake, this.height + this.screenShake);
            this.ctx.lineTo(-this.screenShake, this.height + this.screenShake);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Add some shimmer particles
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * auroraIntensity})`;
        for (let i = 0; i < 30; i++) {
            const shimmerX = (i * 67.89 + time * 20) % (this.width + 100);
            const shimmerY = (i * 43.21 + time * 15) % (this.height + 50);
            const shimmerSize = 1 + Math.sin(time * 3 + i) * 0.5;
            
            this.ctx.globalAlpha = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.3;
            this.ctx.fillRect(shimmerX - 50, shimmerY - 25, shimmerSize, shimmerSize);
        }
        
        this.ctx.globalAlpha = 1;
    }

    drawStars() {
        const time = Date.now() * 0.001;
        const distanceSpeed = 20 + (this.distance * 0.01); // Speed increases with distance
        
        this.ctx.fillStyle = '#ffffff';
        
        // Main stars
        for (let i = 0; i < 50; i++) {
            const x = (i * 123.4567) % this.width;
            const y = ((i * 234.5678 + time * distanceSpeed) % (this.height + 100)) - 50;
            const size = (i % 3) + 1;
            
            this.ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
            this.ctx.fillRect(x, y, size, size);
        }
        
        // Fast-moving distant stars for distance effect
        if (this.distance > 100) { // After 1km
            this.ctx.fillStyle = '#aaaaff';
            for (let i = 0; i < 20; i++) {
                const x = (i * 87.3456) % this.width;
                const y = ((i * 156.789 + time * distanceSpeed * 2) % (this.height + 50)) - 25;
                
                this.ctx.globalAlpha = 0.2 + (i % 3) * 0.1;
                this.ctx.fillRect(x, y, 1, 3); // Streaked stars
            }
        }
        
        // Hyperspace effect at high distances
        if (this.distance > 500) { // After 5km
            this.ctx.fillStyle = '#ffaaff';
            for (let i = 0; i < 10; i++) {
                const x = (i * 67.891) % this.width;
                const y = ((i * 123.456 + time * distanceSpeed * 3) % (this.height + 30)) - 15;
                
                this.ctx.globalAlpha = 0.4;
                this.ctx.fillRect(x, y, 1, 8); // Long streaks
            }
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    drawBossWarning() {
        const alpha = Math.sin(this.bossWarningTime * 0.2) * 0.3 + 0.4;
        this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        
        const text = 'BOSS INCOMING!';
        this.ctx.strokeText(text, this.width / 2, this.height / 2 - 50);
        this.ctx.fillText(text, this.width / 2, this.height / 2 - 50);
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('Prepare for battle!', this.width / 2, this.height / 2);
        
        // Warning bars
        const barHeight = 8;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(0, 0, this.width, barHeight);
        this.ctx.fillRect(0, this.height - barHeight, this.width, barHeight);
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press SPACE or ESC to resume', this.width / 2, this.height / 2 + 50);
    }
    
    drawNukeFlash() {
        // White flash that fades out
        const alpha = this.nukeFlashTime / 30; // Fade from 1 to 0
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawCurrencyDoublerIndicator() {
        // Golden border effect
        const time = Date.now() * 0.005;
        const alpha = 0.3 + Math.sin(time) * 0.2;
        
        this.ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(0, 0, this.width, this.height);
        
        // Text indicator
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DOUBLE COINS ACTIVE!', this.width / 2, 30);
        
        // Timer
        const timeLeft = Math.ceil(this.currencyDoublerTime / 60);
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`${timeLeft}s`, this.width / 2, 50);
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    // Galaxy Conquest methods
    loadGalaxyConquestData() {
        const savedData = localStorage.getItem('galaxyConquest');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.resources) {
                this.resourceManager.fromSaveData(data.resources);
            }
            if (data.bases) {
                this.baseBuildingManager.fromSaveData(data.bases);
            }
        }
    }

    saveGalaxyConquestData() {
        const saveData = {
            resources: this.resourceManager.toSaveData(),
            bases: this.baseBuildingManager.toSaveData(),
            timestamp: Date.now()
        };
        localStorage.setItem('galaxyConquest', JSON.stringify(saveData));
    }

    handleWarpPortalEntry(portalData) {
        // Pause the game
        this.isPaused = true;
        
        // Show warp portal entry effect
        this.createExplosion(this.player.x, this.player.y, portalData.color, 2);
        
        // Save current game state including newly earned resources
        this.saveGalaxyConquestData();
        
        // Show confirmation dialog
        const confirmText = `Enter Warp Portal to ${portalData.distance}km Checkpoint?\n\n` +
                          `This will open the Base Builder where you can:\n` +
                          `• Construct buildings and defenses\n` +
                          `• Set up resource production\n` +
                          `• Upgrade your galactic outpost\n\n` +
                          `Your current combat progress will be saved.`;
        
        if (confirm(confirmText)) {
            // Redirect to base builder with checkpoint info
            window.location.href = `base-builder.html?checkpoint=${portalData.distance}`;
        } else {
            // Resume game
            this.isPaused = false;
        }
    }


}

// Simple explosion effect class
class Explosion {
    constructor(x, y, color = null, scale = 1) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.lifetime = 30;
        this.currentLife = 0;
        this.color = color; // Custom color override
        this.scale = scale; // Size scaling
        
        // Create particles
        const particleCount = Math.floor(15 * this.scale);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8 * this.scale,
                vy: (Math.random() - 0.5) * 8 * this.scale,
                life: Math.random() * 20 + 10,
                maxLife: Math.random() * 20 + 10,
                size: (Math.random() * 4 + 2) * this.scale
            });
        }
    }

    update() {
        this.currentLife++;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life--;
        });
        
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.globalAlpha = alpha;
            
            if (this.color) {
                // Use custom color with fading alpha
                ctx.fillStyle = this.color;
            } else {
                // Default explosion colors
                const colors = ['#ff4444', '#ff8844', '#ffff44', '#ffffff'];
                const colorIndex = Math.floor((1 - alpha) * colors.length);
                ctx.fillStyle = colors[Math.min(colorIndex, colors.length - 1)];
            }
            
            ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, 
                        particle.size, particle.size);
        });
        
        ctx.globalAlpha = 1.0;
    }

    isFinished() {
        return this.currentLife > this.lifetime && this.particles.length === 0;
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Courier New', monospace;
        font-size: 24px;
        z-index: 1000;
    `;
    loadingDiv.textContent = 'Loading assets...';
    document.body.appendChild(loadingDiv);
    
    try {
        // Load assets first
        await assetManager.loadAssets();
        console.log('Assets loaded, starting game...');
    } catch (error) {
        console.warn('Some assets failed to load, continuing with fallback graphics');
    }
    
    // Remove loading screen
    document.body.removeChild(loadingDiv);
    
    // Start the game
    new Game();
});