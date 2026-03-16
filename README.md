# Army Rush Clone Game

A retro-style HTML5 Canvas 2D army rush clone game with horizontal movement mechanics and automatic shooting. Built with vanilla JavaScript and designed for easy sprite integration.

## 🎮 Game Features

- **Horizontal Movement Only**: Players move left and right using arrow keys
- **Automatic Shooting**: Continuous projectile firing without manual input
- **Advanced Enemy System**: 8 enemy types with unique AI patterns and boss battles
- **Distance-Based Progression**: Continuous difficulty scaling based on distance traveled
- **Power-up System**: 6 different upgrades with visual effects and timers
- **Collision Detection**: Precise hit detection for all game objects
- **Scoring System**: Points awarded for enemy destruction with multipliers
- **Damage Meter HUD**: Segment-based hull meter replaces lives; clear cockpit-style health bar with invulnerability frames and shield protection
- **Unified Cyberpunk Cockpit Theme**: Shared CSS (`css/cyberpunk-theme.css`) across menu, game, pilot select, and base builder pages
- **Pixel Art Ready**: Optimized rendering for 2D sprite integration
- **Particle Effects**: Explosion animations and power-up visual feedback

## 🕹️ Controls

| Key | Action |
|-----|--------|
| ← → | Move player horizontally |
| SPACE/ESC | Pause/Resume game |

*Note: Shooting is automatic - no manual shooting required!*

## 🏗️ Project Structure

```
Army Rush/
├── index.html          # Main game page
├── css/
│   └── style.css       # Game styling and UI
├── js/
│   ├── game.js         # Core game loop and logic
│   ├── player.js       # Player movement and shooting
│   ├── enemy.js        # Enemy AI and spawning
│   └── projectile.js   # Bullet physics and rendering
├── assets/
│   └── README.md       # Sprite integration guide
└── .github/
    └── copilot-instructions.md
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with HTML5 Canvas support
- Local web server (for file loading)

### Running the Game

1. **Start Development Server** (recommended):
   - Use the VS Code task: Terminal > Run Task > "Start Development Server"
   - Or run locally: `python -m http.server 8000`

2. **Open in Browser**:
   Navigate to `http://localhost:8000`

3. **Play**: Use arrow keys to move, shooting is automatic!

## 🧭 Menu & UI Notes

- The menu now uses a contained GUI window with a canvas-driven vortex background. The canvas renderer is implemented in `js/vortex-bg.js` and clips the artwork to the GUI window's per-corner border radius for a polished look.
- To preview the menu locally start a static server from the project root and open `menu.html` (for example `npm run start` or the provided VS Code task "Start Development Server").


## 🎨 Sprite Integration

The game is designed for easy 2D pixel art integration:

- **Current**: Uses geometric shapes as placeholders
- **Ready For**: PNG sprites with transparency
- **Recommended Size**: 32x32px or 16x24px for pixel art
- **Animation Support**: Frame-based sprite sheets supported
- **File Structure**: See `assets/README.md` for detailed guide

### Adding Your Sprites

1. Place sprite files in `assets/sprites/`
2. Modify the respective `draw()` methods in:
   - `js/player.js` - Player sprites
   - `js/enemy.js` - Enemy sprites  
   - `js/projectile.js` - Bullet sprites
3. Update collision detection if sprite sizes differ

## ⚡ Power-up System

### Available Power-ups (in-game now)

| Power-up | Effect | Duration | Rarity |
|----------|--------|----------|--------|
| 🟢 Rapid Fire | 3x faster shooting rate | 10s | Common |
| 🟠 Multi Shot | Fire multiple bullets simultaneously | 8s | Common |
| 🔵 Shield | Absorb damage until depleted | 15s | Common |
| 🟣 Health+ | Restore 1 health segment | Instant | Uncommon |
| 🟡 Speed Boost | 1.5x movement speed | 12s | Uncommon |
| 🟪 2x Score | Double score from enemies | 10s | Rare |
| 🟨 Currency Doubler | Double coin rewards (hit-to-collect) | 8s | Rare |
| ☢ Nuke | Clear regular enemies, damage bosses | Instant | Very Rare |

