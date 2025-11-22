import Props from './props.js';
import Audio from './audio.js';

const bus = document.getElementById('bus');
const visitorsContainer = document.getElementById('visitors-container');
const allVisitors = Props.getVisitors();
const interestMapping = Props.getInterestsMapping();
const interestConditions = Props.getInterestConditions();
const gameObjects = Props.getGameObjects();

export default {

  activeVisitorGroup: [],

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
      visitorsContainer.innerHTML += `<div class="visitor is--left-facing" id="${visitorKey}" style="right: ${visitor.position}px">
          <div class="body">
            <div class="arm"></div>
          </div>
          <div class="leg left-leg"></div>
          <div class="leg right-leg"></div>
        </div>`;
    });
  },

  triggerBusArrival: function () {
    
    this.activeVisitorGroup = this.createActiveVisitorGroup();
    console.log(this.activeVisitorGroup); // I will check this next

    Audio.sfx('bus-arrival', 400);
    Audio.sfx('bus-beep-beep', 6400);
    bus.classList.add('is--arriving', 'is--driving');
    setTimeout(() => {
      bus.classList.replace('is--arriving', 'is--parked');
      bus.classList.remove('is--driving');
    }, 6000);
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
        pauseEndTime: Date.now() + (Math.random() * 4000) + 2000, // Random initial pause 2-6 seconds
      };
    });

    return activeGroup;
  },

  generatePath: function (gameObjects, initialPosition) {
    // Create waypoint path: explore objects moving left through the farm
    // Visitors start at bus-station but path begins with actual objects to explore
    // Billboard is ignored (player-only)
    // When bus honks, they return to bus-station from wherever they are
    
    const generalOffset = 200;

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
    // This creates a natural "lingering" effect around objects
    const enrichedPath = [];
    
    for (let i = 0; i < path.length; i++) {
      const waypoint = path[i];
      enrichedPath.push(waypoint);
      
      // Add micro-movements around the waypoint (unless it's the last position)
      if (i < path.length - 1) {
        const nextWaypoint = path[i + 1];
        const offset = 30 + Math.random() * 40; // 30-70 pixel offset
        const direction = nextWaypoint > waypoint ? -1 : 1; // Offset opposite to travel direction
        
        // Add 2-3 positions that move back and forth
        const microSteps = 2 + Math.floor(Math.random() * 2); // 2-3 micro-movements
        for (let m = 0; m < microSteps; m++) {
          const offsetPos = waypoint + (direction * offset * (m % 2 === 0 ? 1 : -0.5)) + generalOffset;
          enrichedPath.push(Math.round(offsetPos));
        }
      }
    }
    
    // Add the initial position as the final waypoint (to return to where they started)
    enrichedPath.push(initialPosition);
    
    return enrichedPath;
  },

  updateVisitorMovement: function () {
    this.activeVisitorGroup.forEach(visitor => {
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
        // Start pause at this waypoint
        const pauseDuration = 1000 + Math.random() * 2000; // 1-3 seconds
        visitor.isPaused = true;
        visitor.pauseEndTime = Date.now() + pauseDuration;
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
  }

};