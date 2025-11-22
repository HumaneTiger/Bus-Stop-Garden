import Props from './props.js';
import Controls from './controls.js';
import Character from './character.js';
import Interactions from './interactions.js';
import Objects from './objects.js';
import Plants from './plants.js';
import Visitors from './visitors.js';
import Ui from './ui.js';
import Audio from './audio.js';

let startHour = 7; // 7
let ticksPerHour = 6; // 6
let tickInterval = 100;
let tickCurrent = 0;

window.timeIsUnity = {
  gameTick: 0,
  gameHours: 24 + startHour,
  gameDays: 1, // 1
  todayHours: startHour,
  todayTime: `0${startHour}:00`,
};

// initialize everything
{
  Props.init();
  Audio.init();
  Objects.init();
  Controls.init();
  Character.init();
  Interactions.init();
  Ui.init();
  Plants.init();
  Visitors.init();
  bind();
  initiateMainGameLoop();
}

function bind() {
  /*
  new Binding({
    object: window.timeIsUnity,
    property: 'gameDays',
    element: document.getElementById('gametime-days'),
  });
  new Binding({
    object: window.timeIsUnity,
    property: 'todayTime',
    element: document.getElementById('gametime-hours'),
  });
  */
}

function triggerGameTick() {
  window.timeIsUnity.gameTick += 1;

  /* TICKY TASKS */
  if (window.timeIsUnity.gameTick % ticksPerHour === 0) {
    window.timeIsUnity.gameHours += 1;

    /* HOURLY TASKS */
    /* order matters */
    Props.hourlyTasks(window.timeIsUnity.todayHours);
    Ui.hourlyTasks(window.timeIsUnity.todayHours);
    Cards.hourlyTasks(window.timeIsUnity.todayHours);

    //Day.updateBrightness(timeIsUnity.todayHours);

    if (window.timeIsUnity.gameHours % 24 === 0) {
      window.timeIsUnity.gameDays += 1;

      /* DAILY TASKS */
      Ui.dailyTasks(window.timeIsUnity.gameDays);
    }
  }

  window.timeIsUnity.todayHours = window.timeIsUnity.gameHours - window.timeIsUnity.gameDays * 24;
  window.timeIsUnity.todayTime =
    window.timeIsUnity.todayHours < 10
      ? '0' + window.timeIsUnity.todayHours + ':'
      : window.timeIsUnity.todayHours + ':';
  window.timeIsUnity.todayTime += (window.timeIsUnity.gameTick % 6) + '0';
}

function initiateMainGameLoop() {
  window.setTimeout(() => {
    /* go foreward in time */
    tickCurrent += tickInterval;

    if (!Props.getGameProp('gamePaused')) {
      initiateMainGameLoop();
    } else {
      idleLoop();
    }
  }, tickInterval);
}

function idleLoop() {
  window.setTimeout(() => {
    if (!Props.getGameProp('gamePaused')) {
      initiateMainGameLoop();
    } else {
      idleLoop();
    }
  }, 500);
}
