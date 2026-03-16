# Power-Ups Sprite Sheet Guide

Provide a single sprite sheet image named `powerups.png` in this folder.

Recommended specs:
- Dimensions: 416x32 (13 columns x 1 row) OR 416x64 (for 2 animation frames) at 32x32 tiles
- Tile Size: 32x32 pixels
- Transparent background, crisp pixel edges (disable filtering when scaling)

Tile index mapping (columns left to right):
0. rapidFire
1. multiShot
2. shield
3. health
4. speedBoost
5. scoreMultiplier
6. currencyDoubler
7. nuke
8. heatSeekingMissiles
9. angularShots
10. radio
11. toolbox
12. mutation

Optional animation: Add a second row (row index 1) with an alternate frame; renderer can be extended to flip frames every few ticks.

Design Tips:
- Keep silhouette distinct at 16x16 preview scale.
- Use a 1px outline with high-contrast accent color.
- Reserve 2-3 pixels of interior highlight for glow pulses.
- Avoid fully opaque neon; use 80-90% to allow additive glow layers.

Future Expansion:
- Row 2: Elite / Epic variants
- Row 3: Legendary variants
- Animated multi-frame vertical stacking (32x32 each) if needed.

Once added, the `ResourceSpriteRenderer` and `power-up` HUD chip will automatically use these tiles (after reload).
