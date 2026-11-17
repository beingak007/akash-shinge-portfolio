import type { CursorMode } from "../types/index.ts";
import { gsap } from "../utils/gsap.ts";

const labels: Record<CursorMode, string> = {
  default: "",
  hover: "",
  view: "VIEW →",
  open: "OPEN",
  image: "AKASH / ENGINEER",
  drag: "DRAG",
  magnetic: "",
};

export interface CursorMover {
  move: (x: number, y: number) => void;
}

/** quickTo-based movers: one tween each, retargeted per event instead of re-created. */
export function createCursorMover(dot: HTMLElement, follower: HTMLElement): CursorMover {
  const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
  const followX = gsap.quickTo(follower, "x", { duration: 0.5, ease: "power3.out" });
  const followY = gsap.quickTo(follower, "y", { duration: 0.5, ease: "power3.out" });
  return {
    move: (x, y) => {
      dotX(x);
      dotY(y);
      followX(x);
      followY(y);
    },
  };
}

export function scaleFor(mode: CursorMode): number {
  if (mode === "default") {
    return 1;
  }
  return mode === "view" || mode === "image" ? 2.15 : 1.7;
}

export function setCursorMode(
  follower: HTMLElement,
  label: HTMLElement,
  mode: CursorMode,
  customLabel?: string,
): void {
  const text = customLabel ?? labels[mode];

  gsap.to(follower, {
    scale: scaleFor(mode),
    duration: 0.32,
    ease: "power3.out",
    overwrite: "auto",
  });

  follower.dataset.mode = mode;
  label.textContent = text;
  gsap.to(label, {
    opacity: text ? 1 : 0,
    duration: 0.2,
    overwrite: "auto",
  });
}

export function pressCursor(follower: HTMLElement, pressed: boolean): void {
  const base = scaleFor((follower.dataset.mode as CursorMode | undefined) ?? "default");
  gsap.to(follower, {
    scale: pressed ? base * 0.78 : base,
    duration: pressed ? 0.14 : 0.4,
    ease: pressed ? "power2.out" : "elastic.out(1, 0.5)",
    overwrite: "auto",
  });
}
