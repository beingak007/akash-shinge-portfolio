import { useRef } from "react";
import { bindMagnetic } from "../../animations/magnetic.ts";
import { leetcode } from "../../data/leetcode.ts";
import { profile } from "../../data/profile.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, SplitText, useGSAP } from "../../utils/gsap.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import "./Footer.css";

const year = new Date().getFullYear();

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();

  useGSAP(
    () => {
      const mark = root.current?.querySelector<HTMLElement>("[data-footer-mark]");
      if (!root.current || !mark) {
        return;
      }
      const split = SplitText.create(mark, { type: "chars", charsClass: "footer__char" });
      // Letters graded ember → cool across the wordmark.
      const tint = gsap.utils.interpolate("#d4783a", "#6cc5b8");
      split.chars.forEach((char, index) => {
        (char as HTMLElement).style.color = tint(index / Math.max(split.chars.length - 1, 1));
      });

      if (!reduced) {
        gsap.from(split.chars, {
          yPercent: 115,
          rotate: 6,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });
      }

      if (!desktop || reduced) {
        return;
      }
      const cleanups = [...root.current.querySelectorAll<HTMLElement>("[data-magnetic]")].map((el) =>
        bindMagnetic(el, 0.35),
      );
      return () => {
        cleanups.forEach((fn) => {
          fn();
        });
      };
    },
    { scope: root, dependencies: [reduced, desktop], revertOnUpdate: true },
  );

  return (
    <footer ref={root} className="footer">
      <div className="footer__top">
        <div>
          <p className="footer__name">{profile.name.toUpperCase()}</p>
          <p>
            {profile.role} · {profile.secondaryRole}
          </p>
          <p className="footer__stack">JAVA · REACT · SYSTEMS</p>
        </div>
        <nav className="footer__links" aria-label="Elsewhere">
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" data-cursor="open">
            LinkedIn
          </a>
          {profile.links.github ? (
            <a href={profile.links.github} target="_blank" rel="noreferrer" data-cursor="open">
              GitHub
            </a>
          ) : null}
          <a href={leetcode.url} target="_blank" rel="noreferrer" data-cursor="open">
            LeetCode
          </a>
        </nav>
        <button
          type="button"
          className="footer__top-btn"
          data-cursor="open"
          data-cursor-label="TOP"
          data-magnetic
          onClick={() => {
            scrollToSection("hero", reduced, "Top");
          }}
        >
          <span aria-hidden="true">↑</span>
          <span className="sr-only">Back to top</span>
        </button>
      </div>

      <p className="footer__mark" aria-hidden="true" data-footer-mark>
        {profile.name}
      </p>

      <div className="footer__base">
        <p>
          © {year} {profile.name.toUpperCase()}
        </p>
        <p>BUILT WITH REACT · GSAP · LENIS</p>
      </div>
    </footer>
  );
}
