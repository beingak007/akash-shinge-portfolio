import type { Experience } from "../types/index.ts";

/**
 * Sourced from public LinkedIn profile only.
 * Add earlier roles and exact start dates here when confirmed.
 */
export const experiences: Experience[] = [
  {
    id: "yagnaiq-sse",
    year: "2026",
    period: "May 2026 — Present",
    company: "Yagna iQ",
    role: "Senior Software Engineer",
    location: "Pune, India",
    built: "Production Java and React surfaces that sit on REST contracts, relational and wide-column stores, and the messaging path between services.",
    solved:
      "Keeping enterprise flows coherent as they cross service boundaries — ownership of the path from request to data, not just the ticket that started it.",
    stack: ["Java", "React", "REST APIs", "MySQL", "Cassandra", "Kafka"],
  },
  {
    id: "yagnaiq-fsd",
    year: "Prior",
    period: "Prior tenure — May 2026",
    company: "Yagna iQ",
    role: "Full-stack Developer",
    location: "Pune, India",
    built: "End-to-end features across Spring Boot services, MySQL and Cassandra data paths, Kafka-backed workflows, and React interfaces.",
    solved:
      "The gap between a working local build and a system that stays understandable after it ships — contracts, failure modes, and the UI that has to tell the truth.",
    stack: ["Spring Boot", "MySQL", "Cassandra", "Kafka", "React"],
    dateNote: "Exact start date is not published.",
  },
];
