import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { techCards } from "../../data/techCards.ts";
import type { CoreSkillId, TechCard } from "../../data/techCards.ts";
import { useMediaFx } from "../../hooks/useMediaFx.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { TechLogo } from "../hero/TechLogo.tsx";
import { FxLayers } from "../media/FxLayers.tsx";
import "./TechCards.css";

/**
 * The core stack as a grid of cards. Each logo has its own animation
 * (`data-motion`) that runs while the card is hovered, keyboard-focused, or
 * tapped active; the card glows in the tech's brand colour (`--tech`).
 */
export function TechCards() {
  const list = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState<CoreSkillId | null>(null);

  useGSAP(
    () => {
      const grid = list.current;
      if (reduced || !grid) {
        return;
      }
      // yPercent, not y: the per-card tilt drives x / y / rotation on the same element.
      gsap.from(grid.querySelectorAll<HTMLElement>("[data-tcard]"), {
        yPercent: 18,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      });
    },
    { scope: list, dependencies: [reduced], revertOnUpdate: true },
  );

  // A tapped card stays lit until it, another card, or anything outside the grid is tapped.
  useEffect(() => {
    if (!activeId) {
      return;
    }
    const onDown = (event: PointerEvent) => {
      const grid = list.current;
      if (grid && event.target instanceof Node && grid.contains(event.target)) {
        return;
      }
      setActiveId(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("pointerdown", onDown);
    };
  }, [activeId]);

  const toggle = (id: CoreSkillId) => {
    setActiveId((current) => (current === id ? null : id));
  };

  return (
    <ul ref={list} className="tcards" aria-label="Core technology stack">
      {techCards.map((card, index) => (
        <TechCardItem
          key={card.id}
          card={card}
          index={index}
          active={activeId === card.id}
          onToggle={toggle}
        />
      ))}
    </ul>
  );
}

interface TechCardItemProps {
  card: TechCard;
  index: number;
  active: boolean;
  onToggle: (id: CoreSkillId) => void;
}

function TechCardItem({ card, index, active, onToggle }: TechCardItemProps) {
  const root = useRef<HTMLLIElement>(null);
  // Pointer type of the last press: a mouse already gets hover, so only touch / pen taps toggle.
  const pointer = useRef("");
  useMediaFx(root, { tilt: 6, magnetic: 0.02 });

  return (
    <li
      ref={root}
      className={`tcard fx${active ? " is-active" : ""}`}
      data-fx
      data-tcard
      data-motion={card.motion}
      tabIndex={0}
      style={{ "--tech": card.color } as CSSProperties}
      onPointerDown={(event) => {
        pointer.current = event.pointerType;
      }}
      onClick={() => {
        if (pointer.current !== "mouse") {
          onToggle(card.id);
        }
      }}
    >
      <div className="tcard__head">
        <span className="tcard__tile" aria-hidden="true">
          {card.motion === "float" ? (
            <svg
              className="tcard__d tcard__d--1 tcard__wave"
              viewBox="0 0 48 6"
              preserveAspectRatio="none"
            >
              <path
                d="M0 3q3-2.6 6 0t6 0 6 0 6 0 6 0 6 0 6 0 6 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : (
            <i className="tcard__d tcard__d--1" />
          )}
          <i className="tcard__d tcard__d--2" />
          <i className="tcard__d tcard__d--3" />
          <span className="tcard__logo">
            <TechLogo id={card.id} />
          </span>
        </span>
        <span className="tcard__index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="tcard__name">{card.name}</h3>
      <p className="kicker tcard__cat">{card.category.toLowerCase()}</p>
      <p className="tcard__use">{card.use}</p>
      <FxLayers />
    </li>
  );
}
