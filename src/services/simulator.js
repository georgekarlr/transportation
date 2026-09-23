/**
 * Navigation Simulator Service
 * Simulates real-time vehicle movement, speed, maneuvers, and progress along polyline
 */

export class NavigationSimulator {
  constructor() {
    this.route = null;
    this.isRunning = false;
    this.isPaused = false;
    this.speedMultiplier = 1;
    this.currentIndex = 0;
    this.subProgress = 0; // between currentIndex and currentIndex + 1
    this.timer = null;
    this.listeners = {
      update: [],
      stepChange: [],
      finish: [],
    };
    this.currentStepIndex = 0;
  }

  start(route, speedMultiplier = 1) {
    if (!route || !route.coordinates || route.coordinates.length < 2) return;
    this.stop();
    this.route = route;
    this.speedMultiplier = speedMultiplier;
    this.currentIndex = 0;
    this.subProgress = 0;
    this.currentStepIndex = 0;
    this.isRunning = true;
    this.isPaused = false;

    this.tick();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    this.isPaused = false;
    this.route = null;
    this.currentIndex = 0;
    this.subProgress = 0;
  }

  tick() {
    if (!this.isRunning) return;

    if (!this.isPaused && this.route) {
      const coords = this.route.coordinates;
      const totalPoints = coords.length;

      // Base step rate: advance proportional to route length and speed multiplier
      const stepIncrement = (0.04 * this.speedMultiplier);
      this.subProgress += stepIncrement;

      if (this.subProgress >= 1) {
        this.currentIndex += Math.floor(this.subProgress);
        this.subProgress = this.subProgress % 1;
      }

      if (this.currentIndex >= totalPoints - 1) {
        // Reached destination!
        const finalPoint = coords[totalPoints - 1];
        this.emit('update', {
          position: finalPoint,
          bearing: 0,
          speedKmh: 0,
          progressPercent: 100,
          remainingDistKm: 0,
          remainingTimeMin: 0,
          currentStep: this.route.steps ? this.route.steps[this.route.steps.length - 1] : null,
          isFinished: true,
        });
        this.emit('finish');
        this.stop();
        return;
      }

      // Interpolate position between coords[currentIndex] and coords[currentIndex+1]
      const p1 = coords[this.currentIndex];
      const p2 = coords[this.currentIndex + 1];
      const lat = p1[0] + (p2[0] - p1[0]) * this.subProgress;
      const lng = p1[1] + (p2[1] - p1[1]) * this.subProgress;
      const currentPos = [lat, lng];

      // Calculate bearing angle in degrees
      const bearing = this.calculateBearing(p1, p2);

      // Overall progress
      const progressFraction = (this.currentIndex + this.subProgress) / (totalPoints - 1);
      const progressPercent = Math.min(100, Math.round(progressFraction * 100));

      const remainingDistKm = Math.max(0, Math.round((this.route.distanceKm * (1 - progressFraction)) * 10) / 10);
      const remainingTimeMin = Math.max(0, Math.round(this.route.durationMin * (1 - progressFraction)));

      // Simulated speed
      const baseSpeed = this.route.steps && this.route.steps.length > 0 ? 38 : 45;
      const speedFluctuation = Math.sin(this.currentIndex * 0.8) * 8;
      const currentSpeed = Math.round(Math.max(15, (baseSpeed + speedFluctuation) * (this.speedMultiplier > 1 ? 1.2 : 1)));

      // Find current step
      const step = this.findCurrentStep(currentPos, progressFraction);

      this.emit('update', {
        position: currentPos,
        bearing,
        speedKmh: currentSpeed,
        progressPercent,
        remainingDistKm,
        remainingTimeMin,
        currentStep: step,
        isFinished: false,
      });
    }

    this.timer = setTimeout(() => this.tick(), 100);
  }

  findCurrentStep(currentPos, progressFraction) {
    if (!this.route.steps || this.route.steps.length === 0) return null;
    const steps = this.route.steps;
    const stepIdx = Math.min(steps.length - 1, Math.floor(progressFraction * steps.length));
    
    if (stepIdx !== this.currentStepIndex) {
      this.currentStepIndex = stepIdx;
      this.emit('stepChange', steps[stepIdx]);
    }
    return steps[stepIdx];
  }

  calculateBearing(start, end) {
    const startLat = (start[0] * Math.PI) / 180;
    const startLng = (start[1] * Math.PI) / 180;
    const endLat = (end[0] * Math.PI) / 180;
    const endLng = (end[1] * Math.PI) / 180;

    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const navigationSimulator = new NavigationSimulator();
