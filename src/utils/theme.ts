/**
 * Light / dark theme as a tiny external store on <html data-theme>.
 *
 * - First paint: the inline script in index.html picks the saved choice, else
 *   the OS preference, before any CSS applies — no flash of the wrong theme.
 * - Switching: a circular View Transition grows from the toggle where the
 *   browser supports it; otherwise (or with reduced motion) it swaps instantly.
 * - Until the visitor chooses, the site keeps following the OS setting.
 */
export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

const META_COLORS: Record<Theme, string> = {
  dark: "#07070b",
  light: "#f6f3ee",
};

interface ViewTransitionLike {
  ready: Promise<void>;
}

type DocumentWithTransitions = Document & {
  startViewTransition?: (update: () => void) => ViewTransitionLike;
};

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLORS[theme]);
  listeners.forEach((listener) => {
    listener();
  });
}

export function setTheme(next: Theme, origin?: { x: number; y: number }): void {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }

  const doc = document as DocumentWithTransitions;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced) {
    apply(next);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = doc.startViewTransition(() => {
    apply(next);
  });
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 700,
          easing: "cubic-bezier(0.76, 0, 0.24, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      // Transition skipped (e.g. tab hidden); the theme is already applied.
    });
}

export function toggleTheme(origin?: { x: number; y: number }): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next, origin);
  return next;
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Keep following the OS theme until the visitor makes an explicit choice. */
export function followSystemTheme(): () => void {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  const onChange = () => {
    if (!savedTheme()) {
      apply(media.matches ? "light" : "dark");
    }
  };
  media.addEventListener("change", onChange);
  return () => {
    media.removeEventListener("change", onChange);
  };
}
