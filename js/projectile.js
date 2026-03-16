class Projectile {
    static create(x, y, velocityY = -8, isPlayerProjectile = true, bulletLevel = 1, vx = 0, vy = null, upgrades = {}) {
        const projectile = Projectile.pool.length ? Projectile.pool.pop() : new Projectile();
        return projectile.reset(x, y, velocityY, isPlayerProjectile, bulletLevel, vx, vy, upgrades);
    }

    constructor(x, y, velocityY = -8, isPlayerProjectile = true, bulletLevel = 1, vx = 0, vy = null, upgrades = {}) {
        this.active = false;
        this.hitTargets = new Set();
        this.reset(x ?? 0, y ?? 0, velocityY, isPlayerProjectile, bulletLevel, vx, vy, upgrades);
    }

    reset(x, y, velocityY = -8, isPlayerProjectile = true, bulletLevel = 1, vx = 0, vy = null, upgrades = {}) {
        upgrades = upgrades || {};
        this.x = x;
        this.y = y;
        this.bulletLevel = bulletLevel;
        this.isPlayerProjectile = isPlayerProjectile;
        this.active = true;
        
        // Support both old and new velocity systems
        if (vx !== 0 || vy !== null) {
            this.velocityX = vx;
            this.velocityY = vy !== null ? vy : velocityY;
        } else {
            this.velocityX = 0;
            this.velocityY = velocityY;
        }
        
        // Weapon type (bullet or laser)
        this.weaponType = upgrades.weaponType || 'bullet';
        
        // Upgrade system properties
        this.isPiercing = upgrades.hasPiercingShots || false;
        this.isExplosive = upgrades.hasExplosiveShots || false;
        this.isHeatSeeking = upgrades.isHeatSeeking || false;
        this.isAngular = upgrades.isAngular || false;
        this.maxPierceTargets = this.isPiercing ? (upgrades.maxPierceTargets || 3) : 1;
        this.hitTargets.clear();
        
        // Heat-seeking properties
        this.homingStrength = this.isHeatSeeking ? 0.15 : 0;
        this.targetEnemy = null;
        
        // Ship-specific bullet style (color and size)
        this.shipBulletColor = upgrades.shipBulletColor || null;
        this.shipBulletSizeOffset = upgrades.shipBulletSizeOffset || 0;
        
        if (isPlayerProjectile) {
            // Scale bullet size and damage based on level (with ship offset)
            if (this.weaponType === 'laser') {
                this.width = 8 + this.shipBulletSizeOffset; // Increased from 4 (doubled)
                this.height = 52 + (this.shipBulletSizeOffset * 2); // Increased from 26 (doubled)
                // Allow upgrades/relics to pass a damage multiplier through upgrades.relicDamageMultiplier
                const baseLaserDamage = bulletLevel + 1;
                const dmgMulLaser = (upgrades && (upgrades.relicDamageMultiplier || upgrades.damageMultiplier)) || 0;
                this.damage = Math.ceil(baseLaserDamage * (1 + dmgMulLaser)); // Lasers do more damage
                this.color = this.shipBulletColor || '#00ffff'; // Use ship color or cyan default
            } else {
                this.width = Math.max(4, 12 + (bulletLevel - 1) * 2 + this.shipBulletSizeOffset); // Increased from 6 (doubled)
                this.height = Math.max(8, 28 + (bulletLevel - 1) * 4 + (this.shipBulletSizeOffset * 2)); // Increased from 14 (doubled)
                const baseBulletDamage = bulletLevel;
                const dmgMul = (upgrades && (upgrades.relicDamageMultiplier || upgrades.damageMultiplier)) || 0;
                this.damage = Math.ceil(baseBulletDamage * (1 + dmgMul));
                this.color = this.shipBulletColor || this.getBulletColor(bulletLevel); // Use ship color or default
            }
            
            // Modify appearance for special bullets (override ship color)
            if (this.isExplosive) {
                this.color = '#ff4400'; // Orange for explosive
                this.width *= 1.2;
            } else if (this.isPiercing) {
                this.color = '#0088ff'; // Blue for piercing
            } else if (this.isHeatSeeking) {
                this.color = '#ff0088'; // Pink for heat-seeking
            }
        } else {
            // Enemy projectiles
            if (this.weaponType === 'laser') {
                this.width = 6; // Increased from 3 (doubled)
                this.height = 40; // Increased from 20 (doubled)
                this.damage = 1;
                this.color = '#ff0000'; // Red for enemy lasers
            } else {
                this.width = 12; // Increased from 6 (doubled)
                this.height = 28; // Increased from 14 (doubled)
                this.damage = 1;
                this.color = '#ff0000';
            }
        }

        return this;
    }

    recycle() {
        if (!this.active) return;
        this.active = false;
        this.hitTargets.clear();
        if (Projectile.pool.length < Projectile.MAX_POOL_SIZE) {
            Projectile.pool.push(this);
        }
    }

    getBulletColor(level) {
        const colors = ['#00ff41', '#00ffff', '#ffff00', '#ff8800', '#ff0088'];
        return colors[Math.min(level - 1, colors.length - 1)];
    }

    update(enemies = []) {
        // Heat-seeking behavior for player projectiles
        if (this.isHeatSeeking && this.isPlayerProjectile && enemies && enemies.length > 0) {
            // Find nearest enemy if we don't have a target or target is dead
            if (!this.targetEnemy || !this.targetEnemy.active) {
                let nearestDist = Infinity;
                this.targetEnemy = null;
                
                for (const enemy of enemies) {
                    if (!enemy || !enemy.active) continue;
                    const dx = enemy.x - this.x;
                    const dy = enemy.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < nearestDist && dist < 600) { // 600px homing range
                        nearestDist = dist;
                        this.targetEnemy = enemy;
                    }
                }
            }
            
            // Home toward target
            if (this.targetEnemy && this.targetEnemy.active) {
                const dx = this.targetEnemy.x - this.x;
                const dy = this.targetEnemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                    // Adjust velocity toward target
                    const targetVx = (dx / dist) * Math.abs(this.velocityY);
                    const targetVy = (dy / dist) * Math.abs(this.velocityY);
                    
                    this.velocityX += (targetVx - this.velocityX) * this.homingStrength;
                    this.velocityY += (targetVy - this.velocityY) * this.homingStrength;
                    
                    // Maintain consistent speed
                    const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
                    const desiredSpeed = Math.abs(this.bulletLevel ? 8 + this.bulletLevel : 8);
                    if (currentSpeed > 0) {
                        this.velocityX = (this.velocityX / currentSpeed) * desiredSpeed;
                        this.velocityY = (this.velocityY / currentSpeed) * desiredSpeed;
                    }
                }
            }
        }
        
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    draw(ctx) {
        if (this.isHeatSeeking && this.isPlayerProjectile) {
            // Draw homing missile sprite
            this.drawHomingMissile(ctx);
        } else if (this.weaponType === 'laser') {
            // Laser rendering - thin beam with glow
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            
            // Bright core
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x - 1, this.y - this.height / 2, 2, this.height);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        } else {
            // Standard bullet rendering
            // Enhanced glow for higher level bullets
            const glowIntensity = this.isPlayerProjectile ? 10 + (this.bulletLevel * 5) : 10;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = glowIntensity;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            // Add inner bright core (larger for higher levels)
            const coreWidth = this.isPlayerProjectile ? Math.max(2, this.bulletLevel) : 2;
            ctx.fillStyle = this.isPlayerProjectile ? '#ffffff' : '#ffaaaa';
            ctx.fillRect(this.x - coreWidth / 2, this.y - this.height / 2, coreWidth, this.height);
            
            // Add energy trail for higher level bullets
            if (this.isPlayerProjectile && this.bulletLevel >= 3) {
                ctx.fillStyle = this.color + '44'; // Semi-transparent
                ctx.fillRect(this.x - this.width / 2, this.y + this.height / 2, this.width, this.bulletLevel * 3);
            }
        }
    }

    drawHomingMissile(ctx) {
        // Draw pixel-art homing missile sprite
        const spriteSize = 20; // Missile sprite size
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Calculate rotation angle based on velocity direction
        const angle = Math.atan2(this.velocityY, this.velocityX) + Math.PI / 2;
        ctx.rotate(angle);
        
        // Define missile sprite with pixel art (scaled up)
        const px = 2; // Pixel size multiplier
        
        // Engine glow effect
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 20;
        
        // Back tail section (black)
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6*px, 8*px, 4*px, 4*px);
        ctx.fillRect(2*px, 8*px, 4*px, 4*px);
        
        // Body section 1 - red (upper body)
        ctx.fillStyle = '#dd2200';
        ctx.fillRect(-6*px, 0, 12*px, 4*px);
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(-6*px, 4*px, 12*px, 4*px);
        
        // Body section 2 - darker red (mid body)
        ctx.fillStyle = '#aa0000';
        ctx.fillRect(-4*px, 8*px, 8*px, 4*px);
        
        // Head section - cream/yellow (warhead)
        ctx.fillStyle = '#ffdd88';
        ctx.fillRect(-6*px, 12*px, 12*px, 3*px);
        ctx.fillStyle = '#ffffaa';
        ctx.fillRect(-4*px, 15*px, 8*px, 2*px);
        
        // Engine nozzle (orange)
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-3*px, 17*px, 6*px, 2*px);
        
        // Engine exhaust flame (yellow/orange)
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-4*px, 19*px, 8*px, 2*px);
        
        // Bright engine core
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-2*px, 20*px, 2*px, 1*px);
        ctx.fillRect(2*px, 20*px, 2*px, 1*px);
        
        // Engine trail glow
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 150, 0, 0.4)';
        ctx.fillRect(-5*px, 21*px, 10*px, 3*px);
        
        ctx.restore();
    }

    isOffScreen(canvasHeight) {
        return this.y < -this.height || this.y > canvasHeight + this.height;
    }

    // Check collision with another object (handles both center-based and top-left coordinates)
    collidesWith(other) {
        // Convert projectile to center-based coordinates for consistency
        const projectileCenterX = this.x + this.width / 2;
        const projectileCenterY = this.y + this.height / 2;
        
        // Check if other object uses center coordinates (has x,y as center) or top-left
        let otherCenterX, otherCenterY, otherHalfWidth, otherHalfHeight;
        
        if (other.width && other.height) {
            // Assume center-based coordinates for enemies/players
            otherCenterX = other.x;
            otherCenterY = other.y;
            otherHalfWidth = other.width / 2;
            otherHalfHeight = other.height / 2;
        } else {
            // Fallback for top-left based objects
            otherCenterX = other.x + (other.width || 0) / 2;
            otherCenterY = other.y + (other.height || 0) / 2;
            otherHalfWidth = (other.width || 0) / 2;
            otherHalfHeight = (other.height || 0) / 2;
        }
        
        return Math.abs(projectileCenterX - otherCenterX) < (this.width / 2 + otherHalfWidth) &&
               Math.abs(projectileCenterY - otherCenterY) < (this.height / 2 + otherHalfHeight);
    }
}

Projectile.pool = [];
Projectile.MAX_POOL_SIZE = 600;