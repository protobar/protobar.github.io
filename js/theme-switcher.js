/*
 * RETRO SYNTH WAVE PORTFOLIO - Theme Switcher
 * Allows switching between different visual themes
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create theme switcher UI
    createThemeSwitcher();
    
    // Check for system preferred color scheme
    checkSystemPreference();
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        setActiveThemeInDropdown(savedTheme);
    }
    
    // Add transition class after initial theme is set (prevents transition on page load)
    setTimeout(() => {
        document.body.classList.add('theme-transition');
    }, 300);
});

/**
 * Checks system preference for color scheme
 */
function checkSystemPreference() {
    // Check if user hasn't set a preference yet
    if (!localStorage.getItem('portfolio-theme')) {
        // Check for dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            setActiveThemeInDropdown('dark');
        }
        
        // Listen for changes in system preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Only apply if the user hasn't manually selected a theme
            if (!localStorage.getItem('portfolio-theme')) {
                const newTheme = e.matches ? 'dark' : 'cyberpunk';
                document.documentElement.setAttribute('data-theme', newTheme);
                setActiveThemeInDropdown(newTheme);
            }
        });
    }
}

/**
 * Creates the theme switcher UI in the DOM
 */
function createThemeSwitcher() {
    // Create theme switcher container
    const themeContainer = document.createElement('div');
    themeContainer.className = 'theme-switcher';
    
    // Create theme options
    const themes = [
        { name: 'cyberpunk', label: 'Cyberpunk Neon' },
        { name: 'brownish', label: 'Brownish Retro' },
        { name: 'green', label: 'Retro Byte Green' },
        { name: 'dark', label: 'Dark Tech' },
        { name: 'vaporwave', label: 'Vaporwave Pastel' }
    ];
    
    // Create theme button
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-btn';
    themeBtn.innerHTML = '<i class="fas fa-palette"></i>';
    themeBtn.setAttribute('aria-label', 'Change theme');
    themeBtn.setAttribute('aria-expanded', 'false');
    themeBtn.setAttribute('aria-controls', 'theme-dropdown');
    themeContainer.appendChild(themeBtn);
    
    // Create theme dropdown
    const themeDropdown = document.createElement('div');
    themeDropdown.className = 'theme-dropdown';
    themeDropdown.id = 'theme-dropdown';
    themeDropdown.setAttribute('role', 'menu');
    themeDropdown.setAttribute('aria-hidden', 'true');
    
    // Add theme options to dropdown
    themes.forEach(theme => {
        const themeOption = document.createElement('div');
        themeOption.className = 'theme-option';
        themeOption.setAttribute('data-theme', theme.name);
        themeOption.setAttribute('role', 'menuitem');
        themeOption.setAttribute('tabindex', '0');
        
        // Create theme swatch
        const themeSwatch = document.createElement('span');
        themeSwatch.className = 'theme-swatch';
        themeSwatch.setAttribute('data-theme', theme.name);
        
        // Create theme label
        const themeLabel = document.createElement('span');
        themeLabel.textContent = theme.label;
        
        // Add click event to change theme
        themeOption.addEventListener('click', () => {
            setTheme(theme.name);
            themeDropdown.classList.remove('active');
            themeBtn.setAttribute('aria-expanded', 'false');
            themeDropdown.setAttribute('aria-hidden', 'true');
            themeBtn.focus();
        });
        
        // Add keyboard support
        themeOption.addEventListener('keydown', (e) => {
            // Enter or Space activates the option
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setTheme(theme.name);
                themeDropdown.classList.remove('active');
                themeBtn.setAttribute('aria-expanded', 'false');
                themeDropdown.setAttribute('aria-hidden', 'true');
                themeBtn.focus();
            }
            
            // Arrow keys for navigation
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextSibling = themeOption.nextElementSibling;
                if (nextSibling) nextSibling.focus();
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevSibling = themeOption.previousElementSibling;
                if (prevSibling) prevSibling.focus();
                else themeBtn.focus();
            }
            
            // Escape closes dropdown
            if (e.key === 'Escape') {
                themeDropdown.classList.remove('active');
                themeBtn.setAttribute('aria-expanded', 'false');
                themeDropdown.setAttribute('aria-hidden', 'true');
                themeBtn.focus();
            }
        });
        
        // Assemble theme option
        themeOption.appendChild(themeSwatch);
        themeOption.appendChild(themeLabel);
        themeDropdown.appendChild(themeOption);
    });
    
    // Add dropdown to container
    themeContainer.appendChild(themeDropdown);
    
    // Toggle dropdown on button click
    themeBtn.addEventListener('click', () => {
        const isActive = themeDropdown.classList.toggle('active');
        themeBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        themeDropdown.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        
        if (isActive) {
            // Focus the first option when opened
            const firstOption = themeDropdown.querySelector('.theme-option');
            if (firstOption) setTimeout(() => firstOption.focus(), 100);
        }
    });
    
    // Add keyboard support for theme button
    themeBtn.addEventListener('keydown', (e) => {
        // Enter, Space or ArrowDown opens dropdown
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            themeDropdown.classList.add('active');
            themeBtn.setAttribute('aria-expanded', 'true');
            themeDropdown.setAttribute('aria-hidden', 'false');
            
            // Focus the first option
            const firstOption = themeDropdown.querySelector('.theme-option');
            if (firstOption) setTimeout(() => firstOption.focus(), 100);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeContainer.contains(e.target)) {
            themeDropdown.classList.remove('active');
            themeBtn.setAttribute('aria-expanded', 'false');
            themeDropdown.setAttribute('aria-hidden', 'true');
        }
    });
    
    // Add theme switcher to body
    document.body.appendChild(themeContainer);
}

