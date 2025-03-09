/*
 * RETRO SYNTH WAVE PORTFOLIO - Three.js Implementation
 * Handles 3D model rendering for hero section and model viewer
 */

// Initialize the 3D environment
document.addEventListener('DOMContentLoaded', () => {
    // Check if THREE is loaded
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded. Please include the THREE.js library.');
        return;
    }

    // Set up hero model if the canvas exists
    if (document.getElementById('hero-model')) {
        initHeroModel();
    }
    
    // Set up interactive model viewer if the canvas exists
    if (document.getElementById('model-canvas')) {
        initModelViewer();
    }
});

// Variables to hold Three.js scenes, cameras, renderers, etc.
let heroScene, heroCamera, heroRenderer, heroModel, heroMixer;
let viewerScene, viewerCamera, viewerRenderer, viewerModel, viewerMixer;
let viewerControls, viewerClock, isRotating = true, wireframeMode = false;

// Create shared loaders
const textureLoader = new THREE.TextureLoader();
let modelLoader;

// Initialize model loader if GLTFLoader is available
if (typeof THREE.GLTFLoader !== 'undefined') {
    modelLoader = new THREE.GLTFLoader();
} else {
    console.warn('THREE.GLTFLoader not found. Using fallback geometry.');
}

// Hero section 3D model
function initHeroModel() {
    const canvas = document.getElementById('hero-model');
    if (!canvas) return;
    
    // Create scene
    heroScene = new THREE.Scene();
    
    // Create camera
    heroCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    heroCamera.position.set(0, 0, 5);
    
    // Create renderer
    heroRenderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(window.devicePixelRatio);
    heroRenderer.outputEncoding = THREE.sRGBEncoding;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    heroScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);
    heroScene.add(directionalLight);
    
    // Get theme colors
    const themeColors = window.getThemeColors ? window.getThemeColors() : {
        highlight: '#00F0FF',
        accent: '#FF41B4'
    };
    
    const pointLight1 = new THREE.PointLight(parseInt(themeColors.accent.replace('#', '0x')), 2, 10);
    pointLight1.position.set(2, 1, 3);
    heroScene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(parseInt(themeColors.highlight.replace('#', '0x')), 2, 10);
    pointLight2.position.set(-2, 1, 3);
    heroScene.add(pointLight2);
    
    // Check if we can load a GLTF model
    if (modelLoader) {
        // Try to load a futuristic city model
        modelLoader.load('models/futuristic_city.glb', 
            // Success callback
            (gltf) => {
                heroModel = gltf.scene;
                heroModel.scale.set(0.5, 0.5, 0.5);
                heroModel.position.set(0, -1, 0);
                heroScene.add(heroModel);
                
                // Apply theme colors to materials
                applyThemeColorsToModel(heroModel);
                
                // Handle animations if any
                if (gltf.animations && gltf.animations.length) {
                    heroMixer = new THREE.AnimationMixer(heroModel);
                    const animation = gltf.animations[0];
                    const action = heroMixer.clipAction(animation);
                    action.play();
                }
            },
            // Progress callback
            (xhr) => {
                console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            // Error callback
            (error) => {
                console.error('Error loading hero model:', error);
                createFallbackHeroModel();
            }
        );
    } else {
        // Create a fallback model if GLTFLoader is not available
        createFallbackHeroModel();
    }
    
    // Add grid for retro effect
    const gridHelper = new THREE.GridHelper(20, 20, parseInt(themeColors.highlight.replace('#', '0x')), parseInt(themeColors.highlight.replace('#', '0x')));
    gridHelper.position.y = -2;
    heroScene.add(gridHelper);
    
    // Animation loop
    const clock = new THREE.Clock();
    
    function animateHero() {
        requestAnimationFrame(animateHero);
        
        if (heroModel) {
            // Rotate model
            heroModel.rotation.y += 0.005;
            
            // Update animation mixer if exists
            if (heroMixer) {
                heroMixer.update(clock.getDelta());
            }
        }
        
        heroRenderer.render(heroScene, heroCamera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        heroCamera.aspect = window.innerWidth / window.innerHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start animation loop
    animateHero();
}

// Create a fallback model for the hero section if model loading fails
function createFallbackHeroModel() {
    // Get theme colors
    const themeColors = window.getThemeColors ? window.getThemeColors() : {
        highlight: '#00F0FF',
        accent: '#FF41B4'
    };
    
    // Create a city-like structure with geometric shapes
    heroModel = new THREE.Group();
    
    // Create several buildings
    const buildingCount = 15;
    const buildingGeometries = [
        new THREE.BoxGeometry(0.5, 2, 0.5),
        new THREE.BoxGeometry(0.3, 1.5, 0.3),
        new THREE.BoxGeometry(0.7, 3, 0.7),
        new THREE.CylinderGeometry(0.2, 0.2, 2, 8)
    ];
    
    // Materials with theme colors
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const neonMaterial1 = new THREE.MeshStandardMaterial({
        color: parseInt(themeColors.highlight.replace('#', '0x')),
        emissive: parseInt(themeColors.highlight.replace('#', '0x')),
        emissiveIntensity: 1,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const neonMaterial2 = new THREE.MeshStandardMaterial({
        color: parseInt(themeColors.accent.replace('#', '0x')),
        emissive: parseInt(themeColors.accent.replace('#', '0x')),
        emissiveIntensity: 1,
        metalness: 0.8,
        roughness: 0.2
    });
    
    // Create buildings
    for (let i = 0; i < buildingCount; i++) {
        const geometryIndex = Math.floor(Math.random() * buildingGeometries.length);
        const building = new THREE.Mesh(buildingGeometries[geometryIndex], buildingMaterial);
        
        // Random position
        const angle = (i / buildingCount) * Math.PI * 2;
        const radius = 2 + Math.random() * 3;
        building.position.x = Math.cos(angle) * radius;
        building.position.z = Math.sin(angle) * radius;
        building.position.y = building.geometry.parameters.height / 2 - 2;
        
        // Add neon strips to some buildings
        if (Math.random() > 0.5) {
            const neonGeometry = new THREE.BoxGeometry(
                building.geometry.parameters.width * 1.1,
                0.05,
                building.geometry.parameters.depth * 1.1
            );
            
            const neonMaterial = Math.random() > 0.5 ? neonMaterial1 : neonMaterial2;
            const neonStrip = new THREE.Mesh(neonGeometry, neonMaterial);
            
            // Position at the top of the building
            const height = building.geometry.parameters.height;
            neonStrip.position.y = height / 2 + 0.025;
            
            building.add(neonStrip);
        }
        
        heroModel.add(building);
    }
    
    // Add the model to the scene
    heroScene.add(heroModel);
}

// Interactive model viewer
function initModelViewer() {
    const canvas = document.getElementById('model-canvas');
    if (!canvas) return;
    
    // Get theme colors
    const themeColors = window.getThemeColors ? window.getThemeColors() : {
        highlight: '#00F0FF',
        accent: '#FF41B4'
    };
    
    // Create scene
    viewerScene = new THREE.Scene();
    viewerScene.background = new THREE.Color(0x0A0A0A);
    
    // Create camera
    viewerCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    viewerCamera.position.set(0, 0, 5);
    
    // Create renderer
    viewerRenderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    viewerRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    viewerRenderer.setPixelRatio(window.devicePixelRatio);
    viewerRenderer.outputEncoding = THREE.sRGBEncoding;
    
    // Add OrbitControls if available
    if (typeof THREE.OrbitControls !== 'undefined') {
        viewerControls = new THREE.OrbitControls(viewerCamera, canvas);
        viewerControls.enableDamping = true;
        viewerControls.dampingFactor = 0.05;
    } else {
        console.warn('THREE.OrbitControls not found. Camera controls disabled.');
    }
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    viewerScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);
    viewerScene.add(directionalLight);
    
    // Add point lights for neon effect
    const colors = [
        parseInt(themeColors.accent.replace('#', '0x')),
        parseInt(themeColors.highlight.replace('#', '0x')),
        0xA359FF,
        0xFFDE59
    ];
    
    const pointLights = [];
    
    for (let i = 0; i < 4; i++) {
        const light = new THREE.PointLight(colors[i], 1, 10);
        const angle = (i / 4) * Math.PI * 2;
        light.position.set(
            Math.cos(angle) * 3,
            Math.sin(angle) * 3,
            2
        );
        viewerScene.add(light);
        pointLights.push(light);
    }
    
    // Add grid
    const gridHelper = new THREE.GridHelper(10, 10, parseInt(themeColors.highlight.replace('#', '0x')), parseInt(themeColors.highlight.replace('#', '0x')));
    gridHelper.position.y = -2;
    viewerScene.add(gridHelper);
    
    // Current model and material references
    let currentModel = null;
    let currentMaterials = [];
    
    // Load initial model
    loadModel('cyberbike');
    
    // Animation loop
    viewerClock = new THREE.Clock();
    
    function animateViewer() {
        requestAnimationFrame(animateViewer);
        
        // Update controls if available
        if (viewerControls) {
            viewerControls.update();
        }
        
        // Rotate model if enabled
        if (isRotating && currentModel) {
            currentModel.rotation.y += 0.01;
        }
        
        // Animate lights
        const time = Date.now() * 0.001;
        pointLights.forEach((light, i) => {
            const angle = (i / 4) * Math.PI * 2 + time * 0.5;
            light.position.x = Math.cos(angle) * 3;
            light.position.z = Math.sin(angle) * 3;
        });
        
        // Update animation mixer if exists
        if (viewerMixer) {
            viewerMixer.update(viewerClock.getDelta());
        }
        
        // Render scene
        viewerRenderer.render(viewerScene, viewerCamera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        viewerCamera.aspect = width / height;
        viewerCamera.updateProjectionMatrix();
        viewerRenderer.setSize(width, height);
    });
    
    // Force initial resize to ensure proper sizing
    const resizeObserver = new ResizeObserver(entries => {
        if (entries.length > 0) {
            const { width, height } = entries[0].contentRect;
            viewerCamera.aspect = width / height;
            viewerCamera.updateProjectionMatrix();
            viewerRenderer.setSize(width, height);
        }
    });
    
    resizeObserver.observe(canvas);
    
    // Start animation loop
    animateViewer();
    
    // Expose functions to window for UI controls
    window.loadModel = function(modelName) {
        loadModel(modelName);
    };
    
    window.changeModelColor = function(colorHex) {
        changeModelColor(colorHex);
    };
    
    window.toggleWireframe = function() {
        toggleModelWireframe();
    };
    
    window.toggleRotation = function() {
        isRotating = !isRotating;
    };
    
    // Function to load a 3D model
    function loadModel(modelName) {
        // Remove current model if exists
        if (currentModel) {
            viewerScene.remove(currentModel);
        }
        
        // Reset materials array
        currentMaterials = [];
        
        // Check if we can load GLTF models
        if (modelLoader) {
            // Map model name to file path
            const modelPaths = {
                cyberbike: 'models/cyber_bike.glb',
                synthgun: 'models/synth_gun.glb',
                retrohelmet: 'models/retro_helmet.glb'
            };
            
            const modelPath = modelPaths[modelName] || modelPaths.cyberbike;
            
            // Try to load the model
            modelLoader.load(
                modelPath,
                // Success callback
                (gltf) => {
                    currentModel = gltf.scene;
                    currentModel.scale.set(1.5, 1.5, 1.5);
                    currentModel.position.set(0, 0, 0);
                    viewerScene.add(currentModel);
                    
                    // Reset camera and controls
                    viewerCamera.position.set(0, 0, 5);
                    if (viewerControls) viewerControls.reset();
                    
                    // Store material references and apply initial materials
                    storeMaterialReferences(currentModel);
                    
                    // Apply current display mode
                    if (wireframeMode) {
                        applyWireframeToModel();
                    } else {
                        applyThemeColorsToModel(currentModel);
                    }
                    
                    // Handle animations if any
                    if (gltf.animations && gltf.animations.length) {
                        viewerMixer = new THREE.AnimationMixer(currentModel);
                        const animation = gltf.animations[0];
                        const action = viewerMixer.clipAction(animation);
                        action.play();
                    }
                },
                // Progress callback
                (xhr) => {
                    console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
                },
                // Error callback
                (error) => {
                    console.error('Error loading model:', error);
                    createFallbackModel(modelName);
                }
            );
        } else {
            // Create fallback model if no GLTFLoader
            createFallbackModel(modelName);
        }
    }
    
    // Create fallback geometric models
    function createFallbackModel(modelType) {
        // Get theme colors
        const themeColors = window.getThemeColors ? window.getThemeColors() : {
            highlight: '#00F0FF',
            accent: '#FF41B4'
        };
        
        // Create a group to hold the model parts
        currentModel = new THREE.Group();
        
        // Different geometry based on model type
        if (modelType === 'cyberbike') {
            // Create a stylized bike with basic geometry
            const bikeBody = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.5, 0.8),
                new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    metalness: 0.8,
                    roughness: 0.2
                })
            );
            currentModel.add(bikeBody);
            currentMaterials.push(bikeBody);
            
            // Add wheels
            const wheelGeometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32);
            const wheelMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111,
                metalness: 0.9,
                roughness: 0.1
            });
            
            const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            frontWheel.position.set(0.8, -0.3, 0);
            frontWheel.rotation.y = Math.PI / 2;
            currentModel.add(frontWheel);
            currentMaterials.push(frontWheel);
            
            const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            backWheel.position.set(-0.8, -0.3, 0);
            backWheel.rotation.y = Math.PI / 2;
            currentModel.add(backWheel);
            currentMaterials.push(backWheel);
            
            // Add handlebars
            const handlebar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
                new THREE.MeshStandardMaterial({
                    color: 0x444444,
                    metalness: 0.7,
                    roughness: 0.3
                })
            );
            handlebar.position.set(0.9, 0.3, 0);
            handlebar.rotation.z = Math.PI / 2;
            currentModel.add(handlebar);
            currentMaterials.push(handlebar);
            
            // Add neon strips
            const neonMaterial = new THREE.MeshStandardMaterial({
                color: parseInt(themeColors.highlight.replace('#', '0x')),
                emissive: parseInt(themeColors.highlight.replace('#', '0x')),
                emissiveIntensity: 1,
                metalness: 0.8,
                roughness: 0.2
            });
            
            const frontLight = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 16, 16),
                neonMaterial
            );
            frontLight.position.set(1.1, 0, 0);
            currentModel.add(frontLight);
            currentMaterials.push(frontLight);
            
            const rearLight = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.1, 0.4),
                neonMaterial
            );
            rearLight.position.set(-1.1, 0, 0);
            currentModel.add(rearLight);
            currentMaterials.push(rearLight);
            
            const neonStrip = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.05, 0.05),
                neonMaterial
            );
            neonStrip.position.set(0, -0.25, 0.4);
            currentModel.add(neonStrip);
            currentMaterials.push(neonStrip);
        } 
        else if (modelType === 'synthgun') {
            // Create a stylized gun with basic geometry
            const gunBody = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.3, 0.2),
                new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    metalness: 0.8,
                    roughness: 0.2
                })
            );
            currentModel.add(gunBody);
            currentMaterials.push(gunBody);
            
            // Gun barrel
            const barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8),
                new THREE.MeshStandardMaterial({
                    color: 0x222222,
                    metalness: 0.9,
                    roughness: 0.1
                })
            );
            barrel.position.set(1.3, 0, 0);
            barrel.rotation.z = Math.PI / 2;
            currentModel.add(barrel);
            currentMaterials.push(barrel);
            
            // Gun grip
            const grip = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.8, 0.2),
                new THREE.MeshStandardMaterial({
                    color: 0x444444,
                    metalness: 0.7,
                    roughness: 0.3
                })
            );
            grip.position.set(-0.4, -0.5, 0);
            currentModel.add(grip);
            currentMaterials.push(grip);
            
            // Add neon elements
            const neonMaterial = new THREE.MeshStandardMaterial({
                color: parseInt(themeColors.accent.replace('#', '0x')),
                emissive: parseInt(themeColors.accent.replace('#', '0x')),
                emissiveIntensity: 1,
                metalness: 0.8,
                roughness: 0.2
            });
            
            const energyCore = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 16, 16),
                neonMaterial
            );
            energyCore.position.set(0, 0, 0);
            currentModel.add(energyCore);
            currentMaterials.push(energyCore);
            
            const sight = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.1, 0.05),
                neonMaterial
            );
            sight.position.set(0.5, 0.25, 0);
            currentModel.add(sight);
            currentMaterials.push(sight);
        } 
        else if (modelType === 'retrohelmet') {
            // Create a stylized helmet with basic geometry
            const helmetBase = new THREE.Mesh(
                new THREE.SphereGeometry(0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6),
                new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    metalness: 0.8,
                    roughness: 0.2
                })
            );
            helmetBase.rotation.x = Math.PI / 2;
            currentModel.add(helmetBase);
            currentMaterials.push(helmetBase);
            
            // Visor
            const visorMaterial = new THREE.MeshStandardMaterial({
                color: parseInt(themeColors.highlight.replace('#', '0x')),
                opacity: 0.7,
                transparent: true,
                metalness: 0.9,
                roughness: 0.1
            });
            
            const visor = new THREE.Mesh(
                new THREE.SphereGeometry(0.7, 32, 16, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.25, Math.PI * 0.3),
                visorMaterial
            );
            visor.position.set(0, 0, 0.2);
            currentModel.add(visor);
            currentMaterials.push(visor);
            
            // Add neon trim
            const neonMaterial = new THREE.MeshStandardMaterial({
                color: parseInt(themeColors.accent.replace('#', '0x')),
                emissive: parseInt(themeColors.accent.replace('#', '0x')),
                emissiveIntensity: 1,
                metalness: 0.8,
                roughness: 0.2
            });
            
            const trimRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.8, 0.05, 16, 32, Math.PI),
                neonMaterial
            );
            trimRing.position.set(0, 0, 0);
            trimRing.rotation.x = Math.PI / 2;
            currentModel.add(trimRing);
            currentMaterials.push(trimRing);
            
            // Ear pieces
            const earPiece1 = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.3, 0.1),
                new THREE.MeshStandardMaterial({
                    color: 0x222222,
                    metalness: 0.8,
                    roughness: 0.2
                })
            );
            earPiece1.position.set(0.85, 0, -0.2);
            currentModel.add(earPiece1);
            currentMaterials.push(earPiece1);
            
            const earPiece2 = earPiece1.clone();
            earPiece2.position.set(-0.85, 0, -0.2);
            currentModel.add(earPiece2);
            currentMaterials.push(earPiece2);
        }
        
        // Rotate model for better view
        currentModel.rotation.y = Math.PI / 4;
        
        // Add the model to the scene
        viewerScene.add(currentModel);
    }
    
    // Store original material references
    function storeMaterialReferences(model) {
        currentMaterials = [];
        
        model.traverse((child) => {
            if (child.isMesh) {
                // Store original material
                child.userData.originalMaterial = child.material.clone();
                currentMaterials.push(child);
            }
        });
    }
    
    // Change model color based on user selection
    function changeModelColor(colorHex) {
        const color = parseInt(colorHex.replace('#', '0x'));
        
        if (wireframeMode) {
            // If in wireframe mode, just change the wireframe color
            currentMaterials.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.color.set(color);
                }
            });
        } else {
            // Apply color influence to model
            currentMaterials.forEach(mesh => {
                applyCustomMaterial(mesh, color);
            });
        }
    }
    
    // Toggle wireframe mode
    function toggleModelWireframe() {
        wireframeMode = !wireframeMode;
        
        if (wireframeMode) {
            applyWireframeToModel();
        } else {
            // Restore custom materials
            currentMaterials.forEach(mesh => {
                const currentColor = mesh.material.color ? mesh.material.color.getHex() : 0x00F0FF;
                applyCustomMaterial(mesh, currentColor);
            });
        }
    }
    
    // Apply wireframe to the entire model
    function applyWireframeToModel() {
        const themeColors = window.getThemeColors ? window.getThemeColors() : {
            highlight: '#00F0FF'
        };
        
        const wireframeColor = parseInt(themeColors.highlight.replace('#', '0x'));
        
        currentMaterials.forEach(mesh => {
            if (mesh.material) {
                const currentColor = mesh.material.color ? mesh.material.color.getHex() : wireframeColor;
                
                mesh.material = new THREE.MeshBasicMaterial({
                    color: currentColor,
                    wireframe: true,
                    wireframeLinewidth: 2
                });
            }
        });
    }
    
    // Apply custom material based on part type
    function applyCustomMaterial(mesh, color) {
        // Skip if no material
        if (!mesh.material) return;
        
        // Get theme colors
        const themeColors = window.getThemeColors ? window.getThemeColors() : {
            highlight: '#00F0FF',
            accent: '#FF41B4'
        };
        
        // Check if it's a neon part based on name or material properties
        const isNeon = mesh.name && (
            mesh.name.toLowerCase().includes('neon') || 
            mesh.name.toLowerCase().includes('light') || 
            mesh.name.toLowerCase().includes('glow') || 
            mesh.name.toLowerCase().includes('emit')
        );
        
        const isEmissive = mesh.userData.originalMaterial && 
                          mesh.userData.originalMaterial.emissive && 
                          mesh.userData.originalMaterial.emissiveIntensity > 0;
        
        if (isNeon || isEmissive) {
            // Use emissive material for neon parts
            mesh.material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 1,
                metalness: 0.8,
                roughness: 0.2
            });
        } else {
            // For non-neon parts, keep original material properties but apply slight color influence
            const originalMaterial = mesh.userData.originalMaterial || 
                                    new THREE.MeshStandardMaterial({
                                        color: 0x333333,
                                        metalness: 0.5,
                                        roughness: 0.5
                                    });
            
            // Create a new material based on original
            mesh.material = new THREE.MeshStandardMaterial({
                color: originalMaterial.color,
                map: originalMaterial.map,
                normalMap: originalMaterial.normalMap,
                metalnessMap: originalMaterial.metalnessMap,
                roughnessMap: originalMaterial.roughnessMap,
                metalness: originalMaterial.metalness || 0.5,
                roughness: originalMaterial.roughness || 0.5,
                envMapIntensity: 1.5
            });
            
            // Add slight color influence (20%)
            mesh.material.color.lerp(new THREE.Color(color), 0.2);
        }
    }
}

