import { useEffect, useRef, useState, type PointerEvent } from "react";
import { colorFor } from "../../data/techColors.ts";
import {
  workflowCopy,
  workflowEdges,
  workflowLanes,
  workflowNodes,
} from "../../data/heroWorkflow.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { TechLogo } from "./TechLogo.tsx";
import "./HeroSystem.css";

interface Body {
  id: string;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const SPRING = 0.14;
const DAMP = 0.8;
const ATTRACT_RADIUS = 150;
const ATTRACT = 0.34;
const REPEL = 18;
const MAX_PULL = 54;

function connectedTo(id: string): Set<string> {
  const ids = new Set<string>([id]);
  for (const edge of workflowEdges) {
    if (edge.from === id || edge.to === id) {
      ids.add(edge.from);
      ids.add(edge.to);
    }
  }
  return ids;
}

export function HeroSystem() {
  const stage = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lineRefs = useRef<Record<string, SVGLineElement | null>>({});
  const flowRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const bodies = useRef<Body[]>([]);
  const mouse = useRef({ x: 0, y: 0, inside: false });
  const hover = useRef<string | null>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const [activeId, setActiveId] = useState<string | null>(null);
  const live = activeId
    ? workflowCopy[activeId]
    : desktop
      ? "Hover a logo. Nodes attract, the workflow keeps moving."
      : "Tap a logo to see how it moves through the system.";
  const hot = activeId ? connectedTo(activeId) : null;

  useEffect(() => {
    const root = stage.current;
    if (!root) {
      return;
    }

    const measure = () => {
      const box = root.getBoundingClientRect();
      bodies.current = workflowNodes.map((node) => {
        const prev = bodies.current.find((body) => body.id === node.id);
        const homeX = (node.x / 100) * box.width;
        const homeY = (node.y / 100) * box.height;
        const compact = box.width < 560;
        return {
          id: node.id,
          homeX,
          homeY,
          x: prev?.x ?? homeX,
          y: prev?.y ?? homeY,
          vx: prev?.vx ?? 0,
          vy: prev?.vy ?? 0,
          radius: node.hub ? (compact ? 22 : 36) : compact ? 16 : 28,
        };
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);

    if (reduced) {
      return () => {
        observer.disconnect();
      };
    }

    let frame = 0;
    let elapsed = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      elapsed += dt;
      const list = bodies.current;
      const pointer = desktop && mouse.current.inside;
      const focus = hover.current;
      const related = focus ? connectedTo(focus) : null;

      for (const body of list) {
        let fx = (body.homeX - body.x) * SPRING;
        let fy = (body.homeY - body.y) * SPRING;

        if (pointer) {
          const dx = mouse.current.x - body.x;
          const dy = mouse.current.y - body.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < ATTRACT_RADIUS) {
            const falloff = 1 - dist / ATTRACT_RADIUS;
            const pull = ATTRACT * falloff * falloff * (focus === body.id ? 1.7 : 1);
            fx += (dx / dist) * pull * 18;
            fy += (dy / dist) * pull * 18;
          }
        }

        if (focus && related?.has(body.id) && focus !== body.id) {
          const target = list.find((item) => item.id === focus);
          if (target) {
            fx += (target.x - body.x) * 0.018;
            fy += (target.y - body.y) * 0.018;
          }
        }

        fy += Math.sin(elapsed * 0.08 + body.homeX * 0.02) * 0.12;

        for (const other of list) {
          if (other.id === body.id) {
            continue;
          }
          const dx = body.x - other.x;
          const dy = body.y - other.y;
          const dist = Math.hypot(dx, dy) || 1;
          const min = body.radius + other.radius;
          if (dist < min) {
            const force = ((min - dist) / min) * REPEL;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        }

        body.vx = (body.vx + fx) * DAMP;
        body.vy = (body.vy + fy) * DAMP;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        const pull = list[0] && list[0].radius < 24 ? 16 : MAX_PULL;
        body.x = body.homeX + Math.max(-pull, Math.min(pull, body.x - body.homeX));
        body.y = body.homeY + Math.max(-pull, Math.min(pull, body.y - body.homeY));
      }

      for (const body of list) {
        const el = nodeRefs.current[body.id];
        if (!el) {
          continue;
        }
        const scale = focus === body.id ? 1.12 : 1;
        el.style.transform = `translate3d(calc(-50% + ${body.x - body.homeX}px), calc(-50% + ${body.y - body.homeY}px), 0) scale(${scale})`;
      }

      for (const edge of workflowEdges) {
        const from = list.find((body) => body.id === edge.from);
        const to = list.find((body) => body.id === edge.to);
        const line = lineRefs.current[edge.id];
        if (!from || !to || !line) {
          continue;
        }
        line.setAttribute("x1", String(from.x));
        line.setAttribute("y1", String(from.y));
        line.setAttribute("x2", String(to.x));
        line.setAttribute("y2", String(to.y));

        const particle = flowRefs.current[edge.id];
        if (particle) {
          const t = (elapsed * 0.035 + edge.id.length * 0.08) % 1;
          particle.setAttribute("cx", String(from.x + (to.x - from.x) * t));
          particle.setAttribute("cy", String(from.y + (to.y - from.y) * t));
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [desktop, reduced]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = stage.current?.getBoundingClientRect();
    if (!box) {
      return;
    }
    mouse.current.x = event.clientX - box.left;
    mouse.current.y = event.clientY - box.top;
    mouse.current.inside = true;
  };

  return (
    <div className="hero-system" data-hero-system>
      <p className="hero-system__label">
        {desktop ? "WORKFLOW · HOVER TO ATTRACT" : "WORKFLOW · TAP A LOGO"}
      </p>
      <div
        ref={stage}
        className="hero-system__stage"
        onPointerMove={onPointerMove}
        onPointerEnter={onPointerMove}
        onPointerLeave={() => {
          mouse.current.inside = false;
          if (desktop) {
            hover.current = null;
            setActiveId(null);
          }
        }}
      >
        <svg className="hero-system__wires" aria-hidden="true">
          {workflowLanes.map((lane) => (
            <text
              key={lane.id}
              className="hero-system__lane"
              x="8"
              y={`${lane.y}%`}
            >
              {lane.label}
            </text>
          ))}
          {workflowEdges.map((edge) => {
            const from = workflowNodes.find((node) => node.id === edge.from);
            const to = workflowNodes.find((node) => node.id === edge.to);
            const on = !hot || (hot.has(edge.from) && hot.has(edge.to));
            return (
              <g key={edge.id} className={on ? "" : "is-dim"}>
                <line
                  ref={(el) => {
                    lineRefs.current[edge.id] = el;
                  }}
                  className="hero-system__wire"
                  x1={`${from?.x ?? 0}%`}
                  y1={`${from?.y ?? 0}%`}
                  x2={`${to?.x ?? 0}%`}
                  y2={`${to?.y ?? 0}%`}
                  stroke={colorFor(edge.to)}
                />
                {!reduced && (
                  <circle
                    ref={(el) => {
                      flowRefs.current[edge.id] = el;
                    }}
                    className="hero-system__packet"
                    r="3.2"
                    fill={colorFor(edge.to)}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {workflowNodes.map((node) => {
          const on = !hot || hot.has(node.id);
          return (
            <button
              key={node.id}
              type="button"
              ref={(el) => {
                nodeRefs.current[node.id] = el;
              }}
              className={`hero-system__node${node.hub ? " is-hub" : ""}${
                activeId === node.id ? " is-hot" : ""
              }${on ? "" : " is-dim"}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              data-cursor="view"
              onPointerEnter={() => {
                hover.current = node.id;
                setActiveId(node.id);
              }}
              onPointerLeave={() => {
                if (desktop) {
                  hover.current = null;
                  setActiveId(null);
                }
              }}
              onFocus={() => {
                hover.current = node.id;
                setActiveId(node.id);
              }}
              onBlur={() => {
                if (desktop) {
                  hover.current = null;
                  setActiveId(null);
                }
              }}
            >
              <span className="hero-system__mark">
                <TechLogo id={node.id} />
              </span>
              <span>{node.label}</span>
            </button>
          );
        })}
      </div>
      <p className="hero-system__live" aria-live="polite">
        {activeId ? <strong>{activeId.toUpperCase()}</strong> : null}
        {live}
      </p>
    </div>
  );
}
