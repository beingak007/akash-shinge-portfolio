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
  headline: "JAVA / REACT / DISTRIBUTED SYSTEMS",
  location: "Pune, India",
  locationCountry: "India",
  positioning:
    "Senior Software Engineer building scalable systems, high-performance applications, and thoughtful user experiences.",
  stackLine: "JAVA · REACT · KAFKA",
  photo: "/profile.jpg",
  photoAlt: "/profile-leetcode.jpg",
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
    title: "Akash Shinge — Senior Software Engineer",
    description:
      "Senior Software Engineer specializing in Java, React, microservices, distributed systems and scalable applications.",
    ogTitle: "Akash Shinge — Senior Software Engineer",
    ogDescription:
      "Senior Software Engineer specializing in Java, React, microservices, distributed systems and scalable applications.",
    twitterTitle: "Akash Shinge — Senior Software Engineer",
    twitterDescription:
      "Senior Software Engineer specializing in Java, React, microservices, distributed systems and scalable applications.",
    canonicalUrl: "https://akash-shinge.vercel.app",
  },
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