Experimental (defined but not spawned by default): Heat-Seeking Missiles, Angular Shots.

### Power-up Features
- **Visual Effects**: Glowing icons with rotation and pulsing animations
- **Particle Systems**: Collection and activation particle effects
- **Real-time UI**: Active power-up timers with warning indicators
- **Stacking**: Multiple different power-ups can be active simultaneously
- **Smart Spawning**: Weighted random system prevents over-spawning rare items

## 🎯 Advanced Game Mechanics

### Player
- **Movement**: Horizontal only (5px/frame base speed, 1.5x with Speed Boost)
- **Shooting**: Auto-fire every 15 frames (4 shots/second, 12 shots/second with Rapid Fire)
- **Damage Meter**: 3+ health segments with 2-second invulnerability after hit; milestones and Health+ restore segments
- **Shield**: Blocks damage when active, with visual indicator
- **Boundaries**: Cannot move outside canvas edges

### 🤖 Enemy Types & AI Patterns

| Enemy Type | Size | HP | Speed | Attack Pattern | Special Ability |
|------------|------|----|----|----------------|-----------------|
| **Basic** | 30x30 | 1 | 1x | Straight down | Standard shooting |
| **Fast** | 25x25 | 1 | 2x | Zigzag movement | Rapid movement |
| **Tank** | 40x40 | 3 | 0.5x | Straight down | Heavy armor |
| **Sniper** | 28x35 | 2 | 0.8x | Stop & shoot | Accurate long shots |
| **Bomber** | 35x28 | 2 | 1.5x | Dive attack | Burst fire (3 shots) |
| **Swarm** | 20x20 | 1 | 2.5x | Erratic movement | Unpredictable paths |
| **Heavy** | 50x45 | 5 | 0.3x | Straight down | Twin cannon shots |
| **Boss** | 70x60 | 15+ | 0.4x | Side-to-side | Multi-phase attacks |

### 🌊 Wave Progression System
- **Dynamic Scaling**: Enemy health/speed increases with wave number
- **Formation Attacks**: V-formation, line, and diamond patterns (Wave 3+)
- **Boss Battles**: Every 5th wave features a boss enemy
- **Progressive Unlocks**: New enemy types unlock as waves advance
- **Adaptive Difficulty**: Spawn rates and aggression scale with progress

### 🛣️ Distance-Based Difficulty System
- **Continuous Tracking**: Real-time distance measurement in kilometers
- **Progressive Difficulty**: 10% multiplier increase per kilometer traveled
- **Enemy Scaling**: Health (+1 HP/10km), Speed (+2%/km), Aggression (faster shooting)
- **Spawn Rate Increases**: Enemies spawn faster every 2km traveled
- **Dynamic Background**: Star field speed increases with distance traveled

### 🎮 Advanced Combat Mechanics
- **Formation Flying**: Coordinated enemy attack patterns
- **Multi-Phase Bosses**: Changing attack patterns during boss fights
- **Burst Attacks**: Some enemies fire multiple projectiles
- **Screen Shake**: Visual feedback for major events
- **Boss Warnings**: Alert system for incoming boss waves

### Projectiles
- **Player Bullets**: Fast, green, move upward
- **Enemy Bullets**: Varied speeds and patterns per enemy type
- **Boss Attacks**: Spread shots, rapid fire, and homing patterns
- **Collision**: Destroy on impact with targets

## 🏆 Advanced Scoring & Progression

| Enemy Type | Base Points | Wave Scaling | Special Bonus |
|------------|-------------|--------------|---------------|
| Basic      | 10          | +20%/wave    | Formation +50% |
| Fast       | 20          | +20%/wave    | Zigzag bonus |
| Tank       | 50          | +20%/wave    | Armor penetration |
| Sniper     | 30          | +20%/wave    | Precision bonus |
| Bomber     | 40          | +20%/wave    | Multi-kill bonus |
| Swarm      | 15          | +20%/wave    | Speed bonus |
| Heavy      | 80          | +20%/wave    | Heavy destruction |
| Boss       | 200         | +50%/wave    | Boss victory bonus |

