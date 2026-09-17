import { gsap } from "../utils/gsap.ts";

export function bindTilt3d(
  element: HTMLElement,
  strength = 9,
): () => void {
  const onMove = (event: PointerEvent) => {
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    gsap.to(element, {
      rotateY: x * strength * 2,
      rotateX: -y * strength,
      transformPerspective: 920,
      duration: 0.55,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const reset = () => {
    gsap.to(element, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  element.addEventListener("pointermove", onMove);
  element.addEventListener("pointerleave", reset);
  return () => {
    element.removeEventListener("pointermove", onMove);
    element.removeEventListener("pointerleave", reset);
    gsap.set(element, { rotateY: 0, rotateX: 0 });
  };
}
