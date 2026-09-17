import { useEffect, useMemo, useRef, useState } from "react";
import {
  edgeBias,
  elbowPath,
  farmKartEdges,
  farmKartFocus,
  farmKartLanes,
  farmKartMarks,
  farmKartNeighborhood,
  farmKartNode,
  farmKartNodes,
  farmKartStack,
  farmKartViewBox,
  farmKartViews,
} from "../../data/farmKart.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import type { FarmKartView } from "../../types/index.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import "./FarmKart.css";

function isView(id: string): id is FarmKartView {
  return id !== "contact";
}

export function FarmKart() {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const flowRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const reduced = useReducedMotion();
  const [view, setView] = useState<FarmKartView>("architecture");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const activeId = pinnedId ?? hoverId;
  const active = activeId ? farmKartNode(activeId) : undefined;
  const related = activeId ? farmKartNeighborhood(activeId) : null;
  const focus = farmKartFocus[view];

  const paths = useMemo(() => {
    return farmKartEdges
      .map((edge) => {
        const from = farmKartNode(edge.from);
        const to = farmKartNode(edge.to);
        if (!from || !to) {
          return null;
        }
        return {
          ...edge,
          d: elbowPath(from, to, edgeBias(edge.id), edge.kind),
        };
      })
      .filter(
        (item): item is (typeof farmKartEdges)[number] & { d: string } =>
          Boolean(item),
      );
  }, []);

  const visible = (id: string) => {
    if (related) {
      return related.has(id);
    }
    if (focus) {
      return focus.includes(id);
    }
    return true;
  };

  const edgeLive = (from: string, to: string) => {
    if (related) {
      return related.has(from) && related.has(to);
    }
    if (focus) {
      return focus.includes(from) && focus.includes(to);
    }
    return true;
  };

  useGSAP(
    () => {
      if (!root.current || reduced) {
        return;
      }
      const nodes = root.current.querySelectorAll("[data-fk-node]");
      const lines = root.current.querySelectorAll<SVGPathElement>("[data-fk-edge]");
      gsap.set(nodes, { autoAlpha: 0, y: 16 });
      lines.forEach((line) => {
        const length = line.getTotalLength();
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
      });
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 72%",
          once: true,
        },
      });
      timeline
        .to(
          lines,
          {
            strokeDashoffset: 0,
            duration: 1.15,
            stagger: 0.028,
            ease: "power2.out",
          },
          0,
        )
        .to(
          nodes,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.035,
            ease: "power3.out",
          },
          0.18,
        )
        .add(() => {
          gsap.set(nodes, { clearProps: "opacity,visibility,transform" });
          lines.forEach((line) => {
            gsap.set(line, { clearProps: "strokeDasharray,strokeDashoffset" });
          });
        });
    },
    { scope: root, dependencies: [reduced] },
  );

  useGSAP(
    () => {
      if (!svg.current || reduced || !activeId) {
        return;
      }
      const live = farmKartEdges.filter(
        (edge) => edge.from === activeId || edge.to === activeId,
      );
      live.forEach((edge) => {
        const path = pathRefs.current[edge.id];
        if (!path) {
          return;
        }
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.65, ease: "power2.out" },
        );
      });
    },
    { dependencies: [activeId, reduced] },
  );

  useEffect(() => {
    if (reduced) {
      return;
    }
    let frame = 0;
    const tick = (now: number) => {
      paths.forEach((edge, index) => {
        if (edge.kind !== "async") {
          return;
        }
        const path = pathRefs.current[edge.id];
        const dot = flowRefs.current[edge.id];
        if (!path || !dot) {
          return;
        }
        const length = path.getTotalLength();
        if (length < 2) {
          return;
        }
        const t = ((now / 3200 + index * 0.11) % 1);
        const point = path.getPointAtLength(t * length);
        dot.setAttribute("cx", String(point.x));
        dot.setAttribute("cy", String(point.y));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [paths, reduced]);

  const onView = (id: (typeof farmKartViews)[number]["id"]) => {
    if (id === "contact") {
      scrollToSection("contact", reduced);
      return;
    }
    if (isView(id)) {
      setView(id);
      setPinnedId(null);
    }
  };

  return (
    <section ref={root} className="farmkart" id="farmkart">
      <header className="farmkart__head">
        <div>
          <h2 className="farmkart__title">FARM KART</h2>
          <p className="farmkart__sub">MICROSERVICES ARCHITECTURE</p>
        </div>
        <nav className="farmkart__nav" aria-label="Farm Kart layers">
          {farmKartViews.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`farmkart__nav-btn${item.id === view ? " is-on" : ""}`}
              data-cursor="open"
              onClick={() => {
                onView(item.id);
              }}
            >
              <span>{item.index}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <p className="farmkart__tag" data-reveal>
        Distributed commerce, designed as a system.
      </p>
      <p className="farmkart__hint">
        SELECT A NODE TO INSPECT ITS RESPONSIBILITY.
      </p>

      <div className="farmkart__board">
        <div
          className="farmkart__stage"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setPinnedId(null);
            }
          }}
        >
          <div className="farmkart__grid" aria-hidden="true" />
          <div className="farmkart__canvas">
            <svg
              ref={svg}
              className="farmkart__svg"
              viewBox={`0 0 ${farmKartViewBox.w} ${farmKartViewBox.h}`}
              role="img"
              aria-label="Farm Kart microservices architecture"
              onClick={() => {
                setPinnedId(null);
              }}
            >
              <rect
                className="farmkart__runtime"
                x="70"
                y="250"
                width="1540"
                height="290"
              />
              <text className="farmkart__runtime-label" x="86" y="272">
                RUNTIME // DOCKER · KUBERNETES
              </text>
              {farmKartLanes.map((lane) => (
                <text
                  key={lane.id}
                  className="farmkart__lane"
                  x="28"
                  y={lane.y + 4}
                >
                  {lane.index} // {lane.label}
                </text>
              ))}
              <text className="farmkart__caption" x="700" y="678" textAnchor="middle">
                TRANSACTIONAL
              </text>
              <text className="farmkart__caption" x="990" y="678" textAnchor="middle">
                WIDE COLUMN
              </text>
              <text className="farmkart__caption" x="1280" y="678" textAnchor="middle">
                EVENT / SCALE
              </text>
              {farmKartMarks.map((mark) => (
                <text
                  key={mark.id}
                  className="farmkart__mark"
                  x={mark.x}
                  y={mark.y}
                  textAnchor="end"
                >
                  {mark.label}
                </text>
              ))}
              {paths.map((edge) => {
                const live = !activeId && !focus ? true : edgeLive(edge.from, edge.to);
                return (
                  <g key={edge.id}>
                    <path
                      ref={(el) => {
                        pathRefs.current[edge.id] = el;
                      }}
                      data-fk-edge={edge.id}
                      d={edge.d}
                      className={`farmkart__edge farmkart__edge--${edge.kind}${
                        live ? " is-live" : " is-dim"
                      }${
                        activeId &&
                        (edge.from === activeId || edge.to === activeId)
                          ? " is-hot"
                          : ""
                      }`}
                    />
                    {!reduced && edge.kind === "async" ? (
                      <circle
                        ref={(el) => {
                          flowRefs.current[edge.id] = el;
                        }}
                        className={`farmkart__packet${live ? "" : " is-dim"}`}
                        r="2.6"
                      />
                    ) : null}
                  </g>
                );
              })}
            </svg>

            {farmKartNodes.map((node) => {
              const on = visible(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  data-fk-node={node.id}
                  className={`farmkart__node${on ? "" : " is-dim"}${
                    activeId === node.id ? " is-on" : ""
                  }`}
                  style={{
                    left: `${(node.x / farmKartViewBox.w) * 100}%`,
                    top: `${(node.y / farmKartViewBox.h) * 100}%`,
                    background: node.color,
                    color: node.ink,
                  }}
                  data-cursor="view"
                  aria-pressed={pinnedId === node.id}
                  onMouseEnter={() => {
                    setHoverId(node.id);
                  }}
                  onMouseLeave={() => {
                    setHoverId(null);
                  }}
                  onFocus={() => {
                    setHoverId(node.id);
                  }}
                  onBlur={() => {
                    setHoverId(null);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPinnedId((current) =>
                      current === node.id ? null : node.id,
                    );
                  }}
                >
                  {node.label}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="farmkart__panel" aria-live="polite">
          {active ? (
            <>
              <p className="farmkart__panel-kicker">
                {active.lane.toUpperCase()}
              </p>
              <h3>{active.label}</h3>
              <dl>
                <div>
                  <dt>RESPONSIBILITY</dt>
                  <dd>{active.responsibility}</dd>
                </div>
                <div>
                  <dt>TECHNOLOGY</dt>
                  <dd>{active.technology}</dd>
                </div>
                <div>
                  <dt>DEPENDENCIES</dt>
                  <dd>{active.dependencies.join(" · ")}</dd>
                </div>
                <div>
                  <dt>COMMUNICATION</dt>
                  <dd>{active.communication}</dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <p className="farmkart__panel-kicker">SYSTEM</p>
              <h3>NO NODE SELECTED</h3>
              <p className="farmkart__panel-idle">
                Select a node to inspect its responsibility. Paths light when a
                service is in play. Kafka stays the spine.
              </p>
            </>
          )}
        </aside>
      </div>

      <footer className="farmkart__meta">
        <p>
          {farmKartStack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
        <p>FARM KART // SYSTEM ARCHITECTURE</p>
      </footer>
    </section>
  );
}
