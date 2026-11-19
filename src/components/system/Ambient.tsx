import { useEffect, useRef } from "react";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import "./Ambient.css";

type Point = [number, number];

/** Where the three light sources sit (as viewport fractions) for each section. */
const presets: Record<string, [Point, Point, Point]> = {
  hero: [[0.78, 0.18], [0.08, 0.82], [0.46, 0.6]],
  about: [[0.14, 0.22], [0.86, 0.7], [0.52, 0.95]],
  services: [[0.86, 0.48], [0.18, 0.18], [0.5, 0.86]],
  expertise: [[0.5, 0.08], [0.92, 0.88], [0.1, 0.6]],
  work: [[0.2, 0.76], [0.82, 0.18], [0.6, 0.6]],
  experience: [[0.9, 0.3], [0.1, 0.62], [0.42, 0.08]],
  think: [[0.3, 0.3], [0.8, 0.8], [0.1, 0.9]],
  farmkart: [[0.7, 0.2], [0.2, 0.9], [0.9, 0.7]],
  code: [[0.2, 0.2], [0.8, 0.5], [0.5, 0.9]],
  terminal: [[0.8, 0.25], [0.15, 0.7], [0.55, 0.95]],
  problems: [[0.85, 0.15], [0.15, 0.55], [0.6, 0.9]],
  metrics: [[0.5, 0.5], [0.1, 0.1], [0.9, 0.9]],
  contact: [[0.5, 0.88], [0.14, 0.16], [0.86, 0.42]],
};

interface AmbientProps {
  sectionId: string;
}

export function Ambient({ sectionId }: AmbientProps) {
  const root = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();

  useGSAP(
    () => {
      const blobs = root.current?.querySelectorAll<HTMLElement>("[data-ambient-blob]");
      const preset = presets[sectionId] ?? presets.hero;
      if (!blobs || !preset) {
        return;
      }
      blobs.forEach((blob, index) => {
        const point = preset[index];
        if (!point) {
          return;
        }
        const vars = {
          x: () => point[0] * window.innerWidth,
          y: () => point[1] * window.innerHeight,
        };
        if (reduced) {
          gsap.set(blob, vars);
          return;
        }
        gsap.to(blob, {
          ...vars,
          duration: 2.4,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      });
    },
    { scope: root, dependencies: [sectionId, reduced] },
  );

  useEffect(() => {
    const light = spot.current;
    if (!light || !desktop || reduced) {
      return;
    }
    const toX = gsap.quickTo(light, "x", { duration: 0.9, ease: "power3.out" });
    const toY = gsap.quickTo(light, "y", { duration: 0.9, ease: "power3.out" });
    const onMove = (event: PointerEvent) => {
      light.classList.add("is-on");
      toX(event.clientX);
      toY(event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, [desktop, reduced]);

  return (
    <div ref={root} className="ambient" aria-hidden="true">
      <span className="ambient__blob ambient__blob--ember" data-ambient-blob>
        <i />
      </span>
      <span className="ambient__blob ambient__blob--cool" data-ambient-blob>
        <i />
      </span>
      <span className="ambient__blob ambient__blob--deep" data-ambient-blob>
        <i />
      </span>
      <span ref={spot} className="ambient__spot" />
      <span className="ambient__vignette" />
      <span className="ambient__grain" />
    </div>
  );
}
