import Props from './props.js';
import Character from './character.js';
import Objects from './objects.js';
import Visitors from './visitors.js';
import Audio from './audio.js';

// Object to track pressed keys
const keys = {};

export default {
  init: function () {
    this.initMovement();
    this.initOthers();
    // Start the loop
    requestAnimationFrame(() => this.update());
  },

  left: false, right: false, pay: false, eAgain: false, bus: false,

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
      if (this.pay === true) {
        this.eAgain = true;
        this.checkTutorial();
      }
      if (activeObject && activeObjectState !== 'paying' && objectProps) {
        this.pay = true;
        this.checkTutorial();
        await Objects.payPrice(activeObject, objectProps);
        await Objects.triggerFinalPayment(activeObject);
        await Objects.triggerUpdateForAllObjects();
      }
    } else if (keyPressed.key === 'b') {
      if (!Props.getGameProp('busPresent')) {
        // For testing: trigger bus arriving
        this.bus = true;
        this.checkTutorial();
        Visitors.triggerBusArrival();
      } else {
        Audio.sfx('nope', 0, 0.2);
      }
    }
  },

  update: function () {
    if (keys['ArrowLeft'] || keys['a']) {
      Character.moveLeft();
      this.left = true;
      this.checkTutorial();
      Objects.checkCollision();
    } else if (keys['ArrowRight'] || keys['d']) {
      Character.moveRight();
      this.right = true;
      this.checkTutorial();
      Objects.checkCollision();
    } else {
      Character.idle();
    }

    requestAnimationFrame(() => this.update());
  },

  checkTutorial: function () {
    if (!Props.getGameProp('tutorialDone')) {
      if (this.left && this.right)  {
        document.getElementById('tutorial-a-d').classList.add('done');
      }
      if (this.pay && !this.eAgain)  {
        document.getElementById('tutorial-e').classList.add('done');
        window.setTimeout(() => {
          // Check again before showing - if eAgain is now true, don't show it
          if (this.pay && !this.eAgain) {
            document.getElementById('tutorial-e-again').classList.add('show');
          }
        }, 5000);
      }
      if (this.eAgain && !this.bus)  {
        document.getElementById('tutorial-e-again').classList.remove('show');
        window.setTimeout(() => {
          // Check again before showing - if bus is now true, don't show it
          if (this.eAgain && !this.bus) {
            document.getElementById('tutorial-b')?.classList.add('show');
          }
        }, 4000);
      }
      if (this.bus) {
        document.getElementById('tutorial-b').classList.remove('show');
        Props.setGameProp('tutorialDone', true);
        window.setTimeout(() => {
          document.getElementById('tutorial-a-d').remove();
          document.getElementById('tutorial-e').remove();
          document.getElementById('tutorial-e-again').remove();
          document.getElementById('tutorial-b').remove();
        }, 2000);
      }
    }
  },
  
};