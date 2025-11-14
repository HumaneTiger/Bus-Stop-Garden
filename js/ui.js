import Props from './props.js';

export default {
  init: function () {
    this.initUI();
  },

  initUI: function () {
    if (window.location.href.includes('127.0.0.1')) {
      //document.getElementById('foreground').style.display = 'none';
    }
    this.updateCoinsContainer();
  },

  updateCoinsContainer: function () {
    const coins = Props.getGameProp('coins');
    const coinsContainer = document.getElementById('coins');
    coinsContainer.innerHTML = '';
    coinsContainer.classList.remove('normal', 'few', 'many');
    if (coins > 16) {
      coinsContainer.classList.add('many');
    } else if (coins > 10) {
      coinsContainer.classList.add('normal');
    } else {
      coinsContainer.classList.add('few');
    }
    for (let i = 0; i < Math.min(coins, 25); i++) {
      const coin = document.createElement('div');
      coin.classList.add('coin');
      coinsContainer.appendChild(coin);
    }    
  },

};
