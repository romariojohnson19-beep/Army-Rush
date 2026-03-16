# New Mini Boss Sprite Extraction Guide

Based on your 2x2 sprite sheet, here are the 4 new mini bosses that have been added to the game:

## Sprite Positions and Names:

### Row 1 (Top):
- **Left**: `mini_inferno.png` (Orange/red armored ship)
  - Aggressive fire-based boss
  - Health: 8, Speed: 1.8, Points: 120
  - Movement: Aggressive pattern with burst shooting

- **Right**: `mini_kraken.png` (Blue/teal ship with tentacles)
  - Agile water/electric-based boss  
  - Health: 12, Speed: 1.5, Points: 150
  - Movement: Circling pattern with tentacle attacks

### Row 2 (Bottom):
- **Left**: `mini_ironclad.png` (Dark military ship)
  - Defensive tank boss with heavy armor
  - Health: 18, Speed: 0.8, Points: 200
  - Movement: Tactical pattern with shield abilities

- **Right**: `mini_venom.png` (Green ship with bio-tentacles)
  - Poison/organic-based boss
  - Health: 10, Speed: 1.3, Points: 140
  - Movement: Stalking pattern with poison attacks

## To Extract Individual Sprites:

1. Open your sprite sheet in an image editor (GIMP, Photoshop, etc.)
2. Each sprite appears to be roughly equal sized in the 2x2 grid
3. Extract each quadrant as a separate PNG file
4. Save with the names above to replace the placeholder images

## File Locations:
- `assets/bosses/mini_inferno.png`
- `assets/bosses/mini_kraken.png`
- `assets/bosses/mini_ironclad.png`
- `assets/bosses/mini_venom.png`

## Game Integration Status:
✅ Enemy types added to setupEnemyProperties()
✅ Added to mini boss spawning rotation
✅ Placeholder assets created
✅ Asset manager configured for loading
✅ Hit counter system implemented

The game will now spawn these 4 new mini bosses in rotation with the existing ones, and all enemies with health > 1 will display hit counters showing current/max health (e.g., "3/8").