// Advanced HUD System with Compass, Holographic Ship Display, and Support Radio

class AdvancedHUD {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        // Compass
        this.compassRadius = 50;
        this.compassX = this.canvas.width - this.compassRadius - 20;
        this.compassY = this.compassRadius + 20;
        this.compassRotation = 0;
        
        // Holographic Ship Display
        this.shipDisplayX = 80;
        this.shipDisplayY = this.canvas.height - 100;
        this.shipRotation = 0;
        this.shipScale = 1;
        this.hologramPulse = 0;
        
        // Radio/Satellite Support System
        this.radioActive = false;
        this.radioCooldown = 0;
        this.radioMaxCooldown = 1800; // 30 seconds
        this.supportFighters = [];
        
        // Achievement & Daily Challenge Display
        this.achievementAlpha = 0;
        this.achievementQueue = [];
        this.dailyChallengeY = 120;
        
        // Initialize managers if they exist
        this.achievementManager = typeof AchievementManager !== 'undefined' ? new AchievementManager() : null;
        this.dailyChallengeManager = typeof DailyChallengeManager !== 'undefined' ? new DailyChallengeManager() : null;
        
        // UI Elements
        this.createRadioButton();
    }
    
    createRadioButton() {
        // Create radio button in top-right corner
        const existingRadio = document.getElementById('radioButton');
        if (existingRadio) existingRadio.remove();
        
        const radioBtn = document.createElement('div');
        radioBtn.id = 'radioButton';
        radioBtn.className = 'radio-button';
        radioBtn.innerHTML = `
            <div class="radio-icon">📡</div>
            <div class="radio-cooldown" id="radioCooldown"></div>
            <div class="radio-tooltip">Call Support Ship</div>
        `;
        radioBtn.addEventListener('click', () => this.activateRadio());
        document.body.appendChild(radioBtn);
    }
    
    update() {
        // Update compass rotation
        this.compassRotation += 0.01;
        
        // Update holographic ship rotation
        this.shipRotation += 0.02;
        this.hologramPulse = Math.sin(Date.now() * 0.003) * 0.1;
        this.shipScale = 1 + this.hologramPulse * 0.1;
        
        // Update radio cooldown
        if (this.radioCooldown > 0) {
            this.radioCooldown--;
            this.updateRadioUI();
        }
        
        // Update support fighters
        this.supportFighters = this.supportFighters.filter(fighter => {
            fighter.update(this.game.player);
            
            // Support fighters shoot
            const projectiles = fighter.shoot();
            if (projectiles) {
                this.game.playerProjectiles.push(...projectiles);
            }
            
            return fighter.age < fighter.duration;
        });
        
        // Update achievement animations
        if (this.achievementQueue.length > 0 && this.achievementAlpha === 0) {
            this.achievementAlpha = 1;
            setTimeout(() => {
                this.achievementAlpha = 0;
                this.achievementQueue.shift();
            }, 5000);
        }
    }
    
    activateRadio() {
        if (this.radioCooldown > 0) return;
        
        // Activate radio support
        this.radioCooldown = this.radioMaxCooldown;
        
        // Spawn random support ship
        const supportTypes = ['standard', 'fast', 'heavy'];
        const randomType = supportTypes[Math.floor(Math.random() * supportTypes.length)];
        
        const fighter = new SupportFighter(
            randomType,
            this.game.player,
            this.canvas.width,
            this.canvas.height
        );
        
        this.supportFighters.push(fighter);
        
        // Visual/audio feedback
        this.game.screenShake = 5;
        console.log(`📡 Support ship deployed: ${randomType}!`);
    }
    
    updateRadioUI() {
        const radioCooldownEl = document.getElementById('radioCooldown');
        if (radioCooldownEl) {
            const progress = 1 - (this.radioCooldown / this.radioMaxCooldown);
            radioCooldownEl.style.setProperty('--progress', progress);
            
            if (this.radioCooldown === 0) {
                radioCooldownEl.style.display = 'none';
            } else {
                radioCooldownEl.style.display = 'block';
            }
        }
    }
    
    draw() {
        this.drawCompass();
        this.drawHolographicShip();
        this.drawSupportFighters();
        this.drawDailyChallenges();
        this.drawAchievements();
        this.drawActivePowerUps();
    }
    
    drawCompass() {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.compassX, this.compassY);
        
        // Outer ring with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.compassRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.compassRadius - 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Rotating needle
        ctx.rotate(this.compassRotation);
        
        // North indicator
        ctx.fillStyle = '#ff0044';
        ctx.beginPath();
        ctx.moveTo(0, -this.compassRadius + 5);
        ctx.lineTo(-5, -this.compassRadius + 15);
        ctx.lineTo(5, -this.compassRadius + 15);
        ctx.closePath();
        ctx.fill();
        
        // South indicator
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.moveTo(0, this.compassRadius - 5);
        ctx.lineTo(-5, this.compassRadius - 15);
        ctx.lineTo(5, this.compassRadius - 15);
        ctx.closePath();
        ctx.fill();
        
        // Center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Compass text
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 10px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('NAVIGATION', this.compassX, this.compassY + this.compassRadius + 20);
    }
    
    drawHolographicShip() {
        const ctx = this.ctx;
        const time = Date.now() * 0.001;
        
        ctx.save();
        ctx.translate(this.shipDisplayX, this.shipDisplayY);
        
        // Outer holographic ring with rotation
        ctx.save();
        ctx.rotate(this.shipRotation * 0.5);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, 55, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring counter-rotating
        ctx.rotate(-this.shipRotation * 1.5);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        // Hexagonal frame
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + this.hologramPulse * 0.3;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * 50;
            const y = Math.sin(angle) * 50;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Rotating ship with holographic layers
        ctx.save();
        ctx.rotate(this.shipRotation);
        ctx.scale(this.shipScale, this.shipScale);
        
        // Holographic ghost layers
        for (let i = 0; i < 4; i++) {
            ctx.globalAlpha = 0.15 - (i * 0.03);
            ctx.strokeStyle = `hsl(${180 + i * 20 + time * 30}, 100%, 50%)`;
            ctx.lineWidth = 2;
            
            const offset = i * 4;
            const size = 35 + offset;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(-size * 0.6, size * 0.5);
            ctx.lineTo(0, size * 0.3);
            ctx.lineTo(size * 0.6, size * 0.5);
            ctx.closePath();
            ctx.stroke();
        }
        
        // Main ship sprite
        ctx.globalAlpha = 0.85 + this.hologramPulse * 0.15;
        const spriteName = `player_${this.game.player.shipType || 'basic'}`;
        
        if (typeof assetManager !== 'undefined' && assetManager.isLoaded()) {
            const sprite = assetManager.getImage(spriteName);
            if (sprite) {
                // Glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00ffff';
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(sprite, -25, -25, 50, 50);
                ctx.shadowBlur = 0;
            }
        } else {
            // Fallback ship with glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.lineTo(-20, 15);
            ctx.lineTo(0, 10);
            ctx.lineTo(20, 15);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Energy trails
        ctx.globalAlpha = 0.4 + Math.sin(time * 5) * 0.2;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, 15);
        ctx.lineTo(-15, 25 + Math.sin(time * 8) * 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(15, 15);
        ctx.lineTo(15, 25 + Math.cos(time * 8) * 5);
        ctx.stroke();
        
        ctx.restore();
        
        // Advanced scan lines effect
        ctx.globalAlpha = 0.2 + Math.sin(time * 3) * 0.1;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        const scanOffset = (time * 50) % 10;
        for (let y = -50; y < 50; y += 3) {
            ctx.beginPath();
            ctx.moveTo(-50, y + scanOffset);
            ctx.lineTo(50, y + scanOffset);
            ctx.stroke();
        }
        
        // Data streams
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#00ff88';
        ctx.font = '6px "Courier New"';
        for (let i = 0; i < 4; i++) {
            const streamX = -45 + i * 30;
            const streamY = -40 + ((time * 100 + i * 50) % 100);
            ctx.fillText(Math.random() > 0.5 ? '1' : '0', streamX, streamY);
        }
        
        ctx.restore();
        
        // Enhanced HUD frame
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.strokeRect(this.shipDisplayX - 65, this.shipDisplayY - 65, 130, 130);
        
        // Corner brackets
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8 + this.hologramPulse * 0.2;
        const bracketSize = 10;
        const corners = [
            [-65, -65], [65, -65], [-65, 65], [65, 65]
        ];
        corners.forEach(([x, y]) => {
            const px = this.shipDisplayX + x;
            const py = this.shipDisplayY + y;
            ctx.beginPath();
            ctx.moveTo(px + (x < 0 ? bracketSize : -bracketSize), py);
            ctx.lineTo(px, py);
            ctx.lineTo(px, py + (y < 0 ? bracketSize : -bracketSize));
            ctx.stroke();
        });
        ctx.restore();
        
        // Ship info with glowing text
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 11px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('◆ ACTIVE SHIP ◆', this.shipDisplayX, this.shipDisplayY + 75);
        ctx.shadowBlur = 0;
        
        ctx.font = 'bold 9px "Courier New"';
        ctx.fillStyle = '#ff00ff';
        ctx.fillText((this.game.player.shipType || 'BASIC').toUpperCase(), this.shipDisplayX, this.shipDisplayY + 90);
        
        // Status indicators
        // Use player's actual health / maxHealth as damage meter (replaces legacy 'lives')
        const health = (this.game.player.health !== undefined && this.game.player.maxHealth !== undefined)
            ? (this.game.player.health / this.game.player.maxHealth)
            : 1;
        const healthColor = health > 0.6 ? '#00ff88' : health > 0.3 ? '#ffaa00' : '#ff0044';
        ctx.fillStyle = healthColor;
        ctx.font = '8px "Courier New"';
        ctx.fillText(`HP: ${Math.floor(health * 100)}%`, this.shipDisplayX, this.shipDisplayY + 102);
        
        // Draw active power-up icons orbiting the ship
        const activePowerUps = this.game.player.getActivePowerUps();
        if (activePowerUps.size > 0) {
            ctx.save();
            let angleOffset = 0;
            const angleStep = (Math.PI * 2) / activePowerUps.size;
            const orbitRadius = 65;
            
            for (const [type, timeLeft] of activePowerUps.entries()) {
                const angle = angleOffset + (time * 2);
                const x = this.shipDisplayX + Math.cos(angle) * orbitRadius;
                const y = this.shipDisplayY + Math.sin(angle) * orbitRadius;
                
                const powerUpInfo = this.getPowerUpInfo(type);
                
                // Icon background glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = powerUpInfo.color;
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = powerUpInfo.color + '40';
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // Icon
                ctx.shadowBlur = 10;
                ctx.globalAlpha = 1;
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = powerUpInfo.color;
                ctx.fillText(powerUpInfo.icon, x, y);
                
                angleOffset += angleStep;
            }
            
            ctx.shadowBlur = 0;
            ctx.textBaseline = 'alphabetic';
            ctx.restore();
        }
    }
    
    drawSupportFighters() {
        this.supportFighters.forEach(fighter => fighter.draw(this.ctx));
        
        // Draw support count indicator
        if (this.supportFighters.length > 0) {
            const ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
            ctx.font = 'bold 12px "Courier New"';
            ctx.textAlign = 'left';
            ctx.fillText(`SUPPORT ACTIVE: ${this.supportFighters.length}`, 10, this.canvas.height - 10);
            ctx.restore();
        }
    }
    
    drawDailyChallenges() {
        if (!this.dailyChallengeManager) return;
        
        const challenges = this.dailyChallengeManager.getActiveChallenges ?
            this.dailyChallengeManager.getActiveChallenges() : [];
        
        if (challenges.length === 0) return;
        
        const ctx = this.ctx;
        const x = 10;
        let y = this.dailyChallengeY;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, 250, 25 + (challenges.length * 30));
        
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 250, 25 + (challenges.length * 30));
        
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 12px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText('📅 DAILY CHALLENGES', x + 10, y + 17);
        
        y += 30;
        ctx.font = '10px "Courier New"';
        
        challenges.forEach((challenge, index) => {
            const progress = challenge.progress || 0;
            const target = challenge.target || 100;
            const percent = Math.min(100, (progress / target) * 100);
            
            // Challenge text
            ctx.fillStyle = challenge.completed ? '#00ff88' : '#ffffff';
            ctx.fillText(`${challenge.description}`, x + 10, y + (index * 30));
            
            // Progress bar
            const barWidth = 230;
            const barHeight = 8;
            const barY = y + (index * 30) + 5;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x + 10, barY, barWidth, barHeight);
            
            ctx.fillStyle = challenge.completed ? '#00ff88' : '#ffaa00';
            ctx.fillRect(x + 10, barY, (barWidth * percent) / 100, barHeight);
            
            // Progress text
            ctx.font = '8px "Courier New"';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${progress}/${target}`, x + barWidth - 30, barY + 6);
            ctx.font = '10px "Courier New"';
        });
        
        ctx.restore();
    }
    
    drawAchievements() {
        if (this.achievementQueue.length === 0 || this.achievementAlpha === 0) return;
        
        const achievement = this.achievementQueue[0];
        const ctx = this.ctx;
        const x = this.canvas.width / 2;
        const y = 100;
        
        ctx.save();
        ctx.globalAlpha = this.achievementAlpha;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(x - 200, y - 40, 400, 80);
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 200, y - 40, 400, 80);
        
        // Title
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 ACHIEVEMENT UNLOCKED!', x, y - 15);
        
        // Achievement name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Courier New"';
        ctx.fillText(achievement.name, x, y + 10);
        
        // Description
        ctx.font = '11px "Courier New"';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(achievement.description, x, y + 28);
        
        ctx.restore();
    }
    
    drawActivePowerUps() {
        const activePowerUps = this.game.player.getActivePowerUps();
        if (activePowerUps.size === 0) return;
        
        const ctx = this.ctx;
        const time = Date.now() * 0.001;
        const startX = this.canvas.width - 190;
        const startY = this.compassY + this.compassRadius + 60;
        const panelWidth = 180;
        const panelHeight = 40 + (activePowerUps.size * 35);
        
        ctx.save();
        
        // Glowing background with gradient
        const gradient = ctx.createLinearGradient(startX - 10, startY - 30, startX - 10, startY - 30 + panelHeight);
        gradient.addColorStop(0, 'rgba(20, 0, 40, 0.85)');
        gradient.addColorStop(1, 'rgba(40, 0, 60, 0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(startX - 10, startY - 30, panelWidth, panelHeight);
        
        // Animated border
        ctx.strokeStyle = `hsl(${280 + Math.sin(time * 2) * 20}, 100%, 50%)`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00ff';
        ctx.strokeRect(startX - 10, startY - 30, panelWidth, panelHeight);
        ctx.shadowBlur = 0;
        
        // Corner accents
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8 + Math.sin(time * 3) * 0.2;
        const accentSize = 8;
        [[startX - 10, startY - 30], [startX - 10 + panelWidth, startY - 30],
         [startX - 10, startY - 30 + panelHeight], [startX - 10 + panelWidth, startY - 30 + panelHeight]].forEach(([x, y], i) => {
            ctx.beginPath();
            if (i === 0 || i === 2) {
                ctx.moveTo(x + accentSize, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y + (i === 0 ? accentSize : -accentSize));
            } else {
                ctx.moveTo(x - accentSize, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y + (i === 1 ? accentSize : -accentSize));
            }
            ctx.stroke();
        });
        ctx.globalAlpha = 1;
        
        // Title with glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 12px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText('⚡ POWER-UPS ACTIVE ⚡', startX, startY - 5);
        ctx.shadowBlur = 0;
        
        // Power-ups list with enhanced visuals
        let index = 0;
        for (const [type, timeLeft] of activePowerUps.entries()) {
            const y = startY + 25 + (index * 35);
            const seconds = Math.ceil(timeLeft / 60);
            const progress = timeLeft / (10 * 60); // Assuming 10s default duration
            
            // Power-up background bar
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(startX, y - 15, panelWidth - 20, 28);
            
            // Progress bar
            const powerUpInfo = this.getPowerUpInfo(type);
            const barGradient = ctx.createLinearGradient(startX, y - 15, startX + (panelWidth - 20) * progress, y - 15);
            barGradient.addColorStop(0, powerUpInfo.color + '60');
            barGradient.addColorStop(1, powerUpInfo.color + '20');
            ctx.fillStyle = barGradient;
            ctx.fillRect(startX, y - 15, (panelWidth - 20) * progress, 28);
            
            // Border for power-up item
            ctx.strokeStyle = powerUpInfo.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.6 + Math.sin(time * 5 + index) * 0.2;
            ctx.strokeRect(startX, y - 15, panelWidth - 20, 28);
            ctx.globalAlpha = 1;
            
            // Icon with glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = powerUpInfo.color;
            ctx.font = 'bold 14px "Courier New"';
            ctx.fillStyle = powerUpInfo.color;
            ctx.fillText(powerUpInfo.icon, startX + 5, y + 3);
            ctx.shadowBlur = 0;
            
            // Power-up name
            ctx.font = 'bold 9px "Courier New"';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(powerUpInfo.name, startX + 25, y + 3);
            
            // Timer with warning effect
            const timerColor = seconds <= 3 ? '#ff0044' : seconds <= 5 ? '#ffaa00' : '#00ff88';
            ctx.fillStyle = timerColor;
            ctx.font = 'bold 10px "Courier New"';
            ctx.textAlign = 'right';
            if (seconds <= 3) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ff0044';
                const scale = 1 + Math.sin(time * 10) * 0.1;
                ctx.save();
                ctx.translate(startX + panelWidth - 25, y + 3);
                ctx.scale(scale, scale);
                ctx.fillText(`${seconds}s`, 0, 0);
                ctx.restore();
                ctx.shadowBlur = 0;
            } else {
                ctx.fillText(`${seconds}s`, startX + panelWidth - 25, y + 3);
            }
            ctx.textAlign = 'left';
            
            index++;
        }
        
        ctx.restore();
    }
    
    getPowerUpInfo(type) {
        const info = {
            'rapidFire': { icon: '🔥', name: 'RAPID FIRE', color: '#ff4400' },
            'multiShot': { icon: '💥', name: 'MULTI SHOT', color: '#ff8800' },
            'shield': { icon: '🛡️', name: 'SHIELD', color: '#0088ff' },
            'speedBoost': { icon: '⚡', name: 'SPEED BOOST', color: '#ffff00' },
            'scoreMultiplier': { icon: '⭐', name: '2X SCORE', color: '#ffd700' }
        };
        return info[type] || { icon: '●', name: type.toUpperCase(), color: '#ffffff' };
    }
    
    showAchievement(achievement) {
        this.achievementQueue.push(achievement);
    }
    
    getSupportFighters() {
        return this.supportFighters;
    }
}
