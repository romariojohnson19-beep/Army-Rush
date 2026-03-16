# Ship-Specific Mechanics Implementation

## Overview
Each ship type now has unique bullet styles and movement quirks, adding strategic variety to gameplay.

## Ship Types & Characteristics

### 🟢 Basic Ship
- **Bullet Color**: Green (#00FF00)
- **Bullet Speed**: 1.0× normal speed
- **Bullet Size**: Standard
- **Movement Acceleration**: 1.0× normal
- **Turn Responsiveness**: 1.0× normal
- **Feel**: Balanced, responsive

### 🟠 Heavy Ship
- **Bullet Color**: Orange (#FF6600)
- **Bullet Speed**: 0.75× normal speed (slower)
- **Bullet Size**: +2 pixels
- **Movement Acceleration**: 0.7× normal (sluggish)
- **Turn Responsiveness**: 0.8× normal (less agile)
- **Feel**: Powerful, tanky, deliberate

### 🔵 Fast Ship
- **Bullet Color**: Cyan (#00DDFF)
- **Bullet Speed**: 1.35× normal speed (faster)
- **Bullet Size**: -1 pixel (smaller)
- **Movement Acceleration**: 1.4× normal (twitchy)
- **Turn Responsiveness**: 1.25× normal (hyper-responsive)
- **Feel**: Nimble, high-risk/high-reward

## Implementation Details

### Bullet System
Each ship type fires projectiles with:
1. **Unique Color**: Visually distinct bullets make it clear which ship is firing
2. **Speed Variation**: Heavy ships fire slower but bigger bullets; Fast ships fire faster but smaller
3. **Size Modification**: Represented in the `shipBulletSizeOffset` parameter

**Code Location**: `js/player.js` - `shipBulletStyles` object
- Passed to projectile system via `upgradeInfo.shipBulletColor` and `upgradeInfo.shipBulletSizeOffset`
- Special bullet types (piercing, explosive, heat-seeking) override ship color but preserve sizing

### Movement System
Movement now includes **momentum acceleration** based on ship type:

1. **Acceleration Phase**: Holding movement keys builds momentum (0-5 max)
   - Basic: Standard acceleration (0.3 per frame)
   - Heavy: Slower acceleration (0.21 per frame, 70% × 0.3)
   - Fast: Faster acceleration (0.42 per frame, 140% × 0.3)

2. **Speed Boost**: Momentum adds 0.5 pixels per momentum unit
   - Max boost: 2.5 pixels/frame from momentum alone

3. **Deceleration Phase**: Releasing keys smoothly decelerates momentum (0.15 per frame)

**Code Location**: `js/player.js` - `update()` method
- Uses `this.movementMomentum` and `this.shipMovementQuirks` for ship-specific physics

## Gameplay Impact

| Aspect | Basic | Heavy | Fast |
|--------|-------|-------|------|
| Damage Output | Medium | Medium (slower fire) | Medium (faster fire) |
| Projectile Travel | Fast arrival | Slow arrival | Very fast arrival |
| Maneuverability | Responsive | Sluggish | Twitchy |
| Skill Floor | Low | Low | Medium |
| Skill Ceiling | Medium | Low | High |
| Best For | Balanced play | Defensive tanks | Aggressive pilots |

## Visual Feedback

### Bullet Colors in Action
- **Green bullets** from basic ships blend well with neutral environments
- **Orange bullets** from heavy ships command visual attention (tanks holding the line)
- **Cyan bullets** from fast ships feel zippy and energetic (hit-and-run tactics)

### Movement Feel
- **Heavy Ship**: Smooth, controlled movement with ramp-up time (like momentum inertia)
- **Fast Ship**: Immediate, jittery response to input (like zero-inertia acceleration)
- **Basic Ship**: Middle ground for player comfort

## Future Enhancement Ideas

1. **Visual Ship Differentiation**: Add sprite scaling or shader effects
2. **Sound Design**: Different bullet/engine sounds per ship
3. **Hitbox Adjustments**: Larger hitboxes for heavy ships, smaller for fast
4. **Charge Mechanics**: Heavy ships charge shots for burst damage
5. **Positioning Bonuses**: Heavy ships reduce knockback, fast ships gain dash attacks

## Testing Checklist

- [ ] Switch between ships and verify distinct bullet colors
- [ ] Hold movement key and feel acceleration ramp-up
- [ ] Release movement key and verify smooth deceleration
- [ ] Test heavy ship feeling sluggish vs fast ship twitchiness
- [ ] Verify projectiles inherit ship color in combat
- [ ] Confirm special bullet types (piercing, explosive) display correctly with ship colors

## Files Modified

1. `js/player.js`
   - Added `shipBulletStyles` object with color/speed/size per ship
   - Added `shipMovementQuirks` object with acceleration/turn multipliers
   - Added `movementMomentum` system with acceleration/deceleration
   - Updated `shoot()` method to pass ship style to projectiles
   - Updated `update()` method with momentum-based movement physics

2. `js/projectile.js`
   - Added `shipBulletColor` and `shipBulletSizeOffset` properties
   - Updated `reset()` to apply ship-specific sizing and coloring
   - Special bullets (piercing/explosive/heat-seeking) preserve color override
