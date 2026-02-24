/* ════════════════════════════════════════════════════════
   music-player.js - Background Music Control
   ════════════════════════════════════════════════════════ */

class MusicPlayer {
  constructor() {
    this.isPlaying = false;
    this.currentTrack = 0;
    this.volume = 0.3;
    this.audioContext = null;
    this.oscillator = null;
    this.tracks = [
      { name: 'Focus', frequency: 528, duration: 3600 },
      { name: 'Calm', frequency: 432, duration: 3600 },
      { name: 'Energy', frequency: 639, duration: 3600 },
    ];
  }

  toggle() {
    if (this.isPlaying) this.stop();
    else this.play();
  }

  play() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.value = this.tracks[this.currentTrack].frequency;
    osc.type = 'sine';
    gain.gain.value = this.volume * 0.1;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    
    this.oscillator = osc;
    this.isPlaying = true;
    this.updateUI();
    Events.emit('musicToggled', { playing: true, track: this.currentTrack });
  }

  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
    this.isPlaying = false;
    this.updateUI();
    Events.emit('musicToggled', { playing: false });
  }

  nextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
    this.updateUI();
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    localStorage.setItem('musicVolume', this.volume);
  }

  updateUI() {
    const btn = DOM.q('.music-btn');
    if (btn) btn.textContent = this.isPlaying ? '⏸️' : '🎵';
  }

  init() {
    const saved = localStorage.getItem('musicVolume');
    if (saved) this.volume = parseFloat(saved);
    this.updateUI();
  }
}

const Music = new MusicPlayer();
document.addEventListener('DOMContentLoaded', () => Music.init());
