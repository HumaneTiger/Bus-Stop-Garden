var game = {
  coins: 30,
  characterPosition: 760,
  gamePaused: false,
};

const plants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var gameObjects = {
  "bus-station": {
    position: 580,
    stage: 2,
    maxStages: 2,
    plants: plants,
    stageCosts: [0, 2],
    zIndex: 1,
  },
  fence: {
    position: 960,
    stage: 1,
    maxStages: 5,
    specialStage: 5,
    plants: plants,
    stageCosts: [3, 4, 2, 2, 5],
    rubble: 4,
    zIndex: 2,
  },
  house: {
    position: 1178,
    stage: 1,
    maxStages: 2,
    plants: [],
    stageCosts: [9, 5],
    rubble: 1,
    zIndex: 1,
  },
  billboard: {
    position: 300,
    stage: 1,
    maxStages: 2,
    plants: plants,
    stageCosts: [5, 3],
    rubble: 4,
    zIndex: 1,
  },
  barn: {
    position: 1600,
    stage: 1,
    maxStages: 2,
    plants: plants,
    stageCosts: [7, 4],
    rubble: 1,
    zIndex: 1,
  },
  temple: {
    position: 2200,
    stage: 1,
    maxStages: 3,
    plants: plants,
    stageCosts: [7, 3, 3],
    rubble: 2,
    zIndex: 1,
  },
};

export default {
  init: function () {
  },

  getGameProp: function (prop) {
    return game[prop];
  },

  setGameProp: function (prop, value) {
    game[prop] = value;
  },

  getGameObjects: function () {
    return gameObjects;
  },

  getGameObject: function (prop) {
    return gameObjects[prop];
  },

  pauseGame: function (pause) {
    this.setGameProp('gamePaused', pause);
    if (pause) {
      document.body.classList.add('is--paused');
    } else {
      document.body.classList.remove('is--paused');
    }
  },
};