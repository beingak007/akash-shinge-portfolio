import { useId, useSyncExternalStore } from "react";
import { haptic } from "../../utils/haptics.ts";
import { getTheme, subscribeTheme, toggleTheme, type Theme } from "../../utils/theme.ts";
import "./ThemeToggle.css";

const serverTheme = (): Theme => "dark";

/**
 * Sun ⇄ moon. One SVG: the core shrinks to a sun and grows rays in light mode;
 * a masked "bite" slides over it to make the moon in dark mode. Pure CSS
 * transforms keyed off <html data-theme>, so it is correct before React runs.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, serverTheme);
  const maskId = `${useId().replace(/:/g, "")}-moon`;
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      data-cursor="open"
      data-cursor-label={next === "light" ? "LIGHT" : "DARK"}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        haptic("tap");
        toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <mask id={maskId}>
          <rect width="24" height="24" fill="#fff" />
          <circle className="theme-toggle__bite" cx="17" cy="7" r="7.5" fill="#000" />
        </mask>
        <circle className="theme-toggle__core" cx="12" cy="12" r="8" mask={`url(#${maskId})`} />
        <g className="theme-toggle__rays">
          {Array.from({ length: 8 }, (_, index) => (
            <line
              key={index}
              x1="12"
              y1="1.6"
              x2="12"
              y2="3.8"
              transform={`rotate(${index * 45} 12 12)`}
            />
          ))}
        </g>
      </svg>
    </button>
  );
}
