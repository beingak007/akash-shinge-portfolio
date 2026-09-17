import type { FarmKartEdge, FarmKartNode, FarmKartView } from "../types/index.ts";

export const farmKartViewBox = { w: 1680, h: 880 };

export const farmKartLanes = [
  { id: "client", index: "01", label: "CLIENT", y: 80 },
  { id: "gateway", index: "02", label: "GATEWAY", y: 188 },
  { id: "services", index: "03", label: "SERVICES", y: 360 },
  { id: "events", index: "04", label: "EVENTS", y: 500 },
  { id: "data", index: "05", label: "DATA", y: 640 },
  { id: "infra", index: "06", label: "INFRA", y: 790 },
] as const;

export const farmKartViews: Array<{
  id: FarmKartView | "contact";
  index: string;
  label: string;
}> = [
  { id: "product", index: "01", label: "PRODUCT" },
  { id: "order", index: "02", label: "ORDER" },
  { id: "inventory", index: "03", label: "INVENTORY" },
  { id: "architecture", index: "04", label: "ARCHITECTURE" },
  { id: "infra", index: "05", label: "INFRA" },
  { id: "contact", index: "06", label: "CONTACT" },
];

export const farmKartFocus: Record<FarmKartView, string[] | null> = {
  architecture: null,
  product: [
    "customer",
    "admin",
    "rbac",
    "gateway",
    "auth",
    "product",
    "mysql",
    "redis",
  ],
  order: [
    "customer",
    "gateway",
    "auth",
    "rbac",
    "cart",
    "order",
    "payment",
    "kafka",
    "notification",
    "mysql",
    "scylla",
    "cassandra",
  ],
  inventory: [
    "gateway",
    "auth",
    "inventory",
    "mysql",
    "redis",
    "kafka",
    "cassandra",
  ],
  infra: [
    "gateway",
    "auth",
    "rbac",
    "product",
    "inventory",
    "cart",
    "order",
    "payment",
    "notification",
    "kafka",
    "docker",
    "k8s",
    "aws",
    "prometheus",
    "grafana",
    "datadog",
  ],
};

export const farmKartMarks = [
  { id: "event", label: "EVENT DRIVEN", x: 1540, y: 36 },
  { id: "micro", label: "MICROSERVICES", x: 1540, y: 58 },
  { id: "rest", label: "REST", x: 1540, y: 80 },
  { id: "async", label: "ASYNC", x: 1540, y: 102 },
  { id: "box", label: "CONTAINERIZED", x: 1540, y: 124 },
  { id: "rbac", label: "RBAC", x: 1540, y: 146 },
] as const;

export const farmKartStack = [
  "JAVA",
  "SPRING BOOT",
  "KAFKA",
  "REDIS",
  "MYSQL",
  "CASSANDRA",
  "SCYLLADB",
  "AWS",
  "DATADOG",
  "DOCKER",
  "KUBERNETES",
];