// Apply theme colors to any model
function applyThemeColorsToModel(model) {
    // Get theme colors
    const themeColors = window.getThemeColors ? window.getThemeColors() : {
        highlight: '#00F0FF',
        accent: '#FF41B4',
        secondary1: '#A359FF',
        secondary2: '#FFDE59'
    };
    
    // Convert hex to integer
    const colors = {
        highlight: parseInt(themeColors.highlight.replace('#', '0x')),
        accent: parseInt(themeColors.accent.replace('#', '0x')),
        secondary1: parseInt(themeColors.secondary1 ? themeColors.secondary1.replace('#', '0x') : '0xA359FF'),
        secondary2: parseInt(themeColors.secondary2 ? themeColors.secondary2.replace('#', '0x') : '0xFFDE59')
    };
    
    // Apply materials based on object names or properties
    model.traverse((child) => {
        if (child.isMesh) {
            // Store original material for reference
            if (!child.userData.originalMaterial) {
                child.userData.originalMaterial = child.material.clone();
            }
            
            // Apply appropriate material based on name
            const name = child.name.toLowerCase();
            
            if (name.includes('neon') || name.includes('glow') || name.includes('light') || name.includes('emit')) {
                // Choose color based on name
                let color = colors.highlight; // default
                
                if (name.includes('pink') || name.includes('red')) {
                    color = colors.accent;
                } else if (name.includes('purple') || name.includes('violet')) {
                    color = colors.secondary1;
                } else if (name.includes('yellow') || name.includes('orange')) {
                    color = colors.secondary2;
                }
                
                // Apply emissive material
                child.material = new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 1,
                    metalness: 0.8,
                    roughness: 0.2
                });
            } else {
                // Keep original material for non-neon parts
                // but we could add a slight color influence
                child.material = child.userData.originalMaterial;
            }
        }
    });
}