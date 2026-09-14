import { useRef } from "react";
import { leetcode } from "../../data/leetcode.ts";
import { dnaChain, profile } from "../../data/profile.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { ProfilePortrait } from "../profile/ProfilePortrait.tsx";
import "./About.css";

export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const items = root.current?.querySelectorAll("[data-dna-node]");
      const links = root.current?.querySelectorAll("[data-dna-link]");
      if (!items || !links) {
        return;
      }

      if (reduced) {
        gsap.set([items, links], { opacity: 1, scaleX: 1, scaleY: 1 });
        return;
      }

      gsap.from(items, {
        opacity: 0,
        y: 16,
        stagger: 0.12,
        duration: 0.5,
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
      gsap.from(links, {
        scaleX: 0,
        transformOrigin: "left center",
        stagger: 0.12,
        duration: 0.4,
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="section about" id="about">
      <div className="section__head">
        <p className="kicker">WHO IS AKASH?</p>
        <p className="kicker">ENGINEERING PROFILE</p>
      </div>

      <div className="about__grid">
        <div data-reveal>
          <h2 className="display about__title">
            ENGINEER.
            <br />
            PROBLEM SOLVER.
            <br />
            BUILDER.
          </h2>
          <p className="lede">{profile.statement}</p>
          <p className="lede">
            Akash works across Java and Spring Boot services and the React
            interfaces that sit on them. The work is production work: contracts,
            data paths, messaging, and the screens that have to tell the truth
            about the system.
          </p>
        </div>

        <aside className="about__card" data-reveal>
          <ProfilePortrait treatment="about" />
          <dl className="about__facts">
            <div>
              <dt>NAME</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>ROLE</dt>
              <dd>{profile.role}</dd>
            </div>
            <div>
              <dt>BASE</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>STACK</dt>
              <dd>{profile.stackLine}</dd>
            </div>
            {leetcode.school ? (
              <div>
                <dt>SCHOOL</dt>
                <dd>{leetcode.school}</dd>
              </div>
            ) : null}
            <div>
              <dt>LEETCODE</dt>
              <dd>
                <a href={leetcode.url} target="_blank" rel="noreferrer" data-cursor="open">
                  {leetcode.username}
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <ol className="dna" aria-label="Engineering path from architecture to user">
        {dnaChain.map((node, index) => (
          <li key={node} className="dna__item">
            <span className="dna__node" data-dna-node>
              {node}
            </span>
            {index < dnaChain.length - 1 ? (
              <span className="dna__link" data-dna-link aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
