import Props from './props.js';
import UI from './ui.js';

export default {
  init: function () {
    this.initSceneObjects();
  },

  activeObject: null,
  activeObjectState: null,

  initSceneObjects: function () {
    const objectsContainer = document.getElementById('objects');
    const allObjects = Props.getGameObjects();
    for (const objKey in allObjects) {
      const obj = allObjects[objKey];
      objectsContainer.innerHTML += `
        <div id="${objKey}" class="object" style="right: ${obj.position}px; z-index: ${obj.zIndex};">
          <div class="back"></div>
          <div class="core"></div>
          <div class="coin-slots"></div>
          <div class="front"></div>
        </div>`;
      const slotContainerCore = document.getElementById(objKey).querySelector('.core');
      // add rubble image if needed
      if (obj.rubble) {
        slotContainerCore.innerHTML += `
            <img class="rubble" src="../img/objects/rubble-${obj.rubble}.png">`;
      }
      // add all preview and final images
      for (let i = 1; i <= obj.maxStages; i++) {
        if (i >= obj.stage) {
          slotContainerCore.innerHTML += `
            <img class="preview stage-${i}${i > obj.stage ? ' is--hidden' : ''}" src="../img/objects/${objKey}/${i}-preview.png">`;
        }
        if (obj.specialStage && i === obj.specialStage) {
          slotContainerCore.innerHTML += `
            <img class="preview special stage-${i}${i > obj.stage ? ' is--hidden' : ''}" src="../img/objects/${objKey}/${i}a-preview.png">`;
        }
        let finalAdditonalClassName;
        if (i < obj.stage) {
          finalAdditonalClassName = ' is--visible';
        } else if (i > obj.stage) {
          finalAdditonalClassName = ' is--hidden';
        } else {
          finalAdditonalClassName = '';
        }
        slotContainerCore.innerHTML += `
          <img class="final stage-${i}${finalAdditonalClassName}" src="../img/objects/${objKey}/${i}-final.png">`;
        if (obj.specialStage && i === obj.specialStage) {
          slotContainerCore.innerHTML += `
            <img class="final special stage-${i}${finalAdditonalClassName}" src="../img/objects/${objKey}/${i}a-final.png">`;
        }
      }
      // add coin slots for stage upgrade price     
      const slotContainerCoinSlots = document.getElementById(objKey).querySelector('.coin-slots');
      for (let i = 0; i < obj.stageCosts[obj.stage - 1]; i++) {
        const coinSlot = document.createElement('div');
        coinSlot.classList.add('coin-slot', 'unpaid');
        slotContainerCoinSlots.appendChild(coinSlot);
      }
    }
  },

  checkCollision: function () {
    const character = document.getElementById('character');
    const characterPosition = parseInt(character.style.right || '0px', 10);
    const allObjects = Props.getGameObjects();

    let anyActive = false;

    for (const objKey in allObjects) {
      const obj = allObjects[objKey];
      const objPosition = obj.position;
      if (characterPosition >= objPosition - 30 &&
        characterPosition <= objPosition + 100) {
        // when player is colliding with this object
        anyActive = true;
        if (!this.activeObject) {
          this.activeObject = objKey;
          const colliderObject = document.getElementById(objKey);
          colliderObject.classList.add('active');
          colliderObject.querySelector(`.preview.stage-${obj.stage}`)?.classList.add('is--visible');
        }
      } else if (this.activeObjectState !== 'paying') {
        // when player is NOT colliding with this object (implicit)
        // AND no object is in paying state
        document.getElementById(objKey).classList.remove('active');
      } else {
        // paying is "somewhere" running
        anyActive = true;
      }
    }
    if (!anyActive) {
      this.activeObject = null;
    }
  },

    sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async payPrice(activeObject, objectProps) {
    const obj = document.getElementById(activeObject);
    if (obj && objectProps) {
      // make sure player can pay the price
      if (objectProps.stageCosts[objectProps.stage - 1] > Props.getGameProp('coins')) {
        return;
      }
      this.activeObjectState = 'paying';
      const coinsContainer = document.getElementById('coins');
      const slotContainer = obj.querySelector('.coin-slots');
      if (obj.classList.contains('paying')) {
        return;
      }
      // start pay cycle
      obj.classList.add('paying');
      for (let i = 0; i < objectProps.stageCosts[objectProps.stage - 1]; i++) {
        const firstCoin = coinsContainer.querySelector('.coin');
        const firstUnpaidSlot = slotContainer.querySelector('.unpaid');
        if (!firstCoin || !firstUnpaidSlot) { 
          return;
        }
        Props.setGameProp('coins', Props.getGameProp('coins') - 1);
        firstCoin.style.width = '0';
        firstUnpaidSlot.style.transform = 'scale(0)';
        await this.sleep(300);
        UI.updateCoinsContainer();
        firstUnpaidSlot.classList.replace('unpaid', 'paid');
        firstUnpaidSlot.style.transform = 'scale(1)';
        await this.sleep(200);
      }
      await this.sleep(200);
    }
  },

  // final payment animation
  async triggerFinalPayment(activeObject) {
    const obj = document.getElementById(activeObject);
    if (obj) {
      const slotContainer = obj.querySelector('.coin-slots');
      if (!obj.classList.contains('paying') || !slotContainer) {
        return;
      }
      obj.classList.remove('active');
      obj.classList.replace('paying', 'upgraded');
      slotContainer.classList.add('done');
      slotContainer.querySelectorAll('.paid').forEach(el => {
        el.style.transform = 'scale(1.2)';
      });
    }
    this.activeObject = null;
    this.activeObjectState = null;
  },

  async triggerUpdateForAllObjects() {
    const allObjects = Props.getGameObjects();
    for (const objKey in allObjects) {
      const obj = allObjects[objKey];
      const objectElement = document.getElementById(objKey);
      if (objectElement.classList.contains('upgraded')) {
        const slotContainerCore = objectElement.querySelector('.core');
        // hide preview images for current stage
        slotContainerCore.querySelectorAll(`.stage-${obj.stage}`).forEach(el => {
          window.setTimeout(() => {
            if (el.classList.contains('preview')) el.remove();
          }, 600);
          if (el.classList.contains('final')) el.classList.add('is--visible');
        });
        await this.sleep(2000);
        // remove upgraded state
        slotContainerCore.querySelector('.rubble')?.remove();
        objectElement.classList.remove('upgraded');
        // activate new preview and final images for next stage
        obj.stage += 1;
        if (obj.stage > obj.maxStages) {
          objectElement.classList.add('completed');
        } else {
          slotContainerCore.querySelectorAll(`.stage-${obj.stage}`).forEach(el => {
            el.classList.remove('is--hidden');
          });
        }
        // fill coins slots for new price
        const slotContainerCoinSlots = objectElement.querySelector('.coin-slots');
        slotContainerCoinSlots.innerHTML = '';
        slotContainerCoinSlots.classList.remove('done');
        await this.sleep(500);
        for (let i = 0; i < obj.stageCosts[obj.stage - 1]; i++) {
          const coinSlot = document.createElement('div');
          coinSlot.classList.add('coin-slot', 'unpaid');
          slotContainerCoinSlots.appendChild(coinSlot);
        }
        this.checkCollision();
      }
    }
  },
};