const characterElem = document.getElementById('character');
const boundary = 700;

import Visitors from './visitors.js';
import Props from './props.js';
import UI from './ui.js';

export default {

  walkingState: 'idle', /* also: walking-left, walking-right */

  init: function () {
    this.initWalkingAnimation();
  },

  initWalkingAnimation: function () {
    const frames = [-10, -85, -155, -240, -315, -390, -465];
    const frameDuration = 100; // ms per frame
    setInterval(() => {
      if (this.walkingState === 'walking-left' || this.walkingState === 'walking-right') {
        const frameIndex = Math.floor((Date.now() / frameDuration) % 7);
        characterElem.querySelector('.legs').style.backgroundPosition = frames[frameIndex] + 'px 0';
      } else {
        // Reset to idle position
        characterElem.querySelector('.legs').style.backgroundPosition = frames[0] + 'px 0';
      }
    }, 1000/30);
  },

  getCharacterPosition: function () {
    let characterPosition = characterElem.style.right || '0px';
    characterPosition = parseInt(characterPosition, 10);
    return characterPosition;
  },

  changeWalkingState: function (state) {
    this.walkingState = state;
    characterElem.className = state;
  },

  idle: function () {
    this.changeWalkingState('idle');
  },

  moveRight: function () {
    this.changeWalkingState('walking-right');
    const mainCanvas = document.querySelector('main');
    let characterPosition = this.getCharacterPosition();
    const characterRect = characterElem.getBoundingClientRect();
    const mainCanvasRight = parseInt(mainCanvas.style.right || '0px', 10);
    // small hack to allow movement at the edges
    if (mainCanvasRight === -5700) {
      mainCanvas.style.right = '-5699px';
    }
    if (mainCanvasRight < 380) {
      characterPosition -= 4;
      characterElem.style.right = `${characterPosition}px`;
      if (characterRect.right > window.innerWidth - boundary) {
        mainCanvas.style.right = (Math.min(mainCanvasRight + 4, 380)) + 'px';
      }
    }
    // Check for coin collisions
    this.checkCoinCollisions(characterPosition);
  },

  moveLeft: function () {
    this.changeWalkingState('walking-left');
    const mainCanvas = document.querySelector('main');
    let characterPosition = this.getCharacterPosition();
    const characterRect = characterElem.getBoundingClientRect();
    const mainCanvasRight = parseInt(mainCanvas.style.right || '0px', 10);
    // small hack to allow movement at the edges
    if (mainCanvasRight === 380) {
      mainCanvas.style.right = '379px';
    }
    if (mainCanvasRight >= -5700) {
      characterPosition += 4;
      characterElem.style.right = `${characterPosition}px`;
      if (characterRect.right < boundary) {
        mainCanvas.style.right = (Math.max(mainCanvasRight - 4, -5700)) + 'px';
      }
    }
    // Check for coin collisions
    this.checkCoinCollisions(characterPosition);
  },

  checkCoinCollisions: function (characterPosition) {
    const tolerance = 50; // collision distance tolerance
    const coinsToRemove = [];
    const mainCanvas = document.querySelector('main');
    const mainCanvasRight = parseInt(mainCanvas.style.right || '0px', 10);
    
    Visitors.activeCoins.forEach((coin, index) => {
      // Check if character position is within tolerance of coin position
      if (Math.abs(characterPosition - coin.position) <= tolerance) {
        // Add coin to removal list
        coinsToRemove.push(index);
        
        // Calculate target position: coins fly to center of UI deposit
        // The relationship: as canvas scrolls (right value changes), target moves inversely
        // target = -mainCanvasRight + offset, where offset accounts for viewport center
        const targetRight = -mainCanvasRight + (window.innerWidth / 2);
        
        // Trigger collection animation (coin flies to UI center)
        coin.element.classList.add('is--collected');
        coin.element.style.right = targetRight + 'px';
        
        // After animation completes (300ms), complete the collection
        setTimeout(() => {
          // Add to Props coins total
          const currentCoins = Props.getGameProp('coins');
          Props.setGameProp('coins', currentCoins + coin.value);
          
          // Update UI to reflect new coin total
          UI.updateCoinsContainer();
          
          console.log(`✨ Coin added to total! Total coins: ${Props.getGameProp('coins')}`);
        }, 300);
      }
    });
    
    // Remove collected coins from tracking (in reverse order to maintain indices)
    coinsToRemove.reverse().forEach(index => {
      const coin = Visitors.activeCoins[index];
      // Don't remove from DOM yet - let it animate first
      Visitors.activeCoins.splice(index, 1); // Remove from tracking array
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        coin.element.remove();
      }, 300);
    });
  }

};