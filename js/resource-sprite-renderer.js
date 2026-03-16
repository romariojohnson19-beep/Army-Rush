// Resource & Power-Up Sprite Renderer
// Provides a unified way to draw resource and powerup items using an external sprite sheet.
// Falls back automatically to existing procedural drawing if sprites are missing.
// Usage:
//   ResourceSpriteRenderer.init(); // optionally with custom sheet path
//   ResourceSpriteRenderer.drawResource(ctx, 'energy', x, y, 32, 32, fallbackFn);
//   ResourceSpriteRenderer.drawPowerUp(ctx, 'rapidFire', x, y, 28, 28, fallbackFn);
// Expected asset placement (user should add these files):
//   assets/resources/resources.png   (grid of resource icons)
//   assets/powerups/powerups.png     (grid of powerup icons)
// If these files do not exist yet, fallback drawings are used.

(function(global){
    const SPRITE_SIZE = 32; // Base tile size

    const resourceMap = {
        energy: { sheet: 'resources', col: 0, row: 0 },      // resource_01.png
        metal: { sheet: 'resources', col: 1, row: 0 },       // resource_02.png
        crystals: { sheet: 'resources', col: 2, row: 0 },    // resource_03.png
        darkMatter: { sheet: 'resources', col: 3, row: 0 }   // resource_04.png
    };

    const powerUpMap = {
        rapidFire: { sheet: 'powerups', col: 0, row: 0 },           // powerup_01.png
        multiShot: { sheet: 'powerups', col: 1, row: 0 },           // powerup_02.png
        shield: { sheet: 'powerups', col: 2, row: 0 },              // powerup_03.png
        health: { sheet: 'powerups', col: 3, row: 0 },              // powerup_04.png
        speedBoost: { sheet: 'powerups', col: 0, row: 1 },          // powerup_05.png
        scoreMultiplier: { sheet: 'powerups', col: 1, row: 1 },     // powerup_06.png
        currencyDoubler: { sheet: 'powerups', col: 2, row: 1 },     // powerup_07.png
        nuke: { sheet: 'powerups', col: 3, row: 1 },                // powerup_08.png
        heatSeekingMissiles: { sheet: 'powerups', col: 0, row: 2 }, // powerup_09.png
        angularShots: { sheet: 'powerups', col: 1, row: 2 },        // powerup_10.png
        radio: { sheet: 'powerups', col: 2, row: 2 },               // powerup_11.png (support pilot)
        toolbox: { sheet: 'powerups', col: 3, row: 2 },             // powerup_12.png
        mutation: { sheet: 'powerups', col: 0, row: 2 }             // reuse or add if needed
    };

    const state = {
        loadedSheets: {},
        pendingLoads: {},
        initialized: false,
        loadErrors: {}
    };

    function buildPath(sheetName) {
        if (sheetName === 'resources') return 'assets/resources/resources.png';
        if (sheetName === 'powerups') return 'assets/powerups/powerups.png';
        return null;
    }

    // Fallback function for individual sprites if sheets not available
    function buildIndividualPath(type, isResource) {
        const prefix = isResource ? 'resource' : 'powerup';
        const typeToNum = {
            // Resources
            energy: 1, metal: 2, crystals: 3, darkMatter: 4,
            // PowerUps
            rapidFire: 1, multiShot: 2, shield: 3, health: 4,
            speedBoost: 5, scoreMultiplier: 6, currencyDoubler: 7, nuke: 8,
            heatSeekingMissiles: 9, angularShots: 10, radio: 11, toolbox: 12, mutation: 12
        };
        const num = typeToNum[type];
        if (num) return `assets/${isResource ? 'resources' : 'powerups'}/${prefix}_${String(num).padStart(2, '0')}.png`;
        return null;
    }

    function loadSheet(sheetName) {
        if (state.loadedSheets[sheetName]) return Promise.resolve(state.loadedSheets[sheetName]);
        if (state.pendingLoads[sheetName]) return state.pendingLoads[sheetName];
        const src = buildPath(sheetName);
        if (!src) return Promise.resolve(null);
        const p = new Promise(resolve => {
            const img = new Image();
            img.onload = () => { state.loadedSheets[sheetName] = img; resolve(img); };
            img.onerror = () => { state.loadErrors[sheetName] = true; resolve(null); };
            img.src = src;
        });
        state.pendingLoads[sheetName] = p;
        return p;
    }

    async function init() {
        if (state.initialized) return;
        state.initialized = true;
        // Fire off both loads in parallel; we don't block rendering.
        loadSheet('resources');
        loadSheet('powerups');
    }

    function resolveSheet(sheetName) {
        // Prefer assetManager images if available
        if (typeof assetManager !== 'undefined' && assetManager.isLoaded()) {
            const key = sheetName === 'resources' ? 'resources_sheet' : (sheetName === 'powerups' ? 'powerups_sheet' : null);
            if (key) {
                const img = assetManager.getImage(key);
                if (img) return img;
            }
        }
        return state.loadedSheets[sheetName];
    }

    function drawFromSheet(ctx, sheetName, col, row, x, y, width, height) {
        const sheet = resolveSheet(sheetName);
        if (!sheet) return false;
        ctx.imageSmoothingEnabled = false;
        const sx = col * SPRITE_SIZE;
        const sy = row * SPRITE_SIZE;
        ctx.drawImage(sheet, sx, sy, SPRITE_SIZE, SPRITE_SIZE, x - width/2, y - height/2, width, height);
        return true;
    }

    function drawResource(ctx, type, x, y, width, height, fallback) {
        const info = resourceMap[type];
        if (info) {
            const ok = drawFromSheet(ctx, info.sheet, info.col, info.row, x, y, width, height);
            if (ok) return true;
        }
        // Fallback to individual sprite if sheet missing
        if (!info || !resourceMap[type]) {
            try {
                const indivPath = buildIndividualPath(type, true);
                if (indivPath && typeof assetManager !== 'undefined' && assetManager.isLoaded()) {
                    const img = assetManager.getImage(`resource_${type}`);
                    if (img) {
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(img, x - width/2, y - height/2, width, height);
                        return true;
                    }
                }
            } catch (e) { /* fallback to procedure */ }
        }
        // Final fallback: procedural or user-provided fallback
        if (fallback) {
            fallback(ctx, x, y, width, height);
            return true;
        }
        return false;
    }

    function drawPowerUp(ctx, type, x, y, width, height, fallback) {
        const info = powerUpMap[type];
        if (info) {
            const ok = drawFromSheet(ctx, info.sheet, info.col, info.row, x, y, width, height);
            if (ok) return true;
        }
        // Fallback to individual sprite if sheet missing
        if (!info || !powerUpMap[type]) {
            try {
                const indivPath = buildIndividualPath(type, false);
                if (indivPath && typeof assetManager !== 'undefined' && assetManager.isLoaded()) {
                    const img = assetManager.getImage(`powerup_${type}`);
                    if (img) {
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(img, x - width/2, y - height/2, width, height);
                        return true;
                    }
                }
            } catch (e) { /* fallback to procedure */ }
        }
        if (fallback) {
            fallback(ctx, x, y, width, height);
            return true;
        }
        return false;
    }

    function isReady() {
        // Ready if either assetManager has sheets or local loads finished
        const resourcesReady = (typeof assetManager !== 'undefined' && assetManager.getImage('resources_sheet')) || state.loadedSheets['resources'];
        const powerupsReady = (typeof assetManager !== 'undefined' && assetManager.getImage('powerups_sheet')) || state.loadedSheets['powerups'];
        return !!(resourcesReady && powerupsReady);
    }

    global.ResourceSpriteRenderer = { init, drawResource, drawPowerUp, ready: isReady() };
    if (typeof window !== 'undefined') window.ResourceSpriteRenderer = global.ResourceSpriteRenderer;
})(typeof window !== 'undefined' ? window : globalThis);
