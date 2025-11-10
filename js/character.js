const characterElem = document.getElementById('character');
const boundary = 700;

export default {
  init: function () {
  },

  getCharacterPosition: function () {
    let characterPosition = characterElem.style.right || '0px';
    characterPosition = parseInt(characterPosition, 10);
    return characterPosition;
  },

  moveRight: function () {
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