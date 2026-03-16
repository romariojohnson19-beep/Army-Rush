class Leaderboard {
    constructor(storageKey = 'galaxyLeaderboard') {
        this.storageKey = storageKey;
    }

    _load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('Failed to load leaderboard', e);
            return [];
        }
    }

    _save(list) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(list));
        } catch (e) {
            console.warn('Failed to save leaderboard', e);
        }
    }

    addEntry({ name = 'PLAYER', score = 0, distance = 0, kills = 0, date = null } = {}) {
        const list = this._load();
        const entry = { name: String(name).substring(0,16), score: Number(score)||0, distance: Number(distance)||0, kills: Number(kills)||0, date: date || new Date().toISOString() };
        list.push(entry);
        // Sort by score desc then distance
        list.sort((a,b) => (b.score - a.score) || (b.distance - a.distance));
        // Keep only top 50
        const top = list.slice(0,50);
        this._save(top);
        return entry;
    }

    getTop(n = 10) {
        const list = this._load();
        return list.slice(0, n);
    }

    renderInto(container) {
        if (!container) return;
        const top = this.getTop(10);
        container.innerHTML = '';
        if (top.length === 0) {
            container.innerHTML = '<div style="padding:12px;color:#aaa">No scores yet</div>';
            return;
        }
        const list = document.createElement('div');
        list.className = 'leaderboard-list';
        top.forEach((e, idx) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-row';
            row.innerHTML = `<div class="lb-rank">${idx+1}</div><div class="lb-name">${e.name}</div><div class="lb-score">${e.score}</div><div class="lb-dist">${e.distance}km</div>`;
            list.appendChild(row);
        });
        container.appendChild(list);
    }
}

// Hook into game over UI
document.addEventListener('DOMContentLoaded', () => {
    const lb = new Leaderboard();
    const overlay = document.getElementById('game-over-overlay');
    if (!overlay) return;

    // Create leaderboard container inside the modal if not present
    const modal = overlay.querySelector('.game-over-modal');
    if (!modal) return;

    let container = modal.querySelector('#leaderboard-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'leaderboard-container';
        container.style.margin = '12px 0 6px 0';
        container.style.padding = '8px';
        container.style.background = 'rgba(255,255,255,0.02)';
        container.style.borderRadius = '6px';
        container.style.maxHeight = '160px';
        container.style.overflow = 'auto';
        modal.insertBefore(container, modal.querySelector('.modal-actions'));
    }

    // Add submit button
    let submitBtn = modal.querySelector('#submit-score-btn');
    if (!submitBtn) {
        submitBtn = document.createElement('button');
        submitBtn.id = 'submit-score-btn';
        submitBtn.className = 'action-btn';
        submitBtn.style.marginRight = '8px';
        submitBtn.innerHTML = '<div class="btn-icon">🏷️</div><div class="btn-text">SUBMIT SCORE</div>';
        // place near actions
        const actions = modal.querySelector('.modal-actions');
        if (actions) actions.insertBefore(submitBtn, actions.firstChild);
    }

    submitBtn.addEventListener('click', () => {
        // read final stats from overlay
        const scoreEl = document.getElementById('final-score-value');
        const distEl = document.getElementById('final-distance-value');
        const killsEl = document.getElementById('final-kills-value');
        const s = scoreEl ? Number(scoreEl.textContent) || 0 : 0;
        const d = distEl ? Number(distEl.textContent) || 0 : 0;
        const k = killsEl ? Number(killsEl.textContent) || 0 : 0;

        const name = prompt('Enter name for leaderboard (max 16 chars):', 'PILOT');
        if (!name) return;
        lb.addEntry({ name: name.trim().substring(0,16), score: s, distance: d, kills: k });
        lb.renderInto(container);
        alert('Score submitted!');
    });

    // Render on open: observe overlay visibility
    const observer = new MutationObserver(() => {
        if (!overlay.classList.contains('hidden')) {
            lb.renderInto(container);
        }
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
});
