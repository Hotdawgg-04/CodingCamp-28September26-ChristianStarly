/**
 * Expense & Budget Visualizer
 * Main Application Logic
 * 
 * A mobile-friendly web application for tracking daily expenses.
 * Built with vanilla JavaScript ES6+, uses Local Storage for persistence,
 * and HTML5 Canvas for pie chart visualization.
 */

// ============================================================================
// Browser Compatibility Check
// ============================================================================

/**
 * Checks if the browser supports all required APIs for the application.
 * Tests for Local Storage availability and Canvas API support.
 * 
 * **Validates: Requirements 8.1, 8.2**
 * 
 * @returns {boolean} True if all required APIs are available, false otherwise
 */
function checkBrowserCompatibility() {
    // Test Local Storage availability
    const hasLocalStorage = (() => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })();

    // Test Canvas API availability
    const hasCanvas = !!document.createElement('canvas').getContext;

    return hasLocalStorage && hasCanvas;
}

/**
 * Displays an unsupported browser message to the user.
 * Creates a user-friendly warning overlay if required APIs are unavailable.
 */
function showUnsupportedBrowserMessage() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'browser-warning unsupported-browser';
    warningDiv.innerHTML = `
        <h2>Browser Not Supported</h2>
        <p>This application requires the following features to function:</p>
        <ul style="text-align: left; display: inline-block; margin: 16px 0;">
            <li>Local Storage</li>
            <li>Canvas API</li>
        </ul>
        <p>Please use one of the following supported browsers:</p>
        <p><strong>Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari</strong></p>
    `;
    
    // Insert at the beginning of the body
    document.body.insertBefore(warningDiv, document.body.firstChild);
    
    // Hide any app content that might have loaded
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'none';
    }
}

// ============================================================================
// Application Initialization
// ============================================================================

/**
 * Initializes the application after DOM is ready.
 * Performs browser compatibility check before proceeding.
 */
function initApp() {
    console.log('Expense & Budget Visualizer initialized');
    
    // Check browser compatibility before proceeding
    if (!checkBrowserCompatibility()) {
        console.error('Browser compatibility check failed');
        showUnsupportedBrowserMessage();
        return;
    }
    
    console.log('Browser compatibility check passed');
    
    // Application will be fully implemented in subsequent tasks
    // Additional initialization code will be added here
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
