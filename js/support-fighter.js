class SupportFighter {
    constructor(type, player, canvasWidth, canvasHeight) {
        this.type = type;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 32;
        this.height = 24;
        this.x = player.x;
        this.y = player.y - 80;
        
        // Select random pilot ship type for variety
        this.shipType = this.getRandomShipType(type);
        this.bulletLevel = Math.max(1, player.bulletLevel - 1);
        this.upgrades = {
            hasPiercingShots: player.hasPiercingShots,
            hasExplosiveShots: player.hasExplosiveShots
        };
        this.bulletSpeed = 7;
        this.fireRate = this.getFireRate(type);
        this.shootCooldown = 0;
        this.speed = this.getSpeed(type);
        this.duration = 20 * 60; // 20 seconds lifetime
        this.age = 0;
        this.offsetX = this.getFormationOffset(type);
    }

    getRandomShipType(type) {
        // Available pilot ship types for random selection
        const pilotShips = [
            'basic', 'fighter', 'interceptor', 'aggressor', 'striker', 'vanguard',
            'phoenix', 'tempest', 'nova', 'sentinel', 'harbinger', 'pulsar'
        ];
        
        if (type === 'pilot') {
            // Random pilot ship when called with 'pilot' type
            return pilotShips[Math.floor(Math.random() * pilotShips.length)];
        } else {
            // Use existing logic for other types
            return type === 'heavy' ? 'vanguard' : type === 'fast' ? 'interceptor' : 'fighter';
        }
    }

    getFireRate(type) {
        switch(type) {
            case 'fast':
                return 10;
            case 'heavy':
                return 20;
            default:
                return 15;
        }
    }

    getSpeed(type) {
        switch(type) {
            case 'fast':
                return 8;
            case 'heavy':
                return 4;
            default:
                return 6;
        }
    }

    getFormationOffset(type) {
        switch(type) {
            case 'fast':
                return 80;
            case 'heavy':
                return -80;
            default:
                return 40;
        }
    }

    update(player) {
        this.age++;
        const targetX = player.x + this.offsetX;
        const targetY = player.y - 60;
        this.x += (targetX - this.x) * 0.08;
        this.y += (targetY - this.y) * 0.08;
        this.y = Math.max(this.height / 2, Math.min(this.canvasHeight / 2, this.y));
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    shoot() {
        if (this.shootCooldown > 0) return null;
        this.shootCooldown = this.fireRate;
        const projectileY = this.y - this.height / 2;
        const bullets = [Projectile.create(
            this.x,
            projectileY,
            -this.bulletSpeed,
            true,
            this.bulletLevel,
            0,
            null,
            this.upgrades
        )];
        return bullets;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        const spriteName = `player_${this.shipType}`;
        let spriteDrawn = false;
        if (typeof assetManager !== 'undefined' && assetManager.isLoaded()) {
            const sprite = assetManager.getImage(spriteName);
            if (sprite) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                spriteDrawn = true;
            }
        }
        if (!spriteDrawn) {
            ctx.fillStyle = '#88ffda';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
        ctx.restore();
    }

    isExpired() {
        return this.age >= this.duration;
    }
}
