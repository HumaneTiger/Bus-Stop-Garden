import Props from './props.js';

export default {
  init: function () {
    this.initUI();
  },

  initUI: function () {
    if (window.location.href.includes('127.0.0.1')) {
      document.getElementById('foreground').style.display = 'none';
    }
  },

  payPrice: function () {
  },
};
