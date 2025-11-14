import Props from './props.js';
import Character from './character.js';
import Objects from './objects.js';

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

  async handleKeyPress(ev) {
    const keyPressed = ev;
    if (keyPressed.key === 'e') {
      const activeObject = Objects.activeObject;
      const activeObjectState = Objects.activeObjectState;
      const objectProps = Props.getGameObject(activeObject);
      if (activeObject && activeObjectState !== 'paying' && objectProps) {
        pay = true;
        this.checkTutorial();
        await Objects.payPrice(activeObject, objectProps);
        await Objects.triggerFinalPayment(activeObject);
        await Objects.triggerUpdateForAllObjects();
      }
    }
  },

  update: function () {
    if (keys['ArrowLeft'] || keys['a']) {
      Character.moveLeft();
      left = true;
      this.checkTutorial();
      Objects.checkCollision();
    }
    if (keys['ArrowRight'] || keys['d']) {
      Character.moveRight();
      right = true;
      this.checkTutorial();
      Objects.checkCollision();
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