class MenuSystem {
    constructor() {
        this.currentView = 'main';
        this.characterSystem = null;
        this.parallaxLayers = [];
        this.launching = false;
        
        // Galaxy Conquest systems
        this.resourceManager = new GalaxyResourceManager(saveSystem);
        this.baseBuildingManager = new BaseBuildingManager();
        this.loadGalaxyData();
        this.upgradeDescriptions = {
            rapidFire: {
                name: "Rapid Fire Module",
                description: "Increases fire rate by 10% per level",
                maxLevel: 5,
                effects: [
                    "10% faster firing",
                    "20% faster firing",
                    "30% faster firing",
                    "40% faster firing", 
                    "50% faster firing (MAX)"
                ]
            },
            multiCannon: {
                name: "Multi-Cannon Array",
                description: "Start with upgraded bullets",
                maxLevel: 3,
                effects: [
                    "Start with Level 2 bullets",
                    "Start with Level 3 bullets",
                    "Start with Level 4 bullets (MAX)"
                ]
            },
            armor: {
                name: "Armor Plating",
                description: "Grants extra lives",
                maxLevel: 3,
                effects: [
                    "+1 Extra Life",
                    "+2 Extra Lives",
                    "+3 Extra Lives (MAX)"
                ]
            },
            shield: {
                name: "Energy Shield",
                description: "Start missions with shield protection",
                maxLevel: 1,
                effects: [
                    "Start with Shield (MAX)"
                ]
            },
            speed: {
                name: "Thruster Enhancement",
                description: "Increases movement speed",
                maxLevel: 4,
                effects: [
                    "15% faster movement",
                    "30% faster movement",
                    "45% faster movement",
                    "60% faster movement (MAX)"
                ]
            }
        };

        this.baseTierConfig = [
            {
                id: 1,
                name: 'Relay Outpost',
                description: 'Low-orbit comms array ready for rookies.',
                unlock: 0,
                modules: ['dish', 'hangar']
            },
            {
                id: 2,
                name: 'Twin Array Station',
                description: 'Dual dishes sharpen warp clarity.',
                unlock: 10000,
                modules: ['dish', 'hangar', 'radar']
            },
            {
                id: 3,
                name: 'Pulse Relay Citadel',
                description: 'Flux shields keep the launch bay stable.',
                unlock: 25000,
                modules: ['dish', 'hangar', 'radar', 'shield']
            },
            {
                id: 4,
                name: 'Escort Drone Fortress',
                description: 'Autonomous drones guard every launch.',
                unlock: 50000,
                modules: ['dish', 'hangar', 'radar', 'shield', 'drones']
            },
            {
                id: 5,
                name: 'Quantum Nexus',
                description: 'Full-spectrum relay saturates the sector.',
                unlock: 80000,
                modules: ['dish', 'hangar', 'radar', 'shield', 'drones', 'relay']
            }
        ];

        this.init();
    }

    init() {
        // Initialize audio system and start menu music
        if (typeof AudioManager !== 'undefined') {
            this.audioManager = new AudioManager();
            // Start menu music after a short delay to ensure audio context is ready
            setTimeout(() => {
                try {
                    this.audioManager.playMenuMusic();
                } catch (e) {
                    console.warn('Could not start menu music:', e);
                }
            }, 500);
        }

        // Initialize character system
        this.characterSystem = new CharacterSystem(saveSystem);
        
        // Initialize upgrade system
        if (typeof upgradeSystem !== 'undefined') {
            const savedUpgrades = saveSystem.getUpgradesData();
            if (savedUpgrades) {
                upgradeSystem.loadSaveData(savedUpgrades);
            } else {
                upgradeSystem.currency = saveSystem.getCredits();
            }
        }

        this.bindEvents();
        this.updateUI();
        this.showParticles();
        this.initParallax();
    this.initVortexBackground();
    this.setupSfx();
        // Move existing screen elements into the contained GUI window for consistent mobile containment
        try {
            const content = document.querySelector('.gui-window .gui-content');
            if (content) {
                ['.title-screen', '.upgrade-screen', '.galaxy-screen', '.collection-screen', '.mission-screen', '.hq-screen', '.pilot-screen'].forEach(sel => {
                    const el = document.querySelector(sel);
                    if (el) content.appendChild(el);
                });
            }
        } catch (e) {
            // non-fatal
            console.warn('Failed to move screens into gui-content', e);
        }
        this.bindHeroButtons();
        this.setupMobileNav();
        this.updateBodyView();
        this.updateMobileNav();
        this.showMain();
        this.enhanceButtons();
    }

