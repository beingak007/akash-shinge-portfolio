import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { projects } from "../../data/projects.ts";
import { useMediaFx } from "../../hooks/useMediaFx.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import { FxLayers } from "../media/FxLayers.tsx";
import { ProjectCover } from "./ProjectCover.tsx";
import { ProjectFlow } from "./ProjectFlow.tsx";
import "./ProjectModal.css";

interface ProjectModalProps {
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  /** The gallery frame a project's cover flies out of (and back into). */
  getOrigin: (id: string) => HTMLElement | null;
}

const FOCUSABLE = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

function inViewport(rect: DOMRect): boolean {
  return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}

function pin(element: HTMLElement, rect: DOMRect): void {
  gsap.set(element, {
    position: "fixed",
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    margin: 0,
    zIndex: 3,
  });
}

export function ProjectModal({ index, onNavigate, onClose, getOrigin }: ProjectModalProps) {
  const project = projects[index];
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const shownIndex = useRef(index);
  const closing = useRef(false);
  const reduced = useReducedMotion();
  useMediaFx(media, { tilt: 2.5, magnetic: 0 });

  // Open: the cover lifts out of its card and expands into the panel.
  useGSAP(
    () => {
      const el = root.current;
      const cover = media.current;
      const target = slot.current;
      if (!el || !cover || !target || !project) {
        return;
      }
      const reveal = el.querySelectorAll("[data-pm-reveal]");
      const timeline = gsap.timeline();
      timeline
        .fromTo("[data-pm-scrim]", { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0)
        .fromTo("[data-pm-surface]", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.18);

      const origin = getOrigin(project.id);
      if (reduced || !origin) {
        timeline.fromTo(cover, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
        return;
      }

      origin.style.visibility = "hidden";
      pin(cover, origin.getBoundingClientRect());
      const to = target.getBoundingClientRect();
      timeline
        .to(
          cover,
          {
            left: to.left,
            top: to.top,
            width: to.width,
            height: to.height,
            duration: 0.95,
            ease: "expo.inOut",
            clearProps: "position,left,top,width,height,margin,zIndex",
          },
          0,
        )
        .from(reveal, { y: 42, opacity: 0, duration: 0.85, ease: "power3.out", stagger: 0.055 }, 0.5);
    },
    { scope: root },
  );

  // Prev / next inside the modal: crossfade instead of re-flying.
  useGSAP(
    () => {
      if (shownIndex.current === index || !project) {
        return;
      }
      const previous = projects[shownIndex.current];
      shownIndex.current = index;
      const oldOrigin = previous ? getOrigin(previous.id) : null;
      const newOrigin = getOrigin(project.id);
      if (oldOrigin) {
        oldOrigin.style.visibility = "";
      }
      if (newOrigin && !reduced) {
        newOrigin.style.visibility = "hidden";
      }
      scroller.current?.scrollTo({ top: 0 });
      if (reduced || !root.current) {
        return;
      }
      gsap.fromTo(
        [media.current, ...root.current.querySelectorAll("[data-pm-reveal]")],
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.04, overwrite: "auto" },
      );
    },
    { scope: root, dependencies: [index] },
  );

  const requestClose = (after?: () => void) => {
    const el = root.current;
    const cover = media.current;
    if (closing.current || !el || !cover || !project) {
      return;
    }
    closing.current = true;
    const origin = getOrigin(project.id);
    const finish = () => {
      if (origin) {
        origin.style.visibility = "";
      }
      onClose();
      if (after) {
        window.setTimeout(after, 0);
      }
    };

    const timeline = gsap.timeline({ onComplete: finish });
    timeline.to(el.querySelectorAll("[data-pm-reveal]"), {
      opacity: 0,
      y: 18,
      duration: 0.28,
      ease: "power2.in",
      stagger: 0.015,
    });

    const target = origin?.getBoundingClientRect();
    if (!reduced && target && inViewport(target)) {
      pin(cover, cover.getBoundingClientRect());
      timeline
        .to(
          cover,
          {
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
            duration: 0.8,
            ease: "expo.inOut",
          },
          0.08,
        )
        .to("[data-pm-surface]", { opacity: 0, duration: 0.4 }, 0.12)
        .to("[data-pm-scrim]", { opacity: 0, duration: 0.55 }, 0.3);
      return;
    }

    if (origin) {
      origin.style.visibility = "";
    }
    timeline
      .to(cover, { opacity: 0, scale: 0.96, duration: 0.35, ease: "power2.in" }, 0)
      .to("[data-pm-surface]", { opacity: 0, duration: 0.35 }, 0.05)
      .to("[data-pm-scrim]", { opacity: 0, duration: 0.4 }, 0.12);
  };

  // Latest close handler for listeners that subscribe once.
  const closeRef = useRef(requestClose);
  useLayoutEffect(() => {
    closeRef.current = requestClose;
  });

  // Keyboard: Esc closes, ←/→ change project, Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const step = event.key === "ArrowRight" ? 1 : -1;
        onNavigate((index + step + projects.length) % projects.length);
        return;
      }
      if (event.key !== "Tab" || !root.current) {
        return;
      }
      const items = [...root.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [index, onNavigate]);

  useEffect(() => {
    document.body.classList.add("is-modal-open");
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      document.body.classList.remove("is-modal-open");
      // Never leave a gallery card hidden, however the dialog was torn down.
      projects.forEach((item) => {
        const origin = getOrigin(item.id);
        if (origin) {
          origin.style.visibility = "";
        }
      });
    };
  }, [getOrigin]);

  if (!project) {
    return null;
  }

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return createPortal(
    <div
      ref={root}
      className="pm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-title"
      style={{ "--pm-accent": project.accent } as CSSProperties}
    >
      <div className="pm__scrim" data-pm-scrim />
      <div
        ref={scroller}
        className="pm__scroll"
        data-lenis-prevent
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            requestClose();
          }
        }}
      >
        <article className="pm__panel">
          <span className="pm__surface" data-pm-surface aria-hidden="true" />

          <header className="pm__bar" data-pm-reveal>
            <p className="pm__crumb">
              <span>{project.index}</span> / {String(projects.length).padStart(2, "0")} ·{" "}
              {project.kind === "study" ? "SYSTEM STUDY" : "SHIPPED"}
            </p>
            <button
              ref={closeButton}
              type="button"
              className="pm__close"
              data-cursor="open"
              data-cursor-label="CLOSE"
              onClick={() => {
                requestClose();
              }}
            >
              CLOSE <span aria-hidden="true">✕</span>
            </button>
          </header>

          <div ref={slot} className="pm__slot">
            <div ref={media} className="pm__media fx" data-fx>
              <ProjectCover project={project} />
              <FxLayers />
            </div>
          </div>

          <div className="pm__body">
            <div className="pm__main">
              <h2 id="pm-title" className="pm__title" data-pm-reveal>
                {project.name}
              </h2>
              <p className="pm__summary" data-pm-reveal>
                {project.summary}
              </p>
              <div className="pm__block" data-pm-reveal>
                <p className="pm__label">THE PROBLEM</p>
                <p>{project.problem}</p>
              </div>
              <div className="pm__block" data-pm-reveal>
                <p className="pm__label">FLOW</p>
                <ProjectFlow project={project} />
              </div>
              {project.links.length > 0 ? (
                <div className="pm__links" data-pm-reveal>
                  {project.links.map((link) => {
                    const internal = link.href.startsWith("#");
                    return (
                      <a
                        key={link.href}
                        className="btn btn--solid"
                        href={link.href}
                        target={internal ? undefined : "_blank"}
                        rel={internal ? undefined : "noreferrer"}
                        data-cursor="open"
                        onClick={(event) => {
                          if (!internal) {
                            return;
                          }
                          event.preventDefault();
                          requestClose(() => {
                            scrollToSection(link.href.slice(1), reduced, link.label);
                          });
                        }}
                      >
                        {link.label} {internal ? "→" : "↗"}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <aside className="pm__aside">
              <div className="pm__block" data-pm-reveal>
                <p className="pm__label">KEY TECHNICAL CHALLENGES</p>
                <ol className="pm__challenges">
                  {project.challenges.map((item, itemIndex) => (
                    <li key={item}>
                      <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="pm__block" data-pm-reveal>
                <p className="pm__label">STACK</p>
                <ul className="pm__chips">
                  {project.tech.map((tech) => (
                    <li key={tech} className="chip" style={{ "--chip-dot": project.accent } as CSSProperties}>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pm__block" data-pm-reveal>
                <p className="pm__label">DESIGNED FOR</p>
                <p className="pm__impact">{project.impact.join(" · ")}</p>
              </div>
            </aside>
          </div>

          <nav className="pm__nav" aria-label="More projects" data-pm-reveal>
            {prev ? (
              <button
                type="button"
                className="pm__step"
                data-cursor="open"
                onClick={() => {
                  onNavigate((index - 1 + projects.length) % projects.length);
                }}
              >
                <span>← PREVIOUS</span>
                {prev.name}
              </button>
            ) : null}
            {next ? (
              <button
                type="button"
                className="pm__step pm__step--next"
                data-cursor="open"
                onClick={() => {
                  onNavigate((index + 1) % projects.length);
                }}
              >
                <span>NEXT →</span>
                {next.name}
              </button>
            ) : null}
          </nav>
        </article>
      </div>
    </div>,
    document.body,
  );
}
