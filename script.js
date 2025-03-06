// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Get the target section id
        const targetId = this.getAttribute('href').substring(1);
        
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        document.getElementById(targetId).classList.add('active');
        
        // Animate skill bars if About section is active
        if (targetId === 'about') {
            animateSkillBars();
        }
    });
});

// Animate skill bars
function animateSkillBars() {
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width + '%';
        }, 100);
    });
}

// CRT Mode Toggle
const crtToggle = document.getElementById('crt-toggle');
const crtEffect = document.getElementById('crt-effect');
let crtModeEnabled = false;

crtToggle.addEventListener('change', function() {
    crtModeEnabled = this.checked;
    if (crtModeEnabled) {
        enableCRTMode();
    } else {
        disableCRTMode();
    }
});

function enableCRTMode() {
    crtEffect.classList.add('active');
    document.body.classList.add('crt-mode');
    
    // IMPORTANT: These properties are safer for scrolling
    // instead of applying to body, apply to a container
    const overlay = document.createElement('div');
    overlay.className = 'crt-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '4';
    overlay.style.mixBlendMode = 'overlay';
    overlay.style.backgroundColor = 'rgba(166, 124, 82, 0.05)';
    document.body.appendChild(overlay);
    
    // IMPORTANT: Do NOT apply filter to body - causes scroll issues
    // Instead add visual effects using other means
    // document.body.style.filter = 'contrast(1.1) brightness(0.9) saturate(1.2)';
    
    // Add RGB split effect to various elements
    document.querySelectorAll('h1, h2, h3, .logo, .btn').forEach(el => {
        el.style.textShadow = '0.06em 0 0 rgba(255,0,0,0.75), -0.025em -0.05em 0 rgba(0,255,0,0.75), 0.025em 0.05em 0 rgba(0,0,255,0.75)';
    });
    
    // Add scanline texture
    addScanlineTexture();
    
    // CRITICAL: Explicitly ensure scrolling is enabled 
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    
    // Save state to localStorage
    localStorage.setItem('crtMode', 'enabled');
}

function disableCRTMode() {
    crtEffect.classList.remove('active');
    document.body.classList.remove('crt-mode');
    
    // Remove overlay
    const overlay = document.querySelector('.crt-overlay');
    if (overlay) overlay.remove();
    
    // Remove RGB split effect
    document.querySelectorAll('h1, h2, h3, .logo, .btn').forEach(el => {
        el.style.textShadow = 'none';
    });
    
    // Remove scanline texture
    removeScanlineTexture();
    
    // CRITICAL: Ensure scrolling is enabled
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    
    // Save state to localStorage
    localStorage.setItem('crtMode', 'disabled');
}

function addScanlineTexture() {
    // If texture already exists, remove it
    removeScanlineTexture();
    
    const scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    scanlines.style.position = 'fixed';
    scanlines.style.top = '0';
    scanlines.style.left = '0';
    scanlines.style.width = '100%';
    scanlines.style.height = '100%';
    scanlines.style.backgroundImage = 'linear-gradient(0deg, transparent 0%, rgba(32, 128, 32, 0.05) 2%, rgba(32, 128, 32, 0.05) 3%, transparent 3%, transparent 9%, rgba(32, 128, 32, 0.05) 10%, rgba(32, 128, 32, 0.05) 11%, transparent 11%, transparent 19%, rgba(32, 128, 32, 0.05) 20%, rgba(32, 128, 32, 0.05) 21%, transparent 21%)';
    scanlines.style.backgroundSize = '100% 20px';
    scanlines.style.zIndex = '3'; // Lower z-index than overlay
    scanlines.style.pointerEvents = 'none'; // CRITICALLY IMPORTANT: Ensure it doesn't block interaction
    
    // Use manual background position changes instead of animation
    let position = 0;
    function moveLines() {
        position = (position + 1) % 20;
        scanlines.style.backgroundPosition = `0 ${position}px`;
        if (document.querySelector('.scanlines')) {
            requestAnimationFrame(moveLines);
        }
    }
    requestAnimationFrame(moveLines);
    
    document.body.appendChild(scanlines);
}

function removeScanlineTexture() {
    const scanlines = document.querySelector('.scanlines');
    if (scanlines) {
        scanlines.remove();
    }
}

