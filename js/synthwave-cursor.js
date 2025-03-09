/**
 * Simple Dot Cursor
 * A clean, minimal cursor with perfect alignment
 * Integrated with site themes
 */

document.addEventListener('DOMContentLoaded', function() {
  initSimpleCursor();
});

function initSimpleCursor() {
  // Create cursor elements
  const cursorContainer = document.createElement('div');
  cursorContainer.id = 'simple-cursor-container';
  document.body.appendChild(cursorContainer);
  
  // Create outer circle
  const cursorCircle = document.createElement('div');
  cursorCircle.id = 'cursor-circle';
  cursorContainer.appendChild(cursorCircle);
  
  // Create inner dot
  const cursorDot = document.createElement('div');
  cursorDot.id = 'cursor-dot';
  cursorContainer.appendChild(cursorDot);
  
  // Add styles
  addCursorStyles();
  
  // Track mouse position
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  
  // Update mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Add click effect
  document.addEventListener('mousedown', () => {
    cursorCircle.classList.add('clicking');
    cursorDot.classList.add('clicking');
  });
  
  document.addEventListener('mouseup', () => {
    cursorCircle.classList.remove('clicking');
    cursorDot.classList.remove('clicking');
  });
  
  // Add hover effect for interactive elements
  const interactiveElements = 'a, button, input[type="button"], input[type="submit"], .btn, .project-card, .tab-btn, .menu li a, .social-link, .neon-text, [role="button"], [tabindex="0"], [type="checkbox"], [type="radio"], select, option, .clickable, .interactive, label';
  
  document.querySelectorAll(interactiveElements).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorCircle.classList.add('hovering');
      cursorDot.classList.add('hovering');
    });
    
    el.addEventListener('mouseleave', () => {
      cursorCircle.classList.remove('hovering');
      cursorDot.classList.remove('hovering');
    });
    
    // Force hide default cursor with inline styles
    el.style.setProperty('cursor', 'none', 'important');
  });
  
  // Handle form inputs
  const formElements = 'input:not([type="button"]):not([type="submit"]), textarea, select';
  
  document.querySelectorAll(formElements).forEach(el => {
    el.addEventListener('focus', () => {
      cursorContainer.classList.add('hidden');
      document.body.classList.add('default-cursor');
    });
    
    el.addEventListener('blur', () => {
      cursorContainer.classList.remove('hidden');
      document.body.classList.remove('default-cursor');
    });
  });
  
  // Animation loop for smooth cursor
  function animateCursor() {
    if (!cursorContainer.classList.contains('hidden')) {
      // Smooth follow with easing
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      
      // Use transform instead of left/top for better performance
      cursorContainer.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }
    
    requestAnimationFrame(animateCursor);
  }
  
  // Hide default cursor
  document.body.style.cursor = 'none';
  
  // Listen for theme changes
  document.addEventListener('DOMContentLoaded', updateCursorForCurrentTheme);
  
  // Add theme change event listener for theme switcher
  const themeChangeObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        updateCursorForCurrentTheme();
      }
    });
  });
  
  themeChangeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  // Start animation
  animateCursor();
  
  // Initial theme update
  updateCursorForCurrentTheme();
}

