import Props from './props.js';
import Controls from './controls.js';
import Character from './character.js';
import Interactions from './interactions.js';
import Objects from './objects.js';
import Plants from './plants.js';
import Visitors from './visitors.js';
import Ui from './ui.js';
import Audio from './audio.js';

// Centralized module registry - add new modules here
const GAME_MODULES = [Props, Audio, Objects, Controls, Character, Interactions, Ui, Plants, Visitors];

// Image preloading with progress tracking
async function preloadImages(imagePaths, onProgress) {
  let loaded = 0;
  const total = imagePaths.length;

  const isLoadingContainer = document.getElementById('startscreen').querySelector('.is--loading');
  isLoadingContainer.style.opacity = '1';

  const results = await Promise.allSettled(
    imagePaths.map(
      (path) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            const progress = total > 0 ? loaded / total : 1;
            onProgress?.(progress, loaded, total);
            resolve(img);
          };
          img.onerror = () => {
            loaded++;
            const progress = total > 0 ? loaded / total : 1;
            onProgress?.(progress, loaded, total);
            reject(new Error(`Failed to load: ${path}`));
          };
          img.src = path;
        })
    )
  );

  return results;
}

async function initializeGame() {
  // List all images to preload
  // Organize by priority: critical first, deferred later
  const criticalImages = [
    './img/scene/clouds.png',
    './img/scene/fg.png',
    './img/scene/ground.png',
    './img/objects/rubble-1.png',
    './img/objects/rubble-2.png',
    './img/objects/rubble-3.png',
    './img/objects/rubble-4.png',
    './img/objects/rubble-5.png',
    './img/objects/thicket-1.png',
    './img/objects/thicket-2.png',
    './img/objects/thicket-3.png',
    './img/objects/thicket-front.png',
    './img/objects/grass-back.png',
    './img/objects/grass-front.png',
    './img/ui/coin.png',
    './img/ui/coin-slot.png',
    './img/ui/tutorial-a-d.png',
    './img/ui/tutorial-e.png',
    './img/character/hero-front.png',
    './img/character/hero-side.png',
    './img/character/walking-legs.png',
    './img/bus/body.png',
    './img/bus/wheel.png',
  ];

  const deferredImages = [
    // here go deferred, less important images
  ];

  try {
    // SYNC PROGRESS: Update any element with id="loading-progress"
    // The onProgress callback receives (progress: 0-1, loaded: number, total: number)
    // Example: <div id="loading-progress" style="width: 0%"></div>
    const onProgress = (progress, loaded, total) => {
      const progressElement = document.getElementById('loading-progress');
      if (progressElement) {
        progressElement.style.width = `${progress * 100}%`;
      }
      window.setTimeout(() => {
        const textElement = document.getElementById('loading-text');
        if (textElement) {
          textElement.textContent = `Loading... ${Math.round(progress * 100)}%`;
        }
      }, 1);
    };

    // Preload critical images first
    await preloadImages(criticalImages, onProgress);

    // Critical images loaded, proceed to initialize game
    //startGame();

    // Initialize all game modules
    GAME_MODULES.forEach((module) => module.init());

    window.setTimeout(() => {
      document.getElementById('startscreen').classList.add('loaded');
    }, 1000); // Delay to allow users to see the loaded state

    // Background load deferred images
    if (deferredImages.length > 0) {
      preloadImages(deferredImages, onProgress).catch(console.error);
    }
  } catch (error) {
    console.error('Critical image preload failed:', error);
    // Fallback: initialize anyway
    GAME_MODULES.forEach((module) => module.init());
  }
}

// Start the game after a delay to allow CSS background images to load naturally
const PRELOAD_DELAY_MS = 500; // Adjust this value based on your needs
window.setTimeout(() => {
  initializeGame();
}, PRELOAD_DELAY_MS);

function startGame() {
  const startscreen = document.getElementById('startscreen');
  if (startscreen) {
    // Request fullscreen mode
    const docElement = document.documentElement;
    if (docElement.requestFullscreen) {
      docElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    }
    startscreen.classList.add('starting');
    // Start ambient music loop
    Audio.music('ambient-1', 0, 0.5);
    window.setTimeout(() => {
      startscreen.remove();
      Character.saySomething('Ah! Grandpa was right, the farm is a mess!', 3500);
      window.setTimeout(() => {
        Character.saySomething('I best get to tidying it before visitors arrive.', 3500);
      }, 4000);
    }, 2000);
  }
}

// Handle start button click
document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-button');
  if (startButton) {
    startButton.addEventListener('click', () => {
      startGame();
    });
  }
});
