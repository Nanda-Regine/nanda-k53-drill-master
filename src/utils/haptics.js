/**
 * Haptic feedback via Vibration API — Android Chrome only (silently ignored elsewhere).
 */

export function vibrate(pattern) {
  if (!navigator.vibrate) return;
  navigator.vibrate(pattern);
}

/** Short single tap — correct answer */
export function hapticCorrect() { vibrate(60); }

/** Double pulse — wrong answer */
export function hapticWrong() { vibrate([40, 30, 40]); }

/** Long success rumble — pass/complete */
export function hapticPass() { vibrate([80, 40, 80, 40, 120]); }

/** Quick tick — button press */
export function hapticTap() { vibrate(20); }
