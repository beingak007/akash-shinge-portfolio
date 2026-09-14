import { useRef } from "react";
import { drawTimeline } from "../../animations/scrollAnimations.ts";
import { experiences } from "../../data/experience.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { useGSAP } from "../../utils/gsap.ts";
import "./Experience.css";

export function Experience() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (root.current) {
        drawTimeline(root.current, reduced);
      }
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="section experience" id="experience">
      <div className="section__head">
        <p className="kicker">04 — EXPERIENCE</p>
        <p className="kicker">ENGINEERING LOG</p>
      </div>
      <h2 className="display experience__title" data-reveal>
        Roles held. Systems owned.
      </h2>

      <div className="timeline">
        <div className="timeline__line" aria-hidden="true">
          <span data-timeline-progress />
        </div>
        {experiences.map((item) => (
          <article
            key={item.id}
            className="timeline__item"
            data-timeline-item
          >
            <p className="timeline__year">{item.year}</p>
            <div>
              <p className="timeline__company">{item.company}</p>
              <h3 className="timeline__role">{item.role}</h3>
              <p className="timeline__period">
                {item.period} · {item.location}
              </p>
              <p>
                <span className="timeline__label">WHAT I BUILT</span>
                {item.built}
              </p>
              <p>
                <span className="timeline__label">WHAT I SOLVED</span>
                {item.solved}
              </p>
              {item.dateNote ? (
                <p className="timeline__note">{item.dateNote}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
