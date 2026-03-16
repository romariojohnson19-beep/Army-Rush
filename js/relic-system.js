class Relic {
    constructor(id, name, description, applyFn, removeFn, rarity = 'rare') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.applyFn = applyFn;   // (player, game) => void
        this.removeFn = removeFn; // (player, game) => void
        this.rarity = rarity;
    }
}

class RelicManager {
    constructor(game) {
        this.game = game;
        this.available = this.initializeRelics();
        this.activeRelics = new Map(); // id -> relic
    }

    initializeRelics() {
        const gs = this;
        // Define a small set of relics/perks
        return {
            'damage_boost': new Relic('damage_boost', 'Overcharged Cells', 'Increase bullet damage by 25%', (p, g) => {
                p._relicDamageBoost = (p._relicDamageBoost || 0) + 0.25;
            }, (p, g) => {
                p._relicDamageBoost = Math.max(0, (p._relicDamageBoost || 0) - 0.25);
            }, 'uncommon'),

            'health_regen': new Relic('health_regen', 'Nanite Repair', 'Regenerate 0.5 health per second', (p, g) => {
                p._hasRegen = true;
            }, (p, g) => { p._hasRegen = false; }, 'rare'),

            'piercing': new Relic('piercing', 'Phase Rounds', 'Your bullets pierce 1 extra target', (p, g) => {
                p._relicPierce = (p._relicPierce || 0) + 1;
            }, (p, g) => { p._relicPierce = Math.max(0, (p._relicPierce || 0) - 1); }, 'rare'),

            'magnet': new Relic('magnet', 'Grav Magnet', 'Automatically attract pickups within 120px', (p,g) => {
                p._relicMagnet = true;
            }, (p,g) => { p._relicMagnet = false; }, 'uncommon'),

            'support_drone': new Relic('support_drone', 'Guardian Drone', 'Spawns a support fighter for the run', (p,g) => {
                g.spawnSupportFighter('fast');
            }, (p,g) => {}, 'very_rare')
        };
    }

    // Grant relic by id and apply effect immediately
    grantRelicToPlayer(relicId) {
        const relic = this.available[relicId];
        if (!relic) return false;
        if (this.activeRelics.has(relicId)) return false; // one copy
        this.activeRelics.set(relicId, relic);
        if (typeof relic.applyFn === 'function') relic.applyFn(this.game.player, this.game);
        // show small notification
        if (this.game && typeof this.game.showPortalRewardToast === 'function') {
            this.game.showPortalRewardToast(relic.name, relic.description);
        }
        return true;
    }

    removeRelic(relicId) {
        const relic = this.activeRelics.get(relicId);
        if (!relic) return false;
        if (typeof relic.removeFn === 'function') relic.removeFn(this.game.player, this.game);
        this.activeRelics.delete(relicId);
        return true;
    }

    // Pick n random relic ids for offering
    pickRandomRelics(n = 3) {
        const keys = Object.keys(this.available);
        const result = [];
        const copy = keys.slice();
        while (result.length < n && copy.length > 0) {
            const idx = Math.floor(Math.random() * copy.length);
            result.push(copy.splice(idx,1)[0]);
        }
        return result;
    }
}

window.RelicManager = RelicManager;