    bindEvents() {
        const addClick = (id, fn) => {
            const el = document.getElementById(id);
            if (!el) return;
            // If the element is marked to perform a full-page navigation, don't bind the in-window handler
            if (el.dataset && el.dataset.fullpage === 'true') return;
            el.addEventListener('click', fn);
        };
        // Navigation
        addClick('startGameBtn', () => this.startGame());
    addClick('jetLaunchBtn', () => this.startGame());
    addClick('startGameBtn_hero', () => this.startGame());
        // play click sound for main buttons
        ['startGameBtn','jetLaunchBtn','startGameBtn_hero'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => this.playSound('click'));
        });
        addClick('charactersBtn', () => { window.location.href = 'pilot-select.html'; });
        addClick('upgradesBtn', () => this.showUpgrades());
    addClick('shopBtn', () => this.openShop());
        addClick('baseBuilderBtn', () => this.openBaseBuilder());
    addClick('hangarBtn', () => this.showCollection());

        addClick('upgradesBackBtn', () => this.showMain());
        addClick('galaxyBackBtn', () => this.showMain());
        addClick('collectionBackBtn', () => this.showMain());

        // Galaxy Overview actions
        addClick('manageBasesBtn', () => this.openBaseBuilder());
        addClick('galaxyGuideBtn', () => { window.open('GALAXY-CONQUEST-GUIDE.md', '_blank'); });

        // Upgrade purchases (may be generated later)
        const upgradeBtns = document.querySelectorAll('.upgrade-btn');
        if (upgradeBtns && upgradeBtns.length) {
            upgradeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const upgradeType = e.target.dataset.upgrade;
                    this.buyUpgrade(upgradeType);
                });
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.showMain();
            }
        });
    }

    bindHeroButtons() {
        const map = [
            ['upgradesBtn_hero', () => this.showUpgrades()],
            ['charactersBtn_hero', () => { window.location.href = 'pilot-select.html'; }],
            ['hangarBtn_hero', () => this.showCollection()],
            ['baseBuilderBtn_hero', () => this.openBaseBuilder()],
            ['shopBtn_hero', () => this.openShop()],
            ['startGameBtn_hero', () => this.startGame()],
            ['jetLaunchBtn', () => this.startGame()],
        ];
        map.forEach(([id, fn]) => {
            const el = document.getElementById(id);
            if (!el) return;
            // If this element should perform a full-page navigation we skip attaching the in-window handler
            if (el.dataset && el.dataset.fullpage === 'true') return;
            el.addEventListener('click', fn);
            // accessibility: make sure hero controls are keyboard-focusable
            if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'button');
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); fn();
                }
            });
        });
    }

    initVortexBackground() {
        // Delegate to the vortex module (keeps menu.js lightweight)
        if (window.VortexBackground && typeof window.VortexBackground.init === 'function') {
            try {
                window.VortexBackground.init({ canvasId: 'vortexCanvas', guiSelector: '.gui-window' });
            } catch (e) {
                console.error('VortexBackground init failed', e);
            }
        }
    }

    // Avoid double background particles if main canvas is present
    showParticles() {
        if (document.getElementById('vortexCanvas')) {
            return; // Outer-space canvas handles background now
        }
        const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reduceMotionQuery.matches) {
            return;
        }
        // Add animated background particles
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.id = 'backgroundParticles';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.y > canvas.height) particle.y = 0;
                if (particle.y < 0) particle.y = canvas.height;
                ctx.save();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = '#00d4ff';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        // Pause when page hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // stop animation by removing canvas from DOM (cheap) or use a flag
                if (canvas._animFrame) cancelAnimationFrame(canvas._animFrame);
            }
        });
    }

    hideAllScreens() {
        const screens = [
            '.title-screen',
            '.upgrade-screen',
            '.galaxy-screen',
            '.collection-screen'
        ];
        screens.forEach(selector => {
            const element = document.querySelector(selector);
            if (!element) return;
            element.classList.remove('screen-visible');
            element.classList.add('hidden');
        });
    }

    toggleScreen(selector, show) {
        const element = document.querySelector(selector);
        if (!element) return;

        if (show) {
            element.classList.remove('hidden');
            requestAnimationFrame(() => element.classList.add('screen-visible'));
        } else {
            element.classList.remove('screen-visible');
            const hide = () => {
                element.classList.add('hidden');
                element.removeEventListener('transitionend', hide);
            };
            element.addEventListener('transitionend', hide, { once: true });
            setTimeout(hide, 400);
        }
    }

    setViewState(view) {
        this.currentView = view;
        // keep body state in sync with the current logical view
        if (typeof this.updateBodyView === 'function') this.updateBodyView();
        this.updateMobileNav();
    }

    updateBodyView() {
        // Reflect the current view on the document body and inside the gui-content container.
        try {
            const view = this.currentView || 'main';
            // set a data attribute for CSS hooks
            document.body.dataset.view = view;

            // maintain class list for simple view selectors
            const views = ['main','upgrades','galaxy','collection','hq','mission','pilots','stats'];
            views.forEach(v => document.body.classList.toggle(`view-${v}`, v === view));

            // reflect into the contained GUI content if present
            const guiContent = document.querySelector('.gui-window .gui-content');
            if (guiContent) {
                guiContent.dataset.view = view;
            }
        } catch (e) {
            console.warn('updateBodyView failed', e);
        }
    }

    showMain() {
        this.setViewState('main');
        this.hideAllScreens();
        // Keep the legacy dashboard hidden to avoid crowding with the new hero UI
        // The hero foreground (jet + side buttons) serves as the main menu now
        this.updateUI();
    }

    showUpgrades() {
        this.setViewState('upgrades');
        this.hideAllScreens();
        this.toggleScreen('.upgrade-screen', true);
        this.buildUpgradeUI();
        this.updateUpgradeUI();
    }

    showStats() {
        this.setViewState('stats');
        this.hideAllScreens();
        this.toggleScreen('.stats-screen', true);
        this.updateStatsUI();
    }

    showGalaxy() {
        this.setViewState('galaxy');
        this.hideAllScreens();
        this.toggleScreen('.galaxy-screen', true);
        this.updateGalaxyUI();
    }

    showCollection() {
        this.setViewState('collection');
        this.hideAllScreens();
        this.toggleScreen('.collection-screen', true);
        this.updateCollectionUI();
    }

    showHQ() {
        this.setViewState('hq');
        this.hideAllScreens();
        this.toggleScreen('.hq-screen', true);
        this.updateHQUI();
    }

    showMissionPrep() {
        this.setViewState('mission');
        this.hideAllScreens();
        this.toggleScreen('.mission-screen', true);
        this.updateMissionPanel();
    }

    showPilots() {
        this.setViewState('pilots');
        this.hideAllScreens();
        this.toggleScreen('.pilot-screen', true);
        this.buildPilotGrid();
    }

    openShop() {
        // Open the shop in an in-window modal and render a small reactive mini-UI
        const modal = document.getElementById('shopModal');
        const body = modal ? modal.querySelector('.shop-body') : null;
        if (!modal || !body) {
            window.location.href = 'shop.html';
            return;
        }
        modal.classList.remove('hidden');
        // MiniShop: small declarative UI rendered into modal body
        const MiniShop = (function() {
            function createEl(tag, props = {}, children = []) {
                const el = document.createElement(tag);
                Object.entries(props).forEach(([k,v]) => {
                    if (k === 'class') el.className = v;
                    else if (k === 'html') el.innerHTML = v;
                    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
                    else el.setAttribute(k, v);
                });
                (Array.isArray(children) ? children : [children]).forEach(c => { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
                return el;
            }

            function formatPrice(p) { return (p || 0).toLocaleString(); }

            function render(bodyEl, menuSys) {
                bodyEl.innerHTML = '';
                const header = createEl('div', { class: 'shop-panel-header' }, [
                    createEl('h3', { class: 'shop-title', html: 'In-Game Shop' }),
                    createEl('div', { class: 'shop-balance', html: `Credits: <strong id="shopCredits">${formatPrice(saveSystem.getCredits())}</strong>` })
                ]);

                const items = [
                    { id: 'credits1000', name: '1,000 Credits', price: 0, desc: 'Demo: grants credits (dev-mode) ', demo: true },
                    { id: 'skin_neon', name: 'Neon Paint', price: 1200, desc: 'Holographic paint for ship', demo: false },
                    { id: 'hangar_slot', name: 'Hangar Slot', price: 750, desc: 'Unlock extra ship slot', demo: false }
                ];

                const grid = createEl('div', { class: 'shop-grid' });
                items.forEach(it => {
                    const card = createEl('div', { class: 'shop-item' });
                    const title = createEl('div', { class: 'shop-item-title', html: it.name });
                    const desc = createEl('div', { class: 'shop-item-desc', html: it.desc });
                    const buy = createEl('button', { class: 'menu-btn shop-buy', type: 'button' }, [`Buy ${it.price ? formatPrice(it.price) : 'FREE'}`]);
                    buy.addEventListener('click', () => {
                        // demo purchase handler
                        if (it.demo) {
                            // grant some credits for demo
                            saveSystem.addCredits(1000);
                            menuSys.showToast('Granted 1000 demo credits', 'success');
                        } else {
                            const credits = saveSystem.getCredits();
                            if (credits >= it.price) {
                                saveSystem.addCredits(-it.price);
                                menuSys.showToast(`Purchased ${it.name}`, 'success');
                            } else {
                                menuSys.showToast('Not enough credits', 'error');
                            }
                        }
                        const bal = document.getElementById('shopCredits'); if (bal) bal.textContent = (saveSystem.getCredits()||0).toLocaleString();
                        // small visual tick
                        buy.disabled = true; setTimeout(() => buy.disabled = false, 900);
                    });
                    card.appendChild(title); card.appendChild(desc); card.appendChild(buy);
                    grid.appendChild(card);
                });

                const footer = createEl('div', { class: 'shop-panel-footer' }, [
                    createEl('button', { class: 'menu-btn secondary', onclick: () => { modal.classList.add('hidden'); } }, ['Close'])
                ]);

                bodyEl.appendChild(header);
                bodyEl.appendChild(grid);
                bodyEl.appendChild(footer);
            }

            return { render };
        })();

        // render the mini-shop into the modal body
        try { MiniShop.render(body, this); } catch (e) { body.innerHTML = '<div style="color:#f88">Could not render shop UI</div>'; console.warn('MiniShop render failed', e); }
        // wire close button (in modal header if present)
        const closeBtn = document.getElementById('shopCloseBtn');
        if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    }

    updateMissionPanel() {
        const profile = this.generateMissionProfile();
        const loadout = this.getLoadoutSnapshot();

        this.setText('missionSummary', profile.summary);
        this.setText('missionName', profile.name);
        this.setText('missionBiome', profile.biome);
        this.setText('missionThreat', `THREAT: ${profile.threat}`);
            // Vortex background is initialized centrally during MenuSystem startup; no-op here.

        const unlocked = this.characterSystem.isCharacterUnlocked(pilot) || pilot.unlocked;
        const current = this.characterSystem.getCurrentCharacter();
        const isActive = current?.id === pilot.id;

        let html = `
            <div class="pilot-detail-header" style="border-color:${this.characterSystem.getRarityColor(pilot.rarity)}">
                <div>
                    <h3>${pilot.name}</h3>
                    <p class="pilot-detail-rarity">${pilot.rarity.toUpperCase()}</p>
                </div>
                <div class="pilot-detail-tags">
                    <span>${unlocked ? 'Ready' : 'Locked'}</span>
                </div>
            </div>
            <p class="pilot-detail-description">${pilot.description}</p>
            <div class="pilot-detail-stats">
                <div><span>Speed</span><strong>${pilot.stats.speed.toFixed(1)}x</strong></div>
                <div><span>Fire Rate</span><strong>${pilot.stats.fireRate.toFixed(1)}x</strong></div>
                <div><span>Armor</span><strong>${pilot.stats.armor.toFixed(1)}x</strong></div>
                <div><span>Luck</span><strong>${pilot.stats.luck.toFixed(1)}x</strong></div>
            </div>
        `;

        if (!unlocked && pilot.unlockRequirement) {
            html += `<div class="pilot-lock-message">Unlock Requirement: ${pilot.unlockRequirement.description}</div>`;
        }

        if (unlocked && !isActive) {
            html += `<button class="menu-btn select-btn" data-select-pilot="${pilot.id}">SET ACTIVE PILOT</button>`;
        }

        if (isActive) {
            html += '<div class="pilot-active-badge">ACTIVE PILOT</div>';
        }

        detailsEl.innerHTML = html;

        const selectBtn = detailsEl.querySelector('[data-select-pilot]');
        if (selectBtn) {
            selectBtn.addEventListener('click', () => {
                this.handlePilotSelection(selectBtn.dataset.selectPilot);
            });
        }
    }

    handlePilotSelection(pilotId) {
        if (!this.characterSystem) return;
        const success = this.characterSystem.selectCharacter(pilotId);
        if (success) {
            const pilot = this.characterSystem.getCurrentCharacter();
            this.showToast(`${pilot.name} ready for deployment`, 'success');
            this.setActivePilotCard(pilot.id);
            this.renderPilotDetails(pilot.id);
            this.updateUI();
        } else {
            this.showToast('Unlock conditions not met yet', 'error');
        }
    }

    updateUI() {
        // Update credits display (sync with upgrade system)
        let credits = saveSystem.getCredits();
        if (typeof upgradeSystem !== 'undefined') {
            credits = upgradeSystem.getCurrency();
        }
        
        // Ensure credits is a valid number
        if (credits === null || credits === undefined || isNaN(credits)) {
            credits = 0;
        }
        
        const creditsEl = document.getElementById('playerCredits');
        if (creditsEl) {
            creditsEl.textContent = credits.toLocaleString();
        }
        
        // Update stats in main menu
        const stats = saveSystem.getAllStats() || {};
        const distanceEl = document.getElementById('bestDistance');
        const killsEl = document.getElementById('totalKills');
        
        if (distanceEl && stats.bestDistance !== null && stats.bestDistance !== undefined) {
            distanceEl.textContent = `${Math.floor(stats.bestDistance / 1000)} km`;
        }
        if (killsEl && stats.totalKills !== null && stats.totalKills !== undefined) {
            killsEl.textContent = stats.totalKills.toLocaleString();
        }
        
        // Update current pilot display
        if (this.characterSystem) {
            const currentChar = this.characterSystem.getCurrentCharacter();
            const pilotEl = document.getElementById('currentPilot');
            if (pilotEl && currentChar) {
                pilotEl.textContent = currentChar.name;
                pilotEl.style.color = this.characterSystem.getRarityColor(currentChar.rarity);
            }
        }

        const tierInfo = this.updateBaseTierUI(stats);
        this.updateBaseIntel(stats);

        const badgeEl = document.getElementById('baseTierBadge');
        if (badgeEl && tierInfo) {
            badgeEl.textContent = `Tier ${String(tierInfo.activeTier.id).padStart(2, '0')}`;
        }

        const launchStatus = document.getElementById('launchStatus');
        if (launchStatus && tierInfo && !this.launching) {
            launchStatus.textContent = `Ready at ${tierInfo.activeTier.name}`;
        }

        const launchBtn = document.getElementById('startGameBtn');
        if (launchBtn) {
            launchBtn.disabled = this.launching;
        }
    }

    resolveBaseTier(distance = 0) {
        const tiers = this.baseTierConfig || [];
        if (!tiers.length) {
            return {
                activeTier: { id: 1, name: 'Relay Outpost', description: '', unlock: 0, modules: [] },
                nextTier: null,
                progress: 0
            };
        }

        let activeTier = tiers[0];
        for (const tier of tiers) {
            if (distance >= tier.unlock) {
                activeTier = tier;
            }
        }

        const activeIndex = tiers.findIndex(t => t.id === activeTier.id);
        const nextTier = tiers[activeIndex + 1] || null;
        const start = activeTier.unlock;
        const end = nextTier ? nextTier.unlock : Math.max(start + 1, start + 1000);
        const range = Math.max(1, end - start);
        const clamped = Math.min(1, Math.max(0, (distance - start) / range));

        return {
            activeTier,
            nextTier,
            progress: nextTier ? clamped : 1
        };
    }

    updateBaseTierUI(stats = {}) {
        const bestDistance = stats.bestDistance || 0;
        const tierInfo = this.resolveBaseTier(bestDistance);
        const stage = document.getElementById('orbitalStage');
        if (stage && tierInfo.activeTier) {
            stage.dataset.tier = tierInfo.activeTier.id;
        }

        this.setText('baseTierLabel', tierInfo.activeTier?.name || 'Relay Outpost');
        this.setText('baseTierDescription', tierInfo.activeTier?.description || 'Maintain the comms array.');

        const nextGoalEl = document.getElementById('baseNextGoal');
        if (nextGoalEl) {
            if (tierInfo.nextTier) {
                const km = (tierInfo.nextTier.unlock / 1000).toFixed(1);
                nextGoalEl.textContent = `Next upgrade unlocks at ${km} km`;
            } else {
                nextGoalEl.textContent = 'Max tier achieved';
            }
        }

        const progressFill = document.getElementById('baseProgressFill');
        if (progressFill) {
            progressFill.style.width = `${Math.round((tierInfo.progress || 0) * 100)}%`;
        }

        const modules = document.querySelectorAll('#baseModuleList .module-card');
        modules.forEach(card => {
            const moduleKey = card.dataset.module;
            const isActive = tierInfo.activeTier?.modules?.includes(moduleKey);
            card.classList.toggle('active', Boolean(isActive));
            const status = card.querySelector('.module-status');
            if (status) {
                status.textContent = isActive ? 'Online' : 'Locked';
            }
        });

        return tierInfo;
    }

    updateBaseIntel(stats = {}) {
        if (!this.resourceManager) return;
        const resources = typeof this.resourceManager.getResources === 'function'
            ? this.resourceManager.getResources()
            : this.resourceManager.resources;
        if (!resources) return;

        const format = this.resourceManager.formatResource.bind(this.resourceManager);
        this.setText('intelEnergy', format(resources.energy || 0));
        this.setText('intelMetal', format(resources.metal || 0));
        this.setText('intelCrystals', format(resources.crystals || 0));
        this.setText('intelDarkMatter', format(resources.darkMatter || 0));

        this.setText('farthestDistanceMini', `${Math.floor((stats.bestDistance || 0) / 1000)} km`);
        this.setText('intelKills', (stats.totalKills || 0).toLocaleString());
        this.setText('intelCredits', (stats.credits || 0).toLocaleString());
    }

    setText(elementId, value) {
        const el = document.getElementById(elementId);
        if (!el || value === undefined || value === null) return;
        el.textContent = value;
    }

    buildUpgradeUI() {
        if (typeof upgradeSystem === 'undefined') return;
        
        const container = document.getElementById('upgradesContainer');
        if (!container) return;
        
        const categories = upgradeSystem.getUpgradesByCategory();
        let html = '';
        
        Object.entries(categories).forEach(([categoryName, upgrades]) => {
            html += `<div class="upgrade-category">`;
            html += `<h3>${this.getCategoryDisplayName(categoryName)}</h3>`;
            
            upgrades.forEach(upgrade => {
                html += `
                    <div class="upgrade-item" data-upgrade="${upgrade.type}">
                        <div class="upgrade-info">
                            <div class="upgrade-name">${upgrade.name}</div>
                            <div class="upgrade-desc">${upgrade.description}</div>
                            <div class="upgrade-level">Level ${upgrade.level}/${upgrade.maxLevel}</div>
                        </div>
                        <div class="upgrade-cost">
                            ${upgrade.maxed ? 'MAX LEVEL' : `${upgrade.cost} Credits`}
                        </div>
                        <button class="upgrade-btn ${upgrade.maxed ? 'max-level' : ''} ${!upgrade.canAfford && !upgrade.maxed ? 'insufficient-credits' : ''}" 
                                data-upgrade="${upgrade.type}" 
                                ${upgrade.maxed || !upgrade.canAfford ? 'disabled' : ''}>
                            ${upgrade.maxed ? 'MAX LEVEL' : `Buy - ${upgrade.cost} Credits`}
                        </button>
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
        
        // Add event listeners for upgrade buttons
        container.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeType = e.target.getAttribute('data-upgrade');
                this.purchaseUpgrade(upgradeType);
            });
        });
    }
    
    getCategoryDisplayName(categoryName) {
        const names = {
            weapons: 'Weapon Systems',
            defense: 'Defense Systems', 
            movement: 'Engine Systems',
            special: 'Special Abilities'
        };
        return names[categoryName] || categoryName;
    }

    updateUpgradeUI() {
        this.updateUI(); // Update credits
        
        const menuCurrencyEl = document.getElementById('menuCurrency');
        if (menuCurrencyEl && typeof upgradeSystem !== 'undefined') {
            const currency = upgradeSystem.getCurrency();
            menuCurrencyEl.textContent = (currency || 0).toLocaleString();
        }
        
        // Update all upgrade item displays
        if (typeof upgradeSystem !== 'undefined') {
            Object.keys(upgradeSystem.upgradeDefinitions).forEach(upgradeType => {
                const currentLevel = upgradeSystem.getUpgradeLevel(upgradeType);
                const maxLevel = upgradeSystem.upgradeDefinitions[upgradeType].maxLevel;
                const cost = upgradeSystem.getUpgradeCost(upgradeType);
                
                const upgradeItem = document.querySelector(`.upgrade-item[data-upgrade="${upgradeType}"]`);
                if (upgradeItem) {
                    const levelEl = upgradeItem.querySelector('.upgrade-level');
                    const costEl = upgradeItem.querySelector('.upgrade-cost');
                    const btnEl = upgradeItem.querySelector('.upgrade-btn');
                    
                    if (levelEl) levelEl.textContent = currentLevel;
                    if (costEl) costEl.textContent = cost > 0 ? cost.toLocaleString() : 'MAX';
                    
                    if (btnEl) {
                        btnEl.disabled = !upgradeSystem.canUpgrade(upgradeType);
                        btnEl.textContent = currentLevel >= maxLevel ? 'MAX LEVEL' : `Buy - ${cost} Credits`;
                    }
                }
            });
        }
    }
    
    purchaseUpgrade(upgradeType) {
        if (typeof upgradeSystem === 'undefined') return;
        
        if (upgradeSystem.purchaseUpgrade(upgradeType)) {
            // Save updated upgrade data
            saveSystem.saveUpgradesData(upgradeSystem.getSaveData());
            
            // Rebuild and update UI
            this.buildUpgradeUI();
            this.updateUpgradeUI();
            
            // Show success feedback
            this.showToast(`${upgradeSystem.upgradeDefinitions[upgradeType].name} upgraded!`, 'success');
        } else {
            // Show error feedback
            this.showToast('Cannot purchase upgrade!', 'error');
        }
    }

    updateStatsUI() {
        const stats = saveSystem.getAllStats();
        const bestDistanceKm = ((stats.bestDistance || 0) / 1000).toFixed(1);
        const avgKills = stats.missionsFlown > 0 ? Math.round((stats.totalKills || 0) / stats.missionsFlown) : 0;
        const bestCombo = Math.max(1, Math.round((stats.highScore || 0) / 10000));

        this.setText('statTotalKills', (stats.totalKills || 0).toLocaleString());
        this.setText('statBestDistance', `${bestDistanceKm} km`);
        this.setText('statHighScore', (stats.highScore || 0).toLocaleString());
        this.setText('statMissionsFlown', (stats.missionsFlown || 0).toString());
        this.setText('statBossesKilled', (stats.bossesKilled || 0).toString());
        this.setText('statCreditsEarned', (stats.creditsEarned || 0).toLocaleString());
        this.setText('statCredits', (stats.credits || 0).toLocaleString());
        this.setText('statAvgKills', avgKills.toLocaleString());
        this.setText('statBestCombo', `x${bestCombo}`);
        this.setText('statMissions', (stats.missionsFlown || 0).toString());

        this.populateRecentRunsList(stats);
    }

    populateRecentRunsList(stats) {
        const list = document.getElementById('recentRunsList');
        if (!list) return;
        const entries = [
            `Best Distance: ${((stats.bestDistance || 0) / 1000).toFixed(1)} km`,
            `Highest Score: ${(stats.highScore || 0).toLocaleString()}`,
            `Bosses Defeated: ${stats.bossesKilled || 0}`,
            `Credits Earned: ${(stats.creditsEarned || 0).toLocaleString()}`
        ];
        list.innerHTML = entries.map(item => `<li>${item}</li>`).join('');
    }

    // Galaxy Conquest methods
    loadGalaxyData() {
        const savedData = localStorage.getItem('galaxyConquest');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.resources) {
                this.resourceManager.fromSaveData(data.resources);
            }
            if (data.bases) {
                this.baseBuildingManager.fromSaveData(data.bases);
            }
        }
    }

    updateGalaxyUI() {
        // Update resource displays
        const resources = this.resourceManager.resources;
        document.getElementById('galaxyEnergy').textContent = this.resourceManager.formatResource(resources.energy);
        document.getElementById('galaxyMetal').textContent = this.resourceManager.formatResource(resources.metal);
        document.getElementById('galaxyCrystals').textContent = this.resourceManager.formatResource(resources.crystals);
        document.getElementById('galaxyDarkMatter').textContent = this.resourceManager.formatResource(resources.darkMatter);
        
        // Update bases list
        this.updateBasesList();
    }

    updateBasesList() {
        const basesList = document.getElementById('basesList');
        const bases = Array.from(this.baseBuildingManager.bases.values());
        
        if (bases.length === 0) {
            basesList.innerHTML = '<div class="no-bases">No bases constructed yet. Reach 5km in combat to unlock warp portals!</div>';
            return;
        }
        
        basesList.innerHTML = '';
        bases.forEach(base => {
            const baseItem = document.createElement('div');
            baseItem.className = 'base-item';
            baseItem.style.cssText = `
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(74, 144, 226, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            const tierColors = {
                common: '#00ff41',
                uncommon: '#00aaff',
                rare: '#aa00ff',
                epic: '#ff6600',
                legendary: '#ff0066'
            };
            
            baseItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 16px; font-weight: bold; color: ${tierColors[base.tier]};">
                            ${base.checkpointDistance}km Checkpoint
                        </div>
                        <div style="font-size: 12px; color: #b0b6c3; text-transform: uppercase;">
                            ${base.tier} Sector • Level ${base.level}
                        </div>
                        <div style="font-size: 11px; color: #888; margin-top: 5px;">
                            Defense: ${base.defenseRating} | Production: ${Object.values(base.productionRates).reduce((a, b) => a + b, 0)}/h
                        </div>
                    </div>
                    <div style="color: #4a90e2; font-size: 20px;">🏗️</div>
                </div>
            `;
            
            baseItem.addEventListener('click', () => {
                window.location.href = `base-builder.html?checkpoint=${base.checkpointDistance}`;
            });
            
            baseItem.addEventListener('mouseenter', () => {
                baseItem.style.background = 'rgba(74, 144, 226, 0.1)';
                baseItem.style.transform = 'translateX(5px)';
            });
            
            baseItem.addEventListener('mouseleave', () => {
                baseItem.style.background = 'rgba(255, 255, 255, 0.05)';
                baseItem.style.transform = 'translateX(0)';
            });
            
            basesList.appendChild(baseItem);
        });
    }

    updateHQUI() {
        // Update HQ stats
        const bases = Array.from(this.baseBuildingManager.bases.values());
        document.getElementById('hqActiveBases').textContent = bases.length;
        
        // Calculate total resource income
        let totalIncome = 0;
        bases.forEach(base => {
            Object.values(base.productionRates).forEach(rate => {
                totalIncome += rate;
            });
        });
        document.getElementById('hqResourceIncome').textContent = totalIncome > 0 ? `${totalIncome}/h` : '0/h';
        
        // Fleet strength based on upgrades
        let fleetStrength = 'Basic';
        const stats = saveSystem.getAllStats();
        const totalUpgradeLevels = Object.values(stats.upgrades).reduce((sum, level) => sum + level, 0);
        
        if (totalUpgradeLevels >= 15) fleetStrength = 'Elite';
        else if (totalUpgradeLevels >= 10) fleetStrength = 'Advanced';
        else if (totalUpgradeLevels >= 5) fleetStrength = 'Improved';
        
        document.getElementById('hqFleetStrength').textContent = fleetStrength;
        
        // Current pilot
        if (this.characterSystem) {
            const pilot = this.characterSystem.getCurrentCharacter();
            document.getElementById('hqCurrentPilot').textContent = pilot?.name || 'Unknown';
        }
    }

    buyUpgrade(upgradeType) {
        const result = saveSystem.buyUpgrade(upgradeType);
        
        if (result.success) {
            // Play purchase sound effect (placeholder)
            this.playSound('purchase');
            
            // Show purchase feedback
            this.showPurchaseFeedback(upgradeType, result.newLevel);
            
            // Update UI
            this.updateUpgradeUI();
        } else {
            // Show error feedback
            this.showErrorFeedback(result.reason);
        }
    }

    showPurchaseFeedback(upgradeType, level) {
        const upgradeName = this.upgradeDescriptions[upgradeType].name;
        const message = `${upgradeName} upgraded to Level ${level}!`;
        this.showToast(message, 'success');
    }

    showErrorFeedback(reason) {
        this.showToast(reason, 'error');
    }

    showToast(message, type) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #4CAF50;' : 'background: #f44336;'}
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    playSound(soundType) {
        // Placeholder for sound effects
        // You can add audio files later
        console.log(`Playing sound: ${soundType}`);
    }

    showParticles() {
        const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reduceMotionQuery.matches) {
            return;
        }
        // Add animated background particles
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.id = 'backgroundParticles';
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
        
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around screen
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.y > canvas.height) particle.y = 0;
                if (particle.y < 0) particle.y = canvas.height;
                
                // Draw particle
                ctx.save();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = '#00d4ff';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    initParallax() {
        const root = document.querySelector('.starmap-parallax');
        if (!root) return;
        const layers = Array.from(root.querySelectorAll('.parallax-layer'));
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const moveLayers = (x, y) => {
            layers.forEach((layer, index) => {
                const depth = (index + 1) * 8;
                layer.style.transform = `translate3d(${x / depth}px, ${y / depth}px, 0)`;
            });
        };

        const handlePointerMove = (event) => {
            const percentX = (event.clientX / window.innerWidth) - 0.5;
            const percentY = (event.clientY / window.innerHeight) - 0.5;
            moveLayers(percentX * 120, percentY * 80);
        };

        window.addEventListener('pointermove', handlePointerMove);

        window.addEventListener('deviceorientation', (event) => {
            if (event.gamma === null || event.beta === null) return;
            const x = (event.gamma / 45);
            const y = (event.beta / 45);
            moveLayers(x * 80, y * 60);
        });
    }

    setupMobileNav() {
        const mapping = {
            main: () => this.showMain(),
            upgrades: () => this.showUpgrades(),
            galaxy: () => this.showGalaxy()
        };

        const navButtons = document.querySelectorAll('[data-screen-target]');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.screenTarget;
                if (mapping[target]) {
                    mapping[target]();
                }
            });
        });
    }

    enhanceButtons() {
        // Apply dynamic press/hover ripple to cp-btn & control-card
        const buttons = document.querySelectorAll('.cp-btn, .control-card');
        buttons.forEach(btn => {
            // Prevent duplicate initialization
            if (btn.dataset.enhanced) return;
            btn.dataset.enhanced = 'true';

            btn.style.position = btn.style.position || 'relative';
            btn.style.overflow = 'hidden';

            const createRipple = (x, y) => {
                const ripple = document.createElement('span');
                ripple.className = 'cp-ripple';
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 0.75;
                ripple.style.cssText = `
                    position:absolute;left:${x - rect.left - size/2}px;top:${y - rect.top - size/2}px;width:${size}px;height:${size}px;
                    background:radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%);
                    border-radius:50%;pointer-events:none;animation:cpRipple 600ms ease-out;mix-blend-mode:screen;
                `;
                btn.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove());
            };

            btn.addEventListener('pointerdown', e => {
                createRipple(e.clientX, e.clientY);
                btn.classList.add('cp-pressed');
            });
            btn.addEventListener('pointerup', () => btn.classList.remove('cp-pressed'));
            btn.addEventListener('pointerleave', () => btn.classList.remove('cp-pressed'));
        });

        // Inject ripple keyframes once
        if (!document.getElementById('cpRippleStyles')) {
            const style = document.createElement('style');
            style.id = 'cpRippleStyles';
            style.textContent = `@keyframes cpRipple {0%{transform:scale(0);opacity:0.9}70%{transform:scale(1);opacity:0.3}100%{transform:scale(1.2);opacity:0}} .cp-pressed{transform:translateY(2px) scale(0.98);filter:brightness(0.92);} `;
            document.head.appendChild(style);
        }

        // Micro-tilt: pointer-based tilt for hero buttons and cp-btns for extra depth
        const tiltTargets = document.querySelectorAll('.hero-btn, .cp-btn');
        tiltTargets.forEach(el => {
            // prevent re-binding
            if (el.dataset.tiltBound) return;
            el.dataset.tiltBound = 'true';
            // Use pointer events for precise tilting
            el.style.transformOrigin = 'center center';
            el.addEventListener('pointermove', (ev) => {
                const rect = el.getBoundingClientRect();
                const px = (ev.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
                const py = (ev.clientY - rect.top) / rect.height - 0.5; // -0.5 .. 0.5
                const maxTilt = 7; // degrees
                const ry = px * maxTilt; // rotateY from pointer X
                const rx = -py * maxTilt; // rotateX from pointer Y
                // Slight lift when hovering
                el.style.transform = `perspective(700px) translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            });
            el.addEventListener('pointerleave', () => {
                el.style.transform = '';
            });
            el.addEventListener('pointerdown', () => {
                // press feedback
                el.style.transition = 'transform 80ms ease';
                el.style.transform = 'perspective(700px) translateZ(0) rotateX(2deg) rotateY(2deg) translateY(-2px) scale(0.995)';
            });
            el.addEventListener('pointerup', () => {
                el.style.transition = 'transform 160ms ease';
                el.style.transform = '';
            });
        });
    }

    setupSfx() {
        // Basic WebAudio SFX for UI interactions; respects mute stored in localStorage
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._audio = { ctx };
        } catch (e) {
            this._audio = null;
        }

        const muteBtn = document.getElementById('muteToggle');
        const isMuted = localStorage.getItem('menuMuted') === 'true';
        if (muteBtn) {
            muteBtn.setAttribute('aria-pressed', String(isMuted));
            if (isMuted) muteBtn.classList.add('muted');
            muteBtn.addEventListener('click', () => {
                const cur = localStorage.getItem('menuMuted') === 'true';
                localStorage.setItem('menuMuted', String(!cur));
                muteBtn.setAttribute('aria-pressed', String(!cur));
                muteBtn.classList.toggle('muted', !cur);
            });
        }
        // High-contrast accessibility toggle
        const contrastBtn = document.getElementById('contrastToggle');
        try {
            const isHigh = localStorage.getItem('menuHighContrast') === 'true';
            if (isHigh) document.body.classList.add('high-contrast');
            if (contrastBtn) {
                contrastBtn.setAttribute('aria-pressed', String(isHigh));
                contrastBtn.classList.toggle('active', isHigh);
                contrastBtn.addEventListener('click', () => {
                    const cur = localStorage.getItem('menuHighContrast') === 'true';
                    localStorage.setItem('menuHighContrast', String(!cur));
                    contrastBtn.setAttribute('aria-pressed', String(!cur));
                    contrastBtn.classList.toggle('active', !cur);
                    document.body.classList.toggle('high-contrast', !cur);
                });
            }
        } catch (e) {
            console.warn('Contrast toggle failed', e);
        }
    }

    playSound(type = 'click') {
        if (localStorage.getItem('menuMuted') === 'true') return;
        const audio = this._audio;
        if (!audio || !audio.ctx) return;
        const ctx = audio.ctx;
        const now = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type === 'error' ? 'sawtooth' : 'triangle';
        o.frequency.setValueAtTime(type === 'click' ? 800 : 220, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.12, now + 0.001);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        o.connect(g); g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.2);
    }

    updateMobileNav() {
        const navButtons = document.querySelectorAll('[data-screen-target]');
        navButtons.forEach(btn => {
            const target = btn.dataset.screenTarget;
            const isActive = target === this.currentView || (target === 'main' && this.currentView === 'main');
            btn.classList.toggle('active', isActive);
        });
    }

    openBaseBuilder(checkpoint = 5) {
        window.location.href = `base-builder.html?checkpoint=${checkpoint}`;
    }

    startGame() {
        if (this.launching) return;

        const launchPad = document.getElementById('launchPad');
        const ship = document.getElementById('launchShip');
        const launchStatus = document.getElementById('launchStatus');
        const launchBtn = document.getElementById('startGameBtn');
        const canAnimate = launchPad && ship;

        if (launchBtn) {
            launchBtn.disabled = true;
        }
        if (launchStatus) {
            launchStatus.textContent = 'Igniting thrusters...';
        }

        if (canAnimate) {
            this.launching = true;
            launchPad.classList.add('launching');
            ship.classList.add('launching');
            setTimeout(() => {
                if (launchStatus) {
                    launchStatus.textContent = 'Clearing orbit...';
                }
            }, 650);
            setTimeout(() => this.completeLaunchSequence(), 1500);
        } else {
            this.completeLaunchSequence();
        }
    }

    prepareCharacterForLaunch() {
        let selectedCharacter = this.characterSystem?.currentCharacter;
        if (!selectedCharacter && this.characterSystem?.getCurrentCharacter) {
            selectedCharacter = this.characterSystem.getCurrentCharacter();
        }

        try {
            if (selectedCharacter && selectedCharacter.id) {
                sessionStorage.setItem('selectedCharacter', String(selectedCharacter.id));
            } else if (typeof selectedCharacter === 'string') {
                sessionStorage.setItem('selectedCharacter', selectedCharacter);
            } else {
                sessionStorage.setItem('selectedCharacter', 'rookie');
            }
        } catch (e) {
            sessionStorage.setItem('selectedCharacter', 'rookie');
        }
    }

    completeLaunchSequence() {
        const launchPad = document.getElementById('launchPad');
        const ship = document.getElementById('launchShip');
        const launchStatus = document.getElementById('launchStatus');
        const launchBtn = document.getElementById('startGameBtn');

        if (launchPad) launchPad.classList.remove('launching');
        if (ship) ship.classList.remove('launching');
        if (launchBtn) launchBtn.disabled = false;
        if (launchStatus) launchStatus.textContent = 'Warp corridor engaged';

        this.launching = false;
        this.prepareCharacterForLaunch();
        window.location.href = 'game.html';
    }

    updateCollectionUI() {
        // Load collection data
        collectionSystem.loadProgress();

        // Update completion percentages
        const completion = collectionSystem.getCompletionPercentage();
        document.getElementById('enemyCompletion').textContent = `${Math.round(completion.enemies)}%`;
        document.getElementById('upgradeCompletion').textContent = `${Math.round(completion.upgrades)}%`;
        document.getElementById('achievementCompletion').textContent = `${Math.round(completion.achievements)}%`;
        document.getElementById('overallCompletion').textContent = `${Math.round(completion.overall)}%`;

        // Update statistics
        const stats = collectionSystem.getStatistics();
        document.getElementById('statTotalKills').textContent = stats.totalKills.toLocaleString();
        document.getElementById('statMaxDistance').textContent = `${Math.floor(stats.totalDistance / 1000)} km`;
        document.getElementById('statCreditsEarned').textContent = stats.totalCredits.toLocaleString();
        document.getElementById('statPlayTime').textContent = `${Math.floor(stats.totalPlayTime / 3600)}h ${Math.floor((stats.totalPlayTime % 3600) / 60)}m`;
        document.getElementById('statMaxCombo').textContent = stats.maxCombo;
        document.getElementById('statMaxStreak').textContent = stats.maxStreak;
        document.getElementById('statBossesDefeated').textContent = stats.bossesDefeated;
        document.getElementById('statMegaBosses').textContent = stats.megaBossesDefeated;

        // Build collection tabs
        this.buildEnemyCollection();
        this.buildUpgradeCollection();
        this.buildAchievementCollection();

        // Set up tab switching
        this.setupCollectionTabs();

        // Populate holographic hangar gallery (ships and locked silhouettes)
        try {
            this.populateHangarGallery();
        } catch (e) {
            // non-fatal if hangar population fails
            console.warn('populateHangarGallery failed', e);
        }
    }

    populateHangarGallery() {
        // Ported: render the holo hangar inside the vortex renderer for tight blending
        const container = document.getElementById('holoHangar');
        // Keep a minimal DOM fallback but prefer the canvas overlay
        if (container) container.innerHTML = '<div class="hangar-canvas-fallback">Ships shown in holographic hangar.</div>';

        // Attempt to get ship data from available systems; fallback to small demo set
        let ships = [];
        if (window.shipRegistry && typeof shipRegistry.getAllShips === 'function') {
            ships = shipRegistry.getAllShips();
        } else if (this.characterSystem && typeof this.characterSystem.getShipList === 'function') {
            ships = this.characterSystem.getShipList();
        } else if (window.collectionSystem && typeof collectionSystem.getShipCollection === 'function') {
            ships = collectionSystem.getShipCollection();
        } else {
            // graceful fallback demo data
            ships = [
                { key: 'rookie', name: 'Rookie', unlocked: true },
                { key: 'vanguard', name: 'Vanguard', unlocked: false },
                { key: 'pegasus', name: 'Pegasus', unlocked: false }
            ];
        }

        // Ensure the vortex renderer receives the hangar data
        if (window.VortexBackground && typeof window.VortexBackground.setHangarShips === 'function') {
            try {
                // normalize to expected shape
                const normalized = ships.map(s => ({ key: s.key || s.id || s.sprite, name: s.name || s.key || 'Ship', unlocked: !!s.unlocked, sprite: s.sprite || null }));
                window.VortexBackground.setHangarShips(normalized);
            } catch (e) {
                console.warn('Failed to hand hangar data to vortex renderer', e);
            }
        }
    }

    buildEnemyCollection() {
        const enemyData = collectionSystem.getEnemyCollection();
        const enemyGrid = document.getElementById('enemyGrid');
        if (!enemyGrid) return;

        // Start with regular enemies
        this.renderEnemyCategory(enemyGrid, enemyData.regular, 'regular');
    }

    buildUpgradeCollection() {
        const upgradeData = collectionSystem.getUpgradeCollection();
        const upgradeGrid = document.getElementById('upgradeGrid');
        if (!upgradeGrid) return;

        let html = '';

        Object.entries(upgradeData).forEach(([category, upgrades]) => {
            upgrades.forEach(upgrade => {
                const unlocked = upgrade.unlocked;
                html += `
                    <div class="collection-card ${unlocked ? 'unlocked' : 'locked'}">
                        <div class="collection-card-icon">${upgrade.icon}</div>
                        <div class="collection-card-name">${upgrade.name}</div>
                        <div class="collection-card-description">${upgrade.description}</div>
                        <div class="collection-card-rarity rarity-unlocked">Unlocked</div>
                    </div>
                `;
            });
        });

        upgradeGrid.innerHTML = html;
    }

    buildAchievementCollection() {
        const achievementGrid = document.getElementById('achievementGrid');
        if (!achievementGrid) return;

        // Placeholder for achievements - will be populated when achievement system is integrated
        achievementGrid.innerHTML = '<div class="collection-card locked"><div class="collection-card-name">Coming Soon</div><div class="collection-card-description">Achievement system integration pending</div></div>';
    }

    renderEnemyCategory(container, enemies, category) {
        let html = '';

        enemies.forEach(enemy => {
            const encountered = enemy.encountered;
            const rarityClass = `rarity-${enemy.rarity}`;
            html += `
                <div class="collection-card ${encountered ? 'unlocked' : 'locked'}">
                    <div class="collection-card-icon">${this.getEnemyIcon(enemy.key)}</div>
                    <div class="collection-card-name">${enemy.name}</div>
                    <div class="collection-card-description">${enemy.description}</div>
                    <div class="collection-card-stats">
                        <div class="stat-item">
                            <span class="stat-label">HP</span>
                            <span class="stat-value">${enemy.stats.health}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">SPD</span>
                            <span class="stat-value">${enemy.stats.speed}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">PTS</span>
                            <span class="stat-value">${enemy.stats.points}</span>
                        </div>
                    </div>
                    <div class="collection-card-rarity ${rarityClass}">${enemy.rarity.toUpperCase()}</div>
                    <div class="collection-card-reward">+${enemy.unlockReward} Credits</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    getEnemyIcon(enemyType) {
        const icons = {
            'basic': '👾',
            'fast': '💨',
            'tank': '🛡️',
            'sniper': '🎯',
            'bomber': '💣',
            'swarm': '🐝',
            'heavy': '🚀',
            'stealth': '👻',
            'guardian': '🛡️',
            'assassin': '🗡️',
            'splitter': '✂️',
            'miniboss_destroyer': '💥',
            'miniboss_carrier': '🚁',
            'miniboss_fortress': '🏰',
            'miniboss_hunter': '🔍',
            'miniboss_phantom': '👻',
            'miniboss_berserker': '😡',
            'miniboss_inferno': '🔥',
            'miniboss_kraken': '🐙',
            'miniboss_ironclad': '⚔️',
            'miniboss_venom': '🧪',
            'megaboss_dreadnought': '🚢',
            'megaboss_mothership': '🛸',
            'megaboss_leviathan': '🐉'
        };
        return icons[enemyType] || '❓';
    }

    setupCollectionTabs() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchCollectionTab(tabName);
            });
        });

        // Category switching for enemies
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchEnemyCategory(category);
            });
        });
    }

    switchCollectionTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.collection-tab').forEach(tab => {
            tab.classList.toggle('active', tab.id === `${tabName}Tab`);
        });
    }

    switchEnemyCategory(category) {
        // Update category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Update enemy grid
        const enemyData = collectionSystem.getEnemyCollection();
        const enemyGrid = document.getElementById('enemyGrid');
        if (enemyGrid && enemyData[category]) {
            this.renderEnemyCategory(enemyGrid, enemyData[category], category);
        }
    }
}

// Initialize menu when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize menu system (saveSystem is already created globally in save-system.js)
    new MenuSystem();
});