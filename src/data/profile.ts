import type { HeroMetaItem, Profile } from "../types/index.ts";

/**
 * Update these fields when new public information is available.
 * Never invent email, years of experience, or a production domain.
 */
export const profile: Profile = {
  name: "Akash Shinge",
  firstName: "Akash",
  lastName: "Shinge",
  role: "Senior Software Engineer",
  secondaryRole: "Full Stack Developer",
  headline: "JAVA / REACT / DISTRIBUTED SYSTEMS",
  location: "Pune, India",
  locationCountry: "India",
  positioning:
    "Senior Software Engineer building scalable systems, high-performance applications, and thoughtful user experiences.",
  stackLine: "JAVA · REACT · KAFKA",
  photo: "/profile.jpg",
  photoAlt: "/profile-field.jpg",
  statement:
    "I build scalable systems, distributed services, and experiences that solve real engineering problems.",
  links: {
    linkedin: "https://www.linkedin.com/in/akash-shinge-as10/",
    leetcode: "https://leetcode.com/u/beingak007/",
    email: null,
    github: "https://github.com/beingak007",
    website: "https://akash-shinge.vercel.app",
  },
  seo: {
    title: "Akash Shinge | Senior Software Engineer in Pune",
    description:
      "Akash Shinge is a Senior Software Engineer in Pune, India. Official portfolio — Java, Spring Boot, React, Kafka, Redis, Cassandra, and distributed systems.",
    ogTitle: "Akash Shinge | Senior Software Engineer",
    ogDescription:
      "Official site of Akash Shinge, Senior Software Engineer in Pune. Java, React, and distributed systems.",
    twitterTitle: "Akash Shinge | Senior Software Engineer",
    twitterDescription:
      "Official portfolio of Akash Shinge — Senior Software Engineer in Pune, India.",
    canonicalUrl: "https://akash-shinge.vercel.app",
  },
};

/** Intrinsic sizes of every portrait in /public, so layout is reserved before load. */
export const photoSizes: Record<string, { width: number; height: number }> = {
  "/profile.jpg": { width: 591, height: 942 },
  "/profile-field.jpg": { width: 1086, height: 1448 },
  "/profile-countryside.jpg": { width: 1086, height: 1448 },
};

export const heroMeta: HeroMetaItem[] = [
  { label: "SYSTEM STATUS", value: "ONLINE" },
  { label: "ENGINEERING", value: "SOFTWARE ENGINEERING" },
  { label: "STACK", value: "JAVA · REACT · KAFKA" },
  { label: "LOCATION", value: "INDIA" },
];

export const dnaChain = [
  "ARCHITECTURE",
  "BACKEND",
  "DATA",
  "MESSAGING",
  "FRONTEND",
  "USER",
] as const;
