/**
 * Haptic ticks for taps and clicks.
 *
 * Where it can actually be felt:
 * - Android (Chrome, Samsung Internet, Firefox): the Vibration API.
 * - iPhone, iOS 18+: Safari has no Vibration API, but toggling a native
 *   `<input type="checkbox" switch>` plays the system haptic. A hidden one is
 *   toggled inside the user's tap.
 * - Laptops and desktops have no vibration motor; they get the visual press
 *   feedback in animations/clickStrike.ts instead (see `canFeelHaptics`).
 *
 * Every path runs only inside a genuine user interaction (click handlers),
 * is throttled for plain taps, and never throws.
 */
export type HapticKind = "tap" | "press" | "success";

/**
 * Vibration patterns in ms. Pulses under ~15 ms are below what many phone
 * motors can produce, so a tap is 25 ms: short, but actually felt.
 */
export const HAPTIC_PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 25,
  press: 40,
  success: [25, 60, 35],
};

let last = 0;
let iosSwitch: HTMLLabelElement | null = null;

export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function hasTouch(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/** iOS 18+ Safari: native switch controls exist (and play a haptic when toggled). */
function supportsIosSwitch(): boolean {
  return typeof HTMLInputElement !== "undefined" && "switch" in HTMLInputElement.prototype;
}

/** True when the visitor's device can physically feel a haptic from this page. */
export function canFeelHaptics(): boolean {
  return hasTouch() && (canVibrate() || supportsIosSwitch());
}

function iosTick(): boolean {
  if (!iosSwitch) {
    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.dataset.noVibrate = "";
    label.style.cssText =
      "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none;";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    iosSwitch = label;
  }
  // Toggling must not steal focus (e.g. from the terminal's input).
  const active = document.activeElement;
  iosSwitch.click();
  if (active instanceof HTMLElement && document.activeElement !== active) {
    active.focus({ preventScroll: true });
  }
  return true;
}

export function haptic(kind: HapticKind = "tap"): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  const now = performance.now();
  // Plain taps are throttled; outcome feedback always plays (vibrate() replaces a running pattern).
  if (kind === "tap" && now - last < 70) {
    return false;
  }

  if (canVibrate()) {
    // Calls before the first user gesture are blocked and log an intervention.
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
      return false;
    }
    last = now;
    try {
      return navigator.vibrate(HAPTIC_PATTERNS[kind]);
    } catch {
      // Some browsers expose vibrate() but reject the call.
      return false;
    }
  }

  if (supportsIosSwitch() && hasTouch()) {
    last = now;
    try {
      return iosTick();
    } catch {
      return false;
    }
  }
  return false;
}
