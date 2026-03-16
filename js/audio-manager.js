class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.isMuted = false;
        this.unlocked = false;
        this.pendingEvents = [];
        this.volume = 0.35;
        this.supported = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
        
        // Music tracks
        this.tracks = [
            { name: 'Battle of the Void', file: 'assets/music/Battle of the Void.ogg', loop: true },
            { name: 'Black Rock', file: 'assets/music/Black Rock.ogg', loop: true },
            { name: 'Desolation', file: 'assets/music/Desolation.ogg', loop: true },
            { name: 'Flaming Soul', file: 'assets/music/Flaming Soul.ogg', loop: true },
            { name: 'Lethal Injection', file: 'assets/music/Lethal Injection.ogg', loop: true }
        ];
        
        // Menu music track
        this.menuTrack = { name: 'Out There', file: 'assets/music/OutThere.ogg', loop: true };
        
        this.currentTrack = null;
        this.audioElement = null;
        this.musicVolume = 0.4;
        
        // Sound effects
        this.sfxVolume = 0.5;
    // Primary SFX files (fallback order applied in playPlayerLaser)
    this.playerLaserSound = 'assets/sounds/player-laser.ogg';
    // Optional files you may provide to replace the basic/upgrade laser sounds
    this.playerLaserBasicSound = 'assets/sounds/player-laser-basic.ogg';
    this.playerLaserUpgradedSound = 'assets/sounds/player-laser-upgraded.ogg';
        this.enemyLaserSound = 'assets/sounds/enemy-laser.ogg';
        
        if (this.supported) {
            this.queueUnlock();
        }
    }

    queueUnlock() {
        const unlock = () => {
            this.initializeContext();
            document.removeEventListener('pointerdown', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('pointerdown', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
    }

    initializeContext() {
        if (this.unlocked || !this.supported) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioCtx();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        this.masterGain.connect(this.context.destination);
        this.unlocked = true;
        this.pendingEvents.forEach(fn => fn());
        this.pendingEvents = [];
    }

    withContext(callback) {
        if (!this.supported) return;
        if (!this.unlocked) {
            this.pendingEvents.push(callback);
            return;
        }
        callback();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        }
        return this.isMuted;
    }

    playTone({ frequency = 440, duration = 0.15, type = 'square', volume = 1 }) {
        this.withContext(() => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = type;
            osc.frequency.value = frequency;
            gain.gain.value = 0;

            const now = this.context.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.25 * volume, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + duration + 0.05);
        });
    }

    playNoise({ duration = 0.4, volume = 1 }) {
        this.withContext(() => {
            const bufferSize = this.context.sampleRate * duration;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const noise = this.context.createBufferSource();
            noise.buffer = buffer;
            const gain = this.context.createGain();
            gain.gain.value = 0;
            const now = this.context.currentTime;
            gain.gain.linearRampToValueAtTime(0.4 * volume, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            noise.connect(gain);
            gain.connect(this.masterGain);
            noise.start(now);
            noise.stop(now + duration + 0.05);
        });
    }

    playShoot() {
        this.playTone({ frequency: 1100, duration: 0.1, type: 'square', volume: 0.8 });
    }

    playExplosion() {
        this.playNoise({ duration: 0.4, volume: 1 });
    }

    playPickup() {
        this.playTone({ frequency: 720, duration: 0.18, type: 'triangle', volume: 0.7 });
    }

    playDamage() {
        this.playTone({ frequency: 220, duration: 0.2, type: 'sawtooth', volume: 0.6 });
    }

    playWarning() {
        this.playTone({ frequency: 480, duration: 0.4, type: 'square', volume: 0.9 });
    }

    // Play the appropriate player laser sound for a given weapon level.
    // If `level` is omitted, use the default single-shot effect.
    playPlayerLaser(level) {
        // Choose explicit file if available (prefer specific basic/upgraded files)
        let chosen = null;
        try {
            const lvl = typeof level === 'number' ? level : (typeof level === 'string' ? parseInt(level, 10) || 1 : null);
            if (lvl && lvl >= 3) {
                chosen = this.playerLaserUpgradedSound;
            } else {
                chosen = this.playerLaserBasicSound || this.playerLaserSound;
            }
        } catch (e) {
            chosen = this.playerLaserSound;
        }

        // Try to play the chosen file; if it fails, fall back to generic playerLaserSound or synthesized tone
        if (chosen) {
            try {
                this.playSoundEffect(chosen, this.sfxVolume * 0.75);
                return;
            } catch (e) {
                console.warn('playPlayerLaser failed to play chosen file, falling back', e);
            }
        }

        // Fallback: try default file
        if (this.playerLaserSound) {
            this.playSoundEffect(this.playerLaserSound, this.sfxVolume * 0.7);
            return;
        }

        // Last resort: synth tone (keeps feedback if no files are provided)
        this.playTone({ frequency: 1100, duration: 0.08, type: 'square', volume: 0.6 });
    }

    playEnemyLaser() {
        this.playSoundEffect(this.enemyLaserSound, this.sfxVolume * 0.6);
    }

    playSoundEffect(soundFile, volume = 0.5) {
        if (this.isMuted) return;

        // Helper that attempts to construct/play an Audio and returns a Promise
        const tryPlay = (file) => {
            try {
                const audio = new Audio(file);
                audio.volume = Math.max(0, Math.min(1, volume));
                // Return a promise that rejects on play failure so we can chain fallbacks
                return audio.play().catch(err => Promise.reject(err));
            } catch (err) {
                return Promise.reject(err);
            }
        };

        const swapExt = (file) => {
            if (file.endsWith('.ogg')) return file.slice(0, -4) + '.wav';
            if (file.endsWith('.wav')) return file.slice(0, -4) + '.ogg';
            return file;
        };

        // Try the requested file first; if it fails, try the alternate extension.
        tryPlay(soundFile).catch(firstErr => {
            const alt = swapExt(soundFile);
            if (alt !== soundFile) {
                tryPlay(alt).catch(secondErr => {
                    console.warn('Could not play sound effect (original and alternative):', firstErr, secondErr);
                });
            } else {
                console.warn('Could not play sound effect:', firstErr);
            }
        });
    }

    playRandomMusic() {
        const randomTrack = this.tracks[Math.floor(Math.random() * this.tracks.length)];
        this.playMusic(randomTrack.file);
    }

    playMusic(trackFile) {
        // Stop current music
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }

        // Create and play audio element
        this.audioElement = new Audio(trackFile);
        this.audioElement.loop = true;
        this.audioElement.volume = this.musicVolume;
        this.audioElement.play().catch(err => {
            console.warn('Could not play music:', err);
        });
    }

    stopMusic() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.audioElement) {
            this.audioElement.volume = this.musicVolume;
        }
    }

    getMusicTracks() {
        return this.tracks;
    }

    playMenuMusic() {
        this.playMusic(this.menuTrack.file);
    }

    getMenuTrack() {
        return this.menuTrack;
    }
}
