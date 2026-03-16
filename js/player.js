class Player {
    constructor(x, y, canvasWidth, canvasHeight, startingBonuses = {}) {
        this.x = x;
        this.y = y;
        this.width = 100; // Increased from 50 (doubled)
        this.height = 80; // Increased from 40 (doubled)
        this.baseSpeed = 5;
        this.speed = this.baseSpeed * (startingBonuses.speedMultiplier || 1);
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        const baseLives = 3 + (startingBonuses.extraLives || 0);
        this.lives = baseLives; // Legacy life segments
        this.health = baseLives; // Mirror lives initially for damage meter
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.maxInvulnerabilityTime = 120; // 2 seconds at 60fps
        
    // Ship type for sprite selection and mechanics
    this.shipType = 'basic'; // Can be 'basic', 'heavy', 'fast'
    this.baseShipType = this.shipType;
    this.shipLevel = 1;
    
    // Ship-specific bullet and movement quirks
    this.shipBulletStyles = {
        basic: { color: '#00FF00', speedMult: 1.0, sizeOffset: 0 },      // Green, standard speed
        heavy: { color: '#FF6600', speedMult: 0.75, sizeOffset: 2 },     // Orange, slower but bigger
        fast: { color: '#00DDFF', speedMult: 1.35, sizeOffset: -1 }      // Cyan, faster but smaller
    };
    this.shipMovementQuirks = {
        basic: { accelMult: 1.0, turnMult: 1.0 },           // Standard handling
        heavy: { accelMult: 0.7, turnMult: 0.8 },           // Sluggish but stable
        fast: { accelMult: 1.4, turnMult: 1.25 }            // Twitchy but responsive
    };
    this.movementMomentum = 0;   // For acceleration feel
    this.maxMomentum = 5;        // Max speed boost from acceleration
        
        // Shooting properties
        this.shootCooldown = 0;
        this.baseShootRate = 15;
        // Fire rate modifiers: multiplicative modifiers keyed by source
        this.fireRateModifiers = {};
        // Helper to compute effective fireRate from base and modifiers
        this.recomputeFireRate = () => {
            let mult = 1.0;
            for (const k in this.fireRateModifiers) {
                const v = this.fireRateModifiers[k];
                if (typeof v === 'number' && isFinite(v)) mult *= v;
            }
            this.fireRate = Math.max(2, Math.floor(this.baseShootRate * mult));
        };
    const initialFireRate = Math.max(5, this.baseShootRate * (startingBonuses.shootRateMultiplier || 1));
    this.fireRate = initialFireRate;
    this.shootRate = initialFireRate;
        
        // Power-up effects
        this.activePowerUps = new Map();
        this.hasShield = startingBonuses.startWithShield || false;
        this.shieldTime = this.hasShield ? 300 : 0; // 5 seconds if starting with shield
        this.scoreMultiplier = 1;
        this.maxLives = baseLives;
        this.maxHealth = baseLives; // Use same scale; each hit removes 1 segment
        
        // Bullet upgrade system
        this.bulletLevel = startingBonuses.startingBulletLevel || 1;
        this.killsForUpgrade = 0;
        this.killsNeededForUpgrade = 9;
        
        // Streak and combo system
        this.killStreak = 0;
        this.maxStreak = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
        this.comboMaxTime = 180; // 3 seconds to maintain combo
        this.lastKillTime = 0;
        
        // Upgrade system properties (set by upgradeSystem.applyUpgrades())
    this.bulletSpeed = 8;
    // Keep fireRate if it was initialized above (from startingBonuses)
    this.fireRate = this.fireRate || 15;
        this.maxHealth = 3; // maxHealth already set to baseLives above; keep for upgrade adjustments
        this.shieldLevel = 0;
        this.hasMultiShot = false;
        this.multiShotCount = 1;
        this.hasPiercingShots = false;
        this.hasExplosiveShots = false;
        this.magneticRange = 0;
        
        // Input handling
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        
        this.setupInputHandlers();
    }

    setupInputHandlers() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.keys.left = true;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.keys.right = true;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.keys.up = true;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.keys.down = true;
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.keys.left = false;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.keys.right = false;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.keys.up = false;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.keys.down = false;
                    e.preventDefault();
                    break;
            }
        });

        // Touch controls for mobile
        this.setupTouchControls();
    }

    setupTouchControls() {
        // Touch variables
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isTouching = false;
        this.touchSensitivity = 50; // Minimum distance for movement

        // Get canvas for touch events
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        // Touch start
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
                this.isTouching = true;

                // Convert touch position to canvas coordinates
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const canvasX = (touch.clientX - rect.left) * scaleX;
                const canvasY = (touch.clientY - rect.top) * scaleY;

                // Move player to touch position (horizontal only)
                this.x = Math.max(0, Math.min(canvasX - this.width/2, this.canvasWidth - this.width));
            }
        }, { passive: false });

        // Touch move
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.isTouching) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.touchStartX;

                // Horizontal movement based on touch drag
                if (Math.abs(deltaX) > this.touchSensitivity) {
                    const moveAmount = (deltaX - (deltaX > 0 ? this.touchSensitivity : -this.touchSensitivity)) * 0.5;
                    this.x = Math.max(0, Math.min(this.x + moveAmount, this.canvasWidth - this.width));
                    this.touchStartX = touch.clientX; // Reset for continuous movement
                }
            }
        }, { passive: false });

        // Touch end
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouching = false;
        });

        // Prevent default touch behaviors
        canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.isTouching = false;
        });

        // Virtual joystick alternative (if needed)
        this.setupVirtualJoystick();
    }

    setupVirtualJoystick() {
        // Create virtual joystick elements
        this.joystickContainer = document.createElement('div');
        this.joystickContainer.id = 'virtual-joystick';
        this.joystickContainer.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 20px;
            width: 120px;
            height: 120px;
            background: rgba(0, 255, 136, 0.1);
            border: 2px solid var(--neon-green, #00ff88);
            border-radius: 50%;
            display: none;
            z-index: 1000;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        `;

        this.joystickStick = document.createElement('div');
        this.joystickStick.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #00ff88, #00ffaa);
            border: 2px solid #ffffff;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
            transition: transform 0.1s ease;
        `;

        this.joystickContainer.appendChild(this.joystickStick);
        document.body.appendChild(this.joystickContainer);

        // Joystick variables
        this.joystickActive = false;
        this.joystickCenterX = 0;
        this.joystickCenterY = 0;
        this.joystickMaxDistance = 40;

        // Show joystick on mobile devices
        if ('ontouchstart' in window) {
            this.joystickContainer.style.display = 'block';
        }

        // Joystick touch events
        this.joystickContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystickActive = true;
            const touch = e.touches[0];
            const rect = this.joystickContainer.getBoundingClientRect();
            this.joystickCenterX = rect.left + rect.width / 2;
            this.joystickCenterY = rect.top + rect.height / 2;
            this.updateJoystick(touch.clientX, touch.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.joystickActive) return;
            e.preventDefault();
            const touch = e.touches[0];
            this.updateJoystick(touch.clientX, touch.clientY);
        });

        document.addEventListener('touchend', (e) => {
            if (!this.joystickActive) return;
            this.joystickActive = false;
            this.joystickStick.style.transform = 'translate(-50%, -50%)';
            this.keys.left = false;
            this.keys.right = false;
        });
    }

    updateJoystick(clientX, clientY) {
        const deltaX = clientX - this.joystickCenterX;
        const deltaY = clientY - this.joystickCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Limit joystick movement
        const clampedDistance = Math.min(distance, this.joystickMaxDistance);
        const angle = Math.atan2(deltaY, deltaX);

        // Update stick position
        const stickX = Math.cos(angle) * clampedDistance;
        const stickY = Math.sin(angle) * clampedDistance;
        this.joystickStick.style.transform = `translate(${stickX - 20}px, ${stickY - 20}px)`;

        // Update movement keys based on horizontal position
        const normalizedX = deltaX / this.joystickMaxDistance;
        this.keys.left = normalizedX < -0.3;
        this.keys.right = normalizedX > 0.3;
    }

    update() {
        // Update power-ups
        this.updatePowerUps();
        
        // Update combo timer
        this.updateComboTimer();
        
        // Handle movement (horizontal and vertical) with ship-specific quirks
        let currentSpeed = this.speed;
        if (this.activePowerUps.has('speedBoost')) {
            currentSpeed *= 1.5;
        }
        
        // Get ship movement quirks (acceleration & turn responsiveness)
        const quirk = this.shipMovementQuirks[this.shipType] || this.shipMovementQuirks.basic;
        
        // Apply acceleration/momentum for smoother, ship-specific feel
        let movingHorizontally = this.keys.left || this.keys.right;
        let movingVertically = this.keys.up || this.keys.down;
        
        if (movingHorizontally || movingVertically) {
            // Accelerate momentum with ship-specific multiplier
            this.movementMomentum = Math.min(this.maxMomentum, this.movementMomentum + (0.3 * quirk.accelMult));
        } else {
            // Decelerate momentum smoothly
            this.movementMomentum = Math.max(0, this.movementMomentum - 0.15);
        }
        
        // Final speed includes momentum boost
        const speedWithMomentum = currentSpeed + (this.movementMomentum * 0.5);
        
        if (this.keys.left) {
            this.x -= speedWithMomentum;
        }
        if (this.keys.right) {
            this.x += speedWithMomentum;
        }
        if (this.keys.up) {
            this.y -= speedWithMomentum;
        }
        if (this.keys.down) {
            this.y += speedWithMomentum;
        }
        
        // Keep player within canvas bounds
        this.x = Math.max(this.width / 2, Math.min(this.canvasWidth - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(this.canvasHeight - this.height / 2, this.y));
        
        // Update shooting cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime--;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update shield
        if (this.hasShield) {
            this.shieldTime--;
            if (this.shieldTime <= 0) {
                this.hasShield = false;
            }
        }

        // Health regeneration from relic (0.5 HP per second -> ~0.00833 per frame at 60fps)
        if (this._hasRegen) {
            const regenPerFrame = 0.5 / 60;
            this.health = Math.min(this.maxHealth, this.health + regenPerFrame);
        }
    }

    draw(ctx) {
        // Draw player with flashing effect when invulnerable
        const alpha = this.invulnerable && Math.floor(this.invulnerabilityTime / 10) % 2 ? 0.5 : 1.0;
        
        ctx.globalAlpha = alpha;
        
        // Try to draw sprite first, fallback to shapes if not available
        const spriteName = `player_${this.shipType}`;
        const spriteDrawn = this.drawPlayerSprite(ctx, spriteName);
        
        if (!spriteDrawn) {
            this.drawPlayerFallback(ctx);
        }
        
        // Draw thrusters (animated)
        const thrusterFlicker = Math.random() * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 100, 0, ${thrusterFlicker})`;
        ctx.fillRect(this.x - 12, this.y + this.height / 2, 6, 8);
        ctx.fillRect(this.x + 6, this.y + this.height / 2, 6, 8);
        
        // Draw shield effect
        if (this.hasShield) {
            const shieldAlpha = Math.sin(Date.now() * 0.01) * 0.3 + 0.4;
            ctx.globalAlpha = shieldAlpha;
            ctx.strokeStyle = '#0088ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2 + 8, 0, Math.PI * 2);
            ctx.stroke();
            
            // Shield sparks
            for (let i = 0; i < 8; i++) {
                const angle = (Date.now() * 0.01 + i * Math.PI / 4) % (Math.PI * 2);
                const sparkX = this.x + Math.cos(angle) * (this.width / 2 + 10);
                const sparkY = this.y + Math.sin(angle) * (this.height / 2 + 10);
                ctx.fillStyle = '#44aaff';
                ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
            }
        }
        
        // Draw speed boost effect
        if (this.activePowerUps.has('speedBoost')) {
            const speedAlpha = Math.sin(Date.now() * 0.02) * 0.4 + 0.6;
            ctx.globalAlpha = speedAlpha;
            ctx.fillStyle = '#ffff00';
            // Speed trails
            ctx.fillRect(this.x - 20, this.y, 4, 2);
            ctx.fillRect(this.x + 16, this.y, 4, 2);
            ctx.fillRect(this.x - 18, this.y + 5, 3, 2);
            ctx.fillRect(this.x + 15, this.y + 5, 3, 2);
        }
        
        ctx.globalAlpha = 1.0;
    }

    drawPlayerSprite(ctx, spriteName) {
        if (typeof assetManager !== 'undefined' && assetManager.isLoaded()) {
            const sprite = assetManager.getImage(spriteName);
            if (sprite) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(sprite, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                return true;
            }
        }
        return false;
    }

    drawPlayerFallback(ctx) {
        // Improved fallback: draw a compact neon outline ship instead of solid green box
        const cx = this.x;
        const cy = this.y;
        const w = this.width * 0.7; // render smaller than hitbox
        const h = this.height * 0.6;
        const halfW = w / 2;
        const halfH = h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.imageSmoothingEnabled = false;
        // Hull gradient
        const grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
        grad.addColorStop(0, '#0d1b24');
        grad.addColorStop(1, '#132f3f');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -halfH);         // Nose
        ctx.lineTo(halfW * 0.7, -halfH * 0.2);
        ctx.lineTo(halfW * 0.9, halfH * 0.6);
        ctx.lineTo(0, halfH);
        ctx.lineTo(-halfW * 0.9, halfH * 0.6);
        ctx.lineTo(-halfW * 0.7, -halfH * 0.2);
        ctx.closePath();
        ctx.fill();
        // Neon outline
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Cockpit
        ctx.fillStyle = '#26a8ff';
        ctx.beginPath();
        ctx.roundRect(-10, -halfH * 0.2, 20, 18, 4);
        ctx.fill();
        // Wing lights
        ctx.fillStyle = '#00ffc6';
        ctx.fillRect(-halfW * 0.65 - 2, 0, 4, 6);
        ctx.fillRect(halfW * 0.65 - 2, 0, 4, 6);
        // Thrusters
        const thrusterFlicker = Math.random() * 0.4 + 0.6;
        ctx.fillStyle = `rgba(255,120,40,${thrusterFlicker})`;
        ctx.fillRect(-10, halfH * 0.6, 8, 10);
        ctx.fillRect(2, halfH * 0.6, 8, 10);
        ctx.restore();
    }

    canShoot() {
        return this.shootCooldown <= 0;
    }

    shoot() {
        if (!this.canShoot()) return null;
        
        this.shootCooldown = this.fireRate;
        
        const bullets = [];
        const baseY = this.y - this.height / 2 - 5;
        
        // Get ship-specific bullet style
        const bulletStyle = this.shipBulletStyles[this.shipType] || this.shipBulletStyles.basic;
        const bulletSpeedMult = bulletStyle.speedMult;
        const adjustedBulletSpeed = this.bulletSpeed * bulletSpeedMult;
        
        // Check for special power-ups
        const hasHeatSeeking = this.activePowerUps.has('heatSeekingMissiles');
        const hasAngular = this.activePowerUps.has('angularShots');
        
        // Upgrade system multi-shot or stacked multi-shot power-up
        const useMultiShot = this.hasMultiShot || this.activePowerUps.has('multiShot');
        let shotCount = this.hasMultiShot ? this.multiShotCount : 1;
        
        // Add stacked powerup multishot levels
        if (this.activePowerUps.has('multiShot')) {
            const powerupLevel = this.activePowerUps.get('multiShot');
            shotCount += 2 + powerupLevel; // Base 3 shots + additional shots per stack
        }
        
        // Prepare upgrade info for projectiles (includes ship bullet style)
        const upgradeInfo = {
            hasPiercingShots: this.hasPiercingShots,
            hasExplosiveShots: this.hasExplosiveShots,
            isHeatSeeking: hasHeatSeeking,
            shipBulletColor: bulletStyle.color,      // Ship-specific bullet color
            shipBulletSizeOffset: bulletStyle.sizeOffset // Ship-specific bullet size
        };

        // Include relic-provided damage multiplier if present
        if (this._relicDamageBoost) {
            upgradeInfo.relicDamageMultiplier = this._relicDamageBoost;
        }
        
        if (useMultiShot && shotCount > 1) {
            // Multi-shot pattern
            const spread = 10;
            const startOffset = -(shotCount - 1) * spread / 2;
            for (let i = 0; i < shotCount; i++) {
                const x = this.x + startOffset + (i * spread);
                bullets.push(Projectile.create(x, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo));
            }
        } else {
            // Base shooting pattern based on bullet level
            switch(this.bulletLevel) {
                case 1:
                    bullets.push(Projectile.create(this.x, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo));
                    break;
                case 2:
                    bullets.push(
                        Projectile.create(this.x - 5, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x + 5, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo)
                    );
                    break;
                case 3:
                    bullets.push(
                        Projectile.create(this.x - 8, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x, baseY, -(adjustedBulletSpeed + 1), true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x + 8, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo)
                    );
                    break;
                case 4:
                    bullets.push(
                        Projectile.create(this.x - 12, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x - 4, baseY, -(adjustedBulletSpeed + 1), true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x + 4, baseY, -(adjustedBulletSpeed + 1), true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x + 12, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo)
                    );
                    break;
                default: // Level 5+
                    bullets.push(
                        Projectile.create(this.x - 15, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x - 8, baseY, -(adjustedBulletSpeed + 1), true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x, baseY, -(adjustedBulletSpeed + 2), true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x + 8, baseY, -(adjustedBulletSpeed + 1), true, this.bulletLevel, 0, null, upgradeInfo),
                        Projectile.create(this.x + 15, baseY, -adjustedBulletSpeed, true, this.bulletLevel, 0, null, upgradeInfo)
                    );
                    break;
            }
        }
        
        // Add angular shots if power-up is active
        if (hasAngular) {
            const speed = adjustedBulletSpeed;
            const angles = [30, 60, 120, 150]; // degrees, converted to radians
            angles.forEach(angleDeg => {
                const angleRad = (angleDeg - 90) * Math.PI / 180; // -90 because 0° is up
                const vx = Math.cos(angleRad) * speed;
                const vy = Math.sin(angleRad) * speed;
                bullets.push(Projectile.create(this.x, baseY, speed, true, this.bulletLevel, vx, vy, upgradeInfo));
            });
        }
        
        return bullets.length === 1 ? bullets[0] : bullets;
    }

    levelUpShip() {
        this.shipLevel = (this.shipLevel || 1) + 1;
        if (this.bulletLevel < 6) {
            this.bulletLevel++;
        }
        this.baseSpeed += 0.2;
        this.speed = this.baseSpeed;
        this.fireRate = Math.max(4, this.fireRate - 1);
        this.updateShipTypeFromLevel();
        return {
            level: this.shipLevel,
            bulletLevel: this.bulletLevel,
            fireRate: this.fireRate
        };
    }

    updateShipTypeFromLevel() {
        if (this.baseShipType === 'heavy') {
            this.shipType = 'heavy';
            return;
        }
        if (this.shipLevel >= 4) {
            this.shipType = 'heavy';
        } else if (this.shipLevel >= 2) {
            this.shipType = 'fast';
        } else {
            this.shipType = this.baseShipType || 'basic';
        }
    }

    setBaseShipType(type) {
        if (!type) return;
        this.baseShipType = type;
        this.shipType = type;
    }
    
    // Method for upgrade system to apply upgrades to player
    updateUpgrades(upgrades) {
        // Weapon upgrades
        this.bulletSpeed = 8 + (upgrades.bulletSpeed || 0) * 2;
        this.fireRate = Math.max(5, 15 - (upgrades.fireRate || 0) * 2);
        this.hasMultiShot = (upgrades.multiShot || 0) > 0;
        this.multiShotCount = 1 + (upgrades.multiShot || 0);
        this.hasPiercingShots = (upgrades.piercingShots || 0) > 0;
        this.hasExplosiveShots = (upgrades.explosiveShots || 0) > 0;
        
        // Defense upgrades
        this.maxHealth = 3 + (upgrades.armor || 0);
        this.shieldLevel = upgrades.shield || 0;
        
        // Movement upgrades
        this.baseSpeed = 5 + (upgrades.speed || 0);
        
        // Special upgrades
        this.magneticRange = (upgrades.magneticCollector || 0) * 50;
        
        // Ensure health doesn't exceed max health
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    takeDamage() {
        if (this.invulnerable) return false;
        
        // Shield blocks damage (upgrade system or power-up)
        if (this.hasShield || this.shieldLevel > 0) {
            if (this.hasShield) {
                this.hasShield = false;
                this.shieldTime = 0;
                this.activePowerUps.delete('shield');
            } else if (this.shieldLevel > 0) {
                // Upgrade system shield - reduce shield level instead of breaking immediately
                this.shieldLevel--;
                if (this.shieldLevel <= 0) {
                    // Apply damage after shield is depleted
                    this.health--;
                }
            }
            return false;
        }
        
        // Clear all permanent powerups when taking damage
        const powerupsToKeep = ['health']; // Health powerup is instant, not permanent
        for (const [type, value] of this.activePowerUps.entries()) {
            if (!powerupsToKeep.includes(type)) {
                this.deactivatePowerUp(type);
            }
        }
        
        // Downgrade bullet level on damage
        if (this.bulletLevel > 1) {
            this.bulletLevel--;
        }
        this.killsForUpgrade = 0; // Reset kill progress
        
        // Reset streak and combo on damage
        this.resetStreak();
        
        this.lives--;
        this.invulnerable = true;
        this.invulnerabilityTime = this.maxInvulnerabilityTime;
        
        this.health = Math.max(0, this.health - 1);
        return this.health <= 0;
    }

    getLives() {
        return this.lives;
    }

    getMaxLives() {
        return this.maxLives;
    }

    getHullIntegrity() {
        if (this.maxLives <= 0) return 0;
        return Math.max(0, Math.min(1, this.lives / this.maxLives));
    }

    addExtraLife(amount = 1, allowOverflow = false) {
        if (!Number.isFinite(amount) || amount <= 0) {
            return 0;
        }
        const bonus = Math.floor(amount);
        const previous = this.lives;
        if (allowOverflow) {
            this.lives += bonus;
            this.maxLives = Math.max(this.maxLives, this.lives);
        } else {
            this.lives = Math.min(this.maxLives, this.lives + bonus);
        }
        return this.lives - previous;
    }

    reset(x, y, startingBonuses = {}) {
        this.x = x;
        this.y = y;
        const baseLives = 3 + (startingBonuses.extraLives || 0);
        this.lives = baseLives;
        this.maxLives = baseLives;
        this.speed = this.baseSpeed * (startingBonuses.speedMultiplier || 1);
        this.fireRate = Math.max(5, this.baseShootRate * (startingBonuses.shootRateMultiplier || 1));
        this.shootRate = this.fireRate;
        this.bulletLevel = startingBonuses.startingBulletLevel || 1;
        this.hasShield = startingBonuses.startWithShield || false;
        this.shipLevel = 1;
        this.shipType = this.baseShipType || 'basic';
        this.shieldTime = this.hasShield ? 300 : 0;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.shootCooldown = 0;
        this.killsForUpgrade = 0;
        this.kills = 0;
        this.activePowerUps.clear();
        this.health = baseLives;
        this.maxHealth = baseLives;
    }

    updatePowerUps() {
        // Powerups are now permanent until player takes damage
        // Only update shield time separately if it's a power-up shield (not upgrade shield)
        if (this.hasShield && this.activePowerUps.has('shield')) {
            this.shieldTime--;
            if (this.shieldTime <= 0) {
                this.hasShield = false;
                this.shieldTime = 0;
                this.activePowerUps.delete('shield');
            }
        }

        // Use fireRateModifiers for rapidFire instead of directly overriding fireRate
        if (this.activePowerUps.has('rapidFire')) {
            this.fireRateModifiers['rapidFire'] = 0.3; // 70% faster
        } else {
            delete this.fireRateModifiers['rapidFire'];
        }

        // Recompute effective fireRate
        this.recomputeFireRate();
        this.shootRate = this.fireRate;
    }

    activatePowerUp(type, duration) {
        switch(type) {
            case 'rapidFire':
                this.activePowerUps.set('rapidFire', true); // Now permanent until damage
                break;
            case 'multiShot':
                // Stack multi-shot powerups - increase shot count each time
                if (this.activePowerUps.has('multiShot')) {
                    let currentLevel = this.activePowerUps.get('multiShot');
                    this.activePowerUps.set('multiShot', currentLevel + 1);
                } else {
                    this.activePowerUps.set('multiShot', 1); // Start with level 1
                }
                break;
            case 'shield':
                this.hasShield = true;
                this.shieldTime = duration;
                this.activePowerUps.set('shield', duration);
                break;
            case 'health':
                if (this.lives < this.maxLives) {
                    this.lives++;
                }
                break;
            case 'speedBoost':
                this.activePowerUps.set('speedBoost', true); // Now permanent until damage
                break;
            case 'scoreMultiplier':
                this.activePowerUps.set('scoreMultiplier', true); // Now permanent until damage
                this.scoreMultiplier = 2;
                break;
        }
    }

    deactivatePowerUp(type) {
        this.activePowerUps.delete(type);
        
        switch(type) {
            case 'shield':
                this.hasShield = false;
                this.shieldTime = 0;
                break;
            case 'scoreMultiplier':
                this.scoreMultiplier = 1;
                break;
        }
    }

    getScoreMultiplier() {
        return this.scoreMultiplier;
    }

    getActivePowerUps() {
        return this.activePowerUps;
    }

    onEnemyKilled() {
        this.killsForUpgrade++;
        if (this.killsForUpgrade >= this.killsNeededForUpgrade) {
            this.upgradeBulletLevel();
        }
        
        // Update kill streak
        this.killStreak++;
        if (this.killStreak > this.maxStreak) {
            this.maxStreak = this.killStreak;
        }
        
        // Update combo system
        const currentTime = Date.now();
        if (this.lastKillTime === 0 || currentTime - this.lastKillTime < 3000) {
            // Combo continues
            this.comboTimer = this.comboMaxTime;
            this.comboMultiplier = Math.min(5, 1 + Math.floor(this.killStreak / 5) * 0.5);
        } else {
            // Combo broke, reset
            this.comboMultiplier = 1;
        }
        this.lastKillTime = currentTime;
        // Streak rewards: tiered buffs and Overdrive buildup
        if (typeof window !== 'undefined' && window.gameInstance && typeof window.gameInstance.addOverdrive === 'function') {
            window.gameInstance.addOverdrive(10);
        }
        if (this.killStreak > 0) {
            if (this.killStreak % 10 === 0) {
                // Rapid fire boost
                this.activatePowerUp('rapidFire', 360);
            }
            if (this.killStreak % 15 === 0) {
                // Speed boost pulse
                this.activatePowerUp('speedBoost', 600);
            }
            if (this.killStreak % 25 === 0) {
                // Temporary score multiplier pulse
                this.activatePowerUp('scoreMultiplier', 600);
            }
            if (window.gameInstance?.audioManager) {
                window.gameInstance.audioManager.playPowerUp?.();
            }
        }
    }

    upgradeBulletLevel() {
        this.bulletLevel = Math.min(5, this.bulletLevel + 1);
        this.killsForUpgrade = 0;
    }

    updateComboTimer() {
        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else if (this.killStreak > 0) {
            // Combo expired, reset streak
            this.killStreak = 0;
            this.comboMultiplier = 1;
        }
    }

    getKillStreak() {
        return this.killStreak;
    }

    getComboMultiplier() {
        return this.comboMultiplier;
    }

    getMaxStreak() {
        return this.maxStreak;
    }

    resetStreak() {
        this.killStreak = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
    }

    getBulletLevel() {
        return this.bulletLevel;
    }

    getKillProgress() {
        return { current: this.killsForUpgrade, needed: this.killsNeededForUpgrade };
    }

    // Check collision with another object
    collidesWith(other) {
        // Hitbox 1 pixel bigger than sprite diameter (0.5 pixel buffer on each side)
        const hitboxBuffer = 0.5;
        return this.x - (this.width / 2 + hitboxBuffer) < other.x + (other.width / 2 + hitboxBuffer) &&
               this.x + (this.width / 2 + hitboxBuffer) > other.x - (other.width / 2 + hitboxBuffer) &&
               this.y - (this.height / 2 + hitboxBuffer) < other.y + (other.height / 2 + hitboxBuffer) &&
               this.y + (this.height / 2 + hitboxBuffer) > other.y - (other.height / 2 + hitboxBuffer);
    }
}