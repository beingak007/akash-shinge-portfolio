import type { CursorMode } from "../types/index.ts";
import { gsap } from "../utils/gsap.ts";

const labels: Record<CursorMode, string> = {
  default: "",
  hover: "",
  view: "VIEW CASE STUDY →",
  open: "OPEN",
  image: "AKASH / ENGINEER",
  drag: "DRAG",
  magnetic: "",
};

export function moveCursorDot(dot: HTMLElement, x: number, y: number): void {
  gsap.set(dot, { x, y });
}

export function moveCursorFollower(
  follower: HTMLElement,
  x: number,
  y: number,
): void {
  gsap.to(follower, {
    x,
    y,
    duration: 0.45,
    ease: "power3.out",
    overwrite: "auto",
  });
}

export function setCursorMode(
  follower: HTMLElement,
  label: HTMLElement,
  mode: CursorMode,
  customLabel?: string,
): void {
  const wide = mode === "view" || mode === "image";
  const scale = mode === "default" ? 1 : wide ? 2.15 : 1.7;
  const text = customLabel ?? labels[mode];

  gsap.to(follower, {
    scale,
    duration: 0.28,
    ease: "power3.out",
    overwrite: "auto",
  });

  label.textContent = text;
  gsap.to(label, {
    opacity: text ? 1 : 0,
    duration: 0.2,
    overwrite: "auto",
  });
}
