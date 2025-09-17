/**
 * Version Check System
 * Ensures the correct version of the application is loaded
 */

class VersionChecker {
    constructor() {
        this.expectedVersion = 'modern';
        this.expectedFiles = {
            css: 'styles-modern.css',
            js: 'script-modern.js'
        };
        this.init();
    }

    init() {
        // Check if we're loading the correct files
        this.checkLoadedFiles();
        
        // Add version indicator to page
        this.addVersionIndicator();
        
        // Log version info for debugging
        this.logVersionInfo();
    }

    checkLoadedFiles() {
        const cssLink = document.querySelector('link[rel="stylesheet"]:not([href*="font-awesome"])');
        const jsScript = document.querySelector('script[src$=".js"]:not([src*="version-check"])');
        
        const cssFile = cssLink ? cssLink.href.split('/').pop() : 'unknown';
        const jsFile = jsScript ? jsScript.src.split('/').pop() : 'unknown';
        
        const isCorrectVersion = 
            cssFile === this.expectedFiles.css && 
            jsFile === this.expectedFiles.js;
        
        if (!isCorrectVersion) {
            console.error('❌ VERSION MISMATCH DETECTED!');
            console.error('Expected CSS:', this.expectedFiles.css, 'Got:', cssFile);
            console.error('Expected JS:', this.expectedFiles.js, 'Got:', jsFile);
            console.error('This indicates the wrong HTML file is being served!');
            
            // Show user-visible warning
            this.showVersionWarning();
        } else {
            console.log('✅ Version check passed - correct files loaded');
        }
    }

    addVersionIndicator() {
        // Add a small version indicator to the page (hidden by default)
        const indicator = document.createElement('div');
        indicator.id = 'version-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: #28a745;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-family: monospace;
                z-index: 9999;
                display: none;
            ">
                v${this.expectedVersion}
            </div>
        `;
        document.body.appendChild(indicator);
        
        // Show on hover over a specific area (for debugging)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                const indicator = document.getElementById('version-indicator');
                indicator.style.display = indicator.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    showVersionWarning() {
        const warning = document.createElement('div');
        warning.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #dc3545;
                color: white;
                padding: 10px;
                text-align: center;
                font-weight: bold;
                z-index: 10000;
                font-family: Arial, sans-serif;
            ">
                ⚠️ VERSION MISMATCH: Wrong files loaded! Check server configuration.
            </div>
        `;
        document.body.appendChild(warning);
    }

    logVersionInfo() {
        console.log('🔍 Version Check System Active');
        console.log('Expected version:', this.expectedVersion);
        console.log('Expected files:', this.expectedFiles);
        console.log('Press Ctrl+Shift+V to toggle version indicator');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VersionChecker());
} else {
    new VersionChecker();
}