// Check if CRT mode was previously enabled
window.addEventListener('load', function() {
    const savedCRTMode = localStorage.getItem('crtMode');
    if (savedCRTMode === 'enabled') {
        crtToggle.checked = true;
        enableCRTMode();
    }
});

// Add flicker keyframes
const style = document.createElement('style');
style.innerHTML = `
    @keyframes flicker {
        0% { opacity: 0.97; }
        5% { opacity: 0.95; }
        10% { opacity: 0.97; }
        15% { opacity: 0.94; }
        20% { opacity: 0.98; }
        25% { opacity: 0.97; }
        30% { opacity: 0.95; }
        35% { opacity: 0.96; }
        40% { opacity: 0.97; }
        45% { opacity: 0.94; }
        50% { opacity: 0.98; }
        55% { opacity: 0.96; }
        60% { opacity: 0.97; }
        65% { opacity: 0.98; }
        70% { opacity: 0.95; }
        75% { opacity: 0.97; }
        80% { opacity: 0.94; }
        85% { opacity: 0.97; }
        90% { opacity: 0.98; }
        95% { opacity: 0.96; }
        100% { opacity: 0.97; }
    }
`;
document.head.appendChild(style);

// Three.js Hero Animation
let heroScene, heroCamera, heroRenderer;
let heroMesh, heroLight;

function initHeroCanvas() {
    const container = document.getElementById('hero-canvas');
    
    // Create scene
    heroScene = new THREE.Scene();
    heroScene.background = new THREE.Color(0x1a1410);
    
    // Create camera
    heroCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    heroCamera.position.z = 5;
    
    // Create renderer
    heroRenderer = new THREE.WebGLRenderer({ antialias: true });
    heroRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(heroRenderer.domElement);
    
    // Create grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0xff6d00, 0xa67c52);
    heroScene.add(gridHelper);
    
    // Add retrowave sun
    const sunGeometry = new THREE.CircleGeometry(2, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6d00,
        side: THREE.DoubleSide 
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 1, -5);
    heroScene.add(sun);
    
    // Add terrain
    const terrainGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
    const terrainMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8b4513,
        wireframe: true,
        emissive: 0xa67c52,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
    });
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = Math.PI / 2;
    terrain.position.y = -2;
    heroScene.add(terrain);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    heroScene.add(ambientLight);
    
    // Add directional light
    heroLight = new THREE.DirectionalLight(0xff6d00, 1);
    heroLight.position.set(1, 1, 1);
    heroScene.add(heroLight);
    
    // Animate
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate grid
        gridHelper.rotation.y += 0.005;
        
        // Rotate terrain slightly
        terrain.rotation.z += 0.002;
        
        // Render scene
        heroRenderer.render(heroScene, heroCamera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        heroCamera.aspect = newWidth / newHeight;
        heroCamera.updateProjectionMatrix();
        
        heroRenderer.setSize(newWidth, newHeight);
    });
}

// Three.js 3D Model Viewer
let modelScene, modelCamera, modelRenderer;
let modelMesh, modelControls;
let autoRotate = false;

function initModelCanvas() {
    const container = document.getElementById('model-canvas');
    
    // Create scene
    modelScene = new THREE.Scene();
    modelScene.background = new THREE.Color(0x1a1410);
    
    // Create camera
    modelCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    modelCamera.position.z = 5;
    
    // Create renderer
    modelRenderer = new THREE.WebGLRenderer({ antialias: true });
    modelRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(modelRenderer.domElement);
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0xa67c52, 0x8b4513);
    modelScene.add(gridHelper);
    
    // Create default model (cube)
    createModel('cube');
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    modelScene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xff6d00, 1);
    directionalLight.position.set(1, 1, 1);
    modelScene.add(directionalLight);
    
    // Add point light
    const pointLight = new THREE.PointLight(0xa67c52, 1, 100);
    pointLight.position.set(0, 3, 0);
    modelScene.add(pointLight);
    
    // Animate
    function animate() {
        requestAnimationFrame(animate);
        
        if (autoRotate && modelMesh) {
            modelMesh.rotation.y += 0.01;
            modelMesh.rotation.x += 0.005;
        }
        
        modelRenderer.render(modelScene, modelCamera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        modelCamera.aspect = newWidth / newHeight;
        modelCamera.updateProjectionMatrix();
        
        modelRenderer.setSize(newWidth, newHeight);
    });
}

