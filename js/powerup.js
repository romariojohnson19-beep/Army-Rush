class PowerUp {
    constructor(x, y, type = 'rapidFire') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 20;
        this.height = 20;
        this.speed = 1;
        this.collected = false;
        this.rotationAngle = 0;
        this.pulseScale = 1;
        this.glowIntensity = 0;
        
        // Set properties based on power-up type
        this.setupPowerUpProperties();
    }

    setupPowerUpProperties() {
        switch(this.type) {
            case 'rapidFire':
                this.color = '#00ff00';
                this.glowColor = '#88ff88';
                this.duration = 600; // 10 seconds at 60fps
                this.description = 'Rapid Fire';
                this.symbol = 'R';
                break;
            case 'multiShot':
                this.color = '#ff8800';
                this.glowColor = '#ffaa44';
                this.duration = 480; // 8 seconds at 60fps
                this.description = 'Multi Shot';
                this.symbol = 'M';
                break;
            case 'shield':
                this.color = '#0088ff';
                this.glowColor = '#44aaff';
                this.duration = 900; // 15 seconds at 60fps
                this.description = 'Shield';
                this.symbol = 'S';
                break;
            case 'health':
                this.color = '#ff0088';
                this.glowColor = '#ff44aa';
                this.duration = 0; // Instant effect
                this.description = 'Health+';
                this.symbol = '+';
                break;
            case 'speedBoost':
                this.color = '#ffff00';
                this.glowColor = '#ffff88';
                this.duration = 720; // 12 seconds at 60fps
                this.description = 'Speed Boost';
                this.symbol = '>';
                break;
            case 'scoreMultiplier':
                this.color = '#ff00ff';
                this.glowColor = '#ff88ff';
                this.duration = 600; // 10 seconds at 60fps
                this.description = '2x Score';
                this.symbol = 'x2';
                break;
            case 'currencyDoubler':
                this.color = '#ffd700'; // Gold color
                this.glowColor = '#ffea80';
                this.duration = 480; // 8 seconds at 60fps
                this.description = 'Double Coins';
                this.symbol = '$2';
                this.health = 3; // Requires 3 hits to collect
                this.maxHealth = 3;
                break;
            case 'nuke':
                this.color = '#ff0000'; // Red color
                this.glowColor = '#ff6666';
                this.duration = 0; // Instant effect
                this.description = 'Nuclear Strike';
                this.symbol = '☢';
                this.width = 30; // Larger size
                this.height = 30;
                break;
            case 'heatSeekingMissiles':
                this.color = '#ff0088'; // Pink/magenta color
                this.glowColor = '#ff44aa';
                this.duration = 540; // 9 seconds at 60fps
                this.description = 'Heat Seekers';
                this.symbol = '🎯';
                break;
            case 'angularShots':
                this.color = '#00ffff'; // Cyan color
                this.glowColor = '#88ffff';
                this.duration = 600; // 10 seconds at 60fps
                this.description = 'Angular Fire';
                this.symbol = '⚡';
                break;
            case 'radio':
                this.color = '#00ff00'; // Green color
                this.glowColor = '#88ff88';
                this.duration = 720; // 12 seconds at 60fps
                this.description = 'Support Pilot';
                this.symbol = '📡';
                this.width = 25;
                this.height = 25;
                break;
            case 'toolbox':
                this.color = '#ff6600'; // Orange color
                this.glowColor = '#ffaa66';
                this.duration = 0; // Instant effect
                this.description = 'Ship Upgrade';
                this.symbol = '🔧';
                this.width = 28;
                this.height = 28;
                break;
            case 'mutation':
                this.color = '#9900ff'; // Purple color
                this.glowColor = '#dd66ff';
                this.duration = 0; // Instant effect
                this.description = 'Mutation Relic';
                this.symbol = '🌀';
                this.width = 32;
                this.height = 32;
                break;
        }
    }

    update() {
        this.y += this.speed;
        
        // Animation effects
        this.rotationAngle += 0.05;
        this.pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        this.glowIntensity = Math.sin(Date.now() * 0.008) * 0.5 + 0.5;
        
        // Special animation for damaged currency doubler
        if (this.type === 'currencyDoubler' && this.health < this.maxHealth) {
            // Flashing effect when damaged
            this.pulseScale *= (1 + Math.sin(Date.now() * 0.02) * 0.2);
        }
    }
    
    // Method for currency doubler to take damage from bullets
    takeDamage(damage = 1) {
        if (this.type !== 'currencyDoubler') return false;
        
        this.health -= damage;
        if (this.health <= 0) {
            this.collected = true;
            return true; // Ready to collect
        }
        return false; // Still needs more hits
    }

    draw(ctx) {
        // Sprite-based attempt first
        if (typeof ResourceSpriteRenderer !== 'undefined') {
            const spriteDrawn = (function(r){
                if (!r || typeof r.drawPowerUp !== 'function') return false;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotationAngle);
                ctx.scale(this.pulseScale, this.pulseScale);
                // drawPowerUp now returns true if it actually drew from a sheet or used a fallback
                const drew = !!r.drawPowerUp(ctx, this.type, 0, 0, this.width, this.height, null);
                ctx.restore();
                return drew;
            }).call(this, ResourceSpriteRenderer);
            if (spriteDrawn) {
                // Optionally overlay a subtle glow
                ctx.save();
                ctx.globalAlpha = 0.25 * (this.glowIntensity + 0.3);
                ctx.fillStyle = this.glowColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, (this.width + 10) / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                return;
            }
        }

        // Fallback original rectangle + symbol implementation
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        ctx.scale(this.pulseScale, this.pulseScale);
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15 + this.glowIntensity * 10;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        ctx.restore();
        
        // Draw health indicator for currency doubler
        if (this.type === 'currencyDoubler' && this.health < this.maxHealth) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.health}`, this.x, this.y + this.height/2 + 15);
        }
        
        // Draw floating text
        if (this.glowIntensity > 0.8) {
            // Skip floating text if sprite present (cleaner look)
            if (typeof ResourceSpriteRenderer === 'undefined') {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.glowIntensity})`;
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.description, this.x, this.y - 25);
            }
        }
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + this.height;
    }

    // Check collision with another object
    collidesWith(other) {
        return this.x - this.width / 2 < other.x + other.width / 2 &&
               this.x + this.width / 2 > other.x - other.width / 2 &&
               this.y - this.height / 2 < other.y + other.height / 2 &&
               this.y + this.height / 2 > other.y - other.height / 2;
    }

    collect() {
        this.collected = true;
    }
}

