export interface NavigationItem {
  id: string;
  index: string;
  label: string;
  href: string;
}

export interface ProgressSection {
  id: string;
  index: string;
  label: string;
}

export interface ProfileLinks {
  linkedin: string;
  leetcode: string;
  email: string | null;
  github: string | null;
  website: string | null;
}

export interface LeetCodeDifficulty {
  label: string;
  count: number;
}

export interface LeetCodeLanguage {
  name: string;
  count: number;
}

export interface LeetCodeTag {
  name: string;
  count: number;
}

export interface LeetCodeProfile {
  username: string;
  url: string;
  realName: string;
  accepted: number;
  difficulties: LeetCodeDifficulty[];
  languages: LeetCodeLanguage[];
  tags: LeetCodeTag[];
  school: string | null;
  photo: string;
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  headline: string;
  location: string;
  locationCountry: string;
  positioning: string;
  stackLine: string;
  photo: string;
  photoAlt: string;
  statement: string;
  links: ProfileLinks;
  seo: SeoMeta;
}

export interface SeoMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  canonicalUrl: string | null;
}

export interface HeroMetaItem {
  label: string;
  value: string;
}

export interface Experience {
  id: string;
  year: string;
  period: string;
  company: string;
  role: string;
  location: string;
  built: string;
  solved: string;
  /**
   * Set when a date is known only approximately.
   * Update in src/data/experience.ts — do not invent dates.
   */
  dateNote?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
  kind: "github" | "live" | "case-study";
}

export interface ProjectFlowNode {
  id: string;
  label: string;
}

export interface Project {
  id: string;
  index: string;
  name: string;
  problem: string;
  tech: string[];
  impact: string[];
  flow: ProjectFlowNode[];
  image: string | null;
  links: ProjectLink[];
  /**
   * "study" = representative engineering problem, not a named client case.
   * Replace with shipped work in src/data/projects.ts when URLs exist.
   */
  kind: "study" | "shipped";
}

export type SkillCategory =
  | "BACKEND"
  | "FRONTEND"
  | "DATA"
  | "MESSAGING"
  | "DEVOPS"
  | "ARCHITECTURE";

export interface Technology {
  id: string;
  name: string;
  category: SkillCategory;
  x: number;
  y: number;
  related: string[];
  color: string;
}

export interface Principle {
  id: string;
  index: string;
  title: string;
  body: string;
}

export interface Metric {
  id: string;
  label: string;
  value: string;
}

export interface PlaygroundNode {
  id: string;
  label: string;
  x: number;
  y: number;
  description: string;
  color: string;
}

export interface PlaygroundEdge {
  id: string;
  from: string;
  to: string;
}

export interface CodeLine {
  type: "code" | "comment" | "blank";
  text: string;
  token?: "keyword" | "type" | "fn" | "string" | "plain";
}

export interface CodeSnippet {
  id: string;
  filename: string;
  language: string;
  lines: CodeLine[];
  explanation: string;
}

export type CursorMode =
  | "default"
  | "hover"
  | "view"
  | "open"
  | "image"
  | "drag"
  | "magnetic";
