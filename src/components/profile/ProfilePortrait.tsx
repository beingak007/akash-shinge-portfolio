import { useRef } from "react";
import { profile } from "../../data/profile.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import "./ProfilePortrait.css";

type PortraitTreatment = "hero" | "about" | "nav" | "contact" | "card" | "leetcode";

interface ProfilePortraitProps {
  treatment: PortraitTreatment;
  className?: string;
  src?: string;
}

export function ProfilePortrait({
  treatment,
  className = "",
  src,
}: ProfilePortraitProps) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();

  useGSAP(
    () => {
      const frame = root.current;
      const image = frame?.querySelector<HTMLElement>("[data-portrait-img]");
      if (!frame || !image || reduced) {
        return;
      }

      if (treatment === "about") {
        gsap.fromTo(
          frame,
          { clipPath: "inset(12% 12% 12% 12%)", opacity: 0.4 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top 85%",
              end: "top 40%",
              scrub: 0.5,
            },
          },
        );
      }

      if (!desktop || treatment === "nav") {
        return;
      }

      const onMove = (event: PointerEvent) => {
        const bounds = frame.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(image, {
          x: x * 10,
          y: y * 8,
          scale: 1.04,
          duration: 0.7,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const reset = () => {
        gsap.to(image, {
          x: 0,
          y: 0,
          scale: 1.02,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      frame.addEventListener("pointermove", onMove);
      frame.addEventListener("pointerleave", reset);
      return () => {
        frame.removeEventListener("pointermove", onMove);
        frame.removeEventListener("pointerleave", reset);
      };
    },
    { scope: root, dependencies: [reduced, desktop, treatment] },
  );

  return (
    <div
      ref={root}
      className={`portrait portrait--${treatment} ${className}`.trim()}
      data-cursor="image"
      data-cursor-label="AKASH / ENGINEER"
    >
      <img
        data-portrait-img
        src={src ?? profile.photo}
        alt={`${profile.name}, ${profile.role}`}
        width={treatment === "leetcode" ? 747 : 591}
        height={treatment === "leetcode" ? 1024 : 942}
        sizes={
          treatment === "nav"
            ? "28px"
            : treatment === "leetcode"
              ? "(min-width: 900px) 280px, 60vw"
              : treatment === "hero"
                ? "(min-width: 1100px) 340px, 72vw"
                : "(min-width: 900px) 280px, 70vw"
        }
        loading={treatment === "hero" ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={treatment === "hero" ? "high" : "auto"}
      />
      <span className="portrait__grain" aria-hidden="true" />
    </div>
  );
}
