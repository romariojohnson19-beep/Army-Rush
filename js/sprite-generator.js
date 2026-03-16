// Sprite Generator for Army Rush Pilots
// This creates simple colored ship sprites as canvas-based images

class SpriteGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 64;
        this.canvas.height = 64;
    }

    generatePilotSprite(type, size = 64) {
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx.clearRect(0, 0, size, size);

        const centerX = size / 2;
        const centerY = size / 2;

        switch(type) {
            case 'player_basic':
                this.drawBasicShip(centerX, centerY, size, '#4CAF50');
                break;
            case 'player_veteran':
                this.drawVeteranShip(centerX, centerY, size, '#2196F3');
                break;
            case 'player_heavy':
                this.drawHeavyShip(centerX, centerY, size, '#795548');
                break;
            case 'player_fast':
                this.drawFastShip(centerX, centerY, size, '#FFEB3B');
                break;
            case 'player_hunter':
                this.drawHunterShip(centerX, centerY, size, '#FF5722');
                break;
            case 'player_ghost':
                this.drawGhostShip(centerX, centerY, size, '#9C27B0');
                break;
            case 'player_destroyer':
                this.drawDestroyerShip(centerX, centerY, size, '#F44336');
                break;
            case 'player_phoenix':
                this.drawPhoenixShip(centerX, centerY, size, '#FF9800');
                break;
            case 'player_nightmare':
                this.drawNightmareShip(centerX, centerY, size, '#000000');
                break;
            default:
                this.drawBasicShip(centerX, centerY, size, '#4CAF50');
        }

        return this.canvas.toDataURL();
    }

    drawBasicShip(x, y, size, color) {
        const scale = size / 64;
        this.ctx.fillStyle = color;
        
        // Main body
        this.ctx.fillRect(x - 8 * scale, y - 6 * scale, 16 * scale, 12 * scale);
        
        // Nose
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 16 * scale);
        this.ctx.lineTo(x - 6 * scale, y - 6 * scale);
        this.ctx.lineTo(x + 6 * scale, y - 6 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Wings
        this.ctx.fillRect(x - 12 * scale, y + 2 * scale, 8 * scale, 4 * scale);
        this.ctx.fillRect(x + 4 * scale, y + 2 * scale, 8 * scale, 4 * scale);
        
        // Engine glow
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillRect(x - 4 * scale, y + 6 * scale, 2 * scale, 4 * scale);
        this.ctx.fillRect(x + 2 * scale, y + 6 * scale, 2 * scale, 4 * scale);
    }

    drawVeteranShip(x, y, size, color) {
        const scale = size / 64;
        this.ctx.fillStyle = color;
        
        // Sleeker design
        this.ctx.fillRect(x - 6 * scale, y - 8 * scale, 12 * scale, 16 * scale);
        
        // Advanced nose
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 20 * scale);
        this.ctx.lineTo(x - 4 * scale, y - 8 * scale);
        this.ctx.lineTo(x + 4 * scale, y - 8 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Angled wings
        this.ctx.beginPath();
        this.ctx.moveTo(x - 6 * scale, y - 2 * scale);
        this.ctx.lineTo(x - 14 * scale, y + 4 * scale);
        this.ctx.lineTo(x - 10 * scale, y + 8 * scale);
        this.ctx.lineTo(x - 6 * scale, y + 4 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 6 * scale, y - 2 * scale);
        this.ctx.lineTo(x + 14 * scale, y + 4 * scale);
        this.ctx.lineTo(x + 10 * scale, y + 8 * scale);
        this.ctx.lineTo(x + 6 * scale, y + 4 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Twin engines
        this.ctx.fillStyle = '#88aaff';
        this.ctx.fillRect(x - 3 * scale, y + 8 * scale, 2 * scale, 6 * scale);
        this.ctx.fillRect(x + 1 * scale, y + 8 * scale, 2 * scale, 6 * scale);
    }

    drawHeavyShip(x, y, size, color) {
        const scale = size / 64;
        this.ctx.fillStyle = color;
        
        // Bulky design
        this.ctx.fillRect(x - 10 * scale, y - 8 * scale, 20 * scale, 16 * scale);
        
        // Armored nose
        this.ctx.fillRect(x - 8 * scale, y - 12 * scale, 16 * scale, 4 * scale);
        
        // Heavy wings
        this.ctx.fillRect(x - 16 * scale, y - 2 * scale, 12 * scale, 8 * scale);
        this.ctx.fillRect(x + 4 * scale, y - 2 * scale, 12 * scale, 8 * scale);
        
        // Armor plating
        this.ctx.fillStyle = '#555555';
        this.ctx.fillRect(x - 6 * scale, y - 4 * scale, 4 * scale, 8 * scale);
        this.ctx.fillRect(x + 2 * scale, y - 4 * scale, 4 * scale, 8 * scale);
        
        // Large engines
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillRect(x - 6 * scale, y + 8 * scale, 4 * scale, 6 * scale);
        this.ctx.fillRect(x + 2 * scale, y + 8 * scale, 4 * scale, 6 * scale);
    }

    drawFastShip(x, y, size, color) {
        const scale = size / 64;
        this.ctx.fillStyle = color;
        
        // Streamlined design
        this.ctx.fillRect(x - 4 * scale, y - 12 * scale, 8 * scale, 24 * scale);
        
        // Sharp nose
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 22 * scale);
        this.ctx.lineTo(x - 3 * scale, y - 12 * scale);
        this.ctx.lineTo(x + 3 * scale, y - 12 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Speed wings
        this.ctx.beginPath();
        this.ctx.moveTo(x - 4 * scale, y);
        this.ctx.lineTo(x - 10 * scale, y + 6 * scale);
        this.ctx.lineTo(x - 6 * scale, y + 8 * scale);
        this.ctx.lineTo(x - 4 * scale, y + 4 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 4 * scale, y);
        this.ctx.lineTo(x + 10 * scale, y + 6 * scale);
        this.ctx.lineTo(x + 6 * scale, y + 8 * scale);
        this.ctx.lineTo(x + 4 * scale, y + 4 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Afterburner effect
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(x - 2 * scale, y + 12 * scale, 4 * scale, 8 * scale);
    }

    drawHunterShip(x, y, size, color) {
        const scale = size / 64;
        this.ctx.fillStyle = color;
        
        // Hunter design with weapon mounts
        this.ctx.fillRect(x - 6 * scale, y - 6 * scale, 12 * scale, 12 * scale);
        
        // Targeting nose
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 18 * scale);
        this.ctx.lineTo(x - 4 * scale, y - 6 * scale);
        this.ctx.lineTo(x + 4 * scale, y - 6 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Weapon wings
        this.ctx.fillRect(x - 14 * scale, y - 4 * scale, 8 * scale, 6 * scale);
        this.ctx.fillRect(x + 6 * scale, y - 4 * scale, 8 * scale, 6 * scale);
        
        // Gun barrels
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x - 16 * scale, y - 1 * scale, 4 * scale, 1 * scale);
        this.ctx.fillRect(x + 12 * scale, y - 1 * scale, 4 * scale, 1 * scale);
        
        // Engine array
        this.ctx.fillStyle = '#ff6600';
        this.ctx.fillRect(x - 4 * scale, y + 6 * scale, 2 * scale, 4 * scale);
        this.ctx.fillRect(x - 1 * scale, y + 6 * scale, 2 * scale, 4 * scale);
        this.ctx.fillRect(x + 2 * scale, y + 6 * scale, 2 * scale, 4 * scale);
    }

    drawGhostShip(x, y, size, color) {
        const scale = size / 64;
        this.ctx.fillStyle = color;
        
        // Stealth design
        this.ctx.globalAlpha = 0.8;
        
        // Angular stealth body
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 16 * scale);
        this.ctx.lineTo(x - 8 * scale, y);
        this.ctx.lineTo(x - 6 * scale, y + 8 * scale);
        this.ctx.lineTo(x + 6 * scale, y + 8 * scale);
        this.ctx.lineTo(x + 8 * scale, y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Stealth wings
        this.ctx.beginPath();
        this.ctx.moveTo(x - 8 * scale, y);
        this.ctx.lineTo(x - 14 * scale, y + 4 * scale);
        this.ctx.lineTo(x - 10 * scale, y + 6 * scale);
        this.ctx.lineTo(x - 6 * scale, y + 2 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8 * scale, y);
        this.ctx.lineTo(x + 14 * scale, y + 4 * scale);
        this.ctx.lineTo(x + 10 * scale, y + 6 * scale);
        this.ctx.lineTo(x + 6 * scale, y + 2 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Cloaking effect
        this.ctx.fillStyle = '#aa88ff';
        this.ctx.fillRect(x - 2 * scale, y + 8 * scale, 4 * scale, 6 * scale);
        
        this.ctx.globalAlpha = 1.0;
    }

    drawDestroyerShip(x, y, size, color) {
        const scale = size / 64;
        this.ctx.fillStyle = color;
        
        // Massive destroyer
        this.ctx.fillRect(x - 8 * scale, y - 10 * scale, 16 * scale, 20 * scale);
        
        // Command tower
        this.ctx.fillRect(x - 4 * scale, y - 14 * scale, 8 * scale, 4 * scale);
        
        // Main guns
        this.ctx.fillRect(x - 12 * scale, y - 6 * scale, 8 * scale, 4 * scale);
        this.ctx.fillRect(x + 4 * scale, y - 6 * scale, 8 * scale, 4 * scale);
        
        // Gun barrels
        this.ctx.fillStyle = '#222222';
        this.ctx.fillRect(x - 18 * scale, y - 5 * scale, 6 * scale, 2 * scale);
        this.ctx.fillRect(x + 12 * scale, y - 5 * scale, 6 * scale, 2 * scale);
        
        // Multiple engines
        this.ctx.fillStyle = '#ff0088';
        for (let i = -3; i <= 3; i++) {
            this.ctx.fillRect(x + i * 2 * scale - 1 * scale, y + 10 * scale, 2 * scale, 6 * scale);
        }
    }

    drawPhoenixShip(x, y, size, color) {
        const scale = size / 64;
        
        // Phoenix wings (gradient effect)
        const gradient = this.ctx.createLinearGradient(x - 16 * scale, y, x + 16 * scale, y);
        gradient.addColorStop(0, '#ff4400');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#ff4400');
        
        this.ctx.fillStyle = gradient;
        
        // Phoenix body
        this.ctx.fillRect(x - 6 * scale, y - 12 * scale, 12 * scale, 24 * scale);
        
        // Phoenix head
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 24 * scale);
        this.ctx.lineTo(x - 6 * scale, y - 12 * scale);
        this.ctx.lineTo(x + 6 * scale, y - 12 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Fire wings
        this.ctx.beginPath();
        this.ctx.moveTo(x - 6 * scale, y - 8 * scale);
        this.ctx.lineTo(x - 18 * scale, y + 2 * scale);
        this.ctx.lineTo(x - 14 * scale, y + 8 * scale);
        this.ctx.lineTo(x - 6 * scale, y + 4 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 6 * scale, y - 8 * scale);
        this.ctx.lineTo(x + 18 * scale, y + 2 * scale);
        this.ctx.lineTo(x + 14 * scale, y + 8 * scale);
        this.ctx.lineTo(x + 6 * scale, y + 4 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Fire trail
        this.ctx.fillStyle = '#ff6600';
        this.ctx.fillRect(x - 4 * scale, y + 12 * scale, 8 * scale, 8 * scale);
    }

    drawNightmareShip(x, y, size, color) {
        const scale = size / 64;
        
        // Dark ship with red accents
        this.ctx.fillStyle = color;
        
        // Menacing body
        this.ctx.fillRect(x - 8 * scale, y - 8 * scale, 16 * scale, 16 * scale);
        
        // Nightmare spikes
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 20 * scale);
        this.ctx.lineTo(x - 4 * scale, y - 8 * scale);
        this.ctx.lineTo(x + 4 * scale, y - 8 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Side spikes
        this.ctx.beginPath();
        this.ctx.moveTo(x - 8 * scale, y);
        this.ctx.lineTo(x - 16 * scale, y + 2 * scale);
        this.ctx.lineTo(x - 8 * scale, y + 4 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8 * scale, y);
        this.ctx.lineTo(x + 16 * scale, y + 2 * scale);
        this.ctx.lineTo(x + 8 * scale, y + 4 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Red energy core
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x - 2 * scale, y - 2 * scale, 4 * scale, 4 * scale);
        
        // Dark energy engines
        this.ctx.fillStyle = '#ff0066';
        this.ctx.fillRect(x - 6 * scale, y + 8 * scale, 4 * scale, 8 * scale);
        this.ctx.fillRect(x + 2 * scale, y + 8 * scale, 4 * scale, 8 * scale);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteGenerator;
}