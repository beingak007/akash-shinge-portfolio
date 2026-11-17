import { useRef } from "react";
import { coreSkillIds, technologies } from "../../data/technologies.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import type { Technology } from "../../types/index.ts";
import { gsap, ScrollTrigger, useGSAP } from "../../utils/gsap.ts";
import { TechLogo } from "../hero/TechLogo.tsx";
import "./SkillMarquee.css";

const skills = coreSkillIds
  .map((id) => technologies.find((tech) => tech.id === id))
  .filter((tech): tech is Technology => Boolean(tech));

const half = Math.ceil(skills.length / 2);
const rows = [skills.slice(0, half), skills.slice(half)];

/**
 * Two counter-moving rows of the core stack. Scroll velocity speeds them up,
 * scroll direction flips them, and the rows lean into fast scrolls.
 */
export function SkillMarquee() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !root.current) {
        return;
      }
      const tracks = gsap.utils.toArray<HTMLElement>("[data-marquee-track]");
      const loops = tracks.map((track, index) =>
        index % 2 === 0
          ? gsap.to(track, { xPercent: -50, ease: "none", duration: 46, repeat: -1, paused: true })
          : gsap.fromTo(
              track,
              { xPercent: -50 },
              { xPercent: 0, ease: "none", duration: 52, repeat: -1, paused: true },
            ),
      );
      const skew = gsap.quickTo(tracks, "skewX", { duration: 0.5, ease: "power3.out" });
      let direction = 1;

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          loops.forEach((loop) => {
            if (self.isActive) {
              loop.play();
            } else {
              loop.pause();
            }
          });
        },
        onUpdate: (self) => {
          direction = self.direction;
          const velocity = self.getVelocity();
          const speed = gsap.utils.clamp(1, 7, Math.abs(velocity) / 240);
          skew(gsap.utils.clamp(-7, 7, velocity / -320));
          loops.forEach((loop) => {
            gsap.to(loop, {
              timeScale: direction * speed,
              duration: 0.25,
              overwrite: true,
              onComplete: () => {
                gsap.to(loop, { timeScale: direction, duration: 1.4, ease: "power2.out", overwrite: true });
                skew(0);
              },
            });
          });
        },
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="marquee">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`marquee__row${rowIndex % 2 ? " marquee__row--alt" : ""}`}>
          <div className="marquee__track" data-marquee-track>
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className="marquee__set"
                aria-label={copy === 0 ? `Core skills ${rowIndex + 1} of ${rows.length}` : undefined}
                aria-hidden={copy === 1 ? true : undefined}
              >
                {row.map((tech) => (
                  <li key={tech.id} className="marquee__item" style={{ color: tech.color }}>
                    <span className="marquee__logo">
                      <TechLogo id={tech.id} />
                    </span>
                    <span className="marquee__name">{tech.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
