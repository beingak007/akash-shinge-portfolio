import { gsap } from "../utils/gsap.ts";

export function vibrateViewport(): void {
  const root = document.getElementById("root");
  if (!root) {
    return;
  }
  gsap.fromTo(
    root,
    { x: 0, y: 0 },
    {
      keyframes: [
        { x: -5, y: 3, duration: 0.03 },
        { x: 6, y: -3, duration: 0.03 },
        { x: -4, y: -4, duration: 0.03 },
        { x: 5, y: 3, duration: 0.03 },
        { x: -3, y: 2, duration: 0.03 },
        { x: 0, y: 0, duration: 0.05 },
      ],
      ease: "none",
      overwrite: true,
    },
  );
}

export function strikeElement(element: HTMLElement): void {
  gsap.fromTo(
    element,
    { scale: 1, rotation: 0 },
    {
      keyframes: [
        { scale: 0.965, rotation: -0.85, duration: 0.045 },
        { scale: 1.025, rotation: 0.7, duration: 0.07 },
        { scale: 0.99, rotation: -0.28, duration: 0.055 },
        { scale: 1, rotation: 0, duration: 0.12 },
      ],
      ease: "power2.out",
      overwrite: false,
    },
  );
}

export function spawnClickBurst(x: number, y: number): void {
  const root = document.createElement("span");
  root.className = "click-burst";
  root.style.left = `${x}px`;
  root.style.top = `${y}px`;
  root.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 7; index += 1) {
    const speck = document.createElement("i");
    const angle = (Math.PI * 2 * index) / 7 + 0.2;
    const distance = 22 + (index % 3) * 10;
    speck.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    speck.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    root.appendChild(speck);
  }

  document.body.appendChild(root);
  window.setTimeout(() => {
    root.remove();
  }, 420);
}
