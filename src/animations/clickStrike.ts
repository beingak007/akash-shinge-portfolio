/**
 * Visual tactile feedback: a damped buzz on the element that was pressed and a
 * thin ripple at the pointer. Subtle when a real haptic accompanies it,
 * clearly visible when it is the only feedback. Nothing moves the page itself.
 *
 * The buzz runs through the Web Animations API on the individual `translate`
 * / `rotate` properties: no forced reflow to restart it, and it composes with
 * GSAP-driven `transform` (tilt, magnetic) instead of fighting it.
 */
import { canFeelHaptics } from "../utils/haptics.ts";

/** Paired with a real haptic on phones: barely visible, the touch does the work. */
const BUZZ_SUBTLE: Keyframe[] = [
  { translate: "0 0", rotate: "0deg" },
  { translate: "-1.4px 0.5px", rotate: "-0.35deg", offset: 0.16 },
  { translate: "1.2px -0.5px", rotate: "0.28deg", offset: 0.34 },
  { translate: "-0.7px 0.3px", rotate: "-0.16deg", offset: 0.52 },
  { translate: "0.35px 0", rotate: "0.06deg", offset: 0.72 },
  { translate: "0 0", rotate: "0deg" },
];

/**
 * Laptops, desktops, and phones without vibration: the motion IS the
 * feedback, so it is clearly visible — on the pressed element only, never
 * the page.
 */
const BUZZ_VISIBLE: Keyframe[] = [
  { translate: "0 0", rotate: "0deg" },
  { translate: "-3px 1px", rotate: "-0.9deg", offset: 0.12 },
  { translate: "2.6px -1px", rotate: "0.75deg", offset: 0.28 },
  { translate: "-1.9px 0.6px", rotate: "-0.5deg", offset: 0.44 },
  { translate: "1.1px -0.3px", rotate: "0.25deg", offset: 0.62 },
  { translate: "-0.45px 0", rotate: "-0.1deg", offset: 0.8 },
  { translate: "0 0", rotate: "0deg" },
];

const running = new WeakMap<Element, Animation>();

export function buzz(element: Element): void {
  if (typeof element.animate !== "function") {
    return;
  }
  const felt = canFeelHaptics();
  running.get(element)?.cancel();
  running.set(
    element,
    element.animate(felt ? BUZZ_SUBTLE : BUZZ_VISIBLE, {
      duration: felt ? 280 : 380,
      easing: "cubic-bezier(0.3, 0.7, 0.4, 1)",
    }),
  );
}

export function spawnTapRipple(x: number, y: number): void {
  const ring = document.createElement("span");
  ring.className = "tap-ripple";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);
  window.setTimeout(() => {
    ring.remove();
  }, 520);
}

/** Ripple confined to a media frame, positioned in the frame's own coordinates. */
export function spawnFrameRipple(frame: HTMLElement, bounds: DOMRect, clientX: number, clientY: number): void {
  const size = Math.max(bounds.width, bounds.height) * 1.4;
  const ring = document.createElement("span");
  ring.className = "fx-ripple";
  ring.style.width = `${size}px`;
  ring.style.height = `${size}px`;
  ring.style.left = `${clientX - bounds.left - size / 2}px`;
  ring.style.top = `${clientY - bounds.top - size / 2}px`;
  ring.setAttribute("aria-hidden", "true");
  frame.appendChild(ring);
  window.setTimeout(() => {
    ring.remove();
  }, 820);
}
