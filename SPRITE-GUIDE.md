# Sprite System for Army Rush

This guide explains how to add custom sprites to your Army Rush game.

## Quick Start

1. **Generate Sample Sprites**: Open `sprite-generator.html` in your browser and click "Generate All Sprites"
2. **Download Sprites**: Click "Download All as ZIP" or download individual sprites
3. **Place Sprites**: Put the PNG files in the correct folders under `/assets/`
4. **Test**: Launch the game - it will use sprites when available, shapes as fallback

## Folder Structure

```
assets/
├── ships/           # Player ship sprites
├── enemies/         # Regular enemy sprites  
├── bosses/          # Boss sprites (mini and mega)
└── effects/         # Effect sprites (optional)
```

## Sprite Requirements

### File Naming Convention
- Player ships: `player_basic.png`, `player_heavy.png`, `player_fast.png`
- Enemies: `enemy_basic.png`, `enemy_fast.png`, `enemy_tank.png`, etc.
- Mini bosses: `miniboss_destroyer.png`, `miniboss_carrier.png`, etc.
- Mega bosses: `megaboss_dreadnought.png`, `megaboss_mothership.png`, etc.

### Sprite Specifications
- **Format**: PNG with transparency
- **Style**: Pixel art recommended for retro feel
- **Size**: Sprites will be scaled to game object dimensions
- **Orientation**: Ships should face upward (player) or downward (enemies)

## Recommended Sprite Sizes

### Player Ships
- Basic: 32x24 pixels
- Heavy: 40x30 pixels  
- Fast: 28x20 pixels

### Enemies
- Basic: 24x20 pixels
- Fast: 20x16 pixels
- Tank: 32x28 pixels
- Sniper: 22x26 pixels
- Bomber: 36x22 pixels
- Swarm: 16x14 pixels
- Heavy: 40x36 pixels
- Stealth: 24x18 pixels
- Guardian: 36x32 pixels
- Assassin: 18x16 pixels
- Splitter: 28x24 pixels

### Mini Bosses (48-56 pixels)
- Destroyer: 48x40 pixels
- Carrier: 52x36 pixels
- Fortress: 56x44 pixels
- Hunter: 44x32 pixels
- Phantom: 42x34 pixels
- Berserker: 40x36 pixels

### Mega Bosses (68-108 pixels)
- Dreadnought: 80x60 pixels
- Mothership: 90x70 pixels
- Leviathan: 76x56 pixels
- Overlord: 84x64 pixels
- Titan: 100x80 pixels
- Vortex: 72x72 pixels
- Nemesis: 68x52 pixels
- Apocalypse: 78x62 pixels
- Infinity: 108x88 pixels

## How It Works

1. **Asset Manager**: Automatically loads all sprites on game start
2. **Fallback System**: Uses original shape drawing if sprites not found
3. **Smart Scaling**: Sprites scale to match game object dimensions
4. **Pixel Perfect**: Images render with crisp pixel art scaling

## Creating Custom Sprites

### Option 1: Use the Sprite Generator
1. Open `sprite-generator.html`
2. Generate baseline sprites
3. Edit them in your favorite pixel art editor

### Option 2: Create from Scratch
1. Use any image editor (Aseprite, Photoshop, GIMP, etc.)
2. Follow size guidelines above
3. Use transparent backgrounds
4. Save as PNG

### Option 3: AI Generation
1. Use AI tools like DALL-E, Midjourney, or Stable Diffusion
2. Prompt: "pixel art spaceship sprite, 32x24 pixels, top-down view, transparent background"
3. Resize to correct dimensions if needed

## Tips for Best Results

- **Consistent Style**: Keep all sprites in the same art style
- **Clear Silhouettes**: Make sure each ship type is easily recognizable
- **Color Coding**: Use colors that match the game's theme
- **Animation Frames**: You can create multiple frames for animated sprites
- **Test in Game**: Always test sprites in-game to ensure they look good at scale

## Advanced Features

### Ship Type Selection
You can modify the player's ship type by changing `this.shipType` in the Player constructor:
```javascript
this.shipType = 'heavy'; // Changes to heavy ship sprite
```

### Dynamic Sprite Loading
The system supports runtime sprite loading for ship upgrades or customization systems.

### Animation Support
While not implemented in this basic version, the system is designed to support animated sprites in the future.

## Troubleshooting

- **Sprites not loading**: Check file paths and names match exactly
- **Blurry sprites**: Ensure `imageSmoothingEnabled = false` is set
- **Wrong size**: Sprites are scaled automatically, but original proportions matter
- **Missing transparency**: Save PNG with alpha channel for transparent backgrounds

The game will always work even without sprites - they're purely visual enhancements!