function createModel(type) {
    // Remove existing model if any
    if (modelMesh) {
        modelScene.remove(modelMesh);
    }
    
    let geometry;
    
    switch(type) {
        case 'cube':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(1.5, 32, 32);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
            break;
        default:
            geometry = new THREE.BoxGeometry(2, 2, 2);
    }
    
    // Create material with wireframe
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xff6d00,
        wireframe: false,
        emissive: 0xa67c52,
        emissiveIntensity: 0.2,
        specular: 0xffffff,
        shininess: 100
    });
    
    // Create wireframe material
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xa67c52, 
        wireframe: true 
    });
    
    // Create mesh with both materials
    modelMesh = new THREE.Mesh(geometry, material);
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    modelMesh.add(wireframe);
    
    modelScene.add(modelMesh);
}

// Model Selector
document.querySelectorAll('.model-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove active class from all options
        document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked option
        this.classList.add('active');
        
        // Create selected model
        createModel(this.getAttribute('data-model'));
    });
});

// Model Rotation Controls
document.getElementById('rotate-model').addEventListener('click', function() {
    autoRotate = true;
});

document.getElementById('stop-model').addEventListener('click', function() {
    autoRotate = false;
});

// Dust Particles Effect
const dustCanvas = document.getElementById('dust-particles');
let dustCtx, dustParticles = [];

// Handle window resize for particles canvas
window.addEventListener('resize', function() {
    if (dustCanvas) {
        dustCanvas.width = window.innerWidth;
        dustCanvas.height = window.innerHeight;
        
        // Readjust particles positions
        dustParticles.forEach(particle => {
            if (particle.x > dustCanvas.width) particle.x = Math.random() * dustCanvas.width;
            if (particle.y > dustCanvas.height) particle.y = Math.random() * dustCanvas.height;
        });
    }
});

