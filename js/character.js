const characterElem = document.getElementById('character');
const boundary = 700;

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
  },

};