// Add cursor styles
function addCursorStyles() {
  // Remove any existing cursor styles to prevent duplication
  const existingStyle = document.getElementById('simple-cursor-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = 'simple-cursor-styles';
  style.textContent = `
    /* Global important override for default cursor */
    * {
      cursor: none !important;
    }
    
    /* Only show default cursor for inputs and textareas */
    textarea, input[type="text"], input[type="email"], input[type="password"], 
    input[type="number"], input[type="search"], input[type="tel"], input[type="url"],
    [contenteditable="true"] {
      cursor: text !important;
    }
    
    /* Show default cursor for inputs */
    body.default-cursor, 
    body.default-cursor * {
      cursor: auto !important;
    }
    
    /* Cursor container */
    #simple-cursor-container {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
      /* This transform-origin ensures perfect alignment */
      transform-origin: 0 0;
      will-change: transform;
    }
    
    /* Circle cursor */
    #cursor-circle {
      position: absolute;
      top: -15px;
      left: -15px;
      width: 30px;
      height: 30px;
      border: 2px solid var(--highlight-color, #00F0FF);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--highlight-color, #00F0FF);
      transition: width 0.2s, height 0.2s, top 0.2s, left 0.2s, border-color 0.2s;
    }
    
    /* Dot cursor */
    #cursor-dot {
      position: absolute;
      top: -3px;
      left: -3px;
      width: 6px;
      height: 6px;
      background-color: var(--highlight-color, #00F0FF);
      border-radius: 50%;
      box-shadow: 0 0 5px var(--highlight-color, #00F0FF);
      transition: width 0.2s, height 0.2s, top 0.2s, left 0.2s, background-color 0.2s;
    }
    
    /* Hover state */
    #cursor-circle.hovering {
      width: 40px;
      height: 40px;
      top: -20px;
      left: -20px;
      border-color: var(--accent-color, #FF41B4);
      box-shadow: 0 0 15px var(--accent-color, #FF41B4);
    }
    
    #cursor-dot.hovering {
      width: 8px;
      height: 8px;
      top: -4px;
      left: -4px;
      background-color: var(--accent-color, #FF41B4);
      box-shadow: 0 0 8px var(--accent-color, #FF41B4);
    }
    
    /* Click state */
    #cursor-circle.clicking {
      width: 20px;
      height: 20px;
      top: -10px;
      left: -10px;
      border-width: 3px;
    }
    
    #cursor-dot.clicking {
      width: 8px;
      height: 8px;
      top: -4px;
      left: -4px;
    }
    
    /* Hidden state */
    #simple-cursor-container.hidden {
      opacity: 0;
      visibility: hidden;
    }
    
    /* Media query for mobile */
    @media (max-width: 768px) {
      #simple-cursor-container {
        display: none;
      }
      
      body, body * {
        cursor: auto !important;
      }
    }
    
    /* Theme-specific cursor styles */
    
    /* Default Cyberpunk Neon */
    #cursor-circle {
      border-color: var(--highlight-color, #00F0FF);
      box-shadow: 0 0 10px var(--highlight-color, #00F0FF);
    }
    
    #cursor-dot {
      background-color: var(--highlight-color, #00F0FF);
      box-shadow: 0 0 5px var(--highlight-color, #00F0FF);
    }
    
    /* Brownish theme */
    [data-theme="brownish"] #cursor-circle {
      border-color: var(--highlight-color, #F1DAC4);
      box-shadow: 0 0 10px var(--highlight-color, #F1DAC4);
    }
    
    [data-theme="brownish"] #cursor-dot {
      background-color: var(--highlight-color, #F1DAC4);
      box-shadow: 0 0 5px var(--highlight-color, #F1DAC4);
    }
    
    /* Green theme */
    [data-theme="green"] #cursor-circle {
      border-color: var(--highlight-color, #CCFF99);
      box-shadow: 0 0 10px var(--highlight-color, #CCFF99);
    }
    
    [data-theme="green"] #cursor-dot {
      background-color: var(--highlight-color, #CCFF99);
      box-shadow: 0 0 5px var(--highlight-color, #CCFF99);
    }
    
    /* Dark theme */
    [data-theme="dark"] #cursor-circle {
      border-color: var(--highlight-color, #75E6DA);
      box-shadow: 0 0 10px var(--highlight-color, #75E6DA);
    }
    
    [data-theme="dark"] #cursor-dot {
      background-color: var(--highlight-color, #75E6DA);
      box-shadow: 0 0 5px var(--highlight-color, #75E6DA);
    }
    
    /* Vaporwave theme */
    [data-theme="vaporwave"] #cursor-circle {
      border-color: var(--highlight-color, #8BD3E6);
      box-shadow: 0 0 10px var(--highlight-color, #8BD3E6);
    }
    
    [data-theme="vaporwave"] #cursor-dot {
      background-color: var(--highlight-color, #8BD3E6);
      box-shadow: 0 0 5px var(--highlight-color, #8BD3E6);
    }
    
    /* Hover states for each theme */
    [data-theme="brownish"] #cursor-circle.hovering {
      border-color: var(--accent-color, #D4B483);
      box-shadow: 0 0 15px var(--accent-color, #D4B483);
    }
    
    [data-theme="brownish"] #cursor-dot.hovering {
      background-color: var(--accent-color, #D4B483);
      box-shadow: 0 0 8px var(--accent-color, #D4B483);
    }
    
    [data-theme="green"] #cursor-circle.hovering {
      border-color: var(--accent-color, #7FFF00);
      box-shadow: 0 0 15px var(--accent-color, #7FFF00);
    }
    
    [data-theme="green"] #cursor-dot.hovering {
      background-color: var(--accent-color, #7FFF00);
      box-shadow: 0 0 8px var(--accent-color, #7FFF00);
    }
    
    [data-theme="dark"] #cursor-circle.hovering {
      border-color: var(--accent-color, #3F84E5);
      box-shadow: 0 0 15px var(--accent-color, #3F84E5);
    }
    
    [data-theme="dark"] #cursor-dot.hovering {
      background-color: var(--accent-color, #3F84E5);
      box-shadow: 0 0 8px var(--accent-color, #3F84E5);
    }
    
    [data-theme="vaporwave"] #cursor-circle.hovering {
      border-color: var(--accent-color, #FF6AD5);
      box-shadow: 0 0 15px var(--accent-color, #FF6AD5);
    }
    
    [data-theme="vaporwave"] #cursor-dot.hovering {
      background-color: var(--accent-color, #FF6AD5);
      box-shadow: 0 0 8px var(--accent-color, #FF6AD5);
    }
  `;
  
  document.head.appendChild(style);
}

// Update cursor based on current theme
function updateCursorForCurrentTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'default';
  
  // Get computed CSS variables for the current theme
  const highlightColor = getComputedStyle(document.documentElement).getPropertyValue('--highlight-color').trim();
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
  
  // Apply colors to cursor elements
  updateCursorColors(highlightColor, accentColor);
}

