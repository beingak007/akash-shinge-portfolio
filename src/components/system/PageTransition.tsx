import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../utils/gsap.ts";
import { registerTransition } from "../../utils/transitionBridge.ts";
import "./PageTransition.css";

/**
 * Curtain used for long in-page jumps (nav → a distant section): cover, jump,
 * uncover. Short jumps still glide with Lenis.
 */
export function PageTransition() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    registerTransition((text, jump) => {
      const el = root.current;
      const panels = el?.querySelectorAll<HTMLElement>("[data-pt-panel]");
      const copy = el?.querySelector<HTMLElement>("[data-pt-copy]");
      if (!el || !panels || !copy || busy.current) {
        jump();
        return;
      }
      busy.current = true;
      if (label.current) {
        label.current.textContent = text;
      }

      gsap
        .timeline({
          onComplete: () => {
            busy.current = false;
            gsap.set(el, { visibility: "hidden" });
          },
        })
        .set(el, { visibility: "visible" })
        .fromTo(
          panels,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.55, ease: "power4.inOut", stagger: 0.07 },
        )
        .fromTo(
          copy,
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
          0.32,
        )
        .add(() => {
          jump();
          ScrollTrigger.update();
        })
        .to(copy, { yPercent: -120, opacity: 0, duration: 0.3, ease: "power2.in" }, "+=0.06")
        .to(
          [...panels].reverse(),
          { yPercent: -100, duration: 0.55, ease: "power4.inOut", stagger: 0.07 },
          "<0.1",
        );
    });
    return () => {
      registerTransition(null);
    };
  }, []);

  return (
    <div ref={root} className="pt" aria-hidden="true">
      <span className="pt__panel pt__panel--accent" data-pt-panel />
      <span className="pt__panel" data-pt-panel>
        <span className="pt__copy" data-pt-copy>
          <span className="pt__kicker">NAVIGATING TO</span>
          <span ref={label} className="pt__label" />
        </span>
      </span>
    </div>
  );
}
