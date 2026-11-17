import { useId, type CSSProperties } from "react";
import type { Project, ProjectCoverNode } from "../../types/index.ts";
import "./ProjectCover.css";

const W = 1600;
const H = 1000;
const CHAR = 15;

function nodeWidth(node: ProjectCoverNode): number {
  return node.w ?? node.label.length * CHAR + 64;
}

function nodeHeight(node: ProjectCoverNode): number {
  return node.hub ? 78 : 58;
}

/** Edge anchor on a node's border, so wide nodes (a topic spine) take edges along their span. */
function anchor(node: ProjectCoverNode, toward: ProjectCoverNode): { x: number; y: number } {
  const half = nodeWidth(node) / 2;
  const vertical = Math.abs(toward.y - node.y) > Math.abs(toward.x - node.x) * 0.6;
  if (vertical) {
    const x = node.w ? Math.max(node.x - half + 60, Math.min(node.x + half - 60, toward.x)) : node.x;
    const y = node.y + (toward.y > node.y ? 1 : -1) * (nodeHeight(node) / 2);
    return { x, y };
  }
  return { x: node.x + (toward.x > node.x ? half : -half), y: node.y };
}

function edgePath(from: ProjectCoverNode, to: ProjectCoverNode): string {
  const a = anchor(from, to);
  const b = anchor(to, from);
  const vertical = Math.abs(b.y - a.y) > Math.abs(b.x - a.x) * 0.6;
  if (vertical) {
    const mid = (a.y + b.y) / 2;
    return `M${a.x} ${a.y} C${a.x} ${mid} ${b.x} ${mid} ${b.x} ${b.y}`;
  }
  const mid = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
}

interface ProjectCoverProps {
  project: Project;
  className?: string;
}

/**
 * The project's preview image: a lit system diagram generated from its own
 * components. Replaced by `project.image` when a real screenshot exists.
 */
export function ProjectCover({ project, className = "" }: ProjectCoverProps) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    bg: `${uid}-bg`,
    glow: `${uid}-glow`,
    grid: `${uid}-grid`,
    flow: `${uid}-flow`,
    halo: `${uid}-halo`,
  };
  const { cover, accent } = project;
  const byId = new Map(cover.nodes.map((node) => [node.id, node]));
  const edges = cover.edges
    .map(([fromId, toId]) => {
      const from = byId.get(fromId);
      const to = byId.get(toId);
      if (!from || !to) {
        return null;
      }
      return { id: `${fromId}-${toId}`, d: edgePath(from, to), ghost: Boolean(from.ghost || to.ghost) };
    })
    .filter((edge): edge is { id: string; d: string; ghost: boolean } => Boolean(edge));

  if (project.image) {
    return (
      <img
        className={`cover cover--image ${className}`.trim()}
        src={project.image}
        alt={`${project.name} preview`}
        loading="lazy"
        decoding="async"
        data-fx-media
      />
    );
  }

  return (
    <span
      className={`cover ${className}`.trim()}
      style={{ "--cover-accent": accent } as CSSProperties}
      data-fx-media
    >
      {/* Static scene: rasterised once, never repainted by the flow animation. */}
      <svg
        className="cover__scene"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`${project.name} system diagram: ${cover.nodes
          .filter((node) => !node.ghost)
          .map((node) => node.label.toLowerCase())
          .join(", ")}`}
      >
        <defs>
          <linearGradient id={ids.bg} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#161411" />
            <stop offset="1" stopColor="#090908" />
          </linearGradient>
          <radialGradient
            id={ids.glow}
            cx={cover.glow.x / W}
            cy={cover.glow.y / H}
            r="0.62"
            gradientTransform={`translate(${cover.glow.x / W} ${cover.glow.y / H}) scale(1 1.6) translate(${-cover.glow.x / W} ${-cover.glow.y / H})`}
          >
            <stop offset="0" stopColor={accent} stopOpacity="0.42" />
            <stop offset="0.45" stopColor={accent} stopOpacity="0.1" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={ids.halo}>
            <stop offset="0" stopColor={accent} stopOpacity="0.55" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <pattern id={ids.grid} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(236,231,220,0.05)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill={`url(#${ids.bg})`} />
        <rect width={W} height={H} fill={`url(#${ids.grid})`} />
        <rect width={W} height={H} fill={`url(#${ids.glow})`} />

        <text className="cover__numeral" x={W - 40} y={H - 30} textAnchor="end">
          {project.index}
        </text>

        {edges.map((edge) => (
          <path key={edge.id} className={`cover__edge${edge.ghost ? " is-ghost" : ""}`} d={edge.d} />
        ))}

        {cover.nodes.map((node) => {
          const w = nodeWidth(node);
          const h = nodeHeight(node);
          return (
            <g
              key={node.id}
              className={`cover__node${node.hub ? " is-hub" : ""}${node.ghost ? " is-ghost" : ""}`}
              transform={`translate(${node.x} ${node.y})`}
            >
              {node.hub ? (
                <ellipse rx={w / 2 + 120} ry={h + 70} fill={`url(#${ids.halo})`} opacity="0.55" />
              ) : null}
              <rect x={-w / 2} y={-h / 2} width={w} height={h} />
              {node.ghost ? null : <rect className="cover__pip" x={-w / 2 + 18} y={-4} width="8" height="8" />}
              <text x={node.ghost ? 0 : 10} y="7" textAnchor="middle">
                {node.label}
              </text>
            </g>
          );
        })}

        <g className="cover__chrome">
          <text x="56" y="78">
            {project.index} — {project.name}
          </text>
          <text x={W - 56} y="78" textAnchor="end">
            {project.kind === "study" ? "SYSTEM STUDY" : "SHIPPED"}
          </text>
        </g>
      </svg>

      {/* Flow overlay: its own layer, so moving packets repaint only this. */}
      <svg
        className="cover__flow"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={ids.flow} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
            <stop offset="0" stopColor={accent} />
            <stop offset="0.55" stopColor="#f3b27a" />
            <stop offset="1" stopColor="#6cc5b8" />
          </linearGradient>
        </defs>
        {edges
          .filter((edge) => !edge.ghost)
          .map((edge) => (
            <path key={edge.id} className="cover__packet" d={edge.d} stroke={`url(#${ids.flow})`} />
          ))}
      </svg>
    </span>
  );
}
