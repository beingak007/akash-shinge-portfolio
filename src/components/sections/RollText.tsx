import type { CSSProperties } from "react";

interface RollTextProps {
  text: string;
}

/** Each character rolls up to a lit copy of itself, staggered left to right. */
export function RollText({ text }: RollTextProps) {
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((char, index) => {
        const glyph = char === " " ? " " : char;
        return (
          <span
            key={`${char}-${index}`}
            className="roll__char"
            data-char={glyph}
            style={{ "--i": index } as CSSProperties}
          >
            {glyph}
          </span>
        );
      })}
    </span>
  );
}
