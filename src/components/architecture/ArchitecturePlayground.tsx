import { useMemo, useRef, useState } from "react";
import { bindTilt3d } from "../../animations/tilt3d.ts";
import { playgroundEdges, playgroundNodes } from "../../data/technologies.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import type { PlaygroundNode } from "../../types/index.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { SystemSculpture } from "../scene/SystemSculpture.tsx";
import "./ArchitecturePlayground.css";

function nodeById(id: string): PlaygroundNode | undefined {
  return playgroundNodes.find((node) => node.id === id);
}

function connectedIds(id: string): Set<string> {
  const ids = new Set<string>([id]);
  for (const edge of playgroundEdges) {
    if (edge.from === id || edge.to === id) {
      ids.add(edge.from);
      ids.add(edge.to);
    }
  }
  return ids;
}

export function ArchitecturePlayground() {
  const svg = useRef<SVGSVGElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = activeId ? nodeById(activeId) : undefined;
  const related = activeId ? connectedIds(activeId) : new Set<string>();

  const pathD = useMemo(() => {
    return playgroundEdges.map((edge) => {
      const from = nodeById(edge.from);
      const to = nodeById(edge.to);
      if (!from || !to) {
        return null;
      }
      const midY = (from.y + to.y) / 2;
      return {
        id: edge.id,
        d: `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`,
        from: edge.from,
        to: edge.to,
      };
    }).filter((item): item is { id: string; d: string; from: string; to: string } =>
      Boolean(item),
    );
  }, []);

  useGSAP(
    () => {
      if (!svg.current || reduced) {
        return;
      }
      const paths = svg.current.querySelectorAll("[data-edge]");
      paths.forEach((path) => {
        const length = (path as SVGPathElement).getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 });
      });
    },
    { scope: svg, dependencies: [reduced] },
  );

  useGSAP(
    () => {
      if (!stage.current || reduced || !desktop) {
        return;
      }
      return bindTilt3d(stage.current, 6);
    },
    { dependencies: [reduced, desktop] },
  );

  useGSAP(
    () => {
      if (!svg.current || reduced || !activeId) {
        return;
      }
      const live = playgroundEdges.filter(
        (edge) => edge.from === activeId || edge.to === activeId,
      );
      live.forEach((edge) => {
        const path = svg.current?.querySelector<SVGPathElement>(
          `[data-edge="${edge.id}"]`,
        );
        if (!path) {
          return;
        }
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" },
        );
      });
    },
    { dependencies: [activeId, reduced] },
  );

  return (
    <section className="section playground" id="playground">
      <div className="section__head">
        <p className="kicker">ARCHITECTURE PLAYGROUND</p>
        <p className="kicker">INTERACT WITH THE GRAPH</p>
      </div>
      <h2 className="display playground__title" data-reveal>
        A small system, fully drawn.
      </h2>
      <p className="lede" data-reveal>
        A quote path that caches in Redis, publishes to Kafka, then fans into
        MySQL and Cassandra. Docker is how the consumers ship. Hover a node, or
        turn the 3D system and click a plane.
      </p>

      <p className="playground__desc" aria-live="polite">
        {active ? (
          <>
            <strong>{active.label}</strong>
            {active.description}
          </>
        ) : (
          "Select a node to inspect its responsibility."
        )}
      </p>

      <div ref={stage} className="playground__stage">
        <div className="playground__canvas">
        <svg
          ref={svg}
          className="playground__svg"
          viewBox="0 0 1080 480"
          role="img"
          aria-label="Colored quote system with Kafka, Redis, Cassandra, and Docker"
        >
          {pathD.map((edge) => (
            <path
              key={edge.id}
              data-edge={edge.id}
              d={edge.d}
              className={`playground__edge${
                activeId && (related.has(edge.from) && related.has(edge.to))
                  ? " is-live"
                  : ""
              }`}
            />
          ))}
          {playgroundNodes.map((node) => {
            const on = !activeId || related.has(node.id);
            return (
              <g
                key={node.id}
                transform={`translate(${node.x} ${node.y})`}
                className={`playground__node${on ? "" : " is-muted"}${
                  activeId === node.id ? " is-active" : ""
                }`}
              >
                <rect
                  x={-78}
                  y={-22}
                  width="156"
                  height="44"
                  rx="0"
                  fill={node.color}
                />
                <text
                  textAnchor="middle"
                  y="5"
                  fill={
                    ["#53c1de", "#e8a04a", "#f89820"].includes(node.color)
                      ? "#111111"
                      : "#ffffff"
                  }
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {playgroundNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className="playground__hit"
            style={{ left: `${(node.x / 1080) * 100}%`, top: `${(node.y / 480) * 100}%` }}
            data-cursor="view"
            onMouseEnter={() => {
              setActiveId(node.id);
            }}
            onMouseLeave={() => {
              setActiveId(null);
            }}
            onFocus={() => {
              setActiveId(node.id);
            }}
            onBlur={() => {
              setActiveId(null);
            }}
            onClick={() => {
              setActiveId((current) => (current === node.id ? null : node.id));
            }}
          >
            <span className="visually-hidden">{node.label}</span>
          </button>
        ))}
        </div>
      </div>
      <SystemSculpture />
    </section>
  );
}
