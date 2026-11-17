import { gsap, SplitText } from "../utils/gsap.ts";

/**
 * Built paused: Hero plays it when the page loader starts lifting, so the
 * reveal happens in view rather than behind the loader.
 */
export function buildHeroIntro(root: HTMLElement, reducedMotion: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const grid = q("[data-hero-grid]");
  const labels = q("[data-hero-label]");
  const first = root.querySelector<HTMLElement>("[data-hero-first]");
  const last = q("[data-hero-last] > span");
  const heading = root.querySelector<HTMLElement>("[data-hero-heading]");
  const meta = q("[data-hero-meta]");
  const system = q("[data-hero-system]");
  const actions = q("[data-hero-actions] > *");
  const cue = q("[data-hero-scroll]");

  const timeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  if (reducedMotion) {
    return timeline;
  }

  gsap.set(grid, { opacity: 0 });
  gsap.set(labels, { opacity: 0, y: 12 });
  gsap.set(last, { yPercent: 108 });
  gsap.set(meta, { opacity: 0, y: 10 });
  gsap.set(system, { opacity: 0, y: 34, scale: 0.97 });
  gsap.set(actions, { opacity: 0, y: 18 });
  gsap.set(cue, { opacity: 0 });

  timeline.to(grid, { opacity: 1, duration: 1.4 }, 0);

  if (first) {
    // No per-char mask: the name's own overflow box clips the rise, and leaves
    // headroom for the hover lift.
    const split = SplitText.create(first, {
      type: "chars",
      charsClass: "hero-char",
    });
    gsap.set(split.chars, { yPercent: 108 });
    timeline.to(
      split.chars,
      { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: 0.055 },
      0.05,
    );
  }

  timeline.to(last, { yPercent: 0, duration: 1.35, ease: "expo.out" }, 0.28);

  if (heading) {
    const split = SplitText.create(heading, {
      type: "lines,words",
      mask: "lines",
      linesClass: "split-line",
    });
    gsap.set(split.words, { yPercent: 110 });
    timeline.to(
      split.words,
      { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.022 },
      0.55,
    );
  }

  timeline
    .to(labels, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.4)
    .to(system, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out" }, 0.6)
    .to(actions, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.95)
    .to(meta, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 1.05)
    .to(cue, { opacity: 1, duration: 0.6 }, 1.3);

  return timeline;
}

/** Scroll parallax as the hero leaves: layers move at different speeds. */
export function bindHeroScroll(root: HTMLElement, reducedMotion: boolean): void {
  if (reducedMotion) {
    return;
  }
  const scrub = {
    trigger: root,
    start: "top top",
    end: "bottom top",
    scrub: 0.6,
  };
  gsap.to(root.querySelector("[data-hero-name]"), { yPercent: -28, opacity: 0.25, ease: "none", scrollTrigger: scrub });
  gsap.to(root.querySelector("[data-hero-parallax]"), { y: -90, ease: "none", scrollTrigger: scrub });
  gsap.to(root.querySelector("[data-hero-ghost]"), { xPercent: -18, ease: "none", scrollTrigger: scrub });
  gsap.to(root.querySelector("[data-hero-scroll-fade]"), {
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: root, start: "top top", end: "12% top", scrub: true },
  });
}

export function bindHeroPointer(
  root: HTMLElement,
  reducedMotion: boolean,
): () => void {
  if (reducedMotion) {
    return () => undefined;
  }

  const stage = root.querySelector<HTMLElement>("[data-hero-stage]") ?? root;
  const grid = root.querySelector<HTMLElement>("[data-hero-grid]");
  const heading = root.querySelector<HTMLElement>("[data-hero-heading]");
  const system = root.querySelector<HTMLElement>("[data-hero-system]");
  const name = root.querySelector<HTMLElement>("[data-hero-name]");

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
      rotateY: x * 6,
      rotateX: y * -4,
      transformPerspective: 900,
      duration: 0.9,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(system, {
      x: x * -12,
      y: y * -8,
      rotateY: x * -10,
      rotateX: y * 6,
      transformPerspective: 920,
      duration: 0.85,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // Letters of the name lift as the cursor brushes them.
  const onLetter = (event: PointerEvent) => {
    const char = event.target instanceof Element ? event.target.closest(".hero-char") : null;
    if (!char) {
      return;
    }
    gsap.fromTo(
      char,
      { yPercent: 0 },
      { yPercent: -12, duration: 0.28, ease: "power2.out", yoyo: true, repeat: 1, overwrite: "auto" },
    );
  };

  stage.addEventListener("pointermove", onMove);
  name?.addEventListener("pointerover", onLetter);
  return () => {
    stage.removeEventListener("pointermove", onMove);
    name?.removeEventListener("pointerover", onLetter);
  };
}
