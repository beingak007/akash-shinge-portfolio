import { profile } from "../../data/profile.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import "./Footer.css";

export function Footer() {
  const reduced = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div>
        <p className="footer__name">{profile.name.toUpperCase()}</p>
        <p>{profile.role}</p>
        <p className="footer__stack">JAVA · REACT · SYSTEMS</p>
      </div>
      <div className="footer__meta">
        <p>© {year} {profile.name.toUpperCase()}</p>
        <a href={profile.links.linkedin} target="_blank" rel="noreferrer" data-cursor="open">
          LinkedIn
        </a>
        <a href={profile.links.leetcode} target="_blank" rel="noreferrer" data-cursor="open">
          LeetCode
        </a>
        {profile.links.github ? (
          <a href={profile.links.github} target="_blank" rel="noreferrer" data-cursor="open">
            GitHub
          </a>
        ) : null}
        <button
          type="button"
          data-cursor="open"
          onClick={() => {
            scrollToSection("hero", reduced);
          }}
        >
          Back to top
        </button>
      </div>
    </footer>
  );
}
