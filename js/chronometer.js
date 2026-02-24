/* ════════════════════════════════════════════════════════
   chronometer.js - Timer & Chronometer Widget
   ════════════════════════════════════════════════════════ */

class Chronometer {
  constructor() {
    this.startTime = null;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.intervalId = null;
    this.resumable = true;
  }

  start(duration = null) {
    if (this.isRunning) return;
    this.startTime = Date.now() - this.elapsedTime;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 100);
    Events.emit('chronometerStarted', { duration });
  }

  pause() {
    if (!this.isRunning) return;
    clearInterval(this.intervalId);
    this.isRunning = false;
    Events.emit('chronometerPaused', { elapsed: this.elapsedTime });
  }

  resume() {
    this.start();
  }

  stop() {
    clearInterval(this.intervalId);
    this.isRunning = false;
    this.elapsedTime = 0;
    this.startTime = null;
    this.updateDisplay();
    Events.emit('chronometerStopped');
  }

  reset() {
    this.stop();
  }

  tick() {
    this.elapsedTime = Date.now() - this.startTime;
    this.updateDisplay();
  }

  updateDisplay() {
    const display = DOM.q('.chronometer-display');
    if (display) {
      display.textContent = Format.duration(Math.floor(this.elapsedTime / 1000));
    }
  }

  getElapsed() {
    if (this.isRunning) return Date.now() - this.startTime;
    return this.elapsedTime;
  }

  formatElapsed() {
    return Format.duration(Math.floor(this.getElapsed() / 1000));
  }
}

const Chrono = new Chronometer();

function toggleChronometer() {
  if (Chrono.isRunning) Chrono.pause();
  else Chrono.resume();
}

function resetChronometer() {
  Chrono.reset();
}
