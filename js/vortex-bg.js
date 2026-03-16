/* Vortex background module
   Exposes window.VortexBackground.init(options)
   options: { canvasId, guiSelector }
*/
(function(){
    // Read per-corner radii from computed style and convert to px numbers
    function computeCornerRadii(winEl, cs, boxW, boxH) {
        // cs may provide values like '18px' or '12%'. Convert percentages to px relative to the smaller box dimension.
        const corners = [
            'borderTopLeftRadius',
            'borderTopRightRadius',
            'borderBottomRightRadius',
            'borderBottomLeftRadius'
        ];
        const base = Math.min(boxW, boxH) || 100;
        const out = corners.map(prop => {
            let val = cs[prop] || '18px';
            val = String(val).trim();
            if (val.endsWith('%')) {
                const pct = parseFloat(val);
                if (isNaN(pct)) return 18;
                return Math.max(0, (pct / 100) * base);
            }
            // strip non-digit chars (px)
            const px = parseFloat(val);
            return isNaN(px) ? 18 : Math.max(0, px);
        });
        return out;
    }

    function roundedRectPath(ctx, x, y, w, h, radii) {
        // radii: [tl, tr, br, bl]
        const [rtl, rtr, rbr, rbl] = radii.map(r => Math.max(0, r));
        ctx.beginPath();
        ctx.moveTo(x + rtl, y);
        ctx.lineTo(x + w - rtr, y);
        if (rtr) ctx.quadraticCurveTo(x + w, y, x + w, y + rtr);
        else ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h - rbr);
        if (rbr) ctx.quadraticCurveTo(x + w, y + h, x + w - rbr, y + h);
        else ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + rbl, y + h);
        if (rbl) ctx.quadraticCurveTo(x, y + h, x, y + h - rbl);
        else ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + rtl);
        if (rtl) ctx.quadraticCurveTo(x, y, x + rtl, y);
        else ctx.lineTo(x, y);
        ctx.closePath();
    }

    function init(options = {}) {
        const canvasId = options.canvasId || 'vortexCanvas';
        const guiSelector = options.guiSelector || '.gui-window';
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = 'assets/sprites/menu/Menu ui.png';

    const state = { t:0, dpr: Math.max(1, window.devicePixelRatio || 1) };
    // Hangar overlay state (ships rendered into the GUI clip for tight blending)
    state.hangarShips = []; // array of { key, name, unlocked, sprite }
    state._hangarImgs = {}; // cache of Image objects by url

        // LOD based on device memory / cores
        const deviceMemory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;

        let starCount = (Math.min(deviceMemory, cores) >= 4) ? 150 : 80;
        // allow override by media query small screens
        function initStars() {
            stars.length = 0;
            const w = canvas.width / state.dpr;
            const h = canvas.height / state.dpr;
            const isMobile = (Math.min(w, h) < 720);
            const count = isMobile ? Math.max(40, Math.floor(starCount * 0.6)) : starCount;
            for (let i = 0; i < count; i++) {
                stars.push({ x: Math.random()*w, y: Math.random()*h, z: Math.random()*0.8+0.2, a: Math.random()*0.6+0.2, tw: Math.random()*0.8+0.2, s: Math.random()*1.4+0.4 });
            }
        }

        const stars = [];

        let animId = 0;

        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            state.dpr = Math.max(1, window.devicePixelRatio || 1);
            canvas.width = Math.floor(w * state.dpr);
            canvas.height = Math.floor(h * state.dpr);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
            initStars();
        };
        resize();
        window.addEventListener('resize', resize);

        // Pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (animId) cancelAnimationFrame(animId);
                animId = 0;
            } else {
                if (!animId) animId = requestAnimationFrame(step);
            }
        });

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Allow reduced updates on low-end devices: we advance star positions only every N frames
        const lowEnd = (deviceMemory < 2 || cores < 2);
        const updateInterval = lowEnd ? 2 : 1;
        state.frame = 0;

        const draw = () => {
            const w = canvas.width / state.dpr;
            const h = canvas.height / state.dpr;
            ctx.clearRect(0,0,w,h);

            // Nebula
            const g1 = ctx.createRadialGradient(w*0.2, h*0.2, Math.min(w,h)*0.05, w*0.2, h*0.2, Math.max(w,h)*0.6);
            g1.addColorStop(0, 'rgba(0,255,170,0.06)');
            g1.addColorStop(1, 'rgba(0,0,0,0)');
            const g2 = ctx.createRadialGradient(w*0.8, h*0.7, Math.min(w,h)*0.08, w*0.8, h*0.7, Math.max(w,h)*0.7);
            g2.addColorStop(0, 'rgba(68,120,255,0.06)');
            g2.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g1; ctx.fillRect(0,0,w,h);
            ctx.fillStyle = g2; ctx.fillRect(0,0,w,h);

            // stars
            ctx.save();
            for (const star of stars) {
                const tw = 0.5 + 0.5 * Math.sin(state.t * 0.003 * star.tw + star.x);
                const alpha = Math.min(1, Math.max(0, star.a * tw));
                const size = star.s * (0.8 + 0.2 * star.z);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#cfeaff';
                ctx.fillRect(star.x, star.y, size, size);
                // update position only on configured frames to save CPU on low-end devices
                if (state.frame % updateInterval === 0) {
                    star.y += 0.02 + 0.06 * (1 - star.z);
                    if (star.y > h) { star.y = -2; star.x = Math.random() * w; }
                }
            }
            ctx.restore();

            if (img.complete && img.naturalWidth > 0) {
                const winEl = document.querySelector(guiSelector);
                if (winEl) {
                    const rect = winEl.getBoundingClientRect();
                    const winX = rect.left;
                    const winY = rect.top;
                    const winW = rect.width;
                    const winH = rect.height;

                    const imgW = img.naturalWidth;
                    const imgH = img.naturalHeight;
                    const scale = Math.max(winW / imgW, winH / imgH);
                    const drawW = imgW * scale;
                    const drawH = imgH * scale;
                    const dx = Math.round(winX + (winW - drawW) / 2);
                    const dy = Math.round(winY + (winH - drawH) / 2);

                    // compute radii
                    const cs = window.getComputedStyle(winEl);
                    const radii = computeCornerRadii(winEl, cs, winW, winH);

                    ctx.save();
                    // create rounded rect path using per-corner radii clamped to half of min dimension
                    roundedRectPath(ctx, winX, winY, winW, winH, radii.map(r => Math.min(r, Math.min(winW, winH)/2)));
                    ctx.clip();
                    // Draw the menu art
                    ctx.globalAlpha = 1.0;
                    ctx.drawImage(img, dx, dy, drawW, drawH);

                    // Draw hangar ships (if provided) so they visually blend with the Menu UI art
                    try {
                        const ships = state.hangarShips || [];
                        if (ships.length) {
                            // layout: centered row, allow up to 5 per row and scale to gui size
                            const cols = Math.min(5, Math.max(1, ships.length));
                            const rowCount = Math.ceil(ships.length / cols);
                            const padding = Math.max(8, Math.min(24, Math.round(winW * 0.02)));
                            const availableW = winW - padding * 2;
                            const cellW = availableW / cols;
                            const cellH = Math.min(140, winH * 0.18);
                            const startX = winX + padding + (availableW - cellW * cols) / 2;
                            const startY = winY + Math.max(40, winH * 0.28);

                            ships.forEach((s, i) => {
                                const col = i % cols;
                                const row = Math.floor(i / cols);
                                const cx = startX + col * cellW + cellW / 2;
                                const cy = startY + row * (cellH + 12) + cellH / 2;

                                // resolve sprite URL candidates
                                const candidates = [];
                                if (s.sprite) candidates.push(s.sprite);
                                if (s.key) {
                                    candidates.push(`assets/ships/${s.key}.png`);
                                    candidates.push(`assets/ships/${s.key}.svg`);
                                    candidates.push(`assets/sprites/ships/${s.key}.png`);
                                    candidates.push(`assets/sprites/ships/${s.key}.svg`);
                                }
                                candidates.push('assets/sprites/ships/rookie.svg');

                                // find first cached url or start loading first candidate
                                let loadedImg = null;
                                let srcUrl = null;
                                for (const c of candidates) {
                                    if (state._hangarImgs[c] && state._hangarImgs[c].complete && state._hangarImgs[c].naturalWidth > 0) {
                                        loadedImg = state._hangarImgs[c];
                                        srcUrl = c;
                                        break;
                                    }
                                }
                                if (!loadedImg) {
                                    // kick off loading for first candidate that isn't already requested
                                    for (const c of candidates) {
                                        if (!state._hangarImgs[c]) {
                                            const im = new Image();
                                            im.crossOrigin = 'anonymous';
                                            im.src = c;
                                            im.onload = () => { /* will be drawn on next frame */ };
                                            im.onerror = () => { /* ignore */ };
                                            state._hangarImgs[c] = im;
                                        }
                                    }
                                    // pick any that is already partially ready
                                    for (const c of candidates) {
                                        if (state._hangarImgs[c] && state._hangarImgs[c].complete && state._hangarImgs[c].naturalWidth > 0) {
                                            loadedImg = state._hangarImgs[c]; srcUrl = c; break;
                                        }
                                    }
                                }

                                if (loadedImg) {
                                    // scale to fit cell
                                    const imgW = loadedImg.naturalWidth;
                                    const imgH = loadedImg.naturalHeight;
                                    const maxW = cellW * 0.9;
                                    const maxH = cellH * 0.9;
                                    let sscale = Math.min(maxW / imgW, maxH / imgH, 1.8);
                                    const dw = imgW * sscale;
                                    const dh = imgH * sscale;
                                    const dxs = cx - dw/2;
                                    const dys = cy - dh/2;

                                    ctx.save();
                                    // subtle holographic glow for unlocked ships
                                    if (s.unlocked) {
                                        ctx.shadowColor = 'rgba(0,255,170,0.14)';
                                        ctx.shadowBlur = 18;
                                    } else {
                                        ctx.globalAlpha = 0.5;
                                        ctx.filter = 'grayscale(1) blur(0.2px)';
                                    }
                                    ctx.drawImage(loadedImg, dxs, dys, dw, dh);
                                    // overlay lock badge for locked
                                    if (!s.unlocked) {
                                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                                        ctx.fillRect(dxs, dys + dh - 22, dw, 18);
                                        ctx.fillStyle = 'rgba(255,200,200,0.95)';
                                        ctx.font = '12px "Space Grotesk", monospace';
                                        ctx.textAlign = 'center';
                                        ctx.fillText('PREMIUM • LOCKED', cx, dys + dh - 8);
                                    }
                                    ctx.restore();
                                }
                            });
                        }
                    } catch (e) {
                        // non-fatal drawing error for hangar overlay
                        console.warn('Hangar overlay draw error', e);
                    }

                    // local soft spotlight to increase menu art visibility inside the GUI window
                    const gx = winX + winW/2;
                    const gy = winY + winH/2;
                    const spotlight = ctx.createRadialGradient(gx, gy, Math.min(winW, winH)*0.08, gx, gy, Math.max(winW, winH)*0.6);
                    spotlight.addColorStop(0, 'rgba(255,255,255,0.08)');
                    spotlight.addColorStop(0.4, 'rgba(255,255,255,0.02)');
                    spotlight.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillStyle = spotlight;
                    ctx.fillRect(winX, winY, winW, winH);
                    ctx.globalCompositeOperation = 'source-over';

                    ctx.restore();
                }

                // vignette
                const cx = w/2, cy = h/2;
                const grad = ctx.createRadialGradient(cx, cy, Math.min(w,h)*0.1, cx, cy, Math.max(w,h)*0.65);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,0.55)');
                ctx.fillStyle = grad;
                ctx.fillRect(0,0,w,h);

                // subtle ring
                const ringR = Math.min(w,h) * (0.16 + 0.016 * Math.sin(state.t * 0.002));
                const ring = ctx.createRadialGradient(cx, cy, ringR*0.86, cx, cy, ringR);
                ring.addColorStop(0, 'rgba(0,255,170,0.06)');
                ring.addColorStop(1, 'rgba(0,255,170,0)');
                ctx.fillStyle = ring;
                ctx.beginPath();
                ctx.arc(cx, cy, ringR, 0, Math.PI*2);
                ctx.fill();
            }

            state.t += 16;
            state.frame++;
        };

        function step() {
            draw();
            animId = requestAnimationFrame(step);
        }

        img.onload = () => {
            draw();
            if (!prefersReducedMotion) animId = requestAnimationFrame(step);
        };

        if (img.complete && img.naturalWidth > 0) {
            img.onload = null;
            draw();
            if (!prefersReducedMotion) animId = requestAnimationFrame(step);
        }

        // expose a small API
        window.VortexBackground = window.VortexBackground || {};
        window.VortexBackground._internal = { canvas, ctx, stars };
        window.VortexBackground.init = function() { /* already initialized */ };
        window.VortexBackground.pause = function() { if (animId) cancelAnimationFrame(animId); animId = 0; };
        window.VortexBackground.resume = function() { if (!animId && !prefersReducedMotion) animId = requestAnimationFrame(step); };
        // Provide API for setting hangar ships to be rendered inside the GUI window
        window.VortexBackground.setHangarShips = function(list) {
            try {
                if (!Array.isArray(list)) list = [];
                state.hangarShips = list.map(s => ({ key: s.key, name: s.name, unlocked: !!s.unlocked, sprite: s.sprite || null }));
            } catch (e) {
                console.warn('setHangarShips error', e);
            }
        };
    }

    // Expose init
    window.VortexBackground = window.VortexBackground || {};
    window.VortexBackground.init = init;
})();