export const farmKartNodes: FarmKartNode[] = [
  {
    id: "customer",
    label: "CUSTOMER",
    lane: "client",
    x: 420,
    y: 80,
    color: "#5c5850",
    ink: "#ece7dc",
    responsibility:
      "The buyer surface. Browse, cart, and checkout — never talks to a store.",
    technology: "React + TypeScript",
    dependencies: ["API Gateway"],
    communication: "REST",
  },
  {
    id: "admin",
    label: "ADMIN",
    lane: "client",
    x: 1260,
    y: 80,
    color: "#6a655c",
    ink: "#ece7dc",
    responsibility:
      "Operator console. Catalog, stock, and fulfillment only after a role is proven.",
    technology: "React + TypeScript",
    dependencies: ["Admin Login", "API Gateway"],
    communication: "REST",
  },
  {
    id: "rbac",
    label: "ADMIN LOGIN",
    lane: "security",
    x: 1380,
    y: 188,
    color: "#8a5a2b",
    ink: "#ece7dc",
    responsibility:
      "Role-based admin login. Catalog, stock, and ops stay behind the role, not a shared password.",
    technology: "Spring Security + RBAC",
    dependencies: ["Auth Service", "API Gateway"],
    communication: "REST",
  },
  {
    id: "gateway",
    label: "API GATEWAY",
    lane: "gateway",
    x: 720,
    y: 188,
    color: "#d4783a",
    ink: "#111111",
    responsibility:
      "Single door. Auth, rate limits, and routing. Services stay private.",
    technology: "Spring Cloud Gateway",
    dependencies: ["Auth Service"],
    communication: "REST",
  },
  {
    id: "auth",
    label: "AUTH SERVICE",
    lane: "security",
    x: 1080,
    y: 188,
    color: "#b45e26",
    ink: "#ece7dc",
    responsibility:
      "Issues and validates identity. Tokens and roles at the edge, not in every service.",
    technology: "Spring Security + JWT",
    dependencies: ["MySQL", "Admin Login"],
    communication: "REST",
  },
  {
    id: "product",
    label: "PRODUCT SERVICE",
    lane: "service",
    x: 210,
    y: 360,
    color: "#4f6b3a",
    ink: "#ece7dc",
    responsibility: "Product catalog and product lifecycle management.",
    technology: "Java + Spring Boot",
    dependencies: ["MySQL", "Redis"],
    communication: "REST",
  },
  {
    id: "inventory",
    label: "INVENTORY SERVICE",
    lane: "service",
    x: 460,
    y: 360,
    color: "#3d6e62",
    ink: "#ece7dc",
    responsibility:
      "Stock truth. Reservations stay consistent; depletion can follow the event.",
    technology: "Java + Spring Boot",
    dependencies: ["MySQL", "Redis", "Kafka", "Cassandra"],
    communication: "REST + Kafka",
  },
  {
    id: "cart",
    label: "CART SERVICE",
    lane: "service",
    x: 720,
    y: 360,
    color: "#7a6048",
    ink: "#ece7dc",
    responsibility:
      "Session cart. Hot in Redis, checkpointed so a cart survives a node loss.",
    technology: "Java + Spring Boot",
    dependencies: ["Redis", "MySQL"],
    communication: "REST",
  },
  {
    id: "order",
    label: "ORDER SERVICE",
    lane: "service",
    x: 940,
    y: 360,
    color: "#a86b3c",
    ink: "#ece7dc",
    responsibility:
      "Order lifecycle. The durable write, then the event others react to.",
    technology: "Java + Spring Boot",
    dependencies: ["MySQL", "Kafka", "ScyllaDB"],
    communication: "REST + Kafka",
  },
  {
    id: "payment",
    label: "PAYMENT SERVICE",
    lane: "service",
    x: 1160,
    y: 360,
    color: "#8a5a3c",
    ink: "#ece7dc",
    responsibility: "Capture and settlement. Confirms, then emits — it does not fulfill.",
    technology: "Java + Spring Boot",
    dependencies: ["MySQL", "Kafka"],
    communication: "REST + Kafka",
  },
  {
    id: "notification",
    label: "NOTIFICATION SERVICE",
    lane: "service",
    x: 1390,
    y: 360,
    color: "#5a6b48",
    ink: "#ece7dc",
    responsibility:
      "Email, SMS, push from events. Never called synchronously from checkout.",
    technology: "Java + Spring Boot",
    dependencies: ["Kafka", "Cassandra"],
    communication: "Kafka",
  },
  {
    id: "kafka",
    label: "KAFKA",
    lane: "events",
    x: 840,
    y: 500,
    color: "#c45c4a",
    ink: "#ece7dc",
    responsibility:
      "The spine. Inventory, notifications, and projections fan out without blocking checkout.",
    technology: "Apache Kafka",
    dependencies: ["Order Service", "Payment Service", "Notification Service"],
    communication: "Async",
  },
  {
    id: "redis",
    label: "REDIS",
    lane: "cache",
    x: 430,
    y: 640,
    color: "#a33a32",
    ink: "#ece7dc",
    responsibility:
      "Hot path. Catalog, cart, and stock snapshots that must be fast, not final.",
    technology: "Redis",
    dependencies: ["Product Service", "Inventory Service", "Cart Service"],
    communication: "In-memory",
  },
  {
    id: "mysql",
    label: "MYSQL",
    lane: "data",
    x: 700,
    y: 640,
    color: "#1f6b7a",
    ink: "#ece7dc",
    responsibility:
      "Transactional truth. Products, carts, orders, payments — constraints live here.",
    technology: "MySQL",
    dependencies: ["Product Service", "Order Service", "Payment Service"],
    communication: "SQL",
  },
  {
    id: "scylla",
    label: "SCYLLADB",
    lane: "data",
    x: 1280,
    y: 640,
    color: "#2a7d94",
    ink: "#ece7dc",
    responsibility:
      "High-scale event and read models. History the relational path should not carry.",
    technology: "ScyllaDB",
    dependencies: ["Order Service", "Kafka"],
    communication: "CQL",
  },
  {
    id: "cassandra",
    label: "CASSANDRA",
    lane: "data",
    x: 990,
    y: 640,
    color: "#1287b1",
    ink: "#ece7dc",
    responsibility:
      "Wide-column store. Inventory activity and notification history the relational path should not carry.",
    technology: "Apache Cassandra",
    dependencies: ["Inventory Service", "Kafka", "Notification Service"],
    communication: "CQL",
  },
  {
    id: "docker",
    label: "DOCKER",
    lane: "infra",
    x: 180,
    y: 790,
    color: "#24648a",
    ink: "#ece7dc",
    responsibility: "The unit of ship. The same box from laptop to cluster.",
    technology: "Docker",
    dependencies: ["Kubernetes"],
    communication: "Runtime",
  },
  {
    id: "k8s",
    label: "KUBERNETES",
    lane: "infra",
    x: 420,
    y: 790,
    color: "#2f4f8a",
    ink: "#ece7dc",
    responsibility: "Placement, restart, scale. Docker is what it schedules.",
    technology: "Kubernetes",
    dependencies: ["Docker", "AWS", "Prometheus"],
    communication: "Runtime",
  },
  {
    id: "aws",
    label: "AWS",
    lane: "infra",
    x: 660,
    y: 790,
    color: "#c47a2c",
    ink: "#111111",
    responsibility:
      "The cloud the cluster sits on. Regions, load, and the boxes Kubernetes asks for.",
    technology: "AWS (EKS · RDS · MSK)",
    dependencies: ["Kubernetes", "Datadog"],
    communication: "Runtime",
  },
  {
    id: "prometheus",
    label: "PROMETHEUS",
    lane: "observe",
    x: 980,
    y: 790,
    color: "#2f6a3d",
    ink: "#ece7dc",
    responsibility: "Scrapes service and cluster metrics. The numbers, not the pictures.",
    technology: "Prometheus",
    dependencies: ["Kubernetes", "Grafana"],
    communication: "Scrape",
  },
  {
    id: "grafana",
    label: "GRAFANA",
    lane: "observe",
    x: 1220,
    y: 790,
    color: "#3a7a4a",
    ink: "#ece7dc",
    responsibility: "The board. Turns Prometheus into the view an on-call can read.",
    technology: "Grafana",
    dependencies: ["Prometheus"],
    communication: "Query",
  },
  {
    id: "datadog",
    label: "DATADOG",
    lane: "observe",
    x: 1480,
    y: 790,
    color: "#4a6b3d",
    ink: "#ece7dc",
    responsibility:
      "Traces, logs, and alerts from the cluster and the cloud. The on-call path beyond the board.",
    technology: "Datadog",
    dependencies: ["Kubernetes", "AWS"],
    communication: "APM",
  },
];

