import { useRef } from "react";
import { useMediaFx } from "../../hooks/useMediaFx.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import type { ProfileStat } from "../../types/index.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { FxLayers } from "../media/FxLayers.tsx";

const shades = ["var(--accent)", "var(--accent-hot)", "var(--accent-cool)", "#8f9bff", "#c9a227", "#6db33f"];

interface StatCardProps {
  stat: ProfileStat;
}

/**
 * A number that counts up when it scrolls in, re-counts on hover / focus /
 * tap, and opens a labelled breakdown of what it is made of.
 */
export function StatCard({ stat }: StatCardProps) {
  const root = useRef<HTMLDivElement>(null);
  const number = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useMediaFx(root, { tilt: 6, magnetic: 0.03 });
  const total = stat.segments.reduce((sum, item) => sum + item.value, 0) || 1;

  useGSAP(
    () => {
      const el = number.current;
      if (!el || reduced) {
        return;
      }
      const counter = { value: 0 };
      el.textContent = "0";
      gsap.to(counter, {
        value: stat.value,
        duration: 1.8,
        ease: "power3.out",
        snap: { value: 1 },
        scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = String(counter.value);
        },
      });
      gsap.from(root.current?.querySelectorAll("[data-seg]") ?? [], {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
      });
    },
    { scope: root, dependencies: [reduced, stat.value], revertOnUpdate: true },
  );

  const recount = () => {
    const el = number.current;
    if (!el || reduced) {
      return;
    }
    const counter = { value: 0 };
    gsap.to(counter, {
      value: stat.value,
      duration: 0.9,
      ease: "power2.out",
      snap: { value: 1 },
      overwrite: true,
      onUpdate: () => {
        el.textContent = String(counter.value);
      },
    });
  };

  return (
    <div
      ref={root}
      className="stat fx"
      data-fx
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          recount();
        }
      }}
      onClick={recount}
    >
      <p className="sr-only">
        {stat.value}
        {stat.suffix ?? ""} {stat.label.toLowerCase()}
      </p>
      <p className="stat__value" aria-hidden="true">
        <span ref={number}>{stat.value}</span>
        {stat.suffix ? <span className="stat__suffix">{stat.suffix}</span> : null}
      </p>
      <p className="stat__label" aria-hidden="true">
        {stat.label}
      </p>
      <div className="stat__bar" aria-hidden="true">
        {stat.segments.map((item, index) => (
          <span
            key={item.label}
            data-seg
            style={{ flexGrow: item.value, background: shades[index % shades.length] }}
          />
        ))}
      </div>
      <ul className="stat__legend">
        {stat.segments.map((item, index) => (
          <li key={item.label}>
            <i style={{ background: shades[index % shades.length] }} aria-hidden="true" />
            {item.label}
            {stat.segments.length > 1 && total !== stat.segments.length ? (
              <span>{item.value}</span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="stat__detail">{stat.detail}</p>
      <FxLayers />
    </div>
  );
}