function initDustParticles() {
    dustCanvas.width = window.innerWidth;
    dustCanvas.height = window.innerHeight;
    dustCtx = dustCanvas.getContext('2d');
    
    // Create particles
    for (let i = 0; i < 100; i++) {
        dustParticles.push({
            x: Math.random() * dustCanvas.width,
            y: Math.random() * dustCanvas.height,
            radius: Math.random() * 2,
            color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 255, ${Math.random() * 0.5 + 0.1})`,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25
        });
    }
    
    // Animate particles
    function animateDust() {
        requestAnimationFrame(animateDust);
        
        dustCtx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
        
        dustParticles.forEach(particle => {
            // Move particle
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Reset if off screen
            if (particle.x < 0) particle.x = dustCanvas.width;
            if (particle.x > dustCanvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = dustCanvas.height;
            if (particle.y > dustCanvas.height) particle.y = 0;
            
            // Draw particle
            dustCtx.beginPath();
            dustCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            dustCtx.fillStyle = particle.color;
            dustCtx.fill();
        });
    }
    
    animateDust();
}

// Form Submission
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Form validation
    if (name && email && subject && message) {
        const formStatus = document.getElementById('form-status');
        
        fetch(this.action, {
            method: this.method,
            body: new FormData(this),
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                formStatus.innerHTML = '<div style="color:green; padding:10px; border:1px solid green;">Thank you for your message! I will get back to you soon.</div>';
                formStatus.style.display = 'block';
                this.reset();
            } else {
                formStatus.innerHTML = '<div style="color:red; padding:10px; border:1px solid red;">Something went wrong. Please try again.</div>';
                formStatus.style.display = 'block';
            }
        })
        .catch(error => {
            formStatus.innerHTML = '<div style="color:red; padding:10px; border:1px solid red;">Error: ' + error.message + '</div>';
            formStatus.style.display = 'block';
        });
    } else {
        alert('Please fill all fields.');
    }
});

// Custom cursor
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    
    document.addEventListener('mousemove', function(e) {
        // Get scroll position
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Apply position with scroll offset
        cursor.style.left = (e.clientX + scrollX) + 'px';
        cursor.style.top = (e.clientY + scrollY) + 'px';
        
        // Delayed follow for dot
        setTimeout(() => {
            cursorDot.style.left = (e.clientX + scrollX) + 'px';
            cursorDot.style.top = (e.clientY + scrollY) + 'px';
        }, 100);
    });
    
    // Add hover effect on clickable elements
    const interactiveElements = document.querySelectorAll('a, button, .model-option, .project-card');
    
    interactiveElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-active');
            cursorDot.classList.add('cursor-active');
        });
        
        elem.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-active');
            cursorDot.classList.remove('cursor-active');
        });
    });
}

// Retro audio effects
function initRetroAudio() {
    // Create different audio elements for different interactions
    const audioClick = new Audio();
    audioClick.src = 'https://www.soundjay.com/buttons/sounds/button-09.mp3';
    audioClick.volume = 0.3;
    
    const audioHover = new Audio();
    audioHover.src = 'https://www.soundjay.com/buttons/sounds/button-16.mp3';
    audioHover.volume = 0.1;
    
    const audioSwitch = new Audio();
    audioSwitch.src = 'https://www.soundjay.com/switch/sounds/switch-1.mp3';
    audioSwitch.volume = 0.3;
    
    // Toggle sound button
    const soundButton = document.createElement('div');
    soundButton.className = 'sound-toggle';
    soundButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    document.body.appendChild(soundButton);
    
    let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    if (!soundEnabled) {
        soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    
    soundButton.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            this.innerHTML = '<i class="fas fa-volume-up"></i>';
            localStorage.setItem('soundEnabled', 'true');
        } else {
            this.innerHTML = '<i class="fas fa-volume-mute"></i>';
            localStorage.setItem('soundEnabled', 'false');
        }
    });
    
    // Add click sound to buttons
    document.querySelectorAll('a, button, .model-option').forEach(elem => {
        elem.addEventListener('click', () => {
            if (soundEnabled) audioClick.cloneNode().play();
        });
        
        elem.addEventListener('mouseenter', () => {
            if (soundEnabled) audioHover.cloneNode().play();
        });
    });
    
    // Add switch sound to toggles
    document.getElementById('crt-toggle').addEventListener('change', () => {
        if (soundEnabled) audioSwitch.cloneNode().play();
    });
}

// Glitch effect on hover for project cards
function initGlitchEffect() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('glitch-effect');
            
            // Add glitch text effect to title
            const title = this.querySelector('h3');
            if (title) {
                const originalText = title.textContent;
                let glitchInterval = setInterval(() => {
                    title.textContent = glitchText(originalText);
                }, 100);
                
                // Store the interval and original text
                this.dataset.glitchInterval = glitchInterval;
                this.dataset.originalText = originalText;
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('glitch-effect');
            
            // Restore original title text
            const title = this.querySelector('h3');
            if (title && this.dataset.originalText) {
                title.textContent = this.dataset.originalText;
                clearInterval(this.dataset.glitchInterval);
            }
        });
    });
    
    function glitchText(text) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let result = '';
        
        for (let i = 0; i < text.length; i++) {
            if (Math.random() > 0.7) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            } else {
                result += text[i];
            }
        }
        
        return result;
    }
}

// Typing terminal effect for welcome message
function initTypingEffect() {
    // Create terminal window
    const terminal = document.createElement('div');
    terminal.className = 'terminal-window';
    document.body.appendChild(terminal);
    
    const messages = [
        "INITIALIZING RETRODEV OS v2.5...",
        "LOADING ASSETS...",
        "RENDERING ENVIRONMENT...",
        "ESTABLISHING CONNECTION...",
        "WELCOME TO MY PORTFOLIO!",
        "CLICK ANYWHERE TO CONTINUE..."
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    terminal.innerHTML = '<div class="terminal-content"><div class="terminal-line active"></div></div>';
    const activeLine = terminal.querySelector('.terminal-line.active');
    
    const typingSound = new Audio();
    typingSound.src = 'https://www.soundjay.com/mechanical/sounds/typewriter-1.mp3';
    typingSound.volume = 0.2;
    
    const terminalInterval = setInterval(() => {
        if (messageIndex >= messages.length) {
            clearInterval(terminalInterval);
            terminal.addEventListener('click', () => {
                terminal.classList.add('terminal-closing');
                setTimeout(() => {
                    terminal.remove();
                }, 1000);
            });
            return;
        }
        
        if (charIndex < messages[messageIndex].length) {
            activeLine.textContent += messages[messageIndex][charIndex];
            charIndex++;
            if (Math.random() > 0.7) {
                typingSound.cloneNode().play();
            }
        } else {
            charIndex = 0;
            messageIndex++;
            
            // Create new line for next message
            if (messageIndex < messages.length) {
                const newLine = document.createElement('div');
                newLine.className = 'terminal-line active';
                const terminalContent = terminal.querySelector('.terminal-content');
                terminalContent.appendChild(newLine);
                
                // Make previous line inactive
                activeLine.classList.remove('active');
                activeLine.innerHTML += '<span class="cursor"></span>';
                
                // Update active line reference
                activeLine = newLine;
            }
        }
    }, 60);
}

// Matrix rain effect for background
function initMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const characters = matrix.split("");
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    const rainDrops = [];
    
    for (let i = 0; i < columns; i++) {
        rainDrops[i] = 1;
    }
    
    let frameCount = 0;
    const maxFrameCount = 3; // Slows down the animation
    
    const drawMatrix = () => {
        ctx.fillStyle = "rgba(15, 10, 8, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        frameCount++;
        if (frameCount < maxFrameCount) {
            requestAnimationFrame(drawMatrix);
            return;
        }
        frameCount = 0;
        
        ctx.fillStyle = "#ff6d00";
        ctx.font = fontSize + "px monospace";
        
        for (let i = 0; i < rainDrops.length; i++) {
            const text = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
        
        requestAnimationFrame(drawMatrix);
    };
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    drawMatrix();
}

// Parallax scroll effect
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        
        // Parallax for hero section
        const heroSection = document.querySelector('#home');
        if (heroSection && heroSection.classList.contains('active')) {
            const heroImage = document.querySelector('.hero-image');
            const heroText = document.querySelector('.hero-text');
            
            if (heroImage) {
                heroImage.style.transform = `translateY(${scrollPosition * 0.15}px)`;
            }
            
            if (heroText) {
                heroText.style.transform = `translateY(${scrollPosition * -0.1}px)`;
            }
        }
        
        // Parallax for project cards
        document.querySelectorAll('.project-card').forEach((card, index) => {
            const cardTop = card.getBoundingClientRect().top + window.pageYOffset;
            const cardPosition = scrollPosition - cardTop;
            
            if (cardPosition > -500 && cardPosition < 500) {
                const translateY = cardPosition * (0.03 + (index % 3) * 0.01);
                card.style.transform = `translateY(${translateY}px)`;
            }
        });
    });
}

// Easter egg - Konami code
function initKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        // Check if key matches the next key in the Konami code
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            
            // If all keys have been pressed in the correct order
            if (konamiIndex === konamiCode.length) {
                triggerEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
    
    function triggerEasterEgg() {
        // Check if we already have the Space Invaders script
        if (typeof startSpaceInvaders !== 'function') {
            // Load the Space Invaders script dynamically
            const script = document.createElement('script');
            script.src = 'spaceinvaders.js';
            script.onload = function() {
                // Start the game once the script is loaded
                startSpaceInvaders();
            };
            document.head.appendChild(script);
        } else {
            // Game script already loaded, just start the game
            startSpaceInvaders();
        }
    }
}

// Preloader
function initPreloader() {
    // Simulate loading time (can be removed in production)
    setTimeout(() => {
        document.body.classList.remove('loading');
        
        // Add fade-in effect to all sections
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transition = 'opacity 1s ease';
            
            setTimeout(() => {
                section.style.opacity = '1';
            }, 500);
        });
    }, 2000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize preloader
    initPreloader();
    
    // Initialize Three.js canvases
    initHeroCanvas();
    initModelCanvas();
    
    // Initialize dust particles
    initDustParticles();
    
    // Animate skill bars if About section is initially active
    if (document.getElementById('about').classList.contains('active')) {
        animateSkillBars();
    }
    
    // Initialize new cool features
    initCustomCursor();
    initRetroAudio();
    initGlitchEffect();
    initTypingEffect();
    initMatrixRain();
    initParallax();
    initKonamiCode();
});