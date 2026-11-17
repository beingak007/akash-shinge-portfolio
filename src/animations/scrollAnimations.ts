import { gsap, ScrollTrigger, SplitText } from "../utils/gsap.ts";

export function revealSections(
  root: HTMLElement,
  reducedMotion: boolean,
): void {
  const blocks = root.querySelectorAll<HTMLElement>("[data-reveal]");

  blocks.forEach((block) => {
    if (reducedMotion) {
      gsap.set(block, { opacity: 1, y: 0, filter: "none" });
      return;
    }

    gsap.fromTo(
      block,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: block,
          start: "top 86%",
          once: true,
        },
      },
    );
  });
}

export function pinHorizontalWork(
  section: HTMLElement,
  reducedMotion: boolean,
  isDesktop: boolean,
  onProgress?: (progress: number) => void,
): gsap.core.Tween | null {
  const track = section.querySelector<HTMLElement>("[data-work-track]");
  if (!track) {
    return null;
  }
  if (reducedMotion || !isDesktop) {
    gsap.set(track, { clearProps: "transform" });
    return null;
  }

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  return gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        onProgress?.(self.progress);
      },
    },
  });
}

/**
 * Scroll-triggered typography: any `[data-split]` heading rises line by line
 * out of a mask the first time it enters. Re-splits on resize / font load
 * (autoSplit) without replaying once it has played.
 */
export function revealHeadings(root: ParentNode, reducedMotion: boolean): void {
  if (reducedMotion) {
    return;
  }
  root.querySelectorAll<HTMLElement>("[data-split]").forEach((heading) => {
    let played = false;
    SplitText.create(heading, {
      type: "lines,words",
      mask: "lines",
      linesClass: "split-line",
      wordsClass: "split-word",
      autoSplit: true,
      onSplit(self) {
        if (played) {
          return;
        }
        return gsap.from(self.words, {
          yPercent: 115,
          rotate: 3,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.04,
          scrollTrigger: {
            trigger: heading,
            start: "top 88%",
            once: true,
          },
          onComplete: () => {
            played = true;
            // Restore the original markup: one continuous gradient across
            // italic phrases, fewer nodes, and no further auto re-splitting.
            gsap.delayedCall(0.05, () => {
              self.revert();
            });
          },
        });
      },
    });
  });
}

/** Clip-path mask reveal for media blocks marked `[data-reveal-mask]`. */
export function revealMasks(root: ParentNode, reducedMotion: boolean): void {
  root.querySelectorAll<HTMLElement>("[data-reveal-mask]").forEach((block) => {
    if (reducedMotion) {
      gsap.set(block, { clipPath: "none" });
      return;
    }
    const media = block.querySelector<HTMLElement>("[data-fx-media]");
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: block, start: "top 85%", once: true },
    });
    timeline.fromTo(
      block,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "expo.inOut" },
    );
    if (media) {
      timeline.fromTo(media, { scale: 1.3 }, { scale: 1, duration: 1.5, ease: "expo.out" }, 0.1);
    }
  });
}

export function drawTimeline(
  section: HTMLElement,
  reducedMotion: boolean,
): void {
  const line = section.querySelector<HTMLElement>("[data-timeline-progress]");
  const head = section.querySelector<HTMLElement>("[data-timeline-head]");
  const items = section.querySelectorAll<HTMLElement>("[data-timeline-item]");

  if (!line) {
    return;
  }

  if (reducedMotion) {
    gsap.set(line, { scaleY: 1 });
    gsap.set(head, { top: "100%" });
    return;
  }

  const scrub = {
    trigger: section.querySelector(".timeline") ?? section,
    start: "top 70%",
    end: "bottom 60%",
    scrub: 0.4,
  };

  gsap.fromTo(
    line,
    { scaleY: 0 },
    { scaleY: 1, ease: "none", transformOrigin: "top center", scrollTrigger: scrub },
  );
  if (head) {
    gsap.fromTo(head, { top: "0%" }, { top: "100%", ease: "none", scrollTrigger: { ...scrub } });
  }

  items.forEach((item) => {
    gsap.fromTo(
      item,
      {
        opacity: 0,
        y: 28,
        filter: "blur(8px)",
        clipPath: "inset(12% 0 0 0)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        clipPath: "inset(0% 0 0 0)",
        duration: 0.85,
        ease: "power3.out",
        // A leftover filter would cut the card's backdrop blur off from the page.
        clearProps: "filter,clipPath",
        scrollTrigger: {
          trigger: item,
          start: "top 82%",
          once: true,
        },
      },
    );
  });
}

export function animateProjectFlows(
  section: HTMLElement,
  reducedMotion: boolean,
): void {
  const flows = section.querySelectorAll<HTMLElement>("[data-project-flow]");

  flows.forEach((flow) => {
    const nodes = flow.querySelectorAll<HTMLElement>("[data-flow-node]");
    const connectors = flow.querySelectorAll<HTMLElement>("[data-flow-line]");

    if (reducedMotion) {
      gsap.set([nodes, connectors], { opacity: 1, x: 0, scaleX: 1 });
      return;
    }

    gsap.fromTo(
      nodes,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: flow,
          start: "top 85%",
          once: true,
        },
      },
    );

    gsap.fromTo(
      connectors,
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: "left center",
        stagger: 0.12,
        duration: 0.45,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: flow,
          start: "top 85%",
          once: true,
        },
      },
    );
  });
}

export function watchActiveSections(
  ids: string[],
  onChange: (id: string) => void,
): ScrollTrigger[] {
  return ids.map((id) =>
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) {
          onChange(id);
        }
      },
    }),
  );
}
