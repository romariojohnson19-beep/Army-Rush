class Enemy {
    constructor(x, y, type = 'basic', wave = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.wave = wave;
        this.width = 80; // Increased from 40 (doubled)
        this.height = 80; // Increased from 40 (doubled)
        this.health = 1;
        this.speed = 1;
        this.shootCooldown = 0;
        this.maxShootCooldown = 180; // 3 seconds at 60fps
        
        // Movement pattern properties
        this.movePattern = 'straight';
        this.patternTimer = 0;
        this.originalX = x;
        this.zigzagAmplitude = 0;
        this.zigzagFrequency = 0;
        this.formationOffset = { x: 0, y: 0 };
        this.targetX = x;
        this.attackPhase = 0;
        this.burstCooldown = 0;
        this.alpha = 1; // For transparency effects
        
        // Set properties based on enemy type
        this.setupEnemyProperties();
        this.scaleWithWave(wave);
    }

    setupEnemyProperties() {
        switch(this.type) {
            case 'basic':
                this.color = '#ff4444';
                this.speed = 1;
                this.health = 1;
                this.points = 10;
                this.movePattern = 'straight';
                break;
            case 'fast':
                this.color = '#ff8844';
                this.speed = 2;
                this.health = 1;
                this.points = 20;
                this.width = 25;
                this.height = 25;
                this.movePattern = 'zigzag';
                this.zigzagAmplitude = 30;
                this.zigzagFrequency = 0.05;
                break;
            case 'tank':
                this.color = '#884444';
                this.speed = 0.5;
                this.health = 3;
                this.points = 50;
                this.width = 40;
                this.height = 40;
                this.movePattern = 'straight';
                break;
            case 'sniper':
                this.color = '#8844ff';
                this.speed = 0.8;
                this.health = 2;
                this.points = 30;
                this.width = 28;
                this.height = 35;
                this.maxShootCooldown = 90;
                this.movePattern = 'stop_and_shoot';
                break;
            case 'bomber':
                this.color = '#ff4488';
                this.speed = 1.5;
                this.health = 2;
                this.points = 40;
                this.width = 35;
                this.height = 28;
                this.movePattern = 'dive';
                this.burstCooldown = 120;
                break;
            case 'swarm':
                this.color = '#44ff88';
                this.speed = 2.5;
                this.health = 1;
                this.points = 15;
                this.width = 20;
                this.height = 20;
                this.movePattern = 'swarm';
                this.maxShootCooldown = 240;
                break;
            case 'heavy':
                this.color = '#666644';
                this.speed = 0.3;
                this.health = 5;
                this.points = 80;
                this.width = 50;
                this.height = 45;
                this.movePattern = 'straight';
                this.maxShootCooldown = 60;
                break;
            // New regular enemy types (adding 4 more for total of 11)
            case 'stealth':
                this.color = '#444488';
                this.speed = 1.8;
                this.health = 2;
                this.points = 35;
                this.width = 30;
                this.height = 25;
                this.movePattern = 'stealth';
                this.maxShootCooldown = 150;
                this.stealthTime = 0;
                break;
            case 'guardian':
                this.color = '#88ff44';
                this.speed = 0.6;
                this.health = 4;
                this.points = 60;
                this.width = 45;
                this.height = 40;
                this.movePattern = 'shield';
                this.maxShootCooldown = 100;
                this.shieldActive = true;
                break;
            case 'assassin':
                this.color = '#ff8844';
                this.speed = 3;
                this.health = 1;
                this.points = 25;
                this.width = 22;
                this.height = 22;
                this.movePattern = 'assassin';
                this.maxShootCooldown = 200;
                break;
            case 'splitter':
                this.color = '#ff44ff';
                this.speed = 1.2;
                this.health = 2;
                this.points = 45;
                this.width = 35;
                this.height = 30;
                this.movePattern = 'straight';
                this.canSplit = true;
                break;
            
            // Mini-boss types (6 types)
            case 'miniboss_destroyer':
                this.color = '#aa4444';
                this.speed = 1.2;
                this.health = 8;
                this.points = 120;
                this.width = 55;
                this.height = 50;
                this.movePattern = 'boss_aggressive';
                this.maxShootCooldown = 45;
                this.isBoss = true;
                break;
            case 'miniboss_carrier':
                this.color = '#44aa44';
                this.speed = 0.8;
                this.health = 10;
                this.points = 150;
                this.width = 60;
                this.height = 45;
                this.movePattern = 'boss_tactical';
                this.maxShootCooldown = 120;
                this.spawnTimer = 0;
                this.isBoss = true;
                break;
            case 'miniboss_fortress':
                this.color = '#4444aa';
                this.speed = 0.5;
                this.health = 12;
                this.points = 180;
                this.width = 65;
                this.height = 55;
                this.movePattern = 'boss_stalking';
                this.maxShootCooldown = 30;
                this.isBoss = true;
                break;
            case 'miniboss_hunter':
                this.color = '#aa44aa';
                this.speed = 1.5;
                this.health = 6;
                this.points = 100;
                this.width = 50;
                this.height = 40;
                this.movePattern = 'boss_stalking';
                this.maxShootCooldown = 60;
                this.isBoss = true;
                break;
            case 'miniboss_phantom':
                this.color = '#888888';
                this.speed = 1.8;
                this.health = 7;
                this.points = 110;
                this.width = 48;
                this.height = 42;
                this.movePattern = 'boss_circling';
                this.maxShootCooldown = 80;
                this.phaseTimer = 0;
                this.isBoss = true;
                break;
            case 'miniboss_berserker':
                this.color = '#ff6600';
                this.speed = 2.2;
                this.health = 5;
                this.points = 90;
                this.width = 45;
                this.height = 45;
                this.movePattern = 'boss_aggressive';
                this.maxShootCooldown = 25;
                this.rageMode = false;
                this.isBoss = true;
                break;
            case 'miniboss_inferno':
                this.color = '#ff4400';
                this.speed = 1.8;
                this.health = 8;
                this.points = 120;
                this.width = 50;
                this.height = 40;
                this.movePattern = 'boss_aggressive';
                this.maxShootCooldown = 20;
                this.burstMode = false;
                this.isBoss = true;
                break;
            case 'miniboss_kraken':
                this.color = '#0088cc';
                this.speed = 1.5;
                this.health = 12;
                this.points = 150;
                this.width = 55;
                this.height = 50;
                this.movePattern = 'boss_circling';
                this.maxShootCooldown = 35;
                this.tentacleAttack = 0;
                this.isBoss = true;
                break;
            case 'miniboss_ironclad':
                this.color = '#444444';
                this.speed = 0.8;
                this.health = 18;
                this.points = 200;
                this.width = 60;
                this.height = 45;
                this.movePattern = 'boss_tactical';
                this.maxShootCooldown = 15;
                this.shieldActive = false;
                this.isBoss = true;
                break;
            case 'miniboss_venom':
                this.color = '#44cc44';
                this.speed = 1.3;
                this.health = 10;
                this.points = 140;
                this.width = 52;
                this.height = 48;
                this.movePattern = 'boss_stalking';
                this.maxShootCooldown = 30;
                this.poisonTimer = 0;
                this.isBoss = true;
                break;
                
            // Mega-boss types (9 types)
            case 'megaboss_dreadnought':
                this.color = '#cc0000';
                this.speed = 1.0;
                this.health = 25;
                this.points = 500;
                this.width = 90;
                this.height = 70;
                this.movePattern = 'boss_aggressive';
                this.maxShootCooldown = 20;
                this.attackPhase = 0;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
            case 'megaboss_mothership':
                this.color = '#00cc00';
                this.speed = 0.4;
                this.health = 30;
                this.points = 600;
                this.width = 100;
                this.height = 80;
                this.movePattern = 'mothership';
                this.maxShootCooldown = 15;
                this.spawnTimer = 0;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
            case 'megaboss_leviathan':
                this.color = '#0000cc';
                this.speed = 1.2;
                this.health = 20;
                this.points = 450;
                this.width = 85;
                this.height = 75;
                this.movePattern = 'boss_circling';
                this.maxShootCooldown = 25;
                this.dashTimer = 0;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
            case 'megaboss_overlord':
                this.color = '#cc00cc';
                this.speed = 0.8;
                this.health = 35;
                this.points = 700;
                this.width = 95;
                this.height = 85;
                this.movePattern = 'boss_tactical';
                this.maxShootCooldown = 10;
                this.shieldTime = 300;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
            case 'megaboss_titan':
                this.color = '#cccc00';
                this.speed = 0.6;
                this.health = 40;
                this.points = 800;
                this.width = 110;
                this.height = 90;
                this.movePattern = 'boss_stalking';
                this.maxShootCooldown = 30;
                this.smashTimer = 0;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
            case 'megaboss_vortex':
                this.color = '#00cccc';
                this.speed = 1.0;
                this.health = 18;
                this.points = 400;
                this.width = 80;
                this.height = 80;
                this.movePattern = 'vortex';
                this.maxShootCooldown = 35;
                this.spinTimer = 0;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
            case 'megaboss_nemesis':
                this.color = '#cc6600';
                this.speed = 1.2;
                this.health = 22;
                this.points = 550;
                this.width = 75;
                this.height = 65;
                this.movePattern = 'nemesis';
                this.maxShootCooldown = 18;
                this.teleportTimer = 0;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
            case 'megaboss_apocalypse':
                this.color = '#666666';
                this.speed = 0.7;
                this.health = 28;
                this.points = 650;
                this.width = 88;
                this.height = 78;
                this.movePattern = 'apocalypse';
                this.maxShootCooldown = 12;
                this.waveTimer = 0;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
            case 'megaboss_infinity':
                this.color = '#ff00ff';
                this.speed = 0.9;
                this.health = 50;
                this.points = 1000;
                this.width = 120;
                this.height = 100;
                this.movePattern = 'infinity';
                this.maxShootCooldown = 8;
                this.formationTimer = 0;
                this.isBoss = true;
                this.isMegaBoss = true;
                break;
                
            // Original boss (now legacy)
            case 'boss':
                this.color = '#ff0044';
                this.speed = 0.4;
                this.health = 15;
                this.points = 200;
                this.width = 70;
                this.height = 60;
                this.movePattern = 'boss';
                this.maxShootCooldown = 30;
                this.attackPhase = 0;
                this.isBoss = true;
                break;
        }
        
        // Make bosses visually larger to be intimidating; mega-bosses are humongous
        if (this.isBoss) {
            const bossScale = this.isMegaBoss ? 1.6 : 1.25;
            this.width = Math.max(32, Math.floor(this.width * bossScale));
            this.height = Math.max(32, Math.floor(this.height * bossScale));
        }

        this.maxHealth = this.health;
    }

    scaleWithWave(wave) {
        // Increase health based on wave
        if (wave > 1) {
            this.health += Math.floor((wave - 1) * 0.5);
            this.maxHealth = this.health;
        }
        
        // Increase speed slightly
        if (wave > 3) {
            this.speed *= 1 + ((wave - 3) * 0.1);
        }
        
        // Increase points
        this.points = Math.floor(this.points * (1 + (wave - 1) * 0.2));
        
        // Decrease shooting cooldown for more aggressive enemies
        if (wave > 2) {
            this.maxShootCooldown = Math.max(30, this.maxShootCooldown - (wave - 2) * 10);
        }
    }

    applyDistanceScaling(distanceMultiplier, distanceKm) {
        // Additional health scaling based on distance
        const distanceHealthBonus = Math.floor(distanceKm / 10); // +1 HP every 10km
        this.health += distanceHealthBonus;
        this.maxHealth = this.health;
        
        // Speed increase based on distance
        this.speed *= (1 + (distanceKm * 0.02)); // 2% speed increase per km
        
        // More aggressive shooting at distance
        if (distanceKm > 5) {
            this.maxShootCooldown = Math.max(15, this.maxShootCooldown - (distanceKm * 2));
        }
        
        // Bonus points for distance difficulty
        this.points = Math.floor(this.points * distanceMultiplier);
    }

    update(playerX, playerY) {
        this.patternTimer++;
        
        // Boss AI - intelligent tracking and movement
        if (this.isBoss) {
            this.updateBossAI(playerX, playerY);
        } else {
            this.updateMovementPattern();
        }
        
        // Update shooting cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        
        // Update burst cooldown
        if (this.burstCooldown > 0) {
            this.burstCooldown--;
        }
    }

    updateBossAI(playerX, playerY) {
        if (!playerX || !playerY) {
            // If no player position provided, use regular movement
            this.updateMovementPattern();
            return;
        }

        // Calculate distance and angle to player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Boss behavior phases
        switch(this.movePattern) {
            case 'boss_aggressive':
                // Aggressive pursuit - move directly toward player
                const pursuitSpeed = this.speed * 0.8;
                this.x += Math.cos(angle) * pursuitSpeed * 0.3; // Slower horizontal tracking
                this.y += this.speed * 0.6; // Mainly move down
                
                // Keep within screen bounds
                this.x = Math.max(this.width/2, Math.min(800 - this.width/2, this.x));
                break;

            case 'boss_tactical':
                // Tactical movement - try to stay above and track player horizontally
                this.y += this.speed * 0.4; // Slow descent
                
                // Smooth horizontal tracking
                const targetX = playerX;
                const horizontalDiff = targetX - this.x;
                if (Math.abs(horizontalDiff) > 10) {
                    this.x += Math.sign(horizontalDiff) * Math.min(Math.abs(horizontalDiff) * 0.02, this.speed * 0.8);
                }
                
                // Keep within bounds
                this.x = Math.max(this.width/2, Math.min(800 - this.width/2, this.x));
                break;

            case 'boss_circling':
                // Circling pattern around player position
                this.y += this.speed * 0.3;
                const circleRadius = 120;
                const circleSpeed = 0.03;
                const centerX = playerX;
                const centerY = this.y - 80; // Stay above player
                
                this.x = centerX + Math.cos(this.patternTimer * circleSpeed) * circleRadius;
                // Constrain to screen bounds
                this.x = Math.max(this.width/2, Math.min(800 - this.width/2, this.x));
                break;

            case 'boss_stalking':
                // Stalking - maintain distance while tracking
                const optimalDistance = 150;
                
                if (distance > optimalDistance + 30) {
                    // Move closer
                    this.x += Math.cos(angle) * this.speed * 0.4;
                    this.y += Math.sin(angle) * this.speed * 0.4;
                } else if (distance < optimalDistance - 30) {
                    // Move away
                    this.x -= Math.cos(angle) * this.speed * 0.3;
                    this.y -= Math.sin(angle) * this.speed * 0.2;
                } else {
                    // Maintain position, slight tracking
                    this.x += Math.cos(angle) * this.speed * 0.1;
                    this.y += this.speed * 0.5;
                }
                
                // Keep within bounds
                this.x = Math.max(this.width/2, Math.min(800 - this.width/2, this.x));
                break;

            default:
                // Fallback to regular movement
                this.updateMovementPattern();
        }

        // Enhanced boss shooting logic
        if (this.canShoot() && distance < 400) {
            // Predict player movement for better accuracy
            const predictionFactor = distance / 300; // Further = more prediction
            const predictedX = playerX + (Math.random() - 0.5) * 40 * predictionFactor;
            const predictedY = playerY + (Math.random() - 0.5) * 20 * predictionFactor;
            
            // Calculate aimed angle
            const aimDx = predictedX - this.x;
            const aimDy = predictedY - this.y;
            this.aimedAngle = Math.atan2(aimDy, aimDx);
        }

        // Make bosses move more erratically than regular enemies
        // Mini-bosses get moderate jitter, mega-bosses are significantly more chaotic
        if (this.isBoss) {
            // Apply occasional horizontal jitter
            const jitterChance = this.isMegaBoss ? 0.45 : 0.25;
            const jitterAmt = this.isMegaBoss ? 8 : 3;
            if (Math.random() < jitterChance) {
                this.x += (Math.random() - 0.5) * jitterAmt * (1 + Math.sin(this.patternTimer * 0.08));
            }

            // Mega-boss vertical bursts for unpredictable movement
            if (this.isMegaBoss && Math.random() < 0.06) {
                this.y += (Math.random() - 0.5) * 12;
            }

            // Keep within screen bounds to avoid leaving visible area
            this.x = Math.max(this.width/2, Math.min(800 - this.width/2, this.x));
            this.y = Math.max(-this.height, Math.min(1200, this.y));
        }
    }

    updateMovementPattern() {
        switch(this.movePattern) {
            case 'straight':
                this.y += this.speed;
                break;
                
            case 'zigzag':
                this.y += this.speed;
                this.x = this.originalX + Math.sin(this.patternTimer * this.zigzagFrequency) * this.zigzagAmplitude;
                break;
                
            case 'stop_and_shoot':
                if (this.patternTimer % 120 < 60) {
                    this.y += this.speed * 0.3; // Move slowly
                } else {
                    // Stop and prepare to shoot
                    if (this.patternTimer % 120 === 60) {
                        this.shootCooldown = 0; // Force immediate shot
                    }
                }
                break;
                
            case 'dive':
                if (this.patternTimer < 60) {
                    this.y += this.speed * 0.5; // Slow approach
                } else if (this.patternTimer < 90) {
                    this.y += this.speed * 3; // Dive fast
                } else {
                    this.y += this.speed; // Normal speed
                }
                break;
                
            case 'swarm':
                this.y += this.speed;
                // Erratic movement
                if (this.patternTimer % 30 === 0) {
                    this.targetX = this.originalX + (Math.random() - 0.5) * 100;
                }
                this.x += (this.targetX - this.x) * 0.05;
                break;
                
            // New enemy movement patterns
            case 'stealth':
                this.y += this.speed;
                this.stealthTime++;
                if (this.stealthTime % 180 < 60) {
                    // Partially invisible phase
                    this.alpha = 0.3;
                    this.x += (Math.random() - 0.5) * 2; // Slight jitter
                } else {
                    this.alpha = 1;
                }
                break;
                
            case 'shield':
                this.y += this.speed;
                // Defensive positioning - try to stay behind other enemies
                if (this.patternTimer % 60 === 0 && Math.random() < 0.3) {
                    this.speed *= 0.5; // Slow down occasionally
                }
                break;
                
            case 'assassin':
                // Fast, erratic movement targeting player
                if (this.patternTimer < 120) {
                    this.y += this.speed * 0.7;
                    this.x += (Math.random() - 0.5) * 4;
                } else {
                    // Sudden rush toward player
                    const playerX = 400; // Will be passed from game logic
                    this.x += (playerX - this.x) * 0.08;
                    this.y += this.speed * 2;
                }
                break;
                
            // Mini-boss patterns
            case 'aggressive':
                this.y += this.speed;
                if (this.patternTimer > 120) {
                    // Move toward player aggressively
                    const playerX = 400;
                    this.x += (playerX - this.x) * 0.03;
                }
                break;
                
            case 'carrier':
                if (this.patternTimer < 200) {
                    this.y += this.speed * 0.8;
                } else {
                    // Hover and deploy
                    this.y += Math.sin(this.patternTimer * 0.02) * 0.5;
                    this.x += Math.cos(this.patternTimer * 0.015) * 0.8;
                }
                break;
                
            case 'fortress':
                this.y += this.speed * 0.6; // Slow, steady advance
                this.x = this.originalX + Math.sin(this.patternTimer * 0.01) * 30;
                break;
                
            case 'hunter':
                // Stalking movement
                if (this.patternTimer < 150) {
                    this.y += this.speed * 0.5;
                } else {
                    const playerX = 400;
                    this.x += (playerX - this.x) * 0.06;
                    this.y += this.speed * 1.5;
                }
                break;
                
            case 'phantom':
                this.y += this.speed;
                this.phaseTimer++;
                if (this.phaseTimer % 150 < 50) {
                    // Phase out
                    this.alpha = 0.4;
                    this.x += (Math.random() - 0.5) * 6;
                } else {
                    this.alpha = 1;
                }
                break;
                
            case 'berserker':
                if (this.health < this.maxHealth * 0.5 && !this.rageMode) {
                    this.rageMode = true;
                    this.speed *= 2;
                    this.maxShootCooldown *= 0.5;
                }
                this.y += this.speed;
                if (this.rageMode) {
                    this.x += (Math.random() - 0.5) * 3;
                }
                break;
                
            // Mega-boss patterns
            case 'dreadnought':
                if (this.patternTimer < 240) {
                    this.y += this.speed;
                } else {
                    this.x += Math.sin(this.patternTimer * 0.01) * 2;
                    this.y += Math.sin(this.patternTimer * 0.008) * 0.5;
                }
                break;
                
            case 'mothership':
                if (this.patternTimer < 300) {
                    this.y += this.speed * 0.7;
                } else {
                    // Hovering deployment pattern
                    this.y += Math.sin(this.patternTimer * 0.015) * 0.8;
                    this.x = this.originalX + Math.cos(this.patternTimer * 0.01) * 100;
                }
                break;
                
            case 'leviathan':
                this.dashTimer++;
                
                // Fly-off-screen pattern: every 500 frames (8.3 seconds at 60fps)
                const cyclePhase = this.dashTimer % 500;
                
                if (cyclePhase < 50) {
                    // Prepare to fly off - slow down
                    this.y += this.speed * 0.3;
                } else if (cyclePhase < 100) {
                    // Fly off screen - rocket upward
                    this.y -= this.speed * 8;
                    this.alpha = Math.max(0.3, 1 - (cyclePhase - 50) / 50);
                } else if (cyclePhase < 200) {
                    // Off-screen phase - stay hidden above screen
                    this.y = -this.height - 50;
                    this.alpha = 0;
                    // Reposition to different x location for dramatic re-entry
                    if (cyclePhase === 100) {
                        this.x = 150 + Math.random() * 500; // Random x position
                    }
                } else if (cyclePhase < 250) {
                    // Dramatic re-entry - dive back down
                    this.y += this.speed * 6;
                    this.alpha = (cyclePhase - 200) / 50;
                } else if (cyclePhase < 300) {
                    // Charging dash attack after re-entry
                    this.y += this.speed * 3;
                    this.x += (Math.random() - 0.5) * 3;
                    this.alpha = 1;
                } else {
                    // Normal movement phase
                    this.y += this.speed * 0.8;
                    this.x += Math.sin(this.patternTimer * 0.02) * 2;
                    this.alpha = 1;
                }
                break;
                
            case 'overlord':
                if (this.patternTimer < 200) {
                    this.y += this.speed;
                } else {
                    // Commanding position with shield pulses
                    this.y += Math.sin(this.patternTimer * 0.02) * 0.6;
                    this.x = this.originalX + Math.sin(this.patternTimer * 0.012) * 80;
                }
                break;
                
            case 'titan':
                this.smashTimer++;
                if (this.smashTimer % 300 < 60) {
                    // Preparing smash attack
                    this.y += this.speed * 0.3;
                } else if (this.smashTimer % 300 < 90) {
                    // Smash down
                    this.y += this.speed * 4;
                } else {
                    this.y += this.speed * 0.8;
                }
                break;
                
            case 'vortex':
                this.spinTimer++;
                const radius = 60;
                this.x = this.originalX + Math.cos(this.spinTimer * 0.05) * radius;
                this.y += this.speed + Math.sin(this.spinTimer * 0.05) * 2;
                break;
                
            case 'nemesis':
                this.teleportTimer++;
                if (this.teleportTimer % 180 < 10) {
                    // Teleporting
                    this.alpha = 0.3;
                    this.x += (Math.random() - 0.5) * 20;
                } else {
                    this.alpha = 1;
                    this.y += this.speed;
                    const playerX = 400;
                    this.x += (playerX - this.x) * 0.04;
                }
                break;
                
            case 'apocalypse':
                this.waveTimer++;
                this.y += this.speed * 0.9;
                // Creates wave patterns
                this.x = this.originalX + Math.sin(this.waveTimer * 0.03) * 120;
                break;
                
            case 'infinity':
                this.formationTimer++;
                const angle = this.formationTimer * 0.02;
                this.x = this.originalX + Math.cos(angle) * 150 + Math.sin(angle * 2) * 50;
                this.y += this.speed * 0.6 + Math.sin(angle) * 1;
                break;
                
            case 'boss':
                // Original boss movement pattern
                if (this.patternTimer < 180) {
                    this.y += this.speed; // Enter screen
                } else {
                    // Side to side movement
                    const centerX = 400; // Assume canvas width / 2
                    this.x = centerX + Math.sin(this.patternTimer * 0.02) * 150;
                    
                    // Change attack phases
                    if (this.patternTimer % 300 === 0) {
                        this.attackPhase = (this.attackPhase + 1) % 3;
                    }
                }
                break;
                
            default:
                this.y += this.speed;
        }
    }

    draw(ctx) {
        // Save context for alpha blending
        ctx.save();
        ctx.globalAlpha = this.alpha || 1;
        
        // Enhanced visual design based on enemy type
        const healthRatio = this.health / this.maxHealth;
        const baseColor = this.color;
        
        // Parse base color for modifications
        let r, g, b;
        if (baseColor.startsWith('#')) {
            r = parseInt(baseColor.substr(1, 2), 16);
            g = parseInt(baseColor.substr(3, 2), 16);
            b = parseInt(baseColor.substr(5, 2), 16);
        } else {
            r = 255; g = 0; b = 0; // fallback
        }
        
        // Modify colors based on health
        r = Math.floor(r * (0.5 + healthRatio * 0.5));
        g = Math.floor(g * (0.5 + healthRatio * 0.5));
        b = Math.floor(b * (0.5 + healthRatio * 0.5));
        
        const bodyColor = `rgb(${r}, ${g}, ${b})`;
        
        // Draw body based on enemy type
        this.drawEnemyBody(ctx, bodyColor);
        
        // Draw special effects for bosses
        if (this.isBoss) {
            this.drawBossEffects(ctx);
        }
        
        // Draw health bar for damaged enemies
        if (this.health < this.maxHealth && this.health > 0) {
            this.drawHealthBar(ctx);
        }
        
        // Draw hit counter for enemies with more than 1 health
        if (this.maxHealth > 1) {
            this.drawHitCounter(ctx);
        }
        
        ctx.restore();
    }

    drawEnemyBody(ctx, bodyColor) {
        // Try to draw sprite first, fallback to shapes if not available
        // Boss types (miniboss_*, megaboss_*) don't need "enemy_" prefix
        const spriteName = (this.type.startsWith('miniboss_') || this.type.startsWith('megaboss_')) 
            ? this.type 
            : `enemy_${this.type}`;
        const spriteDrawn = this.drawEnemySprite(ctx, spriteName);
        
        if (!spriteDrawn) {
            this.drawEnemyFallback(ctx, bodyColor);
        }
    }

    drawEnemySprite(ctx, spriteName) {
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

    drawEnemyFallback(ctx, bodyColor) {
        ctx.fillStyle = bodyColor;
        
        // Main body shape based on size
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        // Outline
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.isBoss ? 3 : 2;
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        // Type-specific details
        ctx.fillStyle = '#ffffff';
        switch(this.type) {
            case 'basic':
                ctx.fillRect(this.x - 4, this.y - 6, 8, 3);
                ctx.fillRect(this.x - 2, this.y + 3, 4, 3);
                break;
                
            case 'fast':
                // Aerodynamic design
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - 8);
                ctx.lineTo(this.x - 6, this.y + 4);
                ctx.lineTo(this.x + 6, this.y + 4);
                ctx.closePath();
                ctx.fill();
                // Engine trails
                ctx.fillStyle = '#00aaff';
                ctx.fillRect(this.x - 3, this.y + 8, 2, 6);
                ctx.fillRect(this.x + 1, this.y + 8, 2, 6);
                break;
                
            case 'tank':
                // Heavy armor plates
                ctx.fillRect(this.x - 6, this.y - 8, 12, 4);
                ctx.fillRect(this.x - 4, this.y - 4, 8, 8);
                ctx.fillRect(this.x - 2, this.y + 4, 4, 6);
                // Gun barrel
                ctx.fillStyle = '#aaaaaa';
                ctx.fillRect(this.x - 1, this.y - 12, 2, 8);
                break;
                
            case 'sniper':
                // Long-range configuration
                ctx.fillRect(this.x - 1, this.y - 14, 2, 10);
                ctx.fillRect(this.x - 6, this.y - 4, 12, 2);
                // Scope glint
                if (this.shootCooldown <= 30) {
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(this.x - 1, this.y - 14, 2, 2);
                }
                break;
                
            case 'bomber':
                // Wing-mounted design
                ctx.fillRect(this.x - 14, this.y - 2, 28, 3);
                ctx.fillRect(this.x - 4, this.y + 4, 8, 4);
                // Engine glow
                ctx.fillStyle = '#ff6600';
                ctx.fillRect(this.x - 10, this.y + 8, 3, 4);
                ctx.fillRect(this.x + 7, this.y + 8, 3, 4);
                break;
                
            case 'swarm':
                // Insect-like design
                ctx.fillRect(this.x - 3, this.y - 3, 6, 2);
                ctx.fillRect(this.x - 1, this.y - 5, 2, 6);
                // Animated wings
                if (Math.floor(this.patternTimer / 3) % 2) {
                    ctx.fillStyle = '#66ffaa';
                    ctx.fillRect(this.x - 7, this.y - 1, 5, 1);
                    ctx.fillRect(this.x + 2, this.y - 1, 5, 1);
                }
                break;
                
            case 'heavy':
                // Massive fortress design
                ctx.fillRect(this.x - 12, this.y - 10, 24, 6);
                ctx.fillRect(this.x - 8, this.y - 4, 16, 12);
                ctx.fillRect(this.x - 6, this.y + 8, 12, 8);
                // Multiple gun barrels
                ctx.fillStyle = '#999999';
                ctx.fillRect(this.x - 14, this.y - 6, 6, 2);
                ctx.fillRect(this.x + 8, this.y - 6, 6, 2);
                ctx.fillRect(this.x - 2, this.y - 14, 4, 8);
                break;
                
            // New enemy types
            case 'stealth':
                ctx.fillRect(this.x - 5, this.y - 4, 10, 2);
                ctx.fillRect(this.x - 3, this.y - 2, 6, 6);
                // Stealth shimmer effect
                if (this.alpha < 1) {
                    ctx.fillStyle = '#4444aa';
                    ctx.fillRect(this.x - 2, this.y, 4, 1);
                }
                break;
                
            case 'guardian':
                ctx.fillRect(this.x - 8, this.y - 6, 16, 4);
                ctx.fillRect(this.x - 6, this.y - 2, 12, 8);
                // Shield indicator
                if (this.shieldActive) {
                    ctx.strokeStyle = '#88ff44';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(this.x - 12, this.y - 8, 24, 16);
                }
                break;
                
            case 'assassin':
                // Sleek, blade-like design
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - 10);
                ctx.lineTo(this.x - 4, this.y + 2);
                ctx.lineTo(this.x - 2, this.y + 8);
                ctx.lineTo(this.x + 2, this.y + 8);
                ctx.lineTo(this.x + 4, this.y + 2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'splitter':
                ctx.fillRect(this.x - 6, this.y - 5, 12, 3);
                ctx.fillRect(this.x - 4, this.y - 2, 8, 6);
                // Split indicators
                ctx.fillStyle = '#ff44ff';
                ctx.fillRect(this.x - 7, this.y, 3, 2);
                ctx.fillRect(this.x + 4, this.y, 3, 2);
                break;
                
            default:
                // Default design
                ctx.fillRect(this.x - 4, this.y - 4, 8, 2);
                ctx.fillRect(this.x - 2, this.y - 2, 4, 6);
        }
    }

    drawBossEffects(ctx) {
        if (!this.isMegaBoss) return;
        
        // Mega boss aura effects
        const time = this.patternTimer * 0.05;
        const radius = this.width / 2 + 10;
        
        // Pulsing aura
        ctx.strokeStyle = `rgba(255, 255, 0, ${0.3 + Math.sin(time) * 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius + Math.sin(time * 2) * 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Energy crackling
        for (let i = 0; i < 4; i++) {
            const angle = time + i * Math.PI / 2;
            const x1 = this.x + Math.cos(angle) * radius;
            const y1 = this.y + Math.sin(angle) * radius;
            const x2 = this.x + Math.cos(angle + 0.2) * (radius + 8);
            const y2 = this.y + Math.sin(angle + 0.2) * (radius + 8);
            
            ctx.strokeStyle = `rgba(0, 255, 255, ${Math.random() * 0.8})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    drawHealthBar(ctx) {
        if (this.maxHealth <= 1) return;
        
        const healthRatio = this.health / this.maxHealth;
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.height / 2 - 8;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : healthRatio > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
    }

    drawHitCounter(ctx) {
        // Only show hit counter for enemies with more than 1 health
        if (this.maxHealth <= 1) return;
        
        // Set up text properties
        ctx.save();
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Create hit counter text (current/max health)
        const hitText = `${this.health}/${this.maxHealth}`;
        
        // Position above the enemy
        const textX = this.x;
        const textY = this.y - this.height / 2 - 18;
        
        // Draw text background for better visibility
        const textMetrics = ctx.measureText(hitText);
        const textWidth = textMetrics.width + 6;
        const textHeight = 16;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(textX - textWidth / 2, textY - textHeight / 2, textWidth, textHeight);
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(textX - textWidth / 2, textY - textHeight / 2, textWidth, textHeight);
        
        // Draw the hit counter text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(hitText, textX, textY);
        
        ctx.restore();
    }

    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
    }

    canShoot() {
        return this.shootCooldown <= 0;
    }

    shoot() {
        this.shootCooldown = this.maxShootCooldown;
        
        // Boss aiming system with weapon variation
        if (this.isBoss && this.aimedAngle !== undefined) {
            const speed = 4 + (this.isMegaBoss ? 2 : 1);
            const vx = Math.cos(this.aimedAngle) * speed;
            const vy = Math.sin(this.aimedAngle) * speed;
            
            // Mega bosses use lasers 40% of the time
            const weaponType = this.isMegaBoss && Math.random() < 0.4 ? 'laser' : 'bullet';
            return Projectile.create(this.x, this.y + this.height / 2, speed, false, 1, vx, vy, {weaponType});
        }
        
        switch(this.type) {
            case 'basic':
            case 'fast':
            case 'tank':
                return Projectile.create(this.x, this.y + this.height / 2, 3, false, 1, 0, null, {weaponType: 'bullet'});
                
            case 'sniper':
                // Snipers use lasers - faster, longer range
                return Projectile.create(this.x, this.y + this.height / 2, 8, false, 1, 0, null, {weaponType: 'laser'});
                
            case 'bomber':
                // Burst fire with bullets
                if (this.burstCooldown <= 0) {
                    this.burstCooldown = 180;
                    return [
                        Projectile.create(this.x - 8, this.y + this.height / 2, 4, false, 1, 0, null, {weaponType: 'bullet'}),
                        Projectile.create(this.x, this.y + this.height / 2, 4, false, 1, 0, null, {weaponType: 'bullet'}),
                        Projectile.create(this.x + 8, this.y + this.height / 2, 4, false, 1, 0, null, {weaponType: 'bullet'})
                    ];
                }
                return null;
                
            case 'swarm':
                // Occasional shots
                return Math.random() < 0.3 ? Projectile.create(this.x, this.y + this.height / 2, 2, false, 1, 0, null, {weaponType: 'bullet'}) : null;
                
            case 'heavy':
                // Twin cannon shots - mix of bullets and lasers
                const leftWeapon = Math.random() < 0.3 ? 'laser' : 'bullet';
                const rightWeapon = Math.random() < 0.3 ? 'laser' : 'bullet';
                return [
                    Projectile.create(this.x - 12, this.y + this.height / 2, leftWeapon === 'laser' ? 6 : 2.5, false, 1, 0, null, {weaponType: leftWeapon}),
                    Projectile.create(this.x + 12, this.y + this.height / 2, rightWeapon === 'laser' ? 6 : 2.5, false, 1, 0, null, {weaponType: rightWeapon})
                ];
                
            // Mini-boss weapons
            case 'miniboss_destroyer':
            case 'miniboss_fortress':
            case 'miniboss_hunter':
                // Mini-bosses use lasers 50% of the time
                const miniWeapon = Math.random() < 0.5 ? 'laser' : 'bullet';
                const miniSpeed = miniWeapon === 'laser' ? 7 : 4;
                return Projectile.create(this.x, this.y + this.height / 2, miniSpeed, false, 1, 0, null, {weaponType: miniWeapon});
            
            // Mega-boss weapons    
            case 'megaboss_dreadnought':
            case 'megaboss_leviathan':
            case 'megaboss_overlord':
            case 'megaboss_titan':
                // Mega-bosses alternate between lasers and bullets with spread patterns
                const megaWeapon = Math.random() < 0.6 ? 'laser' : 'bullet';
                const megaSpeed = megaWeapon === 'laser' ? 8 : 5;
                return [
                    Projectile.create(this.x - 20, this.y + this.height / 2, megaSpeed * 0.9, false, 1, 0, null, {weaponType: megaWeapon}),
                    Projectile.create(this.x, this.y + this.height / 2, megaSpeed, false, 1, 0, null, {weaponType: megaWeapon}),
                    Projectile.create(this.x + 20, this.y + this.height / 2, megaSpeed * 0.9, false, 1, 0, null, {weaponType: megaWeapon})
                ];
                
            case 'boss':
                // Multi-phase attack patterns with laser support
                switch(this.attackPhase) {
                    case 0: // Spread shot - mix of lasers and bullets
                        return [
                            Projectile.create(this.x - 20, this.y + this.height / 2, 3, false, 1, 0, null, {weaponType: 'bullet'}),
                            Projectile.create(this.x - 10, this.y + this.height / 2, 7, false, 1, 0, null, {weaponType: 'laser'}),
                            Projectile.create(this.x, this.y + this.height / 2, 5, false, 1, 0, null, {weaponType: 'bullet'}),
                            Projectile.create(this.x + 10, this.y + this.height / 2, 7, false, 1, 0, null, {weaponType: 'laser'}),
                            Projectile.create(this.x + 20, this.y + this.height / 2, 3, false, 1, 0, null, {weaponType: 'bullet'})
                        ];
                    case 1: // Rapid fire lasers
                        this.shootCooldown = 15; // Override for rapid fire
                        return Projectile.create(this.x, this.y + this.height / 2, 9, false, 1, 0, null, {weaponType: 'laser'});
                    case 2: // Homing missiles (simplified as angled shots)
                        return [
                            Projectile.create(this.x - 15, this.y + this.height / 2, 3, false, 1, 0, null, {weaponType: 'bullet'}),
                            Projectile.create(this.x + 15, this.y + this.height / 2, 3, false, 1, 0, null, {weaponType: 'bullet'})
                        ];
                }
                break;
                
            default:
                return Projectile.create(this.x, this.y + this.height / 2, 3, false, 1, 0, null, {weaponType: 'bullet'});
        }
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + this.height;
    }

    // Check collision with another object
    collidesWith(other) {
        // Hitbox 1 pixel bigger than sprite diameter (0.5 pixel buffer on each side)
        const hitboxBuffer = 0.5;
        return this.x - (this.width / 2 + hitboxBuffer) < other.x + other.width / 2 &&
               this.x + (this.width / 2 + hitboxBuffer) > other.x - other.width / 2 &&
               this.y - (this.height / 2 + hitboxBuffer) < other.y + other.height / 2 &&
               this.y + (this.height / 2 + hitboxBuffer) > other.y - other.height / 2;
    }
}

