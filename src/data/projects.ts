import type { Project } from "../types/index.ts";

/**
 * Representative engineering problems from the stack Akash works in.
 * These are system studies — not named client deliveries.
 * `challenges` describe what makes the design hard, not results achieved.
 * Add github / live / case-study URLs only when they exist, and set `image`
 * to a real screenshot path when one is available.
 */
export const projects: Project[] = [
  {
    id: "farm-kart",
    index: "01",
    name: "FARM KART",
    summary:
      "A farm-to-cart commerce system mapped end to end — catalog, cart, order, inventory, and payment as separate services.",
    problem:
      "A farm commerce path cannot treat catalog, stock, cart, and payment as one process. The order write must stay transactional while inventory and notifications fan out.",
    challenges: [
      "Keep the order write transactional while inventory and notifications fan out over Kafka instead of inside the request.",
      "Serve hot catalog and cart reads from Redis without letting the cache become the source of truth.",
      "Split relational order data (MySQL) from high-volume activity data (Cassandra / ScyllaDB) by access pattern.",
      "Make a failed payment or a slow consumer visible — Prometheus, Grafana, and Datadog on the same path the request takes.",
    ],
    tech: ["Java", "Spring Boot", "Kafka", "Redis", "MySQL", "Cassandra", "AWS", "Datadog"],
    impact: ["Decoupling", "Consistency", "Scale"],
    flow: [
      { id: "client", label: "CLIENT" },
      { id: "gateway", label: "GATEWAY" },
      { id: "service", label: "SERVICE" },
      { id: "kafka", label: "KAFKA" },
      { id: "store", label: "STORE" },
    ],
    accent: "#d4783a",
    cover: {
      glow: { x: 1080, y: 560 },
      nodes: [
        { id: "customer", label: "CUSTOMER", x: 190, y: 500 },
        { id: "gateway", label: "API GATEWAY", x: 470, y: 500 },
        { id: "product", label: "PRODUCT", x: 780, y: 260 },
        { id: "order", label: "ORDER SERVICE", x: 780, y: 560, hub: true },
        { id: "redis", label: "REDIS", x: 1080, y: 200 },
        { id: "kafka", label: "KAFKA", x: 1100, y: 560, hub: true },
        { id: "mysql", label: "MYSQL", x: 780, y: 830 },
        { id: "inventory", label: "INVENTORY", x: 1400, y: 400 },
        { id: "notify", label: "NOTIFY", x: 1400, y: 620 },
        { id: "cassandra", label: "CASSANDRA", x: 1360, y: 840 },
      ],
      edges: [
        ["customer", "gateway"],
        ["gateway", "product"],
        ["gateway", "order"],
        ["product", "redis"],
        ["order", "kafka"],
        ["order", "mysql"],
        ["kafka", "inventory"],
        ["kafka", "notify"],
        ["kafka", "cassandra"],
      ],
    },
    image: null,
    links: [
      { label: "GITHUB", href: "https://github.com/beingak007/Farm-Kart", kind: "github" },
      { label: "OPEN SYSTEM MAP", href: "#farmkart", kind: "case-study" },
    ],
    kind: "study",
  },
  {
    id: "event-spine",
    index: "02",
    name: "EVENT SPINE",
    summary:
      "A Kafka write path that lets services fan out without turning every change into a coordinated release.",
    problem:
      "Direct service-to-service calls harden the wrong dependencies. The write path needs a spine that can fan out without turning every change into a coordinated release.",
    challenges: [
      "Idempotent consumers, so a redelivered event cannot apply the same change twice.",
      "Per-key ordering through partition choice, without serialising the whole topic.",
      "Event payloads that can evolve, so producers and consumers deploy on their own schedules.",
      "Poison messages routed to a dead-letter path instead of blocking the partition behind them.",
    ],
    tech: ["Java", "Spring Boot", "Kafka", "Microservices"],
    impact: ["Scalability", "Reliability", "Decoupling"],
    flow: [
      { id: "client", label: "CLIENT" },
      { id: "api", label: "API" },
      { id: "service", label: "SERVICE" },
      { id: "kafka", label: "KAFKA" },
      { id: "db", label: "DATABASE" },
    ],
    accent: "#e2603f",
    cover: {
      glow: { x: 800, y: 520 },
      nodes: [
        { id: "client", label: "CLIENT", x: 190, y: 230 },
        { id: "api", label: "API", x: 470, y: 230 },
        { id: "service", label: "SERVICE", x: 780, y: 230 },
        { id: "db", label: "DATABASE", x: 1150, y: 230 },
        { id: "spine", label: "KAFKA · ORDER-EVENTS", x: 800, y: 520, w: 980, hub: true },
        { id: "consumer-a", label: "CONSUMER A", x: 470, y: 800 },
        { id: "consumer-b", label: "CONSUMER B", x: 860, y: 800 },
        { id: "dlq", label: "DEAD LETTER", x: 1240, y: 800, ghost: true },
      ],
      edges: [
        ["client", "api"],
        ["api", "service"],
        ["service", "db"],
        ["service", "spine"],
        ["spine", "consumer-a"],
        ["spine", "consumer-b"],
        ["spine", "dlq"],
      ],
    },
    image: null,
    links: [],
    kind: "study",
  },
  {
    id: "dual-store",
    index: "03",
    name: "DUAL-STORE PATH",
    summary:
      "Transactional truth in MySQL, partitioned volume in Cassandra — behind one service contract.",
    problem:
      "Transactional truth and high-volume reads do not want the same store. The system has to choose the engine per access pattern without leaking that choice into every caller.",
    challenges: [
      "Choose the store per access pattern: constraints and joins in MySQL, partitioned volume in Cassandra / ScyllaDB.",
      "Model wide-column tables query-first, so each read resolves inside a single partition.",
      "Keep the two stores consistent enough for the use case without a distributed transaction.",
      "Hide the storage split behind one service contract, so no caller ever picks an engine.",
    ],
    tech: ["Java", "MySQL", "Cassandra", "ScyllaDB"],
    impact: ["Performance", "Durability", "Read Path"],
    flow: [
      { id: "api", label: "API" },
      { id: "service", label: "SERVICE" },
      { id: "mysql", label: "MYSQL" },
      { id: "cass", label: "CASSANDRA" },
    ],
    accent: "#3fa3c4",
    cover: {
      glow: { x: 660, y: 500 },
      nodes: [
        { id: "api", label: "API", x: 230, y: 500 },
        { id: "service", label: "DATA SERVICE", x: 640, y: 500, hub: true },
        { id: "mysql", label: "MYSQL", x: 1060, y: 280 },
        { id: "cassandra", label: "CASSANDRA", x: 1060, y: 720 },
        { id: "joins", label: "JOINS · CONSTRAINTS", x: 1390, y: 280, ghost: true },
        { id: "partition", label: "PARTITION KEY", x: 1390, y: 720, ghost: true },
      ],
      edges: [
        ["api", "service"],
        ["service", "mysql"],
        ["service", "cassandra"],
        ["mysql", "joins"],
        ["cassandra", "partition"],
      ],
    },
    image: null,
    links: [],
    kind: "study",
  },
  {
    id: "contract-surface",
    index: "04",
    name: "CONTRACT SURFACE",
    summary:
      "React interfaces designed as carefully as the REST contracts they sit on.",
    problem:
      "A precise backend is wasted if the interface cannot express state, failure, or latency. The contract has to be as designed as the service behind it.",
    challenges: [
      "Model loading, empty, partial, and failed states in the API contract, not only the happy path.",
      "Typed React components that mirror the REST contract, so drift shows up at compile time.",
      "Be honest about latency: optimistic updates only where a rollback is safe.",
      "Version endpoints so the interface and the service can ship on different days.",
    ],
    tech: ["React", "TypeScript", "REST APIs", "Spring Boot"],
    impact: ["Clarity", "Maintainability", "Usability"],
    flow: [
      { id: "user", label: "USER" },
      { id: "ui", label: "UI" },
      { id: "rest", label: "REST" },
      { id: "service", label: "SERVICE" },
      { id: "data", label: "DATA" },
    ],
    accent: "#8f9bff",
    cover: {
      glow: { x: 800, y: 380 },
      nodes: [
        { id: "user", label: "USER", x: 800, y: 150 },
        { id: "ui", label: "REACT UI", x: 800, y: 350, w: 520, hub: true },
        { id: "rest", label: "REST CONTRACT", x: 800, y: 560 },
        { id: "service", label: "SERVICE", x: 800, y: 730 },
        { id: "data", label: "DATA", x: 800, y: 880 },
        { id: "loading", label: "LOADING", x: 300, y: 270, ghost: true },
        { id: "empty", label: "EMPTY", x: 300, y: 440, ghost: true },
        { id: "error", label: "ERROR", x: 1300, y: 270, ghost: true },
        { id: "partial", label: "PARTIAL", x: 1300, y: 440, ghost: true },
      ],
      edges: [
        ["user", "ui"],
        ["ui", "rest"],
        ["rest", "service"],
        ["service", "data"],
        ["loading", "ui"],
        ["empty", "ui"],
        ["error", "ui"],
        ["partial", "ui"],
      ],
    },
    image: null,
    links: [],
    kind: "study",
  },
];
