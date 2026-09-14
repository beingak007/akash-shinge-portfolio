import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, ScrollTrigger } from "../../utils/gsap.ts";
import { registerLenis } from "../../utils/lenisBridge.ts";

export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      registerLenis(null);
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
    });

    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      registerLenis(null);
    };
  }, [reduced]);

  return null;
}
