import { useEffect, useRef } from "react";
import {
  moveCursorDot,
  moveCursorFollower,
  setCursorMode,
} from "../../animations/cursorAnimations.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import type { CursorMode } from "../../types/index.ts";
import "./CustomCursor.css";

const modes: CursorMode[] = [
  "hover",
  "view",
  "open",
  "image",
  "drag",
  "magnetic",
];

function readMode(target: EventTarget | null): {
  mode: CursorMode;
  label?: string;
} {
  if (!(target instanceof Element)) {
    return { mode: "default" };
  }
  const host = target.closest("[data-cursor]");
  const value = host?.getAttribute("data-cursor");
  const label = host?.getAttribute("data-cursor-label") ?? undefined;
  if (value && modes.includes(value as CursorMode)) {
    return { mode: value as CursorMode, label };
  }
  if (target.closest("a, button")) {
    return { mode: "hover" };
  }
  return { mode: "default" };
}

export function CustomCursor() {
  const enabled = useDesktopPointer();
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    document.body.classList.toggle("has-custom-cursor", enabled);
    return () => {
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onMove = (event: PointerEvent) => {
      if (!dot.current || !follower.current) {
        return;
      }
      root.current?.classList.add("is-on");
      moveCursorDot(dot.current, event.clientX, event.clientY);
      moveCursorFollower(follower.current, event.clientX, event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      if (!follower.current || !label.current) {
        return;
      }
      const next = readMode(event.target);
      setCursorMode(follower.current, label.current, next.mode, next.label);
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <div ref={dot} className="cursor__dot" />
      <div ref={follower} className="cursor__follow">
        <span ref={label} className="cursor__label" />
      </div>
    </div>
  );
}
