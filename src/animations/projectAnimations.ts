import { gsap } from "../utils/gsap.ts";

export function pulseFlow(
  root: SVGSVGElement,
  edgeIds: string[],
  reducedMotion: boolean,
): gsap.core.Timeline {
  const timeline = gsap.timeline();
  if (reducedMotion) {
    return timeline;
  }

  edgeIds.forEach((id, index) => {
    const path = root.querySelector<SVGPathElement>(`[data-edge="${id}"]`);
    if (!path) {
      return;
    }
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
    timeline.to(
      path,
      {
        strokeDashoffset: 0,
        duration: 0.45,
        ease: "power2.out",
      },
      index * 0.08,
    );
  });

  return timeline;
}
