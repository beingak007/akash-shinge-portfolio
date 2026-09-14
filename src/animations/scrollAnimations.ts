import { gsap, ScrollTrigger } from "../utils/gsap.ts";

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
): void {
  const track = section.querySelector<HTMLElement>("[data-work-track]");
  if (!track || reducedMotion || !isDesktop) {
    gsap.set(track, { x: 0, clearProps: "transform" });
    return;
  }

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  gsap.to(track, {
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
    },
  });
}

export function drawTimeline(
  section: HTMLElement,
  reducedMotion: boolean,
): void {
  const line = section.querySelector<HTMLElement>("[data-timeline-progress]");
  const items = section.querySelectorAll<HTMLElement>("[data-timeline-item]");

  if (!line) {
    return;
  }

  if (reducedMotion) {
    gsap.set(line, { scaleY: 1 });
    gsap.set(items, { opacity: 1, y: 0, filter: "none", clipPath: "none" });
    return;
  }

  gsap.fromTo(
    line,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: "none",
      transformOrigin: "top center",
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        end: "bottom 55%",
        scrub: 0.4,
      },
    },
  );

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
