class AsteroidField {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.entryKm = 44;
        this.exitKm = 54;
        this.asteroids = [];
        this.spawnTimer = 0;
        this.overlayAlpha = 0;
        this.active = false;
        this.hazeParticles = this.createHazeParticles();
    }

    createHazeParticles(count = 40) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                speedY: 0.2 + Math.random() * 0.4,
                drift: (Math.random() - 0.5) * 0.3,
                size: 1 + Math.random() * 2,
                alpha: 0.2 + Math.random() * 0.3
            });
        }
        return particles;
    }

    updateHaze() {
        this.hazeParticles.forEach(particle => {
            particle.y += particle.speedY;
            particle.x += particle.drift;
            if (particle.y > this.height + 10) {
                particle.y = -10;
                particle.x = Math.random() * this.width;
            }
            if (particle.x > this.width) {
                particle.x = 0;
            } else if (particle.x < 0) {
                particle.x = this.width;
            }
        });
    }

    update(state = {}) {
        const distanceKm = state.distanceKm ?? 0;
        const insideField = distanceKm >= this.entryKm && distanceKm <= this.exitKm;

        if (insideField && !this.active) {
            this.active = true;
            this.overlayAlpha = 0;
            this.spawnTimer = 0;
            state.onEnter?.(distanceKm);
        } else if (!insideField && this.active) {
            this.active = false;
            this.asteroids = [];
            state.onExit?.(distanceKm);
        }

        // Fade overlay based on active state
        if (this.active) {
            this.overlayAlpha = Math.min(0.95, this.overlayAlpha + 0.015);
        } else {
            this.overlayAlpha = Math.max(0, this.overlayAlpha - 0.02);
        }

        this.updateHaze();

        if (!this.active) return;

        this.spawnTimer--;
        const intensity = this.getIntensity(distanceKm);
        if (this.spawnTimer <= 0) {
            this.spawnAsteroid(intensity);
            // Faster spawns as intensity grows
            const baseInterval = 45 - intensity * 20;
            this.spawnTimer = Math.max(12, baseInterval + Math.random() * 12);
        }

        this.asteroids.forEach(asteroid => asteroid.update());

        this.handleProjectileHits(state.projectiles, state.createExplosion, state.onScore);
        this.handlePlayerCollisions(state.player, state.onPlayerHit, state.createExplosion);
        this.handleEnemyCollisions(state.enemies, state.createExplosion, state.onEnemyDestroyed, state.onSpawnResourceDrops);

        this.cleanup();
    }

    getIntensity(distanceKm) {
        if (distanceKm <= this.entryKm) return 0;
        if (distanceKm >= this.exitKm) return 1;
        return (distanceKm - this.entryKm) / (this.exitKm - this.entryKm);
    }

    spawnAsteroid(intensity = 0) {
        const radius = 18 + Math.random() * (30 + intensity * 25);
        const x = Math.random() * (this.width - radius * 2) + radius;
        const speed = 1.2 + Math.random() * 1.5 + intensity * 0.8;
        const drift = (Math.random() - 0.5) * (1 + intensity);
        const health = Math.max(1, Math.round(radius / 10));
        const points = 25 + Math.round(radius * 1.5);
        const color = intensity > 0.6 ? '#8f6d4f' : '#6e5b4d';

        this.asteroids.push(new AsteroidRock({
            x,
            y: -radius,
            radius,
            speed,
            drift,
            health,
            points,
            color
        }));
    }

    handleProjectileHits(projectiles = [], createExplosion, onScore) {
        if (!Array.isArray(projectiles) || !projectiles.length) return;

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (!projectile || !projectile.isPlayerProjectile) continue;

            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                if (projectile.hitTargets && projectile.hitTargets.has(asteroid)) {
                    continue;
                }

                if (projectile.collidesWith(asteroid)) {
                    const destroyed = asteroid.takeDamage(projectile.damage || 1);
                    if (projectile.hitTargets) {
                        projectile.hitTargets.add(asteroid);
                    }

                    if (destroyed) {
                        createExplosion?.(asteroid.x, asteroid.y, '#ffb347', 1.2);
                        this.asteroids.splice(j, 1);
                        this.spawnFragments(asteroid);
                        onScore?.(asteroid.points);
                    }

                    if (!projectile.isPiercing || (projectile.hitTargets && projectile.hitTargets.size >= projectile.maxPierceTargets)) {
                        projectiles.splice(i, 1);
                        if (typeof projectile.recycle === 'function') {
                            projectile.recycle();
                        }
                    }
                    break;
                }
            }
        }
    }

    spawnFragments(asteroid) {
        if (!asteroid || asteroid.radius < 22) return;
        const fragmentCount = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < fragmentCount; i++) {
            const radius = asteroid.radius * (0.4 + Math.random() * 0.2);
            const fragment = new AsteroidRock({
                x: asteroid.x,
                y: asteroid.y,
                radius,
                speed: asteroid.speed * (1 + Math.random() * 0.4),
                drift: (Math.random() - 0.5) * 2,
                health: Math.max(1, Math.round(radius / 12)),
                points: Math.max(10, Math.round(radius * 1.2)),
                color: asteroid.color
            });
            this.asteroids.push(fragment);
        }
    }

    handlePlayerCollisions(player, onPlayerHit, createExplosion) {
        if (!player) return;
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            if (asteroid.collidesWith(player)) {
                createExplosion?.(asteroid.x, asteroid.y, '#ff6b6b', 1.4);
                this.asteroids.splice(i, 1);
                onPlayerHit?.(asteroid);
            }
        }
    }

    handleEnemyCollisions(enemies = [], createExplosion, onEnemyDestroyed, onSpawnResourceDrops) {
        if (!Array.isArray(enemies) || !enemies.length) return;

        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy) continue;

                if (asteroid.collidesWith(enemy)) {
                    // Asteroid destroys enemy
                    const destroyed = asteroid.takeDamage(10); // Asteroids take damage from destroying enemies
                    
                    // Create explosion at enemy position
                    createExplosion?.(enemy.x, enemy.y, '#ff6b6b', 1.2);

                    // Remove enemy and trigger callbacks
                    enemies.splice(j, 1);
                    onEnemyDestroyed?.(enemy);
                    onSpawnResourceDrops?.(enemy);

                    // If asteroid is destroyed, remove it
                    if (destroyed) {
                        createExplosion?.(asteroid.x, asteroid.y, '#ffb347', 1.2);
                        this.asteroids.splice(i, 1);
                        this.spawnFragments(asteroid);
                        break; // Exit inner loop since asteroid is gone
                    }
                }
            }
        }
    }

    cleanup() {
        this.asteroids = this.asteroids.filter(asteroid => !asteroid.isOffScreen(this.height));
        if (this.asteroids.length > 60) {
            this.asteroids.splice(0, this.asteroids.length - 60);
        }
    }

    draw(ctx) {
        if (!ctx) return;

        if (this.overlayAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.overlayAlpha * 0.5;
            const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#0b111c');
            gradient.addColorStop(1, '#1f1612');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.restore();
        }

        if (this.overlayAlpha > 0.05 || this.active) {
            ctx.save();
            const hazeAlpha = Math.max(0, Math.min(0.6, 0.15 + this.overlayAlpha * 0.5));
            ctx.fillStyle = `rgba(255,255,255,${hazeAlpha})`;
            this.hazeParticles.forEach(particle => {
                ctx.globalAlpha = particle.alpha * hazeAlpha;
                ctx.fillRect(particle.x, particle.y, particle.size, particle.size * 3);
            });
            ctx.restore();
        }

        this.asteroids.forEach(asteroid => asteroid.draw(ctx, this.overlayAlpha));
    }
}

