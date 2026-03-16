class BackgroundSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.distanceKm = 0;
        this.stars = [];
        this.currentHue = 0; // 0-360 for HSL
        this.targetHue = 0;
        this.currentPhase = 0; // Which 18km phase we're in
        this.lastPhase = -1;
        
        // Generate initial starfield
        this.generateStarfield();
    }

    generateStarfield() {
        this.stars = [];
        const starCount = Math.floor(this.width * this.height / 4000); // Roughly 1 star per 4000px
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    update(distanceKm) {
        this.distanceKm = distanceKm;
        this.currentPhase = Math.floor(distanceKm / 18);
        
        // Determine hue based on distance phase
        // 0-18km: Blue (210°)
        // 18-36km: Purple (270°)
        // 36-54km: Red/Orange (0°-30°)
        // 54-72km: Green (120°)
        // 72km+: Cyan (180°)
        
        const phaseInCycle = this.currentPhase % 5; // Cycle through 5 phases
        const hueTargets = [210, 270, 15, 120, 180]; // Blue, Purple, Red-Orange, Green, Cyan
        this.targetHue = hueTargets[phaseInCycle];
        
        // Smoothly transition hue
        let hueDiff = this.targetHue - this.currentHue;
        if (hueDiff > 180) hueDiff -= 360;
        if (hueDiff < -180) hueDiff += 360;
        
        this.currentHue += hueDiff * 0.02; // Smooth transition
        if (this.currentHue < 0) this.currentHue += 360;
        if (this.currentHue >= 360) this.currentHue -= 360;
        
        // Update stars twinkling
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            star.brightness = 0.3 + 0.5 * (Math.sin(star.twinklePhase) + 1) / 2;
        });
    }

    draw(ctx) {
        // Draw background gradient with current hue
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        
        // Create gradient with current hue
        const topColor = `hsl(${this.currentHue}, 80%, 5%)`;
        const midColor = `hsl(${(this.currentHue + 20) % 360}, 60%, 15%)`;
        const bottomColor = `hsl(${(this.currentHue + 10) % 360}, 70%, 10%)`;
        
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(0.5, midColor);
        gradient.addColorStop(1, bottomColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.fillRect(star.x - star.size / 2, star.y - star.size / 2, star.size, star.size);
            
            // Add glow to brighter stars
            if (star.brightness > 0.7) {
                ctx.shadowColor = `rgba(255, 255, 255, ${star.brightness * 0.5})`;
                ctx.shadowBlur = 4;
                ctx.fillRect(star.x - star.size / 2, star.y - star.size / 2, star.size, star.size);
                ctx.shadowBlur = 0;
            }
        });
        
        // Add distance-based visual markers (faint)
        const phaseProgress = (this.distanceKm % 18) / 18; // 0 to 1 within current phase
        const scanlineAlpha = Math.sin(phaseProgress * Math.PI) * 0.1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${scanlineAlpha})`;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.generateStarfield();
    }
}
