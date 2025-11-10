import Character from './character.js';

// Object to track pressed keys
const keys = {};
let left = false, right = false;

export default {
  init: function () {
    this.initMovement();
    // Start the loop
    requestAnimationFrame(() => this.update());
  },

  initMovement: function () {
    // Add key listeners
    document.addEventListener('keydown', (e) => {
      keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });
  },

  update: function () {
    if (keys['ArrowLeft'] || keys['a']) {
      Character.moveLeft();
      left = true;
      this.checkTutorial();
    }
    if (keys['ArrowRight'] || keys['d']) {
      Character.moveRight();
      right = true;
      this.checkTutorial();
    }

    requestAnimationFrame(() => this.update());
  },
  checkTutorial: function () {
    if (left && right)  {
      document.getElementById('tutorial-a-d').classList.add('done');
    }
  },
  
};