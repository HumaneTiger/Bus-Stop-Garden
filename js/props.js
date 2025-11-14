var game = {
  coins: 30,
  characterPosition: 760,
  gamePaused: false,
};

const plants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var gameObjects = {
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
    plants: false,
    stageCosts: [9, 5],
    rubble: 1,
    zIndex: 1,
  },
  tickets: {
    position: 300,
    stage: 1,
    maxStages: 1,
    plants: plants,
    stageCosts: [10],
    rubble: 3,
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