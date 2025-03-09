/*
 * RETRO SYNTH WAVE PORTFOLIO - Main JavaScript
 * Handles animations, interactions and UI functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    const loadingScreen = document.querySelector('.loading-screen');
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const backToTop = document.getElementById('back-to-top');
    const audioToggle = document.getElementById('audio-toggle');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const skillBars = document.querySelectorAll('.skill-progress');
    const colorOptions = document.querySelectorAll('.color-option');
    const toggleWireframe = document.getElementById('toggle-wireframe');
    const toggleRotation = document.getElementById('toggle-rotation');
    const modelDropdown = document.getElementById('model-dropdown');
    
    // Create audio element for background music
    const bgMusic = new Audio();
    bgMusic.src = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/KieLoKaz/Free_Ganymed/KieLoKaz_-_03_-_Cyberpunk_2077.mp3';
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    let musicPlaying = false;
    
    // Setup typed.js if the element exists
    if (document.querySelector('.typed-text')) {
        const typed = new Typed('.typed-text', {
            strings: [
                'immersive game experiences',
                'stunning 3D models',
                'retro-futuristic worlds',
                'interactive digital art'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            startDelay: 1000,
            loop: true
        });
    }
    
    // Hide loading screen after assets loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                // Start animations once site is loaded
                animateElements();
            }, 500);
        }, 2500); // Delay to show loading animation
    });
    
    // Navigation and scroll events
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        // Header style change on scroll
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Show/hide back to top button
        if (scrollPosition > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
        
        // Activate menu items based on scroll position
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.menu a').forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
        
        // Animate skill bars when in viewport
        if (isElementInViewport(document.querySelector('.skills'))) {
            skillBars.forEach(bar => {
                const level = bar.getAttribute('data-level');
                bar.style.width = `${level}%`;
            });
        }
    });
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
        });
    });
    
    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Audio toggle
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            const icon = audioToggle.querySelector('i');
            
            if (musicPlaying) {
                bgMusic.pause();
                icon.className = 'fas fa-volume-mute';
            } else {
                bgMusic.play().catch(e => {
                    console.error('Audio playback failed:', e);
                    alert('Please interact with the page first to enable audio playback.');
                });
                icon.className = 'fas fa-volume-up';
            }
            
            musicPlaying = !musicPlaying;
        });
    }
    
    // Project filtering
    if (tabButtons.length) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                const filter = button.getAttribute('data-filter');
                
                // Show/hide projects based on filter
                projectCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px) scale(0.9)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
    
    // 3D Model Viewer controls - these will communicate with the three-model.js file
    if (colorOptions.length) {
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                const color = option.getAttribute('data-color');
                // This will be handled in the three.js code if it exists
                if (window.changeModelColor) {
                    window.changeModelColor(color);
                }
                
                // Update UI
                colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }
    
    if (toggleWireframe) {
        toggleWireframe.addEventListener('click', () => {
            toggleWireframe.classList.toggle('active');
            // This will be handled in the three.js code if it exists
            if (window.toggleWireframe) {
                window.toggleWireframe();
            }
        });
    }
    
    if (toggleRotation) {
        toggleRotation.addEventListener('click', () => {
            toggleRotation.classList.toggle('active');
            // This will be handled in the three.js code if it exists
            if (window.toggleRotation) {
                window.toggleRotation();
            }
        });
    }
    
    if (modelDropdown) {
        modelDropdown.addEventListener('change', () => {
            const selectedModel = modelDropdown.value;
            // This will be handled in the three.js code if it exists
            if (window.loadModel) {
                window.loadModel(selectedModel);
            }
            
            // Update model info
            updateModelInfo(selectedModel);
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const formData = new FormData(contactForm);
            
            // Display sending state
            btnText.textContent = 'SENDING...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual form submission)
            setTimeout(() => {
                // Form submission success
                btnText.textContent = 'MESSAGE SENT!';
                
                // Reset form
                contactForm.reset();
                
                // Reset button after delay
                setTimeout(() => {
                    btnText.textContent = 'SEND MESSAGE';
                    submitBtn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }
    
    // GSAP Animations - if GSAP is loaded
    function animateElements() {
        if (typeof gsap !== 'undefined') {
            // Hero section animations
            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle) {
                gsap.from(heroTitle, {
                    duration: 1,
                    y: 50,
                    opacity: 0,
                    ease: 'power3.out',
                    delay: 0.2
                });
            }
            
            const heroSubtitle = document.querySelector('.hero .subtitle');
            if (heroSubtitle) {
                gsap.from(heroSubtitle, {
                    duration: 1,
                    y: 30,
                    opacity: 0,
                    ease: 'power3.out',
                    delay: 0.4
                });
            }
            
            const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
            if (ctaButtons.length) {
                gsap.from(ctaButtons, {
                    duration: 0.8,
                    y: 20,
                    opacity: 0,
                    ease: 'power3.out',
                    stagger: 0.2,
                    delay: 0.6
                });
            }
            
            // Setup ScrollTrigger if available
            if (gsap.registerPlugin && ScrollTrigger) {
                gsap.registerPlugin(ScrollTrigger);
                
                // Animate sections when scrolled into view
                const animateSections = [
                    { selector: '.projects .section-header', from: { y: 50, opacity: 0 } },
                    { selector: '.project-tabs', from: { y: 30, opacity: 0 }, delay: 0.2 },
                    { selector: '.project-card', from: { y: 50, opacity: 0 }, stagger: 0.1 },
                    { selector: '.model-viewer-section .section-header', from: { y: 50, opacity: 0 } },
                    { selector: '.model-viewer-container', from: { y: 30, opacity: 0 }, delay: 0.2 },
                    { selector: '.skills .section-header', from: { y: 50, opacity: 0 } },
                    { selector: '.skill-category', from: { y: 30, opacity: 0 }, stagger: 0.2 },
                    { selector: '.about .section-header', from: { y: 50, opacity: 0 } },
                    { selector: '.about-image', from: { x: -50, opacity: 0 }, delay: 0.2 },
                    { selector: '.about-content', from: { x: 50, opacity: 0 }, delay: 0.3 },
                    { selector: '.contact .section-header', from: { y: 50, opacity: 0 } },
                    { selector: '.contact-info', from: { x: -50, opacity: 0 }, delay: 0.2 },
                    { selector: '.contact-form-container', from: { x: 50, opacity: 0 }, delay: 0.3 }
                ];
                
                animateSections.forEach(section => {
                    const elements = document.querySelectorAll(section.selector);
                    if (elements.length) {
                        gsap.from(elements, {
                            scrollTrigger: {
                                trigger: elements[0],
                                start: 'top 80%',
                                toggleActions: 'play none none none'
                            },
                            y: section.from.y || 0,
                            x: section.from.x || 0,
                            opacity: section.from.opacity !== undefined ? section.from.opacity : 0,
                            duration: 0.8,
                            ease: 'power3.out',
                            stagger: section.stagger || 0,
                            delay: section.delay || 0
                        });
                    }
                });
            } else {
                // Fallback if ScrollTrigger is not available
                console.log('ScrollTrigger not available. Using fallback animations.');
                fadeInElementsOnScroll();
            }
        } else {
            // Fallback if GSAP is not available
            console.log('GSAP not available. Using fallback animations.');
            fadeInElementsOnScroll();
        }
    }
    
    // Fallback animation function
    function fadeInElementsOnScroll() {
        const fadeElements = document.querySelectorAll('.section-header, .project-card, .skill-category, .about-image, .about-content, .contact-info, .contact-form-container');
        
        function checkFade() {
            fadeElements.forEach(element => {
                if (isElementInViewport(element) && !element.classList.contains('faded-in')) {
                    element.classList.add('faded-in');
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        }
        
        // Add initial styles
        fadeElements.forEach(element => {
            if (!element.classList.contains('faded-in')) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            }
        });
        
        // Check on scroll
        window.addEventListener('scroll', checkFade);
        
        // Initial check
        checkFade();
    }
    
    // Update model info based on selection
    function updateModelInfo(model) {
        const modelName = document.getElementById('model-name');
        const modelDescription = document.getElementById('model-description');
        const polygonStat = document.querySelector('.stat-value');
        
        if (!modelName || !modelDescription) return;
        
        const modelInfo = {
            cyberbike: {
                name: 'Tag Royale Coin',
                description: 'Tag Royale exclusive currency in Cybperpunk mode',
                polygons: '1,632'
            },
            synthgun: {
                name: 'HP LAPTOP',
                description: 'HP Elitebook 840 G8, modelled in blender.',
                polygons: '8,320'
            },
            retrohelmet: {
                name: 'RETRO CONTROLLER',
                description: 'A simple controller made in blender.',
                polygons: '15,680'
            }
        };
        
        const info = modelInfo[model];
        
        if (info) {
            modelName.textContent = info.name;
            modelDescription.textContent = info.description;
            if (polygonStat) polygonStat.textContent = info.polygons;
        }
    }
    
    // Utility function to check if element is in viewport
    function isElementInViewport(el) {
        if (!el) return false;
        
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Initialize custom cursor if not on mobile
    if (window.innerWidth > 768) {
        initCustomCursor();
    }
});

// Add custom cursor effect
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    const cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorRing);
    
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let isHovering = false;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    const interactiveElements = 'a, button, .project-card, .model-controls, input, textarea, select';
    
    document.querySelectorAll(interactiveElements).forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
        });
        
        el.addEventListener('mouseleave', () => {
            isHovering = false;
        });
    });
    
    function animateCursor() {
        // Smooth follow for cursor ring
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        
        // Apply position
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
        
        // Add hover effect
        if (isHovering) {
            cursorRing.classList.add('hovering');
        } else {
            cursorRing.classList.remove('hovering');
        }
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Add hover state for all interactive elements
    document.querySelectorAll(interactiveElements).forEach(el => {
        el.style.cursor = 'none';
    });
}
// Load Games section dynamically
document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('games-section-container');
    if (gamesContainer) {
        fetch('sections/games-section.html')
            .then(response => response.text())
            .then(html => {
                gamesContainer.innerHTML = html;
                
                // Load game script after HTML is inserted
                const gameScript = document.createElement('script');
                gameScript.src = 'js/neon-rider.js';
                document.body.appendChild(gameScript);
            })
            .catch(error => {
                console.error('Error loading games section:', error);
            });
    }
});