export const farmKartEdges: FarmKartEdge[] = [
  { id: "customer-gateway", from: "customer", to: "gateway", kind: "sync" },
  { id: "admin-gateway", from: "admin", to: "gateway", kind: "sync" },
  { id: "admin-rbac", from: "admin", to: "rbac", kind: "sync" },
  { id: "rbac-gateway", from: "rbac", to: "gateway", kind: "sync" },
  { id: "rbac-auth", from: "rbac", to: "auth", kind: "sync" },
  { id: "gateway-auth", from: "gateway", to: "auth", kind: "sync" },
  { id: "auth-mysql", from: "auth", to: "mysql", kind: "data" },
  { id: "gateway-product", from: "gateway", to: "product", kind: "sync" },
  { id: "gateway-inventory", from: "gateway", to: "inventory", kind: "sync" },
  { id: "gateway-cart", from: "gateway", to: "cart", kind: "sync" },
  { id: "gateway-order", from: "gateway", to: "order", kind: "sync" },
  { id: "gateway-payment", from: "gateway", to: "payment", kind: "sync" },
  { id: "product-mysql", from: "product", to: "mysql", kind: "data" },
  { id: "product-redis", from: "product", to: "redis", kind: "data" },
  { id: "inventory-mysql", from: "inventory", to: "mysql", kind: "data" },
  { id: "inventory-redis", from: "inventory", to: "redis", kind: "data" },
  { id: "cart-redis", from: "cart", to: "redis", kind: "data" },
  { id: "cart-mysql", from: "cart", to: "mysql", kind: "data" },
  { id: "order-mysql", from: "order", to: "mysql", kind: "data" },
  { id: "order-kafka", from: "order", to: "kafka", kind: "async" },
  { id: "order-scylla", from: "order", to: "scylla", kind: "data" },
  { id: "payment-mysql", from: "payment", to: "mysql", kind: "data" },
  { id: "payment-kafka", from: "payment", to: "kafka", kind: "async" },
  { id: "kafka-notification", from: "kafka", to: "notification", kind: "async" },
  { id: "kafka-inventory", from: "kafka", to: "inventory", kind: "async" },
  { id: "kafka-order", from: "kafka", to: "order", kind: "async" },
  { id: "notification-kafka", from: "notification", to: "kafka", kind: "async" },
  { id: "kafka-scylla", from: "kafka", to: "scylla", kind: "async" },
  { id: "inventory-cassandra", from: "inventory", to: "cassandra", kind: "data" },
  { id: "kafka-cassandra", from: "kafka", to: "cassandra", kind: "async" },
  { id: "notification-cassandra", from: "notification", to: "cassandra", kind: "data" },
  { id: "docker-k8s", from: "docker", to: "k8s", kind: "runtime" },
  { id: "k8s-aws", from: "k8s", to: "aws", kind: "runtime" },
  { id: "k8s-prometheus", from: "k8s", to: "prometheus", kind: "runtime" },
  { id: "prometheus-grafana", from: "prometheus", to: "grafana", kind: "runtime" },
  { id: "k8s-datadog", from: "k8s", to: "datadog", kind: "runtime" },
  { id: "aws-datadog", from: "aws", to: "datadog", kind: "runtime" },
];

