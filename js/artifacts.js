// Artifacts system: lightweight draft and session application
(function(){
    const ARTIFACTS = [
        { id: 'glassCannon', name: 'Glass Cannon', desc: '+30% bullet damage, -1 max shield/hull', apply(game){ game._artifact_glass = true; game.player._relicDamageBoost = (game.player._relicDamageBoost||1)*1.3; game.player.maxHealth = Math.max(1, game.player.maxHealth-1); game.player.health = Math.min(game.player.health, game.player.maxHealth); }, remove(game){ /* session only */ }},
        { id: 'efficientThrusters', name: 'Efficient Thrusters', desc: '+20% speed, +10% magnet range', apply(game){ game.player.baseSpeed *= 1.2; game.player.speed = game.player.baseSpeed; game.player.magneticRange += 20; } },
        { id: 'luckySalvager', name: 'Lucky Salvager', desc: '+15% better drops and +20% resource yield', apply(game){ game._artifact_lucky = true; if (!game.resourceManager._yieldBoost) game.resourceManager._yieldBoost=1; game.resourceManager._yieldBoost *= 1.2; } },
        { id: 'overdriveCatalyst', name: 'Overdrive Catalyst', desc: 'Overdrive builds 40% faster', apply(game){ game._overdriveGainMultiplier = (game._overdriveGainMultiplier||1)*1.4; } },
        { id: 'magnetArray', name: 'Magnet Array', desc: '+60 magnetic range, resources auto-collect faster', apply(game){ game.player.magneticRange += 60; } },
        { id: 'hardenedPlating', name: 'Hardened Plating', desc: '+1 max hull, -10% speed', apply(game){ game.player.maxHealth += 1; game.player.health = Math.min(game.player.health+1, game.player.maxHealth); game.player.baseSpeed *= 0.9; game.player.speed = game.player.baseSpeed; } },
    ];

    function drawArtifactCard(a){
        const div = document.createElement('div');
        div.className = 'artifact-card';
        div.dataset.id = a.id;
        div.innerHTML = `
            <div class="artifact-title">${a.name}</div>
            <div class="artifact-desc">${a.desc}</div>
            <div class="artifact-tag">${a.id}</div>
        `;
        return div;
    }

    function pickRandom(n){
        const pool = ARTIFACTS.slice();
        const out = [];
        while (out.length<n && pool.length){
            const i = Math.floor(Math.random()*pool.length);
            out.push(pool.splice(i,1)[0]);
        }
        return out;
    }

    window.Artifacts = {
        pool: ARTIFACTS,
        draftInto(container, onConfirm){
            const picks = pickRandom(3);
            container.innerHTML = '';
            const selected = new Set();
            picks.forEach(a=>{
                const card = drawArtifactCard(a);
                card.addEventListener('click', ()=>{
                    if (selected.has(a.id)) { selected.delete(a.id); card.classList.remove('selected'); return; }
                    if (selected.size>=2) return;
                    selected.add(a.id); card.classList.add('selected');
                });
                container.appendChild(card);
            });
            return ()=>{
                const chosen = picks.filter(a=>selected.has(a.id));
                onConfirm(chosen);
            };
        }
    };
})();
