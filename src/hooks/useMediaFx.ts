import type { RefObject } from "react";
import { bindMediaFx } from "../animations/mediaFx.ts";
import { useGSAP } from "../utils/gsap.ts";
import { useDesktopPointer } from "./useDesktopPointer.ts";
import { useReducedMotion } from "./useReducedMotion.ts";

interface UseMediaFxOptions {
  tilt?: number;
  magnetic?: number;
  enabled?: boolean;
}

export function useMediaFx(
  ref: RefObject<HTMLElement | null>,
  { tilt = 7, magnetic = 0.035, enabled = true }: UseMediaFxOptions = {},
): void {
  const desktop = useDesktopPointer();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current || !enabled) {
        return;
      }
      return bindMediaFx(ref.current, { tilt, magnetic, desktop, reduced });
    },
    { dependencies: [desktop, reduced, tilt, magnetic, enabled], revertOnUpdate: true },
  );
}
