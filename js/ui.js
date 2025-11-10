import Props from './props.js';

export default {
  init: function () {
    this.initUI();
  },

  initUI: function () {
    if (window.location.href.includes('127.0.0.1')) {
      //document.getElementById('foreground').style.display = 'none';
    }
  },

  payPrice: function () {
    console.log(Props.getGameProp('activeObject'));
    if (Props.getGameProp('activeObject')) {
      const coinsContainer = document.getElementById('coins');
      const slotContainer = document.getElementById(Props.getGameProp('activeObject')).querySelector('.coin-slots');
      const firstCoin = coinsContainer.querySelector('.coin');
      const firstUnpaidSlot = slotContainer.querySelector('.unpaid');
      if (!firstCoin || !firstUnpaidSlot) {
        return;
      }
      firstCoin.style.transform = 'scale(0)';
      firstCoin.style.marginRight = '-42px';
      firstUnpaidSlot.style.transform = 'scale(0)';
      window.setTimeout(() => {
        coinsContainer.removeChild(firstCoin);
        firstUnpaidSlot.classList.replace('unpaid', 'paid');
        firstUnpaidSlot.style.transform = 'scale(1)';
      }, 300);
    }
  },
};
