import Props from './props.js';
import Audio from './audio.js';

const bus = document.getElementById('bus');

export default {
  init: function () {
    this.initVisitors();
  },

  initVisitors: function () {
  },

  triggerBusArrival: function () {
    console.log('Bus is arriving');
    Audio.sfx('bus-arrival', 400);
    Audio.sfx('bus-beep-beep', 6400);
    bus.classList.add('is--arriving', 'is--driving');
    setTimeout(() => {
      bus.classList.replace('is--arriving', 'is--parked');
      bus.classList.remove('is--driving');
    }, 6000);
  }

};