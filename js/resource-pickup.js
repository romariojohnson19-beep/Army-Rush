class ResourcePickup {
    constructor(x, y, resource, amount) {
        this.x = x;
        this.y = y;
        this.resource = resource;
        this.amount = amount;
        this.width = 28;
        this.height = 28;
        this.speedY = 1.2;
        this.floatPhase = Math.random() * Math.PI * 2;
        this.life = 600; // 10 seconds
        this.rotation = 0;
        this.colors = {
            energy: '#00ffff',
            metal: '#9e9e9e',
            crystals: '#ff66ff',
            darkMatter: '#5a00b5'
        };
        this.icons = {
            energy: '⚡',
            metal: '⚙️',
            crystals: '💎',
            darkMatter: '🌌'
        };
    }

    update() {
        this.floatPhase += 0.05;
        this.y += this.speedY + Math.sin(this.floatPhase) * 0.3;
        this.rotation += 0.02;
        this.life--;
    }

    draw(ctx) {
        // Attempt sprite-based rendering first
        if (typeof ResourceSpriteRenderer !== 'undefined') {
            const rendered = (function(r){
                if (!r || typeof r.drawResource !== 'function') return false;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                // drawResource now returns true if a sprite or fallback was drawn
                const drew = !!r.drawResource(ctx, this.resource, 0, 0, this.width, this.height, null);
                ctx.restore();
                return drew;
            })(ResourceSpriteRenderer);
            if (rendered) return; // sprite (or fallback) drawn successfully
        }

        // Fallback to procedural pixel art
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        const px = 1.5;
        switch(this.resource) {
            case 'energy': this.drawEnergySprite(ctx, px); break;
            case 'metal': this.drawMetalSprite(ctx, px); break;
            case 'crystals': this.drawCrystalSprite(ctx, px); break;
            case 'darkMatter': this.drawDarkMatterSprite(ctx, px); break;
            default: this.drawGenericSprite(ctx, px); break;
        }
        ctx.restore();
    }

    drawEnergySprite(ctx, px) {
        // Lightning bolt shaped energy pickup
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        
        // Vertical lightning bolt
        ctx.fillRect(-2*px, -6*px, 4*px, 3*px);
        ctx.fillRect(-4*px, -3*px, 4*px, 3*px);
        ctx.fillRect(-2*px, -2*px, 4*px, 3*px);
        ctx.fillRect(0*px, 1*px, 4*px, 3*px);
        ctx.fillRect(-2*px, 4*px, 4*px, 3*px);
        
        // Core glow
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2*px, -1*px, 4*px, 2*px);
        ctx.shadowBlur = 0;
    }

    drawMetalSprite(ctx, px) {
        // Gear/cog shaped metal pickup
        ctx.fillStyle = '#9e9e9e';
        ctx.shadowColor = '#c0c0c0';
        ctx.shadowBlur = 10;
        
        // Central circle
        ctx.fillRect(-3*px, -3*px, 6*px, 6*px);
        
        // Corner gears
        ctx.fillRect(-5*px, -3*px, 2*px, 2*px);
        ctx.fillRect(3*px, -3*px, 2*px, 2*px);
        ctx.fillRect(-5*px, 3*px, 2*px, 2*px);
        ctx.fillRect(3*px, 3*px, 2*px, 2*px);
        
        // Center hole
        ctx.fillStyle = '#666666';
        ctx.fillRect(-1*px, -1*px, 2*px, 2*px);
        ctx.shadowBlur = 0;
    }

    drawCrystalSprite(ctx, px) {
        // Diamond/crystal shaped pickup
        ctx.fillStyle = '#ff66ff';
        ctx.shadowColor = '#ff66ff';
        ctx.shadowBlur = 15;
        
        // Upper triangle
        ctx.fillRect(-3*px, -6*px, 6*px, 2*px);
        ctx.fillRect(-4*px, -4*px, 8*px, 2*px);
        ctx.fillRect(-5*px, -2*px, 10*px, 2*px);
        
        // Middle band
        ctx.fillRect(-6*px, 0*px, 12*px, 2*px);
        
        // Lower triangle
        ctx.fillRect(-5*px, 2*px, 10*px, 2*px);
        ctx.fillRect(-4*px, 4*px, 8*px, 2*px);
        ctx.fillRect(-3*px, 6*px, 6*px, 2*px);
        
        // Bright highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2*px, -2*px, 4*px, 4*px);
        ctx.shadowBlur = 0;
    }

    drawDarkMatterSprite(ctx, px) {
        // Swirling void/dark matter pickup
        ctx.fillStyle = '#5a00b5';
        ctx.shadowColor = '#7700ff';
        ctx.shadowBlur = 20;
        
        // Swirling pattern
        ctx.fillRect(-2*px, -6*px, 4*px, 2*px);
        ctx.fillRect(-5*px, -2*px, 3*px, 3*px);
        ctx.fillRect(2*px, -2*px, 3*px, 3*px);
        ctx.fillRect(-3*px, 2*px, 6*px, 2*px);
        ctx.fillRect(-4*px, 5*px, 8*px, 2*px);
        
        // Bright core
        ctx.fillStyle = '#aa00ff';
        ctx.fillRect(-1*px, -1*px, 2*px, 2*px);
        ctx.shadowBlur = 0;
    }

    drawGenericSprite(ctx, px) {
        // Fallback generic box sprite
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(-4*px, -4*px, 8*px, 8*px);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-4*px, -4*px, 8*px, 8*px);
        ctx.shadowBlur = 0;
    }

    collidesWith(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.width / 2 + player.width / 2);
    }

    isExpired(canvasHeight) {
        return this.life <= 0 || this.y > canvasHeight + this.height;
    }
}
