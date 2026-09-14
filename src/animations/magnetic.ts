import { gsap } from "../utils/gsap.ts";

export function bindMagnetic(
  element: HTMLElement,
  strength = 0.28,
): () => void {
  const onMove = (event: PointerEvent) => {
    const bounds = element.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.35,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const reset = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  element.addEventListener("pointermove", onMove);
  element.addEventListener("pointerleave", reset);
  return () => {
    element.removeEventListener("pointermove", onMove);
    element.removeEventListener("pointerleave", reset);
    gsap.set(element, { x: 0, y: 0 });
  };
}
