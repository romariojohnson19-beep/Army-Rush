class ShipRegistry {
    constructor() {
        this.frames = {}; // key -> true
        this.load();
    }

    registerBlueprint(key) {
        if (!key) return false;
        // Only handle ship_frame_* keys
        if (!key.startsWith('ship_frame_')) return false;
        this.frames[key] = true;
        this.save();
        // Also register with BaseBuildingManager if present
        try {
            if (window.baseBuildingManager && typeof window.baseBuildingManager.registerShipFrame === 'function') {
                window.baseBuildingManager.registerShipFrame(key);
            }
        } catch (e) {
            // ignore
        }
        return true;
    }

    isShipFrameUnlocked(key) {
        return !!this.frames[key];
    }

    getUnlockedFrames() {
        return Object.keys(this.frames);
    }

    save() {
        try {
            localStorage.setItem('shipRegistry', JSON.stringify({ frames: this.frames }));
        } catch (e) {
            console.warn('Failed to save shipRegistry', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem('shipRegistry');
            if (raw) {
                const data = JSON.parse(raw);
                this.frames = data.frames || {};
            }
        } catch (e) {
            this.frames = {};
        }
    }
}

window.ShipRegistry = new ShipRegistry();
