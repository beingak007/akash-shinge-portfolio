import { getLenis } from "./lenisBridge.ts";

export function scrollToSection(id: string, reducedMotion: boolean): void {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  const lenis = getLenis();
  if (lenis && !reducedMotion) {
    lenis.scrollTo(target, { offset: 0 });
    return;
  }

  target.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}
