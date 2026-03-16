/**
 * VortexItem - Collectible mutation/relic item
 * Player must touch it to trigger the mutation selection UI
 * Spawns as a physical item on the game screen
 */
class VortexItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speedY = 1.0;
        this.floatPhase = Math.random() * Math.PI * 2;
        this.life = 900; // 15 seconds before expiring
        this.rotation = 0;
        this.collected = false;
        
        // Vortex-specific properties
        this.pulseScale = 1.0;
        this.pulsePhase = 0;
        this.particleAngle = 0;
    }

    update() {
        if (this.collected) return;
        
        // Floating movement
        this.floatPhase += 0.04;
        this.y += this.speedY + Math.sin(this.floatPhase) * 0.4;
        
        // Rotation and pulsing
        this.rotation += 0.06;
        this.pulsePhase += 0.08;
        this.pulseScale = 1.0 + Math.sin(this.pulsePhase) * 0.2;
        
        this.life--;
        this.particleAngle += 0.12;
    }

    draw(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        const px = 2; // Pixel size multiplier
        
        // Draw swirling vortex sprite
        ctx.fillStyle = '#9900ff';
        ctx.shadowColor = '#dd66ff';
        ctx.shadowBlur = 25;
        
        // Outer vortex rings (swirling pattern)
        for (let ring = 0; ring < 3; ring++) {
            const angle = this.particleAngle + (ring * Math.PI * 2 / 3);
            const radius = (ring + 1) * 3 * px;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            ctx.fillRect(x - 1.5*px, y - 1.5*px, 3*px, 3*px);
        }
        
        // Central vortex core - alternating colors
        ctx.fillStyle = '#aa00ff';
        ctx.fillRect(-2*px, -3*px, 4*px, 6*px);
        ctx.fillRect(-3*px, -2*px, 6*px, 4*px);
        
        // Bright center
        ctx.fillStyle = '#ff66ff';
        ctx.fillRect(-1*px, -1*px, 2*px, 2*px);
        
        // Sparkle particles around vortex
        ctx.fillStyle = 'rgba(255, 102, 255, 0.8)';
        for (let i = 0; i < 4; i++) {
            const angle = (this.particleAngle * 0.5) + (i * Math.PI / 2);
            const px_dist = 7 * px;
            const spx = Math.cos(angle) * px_dist;
            const spy = Math.sin(angle) * px_dist;
            ctx.fillRect(spx - 1*px, spy - 1*px, 2*px, 2*px);
        }
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    collidesWith(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.width / 2 + player.width / 2);
    }

    isExpired(canvasHeight) {
        return this.life <= 0 || this.y > canvasHeight + this.height || this.collected;
    }

    collect() {
        this.collected = true;
    }
}
