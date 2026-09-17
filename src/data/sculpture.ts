import { techColors } from "./techColors.ts";

export interface SculptureFace {
  id: string;
  label: string;
  copy: string;
  color: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  ry: number;
}

export const sculptureFaces: SculptureFace[] = [
  {
    id: "gateway",
    label: "GATEWAY",
    copy: "The door. Auth and rate limits stay here so services stay private.",
    color: "#e8a04a",
    x: -150,
    y: -88,
    z: 110,
    w: 168,
    h: 92,
    ry: -28,
  },
  {
    id: "spring",
    label: "SPRING",
    copy: "The use-case. It prices, validates, then publishes — it does not wait.",
    color: techColors.spring,
    x: 8,
    y: -36,
    z: 36,
    w: 188,
    h: 104,
    ry: 12,
  },
  {
    id: "kafka",
    label: "KAFKA",
    copy: "The spine. One event fans into cache, stores, and the runtime.",
    color: techColors.kafka,
    x: 128,
    y: 18,
    z: -20,
    w: 172,
    h: 96,
    ry: 32,
  },
  {
    id: "redis",
    label: "REDIS",
    copy: "Hot path. What must be fast lives here, not what must be final.",
    color: techColors.redis,
    x: -118,
    y: 28,
    z: 18,
    w: 156,
    h: 88,
    ry: -22,
  },
  {
    id: "mysql",
    label: "MYSQL",
    copy: "Transactional truth. Constraints live on this plane.",
    color: techColors.mysql,
    x: -40,
    y: 96,
    z: -70,
    w: 164,
    h: 86,
    ry: 8,
  },
  {
    id: "cassandra",
    label: "CASSANDRA",
    copy: "Write volume. Partitioned so the relational path stays lean.",
    color: techColors.cassandra,
    x: 110,
    y: 108,
    z: -110,
    w: 176,
    h: 90,
    ry: 24,
  },
  {
    id: "docker",
    label: "DOCKER",
    copy: "The same box in every environment. Consumers ship together.",
    color: techColors.docker,
    x: -20,
    y: -120,
    z: -40,
    w: 150,
    h: 80,
    ry: -14,
  },
];
