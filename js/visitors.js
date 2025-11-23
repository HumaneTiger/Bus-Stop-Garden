import Props from './props.js';
import Audio from './audio.js';

const bus = document.getElementById('bus');
const visitorsContainer = document.getElementById('visitors-container');
const collectiblesContainer = document.getElementById('collectibles');
const allVisitors = Props.getVisitors();
const interestMapping = Props.getInterestsMapping();
const interestConditions = Props.getInterestConditions();
const gameObjects = Props.getGameObjects();

const GENERAL_OFFSET = 200; // Applied to all waypoints and micro-movements during exploration

export default {

  activeVisitorGroup: [],
  activeCoins: [], // Track all spawned coins for collision detection

  init: function () {
    this.initVisitors();
    this.startMovementLoop();
  },

  movementInterval: null,

  startMovementLoop: function () {
    // Update and render visitors every 30ms (~33fps)
    this.movementInterval = setInterval(() => {
      this.updateVisitorMovement();
      this.renderVisitors();
    }, 30);
  },

  initVisitors: function () {
    this.createAllVisitors();
  },

  createAllVisitors: function () {
    Object.keys(allVisitors).forEach((visitorKey, index) => {
      const visitor = Props.getVisitor(visitorKey);
      visitorsContainer.innerHTML += `<div class="visitor is--left-facing is--hidden" id="${visitorKey}" style="right: ${visitor.position}px">
          <div class="body">
            <div class="arm"></div>
          </div>
          <div class="leg left-leg"></div>
          <div class="leg right-leg"></div>
          <div class="emotion">
            <div class="bubble">
              <img class="alarmed" src="./img/character/emotions/alarmed.png">
              <img class="angry" src="./img/character/emotions/angry.png">
              <img class="happy" src="./img/character/emotions/happy.png">
              <img class="searching" src="./img/character/emotions/searching.png">
              <img class="searching-for" src="./img/character/emotions/searching/unknown.png" alt="Unknown">
              <img class="thinking" src="./img/character/emotions/thinking.png">
            </div>
          </div>
        </div>`;
    });
  },

  triggerBusArrival: function () {
    
    this.activeVisitorGroup = this.createActiveVisitorGroup();
    console.log(this.activeVisitorGroup); // I will check this next

    Audio.sfx('bus-arrival', 400);
    Audio.sfx('bus-beep-beep', 6400);
    bus.classList.add('is--arriving', 'is--driving');
    
    // Show only selected visitors, hide the rest
    const selectedVisitorKeys = this.activeVisitorGroup.map(v => v.visitorKey);
    Object.keys(allVisitors).forEach(visitorKey => {
      const element = document.getElementById(visitorKey);
      if (element) {
        if (selectedVisitorKeys.includes(visitorKey)) {
          element.classList.remove('is--hidden');
        } else {
          element.classList.add('is--hidden');
        }
      }
    });
    
    // Store initial positions for entrance animation
    this.activeVisitorGroup.forEach(visitor => {
      visitor.entranceStartPosition = visitor.position;
      visitor.mode = 'exploring'; // Start in exploring mode
    });

    this.updateVisitorEntrance();
    
    // Animate visitors following the bus during arrival (6000ms)
    const entranceAnimationInterval = setInterval(() => {
      this.updateVisitorEntrance();
    }, 30); // Update every 30ms to match movement loop
    
    setTimeout(() => {
      bus.classList.replace('is--arriving', 'is--parked');
      bus.classList.remove('is--driving');
      clearInterval(entranceAnimationInterval);
    }, 6000);
    
    // Schedule recall after X minutes
    setTimeout(() => {
      this.recallVisitors();
    }, 0.3 * 60000); /* always keep 60000 as a reference for 1 minute */
  },

  recallVisitors: function () {
    // Bus honks and visitors get alarmed
    Audio.sfx('bus-beep-beep', 0);
    
    console.log(`🚌 BUS HONK! All visitors heading back to the bus!`);
    
    this.activeVisitorGroup.forEach(visitor => {
      // Set mode to returning
      visitor.mode = 'returning';
      // Increase speed for running
      visitor.speed = 4; // Double speed
      // Trigger alarmed emotion for 8 seconds (double duration)
      this.triggerEmotion(visitor, 'alarmed', 8000);
    });
  },

  updateVisitorEntrance: function () {
    // Get current bus position from computed styles
    const busComputedStyle = window.getComputedStyle(bus);
    const busCurrentRight = parseFloat(busComputedStyle.right) || 0;
    
    // Visitors follow the bus position directly
    // insideBusOffset shifts them inside the bus window
    const insideBusOffset = -270;
    
    this.activeVisitorGroup.forEach(visitor => {
      visitor.position = visitor.entranceStartPosition + busCurrentRight + insideBusOffset;
    });
    
    this.renderVisitors();
  },

  createActiveVisitorGroup: function () {

    // Random group size: 2-4 visitors for testing
    const groupSize = Math.floor(Math.random() * 3) + 2;
    const visitorKeys = Object.keys(allVisitors);
    const selectedKeys = [];
    
    // Randomly select unique visitors
    while (selectedKeys.length < groupSize && selectedKeys.length < visitorKeys.length) {
      const randomKey = visitorKeys[Math.floor(Math.random() * visitorKeys.length)];
      if (!selectedKeys.includes(randomKey)) {
        selectedKeys.push(randomKey);
      }
    }

    // Create visitor entries
    const activeGroup = selectedKeys.map(visitorKey => {
      const visitorConfig = allVisitors[visitorKey];
      
      // Pick random interest category from visitor's interests
      const interestCategory = visitorConfig.interests[
        Math.floor(Math.random() * visitorConfig.interests.length)
      ];
      
      // Get all possible interests for this category
      const possibleInterests = interestMapping[interestCategory] || [];
      
      // Find which interests are actually available (not toBeImplemented)
      const availableInterests = possibleInterests.filter(interest => {
        const condition = interestConditions[interest];
        return !condition?.toBeImplemented;
      });
      
      // Find which interests exist but are toBeImplemented
      const intendedInterests = possibleInterests.filter(interest => {
        const condition = interestConditions[interest];
        return condition?.toBeImplemented;
      });
      
      // Pick random intended (dream) and possible (achievable) interests
      const intendedInterest = intendedInterests.length > 0 
        ? intendedInterests[Math.floor(Math.random() * intendedInterests.length)]
        : null;
      
      const possibleInterest = availableInterests.length > 0
        ? availableInterests[Math.floor(Math.random() * availableInterests.length)]
        : possibleInterests[0]; // fallback
      
      // Get object key for the intended target (for debugging)
      const intendedCondition = interestConditions[intendedInterest];
      const intendedTargetObject = intendedCondition?.objectKey || null;
      
      // Calculate maxCoins based on wealth level
      const maxCoins = visitorConfig.wealthLevel * 3; // wealth multiplier
      
      return {
        visitorKey: visitorKey,
        name: visitorConfig.name,
        wealthLevel: visitorConfig.wealthLevel,
        maxCoins: maxCoins,
        coinsSpent: 0,
        objectOfInterest_intended: {
          name: intendedInterest,
          targetObject: intendedTargetObject,
          toBeImplemented: true,
        },
        objectOfInterest_possible: {
          name: possibleInterest,
          toBeImplemented: false,
        },
        interestCategory: interestCategory,
        found: false,
        mode: 'searching',
        position: visitorConfig.position,
        path: this.generatePath(gameObjects, visitorConfig.position),
        pathIndex: 0,
        isPaused: true,
        pauseEndTime: Date.now() + (Math.random() * 6000) + 6500, // Random initial pause 6.5-12.5 seconds
      };
    });

    return activeGroup;
  },

  generatePath: function (gameObjects, initialPosition) {
    // Create waypoint path: explore objects moving left through the farm
    // Visitors start at bus-station but path begins with actual objects to explore
    // Billboard is ignored (player-only)
    // When bus honks, they return to bus-station from wherever they are

    const objectKeys = Object.keys(gameObjects).filter(key => key !== 'billboard' && key !== 'bus-station');
    const objectsByPosition = objectKeys.map(key => ({
      key: key,
      position: gameObjects[key].position
    })).sort((a, b) => a.position - b.position);
    
    const path = [];
    
    // Add objects in sequence (left direction) with random wandering
    // Tendency is to progress left, but sometimes wander back (to the right)
    let currentIndex = 0;
    
    while (currentIndex < objectsByPosition.length) {
      path.push(objectsByPosition[currentIndex].position);
      
      // Chance to wander back one position to the right (30% chance)
      if (currentIndex > 0 && Math.random() < 0.3) {
        // Walk back to the previous object
        const wanderBackIndex = currentIndex - 1;
        path.push(objectsByPosition[wanderBackIndex].position);
      }
      
      currentIndex++;
    }
    
    // When they reach the end, they will wander back a few stations
    // Start from a few stations before the end and work back toward entry
    if (objectsByPosition.length > 3) {
      // Start from position before last
      const startWanderIndex = objectsByPosition.length - 2;
      // Go back 3-4 stations from there
      const wanderDistance = Math.floor(Math.random() * 2) + 3; // 3 or 4
      
      for (let i = 0; i < wanderDistance && startWanderIndex - i >= 0; i++) {
        path.push(objectsByPosition[startWanderIndex - i].position);
      }
    }
    
    // Second pass: expand each position with back-and-forth movements for exploration
    // Visitors explore around each object BEFORE reaching the exact center position
    // This creates a natural "lingering" effect and delays collision detection
    const enrichedPath = [];
    
    for (let i = 0; i < path.length; i++) {
      const waypoint = path[i];
      
      // Add micro-movements BEFORE the exact waypoint (unless it's the last position)
      if (i < path.length - 1) {
        const nextWaypoint = path[i + 1];
        const offset = 150 + Math.random() * 200; // 150-350 pixel offset
        const direction = nextWaypoint > waypoint ? -1 : 1; // Offset opposite to travel direction
        
        // Add 2-3 positions that move back and forth with offset
        const microSteps = 2 + Math.floor(Math.random() * 2); // 2-3 micro-movements
        for (let m = 0; m < microSteps; m++) {
          const offsetPos = waypoint + (direction * offset * (m % 2 === 0 ? 1 : -0.5)) + GENERAL_OFFSET;
          enrichedPath.push(Math.round(offsetPos));
        }
      }
      
      // Then add the exact waypoint position (with offset for consistency)
      enrichedPath.push(Math.round(waypoint + GENERAL_OFFSET));
    }
    
    // Add the initial position as the final waypoint (to return to where they started) - no offset
    enrichedPath.push(initialPosition);
    
    return enrichedPath;
  },

  updateVisitorMovement: function () {
    this.activeVisitorGroup.forEach(visitor => {
      // Handle returning mode - direct path back to bus station
      if (visitor.mode === 'returning') {
        const currentPos = visitor.position;
        const targetPos = visitor.entranceStartPosition;
        const speed = visitor.speed || 4; // Use custom speed if set (for running)
        const tolerance = 5;
        
        // Check if reached starting position (bus station)
        if (Math.abs(currentPos - targetPos) <= tolerance) {
          visitor.position = targetPos; // Snap to exact position
          visitor.isPaused = true; // Stop moving
          visitor.direction = 'right';
          return; // Stay at bus station
        }
        
        // Move toward bus station
        visitor.isPaused = false; // Always moving when returning
        if (currentPos > targetPos) {
          visitor.position -= speed;
          visitor.direction = 'left'; // moving left toward bus
        } else {
          visitor.position += speed;
          visitor.direction = 'right'; // moving right toward bus
        }
        return; // Skip normal pathfinding for returning visitors
      }
      
      // Normal exploration mode
      // Skip if no path or path complete
      if (!visitor.path || visitor.pathIndex >= visitor.path.length) {
        return;
      }

      // Handle pause state
      if (visitor.isPaused && visitor.pauseEndTime) {
        if (Date.now() < visitor.pauseEndTime) {
          return; // Still paused, skip movement
        } else {
          // Pause is over, resume walking
          visitor.isPaused = false;
          visitor.pauseEndTime = null;
        }
      }

      const targetPos = visitor.path[visitor.pathIndex];
      const currentPos = visitor.position;
      const speed = 2; // pixels per frame
      const tolerance = 5; // within 5px counts as reached

      // Check if reached waypoint
      if (Math.abs(currentPos - targetPos) <= tolerance) {
        // Check for collision with objects at exact position
        this.checkCollision(visitor, targetPos);
        
        // Start pause at this waypoint
        const pauseDuration = 1000 + Math.random() * 2000; // 1-3 seconds
        visitor.isPaused = true;
        visitor.pauseEndTime = Date.now() + pauseDuration;
        
        // Log thinking state if they haven't found what they're looking for yet
        if (!visitor.found) {
          const rand = Math.random();
          
          if (rand < 0.6) { // 0.6
          } else if (rand < 0.8) { // 0.8
            // Trigger thinking emotion
            this.triggerEmotion(visitor, 'thinking');
          } else {
            // Trigger searching emotion
            const searchingFor = visitor.objectOfInterest_possible.name;
            this.triggerEmotion(visitor, 'searching', 4000, searchingFor);
          }
        }
        
        visitor.pathIndex++;
        return;
      }

      // Move toward target
      if (currentPos < targetPos) {
        visitor.position += speed;
        visitor.direction = 'right'; // moving right
      } else {
        visitor.position -= speed;
        visitor.direction = 'left'; // moving left
      }
    });
  },

  renderVisitors: function () {
    this.activeVisitorGroup.forEach(visitor => {
      const element = document.getElementById(visitor.visitorKey);
      if (!element) return;

      // Update position
      element.style.right = visitor.position + 'px';

      // Check if visitor reached the bus station area
      // If so, move them up into the bus, otherwise reset to default
      if (visitor.position <= 670) {
        element.classList.add('is--elevated');
      } else {
        element.classList.remove('is--elevated');
      }

      // Update direction
      if (visitor.direction === 'left') {
        element.classList.remove('is--left-facing');
        element.classList.add('is--right-facing');
      } else if (visitor.direction === 'right') {
        element.classList.remove('is--right-facing');
        element.classList.add('is--left-facing');
      }

      // Add/remove walking animation class based on pause state
      if (visitor.isPaused) {
        element.classList.remove('is--walking');
      } else {
        element.classList.add('is--walking');
      }
    });
    
    // Check if all visitors are back at their starting positions (bus boarded)
    if (this.activeVisitorGroup.length > 0 && this.activeVisitorGroup.every(v => v.mode === 'returning' && v.isPaused && v.position <= 670)) {
      console.log(`✨ All visitors boarded! Bus ready to depart.`);
      this.triggerBusDeparture();
    }
  },

  triggerBusDeparture: function () {
    // Add driving animations and reverse transition
    bus.classList.add('is--driving');
    bus.classList.add('is--leaving');
    
    console.log(`🚌 Bus departing! Visitors heading back off-screen...`);
    
    // Set all visitors to departure mode
    this.activeVisitorGroup.forEach(visitor => {
      visitor.mode = 'departing';
      visitor.isPaused = true; // they are seated
      visitor.direction = 'right';
    });
    
    // Sync visitors with bus during departure (6000ms)
    const departureAnimationInterval = setInterval(() => {
      this.updateVisitorDeparture();
    }, 30); // Update every 30ms to match movement loop
    
    setTimeout(() => {
      // Bus has left, hide all visitors and clear group
      this.activeVisitorGroup.forEach(visitor => {
        const element = document.getElementById(visitor.visitorKey);
        if (element) {
          element.classList.add('is--hidden');
        }
      });
      this.activeVisitorGroup = [];
      
      // Reset bus
      bus.classList.remove('is--driving');
      bus.classList.remove('is--leaving');
      bus.classList.remove('is--parked');
      
      console.log(`👋 Bus has left! Visitors are gone.`);
      clearInterval(departureAnimationInterval);
    }, 6000);
  },

  updateVisitorDeparture: function () {
    // Get current bus position from computed styles
    const busComputedStyle = window.getComputedStyle(bus);
    const busCurrentRight = parseFloat(busComputedStyle.right) || 0;
    
    // Visitors follow the bus position during departure
    // Use same offset as arrival for consistency
    const insideBusOffset = -270;
    
    this.activeVisitorGroup.forEach(visitor => {
      visitor.position = visitor.entranceStartPosition + busCurrentRight + insideBusOffset;
    });
    
    this.renderVisitors();
  },

  checkCollision: function (visitor, position) {
    // Check if this position matches any game object (accounting for GENERAL_OFFSET)
    const tolerance = 20; // tolerance for position matching
    
    // Find which object this position corresponds to
    let collidedObject = null;
    
    for (const [objectKey, objectData] of Object.entries(gameObjects)) {
      if (objectKey === 'billboard' || objectKey === 'bus-station') continue;
      
      const objectPos = objectData.position + GENERAL_OFFSET;
      if (Math.abs(position - objectPos) <= tolerance) {
        collidedObject = objectKey;
        break;
      }
    }
    
    // If collision happened, check if it matches visitor's interests
    if (collidedObject && !visitor.found) {
      const possibleObjectName = visitor.objectOfInterest_possible.name;
      const possibleCondition = interestConditions[possibleObjectName];
      
      if (possibleCondition) {
        // Handle array conditions (like 'potted-flowers' which can be multiple objects)
        const conditions = Array.isArray(possibleCondition) ? possibleCondition : [possibleCondition];
        
        // Check if any condition matches this collision
        let conditionMet = false;
        for (const condition of conditions) {
          // Check for special condition types
          if (condition.condition === 'anyObjectTouched') {
            // This interest is satisfied when an object got upgraded at least once
            if (gameObjects[collidedObject].touched) {
              conditionMet = true;
              break;
            }
          } else if (condition.objectKey === collidedObject) {
            // Standard object+stage check
            const objectStage = gameObjects[collidedObject].stage;
            if (objectStage >= condition.minStage) {
              conditionMet = true;
              break;
            }
          }
        }
        
        if (conditionMet) {
          // COLLISION DETECTED - Visitor found what they're looking for!
          visitor.found = true;
          
          // Calculate coins to drop based on object stage and visitor wealth
          const objectStage = gameObjects[collidedObject].stage;
          const coinsEarned = visitor.wealthLevel * objectStage;
          visitor.coinsSpent = coinsEarned;
          
          // Spawn coins around visitor position
          this.spawnCoins(visitor.position, coinsEarned);
          
          // Trigger happy emotion
          this.triggerEmotion(visitor, 'happy');
          
          // Console log the discovery
          console.log(`✨ ${visitor.name} found ${possibleObjectName}! Coins dropped: ${coinsEarned}`);
        }
      }
    }
  },

  spawnCoins: function (visitorPosition, coinsEarned) {
    // Create coin elements scattered around visitor position (horizontally)
    for (let i = 0; i < coinsEarned; i++) {
      // Random horizontal offset around visitor
      const offset = (Math.random() - 0.5) * 200; // -100 to +100px offset
      const coinRight = visitorPosition - 150 + offset;
      
      // Create coin element
      const coinElement = document.createElement('div');
      coinElement.className = 'coin';
      coinElement.style.right = coinRight + 'px';
      
      // Create coin data object for tracking
      const coinData = {
        element: coinElement,
        position: coinRight,
        value: 1 // Each coin is worth 1
      };
      
      // Track in active coins array
      this.activeCoins.push(coinData);
      
      // Add to DOM
      collectiblesContainer.appendChild(coinElement);
      
      console.log(`💰 Coin spawned at right: ${Math.round(coinRight)}px`);
    }
  },

  triggerEmotion: function (visitor, emotionState, duration = 4000, searchingFor = null) {
    // Clear any pending emotion timeout
    if (visitor.emotionTimeout) {
      clearTimeout(visitor.emotionTimeout);
    }
    
    // Update visitor's emotion state
    visitor.emotion = emotionState;
    
    // Apply emotion class to the DOM element
    const element = document.getElementById(visitor.visitorKey);
    if (!element) return;
    
    const emotionElement = element.querySelector('.emotion');
    if (!emotionElement) return;
    
    // Remove all previous emotion classes
    emotionElement.classList.remove('is--happy', 'is--angry', 'is--thinking', 'is--searching', 'is--alarmed');
    
    // Add the new emotion class
    if (emotionState) {
      emotionElement.classList.add(`is--${emotionState}`);
      
      // Update searching-for image if provided
      
      if (emotionState === 'searching' && searchingFor) {
        const searchingImg = emotionElement.querySelector('.searching-for');
        if (searchingImg) {
          searchingImg.src = `./img/character/emotions/searching/${searchingFor}.png`;
          searchingImg.alt = searchingFor;
        }
      }
      
      // Schedule emotion clear after duration
      visitor.emotionTimeout = setTimeout(() => {
        this.triggerEmotion(visitor, null);
      }, duration);
    }
  }

};