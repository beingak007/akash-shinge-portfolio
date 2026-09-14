import { useRef, useState } from "react";
import { bindMagnetic } from "../../animations/magnetic.ts";
import { navigation } from "../../data/navigation.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, ScrollTrigger, useGSAP } from "../../utils/gsap.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import { ProfilePortrait } from "../profile/ProfilePortrait.tsx";
import "./FloatingNav.css";

interface FloatingNavProps {
  activeId: string;
}

export function FloatingNav({ activeId }: FloatingNavProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);

  useGSAP(
    () => {
      let last = 0;
      ScrollTrigger.create({
        start: 72,
        onUpdate: (self) => {
          const y = self.scroll();
          setCompact(y > 72);
          if (!reduced && desktop) {
            setHidden(y > last && y > 140);
          } else {
            setHidden(false);
          }
          last = y;
        },
      });

      if (reduced || !root.current) {
        return;
      }

      gsap.from(root.current, {
        y: -20,
        opacity: 0,
        duration: 0.7,
        delay: 0.85,
        ease: "power3.out",
      });

      if (!desktop) {
        return;
      }

      const cleanups = [...root.current.querySelectorAll<HTMLElement>("[data-magnetic]")].map(
        (el) => bindMagnetic(el, 0.18),
      );
      return () => {
        cleanups.forEach((fn) => {
          fn();
        });
      };
    },
    { scope: root, dependencies: [reduced, desktop] },
  );

  const onNav = (id: string) => {
    setOpen(false);
    setHidden(false);
    scrollToSection(id, reduced);
  };

  return (
    <header
      ref={root}
      className={`nav${compact ? " nav--compact" : ""}${hidden && !open ? " nav--hidden" : ""}`}
    >
      <a
        className="nav__brand"
        href="#hero"
        data-magnetic
        data-cursor="image"
        data-cursor-label="AKASH / ENGINEER"
        onClick={(event) => {
          event.preventDefault();
          onNav("hero");
        }}
      >
        <ProfilePortrait treatment="nav" />
        <span className="nav__brand-name">AKASH</span>
      </a>

      <button
        className="nav__toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        {open ? "CLOSE" : "MENU"}
      </button>

      <nav id="site-nav" className={`nav__list${open ? " is-open" : ""}`} aria-label="Primary">
        {navigation.map((item) => (
          <a
            key={item.id}
            className={`nav__link${activeId === item.id ? " is-active" : ""}`}
            href={item.href}
            data-cursor="open"
            data-magnetic
            onClick={(event) => {
              event.preventDefault();
              onNav(item.id);
            }}
          >
            <span className="nav__index">{item.index}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
