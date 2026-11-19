import type { SkillCategory } from "../types/index.ts";
import { colorFor } from "./techColors.ts";
import { coreSkillIds, technologies } from "./technologies.ts";

export type CoreSkillId = (typeof coreSkillIds)[number];

/**
 * Logo animation per card. Each name maps to a `[data-motion="..."]` block in
 * TechCards.css; the animation runs only while the card is hovered, focused,
 * or tapped active.
 */
export type TechCardMotion =
  | "steam"
  | "spring"
  | "split"
  | "ripple"
  | "spin"
  | "blink"
  | "dive"
  | "orbit"
  | "float"
  | "branch"
  | "shuttle"
  | "flip";

interface TechCardDetail {
  /** How Akash uses it: practice, not claimed results (no numbers, years, or outcomes). */
  use: string;
  motion: TechCardMotion;
}

const details: Record<CoreSkillId, TechCardDetail> = {
  java: {
    use: "Services, domain logic, and the code behind REST contracts.",
    motion: "steam",
  },
  "spring-boot": {
    use: "Services with explicit boundaries: validated input and predictable transactions.",
    motion: "spring",
  },
  microservices: {
    use: "Boundaries drawn around ownership of data, so a change ships as one deploy.",
    motion: "split",
  },
  kafka: {
    use: "Kafka-backed workflows: downstream work fans out without the caller waiting on it.",
    motion: "ripple",
  },
  react: {
    use: "Interfaces where loading, partial, and failed states are designed, not discovered.",
    motion: "spin",
  },
  javascript: {
    use: "The language under the React work: events, async flows, and the browser itself.",
    motion: "blink",
  },
  mysql: {
    use: "Relational data where constraints matter: access patterns first, then indexes.",
    motion: "dive",
  },
  cassandra: {
    use: "Wide-column storage, partitioned for volume the relational path should not carry.",
    motion: "orbit",
  },
  docker: {
    use: "Services that ship the same way they run: isolated and repeatable.",
    motion: "float",
  },
  git: {
    use: "Small, reviewable changes and a history that explains why the code moved.",
    motion: "branch",
  },
  rest: {
    use: "Contracts with stable shapes, honest status codes, and versioning clients can rely on.",
    motion: "shuttle",
  },
  "system-design": {
    use: "Architecture that can be drawn: boundaries, data flow, and failure paths first.",
    motion: "flip",
  },
};

export interface TechCard {
  id: CoreSkillId;
  name: string;
  category: SkillCategory;
  color: string;
  use: string;
  motion: TechCardMotion;
}

/** The core stack as cards, in `coreSkillIds` order. */
export const techCards: TechCard[] = coreSkillIds.flatMap((id) => {
  const tech = technologies.find((item) => item.id === id);
  if (!tech) {
    return [];
  }
  const { use, motion } = details[id];
  return [{ id, name: tech.name, category: tech.category, color: colorFor(id), use, motion }];
});
