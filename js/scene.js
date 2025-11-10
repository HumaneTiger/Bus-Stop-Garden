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
          <div class="core" style="background-image: url(../img/objects/rubble-${obj.rubble}.png"></div>
          <div class="front"></div>
        </div>`;
    }
  },

};