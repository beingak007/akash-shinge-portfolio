import { useRef } from "react";
import { experiences } from "../../data/experience.ts";
import { leetcode } from "../../data/leetcode.ts";
import { dnaChain, profile } from "../../data/profile.ts";
import { profileStats, strengths } from "../../data/stats.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { ProfilePortrait } from "../profile/ProfilePortrait.tsx";
import { StatCard } from "./StatCard.tsx";
import "./About.css";

const current = experiences[0];

export function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const items = root.current?.querySelectorAll("[data-dna-node]");
      const links = root.current?.querySelectorAll("[data-dna-link]");
      const strengthsList = root.current?.querySelectorAll("[data-strength]");
      if (!items || !links || !strengthsList) {
        return;
      }

      if (reduced) {
        return;
      }

      gsap.from(items, {
        opacity: 0,
        y: 16,
        stagger: 0.12,
        duration: 0.5,
        scrollTrigger: { trigger: "[data-dna]", start: "top 85%", once: true },
      });
      gsap.from(links, {
        scaleX: 0,
        transformOrigin: "left center",
        stagger: 0.12,
        duration: 0.4,
        scrollTrigger: { trigger: "[data-dna]", start: "top 85%", once: true },
      });
      gsap.from(strengthsList, {
        opacity: 0,
        x: -24,
        stagger: 0.09,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: strengthsList[0] ?? root.current, start: "top 88%", once: true },
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="section about" id="about">
      <div className="section__head">
        <p className="kicker">01 — ABOUT</p>
        <p className="kicker">ENGINEERING PROFILE</p>
      </div>

      <div className="about__grid">
        <div className="about__main">
          <h2 className="display about__title" data-split>
            Akash Shinge. Engineer. <em>Builder.</em>
          </h2>
          <div data-reveal>
            <p className="about__lead">{profile.statement}</p>
            <p className="lede">
              Akash works across Java and Spring Boot services and the React
              interfaces that sit on them. The work is production work: contracts,
              data paths, messaging, and the screens that have to tell the truth
              about the system.
            </p>
          </div>

          <div className="about__strengths">
            <p className="kicker">TECHNICAL STRENGTHS</p>
            <ul>
              {strengths.map((item, index) => (
                <li key={item} data-strength>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="about__card" data-reveal>
          <ProfilePortrait treatment="about" src={profile.photoAlt} />
          <dl className="about__facts">
            <div>
              <dt>NAME</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>ROLE</dt>
              <dd>{profile.role}</dd>
            </div>
            {current ? (
              <div>
                <dt>NOW</dt>
                <dd>
                  {current.company} · {current.period}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>BASE</dt>
              <dd>{profile.location}</dd>
            </div>
            {leetcode.school ? (
              <div>
                <dt>SCHOOL</dt>
                <dd>{leetcode.school}</dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </div>

      <div className="about__stats">
        {profileStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <ol className="dna" data-dna aria-label="Engineering path from architecture to user">
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