export function farmKartNode(id: string): FarmKartNode | undefined {
  return farmKartNodes.find((node) => node.id === id);
}

export function farmKartNeighborhood(id: string): Set<string> {
  const ids = new Set<string>([id]);
  for (const edge of farmKartEdges) {
    if (edge.from === id || edge.to === id) {
      ids.add(edge.from);
      ids.add(edge.to);
    }
  }
  return ids;
}

export function elbowPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  bias: number,
  kind: FarmKartEdge["kind"],
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < 14) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  if (Math.abs(dy) < 14) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  let mid = from.y + dy * 0.5 + bias;
  if (kind === "data") {
    mid = 572 + (bias % 10);
  } else if (kind === "async") {
    mid = from.y < to.y ? 430 + (bias % 8) : 430 - (bias % 8);
  } else if (kind === "sync" && Math.max(from.y, to.y) >= 340) {
    mid = 268 + (bias % 10);
  }

  if (mid > 468 && mid < 538) {
    mid = dy > 0 ? 562 : 432;
  }

  return `M ${from.x} ${from.y} L ${from.x} ${mid} L ${to.x} ${mid} L ${to.x} ${to.y}`;
}

export function edgeBias(id: string): number {
  let hash = 0;
  for (const char of id) {
    hash += char.charCodeAt(0);
  }
  return ((hash % 9) - 4) * 7;
}
