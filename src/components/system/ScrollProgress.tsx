import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../../utils/gsap.ts";
import "./ScrollProgress.css";

/** A hairline across the top that fills with the page's scroll progress (transform only). */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = bar.current;
    if (!el) {
      return;
    }
    const setScale = gsap.quickSetter(el, "scaleX");
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        setScale(self.progress);
      },
    });
  });

  return <div ref={bar} className="scroll-progress" aria-hidden="true" />;
}