class EnemySpawner {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        this.spawnCooldown = 0;
        this.baseSpawnRate = 120; // 2 seconds at 60fps
        this.currentWave = 1;
        this.enemiesThisWave = 0;
        this.enemiesKilledThisWave = 0;
        this.totalEnemiesKilled = 0;
        this.maxEnemiesPerWave = 8;
        this.waveBreakTime = 240; // 4 seconds between waves
        this.isWaveBreak = false;
        this.waveStartTime = 0;
        this.formationSpawning = false;
        this.formationCooldown = 0;
        this.bossWave = false;
        this.specialEventCooldown = 0;
        this.distanceMultiplier = 1;
        this.distanceKm = 0;
        this.lastBossDistance = -1;
        // Dynamic difficulty knobs
        this._spawnRateMultiplier = 1.0;
        this._aggressionLevel = 0.0;
        this._maxEnemiesBonus = 0;
        this._difficultyText = 'x1.00';
    }

    setDistanceMultiplier(multiplier, distanceKm) {
        this.distanceMultiplier = multiplier;
        this.distanceKm = distanceKm;
    }

    update() {
        if (this.spawnCooldown > 0) {
            this.spawnCooldown--;
        }
        
        if (this.formationCooldown > 0) {
            this.formationCooldown--;
        }
        
        if (this.specialEventCooldown > 0) {
            this.specialEventCooldown--;
        }
        
        // Handle wave progression
        if (this.isWaveBreak && this.spawnCooldown <= 0) {
            this.isWaveBreak = false;
            this.enemiesThisWave = 0;
            this.enemiesKilledThisWave = 0;
            this.currentWave++;
            const baseMax = 8 + Math.floor(this.currentWave / 2);
            this.maxEnemiesPerWave = Math.min(25, baseMax + (this._maxEnemiesBonus || 0));
            this.waveStartTime = 0;
            
            // Check for boss wave
            this.bossWave = (this.currentWave % 5 === 0);
            if (this.bossWave) {
                this.maxEnemiesPerWave = 1; // Only spawn boss
            }
        }
        
        this.waveStartTime++;
    }

    canSpawn() {
        // At high distances (20km+), enable continuous spawning with reduced wave breaks
        const continuousSpawning = this.distanceKm >= 20;
        
        if (continuousSpawning) {
            return this.spawnCooldown <= 0;
        }
        
        return !this.isWaveBreak && this.spawnCooldown <= 0 && this.enemiesThisWave < this.maxEnemiesPerWave;
    }

    spawnEnemy() {
        if (!this.canSpawn()) return null;
        
        // Distance-based boss spawning
        if (this.shouldSpawnDistanceBoss()) {
            return this.spawnDistanceBoss();
        }
        
        // Boss wave logic
        if (this.bossWave) {
            this.spawnCooldown = this.waveBreakTime;
            this.enemiesThisWave++;
            this.isWaveBreak = true;
            const boss = new Enemy(this.canvasWidth / 2, -60, 'boss', this.currentWave);
            boss.applyDistanceScaling(this.distanceMultiplier, this.distanceKm);
            return boss;
        }
        
        // Formation spawning
        if (this.shouldSpawnFormation()) {
            return this.spawnFormation();
        }
        
        // 6-row system for enemy spawning
        const rows = 6;
        const rowWidth = (this.canvasWidth - 80) / rows; // Account for 40px margins
        const selectedRow = Math.floor(Math.random() * rows);
        const x = 40 + (selectedRow * rowWidth) + (Math.random() * rowWidth * 0.8) + (rowWidth * 0.1);
        const y = -30;
        
        // Advanced enemy type selection based on wave progression
        let enemyType = this.selectEnemyType();
        
        // Adjust spawn rate based on wave and distance
        const distanceSpeedBonus = Math.floor(this.distanceKm / 2); // Faster spawning every 2km
        const continuousSpawning = this.distanceKm >= 20;
        
        if (continuousSpawning) {
            // Continuous spawning at high distances - much faster and no wave breaks
            const base = Math.max(5, 30 - distanceSpeedBonus);
            this.spawnCooldown = Math.max(3, Math.floor(base / (this._spawnRateMultiplier || 1)));
        } else {
            const base = Math.max(15, this.baseSpawnRate - (this.currentWave * 4) - distanceSpeedBonus);
            this.spawnCooldown = Math.max(8, Math.floor(base / (this._spawnRateMultiplier || 1)));
            this.enemiesThisWave++;
            
            // Check if wave is complete
            if (this.enemiesThisWave >= this.maxEnemiesPerWave) {
                this.isWaveBreak = true;
                const breakBase = this.waveBreakTime - (this.currentWave * 5);
                // Slightly shorten breaks when difficulty is high
                const breakAdj = Math.max(60, Math.floor(breakBase / Math.max(1, (this._spawnRateMultiplier || 1) * 0.9)));
                this.spawnCooldown = breakAdj;
            }
        }
        
        const enemy = new Enemy(x, y, enemyType, this.currentWave);
        enemy.applyDistanceScaling(this.distanceMultiplier, this.distanceKm);
        return enemy;
    }

    selectEnemyType() {
        const wave = this.currentWave;
        const distance = this.distanceKm;
        const rand = Math.random();
        
        // Progressive enemy type introduction based on distance
        if (distance >= 50) {
            // End-game chaos: All enemy types possible
            const allTypes = ['basic', 'fast', 'tank', 'sniper', 'bomber', 'swarm', 'heavy', 'stealth', 'guardian', 'assassin', 'splitter'];
            if (rand < 0.03) return 'heavy';
            if (rand < 0.08) return 'guardian';
            if (rand < 0.13) return 'splitter';
            if (rand < 0.18) return 'stealth';
            if (rand < 0.23) return 'assassin';
            if (rand < 0.30) return 'bomber';
            if (rand < 0.40) return 'sniper';
            if (rand < 0.55) return 'swarm';
            if (rand < 0.70) return 'tank';
            if (rand < 0.85) return 'fast';
            return 'basic';
        } else if (distance >= 30) {
            // High-level enemies emerge
            if (rand < 0.05) return 'heavy';
            if (rand < 0.12) return 'guardian';
            if (rand < 0.18) return 'stealth';
            if (rand < 0.24) return 'splitter';
            if (rand < 0.30) return 'assassin';
            if (rand < 0.42) return 'bomber';
            if (rand < 0.54) return 'sniper';
            if (rand < 0.68) return 'swarm';
            if (rand < 0.80) return 'tank';
            if (rand < 0.90) return 'fast';
            return 'basic';
        } else if (distance >= 20) {
            // Mid-high difficulty
            if (rand < 0.08) return 'stealth';
            if (rand < 0.15) return 'assassin';
            if (rand < 0.25) return 'bomber';
            if (rand < 0.40) return 'sniper';
            if (rand < 0.58) return 'swarm';
            if (rand < 0.75) return 'tank';
            if (rand < 0.88) return 'fast';
            return 'basic';
        } else if (distance >= 10) {
            // Mid-level enemies
            if (rand < 0.10) return 'bomber';
            if (rand < 0.25) return 'sniper';
            if (rand < 0.45) return 'swarm';
            if (rand < 0.65) return 'tank';
            if (rand < 0.85) return 'fast';
            return 'basic';
        } else if (distance >= 5) {
            // Early-mid game
            if (rand < 0.15) return 'sniper';
            if (rand < 0.35) return 'swarm';
            if (rand < 0.60) return 'tank';
            if (rand < 0.80) return 'fast';
            return 'basic';
        } else if (distance >= 2) {
            // Early game
            if (rand < 0.25) return 'tank';
            if (rand < 0.60) return 'fast';
            return 'basic';
        } else {
            // Starting area
            if (rand < 0.30) return 'fast';
            return 'basic';
        }
        
        let base = 'basic';
        // Choose base type using existing distance logic
        base = (function(){
            const r = rand;
            if (distance >= 50) {
                const allTypes = ['basic', 'fast', 'tank', 'sniper', 'bomber', 'swarm', 'heavy', 'stealth', 'guardian', 'assassin', 'splitter'];
                if (r < 0.03) return 'heavy';
                if (r < 0.08) return 'guardian';
                if (r < 0.13) return 'splitter';
                if (r < 0.18) return 'stealth';
                if (r < 0.23) return 'assassin';
                if (r < 0.30) return 'bomber';
                if (r < 0.40) return 'sniper';
                if (r < 0.55) return 'swarm';
                if (r < 0.70) return 'tank';
                if (r < 0.85) return 'fast';
                return 'basic';
            } else if (distance >= 30) {
                if (r < 0.05) return 'heavy';
                if (r < 0.12) return 'guardian';
                if (r < 0.18) return 'stealth';
                if (r < 0.24) return 'splitter';
                if (r < 0.30) return 'assassin';
                if (r < 0.42) return 'bomber';
                if (r < 0.54) return 'sniper';
                if (r < 0.68) return 'swarm';
                if (r < 0.80) return 'tank';
                if (r < 0.90) return 'fast';
                return 'basic';
            } else if (distance >= 20) {
                if (r < 0.08) return 'stealth';
                if (r < 0.15) return 'assassin';
                if (r < 0.25) return 'bomber';
                if (r < 0.40) return 'sniper';
                if (r < 0.58) return 'swarm';
                if (r < 0.75) return 'tank';
                if (r < 0.88) return 'fast';
                return 'basic';
            } else if (distance >= 10) {
                if (r < 0.10) return 'bomber';
                if (r < 0.25) return 'sniper';
                if (r < 0.45) return 'swarm';
                if (r < 0.65) return 'tank';
                if (r < 0.85) return 'fast';
                return 'basic';
            } else if (distance >= 5) {
                if (r < 0.15) return 'sniper';
                if (r < 0.35) return 'swarm';
                if (r < 0.60) return 'tank';
                if (r < 0.80) return 'fast';
                return 'basic';
            } else if (distance >= 2) {
                if (r < 0.25) return 'tank';
                if (r < 0.60) return 'fast';
                return 'basic';
            } else {
                if (r < 0.30) return 'fast';
                return 'basic';
            }
        })();

        // Difficulty aggression may upgrade the base type to a tougher variant
        const upgradeChance = this._aggressionLevel || 0;
        if (Math.random() < upgradeChance) {
            const upgradeMap = {
                basic: ['fast','tank','swarm'],
                fast: ['sniper','bomber'],
                tank: ['heavy','guardian'],
                swarm: ['assassin','sniper'],
                sniper: ['heavy','stealth'],
                bomber: ['heavy','assassin'],
                stealth: ['guardian','assassin'],
                guardian: ['heavy'],
                splitter: ['heavy','guardian']
            };
            const options = upgradeMap[base] || [];
            if (options.length) {
                base = options[Math.floor(Math.random() * options.length)];
            }
        }

        return base;
    }

    shouldSpawnFormation() {
        return this.currentWave >= 3 && 
               this.formationCooldown <= 0 && 
               this.waveStartTime > 60 && 
               Math.random() < 0.3;
    }

    spawnFormation() {
        this.formationCooldown = 600; // 10 seconds
        this.formationSpawning = true;
        
        const formations = [];
        const centerX = this.canvasWidth / 2;
        const formationType = Math.random();
        
        if (formationType < 0.33) {
            // V Formation
            for (let i = 0; i < 5; i++) {
                const offset = (i - 2) * 40;
                const yOffset = Math.abs(i - 2) * 20;
                const enemy = new Enemy(centerX + offset, -30 - yOffset, 'fast', this.currentWave);
                enemy.applyDistanceScaling(this.distanceMultiplier, this.distanceKm);
                formations.push(enemy);
            }
        } else if (formationType < 0.66) {
            // Line Formation
            for (let i = 0; i < 6; i++) {
                const offset = (i - 2.5) * 35;
                const enemy = new Enemy(centerX + offset, -30, 'basic', this.currentWave);
                enemy.applyDistanceScaling(this.distanceMultiplier, this.distanceKm);
                formations.push(enemy);
            }
        } else {
            // Diamond Formation
            const enemies = [
                new Enemy(centerX, -30, 'tank', this.currentWave),
                new Enemy(centerX - 30, -60, 'fast', this.currentWave),
                new Enemy(centerX + 30, -60, 'fast', this.currentWave),
                new Enemy(centerX - 30, -90, 'basic', this.currentWave),
                new Enemy(centerX + 30, -90, 'basic', this.currentWave)
            ];
            enemies.forEach(enemy => {
                enemy.applyDistanceScaling(this.distanceMultiplier, this.distanceKm);
                formations.push(enemy);
            });
        }
        
        this.enemiesThisWave += formations.length;
        return formations;
    }

    shouldSpawnDistanceBoss() {
        const distanceKm = Math.floor(this.distanceKm);
        
        // Mini bosses every 6km, mega bosses every 18km (changed from 9km)
        const isMiniBosskm = distanceKm > 0 && distanceKm % 6 === 0 && distanceKm % 18 !== 0;
        const isMegaBossKm = distanceKm > 0 && distanceKm % 18 === 0;
        
        // Only spawn if we haven't spawned at this distance yet
        if ((isMiniBosskm || isMegaBossKm) && this.lastBossDistance !== distanceKm) {
            return true;
        }
        return false;
    }

    spawnDistanceBoss() {
        const distanceKm = Math.floor(this.distanceKm);
        this.lastBossDistance = distanceKm;
        
        const isMegaBoss = distanceKm % 18 === 0;
        let bossType;
        
        if (isMegaBoss) {
            // Mega boss types - cycle through different types
            const megaBossTypes = [
                'megaboss_dreadnought', 'megaboss_mothership', 'megaboss_leviathan',
                'megaboss_overlord', 'megaboss_titan', 'megaboss_vortex',
                'megaboss_nemesis', 'megaboss_apocalypse', 'megaboss_infinity'
            ];
            const bossIndex = Math.floor(distanceKm / 18) % megaBossTypes.length;
            bossType = megaBossTypes[bossIndex];
        } else {
            // Mini boss types - cycle through different types (now includes 4 new sprite-based bosses)
            const miniBossTypes = [
                'miniboss_destroyer', 'miniboss_carrier', 'miniboss_fortress',
                'miniboss_hunter', 'miniboss_phantom', 'miniboss_berserker',
                'miniboss_inferno', 'miniboss_kraken', 'miniboss_ironclad', 'miniboss_venom'
            ];
            const bossIndex = Math.floor(distanceKm / 6) % miniBossTypes.length;
            bossType = miniBossTypes[bossIndex];
        }
        
        this.spawnCooldown = this.waveBreakTime * 2; // Longer cooldown after boss
        this.enemiesThisWave++;
        
        const boss = new Enemy(this.canvasWidth / 2, -80, bossType, this.currentWave);
        boss.applyDistanceScaling(this.distanceMultiplier, this.distanceKm);
        
        // Enhanced boss scaling for distance bosses
        if (isMegaBoss) {
            boss.health = Math.floor(boss.health * (1 + distanceKm * 0.1)); // Scale health with distance
            boss.points *= 2;
        } else {
            boss.health = Math.floor(boss.health * (1 + distanceKm * 0.05));
            boss.points = Math.floor(boss.points * 1.5);
        }
        
        return boss;
    }

    onEnemyKilled() {
        this.enemiesKilledThisWave++;
        this.totalEnemiesKilled++;
    }

    getCurrentWave() {
        return this.currentWave;
    }

    // Dynamic difficulty application
    applyDifficulty(opts = {}) {
        const { spawnRateMultiplier, aggressionLevel, maxEnemiesBonus, levelText } = opts;
        if (typeof spawnRateMultiplier === 'number') this._spawnRateMultiplier = Math.max(0.5, Math.min(3, spawnRateMultiplier));
        if (typeof aggressionLevel === 'number') this._aggressionLevel = Math.max(0, Math.min(1, aggressionLevel));
        if (typeof maxEnemiesBonus === 'number') this._maxEnemiesBonus = Math.max(0, Math.min(12, Math.floor(maxEnemiesBonus)));
        if (typeof levelText === 'string') this._difficultyText = levelText;
    }

    getDifficultyLevel() {
        return this._difficultyText || 'x1.00';
    }
}