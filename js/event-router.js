// Event Router: rotates environmental hazards/modifiers during the run
// Lightweight effects: time dilation (fast/slow), fog overlay, EMP jam

(function(global){
  class EventRouter {
    constructor() {
      this.activeHazard = null; // { key, name, duration, timer, data }
      this.cooldown = 0;
      this.scheduleCounter = 0;
      this._empJamTimer = 0;
    }

    update(game) {
      if (!game || game.gameOver || game.isPaused) return;

      // Tick existing hazard
      if (this.activeHazard) {
        this.activeHazard.timer--;
        if (this.activeHazard.key === 'emp') {
          // EMP jam cycles: 30 frames jam, 45 frames off
          this._empJamTimer++;
        }
        if (this.activeHazard.timer <= 0) {
          this.clearHazard(game);
        }
      }

      if (this.cooldown > 0) {
        this.cooldown--;
        return;
      }

      // Schedule a new hazard roughly every 4 waves, avoid back-to-back
      const wave = game.enemySpawner?.currentWave || 1;
      if (!this.activeHazard && wave > 1 && wave % 4 === 0) {
        this.startRandomHazard(game);
      }
    }

    startRandomHazard(game) {
      // Weighted selection
      const r = Math.random();
      if (r < 0.33) {
        this.applyTimeDilation(game, 0.75, 'TIME DILATION (SLOW)');
      } else if (r < 0.66) {
        this.applyTimeDilation(game, 1.3, 'TIME DILATION (RUSH)');
      } else if (r < 0.85) {
        this.applyFog(game);
      } else {
        this.applyEMP(game);
      }
    }

    applyTimeDilation(game, factor = 1.0, name = 'TIME DILATION') {
      // Factor > 1 = faster player fire and spawns; < 1 = slower
      this.activeHazard = { key: 'time', name, duration: 12*60, timer: 12*60, data: { factor } };
      // Use player's modifier system so this composes with other modifiers
      if (game.player && typeof game.player.recomputeFireRate === 'function') {
        const mod = 1 / Math.max(0.5, Math.min(2, factor));
        game.player.fireRateModifiers = game.player.fireRateModifiers || {};
        game.player.fireRateModifiers['timeDilation'] = mod;
        game.player.recomputeFireRate();
      } else if (game.player) {
        this._preTimeFireRate = game.player.fireRate;
        const clamped = Math.max(2, Math.floor(game.player.fireRate / Math.max(0.5, Math.min(2, factor))));
        game.player.fireRate = clamped;
      }
      // Nudge spawner via a temporary multiplier handoff to DifficultyManager path
      this._spawnerFactor = factor;
    }

    applyFog(game) {
      this.activeHazard = { key: 'fog', name: 'NEBULA FOG', duration: 10*60, timer: 10*60, data: { alpha: 0.25 } };
    }

    applyEMP(game) {
      this.activeHazard = { key: 'emp', name: 'EMP INTERFERENCE', duration: 8*60, timer: 8*60, data: {} };
      this._empJamTimer = 0;
    }

    clearHazard(game) {
      if (!this.activeHazard) return;
      // Restore any modified state
      if (this.activeHazard.key === 'time' && game.player) {
        if (typeof game.player.recomputeFireRate === 'function' && game.player.fireRateModifiers) {
          delete game.player.fireRateModifiers['timeDilation'];
          game.player.recomputeFireRate();
        } else if (typeof this._preTimeFireRate === 'number') {
          game.player.fireRate = this._preTimeFireRate;
        }
      }
      this.activeHazard = null;
      this.cooldown = 7*60; // pause between hazards
      this._spawnerFactor = 1.0;
    }

    // Allow game loop to query if player shots should be jammed this frame
    shouldJamPlayerFire() {
      if (!this.activeHazard || this.activeHazard.key !== 'emp') return false;
      // Cycle: jam 30 frames, allow 45 frames, repeat
      const cycle = this._empJamTimer % 75;
      return cycle < 30; // jam during first 30 frames of each cycle
    }

    // Let DifficultyManager incorporate temporary spawner factor
    getSpawnerRateFactor() {
      if (!this.activeHazard) return 1.0;
      if (this.activeHazard.key === 'time') {
        return Math.max(0.6, Math.min(1.6, this._spawnerFactor || 1.0));
      }
      return 1.0;
    }

    // Optional: draw overlay for fog and hazard banner
    drawOverlay(ctx, width, height) {
      if (!this.activeHazard) return;
      // Banner
      ctx.save();
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,255,163,0.9)';
      ctx.fillText(this.activeHazard.name, width/2, 16);
      ctx.restore();

      if (this.activeHazard.key === 'fog') {
        const alpha = this.activeHazard.data?.alpha || 0.2;
        ctx.save();
        ctx.fillStyle = `rgba(80,90,120,${alpha})`;
        ctx.fillRect(0,0,width,height);
        // Light vignette
        const grad = ctx.createRadialGradient(width/2, height/2, Math.min(width,height)*0.2, width/2, height/2, Math.max(width,height)*0.7);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,width,height);
        ctx.restore();
      }
    }
  }

  global.EventRouter = EventRouter;
})(window);