// Update cursor colors
function updateCursorColors(highlightColor, accentColor) {
  const cursorCircle = document.getElementById('cursor-circle');
  const cursorDot = document.getElementById('cursor-dot');
  
  if (cursorCircle && cursorDot) {
    // Update normal state
    cursorCircle.style.borderColor = highlightColor;
    cursorCircle.style.boxShadow = `0 0 10px ${highlightColor}`;
    
    cursorDot.style.backgroundColor = highlightColor;
    cursorDot.style.boxShadow = `0 0 5px ${highlightColor}`;
  }
}

// Function to toggle the cursor
window.toggleSimpleCursor = function(enabled) {
  const cursorContainer = document.getElementById('simple-cursor-container');
  
  if (!cursorContainer) return;
  
  if (enabled === false) {
    cursorContainer.classList.add('hidden');
    document.body.classList.add('default-cursor');
  } else {
    cursorContainer.classList.remove('hidden');
    document.body.classList.remove('default-cursor');
  }
};

// Create cursor magnetism effect for specific elements
window.addCursorMagnetism = function(selector, strength = 0.5) {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from mouse to center
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      
      // Apply magnetism effect to cursor
      const cursorContainer = document.getElementById('simple-cursor-container');
      if (cursorContainer) {
        cursorContainer.style.transform = `translate3d(${centerX + distX * (1 - strength)}px, ${centerY + distY * (1 - strength)}px, 0)`;
      }
    });
    
    el.addEventListener('mouseleave', () => {
      // Reset magnetism effect
      const cursorContainer = document.getElementById('simple-cursor-container');
      if (cursorContainer) {
        // Let the animation loop handle cursor positioning
        cursorContainer.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
          cursorContainer.style.transition = '';
        }, 300);
      }
    });
  });
};