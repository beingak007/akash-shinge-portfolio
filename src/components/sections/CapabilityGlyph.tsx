import type { CapabilityGlyph as GlyphKind } from "../../types/index.ts";

interface CapabilityGlyphProps {
  kind: GlyphKind;
}

/** Line drawings for "What I do". Every path uses pathLength=1 so CSS can draw it. */
export function CapabilityGlyph({ kind }: CapabilityGlyphProps) {
  return (
    <svg className="glyph" viewBox="0 0 120 90" aria-hidden="true">
      {kind === "backend" ? (
        <>
          <rect pathLength={1} x="20" y="10" width="80" height="18" />
          <rect pathLength={1} x="20" y="36" width="80" height="18" />
          <rect pathLength={1} x="20" y="62" width="80" height="18" />
          <path pathLength={1} d="M30 19h34M30 45h26M30 71h30" />
          <circle className="glyph__dot" cx="88" cy="19" r="2.6" />
          <circle className="glyph__dot" cx="88" cy="45" r="2.6" />
          <circle className="glyph__dot" cx="88" cy="71" r="2.6" />
        </>
      ) : null}
      {kind === "frontend" ? (
        <>
          <rect pathLength={1} x="12" y="8" width="96" height="74" />
          <path pathLength={1} d="M12 20h96" />
          <rect pathLength={1} x="22" y="30" width="36" height="42" />
          <path pathLength={1} d="M66 34h32M66 44h24M66 54h28M66 64h18" />
          <circle className="glyph__dot" cx="19" cy="14" r="2" />
          <circle className="glyph__dot" cx="26" cy="14" r="2" />
        </>
      ) : null}
      {kind === "distributed" ? (
        <>
          <path pathLength={1} d="M60 18 22 70h76zM60 18v30M22 70l38-22 38 22" />
          <circle pathLength={1} cx="60" cy="18" r="7" />
          <circle pathLength={1} cx="22" cy="70" r="7" />
          <circle pathLength={1} cx="98" cy="70" r="7" />
          <circle className="glyph__dot" cx="60" cy="48" r="5" />
        </>
      ) : null}
      {kind === "microservices" ? (
        <>
          <path pathLength={1} d="m60 6 15 8.5v17L60 40l-15-8.5v-17z" />
          <path pathLength={1} d="m40 44 15 8.5v17L40 78l-15-8.5v-17z" />
          <path pathLength={1} d="m80 44 15 8.5v17L80 78l-15-8.5v-17z" />
          <circle className="glyph__dot" cx="60" cy="23" r="3" />
          <circle className="glyph__dot" cx="40" cy="61" r="3" />
          <circle className="glyph__dot" cx="80" cy="61" r="3" />
        </>
      ) : null}
      {kind === "api" ? (
        <>
          <path
            pathLength={1}
            d="M36 10c-10 0-12 6-12 14v10c0 6-4 10-10 11 6 1 10 5 10 11v10c0 8 2 14 12 14M84 10c10 0 12 6 12 14v10c0 6 4 10 10 11-6 1-10 5-10 11v10c0 8-2 14-12 14"
          />
          <path pathLength={1} d="M44 45h32m-10-10 10 10-10 10" />
          <circle className="glyph__dot" cx="44" cy="45" r="3" />
        </>
      ) : null}
      {kind === "database" ? (
        <>
          <ellipse pathLength={1} cx="60" cy="16" rx="34" ry="9" />
          <path pathLength={1} d="M26 16v56c0 5 15 9 34 9s34-4 34-9V16" />
          <path pathLength={1} d="M26 35c0 5 15 9 34 9s34-4 34-9M26 54c0 5 15 9 34 9s34-4 34-9" />
          <circle className="glyph__dot" cx="82" cy="30" r="2.6" />
          <circle className="glyph__dot" cx="82" cy="49" r="2.6" />
        </>
      ) : null}
      {kind === "performance" ? (
        <>
          <path pathLength={1} d="M16 72a44 44 0 0 1 88 0" />
          <path pathLength={1} d="M24 50l7 4M42 32l4 6M60 26v8M78 32l-4 6M96 50l-7 4" />
          <path className="glyph__needle" pathLength={1} d="M60 72 86 40" />
          <circle className="glyph__dot" cx="60" cy="72" r="5" />
        </>
      ) : null}
    </svg>
  );
}
