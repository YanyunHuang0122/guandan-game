// app.js - Application entry point

let gameController;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    gameController = new GameController();
    console.log('Guandan game loaded!');
});

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.hand-cards')) {
        // Allow scrolling in hand cards
        return;
    }
    e.preventDefault();
}, { passive: false });

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
