import { useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { markSiteReady } from "../../utils/siteReady.ts";
import "./PageLoader.css";

export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [done, setDone] = useState(reduced);

  useGSAP(
    () => {
      const finish = () => {
        markSiteReady();
        setDone(true);
      };

      if (reduced || !root.current) {
        finish();
        return;
      }

      const safety = window.setTimeout(finish, 2600);
      const q = gsap.utils.selector(root.current);
      const counter = { value: 0 };
      const count = root.current.querySelector<HTMLElement>("[data-loader-count]");

      const timeline = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(safety);
          finish();
        },
      });

      // Name rises, the line fills while the counter runs to 100, then the
      // screen splits open from the middle.
      timeline
        .fromTo(q("[data-loader-word]"), { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 }, 0)
        .fromTo(q("[data-loader-meta]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.1)
        .fromTo(q("[data-loader-fill]"), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power2.inOut" }, 0.12)
        .to(
          counter,
          {
            value: 100,
            duration: 1,
            ease: "power2.inOut",
            onUpdate: () => {
              if (count) {
                count.textContent = String(Math.round(counter.value)).padStart(3, "0");
              }
            },
          },
          0.12,
        )
        .to(q("[data-loader-content]"), { yPercent: -30, opacity: 0, duration: 0.35, ease: "power2.in" }, 1.18)
        .add(markSiteReady, 1.3)
        .to(q("[data-loader-panel='top']"), { yPercent: -100, duration: 0.75, ease: "power4.inOut" }, 1.28)
        .to(q("[data-loader-panel='bottom']"), { yPercent: 100, duration: 0.75, ease: "power4.inOut" }, 1.28);

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
      aria-label="Loading Akash Shinge's portfolio"
    >
      <span className="loader__panel loader__panel--top" data-loader-panel="top" />
      <span className="loader__panel loader__panel--bottom" data-loader-panel="bottom" />
      <div className="loader__content" data-loader-content>
        <p className="loader__kicker" data-loader-meta>
          INITIALIZING SYSTEM
        </p>
        <p className="loader__name" aria-hidden="true">
          <span className="loader__word">
            <span data-loader-word>Akash</span>
          </span>{" "}
          <span className="loader__word">
            <em data-loader-word>Shinge</em>
          </span>
        </p>
        <span className="loader__bar" aria-hidden="true">
          <span data-loader-fill />
        </span>
        <p className="loader__count" data-loader-meta aria-hidden="true">
          <span data-loader-count>000</span> / 100
        </p>
      </div>
    </div>
  );
}
