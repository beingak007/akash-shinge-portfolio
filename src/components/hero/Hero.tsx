import { useRef, type CSSProperties } from "react";
import {
  bindHeroPointer,
  bindHeroScroll,
  buildHeroIntro,
} from "../../animations/heroAnimations.ts";
import { bindMagnetic } from "../../animations/magnetic.ts";
import { heroMeta, profile } from "../../data/profile.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { useGSAP } from "../../utils/gsap.ts";
import { onSiteReady } from "../../utils/siteReady.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import { ProfilePortrait } from "../profile/ProfilePortrait.tsx";
import { HeroGrid } from "./HeroGrid.tsx";
import { TechLogo } from "./TechLogo.tsx";
import "./Hero.css";

/** Floating stack badges around the portrait: position (% of the visual) and float timing. */
const badges = [
  { id: "java", label: "Java", x: -6, y: 14, delay: 0 },
  { id: "spring-boot", label: "Spring Boot", x: 78, y: 6, delay: 1.2 },
  { id: "kafka", label: "Kafka", x: 88, y: 46, delay: 0.6 },
  { id: "react", label: "React", x: -14, y: 58, delay: 1.8 },
  { id: "mysql", label: "MySQL", x: 70, y: 86, delay: 2.4 },
  { id: "docker", label: "Docker", x: 2, y: 92, delay: 0.9 },
] as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();

  // Intro + scroll parallax: built once per motion preference.
  useGSAP(
    () => {
      if (!root.current) {
        return;
      }
      const intro = buildHeroIntro(root.current, reduced);
      bindHeroScroll(root.current, reduced);
      return onSiteReady(() => {
        intro.play();
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  // Pointer depth + magnetic CTAs: desktop only.
  useGSAP(
    () => {
      if (!root.current || !desktop) {
        return;
      }
      const cleanups = [bindHeroPointer(root.current, reduced)];
      root.current.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        cleanups.push(bindMagnetic(el, 0.3));
      });
      return () => {
        cleanups.forEach((fn) => {
          fn();
        });
      };
    },
    { scope: root, dependencies: [reduced, desktop], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="hero" id="hero" data-hero-stage>
      <div className="hero__aurora" aria-hidden="true" />
      <HeroGrid />
      <p className="hero__ghost" aria-hidden="true" data-hero-ghost>
        SYSTEMS
      </p>

      <div className="hero__top">
        <p className="kicker" data-hero-label>
          PORTFOLIO / {profile.location.toUpperCase()}
        </p>
        <p className="hero__concept" data-hero-label>
          SYSTEM // HUMAN
        </p>
      </div>

      <h1 className="hero__name" data-hero-name>
        <span className="hero__first" data-hero-first>
          {profile.firstName}
        </span>{" "}
        <span className="hero__last" data-hero-last>
          <span>{profile.lastName}</span>
        </span>
      </h1>

      <div className="hero__stage" data-hero-parallax>
        <div className="hero__copy">
          <p className="hero__role" data-hero-label>
            <span>{profile.role}</span>
            <i aria-hidden="true" />
            <span>{profile.secondaryRole}</span>
          </p>
          <p className="hero__title" data-hero-heading>
            {profile.statement}
          </p>
          <p className="hero__intro" data-hero-label>
            Backend first — Java, Spring Boot, Kafka, and the MySQL and Cassandra
            paths underneath — with the React interfaces that make those systems
            usable.
          </p>
          <div className="hero__actions" data-hero-actions>
            <button
              className="btn btn--solid btn--lg"
              type="button"
              data-cursor="view"
              data-cursor-label="EXPLORE →"
              data-magnetic
              onClick={() => {
                scrollToSection("work", reduced, "Projects");
              }}
            >
              EXPLORE MY WORK
            </button>
            <button
              className="btn btn--lg"
              type="button"
              data-cursor="open"
              data-cursor-label="SAY HI"
              data-magnetic
              onClick={() => {
                scrollToSection("contact", reduced, "Contact");
              }}
            >
              CONTACT ME
            </button>
          </div>
        </div>

        <div className="hero__visual" data-hero-visual>
          <div className="hero__frame" data-hero-frame>
            <ProfilePortrait treatment="hero" src={profile.heroPhoto} />
          </div>
          <ul className="hero__badges" aria-label="Core stack" data-hero-badges>
            {badges.map((badge) => (
              <li
                key={badge.id}
                className="hero__badge"
                style={
                  {
                    "--bx": `${badge.x}%`,
                    "--by": `${badge.y}%`,
                    "--delay": `${badge.delay}s`,
                  } as CSSProperties
                }
                data-hero-badge
              >
                <span className="hero__badge-float">
                  <span className="hero__badge-logo">
                    <TechLogo id={badge.id} />
                  </span>
                  {badge.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hero__foot">
        <div className="hero__meta">
          {heroMeta.map((item) => (
            <p key={item.label} data-hero-meta>
              <span>{item.label}</span>
              {item.value}
            </p>
          ))}
        </div>
        <div data-hero-scroll-fade>
          <button
            type="button"
            className="hero__scroll"
            data-hero-scroll
            onClick={() => {
              scrollToSection("about", reduced);
            }}
          >
            <span>SCROLL</span>
            <i aria-hidden="true">
              <b />
            </i>
          </button>
        </div>
      </div>
    </section>
  );
}
