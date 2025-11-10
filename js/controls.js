import Character from './character.js';
import Scene from './scene.js';
import Ui from './ui.js';

// Object to track pressed keys
const keys = {};
let left = false, right = false, pay = false;

export default {
  init: function () {
    this.initMovement();
    this.initOthers();
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

  initOthers: function () {
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });
  },

  handleKeyPress: function (ev) { 
    const keyPressed = ev;
    if (keyPressed.code === 'ArrowDown' || keyPressed.key === 'e' || keyPressed.key === 's') {
      Ui.payPrice();
      pay = true;
      this.checkTutorial();
    }
  },

  update: function () {
    if (keys['ArrowLeft'] || keys['a']) {
      Character.moveLeft();
      left = true;
      this.checkTutorial();
      Scene.checkCollision();
    }
    if (keys['ArrowRight'] || keys['d']) {
      Character.moveRight();
      right = true;
      this.checkTutorial();
      Scene.checkCollision();
    }

    requestAnimationFrame(() => this.update());
  },
  checkTutorial: function () {
    if (left && right)  {
      document.getElementById('tutorial-a-d').classList.add('done');
    }
    if (pay)  {
      document.getElementById('tutorial-e').classList.add('done');
    }
  },
  
};