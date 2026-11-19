import { useEffect, useRef, useState } from "react";
import { bindMagnetic } from "../../animations/magnetic.ts";
import { navigation } from "../../data/navigation.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, ScrollTrigger, useGSAP } from "../../utils/gsap.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import { ThemeToggle } from "./ThemeToggle.tsx";
import "./FloatingNav.css";

interface FloatingNavProps {
  activeId: string;
}

export function FloatingNav({ activeId }: FloatingNavProps) {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("is-nav-open", open);
    return () => {
      document.body.classList.remove("is-nav-open");
    };
  }, [open]);

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
    { scope: root, dependencies: [reduced, desktop], revertOnUpdate: true },
  );

  // Sliding indicator: follows the active section, previews the hovered link.
  useGSAP(
    () => {
      const bar = indicator.current;
      const active = list.current?.querySelector<HTMLElement>(".nav__link.is-active");
      if (!bar) {
        return;
      }
      if (!desktop || !active) {
        gsap.to(bar, { opacity: 0, duration: 0.3, overwrite: "auto" });
        return;
      }
      gsap.to(bar, {
        x: active.offsetLeft,
        y: active.offsetTop + active.offsetHeight + 4,
        width: active.offsetWidth,
        opacity: 1,
        duration: reduced ? 0 : 0.7,
        ease: "expo.out",
        overwrite: "auto",
      });
    },
    { scope: root, dependencies: [activeId, desktop, reduced, compact] },
  );

  const previewIndicator = (link: HTMLElement | null) => {
    const bar = indicator.current;
    const target = link ?? list.current?.querySelector<HTMLElement>(".nav__link.is-active") ?? null;
    if (!bar || !desktop) {
      return;
    }
    if (!target) {
      gsap.to(bar, { opacity: 0, duration: 0.3, overwrite: "auto" });
      return;
    }
    gsap.to(bar, {
      x: target.offsetLeft,
      y: target.offsetTop + target.offsetHeight + 4,
      width: target.offsetWidth,
      opacity: 1,
      duration: reduced ? 0 : 0.5,
      ease: "expo.out",
      overwrite: "auto",
    });
  };

  // Mobile menu: links cascade in when it opens.
  useGSAP(
    () => {
      if (!open || reduced || desktop || !list.current) {
        return;
      }
      gsap.fromTo(
        list.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "expo.out", clearProps: "clipPath" },
      );
      gsap.from(list.current.querySelectorAll(".nav__link"), {
        y: 18,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.045,
        delay: 0.08,
      });
    },
    { scope: root, dependencies: [open, reduced, desktop] },
  );

  const onNav = (id: string, label?: string) => {
    setOpen(false);
    setHidden(false);
    scrollToSection(id, reduced, label);
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
        <span className="nav__monogram" aria-hidden="true">
          AS
        </span>
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

      <nav
        ref={list}
        id="site-nav"
        className={`nav__list${open ? " is-open" : ""}`}
        aria-label="Primary"
        onPointerLeave={() => {
          previewIndicator(null);
        }}
      >
        <span ref={indicator} className="nav__indicator" aria-hidden="true" />
        {navigation.map((item) => (
          <a
            key={item.id}
            className={`nav__link${activeId === item.id ? " is-active" : ""}`}
            href={item.href}
            data-cursor="open"
            data-magnetic
            aria-current={activeId === item.id ? "true" : undefined}
            onPointerEnter={(event) => {
              previewIndicator(event.currentTarget);
            }}
            onClick={(event) => {
              event.preventDefault();
              onNav(item.id, item.label);
            }}
          >
            <span className="nav__index">{item.index}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <ThemeToggle />
    </header>
  );
}
