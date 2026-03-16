class WarpPortal {
    constructor(x, y, checkpointDistance) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.checkpointDistance = checkpointDistance; // Distance in km where this portal appears
        this.activated = false;
        this.animationPhase = 0;
        this.pulseScale = 1;
        this.rotationAngle = 0;
        this.particles = [];
        
        // Portal color based on checkpoint tier
        this.tier = this.calculateTier(checkpointDistance);
        this.color = this.getTierColor(this.tier);
        this.reward = this.generateReward();
        
        // Create swirling particles
        this.createPortalParticles();
    }

    calculateTier(distance) {
        if (distance >= 100) return 'legendary';      // 100km+ - Ultimate bases
        if (distance >= 50) return 'epic';           // 50km+ - Advanced bases
        if (distance >= 25) return 'rare';           // 25km+ - Major outposts
        if (distance >= 10) return 'uncommon';       // 10km+ - Standard bases
        return 'common';                             // 5km+ - Basic outposts
    }

    getTierColor(tier) {
        const colors = {
            common: '#00ff41',
            uncommon: '#00aaff',
            rare: '#aa00ff',
            epic: '#ff6600',
            legendary: '#ff0066'
        };
        return colors[tier] || '#00ff41';
    }

    createPortalParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                angle: (i / 20) * Math.PI * 2,
                radius: Math.random() * 30 + 20,
                speed: Math.random() * 0.05 + 0.02,
                life: 1.0,
                size: Math.random() * 3 + 1
            });
        }
    }

    update() {
        this.animationPhase += 0.1;
        this.pulseScale = 1 + Math.sin(this.animationPhase) * 0.2;
        this.rotationAngle += 0.02;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.angle += particle.speed;
            particle.radius += Math.sin(particle.angle * 5) * 0.5;
            particle.life = 0.7 + Math.sin(particle.angle * 3) * 0.3;
        });
        
        // Portal drifts downward slowly
        this.y += 0.5;
    }

    draw(ctx) {
        ctx.save();
        
        // Move to portal center
        ctx.translate(this.x, this.y);
        
        // Draw portal background
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, this.color + '80');
        gradient.addColorStop(0.7, this.color + '40');
        gradient.addColorStop(1, this.color + '10');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, (this.width / 2) * this.pulseScale, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw swirling particles
        ctx.rotate(this.rotationAngle);
        this.particles.forEach(particle => {
            const x = Math.cos(particle.angle) * particle.radius;
            const y = Math.sin(particle.angle) * particle.radius;
            
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        ctx.rotate(-this.rotationAngle);
        
        // Draw portal ring
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, (this.width / 2) * this.pulseScale, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw inner ring
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, (this.width / 3) * this.pulseScale, 0, Math.PI * 2);
        ctx.stroke();
        
    // Draw portal symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const portalIcon = this.reward?.type === 'supportFighter' ? '📡' : '🌀';
    ctx.fillText(portalIcon, 0, 0);
        
        // Draw checkpoint info
        ctx.fillStyle = this.color;
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${this.checkpointDistance}km`, 0, -this.width/2 - 15);
        const rewardLabel = this.reward?.type === 'supportFighter' ? `Deploy ${this.reward.supportLabel}` : 'Ship Upgrade';
        ctx.fillText(rewardLabel, 0, this.width/2 + 15);
        
        ctx.restore();
    }

    // Check collision with player
    collidesWith(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.width / 2 + player.width / 2);
    }

    activate() {
        if (!this.activated) {
            this.activated = true;
            return true;
        }
        return false;
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + this.height;
    }

    generateReward() {
        const rewardRoll = Math.random();
        if (rewardRoll < 0.5) {
            return {
                type: 'shipUpgrade',
                icon: '⬆️',
                description: 'Levels up your primary ship systems for the current run'
            };
        }
        const supportVariants = ['basic', 'fast', 'heavy'];
        const supportType = supportVariants[Math.floor(Math.random() * supportVariants.length)];
        return {
            type: 'supportFighter',
            supportType,
            supportLabel: `${supportType.charAt(0).toUpperCase() + supportType.slice(1)} Wing`,
            icon: '🛸',
            description: 'Calls in a mirrored support fighter for limited time'
        };
    }
}

class WarpPortalManager {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        this.portals = [];
        this.nextPortalDistance = 30; // First portal at 30km
        this.portalDistances = this.generatePortalDistances(); // 30km, then every 15km
        this.portalIndex = 0;
        this.lastSpawnedDistance = 0;
    }

    generatePortalDistances() {
        const distances = [30]; // First portal at 30km
        // Then every 15km: 45, 60, 75, 90, 105, 120, 135, 150...
        for (let i = 1; i <= 20; i++) {
            distances.push(30 + (i * 15));
        }
        return distances;
    }

    update(currentDistance) {
        // Check if we should spawn a new portal
        const distanceKm = Math.floor(currentDistance / 100); // Convert to km
        
        if (this.portalIndex < this.portalDistances.length && 
            distanceKm >= this.portalDistances[this.portalIndex] && 
            distanceKm > this.lastSpawnedDistance) {
            
            this.spawnPortal(this.portalDistances[this.portalIndex]);
            this.lastSpawnedDistance = distanceKm;
            this.portalIndex++;
        }
        
        // Update existing portals
        this.portals.forEach(portal => portal.update());
        
        // Remove off-screen portals
        this.portals = this.portals.filter(portal => !portal.isOffScreen(800));
    }

    spawnPortal(checkpointDistance) {
        const x = Math.random() * (this.canvasWidth - 160) + 80; // Keep portals away from edges
        const y = -100; // Spawn above screen
        
        const portal = new WarpPortal(x, y, checkpointDistance);
        this.portals.push(portal);
        
        return portal;
    }

    checkPortalCollisions(player) {
        for (let i = this.portals.length - 1; i >= 0; i--) {
            const portal = this.portals[i];
            if (portal.collidesWith(player)) {
                if (portal.activate()) {
                    // Remove the portal and return the checkpoint info
                    this.portals.splice(i, 1);
                    return {
                        distance: portal.checkpointDistance,
                        tier: portal.tier,
                        color: portal.color,
                        reward: portal.reward
                    };
                }
            }
        }
        return null;
    }

    draw(ctx) {
        this.portals.forEach(portal => portal.draw(ctx));
    }

    // Get all active portals
    getActivePortals() {
        return [...this.portals];
    }

    // Force spawn portal for testing
    forceSpawnPortal(distance = 5) {
        return this.spawnPortal(distance);
    }

    // Reset portal manager for new game
    reset() {
        this.portals = [];
        this.portalIndex = 0;
        this.lastSpawnedDistance = 0;
    }

    resumeFrom(distanceKm = 0) {
        if (typeof distanceKm !== 'number') distanceKm = 0;
        this.lastSpawnedDistance = Math.floor(distanceKm);
        const nextIndex = this.portalDistances.findIndex(distance => distance > distanceKm);
        this.portalIndex = nextIndex === -1 ? this.portalDistances.length : nextIndex;
    }

    // Check if player has access to certain portal tiers based on progress
    hasAccessToTier(tier, playerStats) {
        const requirements = {
            common: { distance: 0 },
            uncommon: { distance: 5 },
            rare: { distance: 15 },
            epic: { distance: 35 },
            legendary: { distance: 75 }
        };
        
        const req = requirements[tier];
        return playerStats.bestDistance >= req.distance;
    }

}