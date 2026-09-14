import type { Technology } from "../types/index.ts";

export function relatedSet(tech: Technology, all: Technology[]): Set<string> {
  const ids = new Set<string>([tech.id, ...tech.related]);
  for (const other of all) {
    if (other.related.includes(tech.id)) {
      ids.add(other.id);
    }
  }
  return ids;
}

export function findTechnology(
  id: string,
  all: Technology[],
): Technology | undefined {
  return all.find((item) => item.id === id);
}
