import type { Metric, Principle } from "../types/index.ts";

export const principles: Principle[] = [
  {
    id: "simple",
    index: "01",
    title: "KEEP IT SIMPLE",
    body: "Prefer the design a future engineer can hold in their head. Complexity is a cost you pay on every incident, not a sign the work is serious.",
  },
  {
    id: "change",
    index: "02",
    title: "DESIGN FOR CHANGE",
    body: "Services, contracts, and interfaces should absorb a new requirement without a rewrite. The stable thing is the boundary, not the interior.",
  },
  {
    id: "fail",
    index: "03",
    title: "FAIL FAST",
    body: "Broken assumptions belong at the edge — validation, timeouts, poison messages. A quiet failure is more expensive than a loud one.",
  },
  {
    id: "measure",
    index: "04",
    title: "MEASURE BEFORE OPTIMIZING",
    body: "Profile the path, then change the path. Guessing which query or consumer is slow is not engineering; it is decoration.",
  },
  {
    id: "own",
    index: "05",
    title: "OWN THE SYSTEM",
    body: "From the API contract to the query plan. If it shipped, it is yours when it misbehaves — not only when it is convenient.",
  },
  {
    id: "visible",
    index: "06",
    title: "MAKE COMPLEXITY VISIBLE",
    body: "Architecture that cannot be drawn cannot be operated. Names, logs, and diagrams should tell the truth about what the system actually does.",
  },
];

export const metrics: Metric[] = [
  { id: "systems", label: "SYSTEMS", value: "SCALABLE" },
  { id: "services", label: "SERVICES", value: "MODULAR" },
  { id: "apis", label: "APIS", value: "PRODUCTION READY" },
  { id: "code", label: "CODE", value: "MAINTAINABLE" },
];
