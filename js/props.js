var game = {
  coins: 10,
  characterPosition: 828,
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
    maxStages: 4,
    plants: [],
    stageCosts: [9, 5, 3, 5],
    rubble: 2,
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
    plants: [1, 1.7, 2.4, 3.1, 3.8, 4.5, 5.2, 7.3, 8, 8.7], /* leave out position 6 as it covers the cows head */
    stageCosts: [7, 3, 5],
    rubble: 1,
    zIndex: 1,
    touched: false,
  },
  orchard: {
    position: 2070,
    stage: 1,
    maxStages: 6,
    plants: [...plants],
    stageCosts: [3, 4, 5, 3, 4, 7],
    rubble: 5,
    zIndex: 1,
    touched: false,
  },
  shed: {
    position: 2420,
    stage: 1,
    maxStages: 4,
    plants: [...plants],
    stageCosts: [5, 4, 3, 2],
    rubble: 3,
    zIndex: 1,
    touched: false,
  },
  temple: {
    position: 2860,
    stage: 1,
    maxStages: 4,
    plants: [...plants],
    stageCosts: [8, 3, 3, 5],
    rubble: 2,
    zIndex: 2,
    touched: false,
  },
  bench: {
    position: 3220,
    stage: 1,
    maxStages: 3,
    plants: [...plants],
    stageCosts: [4, 3, 2],
    rubble: 4,
    zIndex: 1,
    touched: false,
  },
};

var comments = [
  {
    object: 'billboard',
    stage: 2,
    text: 'This should help visitors find us.',
  },
  {
    object: 'bus-station',
    stage: 2,
    text: 'A place to sit. Much better!',
  },
  {
    object: 'house',
    stage: 1,
    text: 'Home sweet home.',
  },
  {
    object: 'house',
    stage: 2,
    text: 'Everything’s better with flowers!',
  },
  {
    object: 'barn',
    stage: 3,
    text: 'Well hello there, moo cow!',
    sfx: 'moo',
  },
  {
    object: 'temple',
    stage: 1,
    text: 'Ooh, visitors will love this.',
  },
  {
    object: 'temple',
    stage: 3,
    text: 'Such a pretty colour!',
  },
  {
    object: 'orchard',
    stage: 3,
    text: 'The trees bring nice shade! Good for picnics.',
  },
  {
    object: 'fence',
    stage: 5,
    text: 'A windmill! How cool! Great for the farm!',
  },
  {
    object: 'orchard',
    stage: 6,
    text: 'Fresh fruits, grown with love and picked with care!',
  },
  {
    object: 'temple',
    stage: 4,
    text: 'Garden statues make great friends!',
  },
  {
    object: 'shed',
    stage: 2,
    text: 'The soil is healthy, look at how they grow!',
  },
  {
    object: 'bench',
    stage: 2,
    text: 'Ahhh, nice to have some shade to relax in.',
  },
  {
    object: 'bench',
    stage: 3,
    text: 'Such a beautiful day to fly a kite…',
  },
];


var visitors = {
  bernard: {
    name: 'Bernard',
    position: 340,
    wealthLevel: 2,
    interests: ['decoration', 'nature'],
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
    interests: ['flowers', 'comfort'],
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
    interests: ['food', 'comfort'],
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
    interests: ['peace', 'comfort'],
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
    interests: ['nature', 'decoration'],
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
    interests: ['flowers', 'peace'],
    isVisiting: false,
    objectOfInterest: null,
    mode: 'searching',
    isWalking: false,
    emotion: 'alarmed',
  },
};

// Maps visitor interest categories to specific objects of interest
const interestsMapping = {
  decoration: ['bench', 'windmill', 'garden-gnome', 'stone-statue', 'lantern'],
  comfort: ['potted-flowers', 'deco-boxes', 'kite', 'garden-tools'],
  flowers: ['sunflower', 'potted-flowers', 'flower-meadow'],
  peace: ['bench', 'windmill', 'stone-statue', 'cow', 'temple'],
  nature: ['flower-meadow', 'tree', 'cow'],
  food: ['vegetables', 'fruit-stand'],
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
  'tree': [
    { objectKey: 'orchard', minStage: 2 },
    { objectKey: 'bench', minStage: 2 }
  ],
  'windmill': { objectKey: 'fence', minStage: 5 },
  'flower-meadow': { condition: 'anyObjectTouched' },
  'lantern': { objectKey: 'temple', minStage: 2 },
  'garden-gnome': { objectKey: 'house', minStage: 4 },
  'fruit-stand': { objectKey: 'orchard', minStage: 5 },
  'deco-boxes': { objectKey: 'house', minStage: 3 },
  'stone-statue': { objectKey: 'temple', minStage: 4 },
  'garden-tools': { objectKey: 'shed', minStage: 3 },
  'vegetables': { objectKey: 'shed', minStage: 2 },
  'bench': { objectKey: 'bench', minStage: 1 },
  'kite': { objectKey: 'bench', minStage: 3 },
  'temple': { objectKey: 'temple', minStage: 1 },
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

  getComments: function () {
    return comments;
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