import Props from './props.js';

export default {
  init: function () {
    this.initSceneObjects();
  },

  initSceneObjects: function () {
    const objectsContainer = document.getElementById('objects');
    const allObjects = Props.getGameObjects();
    for (const objKey in allObjects) {
      const obj = allObjects[objKey];
      objectsContainer.innerHTML += `
        <div id="${objKey}" class="object" style="right: ${obj.position}px;">
          <div class="back"></div>
          <div class="core">
            <img class="rubble" src="../img/objects/rubble-${obj.rubble}.png">
            <img class="preview" src="../img/objects/${objKey}/${obj.stage}-preview.png">
            <img class="final" src="../img/objects/${objKey}/${obj.stage}-final.png">
          </div>
          <div class="coin-slots">
            <div class="coin-slot unpaid"></div>
            <div class="coin-slot unpaid"></div>
            <div class="coin-slot unpaid"></div>
          </div>
          <div class="front"></div>
        </div>`;
    }
  },

  checkCollision: function () {
    const character = document.getElementById('character');
    const characterPosition = parseInt(character.style.right || '0px', 10);
    const allObjects = Props.getGameObjects();

    Props.setGameProp('activeObject', null);

    for (const objKey in allObjects) {
      const obj = allObjects[objKey];
      const objPosition = obj.position;
      if (characterPosition >= objPosition - 30 &&
        characterPosition <= objPosition + 100) {
        document.getElementById(objKey).classList.add('active');
        Props.setGameProp('activeObject', objKey);
      } else {
        document.getElementById(objKey).classList.remove('active');
      }
    }
  },

};