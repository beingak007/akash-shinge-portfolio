import { useEffect } from "react";
import {
  spawnClickBurst,
  strikeElement,
  vibrateViewport,
} from "../../animations/clickStrike.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { vibrateDevice } from "../../utils/haptics.ts";
import "./ClickFeedback.css";

const HIT = "button, a[href], [data-vibrate], [data-cursor], [data-magnetic]";
const SKIP = "input, textarea, select, .skip-link, [data-no-vibrate]";

export function ClickFeedback() {
  const reduced = useReducedMotion();

  useEffect(() => {
    let last = 0;
    const onDown = (event: Event) => {
      const pointer = event as PointerEvent | MouseEvent;
      if ("button" in pointer && pointer.button !== 0) {
        return;
      }
      const now = performance.now();
      if (now - last < 50) {
        return;
      }
      last = now;

      const raw = event.target instanceof Element ? event.target : document.body;
      if (raw.closest(SKIP)) {
        return;
      }

      vibrateDevice();
      vibrateViewport();

      if (!reduced) {
        spawnClickBurst(
          "clientX" in pointer ? pointer.clientX : 0,
          "clientY" in pointer ? pointer.clientY : 0,
        );
        const hit = raw.closest(HIT);
        if (hit instanceof HTMLElement && !hit.hasAttribute("data-physics-shake")) {
          strikeElement(hit);
        }
      }
    };

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("mousedown", onDown, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("mousedown", onDown, true);
    };
  }, [reduced]);

  return null;
}
