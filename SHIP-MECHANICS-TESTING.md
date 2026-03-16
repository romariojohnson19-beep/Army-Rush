# Ship Mechanics Quick Reference

## How to Test Ship-Specific Features

### 1. Bullet Style Differences
The game automatically applies ship-specific bullet colors and sizes:
- **Basic Ship**: Green bullets (normal speed)
- **Heavy Ship**: Orange bullets (75% speed, slightly larger)
- **Fast Ship**: Cyan bullets (135% speed, slightly smaller)

### 2. Movement Feel Differences
Hold arrow keys and feel the difference:
- **Basic Ship**: Responsive, immediate movement
- **Heavy Ship**: Gradual acceleration, sluggish feel (like a tank)
- **Fast Ship**: Snappy, twitchy response (like a fighter)

### 3. In-Game Testing Steps
1. Start a game
2. Hold down LEFT or RIGHT arrow - feel the momentum build-up
3. Release the key - watch the ship decelerate smoothly
4. Compare between ships:
   - Heavy ship takes longer to reach full speed
   - Fast ship reaches full speed almost instantly
   - Basic ship is in between

### 4. Visual Observation
Watch the bullets you fire:
- Different colors = different ships
- Speed difference is noticeable when dodging
- Size difference is subtle but affects perceived "weight"

## Ship Selection
The game will use the ship type set in `js/player.js` constructor:
```javascript
this.shipType = 'basic'; // Change to 'heavy' or 'fast'
```

To cycle through ships in-game (if implemented):
- Look for ship selection screen at game start
- Or modify pilot-select.html to choose before starting

## Technical Details

### Bullet Properties
Each bullet carries ship information:
- `shipBulletColor`: Hex color code (#00FF00, #FF6600, #00DDFF)
- `shipBulletSizeOffset`: Size adjustment (-1, 0, +2 pixels)

These override default colors but are overridden by special bullet types.

### Movement Physics
- Base speed: 5 pixels/frame
- Momentum range: 0-5 units
- Max momentum boost: 2.5 pixels/frame
- Total max speed: 7.5 pixels/frame (5 + 2.5)

Acceleration varies:
- **Heavy**: 0.21 momentum/frame
- **Basic**: 0.30 momentum/frame
- **Fast**: 0.42 momentum/frame

### Effective Movement Speed Comparison
At maximum momentum:
- Heavy: 5 + (5 × 0.5) = 7.5 px/frame (BUT accelerates slower)
- Basic: 5 + (5 × 0.5) = 7.5 px/frame (BUT reaches it faster)
- Fast: 5 + (5 × 0.5) = 7.5 px/frame (AND reaches it fastest)

The difference is in **feel and responsiveness**, not final speed.

## Cheats/Testing Commands
Open browser console (F12) and try:
```javascript
// Change ship type at runtime
game.player.shipType = 'fast';
game.player.shipType = 'heavy';
game.player.shipType = 'basic';

// Check current ship properties
console.log(game.player.shipBulletStyles[game.player.shipType]);
console.log(game.player.shipMovementQuirks[game.player.shipType]);

// Check momentum
console.log(game.player.movementMomentum);
```

## What's Next?

Potential additions:
- [ ] Per-ship visual sprites (larger/smaller ship graphics)
- [ ] Per-ship sound effects (different engine pitches)
- [ ] Per-ship special abilities (heavy = shield boost, fast = dash, basic = reload speed)
- [ ] Per-ship starting equipment (heavy starts with more health, fast with faster fire rate)
- [ ] Per-ship cosmetic trails (heavy = thick orange trail, fast = thin cyan trail)
