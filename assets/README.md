# Army Rush Clone - Pixel Art Assets

This directory is prepared for your 2D pixel art sprites. The game is designed to easily integrate sprite sheets and individual sprite files.

## Recommended Asset Structure:
```
assets/
├── sprites/
│   ├── player/
│   │   ├── player_idle.png
│   │   ├── player_move.png
│   │   └── player_shoot.png
│   ├── enemies/
│   │   ├── basic_enemy.png
│   │   ├── fast_enemy.png
│   │   └── tank_enemy.png
│   ├── projectiles/
│   │   ├── player_bullet.png
│   │   └── enemy_bullet.png
│   └── effects/
│       ├── explosion.png
│       └── muzzle_flash.png
├── sounds/
│   ├── shoot.wav
│   ├── explosion.wav
│   └── hit.wav
└── backgrounds/
    ├── space_bg.png
    └── stars.png
```

## Sprite Requirements:
- **Format**: PNG with transparency
- **Size**: Multiples of 8px for pixel art (e.g., 32x32, 16x24)
- **Style**: Pixel art, crisp edges
- **Color Palette**: Limited colors for authentic retro feel

## Animation Support:
The game engine supports sprite sheet animations. Each sprite sheet should:
- Have frames arranged horizontally
- Use consistent frame sizes
- Include timing data in filename or separate config

## Integration Notes:
- Sprites will replace the current geometric shapes
- Animation system is ready for frame-based sprites
- Collision detection will adjust to sprite dimensions
- All sprites should maintain pixel-perfect rendering

Replace this README with your actual sprite files when ready!