var game = {
  coins: 15,
  characterPosition: 760,
  gamePaused: false,
  tutorialDone: false,
  busPresent: false,
};

const plants = [1, 1.7, 2.4, 3.1, 3.8, 4.5, 5.2, 5.9, 6.6, 7.3, 8, 8.7, 9.4, 10.1];

var gameObjects = {
  "bus-station": {
    position: 580,
    stage: 2,
    maxStages: 2,
    plants: [],
    stageCosts: [0, 2],
    zIndex: 1,
    touched: false,
  },
  fence: {
    position: 960,
    stage: 1,
    maxStages: 5,
    specialStage: 5,
    plants: [...plants],
    stageCosts: [3, 4, 2, 2, 5],
    rubble: 4,
    zIndex: 2,
    touched: false,
  },
  house: {
    position: 1220,
    stage: 1,
    maxStages: 2,
    plants: [],
    stageCosts: [9, 5],
    rubble: 1,
    zIndex: 1,
    touched: false,
  },
  billboard: {
    position: 300,
    stage: 1,
    maxStages: 2,
    plants: [...plants],
    stageCosts: [5, 3],
    rubble: 4,
    zIndex: 1,
    touched: false,
  },
  barn: {
    position: 1600,
    stage: 1,
    maxStages: 3,
    specialStage: 3,
    plants: [1, 1.7, 2.4, 3.1, 3.8, 4.5, 5.2, 7.3, 8, 8.7, 9.4, 10.1], /* leave out position 6 as it covers the cows head */
    stageCosts: [7, 3, 5],
    rubble: 1,
    zIndex: 1,
    touched: false,
  },
  orchard: {
    position: 2000,
    stage: 1,
    maxStages: 3,
    plants: [...plants],
    stageCosts: [3, 4, 5],
    rubble: 5,
    zIndex: 1,
    touched: false,
  },
  "garden-shed": {
    position: 2400,
    stage: 1,
    maxStages: 3,
    plants: [...plants],
    stageCosts: [6, 4, 3],
    rubble: 3,
    zIndex: 1,
    touched: false,
  },
  temple: {
    position: 2800,
    stage: 1,
    maxStages: 3,
    plants: [...plants],
    stageCosts: [7, 3, 3],
    rubble: 2,
    zIndex: 1,
    touched: false,
  },
  "wildflower-meadow": {
    position: 3100,
    stage: 1,
    maxStages: 3,
    plants: [...plants],
    stageCosts: [4, 3, 2],
    rubble: 1,
    zIndex: 1,
    touched: false,
  },
};

var visitors = {
  bernard: {
    name: 'Bernard',
    position: 340,
    wealthLevel: 2,
    interests: ['decoration', 'animals'],
    isVisiting: false,
    objectOfInterest: null,
    mode: 'searching',
    isWalking: false,
    emotion: 'happy',
  },
  violet: {
    name: 'Violet',
    position: 400,
    wealthLevel: 3,
    interests: ['flowers', 'decoration'],
    isVisiting: false,
    objectOfInterest: null,
    mode: 'searching',
    isWalking: false,
    emotion: 'thinking',
  },
  ziggy: {
    name: 'Ziggy',
    position: 460,
    wealthLevel: 1,
    interests: ['animals', 'flowers'],
    isVisiting: false,
    objectOfInterest: null,
    mode: 'searching',
    isWalking: false,
    emotion: 'searching',
  },
  edgar: {
    name: 'Edgar',
    position: 520,
    wealthLevel: 3,
    interests: ['peace', 'decoration'],
    isVisiting: false,
    objectOfInterest: null,
    mode: 'searching',
    isWalking: false,
    emotion: 'angry',
  },
  cletus: {
    name: 'Cletus',
    position: 580,
    wealthLevel: 1,
    interests: ['animals', 'nature'],
    isVisiting: false,
    objectOfInterest: null,
    mode: 'searching',
    isWalking: false,
    emotion: 'happy',
  },
  hazel: {
    name: 'Hazel',
    position: 640,
    wealthLevel: 2,
    interests: ['flowers', 'nature'],
    isVisiting: false,
    objectOfInterest: null,
    mode: 'searching',
    isWalking: false,
    emotion: 'alarmed',
  },
};

// Maps visitor interest categories to specific objects of interest
const interestsMapping = {
  animals: ['cow', 'dog-house', 'bees-hive'],
  decoration: ['bench', 'potted-flowers', 'windmill', 'garden-gnome', 'deco-boxes', 'kite', 'scarecrow', 'garden-tools'],
  flowers: ['sunflower', 'potted-flowers', 'fruit-tree', 'flower-meadow', 'wildflower-meadow'],
  peace: ['wildflower-meadow', 'bench'],
  nature: ['flower-meadow', 'fruit-tree', 'water-pump', 'wildflower-meadow', 'orchard'],
  food: ['vegetables', 'fruit-tree', 'orchard'],
};

// Defines how to satisfy each object of interest
// toBeImplemented: true marks items that have drawn assets but need stage assignment in game objects
const interestConditions = {
  'cow': { objectKey: 'barn', minStage: 3 },
  'sunflower': { objectKey: 'fence', minStage: 2 },
  'potted-flowers': [
    { objectKey: 'fence', minStage: 3 },
    { objectKey: 'house', minStage: 2 }
  ],
  'windmill': { objectKey: 'fence', minStage: 5 },
  'flower-meadow': { condition: 'anyObjectTouched' },
  
  // TODO: Assets ready, waiting for stage assignment
  'garden-tools': { objectKey: 'garden-shed', minStage: 1, toBeImplemented: true  },
  'vegetables': { objectKey: 'garden-shed', minStage: 2, toBeImplemented: true  },
  'stone-statue': { objectKey: 'temple', minStage: 3, toBeImplemented: true  },
  'wildflower-meadow': { objectKey: 'wildflower-meadow', minStage: 2, toBeImplemented: true  },
  'bench': { objectKey: 'wildflower-meadow', minStage: 2, toBeImplemented: true },
  'fruit-tree': { objectKey: 'orchard', minStage: 2, toBeImplemented: true  },
  'orchard': { objectKey: 'orchard', minStage: 3, toBeImplemented: true  },
  'dog-house': { objectKey: 'house', minStage: 2, toBeImplemented: true },
  'bees-hive': { objectKey: 'orchard', minStage: 3, toBeImplemented: true },
  'water-pump': { objectKey: 'garden-shed', minStage: 4, toBeImplemented: true },
  'nature-ghost': { objectKey: 'wildflower-meadow', minStage: 2, toBeImplemented: true },
  'deco-boxes': { objectKey: 'house', minStage: 2, toBeImplemented: true },
  'garden-gnome': { objectKey: 'garden-shed', minStage: 3, toBeImplemented: true },
  'kite': { objectKey: 'fence', minStage: 4, toBeImplemented: true },
  'scarecrow': { objectKey: 'orchard', minStage: 2, toBeImplemented: true },
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

  getVisitors: function () {
    return visitors;
  },

  getVisitor: function (visitorKey) {
    return visitors[visitorKey];
  },

  getInterestsMapping: function () {
    return interestsMapping;
  },

  getInterestConditions: function () {
    return interestConditions;
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