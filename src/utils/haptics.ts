/**
 * Short, premium haptic ticks. The Vibration API only exists on some mobile
 * browsers (Android Chrome / Firefox) and only works after a user gesture, so
 * every call is guarded and silently becomes a no-op elsewhere. The visual
 * fallback (a sub-2px "buzz") lives in animations/clickStrike.ts.
 */
export type HapticKind = "tap" | "press" | "success";

const patterns: Record<HapticKind, number | number[]> = {
  tap: 8,
  press: 14,
  success: [10, 50, 16],
};

let last = 0;

export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function haptic(kind: HapticKind = "tap"): boolean {
  if (!canVibrate()) {
    return false;
  }
  // Calls before the first user gesture are blocked and log an intervention.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
    return false;
  }
  const now = performance.now();
  if (now - last < 70) {
    return false;
  }
  last = now;
  try {
    return navigator.vibrate(patterns[kind]);
  } catch {
    // Some browsers expose vibrate() but reject the call.
    return false;
  }
}
