export interface WorkflowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  hub?: boolean;
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
}

export const workflowLanes = [
  { id: "request", label: "01 REQUEST", y: 7 },
  { id: "event", label: "02 EVENT", y: 31 },
  { id: "store", label: "03 STORE", y: 55 },
  { id: "ship", label: "04 SHIP", y: 79 },
] as const;

export const workflowNodes: WorkflowNode[] = [
  { id: "java", label: "JAVA", x: 18, y: 16 },
  { id: "spring", label: "SPRING", x: 40, y: 16 },
  { id: "rest", label: "REST", x: 62, y: 16 },
  { id: "react", label: "REACT", x: 84, y: 16 },
  { id: "kafka", label: "KAFKA", x: 30, y: 40, hub: true },
  { id: "redis", label: "REDIS", x: 54, y: 40, hub: true },
  { id: "distributed", label: "DISTRIBUTED", x: 80, y: 40, hub: true },
  { id: "cassandra", label: "CASSANDRA", x: 22, y: 64, hub: true },
  { id: "mysql", label: "MYSQL", x: 48, y: 64 },
  { id: "scylla", label: "SCYLLA", x: 74, y: 64 },
  { id: "docker", label: "DOCKER", x: 30, y: 88, hub: true },
  { id: "k8s", label: "KUBERNETES", x: 54, y: 88 },
  { id: "gitlab", label: "GITLAB", x: 80, y: 88 },
];

export const workflowEdges: WorkflowEdge[] = [
  { id: "java-spring", from: "java", to: "spring" },
  { id: "spring-rest", from: "spring", to: "rest" },
  { id: "react-rest", from: "react", to: "rest" },
  { id: "rest-kafka", from: "rest", to: "kafka" },
  { id: "kafka-redis", from: "kafka", to: "redis" },
  { id: "kafka-dist", from: "kafka", to: "distributed" },
  { id: "kafka-cass", from: "kafka", to: "cassandra" },
  { id: "kafka-mysql", from: "kafka", to: "mysql" },
  { id: "redis-docker", from: "redis", to: "docker" },
  { id: "cass-docker", from: "cassandra", to: "docker" },
  { id: "mysql-docker", from: "mysql", to: "docker" },
  { id: "dist-docker", from: "distributed", to: "docker" },
  { id: "docker-k8s", from: "docker", to: "k8s" },
  { id: "k8s-gitlab", from: "k8s", to: "gitlab" },
];

export const workflowCopy: Record<string, string> = {
  java: "Request enters the JVM. Spring takes the contract from here.",
  spring: "Spring Boot owns the use-case, then publishes — it does not wait.",
  rest: "The contract surface. UI and services meet here, then the event spine.",
  react: "The interface. It talks REST, never the stores.",
  kafka: "The spine. One publish fans into cache, stores, and the runtime.",
  redis: "Hot path. What must be fast lives here, not what must be final.",
  distributed: "The shape of the system: many nodes, one workflow.",
  cassandra: "Write volume and flexible reads. Partitioned on purpose.",
  mysql: "Transactional truth. Constraints live here.",
  scylla: "Cassandra-compatible path when throughput has to climb.",
  docker: "The same box in every environment. Consumers ship together.",
  k8s: "Schedule and restart. Docker is the unit Kubernetes places.",
  gitlab: "The pipeline that builds the boxes and walks them forward.",
};
