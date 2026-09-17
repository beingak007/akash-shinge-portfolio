import { useRef } from "react";
import {
  animateProjectFlows,
  pinHorizontalWork,
} from "../../animations/scrollAnimations.ts";
import { bindTilt3d } from "../../animations/tilt3d.ts";
import { projects } from "../../data/projects.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { useGSAP } from "../../utils/gsap.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
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
      if (reduced || !desktop) {
        return;
      }
      const cleanups = [
        ...root.current.querySelectorAll<HTMLElement>("[data-tilt-3d]"),
      ].map((el) => bindTilt3d(el, 8));
      return () => {
        cleanups.forEach((fn) => {
          fn();
        });
      };
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
                  {project.links.map((link) => {
                    const internal = link.href.startsWith("#");
                    return (
                      <a
                        key={link.href}
                        className="btn"
                        href={link.href}
                        target={internal ? undefined : "_blank"}
                        rel={internal ? undefined : "noreferrer"}
                        data-cursor="open"
                        onClick={(event) => {
                          if (!internal) {
                            return;
                          }
                          event.preventDefault();
                          scrollToSection(link.href.slice(1), reduced);
                        }}
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <div className="project__visual" data-tilt-3d>
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
