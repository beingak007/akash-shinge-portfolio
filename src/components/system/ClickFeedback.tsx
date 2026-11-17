import { useEffect } from "react";
import { buzz, spawnTapRipple } from "../../animations/clickStrike.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { haptic } from "../../utils/haptics.ts";

/** Interactive targets that earn feedback. Blank page clicks get none. */
const HIT = "button, a[href], [role='button'], [data-vibrate], [data-fx]";
const SKIP = "input, textarea, select, .skip-link, [data-no-vibrate]";

export function ClickFeedback() {
  const reduced = useReducedMotion();

  useEffect(() => {
    const target = (event: Event): HTMLElement | null => {
      const raw = event.target instanceof Element ? event.target : null;
      if (!raw || raw.closest(SKIP)) {
        return null;
      }
      const hit = raw.closest(HIT);
      return hit instanceof HTMLElement ? hit : null;
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      const hit = target(event);
      if (!hit || reduced) {
        return;
      }
      // Media frames ([data-fx]) draw their own ripple and press state.
      if (!hit.closest("[data-fx]")) {
        spawnTapRipple(event.clientX, event.clientY);
      }
      if (!hit.hasAttribute("data-physics-shake") && !hit.hasAttribute("data-fx")) {
        buzz(hit);
      }
    };

    // Vibration needs a completed user activation, which on touch only exists
    // after pointerup — so the haptic tick rides on click, not pointerdown.
    const onClick = (event: MouseEvent) => {
      if (target(event)) {
        haptic("tap");
      }
    };

    document.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown, { capture: true });
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [reduced]);

  return null;
}
