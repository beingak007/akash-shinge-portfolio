import { useRef } from "react";
import { drawTimeline } from "../../animations/scrollAnimations.ts";
import { experiences } from "../../data/experience.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { useGSAP } from "../../utils/gsap.ts";
import { TimelineCard } from "./TimelineCard.tsx";
import "./Experience.css";

const progression = [...experiences].reverse().map((item) => item.role);

export function Experience() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (root.current) {
        drawTimeline(root.current, reduced);
      }
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="section experience" id="experience">
      <div className="section__head">
        <p className="kicker">04 — EXPERIENCE</p>
        <p className="kicker">ENGINEERING LOG</p>
      </div>
      <div className="experience__intro">
        <h2 className="display experience__title" data-split>
          Roles held. <em>Systems owned.</em>
        </h2>
        {progression.length > 1 ? (
          <ol className="experience__path" aria-label="Career progression" data-reveal>
            {progression.map((role, index) => (
              <li key={role}>
                {role}
                {index < progression.length - 1 ? <i aria-hidden="true">→</i> : null}
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="timeline">
        <div className="timeline__line" aria-hidden="true">
          <span data-timeline-progress />
          <b className="timeline__head" data-timeline-head />
        </div>
        {experiences.map((item) => (
          <TimelineCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