class PowerUpManager {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        this.spawnCooldown = 0;
        this.baseSpawnRate = 765; // Reduced from 900 to 765 (15% increase in frequency)
        this.powerUpTypes = ['rapidFire', 'multiShot', 'shield', 'health', 'speedBoost', 'scoreMultiplier', 'currencyDoubler', 'nuke', 'heatSeekingMissiles', 'angularShots', 'radio', 'toolbox', 'mutation'];
        this.spawnWeights = {
            'rapidFire': 25,
            'multiShot': 20,
            'shield': 20,
            'health': 15,
            'speedBoost': 15,
            'scoreMultiplier': 5,
            'currencyDoubler': 8,  // Rare but valuable
            'nuke': 3,             // Very rare and powerful
            'heatSeekingMissiles': 7, // New powerup
            'angularShots': 7,     // New powerup
            'radio': 4,            // Support pilot powerup (rare)
            'toolbox': 6,          // Ship upgrade
            'mutation': 2          // Very rare mutation relic
        };
    }

    update() {
        if (this.spawnCooldown > 0) {
            this.spawnCooldown--;
        }
    }

    canSpawn() {
        return this.spawnCooldown <= 0;
    }

    spawnPowerUp() {
        if (!this.canSpawn()) return null;
        
        const x = Math.random() * (this.canvasWidth - 40) + 20;
        const y = -30;
        
        // Weighted random selection
        const totalWeight = Object.values(this.spawnWeights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        let selectedType = 'rapidFire';
        for (const [type, weight] of Object.entries(this.spawnWeights)) {
            random -= weight;
            if (random <= 0) {
                selectedType = type;
                break;
            }
        }
        
        this.spawnCooldown = this.baseSpawnRate + Math.random() * 300; // Add some randomness
        
        return new PowerUp(x, y, selectedType);
    }
}

// Power-up effect particles
class PowerUpEffect {
    constructor(x, y, color, type = 'collect') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.particles = [];
        this.lifetime = type === 'collect' ? 60 : 120;
        this.currentLife = 0;
        
        // Create particles based on effect type
        if (type === 'collect') {
            this.createCollectEffect();
        } else if (type === 'activate') {
            this.createActivateEffect();
        }
    }

    createCollectEffect() {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60,
                maxLife: 60,
                size: Math.random() * 3 + 2,
                alpha: 1
            });
        }
    }

    createActivateEffect() {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * 60,
                y: this.y + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 120,
                maxLife: 120,
                size: Math.random() * 4 + 3,
                alpha: 1
            });
        }
    }

    update() {
        this.currentLife++;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
        });
        
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = this.color;
            
            if (this.type === 'collect') {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, 
                           particle.size, particle.size);
            }
            
            ctx.restore();
        });
    }

    isFinished() {
        return this.currentLife > this.lifetime && this.particles.length === 0;
    }
}