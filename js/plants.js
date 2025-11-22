import Props from './props.js';

export default {
  init: function () {
    this.initPlants();
  },

  initPlants: function () {
    // Set up 5000ms interval for growing new plants
    setInterval(() => {
      this.growNextPlant();
    }, 10000);
  },

  growNextPlant: function () {
    const allObjects = Props.getGameObjects();
    
    // Collect all objects that are eligible for plant growth
    const eligibleObjects = [];
    for (const objKey in allObjects) {
      const obj = allObjects[objKey];
      if (obj.touched && obj.plants && obj.plants.length > 0) {
        eligibleObjects.push(objKey);
      }
    }
    
    // If no eligible objects, do nothing
    if (eligibleObjects.length === 0) {
      return;
    }
    
    // Pick a random eligible object
    const randomObjKey = eligibleObjects[Math.floor(Math.random() * eligibleObjects.length)];
    const obj = allObjects[randomObjKey];
    
    // Pick a random plant slot from the available ones
    const randomSlotIndex = Math.floor(Math.random() * obj.plants.length);
    const plantSlotValue = obj.plants[randomSlotIndex];
    
    // Remove that slot from the array (it's now "used")
    obj.plants.splice(randomSlotIndex, 1);
    
    // Randomly decide if plant goes to background or foreground
    const isInForeground = Math.random() > 0.5;
    const containerId = isInForeground ? (randomObjKey + '-foreground') : randomObjKey;
    const containerElement = document.getElementById(containerId);
    const plantsContainer = containerElement.querySelector('.plants');
    
    const plantElement = document.createElement('div');
    plantElement.classList.add('plant');
    plantElement.style.left = (plantSlotValue * 10 - Math.floor(Math.random() * 5 + 1)) + '%';
    
    // Random plant image (1-10)
    const randomPlantNumber = Math.floor(Math.random() * 10) + 1;
    plantElement.style.backgroundImage = `url('./img/plants/plant-${randomPlantNumber}.png')`;
    
    // Random horizontal flip for visual variety
    const randomScaleX = Math.random() > 0.5 ? 1 : -1;
    plantElement.style.transform = `scaleX(${randomScaleX})`;
    
    // Random final size between 75% and 100%
    window.setTimeout(() => {
      const randomSize = (Math.random() * 25) + 75;
      plantElement.style.backgroundSize = `${randomSize}% ${randomSize}%`;
    }, 1000);
    
    plantsContainer.appendChild(plantElement);
  },

};