### 🏆 Distance Milestone System

| Milestone Type | Frequency | Rewards | Visual Effect |
|---------------|-----------|---------|---------------|
| **Regular** | Every 5km | Power-up (80%), +15x score bonus | Screen shake + particles |
| **Major** | Every 10km | Rare power-up + health restore + 25x score | Enhanced effects |

### 📊 Statistics Tracking
- **Kill Counter**: Total enemies destroyed
- **Distance Tracker**: Kilometers traveled with difficulty multiplier
- **Wave Progression**: Current wave with boss indicators
- **Score Multipliers**: Power-up and distance bonuses applied
- **Milestone Progress**: Next milestone indicator with achievements

## 🛠️ Development

### Architecture
- **Modular Design**: Separate classes for each game component
- **Game Loop**: RequestAnimationFrame for smooth 60fps
- **Event-Driven**: Keyboard input handling with key state tracking
- **Object Pooling Ready**: Easy to implement for performance optimization

### Key Classes
- `Game`: Main game loop, collision detection, state management
- `Player`: Movement, shooting, input handling, power-up management
- `Enemy`: AI behavior, multiple types, health system
- `Projectile`: Physics simulation, collision boundaries
- `EnemySpawner`: Wave progression, difficulty scaling
- `PowerUp`: 6 different upgrade types with visual effects
- `PowerUpManager`: Weighted spawning system with cooldowns
- `PowerUpEffect`: Particle effects for collection and activation
- `Explosion`: Particle effects system

### Performance Features
- Efficient collision detection
- Object cleanup for memory management
- Optimized rendering with pixel-perfect graphics
- Background star field animation

## 🎵 Audio Integration (Ready)

The game structure supports easy audio integration:
- Add sound files to `assets/sounds/`
- Integrate Web Audio API or HTML5 Audio
- Recommended sounds: shoot.wav, explosion.wav, hit.wav

## 🎛️ Theme & HUD

- Shared cockpit theme in `css/cyberpunk-theme.css` with:
   - `cp-panel`: white, beveled panels, subtle scanlines
   - `cp-btn`: cyberpunk buttons with glow and ripple press effect
- Game HUD includes: health/damage meter, navigation compass, active power-ups chip, resources (Energy/Metal/Crystals/Dark Matter), combo/streak.

## 🔧 Customization

### Easy Modifications
- **Speed**: Adjust `speed` properties in respective classes
- **Difficulty**: Modify spawn rates in `EnemySpawner`
- **Visuals**: Update `draw()` methods for different graphics
- **Controls**: Extend input handling in `Player` class
- **Game Rules**: Adjust scoring, lives, wave progression

### Adding New Features
- **Power-ups**: Extend `Game` class collision detection
- **Boss Enemies**: Create new enemy types with special behavior
- **Multiplayer**: Extend with multiple `Player` instances
- **Mobile Support**: Add touch controls to input system

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🐛 Troubleshooting

**Game won't load**: Ensure you're using a local server, not `file://` protocol
**Laggy performance**: Check browser developer tools for JavaScript errors
**Controls not working**: Click on the game canvas to focus input

## 🔮 Future Enhancements

- [ ] Sound effects and background music
- [ ] Local high score storage
- [ ] Multiple difficulty levels
- [ ] Boss battles
- [x] ~~Power-up system~~ ✅ **COMPLETED**
- [ ] Mobile touch controls
- [ ] Sprite animation system
- [ ] Screen shake effects
- [ ] Chain combos and score streaks
- [ ] Additional power-up types (freeze enemies, laser beam, etc.)
- [ ] Power-up upgrade trees

## 📄 License

---

**Ready for your pixel art sprites!** 🎨 The game engine is fully functional and optimized for 2D sprite integration.
