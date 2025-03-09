/*
 * NEON RIDER - A retro synth wave 3D tunnel racing game
 * Part of the RetroWave Portfolio Games Section
 * FIXED VERSION - No external model dependencies
 */

class NeonRider {
    constructor(canvasId) {
        // Game canvas
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Game canvas not found: ' + canvasId);
            return;
        }
        
        // Flag to use fallback models instead of trying to load GLB files
        this.useFallbackModels = true;
        
        // Game state
        this.isPlaying = false;
        this.isPaused = false;
        this.gameSpeed = 0.2;
        this.baseSpeed = 0.2;
        this.speedIncrement = 0.00005;
        this.boosting = false;
        this.boostMultiplier = 2;
        this.boostDuration = 1000;
        this.boostCooldown = 3000;
        this.canBoost = true;
        this.boostTimer = null;
        this.boostCooldownTimer = null;
        
        // Player stats
        this.score = 0;
        this.health = 100;
        this.healthDecrement = 25; // How much health is lost per collision
        
        // DOM elements
        this.scoreDisplay = document.getElementById('game-score');
        this.healthFill = document.getElementById('health-fill');
        this.startScreen = document.getElementById('game-start');
        this.pauseScreen = document.getElementById('game-paused');
        this.gameOverScreen = document.getElementById('game-over');
        
        // Check if elements exist
        if (!this.scoreDisplay) console.warn('Score display element not found');
        if (!this.healthFill) console.warn('Health fill element not found');
        if (!this.startScreen) console.warn('Start screen element not found');
        if (!this.pauseScreen) console.warn('Pause screen element not found');
        if (!this.gameOverScreen) console.warn('Game over screen element not found');
        
