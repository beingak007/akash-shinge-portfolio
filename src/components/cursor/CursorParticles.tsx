import { useEffect, useRef } from "react";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { subscribeTheme } from "../../utils/theme.ts";
import "./CursorParticles.css";

/** Palette slots from the theme tokens; repeats weight the first two tones. */
const COLOR_TOKENS = ["--particle-1", "--particle-2", "--particle-4", "--particle-1", "--particle-2", "--particle-3"];

function themeColors(): string[] {
  const style = getComputedStyle(document.documentElement);
  return COLOR_TOKENS.map((token) => style.getPropertyValue(token).trim() || "#a78bfa");
}

/** Additive glow on dark; normal blending on light, where "lighter" washes out to white. */
function themeBlend(): GlobalCompositeOperation {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--particle-blend").trim();
  return value === "source-over" ? "source-over" : "lighter";
}
const MAX_PARTICLES = 220;
const SPACING = 6; // px of pointer travel per emitted particle
const MAX_PER_MOVE = 6;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  sprite: number;
}

function rgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Pre-rendered glow disc: drawing an image is far cheaper than a live gradient or shadowBlur. */
function makeSprite(color: string): HTMLCanvasElement | null {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) {
    return null;
  }
  const half = size / 2;
  const glow = ctx.createRadialGradient(half, half, 0, half, half, half);
  glow.addColorStop(0, "rgba(255, 248, 238, 1)");
  glow.addColorStop(0.16, rgba(color, 0.95));
  glow.addColorStop(0.42, rgba(color, 0.32));
  glow.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Glowing ember particles that trail the mouse and burst on click.
 *
 * Built to cost nothing at rest: one fixed canvas, sprite blits with additive
 * blending, only the previous frame's dirty rectangle is cleared, and the
 * animation loop stops as soon as the last particle fades. Desktop pointers
 * only; off for touch and for prefers-reduced-motion.
 */
export function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desktop = useDesktopPointer();
  const reduced = useReducedMotion();
  const enabled = desktop && !reduced;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const buildSprites = () =>
      themeColors()
        .map(makeSprite)
        .filter((s): s is HTMLCanvasElement => Boolean(s));
    let sprites = buildSprites();
    let blend = themeBlend();
    if (sprites.length === 0) {
      return;
    }
    // Re-tint on theme change; embers already in flight keep their slot.
    const stopTheme = subscribeTheme(() => {
      sprites = buildSprites();
      blend = themeBlend();
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pool: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let prevX = -1;
    let prevY = -1;
    // Region painted last frame; only this is cleared next frame.
    let dirty = { x0: 0, y0: 0, x1: 0, y1: 0 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = { x0: 0, y0: 0, x1: width, y1: height };
    };

    const spawn = (x: number, y: number, vx: number, vy: number, radius: number, life: number) => {
      if (pool.length >= MAX_PARTICLES) {
        pool.shift();
      }
      pool.push({
        x,
        y,
        vx,
        vy,
        life,
        maxLife: life,
        radius,
        sprite: Math.floor(Math.random() * sprites.length),
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;

      ctx.clearRect(dirty.x0, dirty.y0, dirty.x1 - dirty.x0, dirty.y1 - dirty.y0);
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;

      ctx.globalCompositeOperation = blend;
      for (let i = pool.length - 1; i >= 0; i -= 1) {
        const p = pool[i];
        if (!p) {
          continue;
        }
        p.life -= dt;
        if (p.life <= 0) {
          pool.splice(i, 1);
          continue;
        }
        // Embers: drag, a gentle lift, and a little sideways flicker.
        p.vx = p.vx * 0.93 + random(-14, 14) * dt;
        p.vy = p.vy * 0.93 - 26 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const t = p.life / p.maxLife;
        const r = p.radius * (0.35 + 0.65 * t);
        const sprite = sprites[p.sprite] ?? sprites[0];
        if (!sprite) {
          continue;
        }
        ctx.globalAlpha = t * t * 0.9 + 0.1 * t;
        ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);

        x0 = Math.min(x0, p.x - r);
        y0 = Math.min(y0, p.y - r);
        x1 = Math.max(x1, p.x + r);
        y1 = Math.max(y1, p.y + r);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      dirty = pool.length
        ? { x0: Math.floor(x0) - 2, y0: Math.floor(y0) - 2, x1: Math.ceil(x1) + 2, y1: Math.ceil(y1) + 2 }
        : { x0: 0, y0: 0, x1: 0, y1: 0 };

      // Sleep the moment the last ember fades.
      frame = pool.length ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      const x = event.clientX;
      const y = event.clientY;
      if (prevX < 0) {
        prevX = x;
        prevY = y;
        return;
      }
      const dx = x - prevX;
      const dy = y - prevY;
      const distance = Math.hypot(dx, dy);
      const count = Math.min(MAX_PER_MOVE, Math.floor(distance / SPACING));
      if (count === 0) {
        return;
      }
      for (let i = 1; i <= count; i += 1) {
        const k = i / count;
        spawn(
          prevX + dx * k + random(-3, 3),
          prevY + dy * k + random(-3, 3),
          dx * random(0.4, 1.2) + random(-24, 24),
          dy * random(0.4, 1.2) + random(-30, 12),
          random(6, 15),
          random(0.5, 1),
        );
      }
      prevX = x;
      prevY = y;
      wake();
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) {
        return;
      }
      for (let i = 0; i < 18; i += 1) {
        const angle = (Math.PI * 2 * i) / 18 + random(-0.2, 0.2);
        const speed = random(110, 260);
        spawn(
          event.clientX,
          event.clientY,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          random(4, 10),
          random(0.5, 0.9),
        );
      }
      wake();
    };

    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        prevX = -1;
        prevY = -1;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerout", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      stopTheme();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerout", onLeave);
      pool.length = 0;
      ctx.clearRect(0, 0, width, height);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return <canvas ref={canvasRef} className="cursor-particles" aria-hidden="true" />;
}