/**
 * Sets the active theme
 * @param {string} themeName - Name of theme to activate
 */
function setTheme(themeName) {
    try {
        // Set theme attribute on HTML element
        document.documentElement.setAttribute('data-theme', themeName);
        
        // Save theme preference to localStorage
        localStorage.setItem('portfolio-theme', themeName);
        
        // Update active state in dropdown
        setActiveThemeInDropdown(themeName);
        
        // Update any 3D models if the function exists
        if (typeof updateThreeJsColors === 'function') {
            updateThreeJsColors();
        }
        
        // Trigger theme change event for other scripts
        const themeChangeEvent = new CustomEvent('themechange', { 
            detail: { theme: themeName, colors: getThemeColors() }
        });
        document.dispatchEvent(themeChangeEvent);
        
        console.log(`Theme changed to: ${themeName}`);
    } catch (error) {
        console.error('Error setting theme:', error);
    }
}

/**
 * Sets the active state in theme dropdown
 * @param {string} themeName - Name of active theme
 */
function setActiveThemeInDropdown(themeName) {
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.getAttribute('data-theme') === themeName) {
            option.classList.add('active');
            option.setAttribute('aria-selected', 'true');
        } else {
            option.classList.remove('active');
            option.setAttribute('aria-selected', 'false');
        }
    });
}

/**
 * Updates model colors based on current theme
 * This function is used by the 3D model viewer
 * @returns {Object} Object containing theme color values
 */
function getThemeColors() {
    try {
        // Get computed style to access CSS variables
        const style = getComputedStyle(document.documentElement);
        
        // Return theme colors
        return {
            highlight: style.getPropertyValue('--highlight-color').trim(),
            accent: style.getPropertyValue('--accent-color').trim(),
            secondary1: style.getPropertyValue('--secondary-1').trim(),
            secondary2: style.getPropertyValue('--secondary-2').trim(),
            primaryDark: style.getPropertyValue('--primary-dark').trim(),
            primaryMedium: style.getPropertyValue('--primary-medium').trim(),
            primaryLight: style.getPropertyValue('--primary-light').trim(),
            textLight: style.getPropertyValue('--text-light').trim()
        };
    } catch (error) {
        console.error('Error getting theme colors:', error);
        // Return fallback colors
        return {
            highlight: '#00F0FF',
            accent: '#FF41B4',
            secondary1: '#A359FF',
            secondary2: '#FFDE59',
            primaryDark: '#010914',
            primaryMedium: '#1A0B35',
            primaryLight: '#2B50AA',
            textLight: '#FFFFFF'
        };
    }
}

/**
 * Updates Three.js models with current theme colors
 * This function is called when the theme changes
 */
function updateThreeJsColors() {
    // Check if Three.js functions exist
    if (window.applyThemeColorsToModel) {
        // Update hero model if it exists
        if (window.heroModel) {
            window.applyThemeColorsToModel(window.heroModel);
        }
        
        // Update viewer model if it exists
        if (window.currentModel) {
            window.applyThemeColorsToModel(window.currentModel);
        }
    }
}

// Make functions available globally
window.getThemeColors = getThemeColors;
window.setTheme = setTheme;