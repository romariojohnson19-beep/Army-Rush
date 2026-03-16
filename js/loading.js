class LoadingScreen {
    constructor() {
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.loadingComplete = false;
        this.canSkip = false;
        
        // Loading messages
        this.loadingMessages = [
            "Initializing Combat Systems...",
            "Loading Pilot Database...",
            "Calibrating Weapon Systems...",
            "Establishing Communications...",
            "Preparing Ship Registry...",
            "Loading Enemy Profiles...",
            "Synchronizing Save Data...",
            "Finalizing Launch Sequence...",
            "Ready for Combat!"
        ];
        
        this.currentMessageIndex = 0;
        
        // DOM elements
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingText = document.getElementById('loadingText');
        this.loadingPercentage = document.getElementById('loadingPercentage');
        this.skipButton = document.getElementById('skipButton');
        this.starsContainer = document.getElementById('starsContainer');
        
        this.init();
    }
    
    init() {
        this.createStars();
        this.startLoading();
        this.setupEventListeners();
    }
    
    createStars() {
        const starCount = 100;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random star size
            const size = Math.random();
            if (size < 0.6) {
                star.classList.add('small');
            } else if (size < 0.9) {
                star.classList.add('medium');
            } else {
                star.classList.add('large');
            }
            
            // Random position
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            star.style.animationDelay = Math.random() * 3 + 's';
            
            this.starsContainer.appendChild(star);
        }
    }
    
    startLoading() {
        // Simulate loading progress
        const loadingSteps = [
            { progress: 15, delay: 500 },
            { progress: 25, delay: 300 },
            { progress: 40, delay: 600 },
            { progress: 55, delay: 400 },
            { progress: 70, delay: 500 },
            { progress: 85, delay: 300 },
            { progress: 95, delay: 400 },
            { progress: 100, delay: 200 }
        ];
        
        let stepIndex = 0;
        
        const processStep = () => {
            if (stepIndex < loadingSteps.length) {
                const step = loadingSteps[stepIndex];
                
                setTimeout(() => {
                    this.setProgress(step.progress);
                    this.updateLoadingMessage();
                    stepIndex++;
                    processStep();
                }, step.delay);
            } else {
                // Loading complete
                setTimeout(() => {
                    this.completeLoading();
                }, 500);
            }
        };
        
        processStep();
    }
    
    setProgress(progress) {
        this.targetProgress = progress;
        this.animateProgress();
    }
    
    animateProgress() {
        const animate = () => {
            if (this.currentProgress < this.targetProgress) {
                this.currentProgress += 2;
                if (this.currentProgress > this.targetProgress) {
                    this.currentProgress = this.targetProgress;
                }
                
                this.updateProgressDisplay();
                
                if (this.currentProgress < this.targetProgress) {
                    requestAnimationFrame(animate);
                }
            }
        };
        
        animate();
    }
    
    updateProgressDisplay() {
        this.loadingBar.style.width = this.currentProgress + '%';
        this.loadingPercentage.textContent = Math.floor(this.currentProgress) + '%';
    }
    
    updateLoadingMessage() {
        if (this.currentMessageIndex < this.loadingMessages.length - 1) {
            this.currentMessageIndex++;
            this.loadingText.textContent = this.loadingMessages[this.currentMessageIndex];
        }
    }
    
    completeLoading() {
        this.loadingComplete = true;
        this.canSkip = true;
        
        // Show final message
        this.loadingText.textContent = this.loadingMessages[this.loadingMessages.length - 1];
        this.loadingText.style.color = '#00ff41';
        
        // Show skip button after a short delay
        setTimeout(() => {
            this.skipButton.classList.remove('hidden');
            this.skipButton.style.animation = 'fadeIn 0.5s ease-out';
        }, 1000);
        
        // Auto-proceed after 5 seconds if user doesn't interact
        setTimeout(() => {
            if (this.canSkip) {
                this.proceedToMenu();
            }
        }, 5000);
    }
    
    setupEventListeners() {
        // Skip button click
        this.skipButton.addEventListener('click', () => {
            if (this.canSkip) {
                this.proceedToMenu();
            }
        });
        
        // Any key press to continue
        document.addEventListener('keydown', (e) => {
            if (this.canSkip) {
                e.preventDefault();
                this.proceedToMenu();
            }
        });
        
        // Click anywhere to continue (after loading complete)
        document.addEventListener('click', (e) => {
            if (this.canSkip && e.target !== this.skipButton) {
                this.proceedToMenu();
            }
        });
    }
    
    proceedToMenu() {
        if (!this.canSkip) return;
        
        this.canSkip = false;
        
        // Add transition effect
        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '0';
        
        // Navigate to menu after fade
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 500);
    }
}

// Initialize loading screen when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LoadingScreen();
});