        // Key states for smooth controls
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            KeyA: false,
            KeyD: false,
            KeyW: false,
            KeyS: false,
            Space: false
        };
        
        // Game objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.tunnel = null;
        this.obstacles = [];
        this.collectibles = [];
        this.powerups = [];
        this.particles = [];
        
        // Obstacle parameters
        this.obstacleSpawnRate = 0.02; // Probability per frame
        this.obstacleTypes = ['cube', 'sphere', 'barrier'];
        this.obstacleColors = [0xFF41B4, 0x00F0FF, 0xA359FF, 0xFFDE59];
        
        // Collectible parameters
        this.collectibleSpawnRate = 0.01; // Probability per frame
        this.collectibleValue = 10;
        
        // Animation frame ID for stopping the game loop
        this.animationFrameId = null;
        
        // Bind methods to preserve context
        this.init = this.init.bind(this);
        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.reset = this.reset.bind(this);
        this.update = this.update.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Initialize game
        this.init();
    }
    
    init() {
        // Check if THREE is available
        if (typeof THREE === 'undefined') {
            console.error('THREE.js is not loaded. Please include the THREE.js library.');
            return;
        }
        
        try {
            // Initialize Three.js scene
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, this.canvas.offsetWidth / this.canvas.offsetHeight, 0.1, 1000);
            
            // Position camera
            this.camera.position.z = 5;
            this.camera.position.y = 0.8; // Slightly above the player
            
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setClearColor(0x000000, 1);
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.camera && this.renderer) {
                    this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
                }
            });
            
            // Add fog for depth effect
            this.scene.fog = new THREE.FogExp2(0x000000, 0.05);
            
            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);
            
            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(0, 10, 10);
            this.scene.add(directionalLight);
            
            // Create the player (ship)
            this.createPlayer();
            
            // Create the tunnel
            this.createTunnel();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Render the first frame
            this.renderer.render(this.scene, this.camera);
            
            // Set up theme detection and theme change handling
            this.setupThemeHandling();
            
            console.log('Game initialized successfully');
            
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }
    
    setupThemeHandling() {
        // Get current theme colors
        this.updateColorsFromTheme();
        
        // Listen for theme changes
        document.addEventListener('themechange', () => {
            this.updateColorsFromTheme();
        });
    }
    
    updateColorsFromTheme() {
        // Get theme colors if available
        if (window.getThemeColors) {
            try {
                const colors = window.getThemeColors();
                
                // Update obstacle colors
                this.obstacleColors = [
                    parseInt(colors.accent.replace('#', '0x')) || 0xFF41B4,
                    parseInt(colors.highlight.replace('#', '0x')) || 0x00F0FF,
                    parseInt(colors.secondary1.replace('#', '0x')) || 0xA359FF,
                    parseInt(colors.secondary2.replace('#', '0x')) || 0xFFDE59
                ];
                
                // Update tunnel colors if it exists
                if (this.tunnel && this.tunnel.material) {
                    // Update tunnel material
                    const tunnelMaterial = this.tunnel.material;
                    tunnelMaterial.color.set(parseInt(colors.primaryDark.replace('#', '0x')) || 0x010914);
                    tunnelMaterial.emissive.set(parseInt(colors.primaryMedium.replace('#', '0x')) || 0x1A0B35);
                    
                    // Update tunnel grid lines
                    if (this.tunnelGrid && this.tunnelGrid.material) {
                        this.tunnelGrid.material.color.set(parseInt(colors.highlight.replace('#', '0x')) || 0x00F0FF);
                    }
                }
                
                // Update player colors if it exists
                if (this.player && this.player.material && this.player.material.emissive) {
                    this.player.material.emissive.set(parseInt(colors.accent.replace('#', '0x')) || 0xFF41B4);
                }
            } catch (error) {
                console.warn('Error updating colors from theme:', error);
            }
        }
    }
    
    createPlayer() {
        try {
            // Create a player ship with a glowing material
            const geometry = new THREE.ConeGeometry(0.2, 0.5, 8);
            const material = new THREE.MeshStandardMaterial({
                color: 0x333333,
                emissive: 0xFF41B4,
                emissiveIntensity: 1,
                metalness: 0.8,
                roughness: 0.2
            });
            
            this.player = new THREE.Mesh(geometry, material);
            this.player.rotation.x = Math.PI / 2; // Rotate to point forward
            this.player.position.z = 4; // Position in front of the camera
            
            // Add player to scene
            this.scene.add(this.player);
            
            // Add engine glow effect
            this.createEngineGlow();
        } catch (error) {
            console.error('Error creating player:', error);
        }
    }
    
    createEngineGlow() {
        try {
            const glowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xFF41B4,
                transparent: true,
                opacity: 0.7
            });
            
            this.engineGlow = new THREE.Mesh(glowGeometry, glowMaterial);
            this.engineGlow.position.y = -0.3; // Position at the back of the ship
            this.player.add(this.engineGlow);
            
            // Animate the glow with pulsating effect
            this.engineGlowPulse();
        } catch (error) {
            console.error('Error creating engine glow:', error);
        }
    }
    
    engineGlowPulse() {
        if (typeof gsap !== 'undefined' && this.engineGlow) {
            gsap.to(this.engineGlow.scale, {
                x: 1.5,
                y: 1.5,
                z: 1.5,
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        } else {
            // Fallback animation if GSAP is not available
            let scale = 1;
            let increasing = true;
            
            const pulseInterval = setInterval(() => {
                if (!this.engineGlow) {
                    clearInterval(pulseInterval);
                    return;
                }
                
                if (increasing) {
                    scale += 0.05;
                    if (scale >= 1.5) increasing = false;
                } else {
                    scale -= 0.05;
                    if (scale <= 1) increasing = true;
                }
                
                this.engineGlow.scale.set(scale, scale, scale);
            }, 50);
        }
    }
    
    createTunnel() {
        try {
            // Create a tunnel using a cylinder geometry
            const tunnelGeometry = new THREE.CylinderGeometry(3, 3, 100, 16, 50, true);
            // Invert the geometry faces
            tunnelGeometry.scale(1, 1, -1);
            
            // Get current theme colors
            let primaryDark = 0x010914;
            let primaryMedium = 0x1A0B35;
            let highlightColor = 0x00F0FF;
            
            if (window.getThemeColors) {
                try {
                    const colors = window.getThemeColors();
                    primaryDark = parseInt(colors.primaryDark.replace('#', '0x')) || primaryDark;
                    primaryMedium = parseInt(colors.primaryMedium.replace('#', '0x')) || primaryMedium;
                    highlightColor = parseInt(colors.highlight.replace('#', '0x')) || highlightColor;
                } catch (e) {
                    console.warn('Error parsing theme colors, using defaults');
                }
            }
            
            // Create tunnel material with emissive properties
            const tunnelMaterial = new THREE.MeshStandardMaterial({
                color: primaryDark,
                emissive: primaryMedium,
                emissiveIntensity: 0.5,
                side: THREE.BackSide,
                metalness: 0.2,
                roughness: 0.8
            });
            
            this.tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
            this.tunnel.rotation.x = Math.PI / 2; // Orient horizontally
            this.scene.add(this.tunnel);
            
            // Add grid lines to the tunnel
            this.createTunnelGrid(highlightColor);
        } catch (error) {
            console.error('Error creating tunnel:', error);
        }
    }
    
    createTunnelGrid(color) {
        try {
            // Create grid overlay for the tunnel using a wireframe
            const gridGeometry = new THREE.CylinderGeometry(3.01, 3.01, 100, 24, 30, true);
            gridGeometry.scale(1, 1, -1); // Flip inside-out
            
            const gridMaterial = new THREE.MeshBasicMaterial({
                color: color,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            
            this.tunnelGrid = new THREE.Mesh(gridGeometry, gridMaterial);
            this.tunnelGrid.rotation.x = Math.PI / 2; // Orient horizontally
            this.scene.add(this.tunnelGrid);
        } catch (error) {
            console.error('Error creating tunnel grid:', error);
        }
    }
    
    createObstacle() {
        try {
            // Randomly select an obstacle type
            const obstacleType = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
            const color = this.obstacleColors[Math.floor(Math.random() * this.obstacleColors.length)];
            
            let geometry;
            let scale = 1;
            
            // Create geometry based on type
            switch(obstacleType) {
                case 'cube':
                    geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
                    break;
                case 'sphere':
                    geometry = new THREE.SphereGeometry(0.4, 8, 8);
                    break;
                case 'barrier':
                    geometry = new THREE.TorusGeometry(1.5, 0.2, 8, 24);
                    scale = 1.5;
                    break;
                default:
                    geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            }
            
            // Create material with glow effect
            const material = new THREE.MeshStandardMaterial({
                color: 0x333333,
                emissive: color,
                emissiveIntensity: 1,
                metalness: 0.8,
                roughness: 0.2
            });
            
            const obstacle = new THREE.Mesh(geometry, material);
            
            // Position the obstacle at a random position inside the tunnel
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2.5;
            
            obstacle.position.x = Math.cos(angle) * radius;
            obstacle.position.y = Math.sin(angle) * radius;
            obstacle.position.z = -50; // Far away from the player
            
            // Add rotation for visual effect
            obstacle.rotation.x = Math.random() * Math.PI;
            obstacle.rotation.y = Math.random() * Math.PI;
            
            // Scale for barriers
            obstacle.scale.set(scale, scale, scale);
            
            // Add to scene and obstacles array
            this.scene.add(obstacle);
            this.obstacles.push({
                mesh: obstacle,
                type: obstacleType,
                rotationSpeed: {
                    x: Math.random() * 0.02,
                    y: Math.random() * 0.02,
                    z: Math.random() * 0.02
                }
            });
        } catch (error) {
            console.error('Error creating obstacle:', error);
        }
    }
    
    createCollectible() {
        try {
            // Create a collectible (data fragment)
            const geometry = new THREE.OctahedronGeometry(0.3, 0);
            const material = new THREE.MeshStandardMaterial({
                color: 0x333333,
                emissive: 0xFFDE59, // Gold color
                emissiveIntensity: 1,
                metalness: 1,
                roughness: 0.2
            });
            
            const collectible = new THREE.Mesh(geometry, material);
            
            // Position the collectible at a random position inside the tunnel
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2.5;
            
            collectible.position.x = Math.cos(angle) * radius;
            collectible.position.y = Math.sin(angle) * radius;
            collectible.position.z = -50; // Far away from the player
            
            // Add to scene and collectibles array
            this.scene.add(collectible);
            this.collectibles.push({
                mesh: collectible,
                rotationSpeed: {
                    x: 0.02,
                    y: 0.03,
                    z: 0.01
                },
                value: this.collectibleValue
            });
        } catch (error) {
            console.error('Error creating collectible:', error);
        }
    }
    
    createParticle(position, color) {
        try {
            // Create a particle for effects (explosions, collectibles)
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            // Add velocity for movement
            const velocity = {
                x: (Math.random() - 0.5) * 0.2,
                y: (Math.random() - 0.5) * 0.2,
                z: (Math.random() - 0.5) * 0.2
            };
            
            // Add to scene and particles array
            this.scene.add(particle);
            this.particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0 // Life decreases over time
            });
        } catch (error) {
            console.error('Error creating particle:', error);
        }
    }
    
    createExplosion(position, color, count = 15) {
        try {
            // Create multiple particles for an explosion effect
            for (let i = 0; i < count; i++) {
                this.createParticle(position, color);
            }
            
            // Add screen shake effect
            this.screenShake();
        } catch (error) {
            console.error('Error creating explosion:', error);
        }
    }
    
    screenShake() {
        try {
            if (typeof gsap !== 'undefined') {
                // Simple screen shake effect
                const intensity = 0.1;
                const duration = 0.3;
                
                gsap.to(this.camera.position, {
                    x: (Math.random() - 0.5) * intensity,
                    y: (Math.random() - 0.5) * intensity + 0.8, // Keep centered around 0.8
                    duration: duration / 2,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Reset camera position
                        gsap.to(this.camera.position, {
                            x: 0,
                            y: 0.8,
                            duration: duration / 2
                        });
                    }
                });
            } else {
                // Fallback if GSAP is not available
                const intensity = 0.1;
                const originalY = 0.8;
                
                // Simple shake
                this.camera.position.x = (Math.random() - 0.5) * intensity;
                this.camera.position.y = originalY + (Math.random() - 0.5) * intensity;
                
                // Reset after a delay
                setTimeout(() => {
                    this.camera.position.x = 0;
                    this.camera.position.y = originalY;
                }, 300);
            }
        } catch (error) {
            console.error('Error creating screen shake:', error);
        }
    }
    
    setupEventListeners() {
        try {
            // Add event listeners for controls
            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
            
            // Add event listeners for game buttons with proper binding
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.start());
            }
            
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.reset());
            }
            
            const resumeBtn = document.getElementById('resume-btn');
            if (resumeBtn) {
                resumeBtn.addEventListener('click', () => this.resume());
            }
            
            const startGameBtn = document.getElementById('start-game');
            if (startGameBtn) {
                startGameBtn.addEventListener('click', () => this.start());
            }
            
            const pauseGameBtn = document.getElementById('pause-game');
            if (pauseGameBtn) {
                pauseGameBtn.addEventListener('click', () => this.pause());
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }
    
    handleKeyDown(e) {
        try {
            // Update key states for smooth movement
            if (e.code in this.keys) {
                this.keys[e.code] = true;
                
                // Prevent default action for game controls
                e.preventDefault();
            }
            
            // Handle space bar for boost
            if (e.code === 'Space' && this.canBoost && this.isPlaying && !this.isPaused) {
                this.activateBoost();
                e.preventDefault();
            }
            
            // Handle pause with Escape key
            if (e.code === 'Escape' && this.isPlaying) {
                if (this.isPaused) {
                    this.resume();
                } else {
                    this.pause();
                }
                e.preventDefault();
            }
        } catch (error) {
            console.error('Error handling key down:', error);
        }
    }
    
    handleKeyUp(e) {
        try {
            // Update key states for smooth movement
            if (e.code in this.keys) {
                this.keys[e.code] = false;
                
                // Prevent default action for game controls
                e.preventDefault();
            }
        } catch (error) {
            console.error('Error handling key up:', error);
        }
    }
    
    activateBoost() {
        try {
            if (!this.canBoost) return;
            
            // Apply boost effect
            this.boosting = true;
            this.canBoost = false;
            
            // Visual effects for boost
            if (this.engineGlow && typeof gsap !== 'undefined') {
                gsap.to(this.engineGlow.material, {
                    opacity: 1,
                    duration: 0.2
                });
                
                gsap.to(this.engineGlow.scale, {
                    x: 3,
                    y: 3,
                    z: 3,
                    duration: 0.2
                });
            } else if (this.engineGlow) {
                // Manual fallback
                this.engineGlow.material.opacity = 1;
                this.engineGlow.scale.set(3, 3, 3);
            }
            
            // Create boost trail particles
            this.createBoostTrail();
            
            // End boost after duration
            this.boostTimer = setTimeout(() => {
                this.boosting = false;
                
                // Reset visual effects
                if (this.engineGlow && typeof gsap !== 'undefined') {
                    gsap.to(this.engineGlow.material, {
                        opacity: 0.7,
                        duration: 0.5
                    });
                    
                    gsap.to(this.engineGlow.scale, {
                        x: 1,
                        y: 1,
                        z: 1,
                        duration: 0.5
                    });
                } else if (this.engineGlow) {
                    // Manual fallback
                    this.engineGlow.material.opacity = 0.7;
                    this.engineGlow.scale.set(1, 1, 1);
                }
                
                // Start cooldown
                this.boostCooldownTimer = setTimeout(() => {
                    this.canBoost = true;
                }, this.boostCooldown);
                
            }, this.boostDuration);
        } catch (error) {
            console.error('Error activating boost:', error);
            this.boosting = false;
            this.canBoost = true;
        }
    }
    
    createBoostTrail() {
        try {
            // Create boost trail effect
            const trailInterval = setInterval(() => {
                if (!this.boosting || !this.player) {
                    clearInterval(trailInterval);
                    return;
                }
                
                // Create trail particle at player position
                const trailParticle = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 8, 8),
                    new THREE.MeshBasicMaterial({
                        color: 0xFF41B4,
                        transparent: true,
                        opacity: 0.7
                    })
                );
                
                // Position slightly behind the player
                trailParticle.position.copy(this.player.position);
                trailParticle.position.z += 0.3;
                
                this.scene.add(trailParticle);
                
                // Fade out and remove
                if (typeof gsap !== 'undefined') {
                    gsap.to(trailParticle.material, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            this.scene.remove(trailParticle);
                            trailParticle.geometry.dispose();
                            trailParticle.material.dispose();
                        }
                    });
                } else {
                    // Manual fallback
                    setTimeout(() => {
                        this.scene.remove(trailParticle);
                        trailParticle.geometry.dispose();
                        trailParticle.material.dispose();
                    }, 500);
                }
                
            }, 50); // Create trail particles every 50ms
        } catch (error) {
            console.error('Error creating boost trail:', error);
        }
    }
    
    start() {
        try {
            if (this.isPlaying) return;
            
            console.log('Starting game');
            
            // Hide start screen
            if (this.startScreen) this.startScreen.style.display = 'none';
            if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
            
            // Reset game state
            this.reset();
            
            // Start game loop
            this.isPlaying = true;
            this.update();
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }
    
    pause() {
        try {
            if (!this.isPlaying || this.isPaused) return;
            
            // Pause game
            this.isPaused = true;
            
            // Cancel animation frame
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            // Show pause screen
            if (this.pauseScreen) this.pauseScreen.style.display = 'flex';
        } catch (error) {
            console.error('Error pausing game:', error);
        }
    }
    
    resume() {
        try {
            if (!this.isPlaying || !this.isPaused) return;
            
            // Resume game
            this.isPaused = false;
            
            // Hide pause screen
            if (this.pauseScreen) this.pauseScreen.style.display = 'none';
            
            // Resume game loop
            this.update();
        } catch (error) {
            console.error('Error resuming game:', error);
        }
    }
    
    gameOver() {
        try {
            // Stop game loop
            this.isPlaying = false;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            // Clear timers
            if (this.boostTimer) clearTimeout(this.boostTimer);
            if (this.boostCooldownTimer) clearTimeout(this.boostCooldownTimer);
            
            // Update high score
            this.updateHighScore();
            
            // Show game over screen
            if (this.gameOverScreen) {
                this.gameOverScreen.style.display = 'flex';
                
                // Update final score display
                const finalScoreEl = document.querySelector('.final-score');
                if (finalScoreEl) finalScoreEl.textContent = this.score;
                
                const highscoreEl = document.querySelector('.highscore');
                if (highscoreEl) highscoreEl.textContent = this.getHighScore();
            }
        } catch (error) {
            console.error('Error handling game over:', error);
        }
    }
    
    reset() {
        try {
            // Reset game state
            this.score = 0;
            this.health = 100;
            this.gameSpeed = this.baseSpeed;
            this.boosting = false;
            this.canBoost = true;
            
            // Clear timers
            if (this.boostTimer) clearTimeout(this.boostTimer);
            if (this.boostCooldownTimer) clearTimeout(this.boostCooldownTimer);
            
            // Reset UI
            if (this.scoreDisplay) this.scoreDisplay.textContent = '0';
            if (this.healthFill) this.healthFill.style.width = '100%';
            
            // Reset player position
            if (this.player) {
                this.player.position.x = 0;
                this.player.position.y = 0;
                this.player.rotation.z = 0;
            }
            
            // Clear obstacles, collectibles, and particles
            this.clearGameObjects();
        } catch (error) {
            console.error('Error resetting game:', error);
        }
    }
    
    clearGameObjects() {
        try {
            // Remove all obstacles from scene
            for (const obstacle of this.obstacles) {
                if (obstacle.mesh) {
                    this.scene.remove(obstacle.mesh);
                    if (obstacle.mesh.geometry) obstacle.mesh.geometry.dispose();
                    if (obstacle.mesh.material) obstacle.mesh.material.dispose();
                }
            }
            this.obstacles = [];
            
            // Remove all collectibles from scene
            for (const collectible of this.collectibles) {
                if (collectible.mesh) {
                    this.scene.remove(collectible.mesh);
                    if (collectible.mesh.geometry) collectible.mesh.geometry.dispose();
                    if (collectible.mesh.material) collectible.mesh.material.dispose();
                }
            }
            this.collectibles = [];
            
            // Remove all particles from scene
            for (const particle of this.particles) {
                if (particle.mesh) {
                    this.scene.remove(particle.mesh);
                    if (particle.mesh.geometry) particle.mesh.geometry.dispose();
                    if (particle.mesh.material) particle.mesh.material.dispose();
                }
            }
            this.particles = [];
            
            // Remove all powerups from scene
            for (const powerup of this.powerups) {
                if (powerup.mesh) {
                    this.scene.remove(powerup.mesh);
                    if (powerup.mesh.geometry) powerup.mesh.geometry.dispose();
                    if (powerup.mesh.material) powerup.mesh.material.dispose();
                }
            }
            this.powerups = [];
        } catch (error) {
            console.error('Error clearing game objects:', error);
        }
    }
    
    update() {
        try {
            if (!this.isPlaying || this.isPaused) return;
            
            // Request next animation frame
            this.animationFrameId = requestAnimationFrame(this.update);
            
            // Update game speed (gradually increases)
            this.gameSpeed += this.speedIncrement;
            
            // Apply boost multiplier if boosting
            const currentSpeed = this.boosting ? this.gameSpeed * this.boostMultiplier : this.gameSpeed;
            
            // Handle player movement based on key states
            this.handlePlayerMovement();
            
            // Update tunnel rotation for movement effect
            if (this.tunnel) {
                this.tunnel.rotation.y += currentSpeed * 0.1; // Reduced from 0.5 to 0.1
            }
            if (this.tunnelGrid) {
                this.tunnelGrid.rotation.y += currentSpeed * 0.1; // Reduced from 0.5 to 0.1
            }
            
            
            // Spawn obstacles and collectibles based on probability
            if (Math.random() < this.obstacleSpawnRate) {
                this.createObstacle();
            }
            
            if (Math.random() < this.collectibleSpawnRate) {
                this.createCollectible();
            }
            
            // Update obstacles
            this.updateObstacles(currentSpeed);
            
            // Update collectibles
            this.updateCollectibles(currentSpeed);
            
            // Update particles
            this.updateParticles();
            
            // Update score (based on distance traveled)
            this.score += Math.floor(currentSpeed * 10);
            if (this.scoreDisplay) {
                this.scoreDisplay.textContent = this.score;
            }
            
            // Render scene
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            console.error('Error in game update loop:', error);
            // Stop the game loop on error to prevent console spam
            this.gameOver();
        }
    }
    
    handlePlayerMovement() {
        try {
            if (!this.player) return;
            
            // Calculate player movement based on key states
            let moveX = 0;
            let moveY = 0;
            
            // Horizontal movement (left/right)
            if (this.keys.ArrowLeft || this.keys.KeyA) moveX -= 0.1;
            if (this.keys.ArrowRight || this.keys.KeyD) moveX += 0.1;
            
            // Vertical movement (up/down)
            if (this.keys.ArrowUp || this.keys.KeyW) moveY += 0.1;
            if (this.keys.ArrowDown || this.keys.KeyS) moveY -= 0.1;
            
            // Apply movement with boundary constraints
            this.player.position.x = Math.max(-2.5, Math.min(2.5, this.player.position.x + moveX));
            this.player.position.y = Math.max(-2.5, Math.min(2.5, this.player.position.y + moveY));
            
            // Apply banking effect (tilt) when turning
            const targetRotationZ = -moveX * 0.5;
            this.player.rotation.z += (targetRotationZ - this.player.rotation.z) * 0.1;
        } catch (error) {
            console.error('Error handling player movement:', error);
        }
    }
    
    updateObstacles(speed) {
        try {
            // Update each obstacle
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                const obstacle = this.obstacles[i];
                if (!obstacle || !obstacle.mesh) {
                    this.obstacles.splice(i, 1);
                    continue;
                }
                
                const mesh = obstacle.mesh;
                
                // Move obstacle towards player
                mesh.position.z += speed;
                
                // Rotate obstacle for visual effect
                mesh.rotation.x += obstacle.rotationSpeed.x;
                mesh.rotation.y += obstacle.rotationSpeed.y;
                mesh.rotation.z += obstacle.rotationSpeed.z;
                
                // Check if obstacle passed the player
                if (mesh.position.z > 5) {
                    // Remove from scene and array
                    this.scene.remove(mesh);
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) mesh.material.dispose();
                    this.obstacles.splice(i, 1);
                    continue;
                }
                
                // Check for collision with player
                if (this.player && this.checkCollision(this.player, mesh, obstacle.type === 'barrier' ? 1.5 : 0.6)) {
                    // Create explosion effect
                    if (mesh.material && mesh.material.emissive) {
                        this.createExplosion(mesh.position, mesh.material.emissive.getHex());
                    } else {
                        this.createExplosion(mesh.position, 0xFF41B4);
                    }
                    
                    // Reduce player health
                    this.health = Math.max(0, this.health - this.healthDecrement);
                    if (this.healthFill) {
                        this.healthFill.style.width = `${this.health}%`;
                    }
                    
                    // Game over if health depleted
                    if (this.health <= 0) {
                        this.gameOver();
                        return;
                    }
                    
                    // Remove obstacle after collision
                    this.scene.remove(mesh);
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) mesh.material.dispose();
                    this.obstacles.splice(i, 1);
                }
            }
        } catch (error) {
            console.error('Error updating obstacles:', error);
        }
    }
    
    updateCollectibles(speed) {
        try {
            // Update each collectible
            for (let i = this.collectibles.length - 1; i >= 0; i--) {
                const collectible = this.collectibles[i];
                if (!collectible || !collectible.mesh) {
                    this.collectibles.splice(i, 1);
                    continue;
                }
                
                const mesh = collectible.mesh;
                
                // Move collectible towards player
                mesh.position.z += speed;
                
                // Rotate collectible for visual effect
                mesh.rotation.x += collectible.rotationSpeed.x;
                mesh.rotation.y += collectible.rotationSpeed.y;
                mesh.rotation.z += collectible.rotationSpeed.z;
                
                // Check if collectible passed the player
                if (mesh.position.z > 5) {
                    // Remove from scene and array
                    this.scene.remove(mesh);
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) mesh.material.dispose();
                    this.collectibles.splice(i, 1);
                    continue;
                }
                
                // Check for collision with player
                if (this.player && this.checkCollision(this.player, mesh, 0.5)) {
                    // Create collection effect
                    this.createCollectionEffect(mesh.position);
                    
                    // Add to score
                    this.score += collectible.value;
                    if (this.scoreDisplay) {
                        this.scoreDisplay.textContent = this.score;
                    }
                    
                    // Remove collectible after collection
                    this.scene.remove(mesh);
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) mesh.material.dispose();
                    this.collectibles.splice(i, 1);
                }
            }
        } catch (error) {
            console.error('Error updating collectibles:', error);
        }
    }
    
    updateParticles() {
        try {
            // Update each particle
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle = this.particles[i];
                if (!particle || !particle.mesh) {
                    this.particles.splice(i, 1);
                    continue;
                }
                
                const mesh = particle.mesh;
                
                // Move particle based on velocity
                mesh.position.x += particle.velocity.x;
                mesh.position.y += particle.velocity.y;
                mesh.position.z += particle.velocity.z;
                
                // Reduce life
                particle.life -= 0.02;
                
                // Update opacity based on life
                if (mesh.material) {
                    mesh.material.opacity = particle.life;
                }
                
                // Remove particle if life depleted
                if (particle.life <= 0) {
                    this.scene.remove(mesh);
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) mesh.material.dispose();
                    this.particles.splice(i, 1);
                }
            }
        } catch (error) {
            console.error('Error updating particles:', error);
        }
    }
    
    createCollectionEffect(position) {
        try {
            // Create a collection effect (particles + glow)
            this.createExplosion(position, 0xFFDE59, 8);
            
            // Add score popup
            this.createScorePopup(position);
        } catch (error) {
            console.error('Error creating collection effect:', error);
        }
    }
    
    createScorePopup(position) {
        try {
            if (typeof THREE === 'undefined') return;
            
            // Create a score popup in 3D space
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 64;
            
            // Draw text on canvas
            context.fillStyle = '#FFDE59';
            context.font = 'bold 32px Arial, sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(`+${this.collectibleValue}`, canvas.width/2, canvas.height/2);
            
            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            
            // Create sprite material
            const material = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true
            });
            
            // Create sprite
            const sprite = new THREE.Sprite(material);
            sprite.position.copy(position);
            sprite.position.z -= 0.5; // Move slightly forward
            sprite.scale.set(1, 0.5, 1);
            
            this.scene.add(sprite);
            
            // Animate and remove
            if (typeof gsap !== 'undefined') {
                gsap.to(sprite.position, {
                    y: sprite.position.y + 1,
                    duration: 1,
                    ease: "power1.out"
                });
                
                gsap.to(sprite.material, {
                    opacity: 0,
                    duration: 1,
                    ease: "power1.out",
                    onComplete: () => {
                        this.scene.remove(sprite);
                        if (sprite.material.map) sprite.material.map.dispose();
                        sprite.material.dispose();
                    }
                });
            } else {
                // Manual animation fallback
                let startTime = Date.now();
                const duration = 1000;
                const startY = sprite.position.y;
                
                const animateSprite = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Update position
                    sprite.position.y = startY + progress;
                    sprite.material.opacity = 1 - progress;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateSprite);
                    } else {
                        this.scene.remove(sprite);
                        if (sprite.material.map) sprite.material.map.dispose();
                        sprite.material.dispose();
                    }
                };
                
                animateSprite();
            }
        } catch (error) {
            console.error('Error creating score popup:', error);
        }
    }
    
    checkCollision(object1, object2, threshold = 0.5) {
        try {
            if (!object1 || !object2) return false;
            
            // Simple distance-based collision detection
            const dx = object1.position.x - object2.position.x;
            const dy = object1.position.y - object2.position.y;
            const dz = object1.position.z - object2.position.z;
            
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            return distance < threshold;
        } catch (error) {
            console.error('Error checking collision:', error);
            return false;
        }
    }
    
    updateHighScore() {
        try {
            // Get current high score
            const highScore = this.getHighScore();
            
            // Update if current score is higher
            if (this.score > highScore) {
                localStorage.setItem('neonrider-highscore', this.score);
                this.updateHighScoreTable();
            }
        } catch (error) {
            console.error('Error updating high score:', error);
        }
    }
    
    getHighScore() {
        try {
            return parseInt(localStorage.getItem('neonrider-highscore') || '0');
        } catch (error) {
            console.error('Error getting high score:', error);
            return 0;
        }
    }
    
    updateHighScoreTable() {
        try {
            // Get existing high scores
            let highScores = [];
            try {
                highScores = JSON.parse(localStorage.getItem('neonrider-scores') || '[]');
            } catch (e) {
                console.warn('Error parsing high scores, resetting');
                highScores = [];
            }
            
            // Add current score
            highScores.push({
                player: 'YOU',
                score: this.score,
                date: new Date().toLocaleDateString()
            });
            
            // Sort by score (descending)
            highScores.sort((a, b) => b.score - a.score);
            
            // Keep only top 5
            highScores = highScores.slice(0, 5);
            
            // Save to localStorage
            localStorage.setItem('neonrider-scores', JSON.stringify(highScores));
            
            // Update high score display
            this.displayHighScores(highScores);
        } catch (error) {
            console.error('Error updating high score table:', error);
        }
    }
    
    displayHighScores(scores) {
        try {
            const highScoreList = document.getElementById('highscore-list');
            if (!highScoreList) return;
            
            // Clear current list
            highScoreList.innerHTML = '';
            
            // Add each score
            scores.forEach((score, index) => {
                const row = document.createElement('div');
                row.className = 'table-row';
                
                row.innerHTML = `
                    <div class="rank">${index + 1}</div>
                    <div class="player">${score.player}</div>
                    <div class="score">${score.score.toLocaleString()}</div>
                    <div class="date">${score.date}</div>
                `;
                
                highScoreList.appendChild(row);
            });
            
            // Fill remaining rows if needed
            while (highScoreList.children.length < 5) {
                const row = document.createElement('div');
                row.className = 'table-row empty';
                
                row.innerHTML = `
                    <div class="rank">${highScoreList.children.length + 1}</div>
                    <div class="player">---</div>
                    <div class="score">0</div>
                    <div class="date">--/--/--</div>
                `;
                
                highScoreList.appendChild(row);
            }
        } catch (error) {
            console.error('Error displaying high scores:', error);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if THREE.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded. Please include the THREE.js library.');
        
        // Create an error message in the game canvas
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            const context = gameCanvas.getContext('2d');
            if (context) {
                context.fillStyle = '#000000';
                context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
                context.font = '16px Arial';
                context.fillStyle = '#FF41B4';
                context.textAlign = 'center';
                context.fillText('THREE.js library not loaded', gameCanvas.width/2, gameCanvas.height/2);
                context.fillText('Please check the console for more information', gameCanvas.width/2, gameCanvas.height/2 + 30);
            }
        }
        return;
    }
    
    // Wait a moment to ensure all elements are loaded
    setTimeout(() => {
        try {
            // Initialize the game
            const game = new NeonRider('game-canvas');
            
            // Display high scores
            let highScores = [];
            try {
                highScores = JSON.parse(localStorage.getItem('neonrider-scores') || '[]');
            } catch (e) {
                console.warn('Error parsing high scores, using empty array');
            }
            game.displayHighScores(highScores);
            
            // Log success
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }, 500);
});