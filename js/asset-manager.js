// Unified Asset Manager (merged)
class AssetManager {
    constructor() {
        this.images = {};
        this.loadingPromises = [];
        this.loaded = false;
    }

    // Load a single image
    loadImage(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            let triedAlt = false;

            img.onload = () => {
                this.images[name] = img;
                resolve(img);
            };

            img.onerror = () => {
                // If the path points to assets/sprites/ships/, try assets/ships/ as a fallback once
                if (!triedAlt && typeof src === 'string' && src.indexOf('/assets/sprites/ships/') !== -1) {
                    triedAlt = true;
                    const alt = src.replace('/assets/sprites/ships/', '/assets/ships/');
                    console.warn(`Primary load failed for ${src}, trying fallback ${alt}`);
                    // Attach a secondary onerror to handle final failure
                    img.onerror = () => {
                        console.warn(`Failed to load fallback image: ${alt}`);
                        this.images[name] = null;
                        resolve(null);
                    };
                    img.src = alt;
                    return;
                }

                console.warn(`Failed to load image: ${src}`);
                // Don't reject, just resolve with null so game continues without sprite
                this.images[name] = null;
                resolve(null);
            };

            img.src = src;
        });
    }

    // Load multiple images
    async loadAssets() {
        const assetList = [
            // Core sheets (user should supply these; fallback if missing)
            { name: 'resources_sheet', src: 'assets/resources/resources.png' },
            { name: 'powerups_sheet', src: 'assets/powerups/powerups.png' },
            // Player ship sprites
            { name: 'player_basic', src: 'assets/ships/player_basic.png' },
            { name: 'player_heavy', src: 'assets/ships/player_heavy.png' },
            { name: 'player_fast', src: 'assets/ships/player_fast.png' },
            
            // Enemy sprites
            { name: 'enemy_basic', src: 'assets/enemies/basic.png' },
            { name: 'enemy_fast', src: 'assets/enemies/fast.png' },
            { name: 'enemy_tank', src: 'assets/enemies/tank.png' },
            { name: 'enemy_sniper', src: 'assets/enemies/sniper.png' },
            { name: 'enemy_bomber', src: 'assets/enemies/bomber.png' },
            { name: 'enemy_swarm', src: 'assets/enemies/swarm.png' },
            { name: 'enemy_heavy', src: 'assets/enemies/heavy.png' },
            { name: 'enemy_stealth', src: 'assets/enemies/stealth.png' },
            { name: 'enemy_guardian', src: 'assets/enemies/guardian.png' },
            { name: 'enemy_assassin', src: 'assets/enemies/assassin.png' },
            { name: 'enemy_splitter', src: 'assets/enemies/splitter.png' },
            
            // Legacy boss
            { name: 'enemy_boss', src: 'assets/bosses/1.png' },
            
            // Mini-boss sprites
            { name: 'miniboss_destroyer', src: 'assets/bosses/mini_destroyer.png' },
            { name: 'miniboss_carrier', src: 'assets/bosses/mini_carrier.png' },
            { name: 'miniboss_fortress', src: 'assets/bosses/mini_fortress.png' },
            { name: 'miniboss_hunter', src: 'assets/bosses/mini_hunter.png' },
            { name: 'miniboss_phantom', src: 'assets/bosses/mini_phantom.png' },
            { name: 'miniboss_berserker', src: 'assets/bosses/mini_berserker.png' },
            { name: 'miniboss_inferno', src: 'assets/bosses/mini_inferno.png' },
            { name: 'miniboss_kraken', src: 'assets/bosses/mini_kraken.png' },
            { name: 'miniboss_ironclad', src: 'assets/bosses/mini_ironclad.png' },
            { name: 'miniboss_venom', src: 'assets/bosses/mini_venom.png' },
            
            // Mega-boss sprites
            { name: 'megaboss_dreadnought', src: 'assets/bosses/mega_dreadnought.png' },
            { name: 'megaboss_mothership', src: 'assets/bosses/mega_mothership.png' },
            { name: 'megaboss_leviathan', src: 'assets/bosses/mega_leviathan.png' },
            { name: 'megaboss_overlord', src: 'assets/bosses/mega_overlord.png' },
            { name: 'megaboss_titan', src: 'assets/bosses/mega_titan.png' },
            { name: 'megaboss_vortex', src: 'assets/bosses/mega_vortex.png' },
            { name: 'megaboss_nemesis', src: 'assets/bosses/mega_nemesis.png' },
            { name: 'megaboss_apocalypse', src: 'assets/bosses/mega_apocalypse.png' },
            { name: 'megaboss_infinity', src: 'assets/bosses/mega_infinity.png' },
            
            // Effect sprites
            { name: 'thruster_flame', src: 'assets/effects/thruster_flame.png' },
            { name: 'shield_bubble', src: 'assets/effects/shield_bubble.png' },
            { name: 'explosion_small', src: 'assets/effects/explosion_small.png' },
            { name: 'explosion_large', src: 'assets/effects/explosion_large.png' }
        ];

        console.log('Loading game assets...');
        
        // Load all assets
        this.loadingPromises = assetList.map(asset => 
            this.loadImage(asset.name, asset.src)
        );

        try {
            await Promise.all(this.loadingPromises);
            // After core loads, alias additional player skins to nearest available base sprite
            const playerAliases = {
                player_fighter: 'player_fast',
                player_interceptor: 'player_fast',
                player_aggressor: 'player_fast',
                player_striker: 'player_fast',
                player_vanguard: 'player_heavy',
                player_phoenix: 'player_fast',
                player_tempest: 'player_fast',
                player_nova: 'player_fast',
                player_sentinel: 'player_heavy',
                player_harbinger: 'player_heavy',
                player_pulsar: 'player_fast'
            };
            Object.entries(playerAliases).forEach(([alias, base]) => {
                if (!this.images[alias] && this.images[base]) {
                    this.images[alias] = this.images[base];
                }
            });
            this.loaded = true;
            console.log('Assets loaded successfully!');
        } catch (error) {
            console.warn('Some assets failed to load, continuing with fallback graphics');
            this.loaded = true;
        }
    }

    // Get an image by name
    getImage(name) {
        return this.images[name] || null;
    }

    // Check if assets are loaded
    isLoaded() {
        return this.loaded;
    }

    // Draw sprite with fallback to shape drawing
    drawSprite(ctx, spriteName, x, y, width, height, fallbackDrawFunction) {
        const sprite = this.getImage(spriteName);
        
        if (sprite) {
            // Draw sprite with pixel-perfect rendering
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sprite, x - width/2, y - height/2, width, height);
        } else {
            // Fallback to shape drawing
            if (fallbackDrawFunction) {
                fallbackDrawFunction(ctx, x, y, width, height);
            }
        }
    }

    // Draw rotated sprite
    drawRotatedSprite(ctx, spriteName, x, y, width, height, rotation, fallbackDrawFunction) {
        const sprite = this.getImage(spriteName);
        
        if (sprite) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sprite, -width/2, -height/2, width, height);
            ctx.restore();
        } else {
            // Fallback to shape drawing
            if (fallbackDrawFunction) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                fallbackDrawFunction(ctx, 0, 0, width, height);
                ctx.restore();
            }
        }
    }
}

// Global asset manager instance (guard against duplicate definition)
if (typeof window !== 'undefined' && window.assetManager) {
    console.warn('assetManager already exists; using existing instance');
} else {
    const assetManager = new AssetManager();
    if (typeof window !== 'undefined') window.assetManager = assetManager;
    assetManager.loadAssets();
}