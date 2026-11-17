import { useEffect, useRef } from "react";
import {
  createCursorMover,
  pressCursor,
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
    if (!enabled || !dot.current || !follower.current) {
      return;
    }

    const mover = createCursorMover(dot.current, follower.current);
    let lastKey = "";

    const onMove = (event: PointerEvent) => {
      root.current?.classList.add("is-on");
      mover.move(event.clientX, event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      if (!follower.current || !label.current) {
        return;
      }
      const next = readMode(event.target);
      const key = `${next.mode}|${next.label ?? ""}`;
      if (key === lastKey) {
        return;
      }
      lastKey = key;
      if (root.current) {
        root.current.dataset.mode = next.mode;
      }
      setCursorMode(follower.current, label.current, next.mode, next.label);
    };

    const onDown = () => {
      if (follower.current) {
        pressCursor(follower.current, true);
      }
    };

    const onUp = () => {
      if (follower.current) {
        pressCursor(follower.current, false);
      }
    };

    const onLeaveWindow = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        root.current?.classList.remove("is-on");
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onLeaveWindow);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
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
