class BaseBuilderUI {
    constructor() {
        this.resourceManager = null;
        this.baseBuildingManager = new BaseBuildingManager();
        this.currentCheckpoint = null;
        this.selectedBuilding = null;
        this.selectedSlot = { x: -1, y: -1 };
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadGameData();
    }

    initializeElements() {
        // Header elements
        this.checkpointTitle = document.getElementById('checkpoint-title');
        this.checkpointTier = document.getElementById('checkpoint-tier');
        
        // Resource displays
        this.resourceDisplays = {
            energy: document.getElementById('energy-display'),
            metal: document.getElementById('metal-display'),
            crystals: document.getElementById('crystals-display'),
            darkMatter: document.getElementById('darkmatter-display')
        };
        this.blueprintDisplay = document.getElementById('blueprints-display');

        // Main interface elements
        this.categoryTabs = document.querySelectorAll('.category-tab');
        this.baseGrid = document.getElementById('base-grid');
        this.buildingsList = document.getElementById('buildings-list');
        
        // Base stats
        this.powerGeneration = document.getElementById('power-generation');
        this.defenseRating = document.getElementById('defense-rating');
        this.researchSpeed = document.getElementById('research-speed');
        
        // Popup elements
        this.buildingDetailsPopup = document.getElementById('building-details');
        this.buildingImage = document.getElementById('building-image');
        this.buildingName = document.getElementById('building-name');
        this.buildingDescription = document.getElementById('building-description');
        this.buildingStats = document.getElementById('building-stats');
        this.buildingCost = document.getElementById('building-cost');
        this.buildButton = document.getElementById('build-button');
        this.upgradeButton = document.getElementById('upgrade-button');
        this.demolishButton = document.getElementById('demolish-button');
        
        // Control buttons
        this.saveBaseButton = document.getElementById('save-base');
    this.shipForgeButton = document.getElementById('ship-forge');
        this.returnToGameButton = document.getElementById('return-to-game');
        this.viewAllBasesButton = document.getElementById('view-all-bases');
        
        // Notifications
        this.notificationsContainer = document.getElementById('notifications');
    }

