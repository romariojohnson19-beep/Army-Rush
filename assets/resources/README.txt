Sprite Placement Guide

Place the following sprite sheets to replace emoji/icon rendering for resources & power-ups:

1. resources.png  (path: assets/resources/resources.png)
   - 32x32 tiles
   - Row 0, Cols:
       0: energy
       1: metal
       2: crystals
       3: darkMatter

2. powerups.png   (path: assets/powerups/powerups.png)
   - 32x32 tiles
   - Row 0, Cols:
       0: rapidFire
       1: multiShot
       2: shield
       3: health
       4: speedBoost
       5: scoreMultiplier
       6: currencyDoubler
       7: nuke
       8: heatSeekingMissiles
       9: angularShots
      10: radio
      11: toolbox
      12: mutation

Optional: Provide higher resolution sheets (e.g., 64x64 tiles) and adjust SPRITE_SIZE in js/resource-sprite-renderer.js accordingly.

If sheets are missing, the game falls back to procedural pixel art shapes.