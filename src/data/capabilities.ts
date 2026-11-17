import type { Capability } from "../types/index.ts";

/**
 * "What I do" — disciplines and how Akash approaches them.
 * Practice, not claimed results: no numbers, clients, or outcomes here.
 */
export const capabilities: Capability[] = [
  {
    id: "backend",
    index: "01",
    title: "Backend Engineering",
    body: "Java and Spring Boot services with explicit boundaries — validated input, predictable transactions, and failure paths designed before the happy path.",
    tags: ["Java", "Spring Boot", "REST"],
    glyph: "backend",
  },
  {
    id: "frontend",
    index: "02",
    title: "Frontend Development",
    body: "React interfaces that tell the truth about the system behind them. Loading, partial, and failed states are designed, not discovered in production.",
    tags: ["React", "TypeScript", "JavaScript"],
    glyph: "frontend",
  },
  {
    id: "distributed",
    index: "03",
    title: "Distributed Systems",
    body: "Services that keep working when a neighbour does not: timeouts, bounded retries, idempotent writes, and messaging that absorbs a slow consumer.",
    tags: ["Kafka", "Cassandra", "Redis"],
    glyph: "distributed",
  },
  {
    id: "microservices",
    index: "04",
    title: "Microservices Architecture",
    body: "Boundaries drawn around ownership of data, so a change ships as one deploy instead of a coordinated release across five teams.",
    tags: ["Spring Boot", "Docker", "Kubernetes"],
    glyph: "microservices",
  },
  {
    id: "api",
    index: "05",
    title: "API Design",
    body: "REST contracts with stable shapes, honest status codes, and versioning that lets the client and the service ship on different days.",
    tags: ["REST APIs", "Spring Boot", "React"],
    glyph: "api",
  },
  {
    id: "database",
    index: "06",
    title: "Database Optimization",
    body: "Access patterns before schemas, query plans before indexes — MySQL where constraints matter, Cassandra where partitioned volume does.",
    tags: ["MySQL", "Cassandra", "ScyllaDB"],
    glyph: "database",
  },
  {
    id: "performance",
    index: "07",
    title: "Performance Engineering",
    body: "Measure the path, then change the path. Profile first, cache what must be fast, and keep hot reads off the store that owns the write.",
    tags: ["Redis", "Java", "Profiling"],
    glyph: "performance",
  },
];