class AsteroidRock {
    constructor({ x, y, radius, speed, drift, health, points, color = '#6d5a4a' }) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;
        this.speed = speed;
        this.drift = drift;
        this.health = health;
        this.maxHealth = health;
        this.points = points;
        this.color = color;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.vertices = this.generateVertices();
        this.cracks = this.generateCracks();
    }

    generateVertices() {
        const sides = 6 + Math.floor(Math.random() * 4);
        const vertices = [];
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 * i) / sides;
            const radius = this.radius * (0.65 + Math.random() * 0.35);
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        return vertices;
    }

    generateCracks() {
        const cracks = [];
        for (let i = 0; i < 3; i++) {
            cracks.push({
                start: {
                    x: (Math.random() - 0.5) * this.radius,
                    y: (Math.random() - 0.5) * this.radius
                },
                end: {
                    x: (Math.random() - 0.5) * this.radius,
                    y: (Math.random() - 0.5) * this.radius
                }
            });
        }
        return cracks;
    }

    update() {
        this.y += this.speed;
        this.x += this.drift;
        this.rotation += this.rotationSpeed;
    }

    takeDamage(amount = 1) {
        this.health -= amount;
        return this.health <= 0;
    }

    collidesWith(entity) {
        if (!entity) return false;
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        const combined = this.radius + Math.max(entity.width || 0, entity.height || 0) / 2;
        return dx * dx + dy * dy <= combined * combined;
    }

    isOffScreen(height) {
        return this.y - this.radius > height + 40;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.2, 0, 0, this.radius);
        gradient.addColorStop(0, '#f9d976');
        gradient.addColorStop(0.35, this.color);
        gradient.addColorStop(1, '#2c1e19');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        this.cracks.forEach(crack => {
            ctx.beginPath();
            ctx.moveTo(crack.start.x, crack.start.y);
            ctx.lineTo(crack.end.x, crack.end.y);
            ctx.stroke();
        });

        ctx.restore();
    }
}
