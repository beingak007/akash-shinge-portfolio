import { useRef } from "react";
import {
  animateProjectFlows,
  pinHorizontalWork,
} from "../../animations/scrollAnimations.ts";
import { projects } from "../../data/projects.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { useGSAP } from "../../utils/gsap.ts";
import { ProjectFlow } from "./ProjectFlow.tsx";
import "./Work.css";

export function Work() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();

  useGSAP(
    () => {
      if (!root.current) {
        return;
      }
      pinHorizontalWork(root.current, reduced, desktop);
      animateProjectFlows(root.current, reduced);
    },
    { scope: root, dependencies: [reduced, desktop] },
  );

  return (
    <section ref={root} className="work" id="work">
      <div className="work__intro">
        <p className="kicker">03 — WORK</p>
        <h2 className="display work__title">SELECTED WORK</h2>
        <p className="lede">
          Engineering problems from the systems Akash designs — event paths, data
          stores, and the contracts that sit in front of them. Repository and live
          links appear here only when they are public.
        </p>
      </div>

      <div className="work__track" data-work-track>
        {projects.map((project) => (
          <article
            key={project.id}
            className="project"
            data-cursor="view"
            aria-labelledby={`project-${project.id}`}
          >
            <div className="project__copy">
              <p className="project__index">{project.index}</p>
              <h3 className="project__name" id={`project-${project.id}`}>
                {project.name}
              </h3>
              <p className="project__problem">{project.problem}</p>
              <p className="project__meta">
                <span>TECH</span>
                {project.tech.join(" · ")}
              </p>
              <p className="project__meta">
                <span>IMPACT</span>
                {project.impact.join(" · ")}
              </p>
              {project.kind === "study" ? (
                <p className="project__note">SYSTEM STUDY — NOT A NAMED CLIENT CASE</p>
              ) : null}
              {project.links.length > 0 ? (
                <div className="project__links">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      className="btn"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="open"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="project__visual">
              {project.image ? (
                <img src={project.image} alt="" loading="lazy" />
              ) : (
                <ProjectFlow project={project} />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
