import { useRef } from "react";
import { bindMagnetic } from "../../animations/magnetic.ts";
import { bindHeroPointer, playHeroIntro } from "../../animations/heroAnimations.ts";
import { heroMeta, profile } from "../../data/profile.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { useGSAP } from "../../utils/gsap.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import { HeroGrid } from "./HeroGrid.tsx";
import { HeroSystem } from "./HeroSystem.tsx";
import "./Hero.css";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();

  useGSAP(
    () => {
      if (!root.current) {
        return;
      }
      playHeroIntro(root.current, reduced);
      const cleanups: Array<() => void> = [];
      if (desktop) {
        cleanups.push(bindHeroPointer(root.current, reduced));
        root.current.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          cleanups.push(bindMagnetic(el, 0.22));
        });
      }
      return () => {
        cleanups.forEach((fn) => {
          fn();
        });
      };
    },
    { scope: root, dependencies: [reduced, desktop] },
  );

  return (
    <section ref={root} className="hero" id="hero" data-hero-stage>
      <HeroGrid />
      <p className="hero__ghost" aria-hidden="true">
        SYSTEMS
      </p>

      <div className="hero__top">
        <div>
          <h1 className="hero__name" data-hero-name>
            {profile.name}
          </h1>
          <p className="kicker" data-hero-label>
            {profile.role.toUpperCase()}
          </p>
        </div>
        <p className="hero__concept" data-hero-label>
          SYSTEM // HUMAN
        </p>
      </div>

      <div className="hero__stage">
        <div className="hero__copy">
          <p className="hero__title" data-hero-heading>
            {profile.statement}
          </p>
          <div className="hero__actions" data-hero-actions>
            <button
              className="btn btn--solid"
              type="button"
              data-cursor="view"
              data-magnetic
              onClick={() => {
                scrollToSection("work", reduced);
              }}
            >
              VIEW ENGINEERING WORK
            </button>
            <button
              className="btn"
              type="button"
              data-cursor="open"
              data-magnetic
              onClick={() => {
                scrollToSection("playground", reduced);
              }}
            >
              EXPLORE ARCHITECTURE
            </button>
            <a
              className="btn"
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor="open"
              data-magnetic
            >
              CONNECT
            </a>
          </div>
        </div>

        <HeroSystem />
      </div>

      <div className="hero__meta">
        {heroMeta.map((item) => (
          <p key={item.label} data-hero-meta>
            <span>{item.label}</span>
            {item.value}
          </p>
        ))}
      </div>
    </section>
  );
}
