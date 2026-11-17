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
 * animated border, and on press a damped buzz, in-frame ripple, and (for SVG
 * covers that opt in) a short displacement pulse.
 *
 * Touch gets the light, press, ripple, and buzz — never hover-only behaviour.
 */
export function bindMediaFx(frame: HTMLElement, options: MediaFxOptions): () => void {
  const { tilt, magnetic, desktop, reduced } = options;
  const motion = desktop && !reduced;

  if (motion) {
    gsap.set(frame, { transformPerspective: 1100 });
  }

  const rotX = motion ? gsap.quickTo(frame, "rotationX", { duration: 0.6, ease: "power3.out" }) : null;
  const rotY = motion ? gsap.quickTo(frame, "rotationY", { duration: 0.6, ease: "power3.out" }) : null;
  const moveX = motion ? gsap.quickTo(frame, "x", { duration: 0.7, ease: "power3.out" }) : null;
  const moveY = motion ? gsap.quickTo(frame, "y", { duration: 0.7, ease: "power3.out" }) : null;

  let frameRequest = 0;
  let pendingX = 0.5;
  let pendingY = 0.5;
  let releaseTimer = 0;

  const paintLight = () => {
    frameRequest = 0;
    frame.style.setProperty("--mx", `${(pendingX * 100).toFixed(2)}%`);
    frame.style.setProperty("--my", `${(pendingY * 100).toFixed(2)}%`);
  };

  const track = (event: PointerEvent) => {
    const bounds = frame.getBoundingClientRect();
    pendingX = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
    pendingY = (event.clientY - bounds.top) / Math.max(bounds.height, 1);
    if (!frameRequest) {
      frameRequest = requestAnimationFrame(paintLight);
    }
    return bounds;
  };

  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      frame.classList.add("is-hot");
    }
  };

  const onMove = (event: PointerEvent) => {
    const bounds = track(event);
    if (event.pointerType !== "mouse" || !rotX || !rotY || !moveX || !moveY) {
      return;
    }
    const nx = pendingX - 0.5;
    const ny = pendingY - 0.5;
    rotY(nx * tilt * 2);
    rotX(-ny * tilt);
    moveX(nx * bounds.width * magnetic);
    moveY(ny * bounds.height * magnetic);
  };

  const settle = () => {
    rotX?.(0);
    rotY?.(0);
    moveX?.(0);
    moveY?.(0);
  };

  const onLeave = () => {
    frame.classList.remove("is-hot", "is-pressed");
    settle();
  };

  const pulseDistortion = () => {
    const group = frame.querySelector<SVGGElement>("[data-fx-distort]");
    const map = frame.querySelector<SVGFEDisplacementMapElement>("[data-fx-displace]");
    const filter = group?.dataset.fxDistort;
    if (!group || !map || !filter) {
      return;
    }
    group.setAttribute("filter", filter);
    gsap.killTweensOf(map);
    gsap.fromTo(
      map,
      { attr: { scale: 0 } },
      {
        keyframes: [
          { attr: { scale: 34 }, duration: 0.16, ease: "power2.out" },
          { attr: { scale: 0 }, duration: 0.6, ease: "power3.out" },
        ],
        onComplete: () => {
          // Filters are costly; only keep one attached while it is visible.
          group.removeAttribute("filter");
        },
      },
    );
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    window.clearTimeout(releaseTimer);
    track(event);
    frame.classList.add("is-pressed");
    if (event.pointerType !== "mouse") {
      frame.classList.add("is-hot");
    }
    if (reduced) {
      return;
    }
    buzz(frame);
    spawnFrameRipple(frame, event.clientX, event.clientY);
    pulseDistortion();
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

  frame.addEventListener("pointerenter", onEnter);
  frame.addEventListener("pointermove", onMove);
  frame.addEventListener("pointerleave", onLeave);
  frame.addEventListener("pointerdown", onDown);
  frame.addEventListener("pointerup", onUp);
  frame.addEventListener("pointercancel", onUp);

  return () => {
    cancelAnimationFrame(frameRequest);
    window.clearTimeout(releaseTimer);
    frame.removeEventListener("pointerenter", onEnter);
    frame.removeEventListener("pointermove", onMove);
    frame.removeEventListener("pointerleave", onLeave);
    frame.removeEventListener("pointerdown", onDown);
    frame.removeEventListener("pointerup", onUp);
    frame.removeEventListener("pointercancel", onUp);
    frame.classList.remove("is-hot", "is-pressed");
    if (motion) {
      gsap.set(frame, { rotateX: 0, rotateY: 0, x: 0, y: 0 });
    }
  };
}
