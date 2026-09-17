import type { Project } from "../types/index.ts";

/**
 * Representative engineering problems from the stack Akash works in.
 * These are system studies — not named client deliveries.
 * Add github / live / case-study URLs only when they exist.
 */
export const projects: Project[] = [
  {
    id: "farm-kart",
    index: "01",
    name: "FARM KART",
    problem:
      "A farm commerce path cannot treat catalog, stock, cart, and payment as one process. The order write must stay transactional while inventory and notifications fan out.",
    tech: ["Java", "Spring Boot", "Kafka", "Redis", "MySQL", "Cassandra", "AWS", "Datadog"],
    impact: ["Decoupling", "Consistency", "Scale"],
    flow: [
      { id: "client", label: "CLIENT" },
      { id: "gateway", label: "GATEWAY" },
      { id: "service", label: "SERVICE" },
      { id: "kafka", label: "KAFKA" },
      { id: "store", label: "STORE" },
    ],
    image: null,
    links: [{ label: "SYSTEM MAP", href: "#farmkart", kind: "case-study" }],
    kind: "study",
  },
  {
    id: "event-spine",
    index: "02",
    name: "EVENT SPINE",
    problem:
      "Direct service-to-service calls harden the wrong dependencies. The write path needs a spine that can fan out without turning every change into a coordinated release.",
    tech: ["Java", "Spring Boot", "Kafka", "Microservices"],
    impact: ["Scalability", "Reliability", "Decoupling"],
    flow: [
      { id: "client", label: "CLIENT" },
      { id: "api", label: "API" },
      { id: "service", label: "SERVICE" },
      { id: "kafka", label: "KAFKA" },
      { id: "db", label: "DATABASE" },
    ],
    image: null,
    links: [],
    kind: "study",
  },
  {
    id: "dual-store",
    index: "03",
    name: "DUAL-STORE PATH",
    problem:
      "Transactional truth and high-volume reads do not want the same store. The system has to choose the engine per access pattern without leaking that choice into every caller.",
    tech: ["Java", "MySQL", "Cassandra", "ScyllaDB"],
    impact: ["Performance", "Durability", "Read Path"],
    flow: [
      { id: "api", label: "API" },
      { id: "service", label: "SERVICE" },
      { id: "mysql", label: "MYSQL" },
      { id: "cass", label: "CASSANDRA" },
    ],
    image: null,
    links: [],
    kind: "study",
  },
  {
    id: "contract-surface",
    index: "04",
    name: "CONTRACT SURFACE",
    problem:
      "A precise backend is wasted if the interface cannot express state, failure, or latency. The contract has to be as designed as the service behind it.",
    tech: ["React", "TypeScript", "REST APIs", "Spring Boot"],
    impact: ["Clarity", "Maintainability", "Usability"],
    flow: [
      { id: "user", label: "USER" },
      { id: "ui", label: "UI" },
      { id: "rest", label: "REST" },
      { id: "service", label: "SERVICE" },
      { id: "data", label: "DATA" },
    ],
    image: null,
    links: [],
    kind: "study",
  },
];
