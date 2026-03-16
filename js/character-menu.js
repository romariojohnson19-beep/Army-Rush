class CharacterMenu {
    constructor(characterSystem, canvas, ctx) {
        this.characterSystem = characterSystem;
        this.canvas = canvas;
        this.ctx = ctx;
        this.selectedIndex = 0;
        this.characters = [];
        this.showUnlockRequirements = false;
        this.scrollOffset = 0;
        this.maxVisibleCharacters = 3;
        
        this.setupEventListeners();
        this.refreshCharacters();
    }

    setupEventListeners() {
        this.boundKeyHandler = (e) => this.handleKeyPress(e);
    }

    activate() {
        document.addEventListener('keydown', this.boundKeyHandler);
        this.refreshCharacters();
    }

    deactivate() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }

    refreshCharacters() {
        this.characters = Object.values(this.characterSystem.getAllCharacters());
        // Sort: unlocked first, then by rarity
        this.characters.sort((a, b) => {
            const aUnlocked = a.unlocked || this.characterSystem.saveSystem.data.unlockedCharacters.includes(a.id);
            const bUnlocked = b.unlocked || this.characterSystem.saveSystem.data.unlockedCharacters.includes(b.id);
            
            if (aUnlocked !== bUnlocked) {
                return bUnlocked ? 1 : -1; // Unlocked first
            }
            
            // Then by rarity
            const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
            return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        });

        // Set selected index to current character
        const currentId = this.characterSystem.currentCharacter;
        this.selectedIndex = Math.max(0, this.characters.findIndex(c => c.id === currentId));
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                this.updateScroll();
                break;
            
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.characters.length - 1, this.selectedIndex + 1);
                this.updateScroll();
                break;
            
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.selectCharacter();
                break;
            
            case 'Tab':
                e.preventDefault();
                this.showUnlockRequirements = !this.showUnlockRequirements;
                break;
            
            case 'Escape':
                e.preventDefault();
                return 'back';
                break;
        }
        return null;
    }

    updateScroll() {
        if (this.selectedIndex < this.scrollOffset) {
            this.scrollOffset = this.selectedIndex;
        } else if (this.selectedIndex >= this.scrollOffset + this.maxVisibleCharacters) {
            this.scrollOffset = this.selectedIndex - this.maxVisibleCharacters + 1;
        }
    }

    selectCharacter() {
        const character = this.characters[this.selectedIndex];
        const isUnlocked = character.unlocked || 
            this.characterSystem.saveSystem.data.unlockedCharacters.includes(character.id);
        
        if (isUnlocked) {
            this.characterSystem.selectCharacter(character.id);
            return 'selected';
        }
        return null;
    }

    draw() {
        // Clear screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT CHARACTER', this.canvas.width / 2, 60);

        // Instructions
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('↑↓ Navigate | Enter: Select | Tab: Toggle Info | Esc: Back', this.canvas.width / 2, 90);

        // Character list
        const startY = 130;
        const characterHeight = 120;
        const visibleCharacters = this.characters.slice(this.scrollOffset, this.scrollOffset + this.maxVisibleCharacters);

        for (let i = 0; i < visibleCharacters.length; i++) {
            const character = visibleCharacters[i];
            const globalIndex = this.scrollOffset + i;
            const y = startY + (i * characterHeight);
            const isSelected = globalIndex === this.selectedIndex;
            const isUnlocked = character.unlocked || 
                this.characterSystem.saveSystem.data.unlockedCharacters.includes(character.id);
            const isCurrent = character.id === this.characterSystem.currentCharacter;

            this.drawCharacterCard(character, y, isSelected, isUnlocked, isCurrent);
        }

        // Scroll indicators
        if (this.scrollOffset > 0) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('▲', this.canvas.width / 2, startY - 10);
        }
        
        if (this.scrollOffset + this.maxVisibleCharacters < this.characters.length) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('▼', this.canvas.width / 2, startY + (this.maxVisibleCharacters * characterHeight) + 20);
        }

        // Progress to next unlock
        if (!this.showUnlockRequirements) {
            this.drawNextUnlockProgress();
        }
    }

    drawCharacterCard(character, y, isSelected, isUnlocked, isCurrent) {
        const cardWidth = 600;
        const cardHeight = 100;
        const x = (this.canvas.width - cardWidth) / 2;

        // Background
        if (isSelected) {
            this.ctx.fillStyle = isUnlocked ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 100, 100, 0.3)';
        } else {
            this.ctx.fillStyle = isUnlocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(100, 100, 100, 0.1)';
        }
        this.ctx.fillRect(x, y, cardWidth, cardHeight);

        // Border
        this.ctx.strokeStyle = isSelected ? '#00ffff' : (isUnlocked ? '#ffffff' : '#666666');
        this.ctx.lineWidth = isSelected ? 3 : 1;
        this.ctx.strokeRect(x, y, cardWidth, cardHeight);

        // Current character indicator
        if (isCurrent) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText('CURRENT', x + cardWidth - 10, y + 20);
        }

        // Rarity stripe
        this.ctx.fillStyle = this.characterSystem.getRarityColor(character.rarity);
        this.ctx.fillRect(x, y, 8, cardHeight);

        // Character info
        const textX = x + 20;
        const iconSize = 40;

        // Character "icon" (placeholder colored circle)
        this.ctx.fillStyle = isUnlocked ? this.characterSystem.getRarityColor(character.rarity) : '#666666';
        this.ctx.beginPath();
        this.ctx.arc(textX + iconSize/2, y + 30, iconSize/2, 0, Math.PI * 2);
        this.ctx.fill();

        // Character name
        this.ctx.fillStyle = isUnlocked ? '#ffffff' : '#888888';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(character.name, textX + iconSize + 15, y + 25);

        // Rarity
        this.ctx.fillStyle = this.characterSystem.getRarityColor(character.rarity);
        this.ctx.font = '14px Arial';
        this.ctx.fillText(character.rarity.toUpperCase(), textX + iconSize + 15, y + 45);

        // Description or unlock requirement
        if (isUnlocked || !this.showUnlockRequirements) {
            this.ctx.fillStyle = isUnlocked ? '#cccccc' : '#666666';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(character.description, textX + iconSize + 15, y + 65);
        } else {
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Unlock: ${character.unlockRequirement.description}`, textX + iconSize + 15, y + 65);
            
            // Progress bar for some requirements
            const progress = this.characterSystem.getUnlockProgress(character);
            if (progress.percentage > 0) {
                this.drawProgressBar(textX + iconSize + 15, y + 75, 200, 8, progress.percentage);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(`${progress.current}/${progress.target}`, textX + iconSize + 225, y + 82);
            }
        }

        // Stats preview (if unlocked and not showing requirements)
        if (isUnlocked && !this.showUnlockRequirements) {
            this.drawStatsPreview(character, x + cardWidth - 150, y + 10);
        }

        // Lock icon for locked characters
        if (!isUnlocked) {
            this.ctx.fillStyle = '#ff6666';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🔒', textX + iconSize/2, y + 35);
        }
    }

    drawStatsPreview(character, x, y) {
        const stats = character.stats;
        const statNames = ['SPD', 'FIRE', 'ARM', 'LUCK'];
        const statValues = [stats.speed, stats.fireRate, stats.armor, stats.luck];
        
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        
        for (let i = 0; i < statNames.length; i++) {
            const statY = y + (i * 15);
            
            // Stat name
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.fillText(statNames[i], x, statY + 10);
            
            // Stat bars
            const barWidth = 60;
            const barHeight = 8;
            const value = Math.min(2, statValues[i]); // Cap at 2 for display
            
            // Background
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(x + 35, statY + 2, barWidth, barHeight);
            
            // Value
            let color = '#00ff00';
            if (value < 1) color = '#ff6666';
            else if (value > 1) color = '#00ffff';
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x + 35, statY + 2, (value / 2) * barWidth, barHeight);
        }
    }

    drawProgressBar(x, y, width, height, percentage) {
        // Background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, width, height);
        
        // Progress
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(x, y, (percentage / 100) * width, height);
        
        // Border
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
    }

    drawNextUnlockProgress() {
        const nextUnlock = this.characterSystem.getProgressToNextUnlock();
        if (!nextUnlock) return;

        const y = this.canvas.height - 80;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Next Unlock: ${nextUnlock.character.name}`, this.canvas.width / 2, y);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillText(nextUnlock.character.unlockRequirement.description, this.canvas.width / 2, y + 20);
        
        // Progress bar
        const barWidth = 300;
        const barX = (this.canvas.width - barWidth) / 2;
        this.drawProgressBar(barX, y + 30, barWidth, 12, nextUnlock.progress.percentage);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(
            `${nextUnlock.progress.current}/${nextUnlock.progress.target} (${Math.floor(nextUnlock.progress.percentage)}%)`,
            this.canvas.width / 2, y + 55
        );
    }
}