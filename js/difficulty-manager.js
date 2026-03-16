// Dynamic Difficulty Manager
// Adjusts enemy spawn rates and composition based on simple performance signals

(function(global){
  class DifficultyManager {
    constructor() {
      this.level = 1.0; // multiplicative difficulty
      this.spawnRateMultiplier = 1.0; // >1 = faster spawns
      this.aggressionLevel = 0.0; // 0..1 chance to upgrade enemy type
      this.maxEnemiesBonus = 0; // additional enemies per wave
      this.lastEvaluationKm = -1;
      this.smoothing = 0.15; // EMA smoothing for stability
    }

    // Inspect game metrics and update internal level
    update(game) {
      if (!game || !game.enemySpawner) return;
      const km = Math.max(0, Math.floor((game.distance || 0) / 100));
      if (km === this.lastEvaluationKm) return;
      this.lastEvaluationKm = km;

      const spawner = game.enemySpawner;
      const kills = Math.max(1, spawner.totalEnemiesKilled || 0);
      const healthRatio = Math.max(0, Math.min(1, (game.player?.health || 1) / (game.player?.maxHealth || 1)));
      const streak = Math.max(0, game.player?.killStreak || 0);

      // Coarse signals
      const killsPerKm = kills / Math.max(1, km + 1);
      const overdriveActive = !!(game.overdrive && game.overdrive.active);

      // Base target: start at 1.0 and scale up softly with performance
      let targetLevel = 1.0;

      // If player is healthy and on a streak, nudge difficulty up
      targetLevel += streak >= 20 ? 0.25 : streak >= 10 ? 0.15 : streak >= 5 ? 0.08 : 0;
      targetLevel += Math.max(0, (healthRatio - 0.7)) * 0.3;

      // Kill efficiency pushes difficulty slowly upward
      targetLevel += Math.min(0.4, killsPerKm * 0.05);

      // Overdrive active gives a brief spike
      if (overdriveActive) targetLevel += 0.15;

      // If player is struggling (low health, no streak), ease difficulty down a bit
      if (healthRatio < 0.4 && streak < 3) {
        targetLevel -= 0.2;
      }

      // Clamp target range
      targetLevel = Math.max(0.7, Math.min(1.8, targetLevel));

      // Smoothly approach target level
      this.level = this.level + (targetLevel - this.level) * this.smoothing;

      // Derive knobs
      this.spawnRateMultiplier = 1.0 + (this.level - 1.0) * 0.9; // up to ~+70% at cap
      this.aggressionLevel = Math.max(0, Math.min(0.6, (this.level - 1.0) * 0.6));
      this.maxEnemiesBonus = Math.round(Math.max(0, (this.level - 1.0) * 6)); // up to +4 or +5
    }

    applyToSpawner(spawner) {
      if (!spawner || typeof spawner.applyDifficulty !== 'function') return;
      spawner.applyDifficulty({
        spawnRateMultiplier: this.spawnRateMultiplier,
        aggressionLevel: this.aggressionLevel,
        maxEnemiesBonus: this.maxEnemiesBonus,
        levelText: `x${this.level.toFixed(2)}`
      });
    }

    getLevelText() {
      return `x${this.level.toFixed(2)}`;
    }
  }

  global.DifficultyManager = DifficultyManager;
})(window);
