import { useMemo, useRef, useState } from "react";
import { bindTilt3d } from "../../animations/tilt3d.ts";
import { techInk } from "../../data/techColors.ts";
import { skillCategories, technologies } from "../../data/technologies.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import type { Technology } from "../../types/index.ts";
import { findTechnology, relatedSet } from "../../utils/techGraph.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { SkillMarquee } from "./SkillMarquee.tsx";
import "./StackMap.css";

function nodeClass(tech: Technology, activeId: string | null): string {
  if (!activeId) {
    return "stack-map__node";
  }
  const source = findTechnology(activeId, technologies);
  if (!source) {
    return "stack-map__node";
  }
  const related = relatedSet(source, technologies);
  if (tech.id === activeId) {
    return "stack-map__node is-active";
  }
  if (related.has(tech.id)) {
    return "stack-map__node is-related";
  }
  return "stack-map__node is-muted";
}

export function StackMap() {
  const map = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const [activeId, setActiveId] = useState<string | null>(null);

  useGSAP(
    () => {
      if (!map.current || reduced || !desktop) {
        return;
      }
      gsap.from(map.current.querySelectorAll(".stack-map__node"), {
        opacity: 0,
        scale: 0.6,
        duration: 0.7,
        ease: "back.out(1.8)",
        stagger: { each: 0.035, from: "start" },
        scrollTrigger: { trigger: map.current, start: "top 75%", once: true },
      });
      gsap.from(map.current.querySelectorAll(".stack-map__cat"), {
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: map.current, start: "top 75%", once: true },
      });
      return bindTilt3d(map.current, 7);
    },
    { dependencies: [reduced, desktop], revertOnUpdate: true },
  );

  const lines = useMemo(() => {
    if (!activeId) {
      return [];
    }
    const source = findTechnology(activeId, technologies);
    if (!source) {
      return [];
    }
    return source.related
      .map((id) => findTechnology(id, technologies))
      .filter((item): item is Technology => Boolean(item))
      .map((target) => ({
        id: `${source.id}-${target.id}`,
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
      }));
  }, [activeId]);

  const active = activeId ? findTechnology(activeId, technologies) : undefined;

  return (
    <section className="section stack" id="expertise">
      <div className="section__head">
        <p className="kicker">03 — TECHNICAL SKILLS</p>
        <p className="kicker">TECH STACK MAP</p>
      </div>
      <h2 className="display stack__title" data-split>
        An architecture, <em>not a list.</em>
      </h2>

      <SkillMarquee />

      <p className="lede" data-reveal>
        Hover a technology to see the path it actually travels — services, stores,
        messages, and the ideas that keep them together.
      </p>

      <p className="stack__live" aria-live="polite">
        {active
          ? `${active.name} connects through ${active.related.length} related nodes.`
          : "No node selected."}
      </p>

      <div ref={map} className="stack-map" data-reveal>
        <svg className="stack-map__svg" viewBox="0 0 1000 560" role="presentation">
          {skillCategories.map((category, index) => (
            <text
              key={category}
              className="stack-map__cat"
              x={index < 5 ? 70 + index * 210 : 70}
              y={index < 5 ? 28 : 478}
            >
              {category}
            </text>
          ))}
          {lines.map((line) => (
            <line
              key={line.id}
              className="stack-map__line"
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
            />
          ))}
        </svg>

        {technologies.map((tech) => (
          <button
            key={tech.id}
            type="button"
            className={nodeClass(tech, activeId)}
            style={{
              left: `${tech.x / 10}%`,
              top: `${tech.y / 5.6}%`,
              background: tech.color,
              color: techInk(tech.id),
              borderColor: tech.color,
            }}
            data-cursor="view"
            onMouseEnter={() => {
              setActiveId(tech.id);
            }}
            onMouseLeave={() => {
              setActiveId(null);
            }}
            onFocus={() => {
              setActiveId(tech.id);
            }}
            onBlur={() => {
              setActiveId(null);
            }}
            onClick={() => {
              setActiveId((current) => (current === tech.id ? null : tech.id));
            }}
          >
            {tech.name}
          </button>
        ))}
      </div>

      <div className="stack-list">
        {skillCategories.map((category) => (
          <div key={category}>
            <p className="kicker">{category}</p>
            <ul>
              {technologies
                .filter((tech) => tech.category === category)
                .map((tech) => (
                  <li key={tech.id}>
                    <button
                      type="button"
                      className={nodeClass(tech, activeId)}
                      style={{
                        background: tech.color,
                        color: techInk(tech.id),
                        borderColor: tech.color,
                      }}
                      onClick={() => {
                        setActiveId((current) =>
                          current === tech.id ? null : tech.id,
                        );
                      }}
                    >
                      {tech.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
