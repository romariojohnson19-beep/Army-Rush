class PilotSelector {
    constructor() {
        this.saveSystem = new SaveSystem();
        this.characterSystem = new CharacterSystem(this.saveSystem);
        this.selectedPilot = null;
        this.spriteGenerator = new SpriteGenerator();
        
        this.init();
    }

    init() {
        this.updateCreditsDisplay();
        this.loadPilots();
        this.setupEventListeners();
        
        // Auto-select current pilot
        const currentPilot = this.characterSystem.getCurrentCharacter();
        if (currentPilot) {
            this.selectPilot(currentPilot.id);
        }
    }

    setupEventListeners() {
        const selectBtn = document.getElementById('selectPilotBtn');
        const backBtn = document.getElementById('backToMenuBtn');

        selectBtn.addEventListener('click', () => this.confirmSelection());
        backBtn.addEventListener('click', () => this.returnToMenu());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    updateCreditsDisplay() {
        const creditsElement = document.getElementById('pilotCredits');
        const credits = this.saveSystem.getCredits();
        creditsElement.textContent = credits.toLocaleString();
    }

    loadPilots() {
        const pilotGrid = document.getElementById('pilotGrid');
        const characters = this.characterSystem.getAllCharacters();
        
        pilotGrid.innerHTML = '';

        Object.values(characters).forEach((pilot, index) => {
            const pilotCard = this.createPilotCard(pilot, index);
            pilotGrid.appendChild(pilotCard);
        });
    }

    createPilotCard(pilot, index) {
        const isUnlocked = pilot.unlocked || this.characterSystem.saveSystem.data.unlockedCharacters.includes(pilot.id);
        
        const card = document.createElement('div');
        card.className = `pilot-card ${isUnlocked ? '' : 'locked'}`;
        card.dataset.pilotId = pilot.id;
        card.style.setProperty('--index', index);

        // Generate sprite image
        const spriteDataURL = this.spriteGenerator.generatePilotSprite(pilot.sprite, 60);
        
        card.innerHTML = `
            <div class="pilot-card-sprite" style="background-color: ${this.getRarityColor(pilot.rarity)}20;">
                <img src="${spriteDataURL}" alt="${pilot.name}" style="width: 100%; height: 100%; border-radius: 50%;">
            </div>
            <h3>${pilot.name}</h3>
            <div class="rarity ${pilot.rarity}">${pilot.rarity}</div>
            <div class="stats-preview">
                <div class="stat-mini">
                    <span class="label">SPD</span>
                    <span class="value">${pilot.stats.speed.toFixed(1)}</span>
                </div>
                <div class="stat-mini">
                    <span class="label">FIR</span>
                    <span class="value">${pilot.stats.fireRate.toFixed(1)}</span>
                </div>
                <div class="stat-mini">
                    <span class="label">ARM</span>
                    <span class="value">${pilot.stats.armor.toFixed(1)}</span>
                </div>
                <div class="stat-mini">
                    <span class="label">LCK</span>
                    <span class="value">${pilot.stats.luck.toFixed(1)}</span>
                </div>
            </div>
        `;

        // Add click event if unlocked
        if (isUnlocked) {
            card.addEventListener('click', () => this.selectPilot(pilot.id));
        }

        return card;
    }

    getSpriteIcon(spriteName) {
        const spriteIcons = {
            'player_basic': '🚀',
            'player_veteran': '⭐',
            'player_heavy': '🛡️',
            'player_fast': '⚡',
            'player_hunter': '🎯',
            'player_ghost': '👻',
            'player_destroyer': '💥',
            'player_phoenix': '🔥',
            'player_nightmare': '💀'
        };
        return spriteIcons[spriteName] || '🚀';
    }

    getRarityColor(rarity) {
        const colors = {
            'common': '#cccccc',
            'uncommon': '#00ff00',
            'rare': '#0080ff',
            'epic': '#8000ff',
            'legendary': '#ff8000',
            'mythic': '#ff0080'
        };
        return colors[rarity] || '#cccccc';
    }

    selectPilot(pilotId) {
        // Update visual selection
        document.querySelectorAll('.pilot-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-pilot-id="${pilotId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // Update details panel
        const pilot = this.characterSystem.getCharacter(pilotId);
        if (pilot) {
            this.selectedPilot = pilot;
            this.updateDetailsPanel(pilot);
            
            // Enable/disable select button
            const isUnlocked = pilot.unlocked || this.characterSystem.saveSystem.data.unlockedCharacters.includes(pilot.id);
            const selectBtn = document.getElementById('selectPilotBtn');
            selectBtn.disabled = !isUnlocked;
        }
    }

    updateDetailsPanel(pilot) {
        const isUnlocked = pilot.unlocked || this.characterSystem.saveSystem.data.unlockedCharacters.includes(pilot.id);
        
        // Basic info
        document.getElementById('pilotName').textContent = pilot.name;
        document.getElementById('pilotDescription').textContent = pilot.description;
        
        // Sprite
        const spriteElement = document.getElementById('pilotSprite');
        const largeSpriteDataURL = this.spriteGenerator.generatePilotSprite(pilot.sprite, 120);
        spriteElement.innerHTML = `<img src="${largeSpriteDataURL}" alt="${pilot.name}" style="width: 100%; height: 100%; border-radius: 10px;">`;
        spriteElement.style.backgroundColor = this.getRarityColor(pilot.rarity) + '20';
        spriteElement.style.borderColor = this.getRarityColor(pilot.rarity);

        // Stats
        this.updateStatBar('speed', pilot.stats.speed);
        this.updateStatBar('fireRate', pilot.stats.fireRate);
        this.updateStatBar('armor', pilot.stats.armor);
        this.updateStatBar('luck', pilot.stats.luck);

        // Bonuses
        this.updateBonuses(pilot.startingBonuses);

        // Unlock requirements
        this.updateUnlockInfo(pilot, isUnlocked);
    }

    updateStatBar(statName, value) {
        const barElement = document.getElementById(statName + 'Bar');
        const valueElement = document.getElementById(statName + 'Value');
        
        const percentage = Math.min((value / 2) * 100, 100); // Normalize to 0-200% range
        barElement.style.width = percentage + '%';
        valueElement.textContent = value.toFixed(1);
    }

    updateBonuses(bonuses) {
        const bonusContainer = document.getElementById('pilotBonuses');
        bonusContainer.innerHTML = '';

        if (Object.keys(bonuses).length === 0) {
            bonusContainer.innerHTML = '<p style="color: #666; font-style: italic;">No starting bonuses</p>';
            return;
        }

        Object.entries(bonuses).forEach(([key, value]) => {
            const bonusElement = document.createElement('div');
            bonusElement.className = 'bonus-item';
            
            const { name, description } = this.getBonusDescription(key, value);
            bonusElement.innerHTML = `
                <div class="bonus-name">${name}</div>
                <div class="bonus-desc">${description}</div>
            `;
            
            bonusContainer.appendChild(bonusElement);
        });
    }

    getBonusDescription(key, value) {
        const descriptions = {
            'extraLives': {
                name: 'Extra Lives',
                description: `Start with ${value} additional ${value === 1 ? 'life' : 'lives'}`
            },
            'shootRateMultiplier': {
                name: 'Enhanced Fire Rate',
                description: `${((1 - value) * 100).toFixed(0)}% faster shooting`
            },
            'speedMultiplier': {
                name: 'Speed Enhancement',
                description: `${((value - 1) * 100).toFixed(0)}% movement speed bonus`
            },
            'startingBulletLevel': {
                name: 'Advanced Weapons',
                description: `Start with Level ${value} bullets`
            },
            'startWithShield': {
                name: 'Shield Generator',
                description: 'Begin missions with energy shield active'
            }
        };

        return descriptions[key] || {
            name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            description: `Bonus: ${value}`
        };
    }

    updateUnlockInfo(pilot, isUnlocked) {
        const unlockContainer = document.getElementById('unlockInfo');
        
        if (isUnlocked) {
            unlockContainer.className = 'unlock-info unlocked';
            unlockContainer.innerHTML = `
                <div class="unlock-title unlocked">✓ PILOT AVAILABLE</div>
                <div class="unlock-desc">This pilot is ready for combat deployment.</div>
            `;
        } else {
            unlockContainer.className = 'unlock-info';
            const req = pilot.unlockRequirement;
            
            let requirementText = '';
            if (req.type === 'multiple') {
                requirementText = 'Complete all requirements:<br>';
                req.requirements.forEach(r => {
                    requirementText += `• ${this.formatRequirement(r)}<br>`;
                });
            } else {
                requirementText = this.formatRequirement(req);
            }
            
            unlockContainer.innerHTML = `
                <div class="unlock-title">🔒 LOCKED</div>
                <div class="unlock-desc">${requirementText}</div>
            `;
        }
    }

    formatRequirement(req) {
        const formats = {
            'distance': `Reach ${(req.value / 1000).toFixed(1)} km distance`,
            'survival': `Survive to ${(req.value / 1000).toFixed(1)} km`,
            'kills': `Achieve ${req.value.toLocaleString()} total kills`,
            'kills_single_game': `Kill ${req.value} enemies in a single game`,
            'bosses_single_game': `Defeat ${req.value} bosses in one game`,
            'total_bosses': `Defeat ${req.value} bosses total`,
            'distance_milestone': `Reach ${(req.value / 1000).toFixed(1)} km milestone`
        };

        return formats[req.type] || req.description || 'Complete special requirements';
    }

    confirmSelection() {
        if (!this.selectedPilot) return;

        const isUnlocked = this.selectedPilot.unlocked || 
            this.characterSystem.saveSystem.data.unlockedCharacters.includes(this.selectedPilot.id);
        
        if (!isUnlocked) return;

        // Save selection
        this.characterSystem.selectCharacter(this.selectedPilot.id);
        
        // Show confirmation
        this.showConfirmation();
        
        // Return to menu after short delay
        setTimeout(() => {
            this.returnToMenu();
        }, 2000);
    }

    showConfirmation() {
        // Create temporary confirmation overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 2px solid #00ff41;
                border-radius: 15px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
            ">
                <div style="margin-bottom: 20px;">
                    <img src="${this.spriteGenerator.generatePilotSprite(this.selectedPilot.sprite, 80)}" 
                         alt="${this.selectedPilot.name}" 
                         style="width: 80px; height: 80px; border-radius: 10px; border: 2px solid #00ff41;">
                </div>
                <h2 style="color: #00ff41; margin-bottom: 10px; font-size: 2rem;">PILOT SELECTED</h2>
                <p style="color: #ccc; font-size: 1.2rem;">${this.selectedPilot.name}</p>
                <p style="color: #666; margin-top: 10px;">Ready for deployment...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Auto-remove after delay
        setTimeout(() => {
            overlay.remove();
        }, 1800);
    }

    returnToMenu() {
        window.location.href = 'menu.html';
    }

    handleKeyPress(e) {
        switch(e.code) {
            case 'Escape':
                this.returnToMenu();
                break;
            case 'Enter':
                if (!document.getElementById('selectPilotBtn').disabled) {
                    this.confirmSelection();
                }
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                this.navigateWithKeyboard(e.code);
                e.preventDefault();
                break;
        }
    }

    navigateWithKeyboard(keyCode) {
        const cards = Array.from(document.querySelectorAll('.pilot-card:not(.locked)'));
        if (cards.length === 0) return;

        let currentIndex = -1;
        cards.forEach((card, index) => {
            if (card.classList.contains('selected')) {
                currentIndex = index;
            }
        });

        let newIndex = currentIndex;
        
        switch(keyCode) {
            case 'ArrowLeft':
                newIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
                break;
            case 'ArrowRight':
                newIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                newIndex = Math.max(0, currentIndex - 3); // Assuming 3 columns
                break;
            case 'ArrowDown':
                newIndex = Math.min(cards.length - 1, currentIndex + 3);
                break;
        }

        if (newIndex !== currentIndex && cards[newIndex]) {
            const pilotId = cards[newIndex].dataset.pilotId;
            this.selectPilot(pilotId);
            
            // Scroll into view
            cards[newIndex].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PilotSelector();
});