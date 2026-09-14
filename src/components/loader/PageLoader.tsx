import { useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import "./PageLoader.css";

export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [done, setDone] = useState(reduced);

  useGSAP(
    () => {
      const finish = () => {
        setDone(true);
      };

      if (reduced || !root.current) {
        finish();
        return;
      }

      const safety = window.setTimeout(finish, 1100);
      const init = root.current.querySelector("[data-loader-init]");
      const ready = root.current.querySelector("[data-loader-ready]");

      const timeline = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(safety);
          finish();
        },
      });

      timeline
        .fromTo(init, { opacity: 0 }, { opacity: 1, duration: 0.22 })
        .to(init, { opacity: 0, duration: 0.16 }, 0.48)
        .fromTo(ready, { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0.5)
        .to(root.current, { yPercent: -100, duration: 0.42, ease: "power3.inOut" }, 0.78);

      return () => {
        window.clearTimeout(safety);
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  if (done) {
    return null;
  }

  return (
    <div
      ref={root}
      className="loader"
      role="status"
      aria-live="polite"
      aria-label="Initializing site"
    >
      <p className="loader__text" data-loader-init>
        INITIALIZING AKASH.SHINGE
      </p>
      <p className="loader__text loader__text--ready" data-loader-ready>
        SYSTEM READY
      </p>
    </div>
  );
}
