import { getLenis } from "./lenisBridge.ts";
import { getTransition } from "./transitionBridge.ts";

/** Jumps farther than this many viewports use the page transition instead of a long glide. */
const TRANSITION_DISTANCE = 1.6;

export function scrollToSection(id: string, reducedMotion: boolean, label?: string): void {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  const lenis = getLenis();
  const distance = Math.abs(target.getBoundingClientRect().top);
  const transition = getTransition();

  if (!reducedMotion && transition && distance > window.innerHeight * TRANSITION_DISTANCE) {
    transition(label ?? id.toUpperCase(), () => {
      if (lenis) {
        lenis.scrollTo(target, { immediate: true, force: true });
      } else {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
    return;
  }

  if (lenis && !reducedMotion) {
    lenis.scrollTo(target, { offset: 0 });
    return;
  }

  target.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}