    setupEventListeners() {
        // Category tabs
        this.categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = tab.dataset.category;
                this.selectCategory(category);
            });
        });

        // Popup controls
        document.getElementById('close-details').addEventListener('click', () => {
            this.hidePopup();
        });

        this.buildButton.addEventListener('click', () => {
            this.buildSelectedBuilding();
        });

        this.upgradeButton.addEventListener('click', () => {
            this.upgradeSelectedBuilding();
        });

        this.demolishButton.addEventListener('click', () => {
            this.demolishSelectedBuilding();
        });

        // Control buttons
        this.saveBaseButton.addEventListener('click', () => {
            this.saveBase();
        });

        if (this.shipForgeButton) {
            this.shipForgeButton.addEventListener('click', () => this.openForge());
        }

        this.returnToGameButton.addEventListener('click', () => {
            this.returnToGame();
        });

        this.viewAllBasesButton.addEventListener('click', () => {
            this.viewAllBases();
        });

        // Close popup on outside click
        this.buildingDetailsPopup.addEventListener('click', (e) => {
            if (e.target === this.buildingDetailsPopup) {
                this.hidePopup();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePopup();
            }
        });
    }

    loadGameData() {
        // Load from localStorage or URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.currentCheckpoint = parseInt(urlParams.get('checkpoint')) || 5;
        
        // Initialize resource manager
        this.resourceManager = new GalaxyResourceManager();
        
        // Load saved data
        const savedData = localStorage.getItem('galaxyConquest');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.resourceManager.fromSaveData(data.resources || {});
            this.baseBuildingManager.fromSaveData(data.bases || {});
        }

        this.initializeBase();
        this.updateUI();
    }

    initializeBase() {
        let base = this.baseBuildingManager.getBase(this.currentCheckpoint);
        
        if (!base) {
            // Create new base
            const tier = this.calculateTier(this.currentCheckpoint);
            base = this.baseBuildingManager.createBase(this.currentCheckpoint, tier);
        }
        
        this.baseBuildingManager.setCurrentBase(this.currentCheckpoint);
        this.updateCheckpointInfo(base.tier);
        this.generateBaseGrid();
        this.selectCategory('infrastructure');
    }

    calculateTier(distance) {
        if (distance >= 100) return 'legendary';
        if (distance >= 50) return 'epic';
        if (distance >= 25) return 'rare';
        if (distance >= 10) return 'uncommon';
        return 'common';
    }

    updateCheckpointInfo(tier) {
        this.checkpointTitle.textContent = `🛸 Space Port Station - ${this.currentCheckpoint}km`;
        
        const tierNames = {
            common: 'Common Zone',
            uncommon: 'Active Sector',
            rare: 'Strategic Outpost',
            epic: 'Advanced Terminal',
            legendary: 'Elite Command Hub'
        };
        
        this.checkpointTier.textContent = `SECTOR: ${tierNames[tier] || 'Unknown'}`;
        this.checkpointTier.className = `checkpoint-tier ${tier}`;
    }

    generateBaseGrid() {
        this.baseGrid.innerHTML = '';
        
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 8; x++) {
                const slot = document.createElement('div');
                slot.className = 'building-slot';
                slot.dataset.x = x;
                slot.dataset.y = y;
                
                const building = this.baseBuildingManager.currentBase.grid[x][y];
                if (building) {
                    slot.classList.add('occupied');
                    slot.innerHTML = `
                        <div class="building-in-slot">
                            <div class="building-icon">${building.icon}</div>
                            <div class="building-label">${building.name}</div>
                            <div class="building-level">Lv.${building.level}</div>
                        </div>
                    `;
                }
                
                slot.addEventListener('click', () => {
                    this.selectSlot(x, y);
                });
                
                this.baseGrid.appendChild(slot);
            }
        }
    }

    selectCategory(category) {
        // Update tab appearance
        this.categoryTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        this.baseBuildingManager.selectedCategory = category;
        this.updateBuildingsList(category);
    }

    updateBuildingsList(category) {
        this.buildingsList.innerHTML = '';
        
        const buildings = this.baseBuildingManager.getBuildingsByCategory(category);
        const playerProgress = { bestDistance: this.currentCheckpoint };
        
        buildings.forEach(buildingId => {
            const buildingData = BUILDING_DEFINITIONS[buildingId];
            const building = new Building(...buildingData);
            
            // Check distance unlock and blueprint unlock status, but show locked items (greyed) with reason
            const distanceUnlocked = building.isUnlocked(playerProgress);
            const bpKey = building.requirements && building.requirements.blueprint ? building.requirements.blueprint : null;
            const blueprintUnlocked = !bpKey || (this.resourceManager && this.resourceManager.isBlueprintUnlocked(bpKey));
            const isLocked = !distanceUnlocked || !blueprintUnlocked;

            const buildingItem = document.createElement('div');
            buildingItem.className = 'building-item';
            if (isLocked) buildingItem.classList.add('locked');
            
            const canAfford = building.canAfford(this.resourceManager.resources);
            buildingItem.classList.add(canAfford ? 'affordable' : 'expensive');
            if (blueprintUnlocked) {
                // show unlocked badge for items that required blueprint and are now available
                if (bpKey) {
                    const badge = document.createElement('div');
                    badge.className = 'locked-badge';
                    badge.textContent = 'Blueprint Unlocked';
                    buildingItem.appendChild(badge);
                }
            } else if (bpKey) {
                const badge = document.createElement('div');
                badge.className = 'locked-badge';
                badge.textContent = 'Requires Blueprint';
                buildingItem.appendChild(badge);
            }
            
            const cost = building.getCost(1);
            const costText = Object.keys(cost)
                .filter(resource => cost[resource] > 0)
                .map(resource => `${this.resourceManager.formatResource(cost[resource])} ${resource}`)
                .join(', ');
            
            buildingItem.innerHTML = `
                <div class="building-item-icon">${building.icon}</div>
                <div class="building-item-info">
                    <h4>${building.name}</h4>
                    <div class="building-item-cost">${costText}</div>
                </div>
            `;
            
            // If locked, clicking will open Forge modal when blueprint is required, otherwise do nothing
            if (!isLocked) {
                buildingItem.addEventListener('click', () => {
                    this.showBuildingDetails(buildingId);
                });
            } else {
                if (bpKey && !blueprintUnlocked) {
                    // add quick Forge button
                    const actionWrap = document.createElement('div');
                    actionWrap.style.marginLeft = '8px';
                    const forgeBtn = document.createElement('button');
                    forgeBtn.className = 'cp-btn';
                    forgeBtn.textContent = 'Open Forge';
                    forgeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.openForge();
                    });
                    actionWrap.appendChild(forgeBtn);
                    buildingItem.appendChild(actionWrap);
                } else {
                    // show tooltip on hover to explain lock (distance requirement)
                    buildingItem.title = !distanceUnlocked ? `Unlock at distance: ${building.requirements.distance}km` : 'Locked';
                }
            }
            
            this.buildingsList.appendChild(buildingItem);
        });
    }

    selectSlot(x, y) {
        // Remove previous selection
        document.querySelectorAll('.building-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Select new slot
        const slot = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        slot.classList.add('selected');
        
        this.selectedSlot = { x, y };
        
        // Show building details if slot is occupied
        const building = this.baseBuildingManager.currentBase.grid[x][y];
        if (building) {
            this.showBuildingDetails(building.id, true);
        } else if (this.selectedBuilding) {
            // Refresh popup so build button state updates when a slot is chosen after selecting a building
            this.showBuildingDetails(this.selectedBuilding);
        }
    }

    showBuildingDetails(buildingId, isExisting = false) {
        const buildingData = BUILDING_DEFINITIONS[buildingId];
        const building = new Building(...buildingData);
        
        let existingBuilding = null;
        if (isExisting && this.selectedSlot.x >= 0 && this.selectedSlot.y >= 0) {
            existingBuilding = this.baseBuildingManager.currentBase.grid[this.selectedSlot.x][this.selectedSlot.y];
        }
        
        this.selectedBuilding = buildingId;
        
        // Update popup content
        this.buildingImage.textContent = building.icon;
        this.buildingName.textContent = building.name;
        this.buildingDescription.textContent = building.description;
        
        // Show stats
        const currentLevel = existingBuilding ? existingBuilding.level : 1;
        const stats = building.getStats(currentLevel);
        let statsHTML = '<h4>Building Effects:</h4>';
        Object.keys(stats).forEach(stat => {
            if (stats[stat] > 0) {
                const displayName = stat.charAt(0).toUpperCase() + stat.slice(1);
                statsHTML += `<div class="stat-item"><span>${displayName}:</span> <span>+${stats[stat]}/h</span></div>`;
            }
        });
        this.buildingStats.innerHTML = statsHTML;
        
        // Show cost
        const cost = building.getCost(existingBuilding ? existingBuilding.level + 1 : 1);
        let costHTML = '<h4>Cost:</h4>';
        Object.keys(cost).forEach(resource => {
            if (cost[resource] > 0) {
                const hasEnough = this.resourceManager.resources[resource] >= cost[resource];
                const className = hasEnough ? 'affordable' : 'expensive';
                costHTML += `
                    <div class="cost-item ${className}">
                        <span>${resource}:</span>
                        <span>${this.resourceManager.formatResource(cost[resource])}</span>
                    </div>
                `;
            }
        });
        this.buildingCost.innerHTML = costHTML;
        
        // Show appropriate buttons
        if (existingBuilding) {
            this.buildButton.style.display = 'none';
            this.upgradeButton.style.display = existingBuilding.level < existingBuilding.maxLevel ? 'inline-block' : 'none';
            this.demolishButton.style.display = 'inline-block';
            
            const canAfford = building.canAfford(this.resourceManager.resources, existingBuilding.level + 1);
            this.upgradeButton.disabled = !canAfford || existingBuilding.level >= existingBuilding.maxLevel;
        } else {
            this.buildButton.style.display = 'inline-block';
            this.upgradeButton.style.display = 'none';
            this.demolishButton.style.display = 'none';
            
            const canAfford = building.canAfford(this.resourceManager.resources, 1);
            const hasSlot = this.selectedSlot.x >= 0 && this.selectedSlot.y >= 0;
            this.buildButton.disabled = !canAfford || !hasSlot || !this.baseBuildingManager.canBuildAt(this.selectedSlot.x, this.selectedSlot.y);
        }
        
        this.buildingDetailsPopup.classList.add('show');
    }

    hidePopup() {
        this.buildingDetailsPopup.classList.remove('show');
        this.selectedBuilding = null;
    }

    buildSelectedBuilding() {
        if (!this.selectedBuilding || this.selectedSlot.x < 0 || this.selectedSlot.y < 0) return;
        
        if (this.baseBuildingManager.buildBuilding(
            this.selectedSlot.x, 
            this.selectedSlot.y, 
            this.selectedBuilding, 
            this.resourceManager.resources
        )) {
            this.showNotification('Building constructed successfully!', 'success');
            this.hidePopup();
            this.updateUI();
        } else {
            this.showNotification('Failed to build. Check resources and requirements.', 'error');
        }
    }

    upgradeSelectedBuilding() {
        if (this.selectedSlot.x < 0 || this.selectedSlot.y < 0) return;
        
        if (this.baseBuildingManager.upgradeBuilding(
            this.selectedSlot.x, 
            this.selectedSlot.y, 
            this.resourceManager.resources
        )) {
            this.showNotification('Building upgraded successfully!', 'success');
            this.hidePopup();
            this.updateUI();
        } else {
            this.showNotification('Failed to upgrade. Check resources.', 'error');
        }
    }

    demolishSelectedBuilding() {
        if (this.selectedSlot.x < 0 || this.selectedSlot.y < 0) return;
        
        if (confirm('Are you sure you want to demolish this building? This action cannot be undone.')) {
            if (this.baseBuildingManager.demolishBuilding(this.selectedSlot.x, this.selectedSlot.y)) {
                this.showNotification('Building demolished.', 'success');
                this.hidePopup();
                this.updateUI();
            }
        }
    }

    updateUI() {
        // Update resource displays
        Object.keys(this.resourceDisplays).forEach(resource => {
            const amount = this.resourceManager.resources[resource];
            const display = this.resourceDisplays[resource].querySelector('.resource-amount');
            display.textContent = this.resourceManager.formatResource(amount);
        });
        // Update blueprint display
        if (this.blueprintDisplay) {
            const count = Object.values(this.resourceManager.getBlueprints() || {}).reduce((s,v)=>s+v,0);
            const display = this.blueprintDisplay.querySelector('.resource-amount');
            display.textContent = this.resourceManager.formatResource(count);
        }
        
        // Update base stats
        const base = this.baseBuildingManager.currentBase;
        if (base) {
            this.powerGeneration.textContent = `${base.productionRates.energy}/h`;
            this.defenseRating.textContent = base.defenseRating;
            this.researchSpeed.textContent = `${100 + base.researchBonus}%`;
        }
        
        // Regenerate grid to show changes
        this.generateBaseGrid();
        
        // Update buildings list affordability
        this.updateBuildingsList(this.baseBuildingManager.selectedCategory);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationsContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveBase() {
        const saveData = {
            resources: this.resourceManager.toSaveData(),
            bases: this.baseBuildingManager.toSaveData()
        };
        
        localStorage.setItem('galaxyConquest', JSON.stringify(saveData));
        this.showNotification('Base saved successfully!', 'success');
    }

    // Forge UI - open modal and populate available blueprints
    openForge() {
        const modal = document.getElementById('forge-modal');
        const content = document.getElementById('forge-content');
        if (!modal || !content || !this.resourceManager) return;

        content.innerHTML = '';
        const blueprints = this.resourceManager.getBlueprints() || {};

        // Simple blueprint catalog (this could be moved to a central definition file)
        const CATALOG = {
            'ship_frame_1': { name: 'Frame Alpha', shards: 3, desc: 'Lightweight agile frame.' },
            'ship_frame_2': { name: 'Frame Beta', shards: 4, desc: 'Balanced frame with extra slots.' },
            'ship_frame_3': { name: 'Frame Omega', shards: 6, desc: 'Heavy frame with high armor.' }
        };

        // Populate catalog entries
        Object.keys(CATALOG).forEach(key => {
            const info = CATALOG[key];
            const have = blueprints[key] || 0;
            const card = document.createElement('div');
            card.className = 'forge-card cp-panel cp-panel--small';
            card.style.padding = '10px';
            card.innerHTML = `
                <div style="font-weight:700">${info.name}</div>
                <div style="font-size:12px;margin:6px 0">${info.desc}</div>
                <div style="font-size:12px">Shards: ${have} / ${info.shards}</div>
                <div style="margin-top:8px;text-align:right">
                    <button class="cp-btn forge-craft" data-key="${key}">Forge</button>
                </div>
            `;
            content.appendChild(card);
        });

        // Hook craft buttons
        content.querySelectorAll('.forge-craft').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                const req = CATALOG[key].shards;
                const have = (this.resourceManager.getBlueprints() || {})[key] || 0;
                if (have >= req) {
                    // Spend shards and unlock - unlocking logic placeholder: just consume shards and show notification
                    const ok = this.resourceManager.spendBlueprint(key, req);
                    if (ok) {
                        // Mark blueprint as unlocked in resource manager
                        this.resourceManager.unlockBlueprint(key);
                        // Register ship frames in the ShipRegistry (if applicable)
                        try {
                            if (window.ShipRegistry && typeof window.ShipRegistry.registerBlueprint === 'function') {
                                window.ShipRegistry.registerBlueprint(key);
                            }
                        } catch (e) {}

                        this.showNotification(`${CATALOG[key].name} forged! Unlocked.`, 'success');
                        this.updateUI();
                    } else {
                        this.showNotification('Failed to spend shards.', 'error');
                    }
                } else {
                    this.showNotification('Not enough shards to forge.', 'error');
                }
            });
        });

        // Show modal
        modal.style.display = 'flex';
        document.getElementById('forge-close').addEventListener('click', () => {
            modal.style.display = 'none';
        }, { once: true });
    }

    returnToGame() {
        // Save before returning
        this.saveBase();
        
        // Return to main game
        window.location.href = 'game.html';
    }

    viewAllBases() {
        // Show all bases overview (future feature)
        this.showNotification('All Bases view coming soon!', 'info');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.baseBuilderUI = new BaseBuilderUI();
});