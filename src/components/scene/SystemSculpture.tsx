import { useEffect, useRef, useState, type PointerEvent } from "react";
import { sculptureFaces } from "../../data/sculpture.ts";
import { contrastInk } from "../../data/techColors.ts";
import { useDesktopPointer } from "../../hooks/useDesktopPointer.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import "./SystemSculpture.css";

type Vec3 = [number, number, number];

const lattice: Vec3[] = [
  [-1.15, -0.7, -1.1],
  [1.15, -0.7, -1.1],
  [1.15, 0.85, -1.1],
  [-1.15, 0.85, -1.1],
  [-1.15, -0.7, 1.1],
  [1.15, -0.7, 1.1],
  [1.15, 0.85, 1.1],
  [-1.15, 0.85, 1.1],
  [0, -1.15, 0],
  [0, 1.2, 0],
  [0, 0, 0],
];

const beams: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
  [8, 0],
  [8, 1],
  [8, 4],
  [8, 5],
  [9, 2],
  [9, 3],
  [9, 6],
  [9, 7],
  [10, 0],
  [10, 2],
  [10, 5],
  [10, 7],
];

function rotate(point: Vec3, rx: number, ry: number): Vec3 {
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const x1 = point[0] * cosY + point[2] * sinY;
  const z1 = -point[0] * sinY + point[2] * cosY;
  const y2 = point[1] * cosX - z1 * sinX;
  const z2 = point[1] * sinX + z1 * cosX;
  return [x1, y2, z2];
}

function project(point: Vec3, width: number, height: number) {
  const depth = point[2] + 3.4;
  const scale = Math.min(width, height) * 0.28 / depth;
  return {
    x: width / 2 + point[0] * scale * 1.7,
    y: height / 2 + point[1] * scale * 1.7,
    z: depth,
  };
}

export function SystemSculpture() {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const [activeId, setActiveId] = useState<string | null>(null);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0, spin: 0 });
  const active = sculptureFaces.find((face) => face.id === activeId);

  useEffect(() => {
    const sheet = canvas.current;
    const space = world.current;
    if (!sheet || !space) {
      return;
    }

    const context = sheet.getContext("2d");
    if (!context) {
      return;
    }

    const fit = () => {
      const box = sheet.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      sheet.width = Math.max(1, Math.floor(box.width * ratio));
      sheet.height = Math.max(1, Math.floor(box.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(sheet);

    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      const state = tilt.current;
      state.x += (state.tx - state.x) * 0.08;
      state.y += (state.ty - state.y) * 0.08;
      if (!reduced) {
        state.spin += 0.32 * dt;
      }

      const rotX = (state.x * Math.PI) / 180;
      const rotY = ((state.y + state.spin) * Math.PI) / 180;
      space.style.transform = `rotateX(${state.x}deg) rotateY(${state.y + state.spin}deg)`;

      const box = sheet.getBoundingClientRect();
      context.clearRect(0, 0, box.width, box.height);

      const points = lattice.map((point) =>
        project(rotate(point, rotX, rotY), box.width, box.height),
      );

      context.lineWidth = 1;
      for (const [from, to] of beams) {
        const a = points[from];
        const b = points[to];
        if (!a || !b) {
          continue;
        }
        const depth = (a.z + b.z) / 2;
        context.strokeStyle =
          depth < 3.3 ? "rgba(212, 120, 58, 0.82)" : "rgba(236, 231, 220, 0.28)";
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }

      for (const point of points) {
        const size = point.z < 3.2 ? 4.5 : 2.6;
        context.fillStyle =
          point.z < 3.2 ? "#d4783a" : "rgba(236, 231, 220, 0.45)";
        context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduced]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = stage.current?.getBoundingClientRect();
    if (!box || !desktop) {
      return;
    }
    tilt.current.ty = (event.clientX - box.left) / box.width * 36 - 18;
    tilt.current.tx = -((event.clientY - box.top) / box.height * 22 - 11);
  };

  return (
    <div className="sculpture">
      <div className="sculpture__head">
        <p className="kicker">3D SYSTEM</p>
        <p className="kicker">CLICK A PLANE</p>
      </div>
      <p className="sculpture__live" aria-live="polite">
        {active ? (
          <>
            <strong>{active.label}</strong>
            {active.copy}
          </>
        ) : (
          "Turn the lattice. Click a plane — the device vibrates, the path stays attached."
        )}
      </p>
      <div
        ref={stage}
        className="sculpture__stage"
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          tilt.current.tx = 0;
          tilt.current.ty = 0;
        }}
      >
        <canvas ref={canvas} className="sculpture__lattice" aria-hidden="true" />
        <div ref={world} className="sculpture__world">
          {sculptureFaces.map((face) => {
            const on = !activeId || activeId === face.id;
            return (
              <button
                key={face.id}
                type="button"
                className={`sculpture__face${activeId === face.id ? " is-active" : ""}${
                  on ? "" : " is-dim"
                }`}
                style={{
                  width: face.w,
                  height: face.h,
                  background: face.color,
                  color: contrastInk(face.color),
                  ["--x" as string]: `${face.x}px`,
                  ["--y" as string]: `${face.y}px`,
                  ["--z" as string]: `${face.z}px`,
                  ["--ry" as string]: `${face.ry}deg`,
                  ["--w" as string]: `${face.w}px`,
                  ["--h" as string]: `${face.h}px`,
                }}
                data-cursor="view"
                data-vibrate
                onClick={() => {
                  setActiveId((current) => (current === face.id ? null : face.id));
                }}
              >
                <span>{face.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
