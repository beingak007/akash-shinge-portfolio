import { useRef, useState } from "react";
import { capabilities } from "../../data/capabilities.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { CapabilityGlyph } from "./CapabilityGlyph.tsx";
import "./Capabilities.css";

export function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const desktop = useDesktopPointer();
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const showLens = desktop && !reduced;

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-cap-row]");
      if (!reduced) {
        rows.forEach((row) => {
          gsap
            .timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } })
            .fromTo(row, { "--rule": 0 }, { "--rule": 1, duration: 1.1, ease: "expo.out" }, 0)
            .from(
              row.querySelectorAll("[data-cap-rise]"),
              { yPercent: 60, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 },
              0.1,
            );
        });
      }

      const host = list.current;
      const glass = lens.current;
      if (!showLens || !host || !glass) {
        return;
      }
      // The lens trails the cursor across the list.
      const toX = gsap.quickTo(glass, "x", { duration: 0.6, ease: "power3.out" });
      const toY = gsap.quickTo(glass, "y", { duration: 0.6, ease: "power3.out" });
      const onMove = (event: PointerEvent) => {
        toX(event.clientX + 24);
        toY(event.clientY - 236);
      };
      // Jump (don't glide) to the cursor when it first enters the list.
      const onEnter = (event: PointerEvent) => {
        toX(event.clientX + 24, event.clientX + 24);
        toY(event.clientY - 236, event.clientY - 236);
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerenter", onEnter);
      return () => {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerenter", onEnter);
      };
    },
    { scope: root, dependencies: [reduced, showLens], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="section caps" id="services">
      <div className="section__head">
        <p className="kicker">02 — WHAT I DO</p>
        <p className="kicker">DISCIPLINES</p>
      </div>
      <div className="caps__intro">
        <h2 className="display caps__title" data-split>
          What I <em>do.</em>
        </h2>
        <p className="lede" data-reveal>
          Seven disciplines, one job: systems that stay understandable after they
          ship — from the service contract down to the query plan, and up to the
          screen someone actually uses.
        </p>
      </div>

      <ul
        ref={list}
        className={`caps__list${activeId ? " has-active" : ""}`}
        onPointerLeave={() => {
          setActiveId(null);
        }}
      >
        {capabilities.map((item) => (
          <li
            key={item.id}
            className={`caps__row${activeId === item.id ? " is-active" : ""}`}
            data-cap-row
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                setActiveId(item.id);
              }
            }}
          >
            <span className="caps__index" data-cap-rise>
              {item.index}
            </span>
            <h3 className="caps__name" data-cap-rise>
              <span>{item.title}</span>
            </h3>
            <p className="caps__body" data-cap-rise>
              {item.body}
            </p>
            <ul className="caps__tags" data-cap-rise aria-label="Tools">
              {item.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <span className="caps__glyph" aria-hidden="true">
              <CapabilityGlyph kind={item.glyph} />
            </span>
          </li>
        ))}
      </ul>

      {showLens ? (
        <div ref={lens} className={`caps__lens${activeId ? " is-on" : ""}`} aria-hidden="true">
          {capabilities.map((item) => (
            <div
              key={item.id}
              className={`caps__lens-item${activeId === item.id ? " is-on" : ""}`}
            >
              <CapabilityGlyph kind={item.glyph} />
              <span>
                {item.index} — {item.title.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
