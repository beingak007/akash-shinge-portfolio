import type { ProfileStat } from "../types/index.ts";
import { experiences } from "./experience.ts";
import { leetcode } from "./leetcode.ts";
import { skillCategories, technologies } from "./technologies.ts";

/**
 * Every number here is derived from other data files — LeetCode's public
 * profile, the stack map, and the experience log. Nothing is typed in by hand,
 * so the stats cannot drift from the sources or be inflated.
 */
const javaCount = leetcode.languages.find((item) => item.name === "Java")?.count ?? 0;
const javaShare = leetcode.accepted > 0 ? Math.round((javaCount / leetcode.accepted) * 100) : 0;
const chronological = [...experiences].reverse();

export const profileStats: ProfileStat[] = [
  {
    id: "leetcode",
    value: leetcode.accepted,
    label: "PROBLEMS ACCEPTED",
    detail: `Public LeetCode profile · ${leetcode.username}`,
    segments: leetcode.difficulties.map((item) => ({ label: item.label, value: item.count })),
  },
  {
    id: "java",
    value: javaShare,
    suffix: "%",
    label: "SOLVED IN JAVA",
    detail: `${javaCount} of ${leetcode.accepted} accepted solutions`,
    segments: leetcode.languages.map((item) => ({
      label: item.name.toUpperCase(),
      value: item.count,
    })),
  },
  {
    id: "stack",
    value: technologies.length,
    label: "TECHNOLOGIES IN THE STACK",
    detail: `Across ${skillCategories.length} layers, service to cluster`,
    segments: skillCategories.map((category) => ({
      label: category,
      value: technologies.filter((tech) => tech.category === category).length,
    })),
  },
  {
    id: "roles",
    value: experiences.length,
    label: `ROLES AT ${experiences[0]?.company.toUpperCase() ?? "WORK"}`,
    detail: chronological.map((item) => item.role).join(" → "),
    segments: chronological.map((item) => ({ label: item.role.toUpperCase(), value: 1 })),
  },
];

/** Strengths named in the experience log — restated, not extended. */
export const strengths = [
  "Service design in Java and Spring Boot",
  "Event-driven flows on Kafka",
  "Relational and wide-column data paths",
  "React interfaces over REST contracts",
] as const;
