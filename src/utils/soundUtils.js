/**
 * Web Audio API synthesizer + Hardware Vibration Haptics for tactile mobile micro-interactions
 * Generates smooth harmonic frequencies without external audio files.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // Mobile Hardware Vibration Haptic
  vibrate(pattern = 10, enabled = true) {
    if (!enabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  playPop(enabled = true, hapticsEnabled = true) {
    this.vibrate(8, hapticsEnabled);
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Audio playback not permitted or unavailable:', e);
    }
  }

  playComplete(enabled = true, hapticsEnabled = true) {
    this.vibrate([12, 30, 15], hapticsEnabled);
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      
      // Two-note arpeggio chord
      [
        { freq: 523.25, time: 0, dur: 0.12 },    // C5
        { freq: 659.25, time: 0.06, dur: 0.18 }, // E5
        { freq: 783.99, time: 0.12, dur: 0.25 }  // G5
      ].forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.12, now + note.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playCelebration(enabled = true, hapticsEnabled = true) {
    this.vibrate([20, 50, 20, 50, 40], hapticsEnabled);
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      // Fanfare notes: C5 -> E5 -> G5 -> C6
      const fanfare = [
        { freq: 523.25, start: 0, dur: 0.1 },
        { freq: 659.25, start: 0.08, dur: 0.1 },
        { freq: 783.99, start: 0.16, dur: 0.12 },
        { freq: 1046.50, start: 0.24, dur: 0.4 }
      ];

      fanfare.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.start);

        gain.gain.setValueAtTime(0.18, now + n.start);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.start);
        osc.stop(now + n.start + n.dur);
      });
    } catch (e) {
      console.warn('Audio celebration error:', e);
    }
  }
}

export const sound = new SoundEngine();
