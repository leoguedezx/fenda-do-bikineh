/* ════════════════════════════════════════════════════════
   audio.js - Web Audio API & Sound Effects
   ════════════════════════════════════════════════════════ */

class AudioEngine {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.volume = 0.35;
    this.isMuted = false;
  }

  playTone(frequency = 440, duration = 0.1, type = 'sine') {
    if (this.isMuted || this.volume === 0) return;
    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.frequency.value = frequency;
      osc.type = type;
      gain.gain.setValueAtTime(this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.error('Error playing tone:', e);
    }
  }

  playCorrect() {
    this.playTone(523, 0.1);
    setTimeout(() => this.playTone(659, 0.1), 100);
    setTimeout(() => this.playTone(784, 0.2), 200);
  }

  playWrong() {
    this.playTone(349, 0.15);
    setTimeout(() => this.playTone(330, 0.3), 150);
  }

  playSuccess() {
    this.playTone(523, 0.1);
    setTimeout(() => this.playTone(659, 0.1), 100);
    setTimeout(() => this.playTone(784, 0.15), 200);
  }

  playError() {
    this.playTone(200, 0.2);
    setTimeout(() => this.playTone(160, 0.2), 200);
  }

  playNotification() {
    this.playTone(880, 0.05);
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }
}

const Audio = new AudioEngine();
