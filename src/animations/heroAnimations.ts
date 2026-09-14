import { gsap, SplitText } from "../utils/gsap.ts";

export function playHeroIntro(
  root: HTMLElement,
  reducedMotion: boolean,
): gsap.core.Timeline {
  const grid = root.querySelector<HTMLElement>("[data-hero-grid]");
  const labels = root.querySelectorAll<HTMLElement>("[data-hero-label]");
  const name = root.querySelector<HTMLElement>("[data-hero-name]");
  const heading = root.querySelector<HTMLElement>("[data-hero-heading]");
  const meta = root.querySelectorAll<HTMLElement>("[data-hero-meta]");
  const system = root.querySelector<HTMLElement>("[data-hero-system]");
  const actions = root.querySelector<HTMLElement>("[data-hero-actions]");

  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (reducedMotion) {
    gsap.set(
      [grid, labels, name, heading, meta, system, actions].filter(Boolean),
      { opacity: 1, y: 0, x: 0, scaleX: 1, filter: "none" },
    );
    return timeline;
  }

  gsap.set(grid, { opacity: 0 });
  gsap.set(labels, { opacity: 0, y: 12 });
  gsap.set(name, { opacity: 0, x: -28 });
  gsap.set(meta, { opacity: 0, y: 10 });
  gsap.set(system, { opacity: 0, y: 24 });
  gsap.set(actions, { opacity: 0, y: 16 });

  let split: SplitText | undefined;
  if (heading) {
    split = SplitText.create(heading, {
      type: "chars,words,lines",
      charsClass: "hero-char",
      linesClass: "hero-line-split",
      reduceWhiteSpace: false,
      aria: "none",
    });
    gsap.set(split.chars, { yPercent: 110, opacity: 0 });
  }

  timeline
    .to(grid, { opacity: 1, duration: 1.1 }, 0)
    .to(labels, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.2)
    .to(name, { opacity: 1, x: 0, duration: 0.7 }, 0.35);

  if (split) {
    timeline.to(
      split.chars,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.018,
        ease: "power4.out",
      },
      0.5,
    );
  }

  timeline
    .to(system, { opacity: 1, y: 0, duration: 0.8 }, 0.55)
    .to(meta, { opacity: 1, y: 0, duration: 0.45, stagger: 0.1 }, 0.95)
    .to(actions, { opacity: 1, y: 0, duration: 0.55 }, 1.15);

  return timeline;
}

export function bindHeroPointer(
  root: HTMLElement,
  reducedMotion: boolean,
): () => void {
  if (reducedMotion) {
    return () => undefined;
  }

  const stage = root.querySelector<HTMLElement>("[data-hero-stage]");
  const grid = root.querySelector<HTMLElement>("[data-hero-grid]");
  const heading = root.querySelector<HTMLElement>("[data-hero-heading]");
  const system = root.querySelector<HTMLElement>("[data-hero-system]");

  if (!stage) {
    return () => undefined;
  }

  const onMove = (event: PointerEvent) => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    gsap.to(grid, {
      x: x * 18,
      y: y * 14,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(heading, {
      x: x * 10,
      y: y * 6,
      duration: 0.9,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(system, {
      x: x * -12,
      y: y * -8,
      duration: 0.85,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  stage.addEventListener("pointermove", onMove);
  return () => {
    stage.removeEventListener("pointermove", onMove);
  };
}
