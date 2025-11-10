var game = {
  coins: 3,
  characterPosition: 760,
  gamePaused: false,
  activeObject: null,
};

const plants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var objects = {
  fence: {
    position: 960,
    stage: 1,
    plants: plants,
    stageCosts: [3, 5, 8],
    rubble: 4,
  },
  house: {
    position: 1230,
    stage: 2,
    plants: plants,
    stageCosts: [0, 10, 12],
    rubble: 1,
  },
  tickets: {
    position: 300,
    stage: 1,
    plants: plants,
    stageCosts: [10],
    rubble: 3,
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
    return objects;
  },

  getGameObject: function (prop) {
    return objects[prop];
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