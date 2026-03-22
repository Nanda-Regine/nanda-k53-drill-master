/**
 * Web Audio API sound synthesizer — zero files, works offline, PWA-safe.
 * Sounds are generated procedurally. No HTTP requests.
 */

let ctx = null;

function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  // Resume on user gesture (iOS/Chrome require it)
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/**
 * Play a short synthesized tone.
 * @param {'correct'|'wrong'|'pass'|'streak'} type
 */
export function playSound(type) {
  const c = getCtx();
  if (!c) return;

  const now = c.currentTime;

  switch (type) {
    case 'correct': {
      // Rising two-note ding — satisfying, not annoying
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now); osc.stop(now + 0.3);
      break;
    }
    case 'wrong': {
      // Descending soft buzz — unpleasant enough to notice, not harsh
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now); osc.stop(now + 0.25);
      break;
    }
    case 'pass': {
      // Three ascending notes — "level complete" feel
      [523, 659, 784].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain); gain.connect(c.destination);
        osc.type = 'sine';
        const t = now + i * 0.12;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t); osc.stop(t + 0.3);
      });
      break;
    }
    case 'streak': {
      // Quick rising flourish for "on a roll"
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain); gain.connect(c.destination);
        osc.type = 'sine';
        const t = now + i * 0.07;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t); osc.stop(t + 0.22);
      });
      break;
    }
    default: break;
  }
}

/** Whether sound is enabled (respects user setting in localStorage) */
export function isSoundEnabled() {
  return localStorage.getItem('k53_sound') !== 'off';
}

export function setSoundEnabled(on) {
  localStorage.setItem('k53_sound', on ? 'on' : 'off');
}

/** Call this — only plays if user has sound on */
export function sfx(type) {
  if (isSoundEnabled()) playSound(type);
}
