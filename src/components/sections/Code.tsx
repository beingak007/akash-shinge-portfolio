import { useRef } from "react";
import { featuredSnippet } from "../../data/code.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import "./Code.css";

export function Code() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const lines = root.current?.querySelectorAll("[data-code-line]");
      if (!lines) {
        return;
      }
      if (reduced) {
        gsap.set(lines, { opacity: 1, y: 0 });
        return;
      }
      gsap.from(lines, {
        opacity: 0,
        y: 8,
        stagger: 0.06,
        duration: 0.35,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="section code" id="code">
      <div className="section__head">
        <p className="kicker">A FEW LINES THAT MATTER.</p>
        <p className="kicker">{featuredSnippet.filename}</p>
      </div>

      <div className="code__grid">
        <pre className="code__pre" tabIndex={0}>
          <code>
            {featuredSnippet.lines.map((line, index) => (
              <span
                key={`${line.text}-${String(index)}`}
                className={`code__line${line.type === "blank" ? " is-blank" : ""} token-${line.token ?? "plain"}`}
                data-code-line
              >
                <span className="code__num">{String(index + 1).padStart(2, "0")}</span>
                {line.text}
              </span>
            ))}
          </code>
        </pre>
        <div data-reveal>
          <h2 className="display code__title">Keep the use-case thin.</h2>
          <p className="lede">{featuredSnippet.explanation}</p>
        </div>
      </div>
    </section>
  );
}
