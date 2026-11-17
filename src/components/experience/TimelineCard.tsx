import { useRef } from "react";
import { useMediaFx } from "../../hooks/useMediaFx.ts";
import type { Experience } from "../../types/index.ts";
import { FxLayers } from "../media/FxLayers.tsx";

interface TimelineCardProps {
  item: Experience;
}

export function TimelineCard({ item }: TimelineCardProps) {
  const card = useRef<HTMLDivElement>(null);
  useMediaFx(card, { tilt: 3, magnetic: 0.01 });

  return (
    <article className="timeline__item" data-timeline-item>
      <span className="timeline__dot" aria-hidden="true" />
      <p className="timeline__year">{item.year}</p>
      <div ref={card} className="timeline__card fx" data-fx>
        <p className="timeline__company">{item.company}</p>
        <h3 className="timeline__role">{item.role}</h3>
        <p className="timeline__period">
          {item.period} · {item.location}
        </p>
        <div className="timeline__cols">
          <p>
            <span className="timeline__label">RESPONSIBILITY</span>
            {item.built}
          </p>
          <p>
            <span className="timeline__label">TECHNICAL IMPACT</span>
            {item.solved}
          </p>
        </div>
        <ul className="timeline__stack" aria-label="Stack">
          {item.stack.map((tech) => (
            <li key={tech} className="chip">
              {tech}
            </li>
          ))}
        </ul>
        {item.dateNote ? <p className="timeline__note">{item.dateNote}</p> : null}
        <FxLayers />
      </div>
    </article>
  );
}
