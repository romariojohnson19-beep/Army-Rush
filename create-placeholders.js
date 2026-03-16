// Simple script to create 1x1 placeholder images to prevent 404 errors
// This will be replaced by proper sprites later

const fs = require('fs');
const path = require('path');

// Create a simple 1x1 transparent PNG data URL
const transparentPNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hRWkOAAAAABJRU5ErkJggg==';

// Convert data URL to buffer
function dataURLToBuffer(dataURL) {
    const base64Data = dataURL.split(',')[1];
    return Buffer.from(base64Data, 'base64');
}

const pngBuffer = dataURLToBuffer(transparentPNG);

// Create placeholder files
const files = [
    'assets/ships/player_basic.png',
    'assets/ships/player_heavy.png',
    'assets/ships/player_fast.png',
    'assets/enemies/basic.png',
    'assets/enemies/fast.png',
    'assets/enemies/tank.png',
    'assets/enemies/sniper.png',
    'assets/enemies/bomber.png',
    'assets/enemies/swarm.png',
    'assets/enemies/heavy.png',
    'assets/enemies/stealth.png',
    'assets/enemies/guardian.png',
    'assets/enemies/assassin.png',
    'assets/enemies/splitter.png',
    'assets/bosses/mini_destroyer.png',
    'assets/bosses/mini_carrier.png',
    'assets/bosses/mini_fortress.png',
    'assets/bosses/mini_hunter.png',
    'assets/bosses/mini_phantom.png',
    'assets/bosses/mini_berserker.png',
    'assets/bosses/mini_inferno.png',
    'assets/bosses/mini_kraken.png',
    'assets/bosses/mini_ironclad.png',
    'assets/bosses/mini_venom.png',
    'assets/bosses/mega_dreadnought.png',
    'assets/bosses/mega_mothership.png',
    'assets/bosses/mega_leviathan.png',
    'assets/bosses/mega_overlord.png',
    'assets/bosses/mega_titan.png',
    'assets/bosses/mega_vortex.png',
    'assets/bosses/mega_nemesis.png',
    'assets/bosses/mega_apocalypse.png',
    'assets/bosses/mega_infinity.png',
    'assets/effects/thruster_flame.png',
    'assets/effects/shield_bubble.png',
    'assets/effects/explosion_small.png',
    'assets/effects/explosion_large.png'
];

files.forEach(file => {
    try {
        fs.writeFileSync(file, pngBuffer);
        console.log(`Created placeholder: ${file}`);
    } catch (error) {
        console.error(`Failed to create ${file}:`, error.message);
    }
});

console.log('Placeholder sprites created successfully!');