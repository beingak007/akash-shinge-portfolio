import { HeroSystem } from "../hero/HeroSystem.tsx";
import { SkillMarquee } from "./SkillMarquee.tsx";
import { TechCards } from "./TechCards.tsx";
import "./StackMap.css";

/**
 * Skills: the core stack in motion (marquee), as cards (one per technology),
 * and as a live request flow you can pull on (the workflow graph).
 */
export function StackMap() {
  return (
    <section className="section stack" id="expertise">
      <div className="section__head">
        <p className="kicker">03 — TECHNICAL SKILLS</p>
        <p className="kicker">CORE STACK</p>
      </div>
      <h2 className="display stack__title" data-split>
        An architecture, <em>not a list.</em>
      </h2>

      <SkillMarquee />

      <p className="lede stack__lede" data-reveal>
        Twelve tools in daily use. Hover or tap a card to see what each one does in
        the work.
      </p>

      <TechCards />

      <div className="stack__flow">
        <div className="stack__flow-copy" data-reveal>
          <p className="kicker">HOW A REQUEST MOVES</p>
          <h3 className="stack__flow-title">From the browser to the store, and back.</h3>
          <p className="lede">
            The same stack as a running system. Hover a node to pull on it; click it to
            strike it and watch the path react.
          </p>
        </div>
        <HeroSystem />
      </div>
    </section>
  );
}
