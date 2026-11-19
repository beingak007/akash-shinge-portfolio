import { useRef } from "react";
import { leetcode } from "../../data/leetcode.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import "./ProblemSet.css";

const maxDifficulty = Math.max(...leetcode.difficulties.map((item) => item.count), 1);

export function ProblemSet() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const bars = root.current?.querySelectorAll<HTMLElement>("[data-bar]");
      if (!bars) {
        return;
      }
      if (reduced) {
        gsap.set(bars, { scaleX: 1 });
        return;
      }
      gsap.from(bars, {
        scaleX: 0,
        transformOrigin: "left center",
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="section problems" id="problems">
      <div className="section__head">
        <p className="kicker">PROBLEM SET</p>
        <p className="kicker">LEETCODE / {leetcode.username.toUpperCase()}</p>
      </div>

      <div className="problems__grid">
        <div data-reveal>
          <h2 className="display problems__title">Accepted work, not a scoreboard.</h2>
          <p className="lede">
            Public LeetCode trace for {leetcode.realName}. {leetcode.accepted} accepted
            problems, mostly in Java. The medium set is the bulk of the work — the
            path where structure starts to matter.
          </p>
          <a
            className="btn"
            href={leetcode.url}
            target="_blank"
            rel="noreferrer"
            data-cursor="open"
          >
            OPEN LEETCODE
          </a>
        </div>

        <div className="problems__panel" aria-label="Accepted problems by difficulty">
          <p className="problems__accepted">
            <span>ACCEPTED</span>
            {leetcode.accepted}
          </p>
          {leetcode.difficulties.map((item) => (
            <div key={item.label} className="problems__row">
              <p>
                <span>{item.label}</span>
                {item.count}
              </p>
              <div className="problems__track">
                <span
                  data-bar
                  style={{ width: `${(item.count / maxDifficulty) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="problems__meta">
        <p>
          <span>LANGUAGE TRACE</span>
          {leetcode.languages.map((item) => `${item.name} ${item.count}`).join(" · ")}
        </p>
        <p>
          <span>TOP PATHS</span>
          {leetcode.tags.map((item) => item.name).join(" · ")}
        </p>
      </div>
    </section>
  );
}
