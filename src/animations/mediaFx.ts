import { gsap } from "../utils/gsap.ts";
import { buzz, spawnFrameRipple } from "./clickStrike.ts";

export interface MediaFxOptions {
  /** Max tilt in degrees at the frame edge (desktop mouse only). */
  tilt: number;
  /** Fraction of the pointer offset the frame drifts toward (desktop mouse only). */
  magnetic: number;
  desktop: boolean;
  reduced: boolean;
}

/**
 * Binds the shared image interaction model to a frame marked `.fx`:
 * hover lift + 3D tilt + magnetic drift + light that follows the pointer +
 * lit border, and on press a damped buzz and an in-frame ripple.
 *
 * Everything that moves per pointer event is a transform (compositor only):
 * no CSS variables, filters, or layout reads on pointermove beyond one
 * cached bounding box per hover.
 *
 * Touch gets the light, press, ripple, and buzz — never hover-only behaviour.
 */
export function bindMediaFx(frame: HTMLElement, options: MediaFxOptions): () => void {
  const { tilt, magnetic, desktop, reduced } = options;
  const motion = desktop && !reduced;
  const glare = frame.querySelector<HTMLElement>(".fx__glare");

  if (motion) {
    gsap.set(frame, { transformPerspective: 1100 });
  }

  const rotX = motion ? gsap.quickTo(frame, "rotationX", { duration: 0.6, ease: "power3.out" }) : null;
  const rotY = motion ? gsap.quickTo(frame, "rotationY", { duration: 0.6, ease: "power3.out" }) : null;
  const moveX = motion ? gsap.quickTo(frame, "x", { duration: 0.7, ease: "power3.out" }) : null;
  const moveY = motion ? gsap.quickTo(frame, "y", { duration: 0.7, ease: "power3.out" }) : null;
  const lightX = glare ? gsap.quickTo(glare, "x", { duration: 0.45, ease: "power3.out" }) : null;
  // Hover "distortion": the media leans into fast pointer movement, then settles.
  // A transform on the media layer — no filters, so it costs nothing to paint.
  const media = frame.querySelector<HTMLElement>("[data-fx-media]");
  const skew = motion && media ? gsap.quickTo(media, "skewX", { duration: 0.6, ease: "power3.out" }) : null;
  let lastPointerX: number | null = null;
  let settleTimer = 0;
  const lightY = glare ? gsap.quickTo(glare, "y", { duration: 0.45, ease: "power3.out" }) : null;

  // Measured once per hover / press; tilt does not change the layout box.
  let bounds: DOMRect | null = null;
  let releaseTimer = 0;

  const measure = () => {
    bounds = frame.getBoundingClientRect();
    return bounds;
  };

  const light = (event: PointerEvent, box: DOMRect, instant = false) => {
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (instant && glare) {
      gsap.set(glare, { x, y });
      return;
    }
    lightX?.(x);
    lightY?.(y);
  };

  const onEnter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    light(event, measure(), true);
    frame.classList.add("is-hot");
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    const box = bounds ?? measure();
    light(event, box);
    if (skew) {
      if (lastPointerX !== null) {
        skew(gsap.utils.clamp(-6, 6, (event.clientX - lastPointerX) * 0.4));
      }
      lastPointerX = event.clientX;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        skew(0);
      }, 110);
    }
    if (!rotX || !rotY || !moveX || !moveY) {
      return;
    }
    const nx = (event.clientX - box.left) / Math.max(box.width, 1) - 0.5;
    const ny = (event.clientY - box.top) / Math.max(box.height, 1) - 0.5;
    rotY(nx * tilt * 2);
    rotX(-ny * tilt);
    moveX(nx * box.width * magnetic);
    moveY(ny * box.height * magnetic);
  };

  const onLeave = () => {
    bounds = null;
    lastPointerX = null;
    window.clearTimeout(settleTimer);
    skew?.(0);
    frame.classList.remove("is-hot", "is-pressed");
    rotX?.(0);
    rotY?.(0);
    moveX?.(0);
    moveY?.(0);
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    window.clearTimeout(releaseTimer);
    const box = measure();
    frame.classList.add("is-pressed");
    if (event.pointerType !== "mouse") {
      light(event, box, true);
      frame.classList.add("is-hot");
    }
    if (reduced) {
      return;
    }
    buzz(frame);
    spawnFrameRipple(frame, box, event.clientX, event.clientY);
  };

  const onUp = (event: PointerEvent) => {
    frame.classList.remove("is-pressed");
    if (event.pointerType !== "mouse") {
      // Let the light linger briefly after a tap so the feedback is visible.
      releaseTimer = window.setTimeout(() => {
        frame.classList.remove("is-hot");
      }, 650);
    }
  };

  // Scrolling moves the frame under a still pointer (pinned gallery, Lenis).
  const onScroll = () => {
    bounds = null;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  frame.addEventListener("pointerenter", onEnter);
  frame.addEventListener("pointermove", onMove);
  frame.addEventListener("pointerleave", onLeave);
  frame.addEventListener("pointerdown", onDown);
  frame.addEventListener("pointerup", onUp);
  frame.addEventListener("pointercancel", onUp);

  return () => {
    window.clearTimeout(releaseTimer);
    window.clearTimeout(settleTimer);
    window.removeEventListener("scroll", onScroll);
    frame.removeEventListener("pointerenter", onEnter);
    frame.removeEventListener("pointermove", onMove);
    frame.removeEventListener("pointerleave", onLeave);
    frame.removeEventListener("pointerdown", onDown);
    frame.removeEventListener("pointerup", onUp);
    frame.removeEventListener("pointercancel", onUp);
    frame.classList.remove("is-hot", "is-pressed");
    if (motion) {
      gsap.set(frame, { rotateX: 0, rotateY: 0, x: 0, y: 0 });
      if (media) {
        gsap.set(media, { skewX: 0 });
      }
    }
  };
}
