import { useCallback, useRef, useState, type CSSProperties } from "react";
import { bindMediaFx } from "../../animations/mediaFx.ts";
import { pinHorizontalWork } from "../../animations/scrollAnimations.ts";
import { profile } from "../../data/profile.ts";
import { projects } from "../../data/projects.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { FxLayers } from "../media/FxLayers.tsx";
import { ProjectCover } from "./ProjectCover.tsx";
import { ProjectModal } from "./ProjectModal.tsx";
import "./Work.css";

const total = String(projects.length).padStart(2, "0");

export function Work() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) {
        return;
      }

      const onProgress = (progress: number) => {
        if (bar.current) {
          gsap.set(bar.current, { scaleX: progress });
        }
        if (counter.current) {
          const current = Math.min(projects.length, Math.floor(progress * projects.length) + 1);
          counter.current.textContent = String(current).padStart(2, "0");
        }
      };

      const track = pinHorizontalWork(section, reduced, desktop, onProgress);
      const cards = gsap.utils.toArray<HTMLElement>("[data-work-card]", section);

      cards.forEach((card) => {
        const frame = card.querySelector<HTMLElement>("[data-work-frame]");
        const cover = card.querySelector<HTMLElement>("[data-fx-media]");
        if (!frame || !cover || reduced) {
          return;
        }

        if (track) {
          // Horizontal gallery: mask opens and the cover drifts against the scroll.
          gsap.fromTo(
            frame,
            { clipPath: "inset(0% 0% 0% 38%)", scale: 0.94 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: track,
                start: "left 98%",
                end: "left 45%",
                scrub: true,
              },
            },
          );
          gsap.fromTo(
            cover,
            { xPercent: 5 },
            {
              xPercent: -5,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: track,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
          return;
        }

        // Stacked gallery (touch / tablet): mask reveal as each card enters.
        gsap
          .timeline({ scrollTrigger: { trigger: frame, start: "top 88%", once: true } })
          .fromTo(
            frame,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" },
          )
          .fromTo(cover, { scale: 1.25 }, { scale: 1, duration: 1.4, ease: "expo.out" }, 0.1);
      });

      const cleanups = gsap.utils
        .toArray<HTMLElement>("[data-work-frame]", section)
        .map((frame) => bindMediaFx(frame, { tilt: 5, magnetic: 0.02, desktop, reduced }));
      return () => {
        cleanups.forEach((fn) => {
          fn();
        });
      };
    },
    { scope: root, dependencies: [reduced, desktop], revertOnUpdate: true },
  );

  const open = (index: number, from: HTMLElement) => {
    returnFocus.current = from;
    setOpenIndex(index);
  };

  const getOrigin = useCallback((id: string) => {
    return root.current?.querySelector<HTMLElement>(`[data-work-frame="${id}"]`) ?? null;
  }, []);

  const close = () => {
    setOpenIndex(null);
    returnFocus.current?.focus({ preventScroll: true });
  };

  return (
    <section ref={root} className="work" id="work">
      <div className="work__pin">
        <div className="work__track" data-work-track>
          <header className="work__intro">
            <p className="kicker">04 — FEATURED PROJECTS</p>
            <h2 className="display work__title" data-split>
              Selected <em>work.</em>
            </h2>
            <p className="lede">
              Engineering problems from the systems Akash designs — event paths, data
              stores, and the contracts in front of them. Open any project for the
              challenges behind it.
            </p>
            <p className="work__hint" aria-hidden="true">
              <span>{desktop && !reduced ? "SCROLL TO EXPLORE" : "TAP A PROJECT"}</span>
              <i />
            </p>
          </header>

          {projects.map((project, index) => (
            <article
              key={project.id}
              className="work-card"
              data-work-card
              aria-labelledby={`work-${project.id}`}
            >
              <button
                type="button"
                className="work-card__frame fx"
                data-work-frame={project.id}
                data-fx
                data-cursor="view"
                data-cursor-label="OPEN PROJECT"
                tabIndex={-1}
                aria-label={`Open ${project.name} details`}
                onClick={(event) => {
                  open(index, event.currentTarget);
                }}
              >
                <ProjectCover project={project} />
                <FxLayers />
              </button>

              <div className="work-card__body">
                <p className="work-card__index">
                  {project.index}
                  <span>/ {total}</span>
                </p>
                <div className="work-card__copy">
                  <h3 className="work-card__name" id={`work-${project.id}`}>
                    {project.name}
                  </h3>
                  <p className="work-card__summary">{project.summary}</p>
                </div>
                <div className="work-card__side">
                  <ul className="work-card__tags" aria-label="Technology">
                    {project.tech.slice(0, 4).map((tech) => (
                      <li key={tech} className="chip" style={{ "--chip-dot": project.accent } as CSSProperties}>
                        {tech}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="work-card__open"
                    data-cursor="open"
                    aria-haspopup="dialog"
                    onClick={(event) => {
                      open(index, event.currentTarget);
                    }}
                  >
                    OPEN PROJECT <span aria-hidden="true">+</span>
                  </button>
                </div>
              </div>
            </article>
          ))}

          <footer className="work__outro">
            <p className="kicker">{projects.length} SYSTEM STUDIES</p>
            <p className="work__outro-title">
              The code lives
              <br />
              on GitHub.
            </p>
            {profile.links.github ? (
              <a
                className="btn btn--solid"
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
                data-cursor="open"
                data-magnetic
              >
                GITHUB / BEINGAK007 ↗
              </a>
            ) : null}
            <p className="work__outro-note">
              Studies are representative engineering problems, not named client work.
            </p>
          </footer>
        </div>

        <div className="work__progress" aria-hidden="true">
          <span className="work__count">
            <span ref={counter}>01</span> / {total}
          </span>
          <span className="work__rail">
            <span ref={bar} />
          </span>
        </div>
      </div>

      {openIndex !== null ? (
        <ProjectModal
          index={openIndex}
          onNavigate={setOpenIndex}
          onClose={close}
          getOrigin={getOrigin}
        />
      ) : null}
    </section>
  );
}
